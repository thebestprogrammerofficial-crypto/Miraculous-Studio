
import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Printer, Download, Share2, Edit2, Save, X, Image as ImageIcon, Sparkles, Mic, Square, Volume2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Episode } from '../types';
import { Button } from './Button';
import { updateEpisode } from '../services/storageService';
import { generateSceneImage, generateScriptAudio } from '../services/geminiService';

interface EpisodeViewerProps {
  showId: string;
  episode: Episode;
  onBack: () => void;
}

export const EpisodeViewer: React.FC<EpisodeViewerProps> = ({ showId, episode, onBack }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedScript, setEditedScript] = useState(episode.script);
  const [editedPostCredit, setEditedPostCredit] = useState(episode.postCreditScene);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  
  // Audio State
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    return () => {
        stopAudio();
    };
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const content = `${episode.title}\n\n${episode.script}\n\nPOST CREDIT SCENE:\n${episode.postCreditScene}`;
    const element = document.createElement("a");
    const file = new Blob([content], {type: 'text/markdown'});
    element.href = URL.createObjectURL(file);
    element.download = `${episode.title.replace(/\s+/g, '_')}_script.md`;
    document.body.appendChild(element);
    element.click();
  };

  const handleShare = async () => {
    const text = `Check out my Miraculous Episode: "${episode.title}"!\n\n${episode.premise}`;
    if (navigator.share) {
        try {
            await navigator.share({
                title: episode.title,
                text: text,
            });
        } catch (err) {
            console.log('Share failed', err);
        }
    } else {
        navigator.clipboard.writeText(episode.script);
        alert("Script copied to clipboard!");
    }
  };

  const handleSave = () => {
      const updated = {
          ...episode,
          script: editedScript,
          postCreditScene: editedPostCredit
      };
      updateEpisode(showId, updated);
      setIsEditing(false);
  };

  const handleGenerateImage = async () => {
      if (episode.imageUrl && !window.confirm("This will replace the current image. Continue?")) return;
      
      setIsGeneratingImage(true);
      setImageError(null);
      try {
          const imageBase64 = await generateSceneImage(episode.premise);
          const updated = {
              ...episode,
              imageUrl: imageBase64
          };
          updateEpisode(showId, updated);
      } catch (err) {
          console.error(err);
          setImageError("Failed to generate image. Try again.");
      } finally {
          setIsGeneratingImage(false);
      }
  };

  // --- Audio Logic ---

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const decodeAudioData = async (
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
  ): Promise<AudioBuffer> => {
    // Determine byte order (Little Endian for most systems)
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
             // Convert PCM 16-bit int to float [-1.0, 1.0]
             // IMPORTANT: Gemini API raw audio is PCM, no headers.
             // Usually it's Little Endian.
             channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
  };

  const stopAudio = () => {
      if (sourceNodeRef.current) {
          sourceNodeRef.current.stop();
          sourceNodeRef.current.disconnect();
          sourceNodeRef.current = null;
      }
      setIsPlaying(false);
  };

  const handleToggleAudio = async () => {
      if (isPlaying) {
          stopAudio();
          return;
      }

      setIsGeneratingAudio(true);
      try {
          // Initialize Audio Context on user gesture
          if (!audioContextRef.current) {
              audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
          }
          
          if (audioContextRef.current.state === 'suspended') {
              await audioContextRef.current.resume();
          }

          const base64Audio = await generateScriptAudio(episode.script);
          
          const audioBuffer = await decodeAudioData(
              decode(base64Audio),
              audioContextRef.current,
              24000,
              1 // Mono output usually
          );

          const source = audioContextRef.current.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(audioContextRef.current.destination);
          
          source.onended = () => setIsPlaying(false);
          
          sourceNodeRef.current = source;
          source.start();
          setIsPlaying(true);

      } catch (error) {
          console.error("Audio playback failed", error);
          alert("Could not generate audio voices. Please check your API limits.");
      } finally {
          setIsGeneratingAudio(false);
      }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-20">
      <div className="flex items-center justify-between mb-6 print:hidden">
        <button onClick={onBack} className="flex items-center text-gray-500 hover:text-gray-900 font-medium transition-colors">
            <ArrowLeft size={18} className="mr-2" /> Back to Season
        </button>
        <div className="flex gap-2">
            {!isEditing && (
                <>
                     <Button 
                        variant={isPlaying ? "danger" : "secondary"} 
                        onClick={handleToggleAudio} 
                        disabled={isGeneratingAudio}
                        isLoading={isGeneratingAudio}
                        title={isPlaying ? "Stop Voice Acting" : "Listen to Dialogue"}
                        className="min-w-[40px] px-3"
                    >
                        {isPlaying ? <Square size={18} fill="currentColor" /> : <Mic size={18} />}
                        {isPlaying ? "Stop" : ""}
                    </Button>

                    <Button variant="ghost" onClick={handleShare} title="Share">
                        <Share2 size={18} />
                    </Button>
                    <Button variant="ghost" onClick={handleDownload} title="Download">
                        <Download size={18} />
                    </Button>
                    <Button variant="ghost" onClick={handlePrint} title="Print">
                        <Printer size={18} />
                    </Button>
                    <Button variant="secondary" onClick={() => setIsEditing(true)}>
                        <Edit2 size={18} /> Edit Script
                    </Button>
                </>
            )}
            {isEditing && (
                <>
                    <Button variant="danger" onClick={() => setIsEditing(false)}>
                        <X size={18} /> Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSave}>
                        <Save size={18} /> Save Changes
                    </Button>
                </>
            )}
        </div>
      </div>

      <div className="bg-white shadow-2xl rounded-none md:rounded-lg overflow-hidden min-h-screen md:min-h-[80vh] print:shadow-none print:break-inside-avoid">
        {/* Cinematic Header Image or Generator */}
        <div className="relative w-full h-64 md:h-96 bg-gray-900 flex items-center justify-center overflow-hidden group">
            {episode.imageUrl ? (
                <>
                    <img src={episode.imageUrl} alt="Scene" className="w-full h-full object-cover opacity-80" />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent pointer-events-none"></div>
                    <button 
                        onClick={handleGenerateImage}
                        className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20"
                        title="Regenerate Image"
                    >
                        <Sparkles size={16} />
                    </button>
                </>
            ) : (
                <div className="text-center p-6 relative z-10">
                    <p className="text-gray-500 mb-4">No scene image generated yet.</p>
                    <Button onClick={handleGenerateImage} isLoading={isGeneratingImage} variant="secondary">
                        <Sparkles size={18} /> {isGeneratingImage ? 'NanoBanana Generating...' : 'Generate Scene Art'}
                    </Button>
                    {imageError && <p className="text-red-400 text-sm mt-2">{imageError}</p>}
                </div>
            )}
            
            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 pb-12 md:pb-16 text-center pointer-events-none print:bg-white print:text-black print:p-0 print:mb-8 z-0">
                <h1 className="text-4xl md:text-5xl font-extrabold mb-4 font-serif tracking-wide text-white drop-shadow-lg pointer-events-auto">{episode.title.toUpperCase()}</h1>
                <p className="text-gray-200 italic text-lg print:text-gray-600 drop-shadow-md pointer-events-auto">{episode.premise}</p>
            </div>
        </div>

        {/* Audio Player Indicator */}
        {isPlaying && (
            <div className="bg-[var(--accent-color)] text-white px-6 py-3 flex items-center justify-center gap-3 animate-pulse">
                <Volume2 size={20} />
                <span className="font-bold">Voice Agents Performing Dialogue...</span>
            </div>
        )}

        <div className="p-8 md:p-16">
            {isEditing ? (
                <div className="space-y-8">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Main Script</label>
                        <textarea 
                            value={editedScript}
                            onChange={(e) => setEditedScript(e.target.value)}
                            className="w-full h-[60vh] p-4 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-red-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Post-Credit Scene</label>
                        <textarea 
                            value={editedPostCredit}
                            onChange={(e) => setEditedPostCredit(e.target.value)}
                            className="w-full h-32 p-4 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-red-500 outline-none"
                        />
                    </div>
                </div>
            ) : (
                <>
                    <div className="prose prose-lg prose-slate max-w-none font-mono text-sm md:text-base leading-relaxed print:p-0">
                        <ReactMarkdown 
                            components={{
                                h1: ({node, ...props}) => <h1 className="text-center font-bold underline uppercase my-8 text-2xl" {...props} />,
                                h2: ({node, ...props}) => <h2 className="text-center font-bold uppercase my-6 text-xl" {...props} />,
                                h3: ({node, ...props}) => <h3 className="font-bold uppercase mt-6 mb-2 text-lg text-gray-800" {...props} />,
                                p: ({node, ...props}) => <p className="mb-4" {...props} />,
                                strong: ({node, ...props}) => <strong className="font-black text-gray-900" {...props} />,
                                em: ({node, ...props}) => <em className="text-gray-600 block mb-2" {...props} />
                            }}
                        >
                            {episode.script}
                        </ReactMarkdown>
                    </div>

                    {episode.postCreditScene && (
                        <div className="mt-16 pt-8 border-t-4 border-gray-900 print:break-before-page">
                            <h3 className="text-center font-black uppercase tracking-widest text-xl mb-8">Post-Credit Scene</h3>
                            <div className="prose prose-lg prose-slate max-w-none font-mono text-sm md:text-base leading-relaxed bg-gray-50 p-8 rounded-xl border border-gray-200">
                                <ReactMarkdown>
                                    {episode.postCreditScene}
                                </ReactMarkdown>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
      </div>
    </div>
  );
};

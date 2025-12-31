import React, { useState, useEffect } from 'react';
import { ArrowLeft, Sparkles, AlertCircle } from 'lucide-react';
import { Show, Episode } from '../types';
import { Button } from './Button';
import { generateEpisodeScript } from '../services/geminiService';

interface CreateEpisodeProps {
  show: Show;
  seasonNumber: number;
  nextOrder: number;
  onSave: (episode: Episode) => void;
  onCancel: () => void;
}

export const CreateEpisode: React.FC<CreateEpisodeProps> = ({ show, seasonNumber, nextOrder, onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [premise, setPremise] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prepare context from previous episodes
  const getContext = () => {
    // Get episodes from current season
    const currentSeasonEps = show.episodes
        .filter(e => e.seasonNumber === seasonNumber)
        .sort((a,b) => a.order - b.order);
    
    // If empty and it's not season 1, get last few of previous season
    if (currentSeasonEps.length === 0 && seasonNumber > 1) {
        const prevSeasonEps = show.episodes
            .filter(e => e.seasonNumber === seasonNumber - 1)
            .sort((a,b) => b.order - a.order)
            .slice(0, 3);
        
        if (prevSeasonEps.length > 0) {
            return `Previous Season Finale events: ${prevSeasonEps.map(e => `${e.title}: ${e.premise}`).join('; ')}`;
        }
    }

    if (currentSeasonEps.length > 0) {
        return `Previous episodes in this season: ${currentSeasonEps.map(e => `${e.title}: ${e.premise}`).join('; ')}`;
    }

    return "This is the first episode of the season.";
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setError(null);

    try {
      const context = getContext();
      const { script, postCredit } = await generateEpisodeScript(show.title, title, premise, context);
      
      const newEpisode: Episode = {
        id: crypto.randomUUID(),
        seasonNumber,
        order: nextOrder,
        title,
        premise,
        script,
        postCreditScene: postCredit,
        createdAt: Date.now()
      };
      
      onSave(newEpisode);
    } catch (err) {
      setError("Failed to generate the episode. The Miraculous energy is low (Network/API Error).");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in-up">
      <button onClick={onCancel} className="mb-6 flex items-center text-gray-500 hover:text-gray-900 font-medium">
        <ArrowLeft size={18} className="mr-2" /> Back to Season {seasonNumber}
      </button>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-red-500 to-pink-600 p-8 text-white">
            <h2 className="text-3xl font-bold mb-2">Generate Episode {nextOrder}</h2>
            <p className="opacity-90">Season {seasonNumber} • Use the power of creation to write your next script.</p>
        </div>

        <div className="p-8">
            {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            <form onSubmit={handleGenerate} className="space-y-8">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Episode Title</label>
                    <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-red-500 focus:ring-0 outline-none transition-all text-lg font-medium placeholder-gray-300"
                        placeholder="e.g., The Mime's Return"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Plot Premise</label>
                    <div className="relative">
                        <textarea
                            required
                            value={premise}
                            onChange={(e) => setPremise(e.target.value)}
                            rows={5}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-red-500 focus:ring-0 outline-none transition-all resize-none text-gray-700 placeholder-gray-300"
                            placeholder="Describe the villain, the conflict, or the akumatized object..."
                        />
                        <div className="absolute bottom-3 right-3 text-xs text-gray-400 pointer-events-none">
                            AI will flesh this out with memories of previous episodes.
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm text-gray-600 flex items-start gap-3">
                    <Sparkles className="text-yellow-500 flex-shrink-0" size={20} />
                    <div>
                        <p className="font-semibold mb-1">Miraculous AI Active</p>
                        <p>The AI will remember previous episodes in this season to maintain continuity. It will also generate a post-credit scene automatically!</p>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                    <Button type="button" variant="ghost" onClick={onCancel} disabled={isGenerating}>Cancel</Button>
                    <Button type="submit" isLoading={isGenerating} className="px-8">
                        <Sparkles size={18} />
                        Generate Script
                    </Button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};

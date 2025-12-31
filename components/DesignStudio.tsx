
import React, { useState, useRef } from 'react';
import { Sparkles, Type, Image as ImageIcon, Trash2, Move, RotateCcw, X, Download } from 'lucide-react';
import { Button } from './Button';
import { generateSceneImage } from '../services/geminiService';

interface DesignElement {
  id: string;
  type: 'image' | 'text';
  content: string; // URL or text content
  x: number;
  y: number;
  color?: string; // For text/placeholders
  label?: string; // For image alt/label
}

export const DesignStudio: React.FC = () => {
  const [elements, setElements] = useState<DesignElement[]>([]);
  const [background, setBackground] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [draggedItem, setDraggedItem] = useState<{type: 'image' | 'text', content: string, color?: string, label?: string} | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Asset Library
  const assets = [
      { id: 'lb', label: 'Ladybug', color: 'bg-red-500', icon: '🐞' },
      { id: 'cn', label: 'Cat Noir', color: 'bg-green-500', icon: '🐾' },
      { id: 'tk', label: 'Tikki', color: 'bg-pink-500', icon: '🍪' },
      { id: 'pg', label: 'Plagg', color: 'bg-black', icon: '🧀' },
      { id: 'hm', label: 'Akuma', color: 'bg-purple-600', icon: '🦋' },
      { id: 'vp', label: 'Viperion', color: 'bg-teal-500', icon: '🐍' },
  ];

  const handleDragStart = (type: 'image' | 'text', content: string, color?: string, label?: string) => {
      setDraggedItem({ type, content, color, label });
  };

  const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      if (!draggedItem || !canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - 40; // Center offset
      const y = e.clientY - rect.top - 40;

      const newElement: DesignElement = {
          id: crypto.randomUUID(),
          type: draggedItem.type,
          content: draggedItem.content,
          x,
          y,
          color: draggedItem.color,
          label: draggedItem.label
      };

      setElements([...elements, newElement]);
      setDraggedItem(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
  };

  const removeElement = (id: string) => {
      setElements(elements.filter(el => el.id !== id));
  };

  const generateBackground = async () => {
      const userPrompt = prompt("Describe the background (e.g., 'Eiffel Tower at sunset', 'Agreste Mansion interior'):");
      if (!userPrompt) return;

      setIsGenerating(true);
      try {
          const bgImage = await generateSceneImage(userPrompt);
          setBackground(bgImage);
      } catch (error) {
          alert("Failed to generate background. Try again.");
      } finally {
          setIsGenerating(false);
      }
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-140px)] gap-6 animate-fade-in">
        {/* Left Sidebar: Assets (25%) */}
        <div className="w-full md:w-1/4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <ImageIcon size={18} className="text-[var(--accent-color)]" />
                    Assets
                </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Characters</h4>
                    <div className="grid grid-cols-2 gap-3">
                        {assets.map(asset => (
                            <div 
                                key={asset.id}
                                draggable
                                onDragStart={() => handleDragStart('image', asset.icon, asset.color, asset.label)}
                                className={`${asset.color} aspect-square rounded-xl flex flex-col items-center justify-center text-white cursor-grab active:cursor-grabbing hover:scale-105 transition-transform shadow-md`}
                            >
                                <span className="text-3xl mb-1">{asset.icon}</span>
                                <span className="text-[10px] font-bold">{asset.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Text & Shapes</h4>
                    <div 
                        draggable
                        onDragStart={() => handleDragStart('text', 'New Text', 'bg-gray-200')}
                        className="bg-gray-100 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-500 rounded-xl p-4 flex items-center justify-center gap-2 cursor-grab hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        <Type size={20} className="text-gray-500 dark:text-gray-300" />
                        <span className="text-sm font-bold text-gray-600 dark:text-gray-300">Drag Text</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Right Panel: Canvas (75%) */}
        <div className="w-full md:w-3/4 flex flex-col gap-4">
            {/* Toolbar */}
            <div className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm flex items-center justify-between border border-gray-100 dark:border-gray-700">
                <div className="flex gap-2">
                    <Button variant="ghost" onClick={() => setElements([])} title="Clear Canvas">
                        <Trash2 size={18} />
                    </Button>
                    <Button variant="ghost" onClick={() => setBackground(null)} title="Reset Background">
                        <RotateCcw size={18} />
                    </Button>
                </div>
                <div className="flex gap-2">
                    <Button 
                        onClick={generateBackground} 
                        isLoading={isGenerating}
                        className="bg-[var(--accent-color)] border-none hover:bg-[var(--accent-color)] hover:brightness-110 text-white"
                    >
                        <Sparkles size={18} /> AI Background
                    </Button>
                </div>
            </div>

            {/* Canvas Area */}
            <div 
                ref={canvasRef}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="flex-1 bg-white dark:bg-gray-900 rounded-2xl shadow-inner border-2 border-gray-200 dark:border-gray-700 relative overflow-hidden group select-none"
                style={{
                    backgroundImage: background ? `url(${background})` : 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)',
                    backgroundSize: background ? 'cover' : '20px 20px',
                    backgroundPosition: 'center'
                }}
            >
                {!background && <div className="absolute inset-0 flex items-center justify-center text-gray-300 dark:text-gray-600 pointer-events-none font-bold text-xl uppercase tracking-widest opacity-50">
                    Design Canvas
                </div>}

                {elements.map((el) => (
                    <div
                        key={el.id}
                        style={{
                            position: 'absolute',
                            left: el.x,
                            top: el.y,
                            cursor: 'move',
                        }}
                        className="group/item relative"
                    >
                        {/* Delete Handle */}
                        <button 
                            onClick={() => removeElement(el.id)}
                            className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover/item:opacity-100 transition-opacity shadow-md z-20"
                        >
                            <X size={12} />
                        </button>

                        {/* Content */}
                        {el.type === 'image' ? (
                            <div className={`${el.color} w-20 h-20 rounded-2xl shadow-xl flex items-center justify-center text-4xl transform transition-transform hover:scale-105 border-4 border-white dark:border-gray-800`}>
                                {el.content}
                            </div>
                        ) : (
                            <div 
                                contentEditable 
                                suppressContentEditableWarning
                                className="bg-white/80 dark:bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg font-bold text-gray-900 dark:text-white border-2 border-transparent focus:border-[var(--accent-color)] outline-none min-w-[100px] text-center shadow-lg"
                            >
                                {el.content}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};

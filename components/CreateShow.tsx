import React, { useState } from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Show } from '../types';
import { Button } from './Button';
import { generateShowIdeas } from '../services/geminiService';

interface CreateShowProps {
  onSave: (show: Show) => void;
  onCancel: () => void;
}

export const CreateShow: React.FC<CreateShowProps> = ({ onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [season, setSeason] = useState(1);
  const [theme, setTheme] = useState<'ladybug' | 'catnoir'>('ladybug');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newShow: Show = {
      id: crypto.randomUUID(),
      title,
      description,
      maxSeason: season,
      theme,
      episodes: [],
      isFavorite: false,
      createdAt: Date.now(),
    };
    onSave(newShow);
  };

  const handleAutoFill = async () => {
      setIsGenerating(true);
      try {
        const titles = await generateShowIdeas();
        if (titles.length > 0) {
            setTitle(titles[0]);
            setDescription("A brand new season featuring new villains, new powers, and the same old secrets.");
        }
      } catch (e) {
          console.error(e);
      } finally {
          setIsGenerating(false);
      }
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in-up">
      <button onClick={onCancel} className="mb-6 flex items-center text-gray-500 hover:text-gray-900 font-medium">
        <ArrowLeft size={18} className="mr-2" /> Back to Dashboard
      </button>

      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Create New Show</h2>
            <Button variant="ghost" onClick={handleAutoFill} disabled={isGenerating}>
                <Sparkles size={16} className={isGenerating ? 'text-yellow-500 animate-spin' : 'text-yellow-500'} />
                {isGenerating ? 'Thinking...' : 'AI Idea'}
            </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Show Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
              placeholder="e.g., Miraculous: The Lost Kwamis"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
              placeholder="What is this season about?"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Season Number</label>
              <input
                type="number"
                min={1}
                required
                value={season}
                onChange={(e) => setSeason(parseInt(e.target.value))}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Theme Style</label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as 'ladybug' | 'catnoir')}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
              >
                <option value="ladybug">Ladybug (Red/Black)</option>
                <option value="catnoir">Cat Noir (Black/Green)</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
            <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
            <Button type="submit">Create Show</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Play, Plus, Zap, Star } from 'lucide-react';
import { Show } from '../types';
import { Button } from './Button';
import { getSettings } from '../services/storageService';

interface HomeProps {
  shows: Show[];
  onCreateShow: () => void;
  onNavigateToShow: (id: string) => void;
}

export const Home: React.FC<HomeProps> = ({ shows, onCreateShow, onNavigateToShow }) => {
  const [userName, setUserName] = useState('Guardian');
  const recentShows = [...shows].sort((a, b) => b.createdAt - a.createdAt).slice(0, 2);
  const totalEpisodes = shows.reduce((acc, show) => acc + show.episodes.length, 0);

  useEffect(() => {
    const settings = getSettings();
    if (settings.userName) {
        setUserName(settings.userName);
    }
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[var(--accent-color)] to-black rounded-3xl p-8 md:p-12 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-black opacity-10 rounded-full transform translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white opacity-10 rounded-full transform -translate-x-1/2 translate-y-1/2" />
        
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 font-fredoka">Welcome, {userName}.</h1>
          <p className="text-lg md:text-xl text-white/90 max-w-xl mb-8 leading-relaxed">
            The Miracle Box is in your hands. Create new heroes, write new destinies, and document the battles of Paris.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button variant="secondary" onClick={onCreateShow} className="shadow-lg hover:scale-105 transform transition-transform border-none bg-white text-[var(--accent-color)] hover:bg-gray-100">
              <Plus size={20} /> Create New Show
            </Button>
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
                <Zap size={18} className="text-yellow-300" />
                <span className="font-bold">{totalEpisodes} Episodes Written</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Shows */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <Play size={20} className="text-[var(--accent-color)]" />
                Continue Writing
            </h3>
            {recentShows.length > 0 ? (
                <div className="space-y-3">
                    {recentShows.map(show => (
                        <div 
                            key={show.id}
                            onClick={() => onNavigateToShow(show.id)}
                            className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl cursor-pointer transition-colors group border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold ${show.theme === 'ladybug' ? 'bg-red-500' : 'bg-gray-800'}`}>
                                    {show.title.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-[var(--accent-color)] transition-colors">{show.title}</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{show.episodes.length} Episodes • Season {show.maxSeason}</p>
                                </div>
                            </div>
                            <Star size={16} className="text-gray-300 dark:text-gray-600 group-hover:text-yellow-400 transition-colors" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 text-gray-400">
                    <p>No active shows.</p>
                </div>
            )}
        </div>

        {/* Studio Status */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-center">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <Zap size={20} className="text-yellow-500" />
                Studio Status
            </h3>
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl text-center">
                    <p className="text-3xl font-black text-gray-900 dark:text-white">{shows.length}</p>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Active Series</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl text-center">
                    <p className="text-3xl font-black text-gray-900 dark:text-white">{totalEpisodes}</p>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Scripts</p>
                </div>
            </div>
            <div className="mt-4 bg-[var(--accent-bg)] text-[var(--accent-color)] p-3 rounded-lg text-sm flex items-center justify-center gap-2 font-medium">
                AI Memory Active & Ready
            </div>
        </div>
      </div>
    </div>
  );
};

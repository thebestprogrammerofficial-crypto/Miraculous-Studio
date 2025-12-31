import React, { useState } from 'react';
import { Plus, Tv, Trash2, Play, Search, Heart } from 'lucide-react';
import { Show } from '../types';
import { Button } from './Button';
import { toggleFavorite } from '../services/storageService';

interface DashboardProps {
  shows: Show[];
  onCreateNew: () => void;
  onSelectShow: (id: string) => void;
  onDeleteShow: (id: string) => void;
  isFavoritesView?: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ shows, onCreateNew, onSelectShow, onDeleteShow, isFavoritesView }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [localShows, setLocalShows] = useState(shows); // To force re-render on favorite toggle

  // Update local state when props change
  React.useEffect(() => {
    setLocalShows(shows);
  }, [shows]);

  const filteredShows = localShows.filter(show => 
    (show.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    show.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (!isFavoritesView || show.isFavorite)
  );

  const handleToggleFavorite = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      toggleFavorite(id);
      // Optimistic update
      setLocalShows(prev => prev.map(s => s.id === id ? { ...s, isFavorite: !s.isFavorite } : s));
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">{isFavoritesView ? 'Favorite Shows' : 'Your Shows'}</h2>
          <p className="text-gray-500">Manage your seasons and miraculous adventures.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Search shows..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all"
                />
            </div>
            {!isFavoritesView && (
                <Button onClick={onCreateNew}>
                <Plus size={20} />
                Create
                </Button>
            )}
        </div>
      </div>

      {localShows.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-gray-200 shadow-sm flex flex-col items-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6 text-red-500">
            <Tv size={40} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Shows Found</h3>
          <p className="text-gray-500 mb-6 max-w-md">
            {isFavoritesView ? "You haven't marked any shows as favorites yet." : "Start your journey as the new Guardian. Create your first show!"}
          </p>
          {!isFavoritesView && <Button onClick={onCreateNew}>Start Creating</Button>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredShows.length === 0 && <p className="text-gray-500 col-span-3 text-center py-8">No shows match your filters.</p>}
          {filteredShows.map((show) => (
            <div 
              key={show.id} 
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group flex flex-col cursor-pointer relative"
              onClick={() => onSelectShow(show.id)}
            >
               {/* Favorite Button Overlay */}
               <button 
                onClick={(e) => handleToggleFavorite(e, show.id)}
                className={`absolute top-3 right-3 z-20 p-2 rounded-full backdrop-blur-md transition-all ${show.isFavorite ? 'bg-white/90 text-red-500 shadow-sm' : 'bg-black/20 text-white hover:bg-white hover:text-red-500'}`}
               >
                   <Heart size={18} fill={show.isFavorite ? "currentColor" : "none"} />
               </button>

              <div className={`h-32 ${show.theme === 'ladybug' ? 'ladybug-pattern' : 'cat-pattern'} relative`}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                  <span className="text-white font-bold text-lg drop-shadow-md">{show.title}</span>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">{show.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                   <span className="bg-gray-100 px-2 py-1 rounded-md text-gray-600 font-medium">Season {show.maxSeason}</span>
                   <span>{show.episodes.length} Episodes</span>
                </div>
                <div className="flex gap-2 mt-auto">
                  <Button 
                    variant="secondary" 
                    className="flex-1 text-sm" 
                    onClick={(e) => { e.stopPropagation(); onSelectShow(show.id); }}
                  >
                    <Play size={16} /> Open
                  </Button>
                  <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        if(window.confirm('Are you sure you want to delete this show?')) onDeleteShow(show.id);
                    }}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

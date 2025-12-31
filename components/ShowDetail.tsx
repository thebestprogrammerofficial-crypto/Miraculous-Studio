import React, { useState } from 'react';
import { ArrowLeft, Plus, Film, BookOpen, Clock, Lock, Search } from 'lucide-react';
import { Show, Episode } from '../types';
import { Button } from './Button';
import { createNewSeason } from '../services/storageService';

interface ShowDetailProps {
  show: Show;
  onBack: () => void;
  onAddEpisode: (season: number, order: number) => void;
  onViewEpisode: (episodeId: string) => void;
  onRefresh: () => void;
}

export const ShowDetail: React.FC<ShowDetailProps> = ({ show, onBack, onAddEpisode, onViewEpisode, onRefresh }) => {
  const [activeSeason, setActiveSeason] = useState(show.maxSeason); // Default to latest season
  const [searchTerm, setSearchTerm] = useState("");

  const seasonTabs = Array.from({ length: show.maxSeason + 1 }, (_, i) => i + 1);
  
  const episodesInSeason = show.episodes
    .filter(ep => ep.seasonNumber === activeSeason)
    .sort((a, b) => a.order - b.order);

  const filteredEpisodes = episodesInSeason.filter(ep => 
    ep.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ep.premise.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTabClick = (seasonNum: number) => {
    if (seasonNum <= show.maxSeason) {
        setActiveSeason(seasonNum);
    } else {
        if (window.confirm(`Are you sure you want to create Season ${seasonNum}?`)) {
            createNewSeason(show.id);
            onRefresh();
            setActiveSeason(seasonNum);
        }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in w-full">
      <div className="flex items-center justify-between">
          <button onClick={onBack} className="flex items-center text-gray-500 hover:text-gray-900 font-medium transition-colors">
            <ArrowLeft size={18} className="mr-2" /> Back to Dashboard
          </button>
          
      </div>

      {/* Hero Section */}
      <div className={`rounded-3xl p-8 text-white shadow-xl relative overflow-hidden ${show.theme === 'ladybug' ? 'bg-gradient-to-br from-red-500 to-red-700' : 'bg-gradient-to-br from-gray-800 to-black'}`}>
        <div className={`absolute top-0 right-0 w-64 h-64 opacity-10 transform translate-x-1/3 -translate-y-1/3 rounded-full ${show.theme === 'ladybug' ? 'bg-black' : 'bg-green-500'}`} />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
                <h1 className="text-4xl font-extrabold mb-2">{show.title}</h1>
                <p className="text-white/90 leading-relaxed text-lg max-w-xl">
                    {show.description}
                </p>
                <div className="flex items-center gap-4 mt-4 text-white/80 text-sm font-semibold">
                    <span className="bg-white/20 px-3 py-1 rounded-full">{show.episodes.length} Total Episodes</span>
                    <span className="bg-white/20 px-3 py-1 rounded-full">{show.maxSeason} Seasons</span>
                </div>
            </div>
            <Button 
                onClick={() => onAddEpisode(activeSeason, episodesInSeason.length + 1)} 
                variant={show.theme === 'ladybug' ? 'secondary' : 'primary'}
                className="shadow-lg whitespace-nowrap"
            >
                <Plus size={18} /> New Episode
            </Button>
        </div>
      </div>

      {/* Seasons Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-gray-200">
        {seasonTabs.map((num) => {
            const isActive = activeSeason === num;
            const isLocked = num > show.maxSeason;
            return (
                <button
                    key={num}
                    onClick={() => handleTabClick(num)}
                    className={`
                        px-6 py-3 rounded-t-lg font-bold text-sm transition-all relative
                        ${isActive 
                            ? 'bg-white text-red-600 border-t border-x border-gray-200 shadow-sm z-10' 
                            : isLocked 
                                ? 'bg-gray-50 text-gray-400 cursor-pointer hover:bg-gray-100' 
                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-red-500'
                        }
                    `}
                >
                    <div className="flex items-center gap-2">
                        Season {num}
                        {isLocked && <Lock size={12} />}
                    </div>
                    {isActive && <div className="absolute bottom-[-1px] left-0 right-0 h-1 bg-white"></div>}
                </button>
            )
        })}
      </div>

      {/* Episodes List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Film size={20} className="text-red-500" />
                Episodes (Season {activeSeason})
            </h3>
            <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                <input 
                    type="text" 
                    placeholder="Filter episodes..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-sm rounded-md border border-gray-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
                />
            </div>
        </div>
        
        {episodesInSeason.length === 0 ? (
           <div className="bg-white border-2 border-dashed border-gray-200 rounded-xl p-10 text-center text-gray-400">
               <p className="mb-4">No episodes yet in Season {activeSeason}.</p>
               <Button variant="ghost" onClick={() => onAddEpisode(activeSeason, 1)}>Create Episode 1</Button>
           </div>
        ) : (
            <div className="grid gap-4">
                {filteredEpisodes.length === 0 && <p className="text-gray-500 italic">No episodes match your search.</p>}
                {filteredEpisodes.map((ep) => (
                    <div 
                        key={ep.id} 
                        onClick={() => onViewEpisode(ep.id)}
                        className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md border border-gray-100 cursor-pointer transition-all duration-200 group flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                        <div className="flex gap-4 items-start md:items-center">
                            <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center font-bold text-gray-400 group-hover:bg-red-50 group-hover:text-red-500 transition-colors">
                                #{ep.order}
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 text-lg group-hover:text-red-600 transition-colors">{ep.title}</h4>
                                <p className="text-sm text-gray-500 line-clamp-1">{ep.premise}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 text-gray-400 pl-16 md:pl-0">
                            {ep.postCreditScene && (
                                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">
                                    + Post-Credit
                                </span>
                            )}
                            <span className="text-xs flex items-center gap-1 min-w-[80px]">
                                <Clock size={12} />
                                {new Date(ep.createdAt).toLocaleDateString()}
                            </span>
                            <BookOpen size={20} className="text-gray-300 group-hover:text-red-500" />
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

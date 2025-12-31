
import React, { useState, useEffect } from 'react';
import { ViewState, Show, Episode } from './types';
import { getShows, saveShow, deleteShow, addEpisodeToShow, getShowById, getSettings } from './services/storageService';
import { Home } from './components/Home';
import { Dashboard } from './components/Dashboard';
import { CreateShow } from './components/CreateShow';
import { ShowDetail } from './components/ShowDetail';
import { CreateEpisode } from './components/CreateEpisode';
import { EpisodeViewer } from './components/EpisodeViewer';
import { Settings } from './components/Settings';
import { Upgrade } from './components/Upgrade';
import { DesignStudio } from './components/DesignStudio';
import { Sidebar } from './components/Sidebar';
import { Welcome } from './components/Welcome';
import { Menu, X } from 'lucide-react';

const App: React.FC = () => {
  const [viewState, setViewState] = useState<ViewState>({ type: 'HOME' });
  const [shows, setShows] = useState<Show[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isCheckingKey, setIsCheckingKey] = useState(true);
  const [themeClasses, setThemeClasses] = useState('');
  
  // Theme & API Key Check
  useEffect(() => {
    const checkSettings = async () => {
        try {
            // Check API Key
            // @ts-ignore
            if (window.aistudio && window.aistudio.hasSelectedApiKey) {
                // @ts-ignore
                const hasKey = await window.aistudio.hasSelectedApiKey();
                setHasApiKey(hasKey);
            } else {
                setHasApiKey(true);
            }

            // Apply Theme
            const settings = getSettings();
            
            // Dark Mode
            if (settings.darkMode) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }

            // Accent Color Mapping
            const colors: Record<string, {color: string, bg: string}> = {
                red: { color: '#ef4444', bg: '#fef2f2' },
                green: { color: '#10b981', bg: '#ecfdf5' },
                yellow: { color: '#eab308', bg: '#fefce8' },
                purple: { color: '#9333ea', bg: '#faf5ff' },
                orange: { color: '#f97316', bg: '#fff7ed' },
                pink: { color: '#ec4899', bg: '#fdf2f8' }
            };
            
            const selected = colors[settings.accentColor] || colors.red;
            
            // We use CSS variables for dynamic accent colors in components
            document.documentElement.style.setProperty('--accent-color', selected.color);
            document.documentElement.style.setProperty('--accent-bg', selected.bg);

        } catch (e) {
            console.error("Initialization error", e);
            setHasApiKey(true); 
        } finally {
            setIsCheckingKey(false);
        }
    };
    
    checkSettings();
    window.addEventListener('storage', checkSettings); // Listen for settings changes
    return () => window.removeEventListener('storage', checkSettings);
  }, []);
  
  // Load shows on mount
  useEffect(() => {
    setShows(getShows());
  }, []);

  const refreshShows = () => {
    setShows(getShows());
  };

  const handleCreateShow = (newShow: Show) => {
    saveShow(newShow);
    refreshShows();
    setViewState({ type: 'SHOW_DETAIL', showId: newShow.id });
  };

  const handleDeleteShow = (id: string) => {
    deleteShow(id);
    refreshShows();
  };

  const handleCreateEpisode = (newEpisode: Episode) => {
    if (viewState.type === 'CREATE_EPISODE') {
      addEpisodeToShow(viewState.showId, newEpisode);
      refreshShows();
      setViewState({ type: 'SHOW_DETAIL', showId: viewState.showId });
    }
  };

  const navigate = (view: ViewState['type']) => {
    setViewState({ type: view });
    setIsMobileMenuOpen(false);
  };

  const renderContent = () => {
    switch (viewState.type) {
      case 'HOME':
        return (
          <Home 
            shows={shows} 
            onCreateShow={() => setViewState({ type: 'CREATE_SHOW' })}
            onNavigateToShow={(id) => setViewState({ type: 'SHOW_DETAIL', showId: id })}
          />
        );

      case 'SHOWS':
        return (
          <Dashboard 
            shows={shows} 
            onCreateNew={() => setViewState({ type: 'CREATE_SHOW' })}
            onSelectShow={(id) => setViewState({ type: 'SHOW_DETAIL', showId: id })}
            onDeleteShow={handleDeleteShow}
            isFavoritesView={false}
          />
        );

      case 'FAVORITES':
        return (
          <Dashboard 
             shows={shows}
             onCreateNew={() => setViewState({ type: 'CREATE_SHOW' })}
             onSelectShow={(id) => setViewState({ type: 'SHOW_DETAIL', showId: id })}
             onDeleteShow={handleDeleteShow}
             isFavoritesView={true}
          />
        );

      case 'DESIGN':
        return <DesignStudio />;
      
      case 'SETTINGS':
        return <Settings />;

      case 'UPGRADE':
        return <Upgrade />;
      
      case 'CREATE_SHOW':
        return (
          <CreateShow 
            onSave={handleCreateShow}
            onCancel={() => setViewState({ type: 'SHOWS' })}
          />
        );

      case 'SHOW_DETAIL': {
        const show = getShowById(viewState.showId);
        if (!show) return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Show not found. It may have been deleted.</div>;
        return (
          <ShowDetail 
            show={show}
            onBack={() => setViewState({ type: 'SHOWS' })}
            onAddEpisode={(season, order) => setViewState({ type: 'CREATE_EPISODE', showId: show.id, seasonNumber: season, nextOrder: order })}
            onViewEpisode={(epId) => setViewState({ type: 'VIEW_EPISODE', showId: show.id, episodeId: epId })}
            onRefresh={refreshShows}
          />
        );
      }

      case 'CREATE_EPISODE': {
        const show = getShowById(viewState.showId);
        if (!show) return <div>Show not found</div>;
        return (
          <CreateEpisode 
            show={show}
            seasonNumber={viewState.seasonNumber}
            nextOrder={viewState.nextOrder}
            onSave={handleCreateEpisode}
            onCancel={() => setViewState({ type: 'SHOW_DETAIL', showId: show.id })}
          />
        );
      }

      case 'VIEW_EPISODE': {
        const show = getShowById(viewState.showId);
        if (!show) return <div>Show not found</div>;
        const episode = show.episodes.find(e => e.id === viewState.episodeId);
        if (!episode) return <div>Episode not found</div>;
        
        return (
          <EpisodeViewer 
            showId={show.id}
            episode={episode}
            onBack={() => setViewState({ type: 'SHOW_DETAIL', showId: show.id })}
          />
        );
      }
    }
  };

  if (isCheckingKey) {
      return (
          <div className="min-h-screen bg-slate-50 dark:bg-gray-900 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
          </div>
      );
  }

  if (!hasApiKey) {
      return <Welcome onComplete={() => setHasApiKey(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 flex font-nunito relative overflow-hidden transition-colors duration-300">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-5 dark:opacity-10">
         <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--accent-color)] rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
         <div className="absolute bottom-0 left-0 w-96 h-96 bg-black dark:bg-white rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block z-20 h-screen sticky top-0">
        <Sidebar currentView={viewState.type} onNavigate={navigate} />
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
              <div className="relative w-64 bg-white dark:bg-gray-900 h-full shadow-2xl animate-fade-in-right">
                 <button className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
                    <X size={24} />
                 </button>
                 <Sidebar currentView={viewState.type} onNavigate={navigate} />
              </div>
          </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen relative z-10 max-w-full overflow-hidden">
          <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 shadow-sm md:hidden px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2 font-extrabold text-gray-900 dark:text-white" onClick={() => navigate('HOME')}>
               <span className="text-[var(--accent-color)]">M</span>Studio
            </div>
            <button className="p-2 -mr-2 text-gray-700 dark:text-gray-300 active:bg-gray-100 dark:active:bg-gray-800 rounded-full" onClick={() => setIsMobileMenuOpen(true)}>
                <Menu size={24} />
            </button>
          </header>

          <main className="p-4 md:p-8 w-full max-w-6xl mx-auto flex-1 text-gray-800 dark:text-gray-200">
            {renderContent()}
          </main>
      </div>
    </div>
  );
};

export default App;

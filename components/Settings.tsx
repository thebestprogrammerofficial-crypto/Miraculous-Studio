
import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Key, Cpu, Zap, Image as ImageIcon, AlertTriangle, CheckCircle, Moon, Sun, Palette, User } from 'lucide-react';
import { Button } from './Button';
import { getSettings, saveSettings } from '../services/storageService';
import { UserSettings } from '../types';

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings>({
      useAutoKey: true,
      customApiKey: '',
      scriptModel: 'gemini-3-flash-preview',
      imageModel: 'gemini-2.5-flash-image',
      userName: 'Guardian',
      darkMode: false,
      accentColor: 'red'
  });
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
      setSettings(getSettings());
  }, []);

  const handleChange = (key: keyof UserSettings, value: any) => {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);
      setIsSaved(false);
      // Immediate save for UI changes to reflect instantly in App.tsx wrapper
      if (key === 'darkMode' || key === 'accentColor') {
          saveSettings(newSettings);
          // Force reload to apply theme variables at root
          window.dispatchEvent(new Event('storage'));
      }
  };

  const handleSave = () => {
      saveSettings(settings);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
      window.location.reload(); // Reload to ensure all CSS vars propagate correctly
  };

  const isProModel = (model: string) => {
      return model.includes('pro');
  };

  const accentColors = [
      { id: 'red', color: 'bg-red-500', name: 'Ladybug' },
      { id: 'green', color: 'bg-green-500', name: 'Cat Noir' },
      { id: 'yellow', color: 'bg-yellow-400', name: 'Queen Bee' },
      { id: 'orange', color: 'bg-orange-500', name: 'Rena Rouge' },
      { id: 'purple', color: 'bg-purple-600', name: 'Hawk Moth' },
      { id: 'pink', color: 'bg-pink-400', name: 'Pigella' },
  ];

  return (
    <div className="space-y-8 animate-fade-in max-w-2xl mx-auto pb-20">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <SettingsIcon size={32} className="text-gray-400" />
            Studio Settings
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Manage your Miraculous Studio preferences, visuals, and AI models.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          
          {/* Appearance Section */}
          <div className="p-8 border-b border-gray-100 dark:border-gray-700">
             <h3 className="font-bold text-lg flex items-center gap-2 mb-6 text-gray-900 dark:text-white">
                 <Palette size={20} className="text-[var(--accent-color)]" />
                 Studio Appearance
             </h3>

             <div className="space-y-6">
                 {/* Name */}
                 <div>
                     <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Guardian Name</label>
                     <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text"
                            value={settings.userName}
                            onChange={(e) => handleChange('userName', e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-[var(--accent-color)] outline-none"
                            placeholder="Enter your name"
                        />
                     </div>
                 </div>

                 {/* Dark Mode */}
                 <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                         <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                             {settings.darkMode ? <Moon size={20} className="text-purple-400"/> : <Sun size={20} className="text-yellow-500"/>}
                         </div>
                         <div>
                             <span className="font-bold text-gray-900 dark:text-white block">Dark Mode</span>
                             <span className="text-xs text-gray-500 dark:text-gray-400">Switch between light and dark themes.</span>
                         </div>
                     </div>
                     <button 
                        onClick={() => handleChange('darkMode', !settings.darkMode)}
                        className={`relative w-14 h-7 rounded-full transition-colors duration-200 focus:outline-none ${settings.darkMode ? 'bg-purple-600' : 'bg-gray-300'}`}
                      >
                          <span className={`absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${settings.darkMode ? 'translate-x-7' : ''}`}></span>
                      </button>
                 </div>

                 {/* Accent Color */}
                 <div>
                     <span className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Miraculous Theme</span>
                     <div className="flex gap-3 flex-wrap">
                         {accentColors.map((acc) => (
                             <button
                                key={acc.id}
                                onClick={() => handleChange('accentColor', acc.id)}
                                className={`w-10 h-10 rounded-full ${acc.color} transition-transform hover:scale-110 flex items-center justify-center ring-2 ring-offset-2 dark:ring-offset-gray-800 ${settings.accentColor === acc.id ? 'ring-gray-400 dark:ring-white scale-110' : 'ring-transparent'}`}
                                title={acc.name}
                             >
                                 {settings.accentColor === acc.id && <CheckCircle size={16} className="text-white/80" />}
                             </button>
                         ))}
                     </div>
                 </div>
             </div>
          </div>

          {/* API Key Section */}
          <div className="p-8 border-b border-gray-100 dark:border-gray-700">
              <h3 className="font-bold text-lg flex items-center gap-2 mb-4 text-gray-900 dark:text-white">
                  <Key size={20} className="text-red-500" />
                  API Configuration
              </h3>
              
              <div className="space-y-6">
                  <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-4 rounded-xl border border-gray-200 dark:border-gray-600">
                      <div>
                          <span className="font-bold text-gray-900 dark:text-white block">Auto-Configure (Google AI Studio)</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">Automatically use the secure key from the welcome screen.</span>
                      </div>
                      <button 
                        onClick={() => handleChange('useAutoKey', !settings.useAutoKey)}
                        className={`relative w-14 h-7 rounded-full transition-colors duration-200 focus:outline-none ${settings.useAutoKey ? 'bg-green-500' : 'bg-gray-300'}`}
                      >
                          <span className={`absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${settings.useAutoKey ? 'translate-x-7' : ''}`}></span>
                      </button>
                  </div>

                  <div className={`transition-all duration-300 ${settings.useAutoKey ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Manual API Key</label>
                      <input 
                          type="password"
                          value={settings.customApiKey}
                          onChange={(e) => handleChange('customApiKey', e.target.value)}
                          placeholder={settings.useAutoKey ? "Using Auto-Configured Key" : "Enter your gemini-api-key here"}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-[var(--accent-color)] outline-none font-mono text-sm"
                          disabled={settings.useAutoKey}
                      />
                      {!settings.useAutoKey && (
                          <p className="text-xs text-orange-500 mt-2 flex items-center gap-1">
                              <AlertTriangle size={12} />
                              Warning: You are responsible for the security of your manually entered key.
                          </p>
                      )}
                  </div>
              </div>
          </div>

          {/* Model Selection Section */}
          <div className="p-8 space-y-8">
              <h3 className="font-bold text-lg flex items-center gap-2 mb-4 text-gray-900 dark:text-white">
                  <Cpu size={20} className="text-blue-500" />
                  AI Models
              </h3>

              {/* Script Model */}
              <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <Zap size={16} /> Script Generation Model
                  </label>
                  <div className="relative">
                      <select 
                          value={settings.scriptModel}
                          onChange={(e) => handleChange('scriptModel', e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-[var(--accent-color)] outline-none appearance-none"
                      >
                          <option value="gemini-3-flash-preview">Gemini 3.0 Flash (Fast & Free-ish)</option>
                          <option value="gemini-3-pro-preview">Gemini 3.0 Pro (Complex & Creative)</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-700 dark:text-gray-300">
                          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                      </div>
                  </div>
              </div>

              {/* Image Model */}
              <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <ImageIcon size={16} /> Image Generation Model
                  </label>
                  <div className="relative">
                      <select 
                          value={settings.imageModel}
                          onChange={(e) => handleChange('imageModel', e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-[var(--accent-color)] outline-none appearance-none"
                      >
                          <option value="gemini-2.5-flash-image">Nano Banana (Gemini 2.5) - Standard</option>
                          <option value="gemini-3-pro-image-preview">Nano Banana Pro (Gemini 3 Pro) - High Quality</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-700 dark:text-gray-300">
                          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                      </div>
                  </div>
              </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900 p-8 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <Button variant="danger" onClick={() => {
                  if(confirm("Clear all shows and data? This cannot be undone.")) {
                      localStorage.clear();
                      window.location.reload();
                  }
              }}>Clear Local Data</Button>

              <Button onClick={handleSave} className="px-8 bg-[var(--accent-color)] hover:bg-[var(--accent-color)] opacity-90 hover:opacity-100 border-none text-white">
                  {isSaved ? <CheckCircle size={18} /> : <Save size={18} />}
                  {isSaved ? 'Saved!' : 'Save Settings'}
              </Button>
          </div>
      </div>
    </div>
  );
};

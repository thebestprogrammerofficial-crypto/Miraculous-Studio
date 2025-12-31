import React, { useState } from 'react';
import { Sparkles, ArrowRight, Zap, Key } from 'lucide-react';
import { Button } from './Button';

interface WelcomeProps {
  onComplete: () => void;
}

export const Welcome: React.FC<WelcomeProps> = ({ onComplete }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      // @ts-ignore - Window extension
      if (window.aistudio && window.aistudio.openSelectKey) {
        // @ts-ignore
        await window.aistudio.openSelectKey();
      }
      onComplete();
    } catch (error) {
      console.error("Selection failed", error);
      onComplete(); 
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-nunito relative overflow-hidden">
        {/* Background elements - Miraculous Themed */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-500 rounded-full blur-[100px] transform translate-x-1/3 -translate-y-1/3 opacity-10" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-green-500 rounded-full blur-[100px] transform -translate-x-1/3 translate-y-1/3 opacity-10" />

        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center relative z-10 border border-gray-100 animate-fade-in-up">
            
            {/* Custom Icon */}
            <div className="w-24 h-24 bg-gradient-to-tr from-red-600 to-red-500 rounded-3xl mx-auto flex items-center justify-center shadow-xl shadow-red-200 mb-8 rotate-3 transform transition-transform hover:rotate-6 relative overflow-hidden ring-4 ring-white">
                 <div className="absolute top-0 left-0 right-0 bottom-0 opacity-20" style={{backgroundImage: 'radial-gradient(circle, #000 20%, transparent 20%)', backgroundSize: '16px 16px'}}></div>
                 <div className="w-8 h-8 bg-black rounded-full relative z-10 flex items-center justify-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                 </div>
            </div>

            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Miraculous <span className="text-red-500">Studio</span></h1>
            <p className="text-gray-500 mb-8">
                The ultimate AI-powered scriptwriting & visualization tool for your own Ladybug adventures.
            </p>

            <div className="space-y-4">
                <Button 
                    onClick={handleConnect} 
                    className="w-full py-4 text-lg bg-gradient-to-r from-gray-900 to-black hover:from-black hover:to-gray-800 shadow-xl border-none"
                    isLoading={isLoading}
                >
                    <Key size={20} className="text-red-500" />
                    <span>Connect API Key</span>
                    <ArrowRight size={20} className="ml-2 opacity-50" />
                </Button>
                
                <p className="text-xs text-gray-400 mt-6">
                    Securely connects using Google AI Studio
                </p>
            </div>
            
            <div className="mt-8 pt-8 border-t border-gray-100 flex justify-center gap-6 text-gray-400">
               <div className="flex flex-col items-center gap-1">
                  <Zap size={20} className="text-red-400" />
                  <span className="text-[10px] font-bold uppercase">Fast</span>
               </div>
               <div className="flex flex-col items-center gap-1">
                  <Sparkles size={20} className="text-purple-400" />
                  <span className="text-[10px] font-bold uppercase">Creative</span>
               </div>
            </div>
        </div>
    </div>
  );
};

import React from 'react';
import { Zap, Check, Crown } from 'lucide-react';
import { Button } from './Button';

export const Upgrade: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto text-center py-10">
      <div className="mb-12">
        <div className="w-20 h-20 bg-gradient-to-tr from-red-600 to-red-500 rounded-3xl mx-auto flex items-center justify-center shadow-xl shadow-red-200 mb-6 rotate-3 relative overflow-hidden border-4 border-white">
             <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(circle, #000 20%, transparent 20%)', backgroundSize: '12px 12px'}}></div>
             <Crown size={32} className="text-white relative z-10" />
        </div>
        <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Become a Master Guardian</h2>
        <p className="text-xl text-gray-500 max-w-lg mx-auto">Unleash the full power of the Miracle Box with advanced AI features and unlimited storage.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 text-left">
          {/* Free Tier */}
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm relative opacity-75">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Guardian Initiate</h3>
              <p className="text-3xl font-black mb-6">$0 <span className="text-sm font-normal text-gray-500">/ month</span></p>
              <ul className="space-y-4 mb-8">
                  <li className="flex gap-3"><Check size={20} className="text-green-500" /> Basic Script Generation</li>
                  <li className="flex gap-3"><Check size={20} className="text-green-500" /> 5 Shows Limit</li>
                  <li className="flex gap-3"><Check size={20} className="text-green-500" /> Local Browser Storage</li>
              </ul>
              <Button variant="secondary" className="w-full" disabled>Current Plan</Button>
          </div>

          {/* Pro Tier */}
          <div className="bg-gray-900 p-8 rounded-2xl border border-gray-900 shadow-2xl relative text-white transform md:scale-105">
              <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl">POPULAR</div>
              <h3 className="text-xl font-bold text-red-400 mb-2 flex items-center gap-2"><Zap size={20}/> Master Guardian</h3>
              <p className="text-3xl font-black mb-6">$9.99 <span className="text-sm font-normal text-gray-400">/ month</span></p>
              <ul className="space-y-4 mb-8">
                  <li className="flex gap-3"><Check size={20} className="text-red-500" /> Unlimited Scripts</li>
                  <li className="flex gap-3"><Check size={20} className="text-red-500" /> 4K Image Generation (NanoBanana)</li>
                  <li className="flex gap-3"><Check size={20} className="text-red-500" /> Cloud Sync</li>
                  <li className="flex gap-3"><Check size={20} className="text-red-500" /> Custom Villain Creator</li>
              </ul>
              <Button variant="primary" className="w-full bg-red-600 hover:bg-red-500 text-white border-none" onClick={() => alert("Payment gateway coming soon!")}>
                  Upgrade Now
              </Button>
          </div>
      </div>
    </div>
  );
};

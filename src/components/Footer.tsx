import React from 'react';

interface FooterProps {
  onNavigate: (page: 'privacy' | 'terms') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
      <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-xs text-slate-500">
          &copy; {new Date().getFullYear()} DemandOwl. All rights reserved.
        </div>
        
        <div className="flex gap-6 text-sm text-slate-600">
          <button onClick={() => onNavigate('privacy')} className="hover:text-indigo-600 transition-colors">
            Privacy Policy
          </button>
          <button onClick={() => onNavigate('terms')} className="hover:text-indigo-600 transition-colors">
            Terms of Service
          </button>
          <a href="mailto:support@demandowl.com" className="hover:text-indigo-600 transition-colors">
            Contact Support
          </a>
        </div>
      </div>
    </footer>
  );
};

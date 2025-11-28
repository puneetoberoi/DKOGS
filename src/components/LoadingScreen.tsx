// src/components/LoadingScreen.tsx

import React, { useMemo } from 'react';
import { AnalysisStatus } from '../schema';
import { Loader2, Database, BrainCircuit, Target, MessageSquare, Cpu, CheckCircle2 } from 'lucide-react';

interface LoadingScreenProps {
  status: AnalysisStatus;
  useGroq: boolean;
  useBytez: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ status, useGroq, useBytez }) => {
  
  // Define the sequence of steps based on configuration
  const steps = useMemo(() => {
    const baseSteps = [
      { id: AnalysisStatus.SCRAPING, label: "Scraping Sources", icon: Database },
    ];
    
    if (useGroq) {
      baseSteps.push({ id: AnalysisStatus.GROQ_ANALYSIS, label: "Groq: Twitter Sentiment", icon: MessageSquare });
    }
    
    if (useBytez) {
      baseSteps.push({ id: AnalysisStatus.BYTEZ_ANALYSIS, label: "Bytez: Tech Scanning", icon: Cpu });
    }
    
    baseSteps.push(
      { id: AnalysisStatus.CLUSTERING, label: "Clustering Vectors", icon: BrainCircuit },
      { id: AnalysisStatus.SCORING, label: "Scoring Opportunities", icon: Target }
    );
    
    return baseSteps;
  }, [useGroq, useBytez]);

  // Find index of current status
  const currentStepIndex = steps.findIndex(s => s.id === status);
  
  // Calculate progress percentage
  // If status is COMPLETE, progress is 100%
  // If status is ERROR, keep current progress
  // If status is not found (e.g. IDLE), progress is 0
  let progress = 0;
  if (status === AnalysisStatus.COMPLETE) {
    progress = 100;
  } else if (currentStepIndex !== -1) {
    progress = Math.max(5, ((currentStepIndex + 0.5) / steps.length) * 100);
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 animate-fade-in">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
        
        {/* Spinner & Title */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-4">
            <div className="absolute inset-0 bg-indigo-100 rounded-full animate-ping opacity-75"></div>
            <div className="relative bg-white p-3 rounded-full shadow-sm border border-indigo-50">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Analyzing Market Data</h2>
          <p className="text-slate-500 text-sm mt-1">Our AI is identifying profitable gaps...</p>
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-8">
          <div 
            className="h-full bg-indigo-600 rounded-full transition-all duration-700 ease-out relative overflow-hidden"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite] -skew-x-12 transform origin-left"></div>
          </div>
        </div>

        {/* Steps List */}
        <div className="space-y-4">
          {steps.map((step, index) => {
            // Determine step state
            let state: 'waiting' | 'current' | 'completed' = 'waiting';
            
            if (status === AnalysisStatus.COMPLETE) {
              state = 'completed';
            } else if (currentStepIndex === -1) {
              state = 'waiting';
            } else if (index < currentStepIndex) {
              state = 'completed';
            } else if (index === currentStepIndex) {
              state = 'current';
            }

            return (
              <div 
                key={step.id} 
                className={`flex items-center transition-all duration-500 ${
                  state === 'waiting' ? 'opacity-40' : 'opacity-100'
                }`}
              >
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center mr-3 border-2 transition-colors duration-300
                  ${state === 'completed' ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 
                    state === 'current' ? 'bg-indigo-50 border-indigo-600 text-indigo-600' : 
                    'bg-white border-slate-200 text-slate-300'}
                `}>
                  {state === 'completed' ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <step.icon className={`w-4 h-4 ${state === 'current' ? 'animate-pulse' : ''}`} />
                  )}
                </div>
                <span className={`text-sm font-medium ${
                  state === 'completed' ? 'text-emerald-700' : 
                  state === 'current' ? 'text-indigo-700' : 
                  'text-slate-500'
                }`}>
                  {step.label}
                </span>
                {state === 'current' && (
                  <span className="ml-auto text-xs text-indigo-500 font-semibold animate-pulse">
                    Processing...
                  </span>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default LoadingScreen;s

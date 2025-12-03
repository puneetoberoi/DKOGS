// src/components/LoadingScreen.tsx

import React, { useMemo } from 'react';
import { AnalysisStatus } from '../schema';
import { Database, BrainCircuit, Target, MessageSquare, Cpu } from 'lucide-react';

interface LoadingScreenProps {
  status: AnalysisStatus;
  useGroq: boolean;
  useBytez: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ status, useGroq, useBytez }) => {
  
  const steps = useMemo(() => {
    // Fix: Use 'AnalysisStatus' type instead of 'string' to satisfy TypeScript
    const baseSteps: Array<{ id: AnalysisStatus; label: string; icon: React.ComponentType<any> }> = [
      { id: AnalysisStatus.SCRAPING, label: "Scraping Sources", icon: Database },
    ];
    
    if (useGroq) {
      baseSteps.push({ id: AnalysisStatus.GROQ_ANALYSIS, label: "Calculating Public Sentiment", icon: MessageSquare });
    }
    
    if (useBytez) {
      baseSteps.push({ id: AnalysisStatus.BYTEZ_ANALYSIS, label: "Scanning Pain Points", icon: Cpu });
    }
    
    baseSteps.push(
      { id: AnalysisStatus.CLUSTERING, label: "Clustering Vectors", icon: BrainCircuit },
      { id: AnalysisStatus.SCORING, label: "Scoring Opportunities", icon: Target }
    );
    
    return baseSteps;
  }, [useGroq, useBytez]);

  return (
    <div className="w-full max-w-2xl mx-auto py-16 px-4 flex flex-col items-center justify-center animate-fade-in">
      <div className="mb-8 relative">
        <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-10 rounded-full animate-pulse"></div>
        <BrainCircuit size={64} className="text-indigo-600 relative z-10 animate-bounce" />
      </div>
      
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Generating Gap Report</h2>
      <p className="text-slate-500 mb-12 text-center max-w-md">
        DemandOwl is orchestrating multiple AI models to find your next business opportunity.
      </p>

      <div className="w-full space-y-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = status === step.id;
          
          // Calculate completion based on step order in the dynamic list
          const currentStepIndex = steps.findIndex(s => s.id === status);
          const stepIndex = index;
          // Fix: Logic to determine if step is done
          // If status is COMPLETE, all steps are done.
          // If current step index > this step index, this step is done.
          const isCompleted = status === AnalysisStatus.COMPLETE || (currentStepIndex > -1 && currentStepIndex > stepIndex);
          
          return (
            <div 
              key={step.id}
              className={`flex items-center p-4 rounded-lg border transition-all duration-500 ${
                isActive 
                  ? 'bg-indigo-50 border-indigo-200 scale-105 shadow-md' 
                  : isCompleted 
                    ? 'bg-white border-slate-100 opacity-50'
                    : 'bg-white border-slate-100 opacity-30'
              }`}
            >
              <div className={`p-2 rounded-full mr-4 ${isActive ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                <Icon size={20} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className={`font-medium ${isActive ? 'text-indigo-900' : 'text-slate-500'}`}>
                    {step.label}
                  </span>
                  {isActive && <span className="text-xs text-indigo-600 font-mono animate-pulse">PROCESSING...</span>}
                  {isCompleted && <span className="text-xs text-emerald-600 font-mono">DONE</span>}
                </div>
                {isActive && (
                  <div className="h-1.5 w-full bg-indigo-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full w-1/2 animate-pulse"></div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LoadingScreen;

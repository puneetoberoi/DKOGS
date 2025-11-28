import React, { useState } from 'react';
import { X, Shield, Mail, Loader2 } from 'lucide-react';
import { useAuth, supabase } from '../contexts/AuthContext'; // Import supabase directly for reset

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  title = "Save Your Intelligence", 
  subtitle = "Create a free account to save this report and access it anytime." 
}) => {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const [view, setView] = useState<'signin' | 'signup' | 'reset'>('signin'); // New view state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null); // Success message

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (view === 'signup') {
        const { error } = await signUpWithEmail(email, password, fullName);
        if (error) throw error;
      } else if (view === 'signin') {
        const { error } = await signInWithEmail(email, password);
        if (error) throw error;
      } else if (view === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin, // Redirect back to app
        });
        if (error) throw error;
        setMessage("Check your email for the password reset link.");
      }
      
      if (view !== 'reset') onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ... (Render logic) ...
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden relative">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              {view === 'reset' ? 'Reset Password' : title}
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              {view === 'reset' ? 'Enter your email to receive instructions.' : subtitle}
            </p>
          </div>

          {view !== 'reset' && (
            <>
              {/* Google Button */}
              <button
                onClick={() => { signInWithGoogle(); onClose(); }}
                className="w-full flex items-center justify-center gap-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium py-2.5 px-4 rounded-xl transition-all duration-200 shadow-sm mb-4"
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                Continue with Google
              </button>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-slate-500">Or continue with email</span>
                </div>
              </div>
            </>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {view === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="John Doe"
                  required={view === 'signup'}
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                placeholder="you@example.com"
                required
              />
            </div>
            
            {view !== 'reset' && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-medium text-slate-700">Password</label>
                  {view === 'signin' && (
                    <button 
                      type="button"
                      onClick={() => setView('reset')}
                      className="text-xs text-indigo-600 hover:underline"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            )}

            {error && <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded">{error}</p>}
            {message && <p className="text-xs text-emerald-600 bg-emerald-50 p-2 rounded">{message}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                view === 'signup' ? "Create Account" : 
                view === 'signin' ? "Sign In" : "Send Reset Link"
              )}
            </button>
          </form>

          {view !== 'reset' ? (
            <div className="mt-4 text-center text-sm">
              <span className="text-slate-600">
                {view === 'signup' ? "Already have an account?" : "Don't have an account?"}
              </span>
              <button
                onClick={() => setView(view === 'signup' ? 'signin' : 'signup')}
                className="ml-1 text-indigo-600 font-semibold hover:underline"
              >
                {view === 'signup' ? "Sign In" : "Sign Up"}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setView('signin')}
              className="mt-4 text-sm text-slate-500 hover:text-slate-700"
            >
              Back to Sign In
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

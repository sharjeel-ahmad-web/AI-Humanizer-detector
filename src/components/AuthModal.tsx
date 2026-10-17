import React, { useState } from 'react';
import { X, LogIn, UserPlus, Shield, UserCheck, AlertCircle } from 'lucide-react';
import type { User } from '../types/index.ts';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User, token: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const endpoint = isRegisterMode ? '/api/v1/auth/register' : '/api/v1/auth/login';
    const payload = isRegisterMode ? { name, email, password } : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Authentication failed');
      }

      onLoginSuccess(data.user, data.token);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  // Quick One-Click Switch to Pre-Seeded Profiles
  const handleQuickLogin = async (presetEmail: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: presetEmail, password: 'password123' }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        onLoginSuccess(data.user, data.token);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0A192F]/60 flex items-center justify-center p-4">
      <div className="bg-white border border-[#E8D8C5] rounded-2xl w-full max-w-md shadow-2xl p-6">
        <div className="flex items-center justify-between pb-3 border-b border-[#F1E4D4]">
          <h3 className="text-base font-bold text-[#0A192F] flex items-center gap-2">
            {isRegisterMode ? <UserPlus className="w-5 h-5 text-[#FF6B35]" /> : <LogIn className="w-5 h-5 text-[#FF6B35]" />}
            {isRegisterMode ? 'Create AuraHumanize Account' : 'Sign In to AuraHumanize'}
          </h3>
          <button onClick={onClose} className="p-1 rounded-md text-[#64748B] hover:text-[#0A192F] cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Fast Switcher Bar */}
        <div className="mt-4 p-3 bg-[#FFF9F0] border border-[#E8D8C5] rounded-xl">
          <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-2">
            Quick Test Accounts:
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => handleQuickLogin('ayesha@university.edu')}
              className="py-1 px-2 text-[10px] bg-white border border-[#E8D8C5] hover:border-[#FF6B35] rounded font-semibold text-[#0A192F] cursor-pointer transition-colors"
            >
              Student
            </button>
            <button
              onClick={() => handleQuickLogin('tariq.research@domain.org')}
              className="py-1 px-2 text-[10px] bg-white border border-[#E8D8C5] hover:border-[#FF6B35] rounded font-semibold text-[#0A192F] cursor-pointer transition-colors"
            >
              Researcher
            </button>
            <button
              onClick={() => handleQuickLogin('siliconhubs.hq@gmail.com')}
              className="py-1 px-2 text-[10px] bg-[#0A192F] text-white rounded font-semibold cursor-pointer transition-colors"
            >
              Admin
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          {isRegisterMode && (
            <div>
              <label className="block text-xs font-semibold text-[#0A192F] mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dr. Sarah Connor"
                className="w-full px-3 py-2 bg-[#FFFDF9] border border-[#E8D8C5] rounded-lg text-xs text-[#0A192F] focus:outline-none focus:border-[#FF6B35]"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#0A192F] mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@university.edu"
              className="w-full px-3 py-2 bg-[#FFFDF9] border border-[#E8D8C5] rounded-lg text-xs text-[#0A192F] focus:outline-none focus:border-[#FF6B35]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0A192F] mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 bg-[#FFFDF9] border border-[#E8D8C5] rounded-lg text-xs text-[#0A192F] focus:outline-none focus:border-[#FF6B35]"
            />
          </div>

          {errorMsg && (
            <div className="p-2.5 bg-red-50 border border-red-200 text-xs text-red-700 rounded-md flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#FF6B35] hover:bg-[#E8551E] disabled:bg-[#FFA580] text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer transition-colors mt-2"
          >
            {loading ? 'Authenticating...' : isRegisterMode ? 'Register Account' : 'Sign In'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => {
              setIsRegisterMode(!isRegisterMode);
              setErrorMsg(null);
            }}
            className="text-xs text-[#64748B] hover:text-[#0A192F] font-medium cursor-pointer"
          >
            {isRegisterMode ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
};

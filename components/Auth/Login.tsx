
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Mail, Lock, User as UserIcon, Shield, Loader2, CheckCircle, Info, Key, Hexagon, Zap, ArrowLeft } from 'lucide-react';

type AuthMode = 'signin' | 'signup' | 'recovery';

const Login: React.FC = () => {
  const { login, register, recoverPassword } = useApp();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'Engineer' | 'Manager' | 'Auditor'>('Engineer');
  const [rememberMe, setRememberMe] = useState(true);

  const suggestedProfiles = [
    { email: 'alex.thompson@mocstudio.com', label: 'Engineer', role: 'Engineer' },
    { email: 'sarah.miller@mocstudio.com', label: 'Manager', role: 'Manager' },
    { email: 'chief.auditor@mocstudio.com', label: 'Auditor', role: 'Auditor' },
  ];

  const handleQuickLogin = async (profile: typeof suggestedProfiles[0]) => {
    setError(null);
    setEmail(profile.email);
    const mockPwd = 'industrial_secure_2024';
    setPassword(mockPwd);
    setLoading(true);
    const success = await login(profile.email, mockPwd, rememberMe);
    if (!success) {
      setError('Bypass failed. Check system logs.');
    }
    setLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const success = await login(email, password, rememberMe);
    if (!success) {
      setError('Access Denied. Invalid credentials.');
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const success = await register(name, email, role);
    if (success) {
      setSuccessMsg('Account created. Logging in...');
    }
    setLoading(false);
  };

  const inputClasses = "w-full bg-white border border-slate-300 rounded-xl py-3 pl-11 pr-4 text-slate-950 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-sm";
  const labelClasses = "block text-xs font-black text-slate-800 mb-1.5 uppercase tracking-wider";

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900">
      <div className="w-full max-w-md bg-white rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden p-10 md:p-14">
        
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-12 text-center">
          <div className="p-4 bg-blue-600 rounded-[1.5rem] shadow-xl shadow-blue-600/20 mb-6">
            <Hexagon className="text-white fill-white/10" size={36} />
          </div>
          <h1 className="text-4xl font-black text-slate-950 tracking-tighter">
            MOC<span className="text-blue-600">.</span>STUDIO
          </h1>
          <p className="text-[11px] font-black text-slate-600 uppercase tracking-[0.4em] mt-2">Management of Change</p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-4 text-rose-800 text-sm font-bold animate-in fade-in slide-in-from-top-2 duration-300">
            <Info size={20} className="shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-8 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-4 text-emerald-800 text-sm font-bold animate-in fade-in slide-in-from-top-2 duration-300">
            <CheckCircle size={20} className="shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {mode === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-6">
            <div>
              <label className={labelClasses}>Engineering Mail</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="engineer@mocstudio.com"
                  className={inputClasses}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <label className={labelClasses}>Access Key</label>
                <button type="button" onClick={() => setMode('recovery')} className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-colors">
                  Lost Key?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  required
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputClasses}
                />
              </div>
            </div>

            <div className="flex items-center">
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-sm font-bold text-slate-700 group-hover:text-slate-950 transition-colors">Keep Session Active</span>
              </label>
            </div>

            <button
              disabled={loading}
              className="w-full bg-slate-950 hover:bg-blue-600 py-4 rounded-2xl text-white font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center space-x-3 transition-all shadow-xl active:scale-[0.97] disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <span>Engage Terminal</span>}
            </button>

            <div className="text-center text-xs font-bold text-slate-500 pt-4">
              Missing Clearance?{' '}
              <button type="button" onClick={() => setMode('signup')} className="text-blue-600 font-black hover:underline uppercase tracking-widest">
                Request Entry
              </button>
            </div>
          </form>
        )}

        {mode === 'signup' && (
          <form onSubmit={handleSignUp} className="space-y-5">
            <div>
              <label className={labelClasses}>Full Identification</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  required
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Engineering Lead Name"
                  className={inputClasses}
                />
              </div>
            </div>
            <div>
              <label className={labelClasses}>Registered Mail</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@mocstudio.com"
                  className={inputClasses}
                />
              </div>
            </div>
            <div>
              <label className={labelClasses}>Clearance Grade</label>
              <div className="relative">
                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as any)}
                  className={`${inputClasses} appearance-none cursor-pointer`}
                >
                  <option value="Engineer">Project Engineer</option>
                  <option value="Manager">Operations Manager</option>
                  <option value="Auditor">Compliance Auditor</option>
                </select>
              </div>
            </div>
            <button
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 py-4 rounded-2xl text-white font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center transition-all disabled:opacity-50 mt-4 shadow-lg active:scale-[0.97]"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <span>Provision Account</span>}
            </button>
            <button type="button" onClick={() => setMode('signin')} className="w-full text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-600 pt-4 flex items-center justify-center gap-2 transition-colors">
              <ArrowLeft size={12} /> Back to Entry Point
            </button>
          </form>
        )}

        {mode === 'recovery' && (
          <form onSubmit={(e) => { e.preventDefault(); setMode('signin'); }} className="space-y-6">
            <div>
              <label className={labelClasses}>Registered Engineering Mail</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  required
                  type="email"
                  placeholder="name@mocstudio.com"
                  className={inputClasses}
                />
              </div>
            </div>
            <button className="w-full bg-blue-600 hover:bg-blue-700 py-4 rounded-2xl text-white font-black text-sm uppercase tracking-[0.2em] transition-all shadow-lg active:scale-[0.97]">
              Transmit Reset Code
            </button>
            <button type="button" onClick={() => setMode('signin')} className="w-full text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-600 flex items-center justify-center gap-2">
              <ArrowLeft size={12} /> Return to Login
            </button>
          </form>
        )}

        {/* Sandbox Bypass */}
        {mode === 'signin' && (
          <div className="mt-12 pt-10 border-t border-slate-100">
            <div className="flex items-center justify-center space-x-3 mb-8">
              <span className="h-px w-8 bg-slate-200"></span>
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em]">Developer Access</span>
              <span className="h-px w-8 bg-slate-200"></span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {suggestedProfiles.map(p => (
                <button
                  key={p.email}
                  onClick={() => handleQuickLogin(p)}
                  disabled={loading}
                  className="flex flex-col items-center p-4 rounded-[1.5rem] bg-slate-50 border border-slate-200 hover:border-blue-600 hover:bg-white hover:shadow-xl hover:shadow-blue-600/5 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 group-hover:bg-blue-600 group-hover:border-blue-600 flex items-center justify-center text-slate-600 group-hover:text-white mb-3 shadow-sm transition-all">
                    <UserIcon size={20} />
                  </div>
                  <span className="text-[10px] font-black text-slate-800 uppercase tracking-tight">{p.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
      
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none z-[-1] opacity-40">
        <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-blue-100/50 blur-[140px] rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-emerald-100/50 blur-[140px] rounded-full"></div>
      </div>
    </div>
  );
};

export default Login;

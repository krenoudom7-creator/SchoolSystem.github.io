import React, { useState } from 'react';
import {
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  LogIn,
  KeyRound,
  School,
  Sparkles,
} from 'lucide-react';
import { storage } from '../services/storage.ts';
import { User } from '../types/index.ts';
import { SCHOOL_LOGO_URL } from '../utils/schoolLogo.ts';
import { auth, googleProvider } from '../services/firebase.ts';
import { signInWithPopup } from 'firebase/auth';

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim() || !password.trim()) {
      setErrorMessage('សូមបញ្ចូលឈ្មោះគណនី (Username) និងពាក្យសម្ងាត់ (Password)!');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const authenticatedUser = storage.authenticate(username.trim(), password.trim());
      if (authenticatedUser) {
        setSuccessMessage(`សូមស្វាគមន៍ ${authenticatedUser.name}! កំពុងផ្ទៀងផ្ទាត់ចូលប្រព័ន្ធ...`);
        storage.setSession(authenticatedUser);
        setTimeout(() => {
          onLoginSuccess(authenticatedUser);
        }, 600);
      } else {
        setIsLoading(false);
        setErrorMessage('ឈ្មោះគណនី (Username) ឬពាក្យសម្ងាត់ (Password) មិនត្រឹមត្រូវទេ! សូមពិនិត្យឡើងវិញ។');
      }
    }, 400);
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage('');
    setIsLoading(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const fbUser = cred.user;
      let user = storage.getUsers().find((u) => u.email.toLowerCase() === (fbUser.email || '').toLowerCase());
      if (!user) {
        const isRootAdmin = fbUser.email?.toLowerCase() === 'krenoudom7@gmail.com';
        user = {
          id: `usr-${fbUser.uid}`,
          username: fbUser.email?.split('@')[0] || `user_${Date.now()}`,
          name: fbUser.displayName || 'អ្នកប្រើប្រាស់ Google',
          email: fbUser.email || '',
          role: isRootAdmin ? 'admin' : 'teacher',
          avatar: fbUser.photoURL || undefined,
          status: 'active',
          createdAt: new Date().toISOString(),
        };
        storage.addUser(user);
      }
      setSuccessMessage(`សូមស្វាគមន៍ ${user.name}! កំពុងផ្ទៀងផ្ទាត់ចូលប្រព័ន្ធ...`);
      storage.setSession(user);
      setTimeout(() => {
        onLoginSuccess(user!);
      }, 500);
    } catch (err: any) {
      console.error('Google Sign-in failed:', err);
      setErrorMessage(err?.message || 'ការចូលប្រើតាមរយៈ Google មិនបានសម្រេច សូមព្យាយាមម្ដងទៀត។');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (uname: string, pword: string) => {
    setUsername(uname);
    setPassword(pword);
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 font-khmer relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-blue-600/20 to-amber-500/10 blur-3xl pointer-events-none rounded-full"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-500/5 blur-3xl pointer-events-none rounded-full"></div>

      <div className="relative z-10 w-full max-w-md">
        {/* Main Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-8">
          {/* Logo & School Header */}
          <div className="text-center pb-5 border-b border-slate-100">
            <div className="w-24 h-24 mx-auto mb-3.5 p-0.5 rounded-full bg-white shadow-xl border-2 border-amber-400 flex items-center justify-center overflow-hidden">
              <img
                src={SCHOOL_LOGO_URL}
                alt="Logo អនុវិទ្យាល័យ ហ៊ុន សែន ទួលសំបួរ"
                className="w-full h-full object-cover scale-[1.38] rounded-full"
              />
            </div>
            <div className="inline-block px-2.5 py-0.5 text-[10px] font-semibold bg-amber-100 text-amber-900 border border-amber-200 rounded-full mb-1.5">
              ឆ្នាំសិក្សា ២០២៥ - ២០២៦
            </div>
            <h1 className="font-moul text-base sm:text-lg text-blue-950 font-bold leading-relaxed">
              អនុវិទ្យាល័យ ហ៊ុន សែន ទួលសំបួរ
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Toulsambour Secondary School Management System
            </p>
            <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-lg text-[11px] font-semibold text-slate-700">
              <KeyRound className="w-3.5 h-3.5 text-blue-900" />
              <span>ផ្ទាំងចូលប្រើប្រព័ន្ធរដ្ឋបាលសាលា (Portal Login)</span>
            </div>
          </div>

          {/* Feedback messages */}
          {errorMessage && (
            <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium">{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
              <span className="font-medium">{successMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                ឈ្មោះគណនីអ្នកប្រើប្រាស់ (Username)
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full text-xs pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-900 focus:outline-hidden transition-all text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                ពាក្យសម្ងាត់ (Password)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-900 focus:outline-hidden transition-all text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 hover:from-blue-800 hover:to-indigo-800 text-white text-xs font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-75"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <LogIn className="w-4 h-4 text-amber-400" />
              )}
              <span>ចូលប្រើប្រព័ន្ធ (Sign In to System)</span>
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-[11px] uppercase">
              <span className="bg-white px-2.5 text-slate-400 font-medium">ឬ (OR)</span>
            </div>
          </div>

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-bold rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-75"
          >
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>ចូលប្រើដោយគណនី Google (Google Sign-In)</span>
          </button>

          {/* Admin Credentials Helper */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <div className="p-3 bg-amber-50/80 border border-amber-200/90 rounded-2xl flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">គណនីអភិបាល (Admin Account)</div>
                  <div className="text-[11px] text-slate-600 font-mono">admin / admin123</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin', 'admin123')}
                className="px-2.5 py-1 text-[11px] font-semibold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg transition-colors cursor-pointer"
              >
                បំពេញរហ័ស
              </button>
            </div>
          </div>
        </div>

        {/* School location footer badge */}
        <div className="text-center mt-5 text-slate-400 text-xs">
          <p className="font-medium text-slate-300">
            អនុវិទ្យាល័យ ហ៊ុន សែន ទួលសំបួរ · ស្រុកស្ទឹងត្រង់ ខេត្តកំពង់ចាម
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            ប្រព័ន្ធគ្រប់គ្រងទិន្នន័យអប់រំ និងវត្តមានសិស្សតាមបច្ចេកវិទ្យាឌីជីថល
          </p>
        </div>
      </div>
    </div>
  );
};

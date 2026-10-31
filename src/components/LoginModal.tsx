import React, { useState } from 'react';
import {
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  X,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  LogIn,
} from 'lucide-react';
import { storage } from '../services/storage.ts';
import { User } from '../types/index.ts';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim() || !password.trim()) {
      setErrorMessage('សូមបំពេញ Username និង Password ឱ្យបានត្រឹមត្រូវ!');
      return;
    }

    const authenticatedUser = storage.authenticate(username.trim(), password.trim());
    if (authenticatedUser) {
      setSuccessMessage(`សូមស្វាគមន៍លោក/លោកស្រី ${authenticatedUser.name}!`);
      setTimeout(() => {
        onLoginSuccess(authenticatedUser);
        onClose();
        setSuccessMessage('');
        setUsername('');
        setPassword('');
      }, 700);
    } else {
      setErrorMessage('ឈ្មោះគណនី (Username) ឬពាក្យសម្ងាត់ (Password) មិនត្រឹមត្រូវទេ!');
    }
  };

  const handleQuickLogin = (uname: string, pword: string) => {
    setUsername(uname);
    setPassword(pword);
    setErrorMessage('');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative border border-slate-100">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* School Logo & Title */}
        <div className="text-center pb-5 border-b border-slate-100">
          <div className="w-24 h-24 mx-auto mb-3 p-0.5 rounded-full bg-white shadow-lg border-2 border-amber-400 flex items-center justify-center overflow-hidden">
            <img
              src="/assets/aistudio/image_1f551e19.png"
              alt="Logo អនុវិទ្យាល័យ ហ៊ុន សែន ទួលសំបួរ"
              className="w-full h-full object-cover scale-[1.38] rounded-full"
            />
          </div>
          <h2 className="font-moul text-base text-blue-950 font-bold">
            អនុវិទ្យាល័យ ហ៊ុន សែន ទួលសំបួរ
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            ចូលប្រើប្រព័ន្ធគ្រប់គ្រងសាលារៀន (Admin & Staff Login)
          </p>
        </div>

        {/* Error / Success Alerts */}
        {errorMessage && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            <span className="font-medium">{successMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              ឈ្មោះគណនី (Username)
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ឧ. admin, director, teacher"
                className="w-full text-xs pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-900 focus:outline-hidden transition-all"
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
                className="w-full text-xs pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-900 focus:outline-hidden transition-all"
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
            className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-800 hover:to-indigo-800 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <LogIn className="w-4 h-4 text-amber-400" />
            <span>ចូលប្រព័ន្ធ (Sign In)</span>
          </button>
        </form>

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
    </div>
  );
};

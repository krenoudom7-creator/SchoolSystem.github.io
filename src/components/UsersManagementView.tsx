import React, { useState } from 'react';
import {
  ShieldCheck,
  UserPlus,
  Key,
  Lock,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Search,
  UserCheck,
} from 'lucide-react';
import { User, UserRole } from '../types/index.ts';
import { storage } from '../services/storage.ts';
import { ImageUploader } from './ImageUploader.tsx';
import { safeAvatar, DEFAULT_ADMIN_AVATAR } from '../utils/avatar.ts';

interface UsersManagementViewProps {
  users: User[];
  currentUser: User;
  onRefresh: () => void;
}

export const UsersManagementView: React.FC<UsersManagementViewProps> = ({
  users,
  currentUser,
  onRefresh,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<User | null>(null);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    role: 'admin' as UserRole,
    email: '',
    phone: '',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    status: 'active' as 'active' | 'inactive',
  });

  const toggleShowPassword = (userId: string) => {
    setShowPasswords((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      password: '',
      name: '',
      role: 'admin',
      email: '',
      phone: '',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      status: 'active',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (u: User) => {
    setEditingUser(u);
    setFormData({
      username: u.username,
      password: u.password || '',
      name: u.name,
      role: u.role,
      email: u.email,
      phone: u.phone || '',
      avatar: u.avatar || '',
      status: u.status || 'active',
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username.trim() || !formData.password.trim() || !formData.name.trim()) {
      alert('សូមបំពេញ Username, Password និងឈ្មោះឱ្យបានពេញលេញ!');
      return;
    }

    if (editingUser) {
      storage.updateUser(editingUser.id, formData);
      setEditingUser(null);
    } else {
      // Check username uniqueness
      const exists = users.some(
        (u) => u.username.toLowerCase() === formData.username.trim().toLowerCase()
      );
      if (exists) {
        alert('ឈ្មោះ Username នេះមានរួចហើយ! សូមជ្រើសរើស Username ផ្សេង។');
        return;
      }
      storage.addUser(formData);
      setIsAddModalOpen(false);
    }
    onRefresh();
  };

  const handleDelete = () => {
    if (deleteConfirmUser) {
      if (deleteConfirmUser.username === 'admin') {
        alert('មិនអាចលុបគណនី Root Administrator ដើមបានទេ!');
        setDeleteConfirmUser(null);
        return;
      }
      storage.deleteUser(deleteConfirmUser.id);
      setDeleteConfirmUser(null);
      onRefresh();
    }
  };

  const filtered = users.filter((u) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      u.name.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  });

  const roleKhmerLabels: Record<UserRole, { label: string; badge: string }> = {
    admin: { label: 'អភិបាលប្រព័ន្ធ (Administrator)', badge: 'bg-rose-100 text-rose-800' },
    director: { label: 'នាយកសាលា (Director)', badge: 'bg-amber-100 text-amber-900' },
    teacher: { label: 'គ្រូបង្រៀន (Teacher)', badge: 'bg-blue-100 text-blue-900' },
    student: { label: 'សិស្ស (Student)', badge: 'bg-emerald-100 text-emerald-900' },
    parent: { label: 'អាណាព្យាបាល (Parent)', badge: 'bg-purple-100 text-purple-900' },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-900" />
              <h2 className="text-xl font-bold font-moul text-slate-900">
                គ្រប់គ្រងអ្នកប្រើប្រាស់ & គណនី Admin (User & Admin Accounts)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              បង្កើត បន្ថែម កែប្រែលេខកូដសម្ងាត់ (Password) និងគ្រប់គ្រងសិទ្ធិអ្នកគ្រប់គ្រងប្រព័ន្ធ
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>បន្ថែម Admin / អ្នកគ្រប់គ្រងថ្មី</span>
          </button>
        </div>

        {/* Search */}
        <div className="mt-4 pt-4 border-t border-slate-100 max-w-md">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="ស្វែងរកតាមឈ្មោះ ឬ Username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900">
            បញ្ជីគណនីអ្នកប្រើប្រាស់ និង Admin ({filtered.length} គណនី)
          </h3>
          <span className="text-[10px] text-slate-400">
            គាំទ្រការ Login តាម Username និង Password
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-semibold text-slate-700 border-b border-slate-200">
                <th className="py-3 px-3 text-center w-12">ល.រ</th>
                <th className="py-3 px-3">អ្នកប្រើប្រាស់ / ឈ្មោះពេញ</th>
                <th className="py-3 px-3">Username</th>
                <th className="py-3 px-3">Password</th>
                <th className="py-3 px-3">តួនាទី (Role)</th>
                <th className="py-3 px-3">ទំនាក់ទំនង</th>
                <th className="py-3 px-3">ស្ថានភាព</th>
                <th className="py-3 px-3 text-right">សកម្មភាព</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((u, idx) => {
                const isPasswordShown = showPasswords[u.id];
                const isCurrentUser = u.id === currentUser.id;

                return (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-3 text-center text-slate-400 font-medium">{idx + 1}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={safeAvatar(u.avatar, DEFAULT_ADMIN_AVATAR)}
                          alt={u.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{u.name}</span>
                            {isCurrentUser && (
                              <span className="text-[9px] bg-blue-100 text-blue-900 px-1 rounded-sm">
                                អ្នកផ្ទាល់
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-mono font-bold text-blue-950 bg-slate-100 px-2 py-0.5 rounded">
                        {u.username}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                          {isPasswordShown ? u.password || '******' : '••••••••'}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleShowPassword(u.id)}
                          title={isPasswordShown ? 'លាក់លេខសម្ងាត់' : 'បង្ហាញលេខសម្ងាត់'}
                          className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
                        >
                          {isPasswordShown ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          roleKhmerLabels[u.role]?.badge
                        }`}
                      >
                        {roleKhmerLabels[u.role]?.label.split(' ')[0]}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">
                      {u.phone || '—'}
                    </td>

                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>សកម្ម</span>
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(u)}
                          title="កែប្រែគណនី / ប្ដូរ Password"
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        {u.username !== 'admin' && (
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmUser(u)}
                            title="លុបគណនី"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Admin Modal */}
      {(isAddModalOpen || editingUser) && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold font-moul text-slate-900">
                {editingUser ? `កែប្រែគណនី៖ ${editingUser.name}` : 'បន្ថែមគណនី Admin / អ្នកគ្រប់គ្រងថ្មី'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingUser(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 mt-4">
              {/* Photo Upload with ImageUploader */}
              <ImageUploader
                currentImage={formData.avatar}
                onImageChange={(img) => setFormData({ ...formData, avatar: img })}
                label="រូបថតគណនី (Avatar / Photo)"
                type="user"
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    ឈ្មោះពេញ *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ឧ. លោក ស៊ុយ បូរ៉ា"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-hidden font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    តួនាទី (Role) *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value as UserRole })
                    }
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-hidden font-semibold"
                  >
                    <option value="admin">Administrator (អភិបាលប្រព័ន្ធ)</option>
                    <option value="director">School Director (នាយកសាលា)</option>
                    <option value="teacher">Teacher (គ្រូបង្រៀន/បុគ្គលិក)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Username សម្រាប់ Login *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ឧ. admin_bora"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Password (លេខសម្ងាត់) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="បញ្ចូលលេខសម្ងាត់..."
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    អ៊ីមែល (Email)
                  </label>
                  <input
                    type="email"
                    placeholder="user@toulsambour.edu.kh"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    លេខទូរស័ព្ទ
                  </label>
                  <input
                    type="text"
                    placeholder="012 xxx xxx"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingUser(null);
                  }}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-xl shadow-xs cursor-pointer"
                >
                  {editingUser ? 'កែប្រែគណនី' : 'រក្សាទុកគណនី'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in fade-in">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 text-center font-moul">
              តើអ្នកពិតជាចង់លុបគណនីនេះមែនទេ?
            </h3>
            <p className="text-xs text-slate-500 text-center mt-2">
              គណនី <strong className="text-slate-800">{deleteConfirmUser.name}</strong> ({deleteConfirmUser.username}) នឹងត្រូវបានដកចេញពីប្រព័ន្ធ។
            </p>

            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmUser(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
              >
                បោះបង់
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs cursor-pointer"
              >
                បាទ/ចាស លុបគណនី
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

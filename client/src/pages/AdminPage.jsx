import React, { useState, useEffect, useCallback } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Files, 
  HardDrive, 
  Search, 
  RefreshCw, 
  Key, 
  Sliders, 
  UserCheck, 
  UserX, 
  Copy, 
  Check, 
  X, 
  AlertCircle 
} from 'lucide-react';
import api from '../services/api';
import Navbar from '../components/layout/Navbar';
import LabReminderBanner from '../components/layout/LabReminderBanner';
import AmbientBackground from '../components/common/AmbientBackground';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/useTheme';
import { formatBytes } from '../utils/formatters';

export default function AdminPage() {
  const { success, error: toastError } = useToast();
  const { isDark } = useTheme();

  const [metrics, setMetrics] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [editingQuotaUser, setEditingQuotaUser] = useState(null);
  const [newQuotaMiB, setNewQuotaMiB] = useState(500);
  const [tempPasswordModal, setTempPasswordModal] = useState(null);
  const [copiedPassword, setCopiedPassword] = useState(false);

  const fetchAdminData = useCallback(async () => {
    setLoading(true);
    try {
      const [metricsRes, usersRes] = await Promise.all([
        api.get('/admin/metrics'),
        api.get('/admin/users', { params: { search: searchQuery || undefined } })
      ]);

      if (metricsRes.success) setMetrics(metricsRes.data);
      if (usersRes.success) setUsers(usersRes.data.users);
    } catch (err) {
      toastError(err.message || 'Failed to fetch admin statistics');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, toastError]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  // Toggle user active / disabled status
  const handleToggleStatus = async (user) => {
    const nextStatus = user.accountStatus === 'active' ? 'disabled' : 'active';
    try {
      const res = await api.patch(`/admin/users/${user._id}/status`, { status: nextStatus });
      if (res.success) {
        success(`User ${user.username} is now ${nextStatus}`);
        setUsers((prev) => prev.map((u) => (u._id === user._id ? { ...u, accountStatus: nextStatus } : u)));
      }
    } catch (err) {
      toastError(err.message || 'Failed to update user status');
    }
  };

  // Update Quota
  const handleSaveQuota = async (e) => {
    e.preventDefault();
    if (!editingQuotaUser) return;

    const bytes = Math.round(Number(newQuotaMiB) * 1024 * 1024);
    try {
      const res = await api.patch(`/admin/users/${editingQuotaUser._id}/quota`, {
        storageLimitBytes: bytes
      });
      if (res.success) {
        success(`Quota for ${editingQuotaUser.username} updated to ${newQuotaMiB} MiB`);
        setUsers((prev) =>
          prev.map((u) => (u._id === editingQuotaUser._id ? { ...u, storageLimit: bytes } : u))
        );
        setEditingQuotaUser(null);
      }
    } catch (err) {
      toastError(err.message || 'Failed to update quota');
    }
  };

  // Generate Temporary Password for lost credentials
  const handleGenerateTempPassword = async (user) => {
    try {
      const res = await api.post(`/admin/users/${user._id}/recovery`);
      if (res.success) {
        setTempPasswordModal({
          username: user.username,
          temporaryPassword: res.data.temporaryPassword
        });
        success(`Temporary password generated for ${user.username}`);
      }
    } catch (err) {
      toastError(err.message || 'Failed to generate temporary password');
    }
  };

  const copyTempPassword = () => {
    if (tempPasswordModal) {
      navigator.clipboard.writeText(tempPasswordModal.temporaryPassword);
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2000);
    }
  };

  return (
    <div className={`min-h-screen ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    } flex flex-col transition-colors relative selection:bg-brand-500 selection:text-white`}>
      <AmbientBackground isDark={isDark} />
      <LabReminderBanner />
      <Navbar />

      {/* Temporary Password Display Modal */}
      {tempPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <div className={`rounded-3xl shadow-2xl max-w-md w-full p-6 border transition-all animate-scale-in backdrop-blur-2xl ${
            isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white/95 border-slate-200 shadow-slate-300/50'
          }`}>
            <div className={`flex items-center justify-between pb-3 border-b ${
              isDark ? 'border-slate-800' : 'border-slate-100'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className={`p-2.5 rounded-2xl ${
                  isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-50 text-purple-600 border border-purple-200'
                }`}>
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Temporary Password</h3>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Student: {tempPasswordModal.username}</p>
                </div>
              </div>
              <button
                onClick={() => setTempPasswordModal(null)}
                className={`p-1.5 rounded-xl ${
                  isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className={`mt-4 p-3.5 rounded-2xl font-mono text-center text-base font-bold border tracking-wider ${
              isDark ? 'bg-slate-800/80 border-slate-700 text-purple-300' : 'bg-purple-50/80 border-purple-200 text-purple-700'
            }`}>
              {tempPasswordModal.temporaryPassword}
            </div>

            <p className={`text-xs mt-2 text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Give this temporary password to the student. They will be strictly required to change it on their next login.
            </p>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={copyTempPassword}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all active:translate-y-0.5"
              >
                {copiedPassword ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedPassword ? 'Copied' : 'Copy Password'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quota Adjustment Modal */}
      {editingQuotaUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <div className={`rounded-3xl shadow-2xl max-w-md w-full p-6 border transition-all animate-scale-in backdrop-blur-2xl ${
            isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white/95 border-slate-200 shadow-slate-300/50'
          }`}>
            <div className={`flex items-center justify-between pb-3 border-b ${
              isDark ? 'border-slate-800' : 'border-slate-100'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className={`p-2.5 rounded-2xl ${
                  isDark ? 'bg-brand-500/20 text-brand-400' : 'bg-brand-50 text-brand-600 border border-brand-200'
                }`}>
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Adjust Quota</h3>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Student: {editingQuotaUser.username}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingQuotaUser(null)}
                className={`p-1.5 rounded-xl ${
                  isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuota} className="mt-4">
              <label className={`block text-xs font-semibold mb-1.5 ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}>
                New Storage Quota (in MiB)
              </label>
              <input
                type="number"
                min="10"
                max="51200"
                value={newQuotaMiB}
                onChange={(e) => setNewQuotaMiB(e.target.value)}
                className={`w-full px-3.5 py-2.5 text-sm rounded-xl focus:outline-none ${
                  isDark 
                    ? 'bg-slate-800/90 border border-slate-700 text-white focus:ring-2 focus:ring-brand-500/50' 
                    : 'bg-slate-50/90 hover:bg-white focus:bg-white border border-slate-300 text-slate-900 focus:ring-4 focus:ring-brand-500/15 shadow-sm'
                }`}
              />
              <span className={`text-[11px] mt-1 block ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}>
                500 MiB (Default) &bull; 1024 MiB = 1 GiB
              </span>

              <div className="mt-6 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingQuotaUser(null)}
                  className={`px-4 py-2 text-xs font-medium rounded-xl ${
                    isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 rounded-xl shadow-md active:translate-y-0.5"
                >
                  Save Quota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Admin Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b ${
          isDark ? 'border-slate-800' : 'border-slate-200/90'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl ${
              isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-50 text-purple-600 border border-purple-200 shadow-sm'
            }`}>
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className={`text-2xl font-extrabold tracking-tight ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                Lab Administrator Portal
              </h1>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                System capacity oversight, student accounts, and credential recovery
              </p>
            </div>
          </div>

          <button
            onClick={fetchAdminData}
            disabled={loading}
            className={`self-start sm:self-auto p-2.5 rounded-xl border transition-colors shadow-sm disabled:opacity-50 ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white' : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900'
            }`}
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-purple-600' : ''}`} />
          </button>
        </div>

        {/* System Metric Cards */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className={`rounded-3xl p-5 backdrop-blur-xl border transition-all ${
            isDark 
              ? 'bg-slate-900/70 border-slate-800/80 shadow-2xl shadow-black/40 ring-1 ring-white/5' 
              : 'bg-white/90 border-slate-200/90 shadow-xl shadow-slate-200/50 ring-1 ring-slate-900/5'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-semibold uppercase tracking-wider ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}>Total Users</span>
              <div className="p-2 bg-blue-500/10 text-blue-600 rounded-xl">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className={`mt-3 text-2xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {metrics ? metrics.totalUsers : '-'}
            </div>
            <span className={`text-[11px] mt-0.5 block ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Active student accounts</span>
          </div>

          <div className={`rounded-3xl p-5 backdrop-blur-xl border transition-all ${
            isDark 
              ? 'bg-slate-900/70 border-slate-800/80 shadow-2xl shadow-black/40 ring-1 ring-white/5' 
              : 'bg-white/90 border-slate-200/90 shadow-xl shadow-slate-200/50 ring-1 ring-slate-900/5'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-semibold uppercase tracking-wider ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}>Total Files</span>
              <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-xl">
                <Files className="w-4 h-4" />
              </div>
            </div>
            <div className={`mt-3 text-2xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {metrics ? metrics.totalFiles : '-'}
            </div>
            <span className={`text-[11px] mt-0.5 block ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Stored across all vaults</span>
          </div>

          <div className={`rounded-3xl p-5 backdrop-blur-xl border transition-all ${
            isDark 
              ? 'bg-slate-900/70 border-slate-800/80 shadow-2xl shadow-black/40 ring-1 ring-white/5' 
              : 'bg-white/90 border-slate-200/90 shadow-xl shadow-slate-200/50 ring-1 ring-slate-900/5'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-semibold uppercase tracking-wider ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}>Total Storage Used</span>
              <div className="p-2 bg-purple-500/10 text-purple-600 rounded-xl">
                <HardDrive className="w-4 h-4" />
              </div>
            </div>
            <div className={`mt-3 text-2xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {metrics ? formatBytes(metrics.totalStorageUsed) : '-'}
            </div>
            <span className={`text-[11px] mt-0.5 block ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              Physical cloud object store utilization
            </span>
          </div>
        </div>

        {/* User Management Section */}
        <div className={`mt-8 rounded-3xl overflow-hidden backdrop-blur-xl border transition-all ${
          isDark 
            ? 'bg-slate-900/70 border-slate-800/80 shadow-2xl shadow-black/40 ring-1 ring-white/5' 
            : 'bg-white/90 border-slate-200/90 shadow-xl shadow-slate-200/60 ring-1 ring-slate-900/5'
        }`}>
          <div className={`p-5 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            isDark ? 'border-slate-800' : 'border-slate-100'
          }`}>
            <div>
              <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Enrolled Students &amp; Quotas</h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Manage individual student storage limits and account access</p>
            </div>

            <div className="relative sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by username..."
                className={`w-full pl-9 pr-3 py-1.5 text-xs rounded-xl focus:outline-none transition-all ${
                  isDark 
                    ? 'bg-slate-800/90 border border-slate-700 text-white focus:ring-2 focus:ring-purple-500/30' 
                    : 'bg-slate-50/90 hover:bg-white focus:bg-white border border-slate-300 text-slate-900 focus:ring-4 focus:ring-purple-500/15 shadow-sm'
                }`}
              />
            </div>
          </div>

          {/* User Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y text-left text-xs">
              <thead className={`font-semibold uppercase tracking-wider ${
                isDark ? 'bg-slate-950/60 text-slate-400 divide-slate-800' : 'bg-slate-50/90 text-slate-600 divide-slate-200'
              }`}>
                <tr>
                  <th className="py-3 px-4">Username</th>
                  <th className="py-3 px-4">Files</th>
                  <th className="py-3 px-4">Storage Used</th>
                  <th className="py-3 px-4">Quota Limit</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                {users.map((u) => {
                  const percent = Math.min(100, Math.round((u.storageUsed / u.storageLimit) * 100));

                  return (
                    <tr key={u._id} className={`transition-colors ${
                      isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50/80'
                    }`}>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{u.username}</span>
                          {u.role === 'admin' && (
                            <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold rounded">
                              Admin
                            </span>
                          )}
                        </div>
                      </td>
                      <td className={`py-3 px-4 font-mono ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {u.fileCount || 0}
                      </td>
                      <td className={`py-3 px-4 font-mono ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {formatBytes(u.storageUsed)} ({percent}%)
                      </td>
                      <td className={`py-3 px-4 font-mono ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {formatBytes(u.storageLimit)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.accountStatus === 'active'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {u.accountStatus.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingQuotaUser(u);
                              setNewQuotaMiB(Math.round(u.storageLimit / (1024 * 1024)));
                            }}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isDark ? 'text-slate-400 hover:text-brand-400 hover:bg-brand-950/40' : 'text-slate-500 hover:text-brand-600 hover:bg-brand-50'
                            }`}
                            title="Adjust Quota"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleGenerateTempPassword(u)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isDark ? 'text-slate-400 hover:text-purple-400 hover:bg-purple-950/40' : 'text-slate-500 hover:text-purple-600 hover:bg-purple-50'
                            }`}
                            title="Generate Temporary Password (Lost Codes)"
                          >
                            <Key className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleToggleStatus(u)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              u.accountStatus === 'active'
                                ? 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                                : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={u.accountStatus === 'active' ? 'Disable Account' : 'Enable Account'}
                          >
                            {u.accountStatus === 'active' ? (
                              <UserX className="w-3.5 h-3.5" />
                            ) : (
                              <UserCheck className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

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
import { useToast } from '../context/ToastContext';
import { formatBytes } from '../utils/formatters';

export default function AdminPage() {
  const { success, error: toastError } = useToast();

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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <LabReminderBanner />
      <Navbar />

      {/* Temporary Password Display Modal */}
      {tempPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Temporary Password</h3>
                  <p className="text-xs text-slate-500">Student: {tempPasswordModal.username}</p>
                </div>
              </div>
              <button
                onClick={() => setTempPasswordModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-center text-base font-bold text-purple-700 tracking-wider">
              {tempPasswordModal.temporaryPassword}
            </div>

            <p className="text-xs text-slate-500 mt-2 text-center">
              Give this temporary password to the student. They will be strictly required to change it on their next login.
            </p>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={copyTempPassword}
                className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-md transition-all"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-brand-50 text-brand-600 rounded-xl">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Adjust Quota</h3>
                  <p className="text-xs text-slate-500">Student: {editingQuotaUser.username}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingQuotaUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuota} className="mt-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                New Storage Quota (in MiB)
              </label>
              <input
                type="number"
                min="10"
                max="51200"
                value={newQuotaMiB}
                onChange={(e) => setNewQuotaMiB(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                500 MiB (Default) &bull; 1024 MiB = 1 GiB
              </span>

              <div className="mt-6 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingQuotaUser(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md"
                >
                  Save Quota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Admin Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Lab Administrator Portal
              </h1>
              <p className="text-xs text-slate-500">
                System capacity oversight, student accounts, and credential recovery
              </p>
            </div>
          </div>

          <button
            onClick={fetchAdminData}
            disabled={loading}
            className="self-start sm:self-auto p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 shadow-sm"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-purple-600' : ''}`} />
          </button>
        </div>

        {/* System Metric Cards */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Users</span>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 text-2xl font-extrabold text-slate-900">
              {metrics ? metrics.totalUsers : '-'}
            </div>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Active student accounts</span>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Files</span>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <Files className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 text-2xl font-extrabold text-slate-900">
              {metrics ? metrics.totalFiles : '-'}
            </div>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Stored across all vaults</span>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Storage Used</span>
              <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                <HardDrive className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 text-2xl font-extrabold text-slate-900">
              {metrics ? formatBytes(metrics.totalStorageUsed) : '-'}
            </div>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Physical cloud object store utilization
            </span>
          </div>
        </div>

        {/* User Management Section */}
        <div className="mt-8 bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Enrolled Students & Quotas</h3>
              <p className="text-xs text-slate-500">Manage individual student storage limits and account access</p>
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
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30"
              />
            </div>
          </div>

          {/* User Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Username</th>
                  <th className="py-3 px-4">Files</th>
                  <th className="py-3 px-4">Storage Used</th>
                  <th className="py-3 px-4">Quota Limit</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const percent = Math.min(100, Math.round((u.storageUsed / u.storageLimit) * 100));

                  return (
                    <tr key={u._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">{u.username}</span>
                          {u.role === 'admin' && (
                            <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold rounded">
                              Admin
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {u.fileCount || 0}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {formatBytes(u.storageUsed)} ({percent}%)
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
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
                            className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg"
                            title="Adjust Quota"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleGenerateTempPassword(u)}
                            className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg"
                            title="Generate Temporary Password (Lost Codes)"
                          >
                            <Key className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleToggleStatus(u)}
                            className={`p-1.5 rounded-lg ${
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

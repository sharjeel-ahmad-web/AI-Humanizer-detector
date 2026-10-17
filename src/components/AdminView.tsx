import React, { useState, useEffect } from 'react';
import {
  Users,
  Activity,
  FileCheck,
  ShieldAlert,
  PlusCircle,
  Database,
  RefreshCw,
} from 'lucide-react';
import type { AdminStats } from '../types/index.ts';

interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  plan: string;
  credits: number;
  totalWordsProcessed: number;
}

export const AdminView: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [userList, setUserList] = useState<AdminUserItem[]>([]);
  const [recentJobs, setRecentJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setUserList(data.users || []);
        setRecentJobs(data.recentJobs || []);
      }
    } catch (e) {
      console.error('Failed to load admin stats:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      {/* Admin Header */}
      <div className="bg-white border border-[#E8D8C5] rounded-xl p-5 mb-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-orange-100 text-[#FF6B35] text-[11px] font-bold uppercase tracking-wider mb-1">
            <Database className="w-3 h-3" /> System Console
          </div>
          <h2 className="text-xl font-bold text-[#0A192F]">Platform &amp; Usage Administration</h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Monitor API processing throughput, credit consumption, and MongoDB / memory store state.
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          disabled={loading}
          className="px-3 py-1.5 bg-[#FFF9F0] border border-[#E8D8C5] text-[#0A192F] hover:bg-[#FBEED7] text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Metrics
        </button>
      </div>

      {/* Metrics Row */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-[#E8D8C5] rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#64748B]">Total Registered Users</span>
              <Users className="w-4 h-4 text-[#FF6B35]" />
            </div>
            <div className="text-2xl font-black text-[#0A192F] mt-2">{stats.totalUsers}</div>
            <p className="text-[11px] text-[#64748B] mt-0.5">Across Student &amp; Pro tiers</p>
          </div>

          <div className="bg-white border border-[#E8D8C5] rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#64748B]">Words Processed</span>
              <Activity className="w-4 h-4 text-[#FF6B35]" />
            </div>
            <div className="text-2xl font-black text-[#0A192F] mt-2">
              {stats.totalWordsProcessed.toLocaleString()}
            </div>
            <p className="text-[11px] text-[#64748B] mt-0.5">Humanized &amp; verified</p>
          </div>

          <div className="bg-white border border-[#E8D8C5] rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#64748B]">Humanizer Jobs</span>
              <FileCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-[#0A192F] mt-2">{stats.totalHumanizeJobs}</div>
            <p className="text-[11px] text-[#64748B] mt-0.5">Styles: Academic, Exec, Simple</p>
          </div>

          <div className="bg-white border border-[#E8D8C5] rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#64748B]">Plagiarism Scans</span>
              <ShieldAlert className="w-4 h-4 text-[#FF6B35]" />
            </div>
            <div className="text-2xl font-black text-[#0A192F] mt-2">{stats.totalPlagiarismScans}</div>
            <p className="text-[11px] text-[#64748B] mt-0.5">Corpus token checks</p>
          </div>
        </div>
      )}

      {/* User Management Table */}
      <div className="bg-white border border-[#E8D8C5] rounded-xl overflow-hidden shadow-xs mb-6">
        <div className="bg-[#FFFDF9] border-b border-[#E8D8C5] px-5 py-3 flex items-center justify-between">
          <span className="text-xs font-bold text-[#0A192F] uppercase tracking-wider">
            User Accounts &amp; Credit Ledger
          </span>
          <span className="text-xs text-[#64748B]">{userList.length} users active</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#0A192F]">
            <thead className="bg-[#FFF9F0] border-b border-[#E8D8C5] text-[#64748B] font-semibold">
              <tr>
                <th className="py-2.5 px-4">Name</th>
                <th className="py-2.5 px-4">Email</th>
                <th className="py-2.5 px-4">Role</th>
                <th className="py-2.5 px-4">Plan</th>
                <th className="py-2.5 px-4">Available Credits</th>
                <th className="py-2.5 px-4">Words Synthesized</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1E4D4]">
              {userList.map((u) => (
                <tr key={u.id} className="hover:bg-[#FFFDF8]">
                  <td className="py-3 px-4 font-bold">{u.name}</td>
                  <td className="py-3 px-4 font-mono text-slate-600">{u.email}</td>
                  <td className="py-3 px-4 capitalize font-medium">{u.role}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-[#FFF9F0] border border-[#E8D8C5] uppercase font-bold text-[10px] text-[#0A192F]">
                      {u.plan}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-[#FF6B35]">{u.credits}</td>
                  <td className="py-3 px-4 text-slate-600">{u.totalWordsProcessed.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activity Log */}
      <div className="bg-white border border-[#E8D8C5] rounded-xl p-5 shadow-xs">
        <h3 className="text-xs font-bold text-[#0A192F] uppercase tracking-wider mb-3">
          Recent System Job Invocations
        </h3>
        {recentJobs.length === 0 ? (
          <p className="text-xs text-[#64748B]">No recent jobs recorded.</p>
        ) : (
          <div className="space-y-2">
            {recentJobs.map((j, i) => (
              <div
                key={i}
                className="p-2.5 bg-[#FFFDF9] border border-[#E8D8C5] rounded-md text-xs flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-[#64748B]">{j.id}</span>
                  <span className="capitalize px-1.5 py-0.2 rounded bg-white border border-[#E8D8C5] font-semibold text-[#0A192F]">
                    {j.type}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[#64748B] text-[11px]">
                  <span className="text-emerald-700 font-semibold">{j.status}</span>
                  <span>{new Date(j.createdAt).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

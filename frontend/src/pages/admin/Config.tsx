import { useState, useEffect, useCallback } from "react";
import api from "../../api/client";
import { getMockConfig } from "../../api/mock";

interface ChannelInfo {
  status: string;
  start_time?: string;
  end_time?: string;
}

interface Channels {
  register: ChannelInfo;
  vote: ChannelInfo;
}

const channelLabels: Record<string, string> = { register: "报名通道", vote: "投票通道" };
const statusLabels: Record<string, string> = { open: "已开启", closed: "已关闭" };

const isMockMode = () => sessionStorage.getItem("mock_mode") === "1";

export default function Config() {
  const [channels, setChannels] = useState<Channels | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toggling, setToggling] = useState<string | null>(null);
  const [userId, setUserId] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetMsg, setResetMsg] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetting, setResetting] = useState(false);

  const fetchChannels = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      if (isMockMode()) {
        const rc = getMockConfig("register_channel") as Record<string, unknown>;
        const vc = getMockConfig("vote_channel") as Record<string, unknown>;
        setChannels({
          register: { status: rc?.status as string || "open" },
          vote: { status: vc?.status as string || "open" },
        });
        setLoading(false);
        return;
      }
      const res = await api.get("/api/admin/channels");
      setChannels(res.data);
    } catch {
      const rc = getMockConfig("register_channel") as Record<string, unknown>;
      const vc = getMockConfig("vote_channel") as Record<string, unknown>;
      setChannels({
        register: { status: rc?.status as string || "open" },
        vote: { status: vc?.status as string || "open" },
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchChannels(); }, [fetchChannels]);

  const handleToggle = async (type: string, currentStatus: string) => {
    if (isMockMode()) { setError("演示模式：通道切换不可用"); return; }
    const newStatus = currentStatus === "open" ? "closed" : "open";
    setToggling(type);
    setError("");
    try { await api.put(`/api/admin/channels/${type}`, { status: newStatus }); fetchChannels(); }
    catch { setError("操作失败"); }
    finally { setToggling(null); }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isMockMode()) { setResetError("演示模式：密码重置不可用"); return; }
    if (!userId.trim() || !newPassword.trim()) return;
    setResetting(true); setResetMsg(""); setResetError("");
    try {
      await api.post(`/api/admin/users/${userId.trim()}/reset-password`, { new_password: newPassword.trim() });
      setResetMsg("密码重置成功"); setUserId(""); setNewPassword("");
    } catch { setResetError("密码重置失败，请检查用户ID是否正确"); }
    finally { setResetting(false); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-gray-900">系统配置</h2>
          {isMockMode() && <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">演示模式</span>}
        </div>
      </div>
      {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-md">{error}</div>}
      <section className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">通道管理</h3>
        {loading ? <p className="text-gray-500 text-sm">加载中...</p> : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {channels && (["register", "vote"] as const).map((type) => {
              const ch = channels[type]; const isOpen = ch?.status === "open";
              return (
                <div key={type} className="bg-white border border-gray-200 rounded-lg p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">{channelLabels[type]}</h4>
                    <span className={`rounded px-2.5 py-0.5 text-xs font-semibold ${isOpen ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{statusLabels[ch?.status] || ch?.status}</span>
                  </div>
                  {ch?.start_time && <p className="text-sm text-gray-500 mb-1">开始时间: {new Date(ch.start_time).toLocaleString("zh-CN")}</p>}
                  {ch?.end_time && <p className="text-sm text-gray-500 mb-3">结束时间: {new Date(ch.end_time).toLocaleString("zh-CN")}</p>}
                  <button onClick={() => handleToggle(type, ch?.status)} disabled={toggling === type}
                    className={`px-4 py-1.5 text-sm rounded-md cursor-pointer transition-colors disabled:opacity-50 ${isOpen ? "bg-red-600 text-white hover:bg-red-700" : "bg-green-600 text-white hover:bg-green-700"}`}>
                    {toggling === type ? "处理中..." : isOpen ? "关闭通道" : "开启通道"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">账户管理</h3>
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <p className="text-sm text-gray-500 mb-4">重置管理员密码。请输入用户ID和新的密码。</p>
          <form onSubmit={handleResetPassword} className="space-y-3">
            <div className="flex gap-3">
              <input type="text" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="用户ID" className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 w-40" required />
              <input type="text" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="新密码" className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 w-48" required />
              <button type="submit" disabled={resetting || !userId.trim() || !newPassword.trim()} className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50 cursor-pointer">{resetting ? "处理中..." : "重置密码"}</button>
            </div>
          </form>
          {resetMsg && <p className="mt-2 text-sm text-green-600">{resetMsg}</p>}
          {resetError && <p className="mt-2 text-sm text-red-600">{resetError}</p>}
          <div className="mt-6 border-t border-gray-100 pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">系统账户列表</h4>
            <table className="w-full border-collapse">
              <thead><tr>
                <th className="bg-gray-100 text-left text-xs font-semibold text-gray-600 px-4 py-2">用户ID</th>
                <th className="bg-gray-100 text-left text-xs font-semibold text-gray-600 px-4 py-2">角色</th>
                <th className="bg-gray-100 text-left text-xs font-semibold text-gray-600 px-4 py-2">说明</th>
              </tr></thead>
              <tbody>
                {[
                  { id: "admin", role: "超级管理员", desc: "系统超级管理员" },
                  { id: "scorer_a", role: "评分员A", desc: "A维度评分（品牌）" },
                  { id: "scorer_b", role: "评分员B", desc: "B维度评分（视觉）" },
                  { id: "scorer_c", role: "评分员C", desc: "C维度评分（陈列）" },
                  { id: "scorer_d", role: "评分员D", desc: "D维度评分（执行）" },
                ].map((user) => (
                  <tr key={user.id}>
                    <td className="border-t border-gray-200 px-4 py-2 text-sm font-mono text-gray-900">{user.id}</td>
                    <td className="border-t border-gray-200 px-4 py-2 text-sm text-gray-700">{user.role}</td>
                    <td className="border-t border-gray-200 px-4 py-2 text-sm text-gray-500">{user.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

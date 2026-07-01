import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import api from "../../api/client";
import { getMockAdminWorks, getMockVoucherTags } from "../../api/mock";
import type { VoucherTag } from "../../types";

interface Work {
  id: string;
  work_number: string | null;
  contestant_name: string;
  contestant_phone: string;
  contestant_tax_id: string;
  contestant_address?: string;
  images: string[];
  poster_image?: string;
  school_poster_image?: string;
  status: string;
  reject_reason?: string | null;
  customer_number?: string;
  admin_remarks?: string;
  voucher_tag?: VoucherTag | null;
  created_at: string;
}

const statusOptions = [
  { key: "all", label: "全部状态" },
  { key: "pending", label: "待审核" },
  { key: "hold", label: "待定" },
  { key: "approved", label: "已通过" },
  { key: "rejected", label: "已拒绝" },
];

const statusBadge: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  hold: "bg-purple-100 text-purple-800",
};

const statusLabel: Record<string, string> = {
  pending: "待审核",
  approved: "已通过",
  rejected: "已拒绝",
  hold: "待定",
};

const isMockMode = () => sessionStorage.getItem("mock_mode") === "1";

export default function Works() {
  const location = useLocation();
  const [works, setWorks] = useState<Work[]>([]);
  const params = new URLSearchParams(location.search);
  const urlStatus = params.get("status") || "all";
  const [status, setStatus] = useState(urlStatus);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const size = 20;

  // Edit modal state
  const [editWork, setEditWork] = useState<Work | null>(null);
  const [editTab, setEditTab] = useState<"info" | "scores" | "voucher">("info");
  const [editCustomerNumber, setEditCustomerNumber] = useState("");
  const [editAdminRemarks, setEditAdminRemarks] = useState("");
  const [editScoreA, setEditScoreA] = useState("");
  const [editScoreB, setEditScoreB] = useState("");
  const [editScoreC, setEditScoreC] = useState("");
  const [editScoreD, setEditScoreD] = useState("");
  const [editPopScore, setEditPopScore] = useState("");
  const [editTagId, setEditTagId] = useState("");
  const [saving, setSaving] = useState(false);
  const [voucherTags, setVoucherTags] = useState<VoucherTag[]>([]);
  const [showNewTagForm, setShowNewTagForm] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagAmount, setNewTagAmount] = useState("");
  const [newTagColor, setNewTagColor] = useState("#FF6B6B");

  const fetchWorks = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      if (isMockMode()) {
        const mock = getMockAdminWorks({ status, page, size });
        setWorks(mock.data as Work[]);
        setTotal(mock.total);
        setLoading(false);
        return;
      }
      const res = await api.get("/api/admin/works", {
        params: { status, page, size },
      });
      setWorks(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch {
      const mock = getMockAdminWorks({ status, page, size });
      setWorks(mock.data as Work[]);
      setTotal(mock.total);
    } finally {
      setLoading(false);
    }
  }, [status, page]);

  const fetchVoucherTags = useCallback(async () => {
    try {
      if (isMockMode()) { setVoucherTags(getMockVoucherTags()); return; }
      const res = await api.get("/api/admin/voucher-tags");
      setVoucherTags(res.data || []);
    } catch { setVoucherTags(getMockVoucherTags()); }
  }, []);

  useEffect(() => { fetchWorks(); }, [fetchWorks]);
  useEffect(() => { fetchVoucherTags(); }, [fetchVoucherTags]);

  // Sync status to URL
  useEffect(() => {
    const newParams = new URLSearchParams(location.search);
    if (status === "all") newParams.delete("status");
    else newParams.set("status", status);
    const newSearch = newParams.toString();
    const newUrl = newSearch ? `/admin/works?${newSearch}` : "/admin/works";
    if (`?${location.search}` !== `?${newSearch}`) {
      window.history.replaceState(null, "", `#${newUrl}`);
    }
  }, [status, location.search]);

  const handleDelete = async (workId: string, name: string) => {
    if (isMockMode()) { setError("演示模式：删除功能不可用"); return; }
    if (!window.confirm(`确定要删除 ${name} 的作品吗？此操作不可撤销。`)) return;
    try { await api.delete(`/api/admin/works/${workId}`); fetchWorks(); }
    catch { setError("删除失败"); }
  };

  const openEditModal = (work: Work) => {
    setEditWork(work);
    setEditTab("info");
    setEditCustomerNumber(work.customer_number || "");
    setEditAdminRemarks(work.admin_remarks || "");
    setEditScoreA("");
    setEditScoreB("");
    setEditScoreC("");
    setEditScoreD("");
    setEditPopScore("");
    setEditTagId(work.voucher_tag?.id || "__none__");
    setShowNewTagForm(false);
    setNewTagName("");
    setNewTagAmount("");
    setNewTagColor("#FF6B6B");
  };

  const closeEditModal = () => {
    setEditWork(null);
  };

  const handleEditSave = async () => {
    if (!editWork) return;
    setSaving(true);
    setError("");
    try {
      if (isMockMode()) {
        setError("演示模式：编辑功能不可用");
        setSaving(false);
        return;
      }
      const body: Record<string, unknown> = {};
      body.customer_number = editCustomerNumber.trim();
      body.admin_remarks = editAdminRemarks.trim();

      const scoreA = parseFloat(editScoreA);
      const scoreB = parseFloat(editScoreB);
      const scoreC = parseFloat(editScoreC);
      const scoreD = parseFloat(editScoreD);
      const popScore = parseFloat(editPopScore);
      if (!isNaN(scoreA)) body.score_a = scoreA;
      if (!isNaN(scoreB)) body.score_b = scoreB;
      if (!isNaN(scoreC)) body.score_c = scoreC;
      if (!isNaN(scoreD)) body.score_d = scoreD;
      if (!isNaN(popScore)) body.popularity_score = popScore;

      if (editTagId !== "__none__") body.voucher_tag_id = editTagId;
      else body.voucher_tag_id = null;

      await api.put(`/api/admin/works/${editWork.id}`, body);
      closeEditModal();
      fetchWorks();
    } catch { setError("保存失败"); }
    finally { setSaving(false); }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    const tagData = { name: newTagName.trim(), amount: parseFloat(newTagAmount) || 0, color: newTagColor };
    if (isMockMode()) {
      const newTag: VoucherTag = { id: `tag-new-${Date.now()}`, ...tagData };
      setVoucherTags(prev => [...prev, newTag]);
      setEditTagId(newTag.id);
      setShowNewTagForm(false);
      setNewTagName(""); setNewTagAmount(""); setNewTagColor("#FF6B6B");
      return;
    }
    try {
      const res = await api.post("/api/admin/voucher-tags", tagData);
      const newTag = res.data;
      setVoucherTags(prev => [...prev, newTag]);
      setEditTagId(newTag.id);
      setShowNewTagForm(false);
      setNewTagName(""); setNewTagAmount(""); setNewTagColor("#FF6B6B");
    } catch { setError("创建标签失败"); }
  };

  const totalPages = Math.ceil(total / size);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-gray-900">作品管理</h2>
          {isMockMode() && (
            <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">演示模式</span>
          )}
        </div>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
          {statusOptions.map((opt) => <option key={opt.key} value={opt.key}>{opt.label}</option>)}
        </select>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-md">{error}</div>}

      {loading ? (<p className="text-gray-500 text-sm">加载中...</p>) : (
        <>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="bg-gray-100 text-left text-xs font-semibold text-gray-600 px-4 py-3">编号</th>
                  <th className="bg-gray-100 text-left text-xs font-semibold text-gray-600 px-4 py-3">姓名</th>
                  <th className="bg-gray-100 text-left text-xs font-semibold text-gray-600 px-4 py-3">电话</th>
                  <th className="bg-gray-100 text-left text-xs font-semibold text-gray-600 px-4 py-3">税号</th>
                  <th className="bg-gray-100 text-left text-xs font-semibold text-gray-600 px-4 py-3">状态</th>
                  <th className="bg-gray-100 text-left text-xs font-semibold text-gray-600 px-4 py-3">标签</th>
                  <th className="bg-gray-100 text-left text-xs font-semibold text-gray-600 px-4 py-3">提交时间</th>
                  <th className="bg-gray-100 text-left text-xs font-semibold text-gray-600 px-4 py-3">操作</th>
                </tr>
              </thead>
              <tbody>
                {works.length === 0 ? (
                  <tr><td colSpan={8} className="border-t border-gray-200 px-4 py-8 text-center text-sm text-gray-500">暂无数据</td></tr>
                ) : (
                  works.map((work) => (
                    <tr key={work.id}>
                      <td className="border-t border-gray-200 px-4 py-3 text-sm text-gray-900">{work.work_number || "-"}</td>
                      <td className="border-t border-gray-200 px-4 py-3 text-sm text-gray-900">{work.contestant_name}</td>
                      <td className="border-t border-gray-200 px-4 py-3 text-sm text-gray-600">{work.contestant_phone}</td>
                      <td className="border-t border-gray-200 px-4 py-3 text-sm text-gray-600 font-mono text-xs">{work.contestant_tax_id}</td>
                      <td className="border-t border-gray-200 px-4 py-3">
                        <span className={`rounded px-2.5 py-0.5 text-xs font-semibold ${statusBadge[work.status] || ""}`}>
                          {statusLabel[work.status] || work.status}
                        </span>
                      </td>
                      <td className="border-t border-gray-200 px-4 py-3">
                        {work.voucher_tag ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: work.voucher_tag.color + "20", color: work.voucher_tag.color }}>
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: work.voucher_tag.color }} />
                            {work.voucher_tag.name}
                          </span>
                        ) : <span className="text-xs text-gray-400">-</span>}
                      </td>
                      <td className="border-t border-gray-200 px-4 py-3 text-sm text-gray-500">
                        {new Date(work.created_at).toLocaleString("zh-CN")}
                      </td>
                      <td className="border-t border-gray-200 px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEditModal(work)} className="text-sm text-red-600 hover:text-red-800 cursor-pointer">编辑</button>
                          <button onClick={() => handleDelete(work.id, work.contestant_name)} className="text-sm text-red-400 hover:text-red-600 cursor-pointer">删除</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-gray-500">共 {total} 条，第 {page}/{totalPages} 页</span>
              <div className="flex gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">上一页</button>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">下一页</button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Edit Modal */}
      {editWork && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={closeEditModal}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">编辑作品 — {editWork.work_number || editWork.contestant_name}</h3>
              <button onClick={closeEditModal} className="text-gray-400 hover:text-gray-600 text-xl cursor-pointer">&times;</button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 px-6">
              {(["info", "scores", "voucher"] as const).map(tab => (
                <button key={tab} onClick={() => setEditTab(tab)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                    editTab === tab ? "border-red-600 text-red-600" : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}>
                  {tab === "info" ? "作品信息" : tab === "scores" ? "评分信息" : "代金券标签"}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="p-6">
              {editTab === "info" && (
                <div className="space-y-4">
                  {/* Read-only fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">姓名</label>
                      <p className="text-sm text-gray-900">{editWork.contestant_name}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">电话</label>
                      <p className="text-sm text-gray-900">{editWork.contestant_phone}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">税号</label>
                      <p className="text-sm text-gray-900">{editWork.contestant_tax_id}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">地址</label>
                      <p className="text-sm text-gray-900">{editWork.contestant_address || "-"}</p>
                    </div>
                  </div>

                  {/* Image previews */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">橱窗照片</label>
                    <div className="flex gap-2 overflow-x-auto">
                      {editWork.images?.map((img, idx) => (
                        <img key={idx} src={img} alt={`照片${idx+1}`} className="w-20 h-20 object-cover rounded border" />
                      ))}
                    </div>
                  </div>
                  {(editWork.poster_image || editWork.school_poster_image) && (
                    <div className="flex gap-4">
                      {editWork.poster_image && (
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">橱窗海报</label>
                          <img src={editWork.poster_image} alt="橱窗海报" className="w-20 h-20 object-cover rounded border" />
                        </div>
                      )}
                      {editWork.school_poster_image && (
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">学讯海报</label>
                          <img src={editWork.school_poster_image} alt="学讯海报" className="w-20 h-20 object-cover rounded border" />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Editable fields */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">作品编号</label>
                    <p className="text-sm text-gray-900">{editWork.work_number || "（审核通过后自动生成）"}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">客编</label>
                    <input type="text" value={editCustomerNumber} onChange={(e) => setEditCustomerNumber(e.target.value)}
                      placeholder="输入客户编号" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">备注信息</label>
                    <textarea value={editAdminRemarks} onChange={(e) => setEditAdminRemarks(e.target.value)}
                      placeholder="管理员备注" rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
                  </div>
                </div>
              )}

              {editTab === "scores" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">A-品牌与活动规范 (满分4)</label>
                      <input type="number" step="0.5" min="0" max="4" value={editScoreA} onChange={(e) => setEditScoreA(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">B-视觉设计表现 (满分5)</label>
                      <input type="number" step="0.5" min="0" max="5" value={editScoreB} onChange={(e) => setEditScoreB(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">C-陈列专业度 (满分4)</label>
                      <input type="number" step="0.5" min="0" max="4" value={editScoreC} onChange={(e) => setEditScoreC(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">D-执行与细节 (满分2)</label>
                      <input type="number" step="0.5" min="0" max="2" value={editScoreD} onChange={(e) => setEditScoreD(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">人气分 (满分5)</label>
                      <input type="number" step="1" min="0" max="5" value={editPopScore} onChange={(e) => setEditPopScore(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
                    </div>
                  </div>
                </div>
              )}

              {editTab === "voucher" && (
                <div className="space-y-4">
                  <label className="block text-xs font-medium text-gray-700 mb-1">选择代金券标签</label>
                  {showNewTagForm ? (
                    <div className="space-y-3 p-4 border border-gray-200 rounded-lg">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">标签名称</label>
                        <input type="text" value={newTagName} onChange={(e) => setNewTagName(e.target.value)} placeholder="如：100欧元代金券" maxLength={50}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
                      </div>
                      <div className="flex gap-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">金额</label>
                          <input type="number" value={newTagAmount} onChange={(e) => setNewTagAmount(e.target.value)} placeholder="100"
                            className="w-32 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">颜色</label>
                          <input type="color" value={newTagColor} onChange={(e) => setNewTagColor(e.target.value)}
                            className="w-10 h-9 border border-gray-300 rounded cursor-pointer" />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={handleCreateTag} className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 cursor-pointer">创建标签</button>
                        <button onClick={() => setShowNewTagForm(false)} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 cursor-pointer">取消</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <select value={editTagId} onChange={(e) => setEditTagId(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                        <option value="__none__">不分配标签（移除）</option>
                        {voucherTags.map(tag => (
                          <option key={tag.id} value={tag.id}>{tag.name} — {tag.amount}€</option>
                        ))}
                      </select>
                      <button onClick={() => setShowNewTagForm(true)} className="px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-md hover:bg-red-50 cursor-pointer">+ 新建标签</button>
                    </div>
                  )}
                  {editTagId !== "__none__" && editTagId && (
                    <div className="mt-3">
                      {(() => {
                        const tag = voucherTags.find(t => t.id === editTagId);
                        if (!tag) return null;
                        return (
                          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: tag.color + "20", color: tag.color }}>
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color }} />
                            {tag.name} — {tag.amount}€
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button onClick={closeEditModal} className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer">取消</button>
              <button onClick={handleEditSave} disabled={saving}
                className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50 cursor-pointer">
                {saving ? "保存中..." : "保存"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useCallback } from "react";
import api from "../../api/client";
import { getMockAdminWorks, getMockVoucherTags } from "../../api/mock";
import type { VoucherTag } from "../../types";

interface Work {
  id: string;
  work_number: string;
  contestant_name: string;
  contestant_phone: string;
  contestant_tax_id: string;
  contestant_address: string;
  images: string[];
  poster_image?: string;
  school_poster_image?: string;
  status: string;
  reject_reason: string | null;
  voucher_tag?: VoucherTag | null;
  created_at: string;
  customer_number?: string;
  admin_remarks?: string;
}

const statusTabs = [
  { key: "all", label: "全部" },
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

export default function Review() {
  const [works, setWorks] = useState<Work[]>([]);
  const [status, setStatus] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState<string | null>(null);
  const [workNumbers, setWorkNumbers] = useState<Record<string, string>>({});
  const [rejectReason, setRejectReason] = useState("");
  const [showReject, setShowReject] = useState<string | null>(null);
  // Voucher tag state
  const [voucherTags, setVoucherTags] = useState<VoucherTag[]>([]);
  const [tagSelections, setTagSelections] = useState<Record<string, string>>({});
  const [showNewTagForm, setShowNewTagForm] = useState<Record<string, boolean>>({});
  const [newTagName, setNewTagName] = useState("");
  const [newTagAmount, setNewTagAmount] = useState("");
  const [newTagColor, setNewTagColor] = useState("#FF6B6B");

  const fetchWorks = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      if (isMockMode()) {
        const mock = getMockAdminWorks({ status, page: 1, size: 100 });
        setWorks(mock.data as Work[]);
        setLoading(false);
        return;
      }
      const res = await api.get("/api/admin/works", {
        params: { status, page: 1, size: 100 },
      });
      setWorks(res.data.data || []);
    } catch {
      const mock = getMockAdminWorks({ status, page: 1, size: 100 });
      setWorks(mock.data as Work[]);
    } finally {
      setLoading(false);
    }
  }, [status]);

  const fetchVoucherTags = useCallback(async () => {
    try {
      if (isMockMode()) {
        setVoucherTags(getMockVoucherTags());
        return;
      }
      const res = await api.get("/api/admin/voucher-tags");
      setVoucherTags(res.data || []);
    } catch {
      setVoucherTags(getMockVoucherTags());
    }
  }, []);

  useEffect(() => { fetchWorks(); }, [fetchWorks]);
  useEffect(() => { fetchVoucherTags(); }, [fetchVoucherTags]);

  const handleApprove = async (workId: string) => {
    if (isMockMode()) {
      setError("演示模式：审批功能不可用");
      return;
    }
    setActionId(workId);
    try {
      const body: Record<string, unknown> = {};
      const num = workNumbers[workId]?.trim(); if (num) body.work_number = num;
      const tagId = tagSelections[workId];
      if (tagId && tagId !== "__none__") body.voucher_tag_id = tagId;
      await api.post(`/api/admin/works/${workId}/approve`, body);
      setWorkNumbers(prev => { const next = { ...prev }; delete next[workId]; return next; });
      fetchWorks();
    } catch {
      setError("操作失败");
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (workId: string) => {
    if (isMockMode()) {
      setError("演示模式：审批功能不可用");
      return;
    }
    if (!rejectReason.trim()) return;
    setActionId(workId);
    try {
      await api.post(`/api/admin/works/${workId}/reject`, {
        reason: rejectReason.trim(),
      });
      setRejectReason("");
      setShowReject(null);
      fetchWorks();
    } catch {
      setError("操作失败");
    } finally {
      setActionId(null);
    }
  };

  const handleHold = async (workId: string) => {
    if (isMockMode()) {
      setError("演示模式：待定功能不可用");
      return;
    }
    setActionId(workId);
    try {
      await api.post(`/api/admin/works/${workId}/hold`);
      fetchWorks();
    } catch {
      setError("操作失败");
    } finally {
      setActionId(null);
    }
  };

  const createVoucherTag = async (workId: string) => {
    if (!newTagName.trim()) return;
    const tagData = {
      name: newTagName.trim(),
      amount: parseFloat(newTagAmount) || 0,
      color: newTagColor,
    };
    if (isMockMode()) {
      const newTag: VoucherTag = { id: `tag-new-${Date.now()}`, ...tagData };
      setVoucherTags(prev => [...prev, newTag]);
      setTagSelections(prev => ({ ...prev, [workId]: newTag.id }));
      setShowNewTagForm(prev => ({ ...prev, [workId]: false }));
      setNewTagName("");
      setNewTagAmount("");
      setNewTagColor("#FF6B6B");
      return;
    }
    try {
      const res = await api.post("/api/admin/voucher-tags", tagData);
      const newTag = res.data;
      setVoucherTags(prev => [...prev, newTag]);
      setTagSelections(prev => ({ ...prev, [workId]: newTag.id }));
      setShowNewTagForm(prev => ({ ...prev, [workId]: false }));
      setNewTagName("");
      setNewTagAmount("");
      setNewTagColor("#FF6B6B");
    } catch {
      setError("创建标签失败");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">报名审核</h2>
        {isMockMode() && (
          <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
            演示模式 — 数据为模拟数据
          </span>
        )}
      </div>

      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {statusTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatus(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
              status === tab.key
                ? "border-red-600 text-red-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-md">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-gray-500 text-sm">加载中...</p>
      ) : works.length === 0 ? (
        <p className="text-gray-500 text-sm">暂无数据</p>
      ) : (
        <div className="space-y-4">
          {works.map((work) => (
            <div
              key={work.id}
              className="bg-white border border-gray-200 rounded-lg p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-semibold text-gray-900">
                      {work.contestant_name}
                    </span>
                    <span
                      className={`rounded px-2.5 py-0.5 text-xs font-semibold ${
                        statusBadge[work.status] || ""
                      }`}
                    >
                      {statusLabel[work.status] || work.status}
                    </span>
                    {work.work_number && (
                      <span className="text-xs text-gray-500">
                        编号: {work.work_number}
                      </span>
                    )}
                    {work.voucher_tag && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: work.voucher_tag.color + "20", color: work.voucher_tag.color }}>
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: work.voucher_tag.color }} />
                        {work.voucher_tag.name}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 space-y-0.5">
                    <p>电话: {work.contestant_phone}</p>
                    <p>税号: {work.contestant_tax_id}</p>
                    <p>地址: {work.contestant_address}</p>
                    <p>
                      提交时间:{" "}
                      {new Date(work.created_at).toLocaleString("zh-CN")}
                    </p>
                  </div>
                </div>
              </div>

              {work.images && work.images.length > 0 && (
                <div className="flex gap-2 mb-3 overflow-x-auto">
                  {work.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`作品图片 ${idx + 1}`}
                      className="w-24 h-24 object-cover rounded border border-gray-200"
                    />
                  ))}
                </div>
              )}

              {(work.poster_image || work.school_poster_image) && (
                <div className="flex gap-2 mb-3 overflow-x-auto text-xs text-gray-400">
                  {work.poster_image && (
                    <div>
                      <span className="mb-1 block">橱窗海报</span>
                      <img src={work.poster_image} alt="橱窗海报" className="w-16 h-16 object-cover rounded border border-gray-200" />
                    </div>
                  )}
                  {work.school_poster_image && (
                    <div>
                      <span className="mb-1 block">学讯海报</span>
                      <img src={work.school_poster_image} alt="学讯海报" className="w-16 h-16 object-cover rounded border border-gray-200" />
                    </div>
                  )}
                </div>
              )}

              {work.status === "rejected" && work.reject_reason && (
                <p className="text-sm text-red-600 mb-3">
                  拒绝原因: {work.reject_reason}
                </p>
              )}

              {(work.status === "pending" || work.status === "hold") && (
                <div className="border-t border-gray-100 pt-3">
                  {showReject === work.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="请输入拒绝原因"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReject(work.id)}
                          disabled={
                            actionId === work.id || !rejectReason.trim()
                          }
                          className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50 cursor-pointer"
                        >
                          {actionId === work.id ? "处理中..." : "确认拒绝"}
                        </button>
                        <button
                          onClick={() => {
                            setShowReject(null);
                            setRejectReason("");
                          }}
                          className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 cursor-pointer"
                        >
                          取消
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          value={workNumbers[work.id] || ""}
                          onChange={(e) => setWorkNumbers(prev => ({ ...prev, [work.id]: e.target.value }))}
                          placeholder="作品编号（可选）"
                          className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 w-40"
                        />
                        <button
                          onClick={() => handleApprove(work.id)}
                          disabled={actionId === work.id}
                          className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50 cursor-pointer"
                        >
                          {actionId === work.id ? "处理中..." : "通过"}
                        </button>
                        <button
                          onClick={() => handleHold(work.id)}
                          disabled={actionId === work.id}
                          className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 disabled:opacity-50 cursor-pointer"
                        >
                          {actionId === work.id ? "处理中..." : "待定"}
                        </button>
                        <button
                          onClick={() => setShowReject(work.id)}
                          className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 cursor-pointer"
                        >
                          拒绝
                        </button>
                      </div>

                      {/* Voucher tag assignment */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">代金券标签:</span>
                        {showNewTagForm[work.id] ? (
                          <div className="flex items-center gap-2">
                            <input type="text" value={newTagName} onChange={(e) => setNewTagName(e.target.value)} placeholder="标签名称" className="px-2 py-1 border border-gray-300 rounded text-xs w-32" />
                            <input type="number" value={newTagAmount} onChange={(e) => setNewTagAmount(e.target.value)} placeholder="金额" className="px-2 py-1 border border-gray-300 rounded text-xs w-20" />
                            <input type="color" value={newTagColor} onChange={(e) => setNewTagColor(e.target.value)} className="w-6 h-6 border border-gray-300 rounded cursor-pointer" />
                            <button onClick={() => createVoucherTag(work.id)} className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 cursor-pointer">创建</button>
                            <button onClick={() => setShowNewTagForm(prev => ({ ...prev, [work.id]: false }))} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200 cursor-pointer">取消</button>
                          </div>
                        ) : (
                          <>
                            <select
                              value={tagSelections[work.id] || "__none__"}
                              onChange={(e) => setTagSelections(prev => ({ ...prev, [work.id]: e.target.value }))}
                              className="px-2 py-1 border border-gray-300 rounded text-xs"
                            >
                              <option value="__none__">不分配标签</option>
                              {voucherTags.map(tag => (
                                <option key={tag.id} value={tag.id}>{tag.name}</option>
                              ))}
                            </select>
                            <button onClick={() => setShowNewTagForm(prev => ({ ...prev, [work.id]: true }))} className="px-2 py-1 text-xs text-red-600 border border-red-200 rounded hover:bg-red-50 cursor-pointer">+ 新建</button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

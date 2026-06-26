import { useState, useEffect, useCallback } from "react";
import api from "../../api/client";
import { getMockAdminWorks } from "../../api/mock";

interface Work {
  id: string;
  work_number: string;
  contestant_name: string;
  contestant_phone: string;
  contestant_tax_id: string;
  contestant_address: string;
  images: string[];
  status: string;
  reject_reason: string | null;
  created_at: string;
}

const statusTabs = [
  { key: "all", label: "全部" },
  { key: "pending", label: "待审核" },
  { key: "approved", label: "已通过" },
  { key: "rejected", label: "已拒绝" },
];

const statusBadge: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

const statusLabel: Record<string, string> = {
  pending: "待审核",
  approved: "已通过",
  rejected: "已拒绝",
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

  useEffect(() => {
    fetchWorks();
  }, [fetchWorks]);

  const handleApprove = async (workId: string) => {
    if (isMockMode()) {
      setError("演示模式：审批功能不可用");
      return;
    }
    setActionId(workId);
    try {
      const body: { work_number?: string } = {};
      const num = workNumbers[workId]?.trim(); if (num) body.work_number = num;
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

              {work.status === "rejected" && work.reject_reason && (
                <p className="text-sm text-red-600 mb-3">
                  拒绝原因: {work.reject_reason}
                </p>
              )}

              {work.status === "pending" && (
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
                        onClick={() => setShowReject(work.id)}
                        className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 cursor-pointer"
                      >
                        拒绝
                      </button>
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

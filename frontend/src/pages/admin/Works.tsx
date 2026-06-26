import { useState, useEffect, useCallback } from "react";
import api from "../../api/client";
import { getMockAdminWorks } from "../../api/mock";

interface Work {
  id: string;
  work_number: string;
  contestant_name: string;
  contestant_phone: string;
  contestant_tax_id: string;
  status: string;
  created_at: string;
}

const statusOptions = [
  { key: "all", label: "全部状态" },
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

export default function Works() {
  const [works, setWorks] = useState<Work[]>([]);
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const size = 20;

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

  useEffect(() => {
    fetchWorks();
  }, [fetchWorks]);

  const handleDelete = async (workId: string, name: string) => {
    if (isMockMode()) {
      setError("演示模式：删除功能不可用");
      return;
    }
    if (!window.confirm(`确定要删除 ${name} 的作品吗？此操作不可撤销。`)) return;
    try {
      await api.delete(`/api/admin/works/${workId}`);
      fetchWorks();
    } catch {
      setError("删除失败");
    }
  };

  const totalPages = Math.ceil(total / size);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-gray-900">作品管理</h2>
          {isMockMode() && (
            <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
              演示模式
            </span>
          )}
        </div>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          {statusOptions.map((opt) => (
            <option key={opt.key} value={opt.key}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-md">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-gray-500 text-sm">加载中...</p>
      ) : (
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
                  <th className="bg-gray-100 text-left text-xs font-semibold text-gray-600 px-4 py-3">提交时间</th>
                  <th className="bg-gray-100 text-left text-xs font-semibold text-gray-600 px-4 py-3">操作</th>
                </tr>
              </thead>
              <tbody>
                {works.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="border-t border-gray-200 px-4 py-8 text-center text-sm text-gray-500">暂无数据</td>
                  </tr>
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
                      <td className="border-t border-gray-200 px-4 py-3 text-sm text-gray-500">
                        {new Date(work.created_at).toLocaleString("zh-CN")}
                      </td>
                      <td className="border-t border-gray-200 px-4 py-3">
                        <button onClick={() => handleDelete(work.id, work.contestant_name)} className="text-sm text-red-600 hover:text-red-800 cursor-pointer">删除</button>
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
    </div>
  );
}

import { useState, useEffect, useCallback } from "react";
import api from "../../api/client";

interface ScoreRow {
  work_id: string;
  work_number: string;
  contestant_name: string;
  score_a: number | null;
  score_b: number | null;
  score_c: number | null;
  score_d: number | null;
  popularity_score: number | null;
  total: number | null;
  locked?: boolean;
}

export default function Scores() {
  const [scores, setScores] = useState<ScoreRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [lockingId, setLockingId] = useState<string | null>(null);
  const size = 20;

  const fetchScores = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/api/admin/scores", {
        params: { page, size, sort: "total" },
      });
      setScores(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch {
      setError("加载数据失败");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchScores();
  }, [fetchScores]);

  const handleLock = async (workId: string) => {
    if (!window.confirm("确定要锁定该作品的成绩吗？锁定后不可修改。")) return;
    setLockingId(workId);
    try {
      await api.post(`/api/admin/scores/${workId}/lock`);
      fetchScores();
    } catch {
      setError("锁定失败");
    } finally {
      setLockingId(null);
    }
  };

  const totalPages = Math.ceil(total / size);

  const fmt = (v: number | null | undefined) =>
    v !== null && v !== undefined ? v.toFixed(1) : "-";

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">成绩管理</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-md">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-gray-500 text-sm">加载中...</p>
      ) : (
        <>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="bg-gray-100 text-left text-xs font-semibold text-gray-600 px-4 py-3">
                    排名
                  </th>
                  <th className="bg-gray-100 text-left text-xs font-semibold text-gray-600 px-4 py-3">
                    编号
                  </th>
                  <th className="bg-gray-100 text-left text-xs font-semibold text-gray-600 px-4 py-3">
                    姓名
                  </th>
                  <th className="bg-gray-100 text-center text-xs font-semibold text-gray-600 px-4 py-3">
                    A-品牌(4)
                  </th>
                  <th className="bg-gray-100 text-center text-xs font-semibold text-gray-600 px-4 py-3">
                    B-视觉(5)
                  </th>
                  <th className="bg-gray-100 text-center text-xs font-semibold text-gray-600 px-4 py-3">
                    C-陈列(4)
                  </th>
                  <th className="bg-gray-100 text-center text-xs font-semibold text-gray-600 px-4 py-3">
                    D-执行(2)
                  </th>
                  <th className="bg-gray-100 text-center text-xs font-semibold text-gray-600 px-4 py-3">
                    人气分(5)
                  </th>
                  <th className="bg-gray-100 text-center text-xs font-semibold text-gray-600 px-4 py-3">
                    总分(20)
                  </th>
                  <th className="bg-gray-100 text-left text-xs font-semibold text-gray-600 px-4 py-3">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody>
                {scores.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="border-t border-gray-200 px-4 py-8 text-center text-sm text-gray-500"
                    >
                      暂无数据
                    </td>
                  </tr>
                ) : (
                  scores.map((row, idx) => (
                    <tr key={row.work_id}>
                      <td className="border-t border-gray-200 px-4 py-3 text-sm font-semibold text-gray-900">
                        {(page - 1) * size + idx + 1}
                      </td>
                      <td className="border-t border-gray-200 px-4 py-3 text-sm text-gray-900">
                        {row.work_number || "-"}
                      </td>
                      <td className="border-t border-gray-200 px-4 py-3 text-sm text-gray-900">
                        {row.contestant_name}
                      </td>
                      <td className="border-t border-gray-200 px-4 py-3 text-sm text-center text-gray-600">
                        {fmt(row.score_a)}
                      </td>
                      <td className="border-t border-gray-200 px-4 py-3 text-sm text-center text-gray-600">
                        {fmt(row.score_b)}
                      </td>
                      <td className="border-t border-gray-200 px-4 py-3 text-sm text-center text-gray-600">
                        {fmt(row.score_c)}
                      </td>
                      <td className="border-t border-gray-200 px-4 py-3 text-sm text-center text-gray-600">
                        {fmt(row.score_d)}
                      </td>
                      <td className="border-t border-gray-200 px-4 py-3 text-sm text-center text-gray-600">
                        {fmt(row.popularity_score)}
                      </td>
                      <td className="border-t border-gray-200 px-4 py-3 text-sm text-center font-bold text-gray-900">
                        {fmt(row.total)}
                      </td>
                      <td className="border-t border-gray-200 px-4 py-3">
                        {row.locked ? (
                          <span className="rounded px-2.5 py-0.5 text-xs font-semibold bg-gray-100 text-gray-600">
                            已锁定
                          </span>
                        ) : (
                          <button
                            onClick={() => handleLock(row.work_id)}
                            disabled={lockingId === row.work_id}
                            className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50 cursor-pointer"
                          >
                            {lockingId === row.work_id ? "锁定中..." : "锁定"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-gray-500">
                共 {total} 条，第 {page}/{totalPages} 页
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  上一页
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  下一页
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

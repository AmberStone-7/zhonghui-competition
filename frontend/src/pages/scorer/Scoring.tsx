import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/client";

interface ScoreOption {
  score: number;
  description: string;
}

interface ScoreItem {
  name: string;
  options: ScoreOption[];
}

interface ScoringDetailResponse {
  work_info: { number: string; name: string; images: string[] };
  board: {
    name: string;
    max_score: number;
    items: ScoreItem[];
  };
  current_score: {
    status: string;
    items: Array<{ item_name: string; selected_score: number }>;
    subtotal: number;
  } | null;
}

export default function Scoring() {
  const { workId } = useParams<{ workId: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<ScoringDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selections, setSelections] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [locked, setLocked] = useState(false);

  const fetchDetail = useCallback(async () => {
    if (!workId) return;
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/api/admin/scoring/${workId}`);
      const detail = res.data as ScoringDetailResponse;
      setData(detail);

      if (detail.current_score) {
        const pre: Record<number, number> = {};
        detail.board.items.forEach((item, idx) => {
          const saved = detail.current_score!.items.find(
            (s) => s.item_name === item.name
          );
          if (saved) {
            pre[idx] = saved.selected_score;
          }
        });
        setSelections(pre);
        setLocked(detail.current_score.status === "locked");
      }
    } catch {
      setError("加载评分详情失败");
    } finally {
      setLoading(false);
    }
  }, [workId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleSelect = (itemIndex: number, score: number) => {
    if (locked) return;
    setSelections((prev) => ({ ...prev, [itemIndex]: score }));
  };

  const calcSubtotal = (): number => {
    if (!data) return 0;
    return Object.values(selections).reduce((sum, score) => {
      return sum + score;
    }, 0);
  };

  const handleSubmit = async () => {
    if (!data || !workId) return;

    const allSelected = data.board.items.every((_, idx) =>
      selections[idx] !== undefined
    );
    if (!allSelected) {
      setError("请为所有评分项选择分数");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const items = data.board.items.map((item, idx) => ({
        item_name: item.name,
        selected_score: selections[idx],
      }));
      await api.post(`/api/admin/scoring/${workId}`, { items });
      navigate("/admin/scoring", { state: { refresh: Date.now() } });
    } catch {
      setError("提交评分失败，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="bg-slate-800 text-white rounded-lg px-6 py-4 mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/admin/scoring")}
              className="text-slate-300 hover:text-white cursor-pointer"
            >
              &larr;
            </button>
            <h2 className="text-lg font-bold">评分</h2>
          </div>
        </div>
        <p className="text-gray-500 text-sm">加载中...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div>
        <div className="bg-slate-800 text-white rounded-lg px-6 py-4 mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/admin/scoring")}
              className="text-slate-300 hover:text-white cursor-pointer"
            >
              &larr;
            </button>
            <h2 className="text-lg font-bold">评分</h2>
          </div>
        </div>
        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md">
          {error}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const subtotal = calcSubtotal();
  const allSelected = data.board.items.every(
    (_, idx) => selections[idx] !== undefined
  );

  return (
    <div>
      {/* Header */}
      <div className="bg-slate-800 text-white rounded-lg px-6 py-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/admin/scoring")}
              className="text-slate-300 hover:text-white text-xl cursor-pointer"
            >
              &larr;
            </button>
            <h2 className="text-lg font-bold">
              评分 - {data.work_info.number}
            </h2>
          </div>
          <span className="text-sm text-slate-300">
            {data.board.name}（满分 {data.board.max_score} 分）
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-md">
          {error}
        </div>
      )}

      {/* Work preview */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
        <div className="flex items-start gap-4">
          {data.work_info.images && data.work_info.images.length > 0 ? (
            <div className="flex gap-2 overflow-x-auto">
              {data.work_info.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`作品图片 ${idx + 1}`}
                  className="w-24 h-24 object-cover rounded border border-gray-200 flex-shrink-0"
                />
              ))}
            </div>
          ) : (
            <div className="w-24 h-24 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
              <svg
                className="w-10 h-10 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l1.409 1.409M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
                />
              </svg>
            </div>
          )}
          <div>
            <p className="font-semibold text-gray-900 mb-1">
              {data.work_info.number}
            </p>
            <p className="text-sm text-gray-600">{data.work_info.name}</p>
          </div>
        </div>
      </div>

      {/* Locked notice */}
      {locked && (
        <div className="mb-4 p-3 bg-gray-100 text-gray-600 text-sm rounded-md font-medium">
          评分已锁定
        </div>
      )}

      {/* Score items */}
      <div className="space-y-4 mb-6">
        {data.board.items.map((item, itemIdx) => (
          <div
            key={itemIdx}
            className="bg-white border border-gray-200 rounded-lg p-5"
          >
            <h3 className="font-semibold text-gray-900 mb-3">
              {itemIdx + 1}. {item.name}
            </h3>
            <div className="space-y-2">
              {item.options.map((opt, optIdx) => (
                <label
                  key={optIdx}
                  className={`flex items-start gap-3 p-3 rounded-md border transition-colors cursor-pointer ${
                    selections[itemIdx] === opt.score
                      ? "border-red-300 bg-red-50"
                      : "border-gray-100 hover:bg-gray-50"
                  } ${locked ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  <input
                    type="radio"
                    name={`score_${itemIdx}`}
                    checked={selections[itemIdx] === opt.score}
                    onChange={() => handleSelect(itemIdx, opt.score)}
                    disabled={locked}
                    className="mt-0.5 accent-red-600"
                  />
                  <div className="flex-1">
                    <span className="text-red-600 font-bold mr-2">
                      {opt.score} 分
                    </span>
                    <span className="text-sm text-gray-600">
                      {opt.description}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom section */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          板块小计:{" "}
          <span className="text-red-600 font-bold text-lg">
            {subtotal.toFixed(1)}
          </span>{" "}
          / {data.board.max_score} 分
        </div>
        <button
          onClick={handleSubmit}
          disabled={locked || submitting || !allSelected}
          className="px-6 py-2.5 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {submitting ? "提交中..." : "提交评分"}
        </button>
      </div>
    </div>
  );
}

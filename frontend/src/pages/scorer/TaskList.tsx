import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../api/client";
import { getMockScorerTasks } from "../../api/mock";

interface Task {
  work_id: string;
  work_number: string;
  contestant_name: string;
  status: "unreviewed" | "reviewed" | "locked";
}

interface ScoringTasksResponse {
  scorer_role: string;
  board_name: string;
  max_score: number;
  tasks: Task[];
}

const roleNames: Record<string, string> = {
  scorer_a: "A-品牌与活动规范",
  scorer_b: "B-视觉设计表现",
  scorer_c: "C-陈列专业度",
  scorer_d: "D-执行与细节",
};

const statusConfig: Record<string, { label: string; className: string }> = {
  unreviewed: { label: "未评", className: "bg-amber-50 text-amber-700" },
  reviewed: { label: "已评", className: "bg-green-50 text-green-700" },
  locked: { label: "已锁定", className: "bg-gray-100 text-gray-500" },
};

const isMockMode = () => sessionStorage.getItem("mock_mode") === "1";

export default function TaskList() {
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState<ScoringTasksResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      if (isMockMode()) {
        const role = sessionStorage.getItem("admin_role") || "scorer_a";
        setData(getMockScorerTasks(role) as ScoringTasksResponse);
        setLoading(false);
        return;
      }
      const res = await api.get("/api/admin/scoring/tasks");
      setData(res.data);
    } catch {
      const role = sessionStorage.getItem("admin_role") || "scorer_a";
      setData(getMockScorerTasks(role) as ScoringTasksResponse);
    } finally {
      setLoading(false);
    }
  }, [location.state?.refresh]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleCardClick = (task: Task) => {
    if (task.status === "locked") return;
    navigate(`/admin/scoring/${task.work_id}`);
  };

  if (loading) {
    return (
      <div>
        <div className="bg-slate-800 text-white rounded-lg px-6 py-4 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">评分系统</h2>
            {isMockMode() && <span className="px-2 py-0.5 bg-amber-500 text-white text-xs rounded-full">演示</span>}
          </div>
        </div>
        <p className="text-gray-500 text-sm">加载中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="bg-slate-800 text-white rounded-lg px-6 py-4 mb-6"><h2 className="text-lg font-bold">评分系统</h2></div>
        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md">{error}</div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div>
      <div className="bg-slate-800 text-white rounded-lg px-6 py-4 mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">评分系统</h2>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-slate-300">{roleNames[data.scorer_role] || data.scorer_role}</span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-300">{data.board_name}（满分 {data.max_score} 分）</span>
          </div>
        </div>
      </div>

      {data.tasks.length === 0 ? (
        <p className="text-gray-500 text-sm">暂无评分任务</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.tasks.map((task) => {
            const isLocked = task.status === "locked";
            const cfg = statusConfig[task.status];
            return (
              <div
                key={task.work_id}
                onClick={() => handleCardClick(task)}
                className={`bg-white border border-gray-200 rounded-lg p-4 transition-shadow ${
                  isLocked ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:shadow-md"
                }`}
              >
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l1.409 1.409M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-gray-900">{task.work_number}</span>
                      <span className={`rounded px-2 py-0.5 text-xs font-semibold ${cfg?.className || ""}`}>{cfg?.label || task.status}</span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{task.contestant_name}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

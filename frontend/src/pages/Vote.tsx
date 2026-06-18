import { useState, useEffect } from "react";
import { ThumbsUp } from "lucide-react";
import Banner from "../components/Banner";
import WorkCard from "../components/WorkCard";
import PhoneModal from "../components/PhoneModal";
import { useVoteStatus } from "../hooks/useVoteStatus";
import api from "../api/client";

interface Work {
  id: string;
  work_number: string;
  name_masked: string;
  images: string[];
  vote_count: number;
}

export default function Vote() {
  const { status, message, loading: statusLoading } = useVoteStatus();
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [votingWorkId, setVotingWorkId] = useState<string | null>(null);
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    api
      .get("/api/works", { params: { size: 50 } })
      .then((res) => {
        setWorks(res.data.data || []);
      })
      .catch(() => setWorks([]))
      .finally(() => setLoading(false));
  }, []);

  const handleVoteSuccess = (workId: string) => {
    setVotedIds((prev) => new Set(prev).add(workId));
    setWorks((prev) =>
      prev.map((w) => (w.id === workId ? { ...w, vote_count: w.vote_count + 1 } : w))
    );
    setVotingWorkId(null);
  };

  const statusLabel = () => {
    switch (status) {
      case "open":
        return { text: "投票进行中", color: "bg-green-100 text-green-700" };
      case "not_started":
        return { text: "投票未开始", color: "bg-amber-100 text-amber-700" };
      case "closed":
        return { text: "投票已结束", color: "bg-gray-100 text-gray-600" };
    }
  };

  const badge = statusLabel();

  return (
    <>
      <Banner icon={ThumbsUp} title="人气投票" subtitle="为您喜爱的作品投上宝贵一票" />

      <div className="max-w-6xl mx-auto px-5 py-8">
        {/* Status Bar */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">投票通道状态：</span>
            {!statusLoading && (
              <span className={`rounded-full px-3 py-1 text-sm font-semibold ${badge.color}`}>
                {badge.text}
              </span>
            )}
            {statusLoading && <span className="text-sm text-gray-400">检测中...</span>}
          </div>
          {message && <span className="text-sm text-gray-500">{message}</span>}
        </div>

        {loading && (
          <div className="text-center py-16 text-gray-400">
            <p>加载中...</p>
          </div>
        )}

        {!loading && works.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p>暂无可投票的作品</p>
          </div>
        )}

        {!loading && works.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {works.map((work) => (
              <WorkCard
                key={work.id}
                work_number={work.work_number}
                name_masked={work.name_masked}
                images={work.images}
                vote_count={work.vote_count}
                action={
                  status === "open" ? (
                    votedIds.has(work.id) ? (
                      <span className="bg-green-100 text-green-700 rounded-md px-4 py-2 text-sm font-semibold">
                        ✓ 已投票
                      </span>
                    ) : (
                      <button
                        onClick={() => setVotingWorkId(work.id)}
                        className="bg-red-600 text-white rounded-md px-4 py-2 text-sm font-semibold hover:bg-red-800 transition-colors"
                      >
                        投票
                      </button>
                    )
                  ) : (
                    <span className="bg-gray-100 text-gray-500 rounded-md px-4 py-2 text-sm font-semibold">
                      已结束
                    </span>
                  )
                }
              />
            ))}
          </div>
        )}
      </div>

      {votingWorkId !== null && (
        <PhoneModal
          workId={votingWorkId}
          onClose={() => setVotingWorkId(null)}
          onSuccess={() => handleVoteSuccess(votingWorkId)}
        />
      )}
    </>
  );
}

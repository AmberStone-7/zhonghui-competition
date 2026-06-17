import { useState, useEffect } from "react";
import Banner from "../components/Banner";
import PhoneModal from "../components/PhoneModal";
import { useVoteStatus } from "../hooks/useVoteStatus";
import api from "../api/client";

interface Work {
  id: number;
  work_number: string;
  name_masked: string;
  images: string[];
  vote_count: number;
}

export default function Vote() {
  const { status, message, loading: statusLoading } = useVoteStatus();
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [votingWorkId, setVotingWorkId] = useState<number | null>(null);
  const [votedIds, setVotedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    api
      .get("/api/works", { params: { size: 50 } })
      .then((res) => setWorks(res.data.items || res.data.works || []))
      .catch(() => setWorks([]))
      .finally(() => setLoading(false));
  }, []);

  const handleVoteSuccess = (workId: number) => {
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
      <Banner icon="🗳️" title="人气投票" subtitle="为您喜爱的作品投上宝贵一票" />

      <div className="max-w-6xl mx-auto px-5 py-8">
        {/* Status Bar */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
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

        {/* Loading */}
        {loading && (
          <div className="text-center py-16 text-gray-400">
            <p>加载中...</p>
          </div>
        )}

        {/* Empty */}
        {!loading && works.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">🔍</p>
            <p>暂无可投票的作品</p>
          </div>
        )}

        {/* Grid */}
        {!loading && works.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {works.map((work) => (
              <div
                key={work.id}
                className="bg-white rounded-2xl overflow-hidden border border-gray-200 transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-5xl relative">
                  {work.images.length > 0 ? (
                    <img src={work.images[0]} alt={work.work_number} className="w-full h-full object-cover" />
                  ) : (
                    "🖼️"
                  )}
                  <span className="absolute top-3 left-3 bg-black/60 text-white px-2.5 py-1 rounded-md text-xs font-semibold">
                    {work.work_number}
                  </span>
                  <span className="absolute top-3 right-3 bg-black/60 text-white px-2.5 py-1 rounded-md text-xs">
                    {work.vote_count} 票
                  </span>
                </div>
                <div className="p-4 flex justify-between items-center">
                  <span className="font-semibold">{work.name_masked}</span>
                  {status === "open" ? (
                    votedIds.has(work.id) ? (
                      <span className="bg-green-100 text-green-700 rounded-lg px-4 py-2 text-sm font-semibold">
                        ✓ 已投票
                      </span>
                    ) : (
                      <button
                        onClick={() => setVotingWorkId(work.id)}
                        className="bg-red-600 text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-red-800 transition-colors"
                      >
                        投票
                      </button>
                    )
                  ) : (
                    <span className="bg-gray-100 text-gray-500 rounded-lg px-4 py-2 text-sm font-semibold cursor-not-allowed">
                      投票
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Phone Modal */}
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

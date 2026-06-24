import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import api from "../api/client";
import PhoneModal from "../components/PhoneModal";

interface Work {
  id: string;
  work_number: string;
  name_masked: string;
  images: string[];
  vote_count: number;
}

export default function Vote() {
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [votingWorkId, setVotingWorkId] = useState<string | null>(null);
  const [voteSuccess, setVoteSuccess] = useState<string | null>(null);
  const [channelStatus, setChannelStatus] = useState<string>("closed");
  const size = 8;

  useEffect(() => {
    api.get("/api/vote/status").then((res) => {
      setChannelStatus(res.data.channel_status || "closed");
    }).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    api
      .get("/api/works", { params: { sort: "votes", page, size } })
      .then((res) => {
        setWorks(res.data.data || []);
        setTotal(res.data.total || 0);
      })
      .catch(() => setWorks([]))
      .finally(() => setLoading(false));
  }, [page]);

  const totalPages = Math.ceil(total / size);
  const isOpen = channelStatus === "open";

  return (
    <div className="h5-page">
      {/* === Mobile === */}
      <div className="md:hidden">
        <div className="h5-hero min-h-[30vh] flex items-center justify-center">
          <div className="text-center mt-8">
            <h1 className="text-2xl font-bold text-white">人气投票</h1>
            <p className="text-white/60 text-sm mt-1">为您喜欢的作品投上一票</p>
          </div>
        </div>

        <div className="-mt-6 relative z-10 px-4 pb-8">
          <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
            {/* Status Bar */}
            <div className="flex items-center gap-2">
              <span className="text-[13px] text-white/0 hidden">投票通道状态：</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                isOpen ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}>
                {isOpen ? "投票进行中" : channelStatus === "not_started" ? "投票未开始" : "投票已关闭"}
              </span>
            </div>

            {loading && <p className="text-center py-12 text-text-muted">加载中...</p>}
            {!loading && works.length === 0 && (
              <div className="text-center py-12 text-text-muted">
                <Search className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                <p>暂无作品数据</p>
              </div>
            )}
            {!loading && works.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {works.map((w) => (
                  <div key={w.id} className="bg-white/5 rounded-xl overflow-hidden border border-gray-100">
                    <div className="aspect-square bg-gray-200 relative">
                      {w.images?.[0] ? (
                        <img src={w.images[0]} alt={w.work_number} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">暂无图片</div>
                      )}
                      <div className="absolute top-1 left-1 bg-black/50 text-white/80 text-[10px] px-1.5 py-0.5 rounded">
                        {w.work_number}
                      </div>
                      <div className="absolute top-1 right-1 bg-black/50 text-white/80 text-[10px] px-1.5 py-0.5 rounded">
                        {w.vote_count}票
                      </div>
                    </div>
                    <div className="p-2 flex items-center justify-between">
                      <span className="text-[12px] text-text-primary font-medium">{w.name_masked}</span>
                      <button
                        onClick={() => isOpen && setVotingWorkId(w.id)}
                        disabled={!isOpen}
                        className="bg-brand-gold text-white text-[12px] font-bold px-3 py-1 rounded-lg hover:bg-amber-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        投票
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 pt-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-4 py-2 text-sm text-text-placeholder hover:text-text-secondary disabled:opacity-30">上一页</button>
                <span className="text-sm text-text-secondary font-medium">{page} / {totalPages}</span>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="px-4 py-2 text-sm text-text-placeholder hover:text-text-secondary disabled:opacity-30">下一页</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* === PC === */}
      <div className="hidden md:block">
        <div className="relative bg-gradient-to-b from-[#1a0a0a] via-[#6B1A1A] to-[#a02020] h-[240px] flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white">人气投票</h1>
            <p className="text-white/70 mt-2">为您喜欢的橱窗作品投上宝贵一票</p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 -mt-8 relative z-10 pb-12">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            {/* Status */}
            <div className="flex items-center gap-3 mb-5">
              <span className="text-sm text-text-light">投票通道状态：</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                isOpen ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}>
                {isOpen ? "投票进行中" : channelStatus === "not_started" ? "投票未开始" : "投票已关闭"}
              </span>
            </div>

            {loading && <p className="text-center py-16 text-text-muted">加载中...</p>}
            {!loading && works.length === 0 && (
              <div className="text-center py-16 text-text-muted">暂无作品数据</div>
            )}
            {!loading && works.length > 0 && (
              <div className="grid grid-cols-4 gap-3">
                {works.map((w) => (
                  <div key={w.id} className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="aspect-square bg-gray-200 relative">
                      {w.images?.[0] ? (
                        <img src={w.images[0]} alt={w.work_number} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">暂无图片</div>
                      )}
                      <div className="absolute top-2 left-2 bg-black/50 text-white/80 text-xs px-2 py-0.5 rounded">{w.work_number}</div>
                      <div className="absolute top-2 right-2 bg-black/50 text-white/80 text-xs px-2 py-0.5 rounded">{w.vote_count}票</div>
                    </div>
                    <div className="p-3 flex items-center justify-between">
                      <span className="text-sm text-text-primary font-medium">{w.name_masked}</span>
                      <button
                        onClick={() => isOpen && setVotingWorkId(w.id)}
                        disabled={!isOpen}
                        className="bg-brand-red text-white text-[13px] font-bold px-4 py-1.5 rounded-lg hover:bg-red-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        投票
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-6">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-4 py-2 text-sm text-text-placeholder hover:text-text-secondary disabled:opacity-30">上一页</button>
                <span className="text-sm text-text-secondary font-medium">{page} / {totalPages}</span>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="px-4 py-2 text-sm text-text-placeholder hover:text-text-secondary disabled:opacity-30">下一页</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Phone Modal */}
      {votingWorkId && (
        <PhoneModal
          workId={votingWorkId}
          onClose={() => setVotingWorkId(null)}
          onSuccess={() => {
            setVotingWorkId(null);
            setVoteSuccess("投票成功！");
            setTimeout(() => {
              setVoteSuccess(null);
              window.location.reload();
            }, 1500);
          }}
        />
      )}

      {/* Success Toast */}
      {voteSuccess && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg z-[60] text-sm font-bold">
          {voteSuccess}
        </div>
      )}
    </div>
  );
}

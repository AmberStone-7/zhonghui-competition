import type { Work } from "../types";
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import api from "../api/client";
import { getMockWorks, getMockVoteStatus } from "../api/mock";
import PhoneModal from "../components/PhoneModal";
import MobilePrototypeHero from "../components/MobilePrototypeHero";
import PcBannerImage from "../components/PcBannerImage";
import { useLanguage } from "../hooks/useLanguage";

const BASE = import.meta.env.BASE_URL;

export default function Vote() {
  const { t } = useLanguage();
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [votingWorkId, setVotingWorkId] = useState<string | null>(null);
  const [voteSuccess, setVoteSuccess] = useState<string | null>(null);
  const [channelStatus, setChannelStatus] = useState<string>("closed");
  const [usingMock, setUsingMock] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const size = 8;

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await api.get("/api/vote/status");
        setChannelStatus(res.data.channel_status || "closed");
        setUsingMock(false);
      } catch {
        const mock = getMockVoteStatus();
        setChannelStatus(mock.channel_status);
        setUsingMock(true);
      }
    };
    fetchStatus();
  }, []);

  useEffect(() => {
    setLoading(true);
    const fetchWorks = async () => {
      try {
        const res = await api.get("/api/works", { params: { sort: "votes", page, size } });
        setWorks(res.data.data || []);
        setTotal(res.data.total || 0);
      } catch {
        const mock = getMockWorks({ sort: "votes", page, size });
        setWorks(mock.data);
        setTotal(mock.total);
        setUsingMock(true);
      } finally {
        setLoading(false);
      }
    };
    fetchWorks();
  }, [page, refreshKey]);

  const totalPages = Math.ceil(total / size);
  const isOpen = channelStatus === "open";
  const statusText = isOpen ? t["vote.open"] : channelStatus === "not_started" ? t["vote.notStarted"] : t["vote.closed"];

  return (
    <div className="h5-page">
      {/* Mobile */}
      <div className="md:hidden min-h-screen" style={{ backgroundImage: `url(${BASE}assets/bg-h5-video.png)`, backgroundSize: 'cover', backgroundPosition: 'center top' }}>
        <MobilePrototypeHero />
        <div className="relative z-10 px-4 pb-8 pt-[12px]">
          <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
            {usingMock && <p className="text-center text-[11px] text-amber-600">{t["vote.mock"]}</p>}
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${isOpen ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {statusText}
              </span>
            </div>
            {loading && <p className="text-center py-12 text-text-muted">{t["showcase.loading"]}</p>}
            {!loading && works.length === 0 && (
              <div className="text-center py-12 text-text-muted"><Search className="w-10 h-10 mx-auto mb-3 text-gray-200" /><p>{t["vote.noData"]}</p></div>
            )}
            {!loading && works.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {works.map((w) => (
                  <div key={w.id} className="bg-white/5 rounded-xl overflow-hidden border border-gray-100">
                    <div className="aspect-square bg-gray-200 relative">
                      {w.images?.[0] ? <img src={w.images[0]} alt={w.work_number} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">{t["vote.noImage"]}</div>}
                      <div className="absolute top-1 left-1 bg-black/50 text-white/80 text-[10px] px-1.5 py-0.5 rounded">{w.work_number}</div>
                      <div className="absolute top-1 right-1 bg-black/50 text-white/80 text-[10px] px-1.5 py-0.5 rounded">{w.vote_count}{t["vote.votes"]}</div>
                    </div>
                    <div className="p-2 flex items-center justify-between">
                      <span className="text-[12px] text-text-primary font-medium">{w.name_masked}</span>
                      <button onClick={() => isOpen && setVotingWorkId(w.id)} disabled={!isOpen} className="bg-brand-gold text-white text-[12px] font-bold px-3 py-1 rounded-lg hover:bg-amber-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">{t["vote.vote"]}</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 pt-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 text-sm text-text-placeholder hover:text-text-secondary disabled:opacity-30">{t["vote.prev"]}</button>
                <span className="text-sm text-text-secondary font-medium">{page} / {totalPages}</span>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 text-sm text-text-placeholder hover:text-text-secondary disabled:opacity-30">{t["vote.next"]}</button>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* PC */}
      <div className="hidden md:block">
        <PcBannerImage />
        <div className="max-w-[1104px] mx-auto px-6 mt-8 relative z-10 pb-12">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            {usingMock && <p className="text-center text-xs text-amber-600 mb-3">{t["vote.mock"]}</p>}
            <div className="flex items-center gap-3 mb-5">
              <span className="text-sm text-text-light">{t["vote.channelStatus"]}</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${isOpen ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{statusText}</span>
            </div>
            {loading && <p className="text-center py-16 text-text-muted">{t["showcase.loading"]}</p>}
            {!loading && works.length === 0 && <div className="text-center py-16 text-text-muted">{t["vote.noData"]}</div>}
            {!loading && works.length > 0 && (
              <div className="grid grid-cols-4 gap-3">
                {works.map((w) => (
                  <div key={w.id} className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="aspect-square bg-gray-200 relative">
                      {w.images?.[0] ? <img src={w.images[0]} alt={w.work_number} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400">{t["vote.noImage"]}</div>}
                      <div className="absolute top-2 left-2 bg-black/50 text-white/80 text-xs px-2 py-0.5 rounded">{w.work_number}</div>
                      <div className="absolute top-2 right-2 bg-black/50 text-white/80 text-xs px-2 py-0.5 rounded">{w.vote_count}{t["vote.votes"]}</div>
                    </div>
                    <div className="p-3 flex items-center justify-between">
                      <span className="text-sm text-text-primary font-medium">{w.name_masked}</span>
                      <button onClick={() => isOpen && setVotingWorkId(w.id)} disabled={!isOpen} className="bg-brand-red text-white text-[13px] font-bold px-4 py-1.5 rounded-lg hover:bg-red-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">{t["vote.vote"]}</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-6">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 text-sm text-text-placeholder hover:text-text-secondary disabled:opacity-30">{t["vote.prev"]}</button>
                <span className="text-sm text-text-secondary font-medium">{page} / {totalPages}</span>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 text-sm text-text-placeholder hover:text-text-secondary disabled:opacity-30">{t["vote.next"]}</button>
              </div>
            )}
          </div>
        </div>
      </div>
      {votingWorkId && <PhoneModal workId={votingWorkId} onClose={() => setVotingWorkId(null)} onSuccess={() => { setVotingWorkId(null); setVoteSuccess("投票成功！"); setTimeout(() => { setVoteSuccess(null); }, 2000); setPage(1); setRefreshKey(k => k + 1); }} />}
      {voteSuccess && <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg z-[60] text-sm font-bold">{voteSuccess}</div>}
    </div>
  );
}

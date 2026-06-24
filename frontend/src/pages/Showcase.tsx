import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import api from "../api/client";
import WorkCard from "../components/WorkCard";

interface Work {
  id: string;
  work_number: string;
  name_masked: string;
  images: string[];
  vote_count: number;
}

export default function Showcase() {
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("number");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const size = 8;

  useEffect(() => {
    setLoading(true);
    api
      .get("/api/works", { params: { search, sort, page, size } })
      .then((res) => {
        setWorks(res.data.data || []);
        setTotal(res.data.total || 0);
      })
      .catch(() => setWorks([]))
      .finally(() => setLoading(false));
  }, [search, sort, page]);

  const totalPages = Math.ceil(total / size);

  return (
    <div className="h5-page">
      {/* === Mobile === */}
      <div className="md:hidden">
        <div className="h5-hero min-h-[30vh] flex items-center justify-center">
          <div className="text-center mt-8">
            <h1 className="text-2xl font-bold text-white">作品展示</h1>
            <p className="text-white/60 text-sm mt-1">浏览所有参赛橱窗作品</p>
          </div>
        </div>

        <div className="-mt-6 relative z-10 px-4 pb-8">
          <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
            {/* Search */}
            <div className="relative">
              <input
                type="text" value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="搜索作品名称或编号..."
                className="w-full h-12 pl-4 pr-10 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-brand-red focus:ring-2 focus:ring-red-50 outline-none placeholder:text-[#9CA3AF]"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
            </div>

            {/* Sort */}
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              className="w-full h-10 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm text-text-light outline-none"
            >
              <option value="number">按编号排序</option>
              <option value="latest">按最新排序</option>
              <option value="votes">按票数排序</option>
            </select>

            {/* Content */}
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
                  <WorkCard key={w.id} work_number={w.work_number} name_masked={w.name_masked} images={w.images} vote_count={w.vote_count} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 pt-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-4 py-2 text-sm text-text-placeholder hover:text-text-secondary disabled:opacity-30">
                  上一页
                </button>
                <span className="text-sm text-text-secondary font-medium">{page} / {totalPages}</span>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="px-4 py-2 text-sm text-text-placeholder hover:text-text-secondary disabled:opacity-30">
                  下一页
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* === PC === */}
      <div className="hidden md:block">
        <div className="relative bg-gradient-to-b from-[#1a0a0a] via-[#6B1A1A] to-[#a02020] h-[300px] flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white">作品展示</h1>
            <p className="text-white/70 mt-2">浏览所有参赛作品，为您喜爱的作品投票</p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 -mt-8 relative z-10 pb-12">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            {/* Search & Sort */}
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1">
                <input
                  type="text" value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder="搜索作品名称或编号..."
                  className="w-full h-11 pl-4 pr-10 border border-gray-200 rounded-lg text-sm focus:border-brand-red focus:ring-2 focus:ring-red-50 outline-none placeholder:text-[#9CA3AF]"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
              </div>
              <select
                value={sort}
                onChange={(e) => { setSort(e.target.value); setPage(1); }}
                className="h-11 px-4 border border-gray-200 rounded-lg text-sm text-text-light outline-none"
              >
                <option value="number">按编号排序</option>
                <option value="latest">按最新排序</option>
                <option value="votes">按票数排序</option>
              </select>
            </div>

            {loading && <p className="text-center py-16 text-text-muted">加载中...</p>}
            {!loading && works.length === 0 && (
              <div className="text-center py-16 text-text-muted">
                <Search className="w-12 h-12 mx-auto mb-3 text-gray-200" />
                <p>暂无作品数据</p>
              </div>
            )}
            {!loading && works.length > 0 && (
              <div className="grid grid-cols-4 gap-3">
                {works.map((w) => (
                  <WorkCard key={w.id} work_number={w.work_number} name_masked={w.name_masked} images={w.images} vote_count={w.vote_count} />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-6">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-4 py-2 text-sm text-text-placeholder hover:text-text-secondary disabled:opacity-30">
                  上一页
                </button>
                <span className="text-sm text-text-secondary font-medium">{page} / {totalPages}</span>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="px-4 py-2 text-sm text-text-placeholder hover:text-text-secondary disabled:opacity-30">
                  下一页
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

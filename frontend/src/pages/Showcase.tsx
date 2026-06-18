import { useState, useEffect } from "react";
import { Image, Search } from "lucide-react";
import Banner from "../components/Banner";
import WorkCard from "../components/WorkCard";
import api from "../api/client";

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
  const size = 12;

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
    <>
      <Banner icon={Image} title="作品展示" subtitle="浏览所有参赛作品，为您喜爱的作品投票" />

      <div className="max-w-6xl mx-auto px-5 py-8">
        {/* Search & Sort */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="搜索作品编号或参赛者..."
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-none transition-all"
          />
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-none bg-white"
          >
            <option value="number">按编号排序</option>
            <option value="latest">按最新排序</option>
            <option value="votes">按票数排序</option>
          </select>
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
            <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>暂无作品数据</p>
          </div>
        )}

        {/* Grid */}
        {!loading && works.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {works.map((work) => (
              <WorkCard
                key={work.id}
                work_number={work.work_number}
                name_masked={work.name_masked}
                images={work.images}
                vote_count={work.vote_count}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              上一页
            </button>
            <span className="px-4 py-2 text-sm text-gray-500">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              下一页
            </button>
          </div>
        )}
      </div>
    </>
  );
}

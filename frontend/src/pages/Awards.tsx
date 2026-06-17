import { useState, useEffect } from "react";
import Banner from "../components/Banner";
import api from "../api/client";

interface Award {
  name: string;
  count: string;
  prize: string;
  description: string;
}

interface AwardCategory {
  name: string;
  icon: string;
  awards: Award[];
}

interface AwardsContent {
  categories: AwardCategory[];
}

const defaultAwards: AwardsContent = {
  categories: [
    {
      name: "专业评审类",
      icon: "🎨",
      awards: [
        { name: "金奖", count: "1 名", prize: "价值 5000 元奖品", description: "专业评审综合评分第一名" },
        { name: "银奖", count: "2 名", prize: "价值 3000 元奖品", description: "专业评审综合评分第二、三名" },
        { name: "铜奖", count: "3 名", prize: "价值 1000 元奖品", description: "专业评审综合评分第四至六名" },
      ],
    },
    {
      name: "人气投票类",
      icon: "❤️",
      awards: [
        { name: "最佳人气奖", count: "1 名", prize: "价值 3000 元奖品", description: "获得票数最多的作品" },
        { name: "人气之星", count: "3 名", prize: "价值 1000 元奖品", description: "票数排名第二至四名" },
      ],
    },
    {
      name: "特别奖项",
      icon: "⭐",
      awards: [
        { name: "最佳创意奖", count: "1 名", prize: "价值 2000 元奖品", description: "最具创意的橱窗设计" },
        { name: "参与奖", count: "若干", prize: "精美纪念品", description: "所有成功报名的参赛者均可获得" },
      ],
    },
  ],
};

export default function Awards() {
  const [data, setData] = useState<AwardsContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/api/config/awards_content")
      .then((res) => {
        if (res.data && res.data.categories && res.data.categories.length > 0) {
          setData(res.data);
        } else {
          setData(defaultAwards);
        }
      })
      .catch(() => setData(defaultAwards))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Banner icon="🏆" title="赛事奖项" subtitle="丰富奖品等您来拿" />

      <div className="max-w-4xl mx-auto px-5 py-8">
        {loading && (
          <div className="text-center py-16 text-gray-400">
            <p>加载中...</p>
          </div>
        )}

        {!loading && data && (
          <div className="space-y-8">
            {data.categories.map((category, ci) => (
              <div key={ci}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{category.icon}</span>
                  <h2 className="text-lg font-bold">{category.name}</h2>
                </div>
                <div className="grid gap-4">
                  {category.awards.map((award, ai) => (
                    <div
                      key={ai}
                      className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col sm:flex-row sm:items-center gap-4"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-bold text-base">{award.name}</h3>
                          <span className="bg-gray-100 text-gray-600 rounded-full px-3 py-1 text-xs font-semibold">
                            {award.count}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">{award.description}</p>
                      </div>
                      <div className="text-red-600 font-bold text-sm sm:text-right whitespace-nowrap">
                        {award.prize}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

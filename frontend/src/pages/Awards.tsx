const sections = [
  {
    title: "专业评审类",
    items: [
      { name: "综合评分第一名", prize: "¥5000奖品" },
      { name: "综合评分第二、三名", prize: "¥3000奖品" },
      { name: "综合评分第四至六名", prize: "¥1000奖品" },
    ],
  },
  {
    title: "人气投票类",
    items: [
      { name: "获票数最多的作品", prize: "¥3000奖品" },
      { name: "票数第二至四名", prize: "¥1000奖品" },
    ],
  },
  {
    title: "特别奖项",
    items: [
      { name: "最具创意的橱窗设计", prize: "¥2000奖品" },
      { name: "所有成功报名者均可获得", prize: "精美纪念品" },
    ],
  },
];

export default function Awards() {
  return (
    <div className="h5-page">
      {/* === Mobile === */}
      <div className="md:hidden">
        <div className="h5-hero min-h-[35vh] flex items-center justify-center">
          <div className="text-center mt-8">
            <h1 className="text-2xl font-bold text-white">赛事奖项</h1>
            <p className="text-white/60 text-sm mt-1">丰厚奖品等你来拿</p>
          </div>
        </div>

        <div className="-mt-6 relative z-10 px-4 pb-8 space-y-6">
          {sections.map((sec, si) => (
            <div key={si}>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-0.5 w-6 bg-[#F5C26B]" />
                <h2 className="text-white font-bold text-base">{sec.title}</h2>
              </div>
              <div className="space-y-2">
                {sec.items.map((item, ii) => (
                  <div key={ii} className="bg-white rounded-xl px-4 py-3 flex items-center justify-between">
                    <span className="text-[#111111] text-sm font-medium">{item.name}</span>
                    <span className="bg-[#F5D68A] text-[#8A1C14] text-sm font-bold px-4 py-1.5 rounded-lg">{item.prize}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* === PC === */}
      <div className="hidden md:block">
        <div className="relative bg-gradient-to-b from-[#1a0a0a] via-[#6B1A1A] to-[#a02020] h-[300px] flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white">赛事奖项</h1>
            <p className="text-white/70 mt-2">丰厚奖品，等你来拿</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 -mt-8 relative z-10 pb-12">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="grid grid-cols-3 gap-8">
              {sections.map((sec, si) => (
                <div key={si}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-0.5 w-6 bg-[#F5C26B]" />
                    <h2 className="font-bold text-lg text-[#1E293B]">{sec.title}</h2>
                  </div>
                  <div className="space-y-3">
                    {sec.items.map((item, ii) => (
                      <div key={ii} className="border border-gray-100 rounded-xl px-4 py-3 flex items-center justify-between hover:shadow-sm transition-shadow">
                        <span className="text-[#111111] text-sm">{item.name}</span>
                        <span className="bg-[#F5D68A] text-[#8A1C14] text-sm font-bold px-3 py-1 rounded-lg shrink-0">{item.prize}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

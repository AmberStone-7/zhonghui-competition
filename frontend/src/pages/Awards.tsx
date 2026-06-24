import MobilePrototypeHero from "../components/MobilePrototypeHero";
import PcBannerImage from "../components/PcBannerImage";

const BASE = import.meta.env.BASE_URL;
const sections = [
  { title: "专业评审类", items: [{ name: "综合评分第一名", prize: "¥5000奖品" }, { name: "综合评分第二、三名", prize: "¥3000奖品" }, { name: "综合评分第四至六名", prize: "¥1000奖品" }] },
  { title: "人气投票类", items: [{ name: "获票数最多的作品", prize: "¥3000奖品" }, { name: "票数第二至四名", prize: "¥1000奖品" }] },
  { title: "特别奖项", items: [{ name: "最具创意的橱窗设计", prize: "¥2000奖品" }, { name: "所有成功报名者均可获得", prize: "精美纪念品" }] },
];

export default function Awards() {
  return (
    <div className="h5-page">
      {/* === Mobile === */}
      <div className="md:hidden min-h-screen" style={{ backgroundImage: `url(${BASE}assets/bg-h5-video.png)`, backgroundSize: 'cover', backgroundPosition: 'center top' }}>
        <MobilePrototypeHero />
        <div className="relative z-10 px-4 pb-8 pt-[12px] space-y-6">
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
        <PcBannerImage />
        <div className="max-w-[1104px] mx-auto px-6 mt-8 relative z-10 pb-12">
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

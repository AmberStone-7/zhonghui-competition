import MobilePrototypeHero from "../components/MobilePrototypeHero";
import PcBannerImage from "../components/PcBannerImage";
import { useLanguage } from "../hooks/useLanguage";

const BASE = import.meta.env.BASE_URL;

export default function Rules() {
  const { t } = useLanguage();

  const timeline = [
    { label: "活动报名", date: "2026.7.27 — 9.13" },
    { label: "后台评分", date: "2026.7.27 — 9.15" },
    { label: "人气投票", date: "2026.9.14 — 9.17" },
    { label: "结果公布", date: "2026.9.18" },
    { label: "礼品发放", date: "2026.10.1 起" },
  ];

  const rules = [
    { num: 1, title: t["rules.eligibility"], items: [t["rules.eligibility1"], t["rules.eligibility2"], t["rules.eligibility3"]] },
    { num: 2, title: t["rules.requirements"], items: [t["rules.requirements1"], t["rules.requirements2"], t["rules.requirements3"]] },
    { num: 3, title: t["rules.process"], items: [t["rules.process1"], t["rules.process2"], t["rules.process3"]] },
    { num: 4, title: "评分体系", items: [
      "A-品牌与活动规范（4分）：海报展示、产品占比、新品露出、品牌识别",
      "B-视觉设计表现（5分）：色彩搭配、创意表达、空间布局",
      "C-陈列专业度（4分）：产品分类、主推突出、信息清晰",
      "D-执行与细节（2分）：整洁度、灯光效果",
      "人气分（5分）：根据得票数排名换算",
      "总分 = A + B + C + D + 人气分 = 满分 20 分",
    ]},
    { num: 5, title: t["rules.voting"], items: [
      "同一手机号对同一作品仅可投票 1 次",
      "同一 IP 对同一作品仅可投票 1 次",
      "投票通道由管理员控制开启/关闭",
      "投票结果实时显示",
    ]},
  ];

  return (
    <div className="h5-page">
      {/* === Mobile === */}
      <div className="md:hidden min-h-screen" style={{ backgroundImage: `url(${BASE}assets/bg-h5-video.png)`, backgroundSize: 'cover', backgroundPosition: 'center top' }}>
        <MobilePrototypeHero />
        <div className="relative z-10 px-4 pb-8 pt-[12px] space-y-3">
          {/* Timeline */}
          <div className="bg-white/55 backdrop-blur-md rounded-xl p-4 shadow-sm">
            <p className="text-[#1E293B] font-bold text-[15px] mb-3">活动时间</p>
            <div className="space-y-2">
              {timeline.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-[#334155] text-[13px]">{item.label}</span>
                  <span className="text-[#8A1C14] text-[12px] font-medium">{item.date}</span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-gray-400 mt-2">* 以上时间均为西班牙当地时间</p>
          </div>

          {rules.map((r) => (
            <div key={r.num} className="bg-white/55 backdrop-blur-md rounded-xl p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-brand-red flex items-center justify-center shrink-0">
                  <span className="text-white text-[13px] font-bold">{r.num}</span>
                </div>
                <div>
                  <p className="text-[#1E293B] font-bold text-[15px] mb-1.5">{r.title}</p>
                  {r.items.map((item, i) => (
                    <p key={i} className="text-[#334155] text-[12px] leading-relaxed">· {item}</p>
                  ))}
                </div>
              </div>
            </div>
          ))}
          <div className="bg-[#FEF9E7] rounded-xl p-4">
            <p className="text-[#92400E] font-bold text-sm mb-1">{t["rules.note"]}</p>
            <p className="text-[#92400E] text-[12px] leading-relaxed">{t["rules.noteText"]}</p>
          </div>
        </div>
      </div>

      {/* === PC === */}
      <div className="hidden md:block">
        <PcBannerImage />
        <div className="max-w-[1104px] mx-auto px-6 mt-8 relative z-10 pb-12">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            {/* Timeline - PC */}
            <div className="mb-8 p-6 bg-gray-50 rounded-xl">
              <h2 className="text-lg font-bold text-[#1E293B] mb-4">活动时间</h2>
              <div className="flex gap-4">
                {timeline.map((item, i) => (
                  <div key={i} className="flex-1 bg-white rounded-lg p-4 text-center border border-gray-100">
                    <p className="text-xs text-gray-400 mb-1">{item.label}</p>
                    <p className="text-sm font-bold text-[#8A1C14]">{item.date}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-3">* 以上时间均为西班牙当地时间</p>
            </div>

            <h2 className="text-lg font-bold text-[#1E293B] mb-6 flex items-center gap-2">
              <span className="w-5 h-5 bg-brand-red rounded-full" /> {t["rules.title"]}
            </h2>
            <div className="grid grid-cols-2 gap-x-12 gap-y-5">
              {rules.map((r) => (
                <div key={r.num} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-red flex items-center justify-center shrink-0">
                    <span className="text-white text-sm font-bold">{r.num}</span>
                  </div>
                  <div>
                    <p className="font-bold text-[15px] text-[#1E293B] mb-1">{r.title}</p>
                    {r.items.map((item, i) => (
                      <p key={i} className="text-[#64748B] text-[12px] leading-relaxed">· {item}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-[#FEF9E7] rounded-lg p-4 mt-6">
              <p className="text-[#92400E] font-bold text-sm mb-1">{t["rules.note"]}</p>
              <p className="text-[#92400E] text-[12px]">{t["rules.noteText"]}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import MobilePrototypeHero from "../components/MobilePrototypeHero";
import PcBannerImage from "../components/PcBannerImage";
import { useLanguage } from "../hooks/useLanguage";

const BASE = import.meta.env.BASE_URL;

export default function Rules() {
  const { t } = useLanguage();

  const rules = [
    { num: 1, title: t["rules.eligibility"], items: [t["rules.eligibility1"], t["rules.eligibility2"], t["rules.eligibility3"]] },
    { num: 2, title: t["rules.requirements"], items: [t["rules.requirements1"], t["rules.requirements2"], t["rules.requirements3"]] },
    { num: 3, title: t["rules.process"], items: [t["rules.process1"], t["rules.process2"], t["rules.process3"]] },
    { num: 4, title: t["rules.judging"], items: [t["rules.judging1"], t["rules.judging2"], t["rules.judging3"]] },
    { num: 5, title: t["rules.voting"], items: [t["rules.voting1"], t["rules.voting2"], t["rules.voting3"]] },
  ];

  return (
    <div className="h5-page">
      {/* === Mobile === */}
      <div className="md:hidden min-h-screen" style={{ backgroundImage: `url(${BASE}assets/bg-h5-video.png)`, backgroundSize: 'cover', backgroundPosition: 'center top' }}>
        <MobilePrototypeHero />
        <div className="relative z-10 px-4 pb-8 pt-[12px] space-y-3">
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

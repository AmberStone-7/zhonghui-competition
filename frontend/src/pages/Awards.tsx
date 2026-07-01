import MobilePrototypeHero from "../components/MobilePrototypeHero";
import PcBannerImage from "../components/PcBannerImage";
import { useLanguage } from "../hooks/useLanguage";

const BASE = import.meta.env.BASE_URL;

type AwardItem = {
  name: string;
  prize: string;
  count: string;
  image: string;
};

type AwardSection = {
  title: string;
  items: AwardItem[];
};

function getPrizeImage(path: string) {
  return `${BASE}assets/prizes/${path}`;
}

function AwardCard({ item, mobile = false }: { item: AwardItem; mobile?: boolean }) {
  return (
    <div
      data-award-card="true"
      className={mobile
        ? "bg-white rounded-xl p-3.5 flex items-center gap-3 shadow-sm"
        : "border border-gray-100 rounded-xl p-4 flex items-center gap-4 bg-white min-h-[128px] hover:shadow-sm transition-shadow"
      }
    >
      <div className={mobile ? "w-20 h-20 rounded-lg overflow-hidden bg-[#F8F4EA] shrink-0" : "w-24 h-24 rounded-xl overflow-hidden bg-[#F8F4EA] shrink-0"}>
        <img src={item.image} alt={item.prize} className="w-full h-full object-cover" />
      </div>
      <div className="min-w-0 flex-1">
        <div className={mobile ? "flex items-center gap-2 mb-2 flex-wrap" : "flex items-center gap-2 mb-2 flex-wrap"}>
          <h3 className={mobile ? "text-[#111111] text-sm font-semibold" : "text-[#111111] text-base font-semibold"}>{item.name}</h3>
          {item.count && <span className="text-xs text-gray-400 shrink-0">{item.count}</span>}
        </div>
        <p className={mobile ? "text-[#8A1C14] text-sm font-bold leading-snug" : "text-[#8A1C14] text-sm font-bold leading-snug"}>{item.prize}</p>
      </div>
    </div>
  );
}

function LotteryTextCard({ mobile = false, desc, prize }: { mobile?: boolean; desc: string; prize: string }) {
  return (
    <div className={mobile ? "bg-white rounded-xl p-4 shadow-sm" : "rounded-xl border border-[#F3E7C8] bg-[#FFF8E8] p-6"}>
      <div className="space-y-2">
        <p className={mobile ? "text-[#334155] text-[13px] leading-relaxed" : "text-[#334155] text-sm leading-7"}>{desc}</p>
        <p className={mobile ? "text-[#8A1C14] text-sm font-bold leading-snug" : "text-[#8A1C14] text-base font-bold leading-7"}>{prize}</p>
      </div>
    </div>
  );
}

export default function Awards() {
  const { t } = useLanguage();

  const sections: AwardSection[] = [
    {
      title: t["awards.professional"],
      items: [
        { name: t["awards.professional1.name"], prize: t["awards.professional1.prize"], count: "1名", image: getPrizeImage("professional-first-real.png") },
        { name: t["awards.professional2.name"], prize: t["awards.professional2.prize"], count: "2名", image: getPrizeImage("professional-second-real.png") },
        { name: t["awards.professional3.name"], prize: t["awards.professional3.prize"], count: "3名", image: getPrizeImage("professional-third-real.png") },
      ],
    },
    {
      title: t["awards.popular"],
      items: [
        { name: t["awards.popular1.name"], prize: t["awards.popular1.prize"], count: "1名", image: getPrizeImage("popular-first-real.png") },
        { name: t["awards.popular2.name"], prize: t["awards.popular2.prize"], count: "1名", image: getPrizeImage("popular-second-real.png") },
        { name: t["awards.popular3.name"], prize: t["awards.popular3.prize"], count: "1名", image: getPrizeImage("popular-third-real.png") },
        { name: t["awards.popular4.name"], prize: t["awards.popular4.prize"], count: "48名", image: getPrizeImage("popular-rising-real.png") },
      ],
    },
    {
      title: t["awards.special"],
      items: [
        { name: t["awards.special1.name"], prize: t["awards.special1.prize"], count: "12名", image: getPrizeImage("special-creative-real.png") },
      ],
    },
    {
      title: t["awards.participation"],
      items: [
        { name: t["awards.special2.name"], prize: t["awards.special2.prize"], count: "", image: getPrizeImage("participation-100-real.png") },
        { name: t["awards.special3.name"], prize: t["awards.special3.prize"], count: "", image: getPrizeImage("participation-50-real.png") },
        { name: t["awards.special4.name"], prize: t["awards.special4.prize"], count: "", image: getPrizeImage("participation-10-real.png") },
      ],
    },
  ];

  const desktopSections = sections;

  return (
    <div className="h5-page">
      <div className="md:hidden min-h-screen" style={{ backgroundImage: `url(${BASE}assets/bg-h5-video.png)`, backgroundSize: "cover", backgroundPosition: "center top" }}>
        <MobilePrototypeHero />
        <div className="relative z-10 px-4 pb-8 pt-[12px] space-y-5">
          {sections.map((sec, si) => (
            <div key={si}>
              <div className="flex items-center gap-3 mb-2.5">
                <div className="h-0.5 w-6 bg-[#F5C26B]" />
                <h2 className="text-white font-bold text-base">{sec.title}</h2>
              </div>
              <div className="space-y-3">
                {sec.items.map((item, ii) => (
                  <AwardCard key={ii} item={item} mobile />
                ))}
              </div>
            </div>
          ))}

          <div>
            <div className="flex items-center gap-3 mb-2.5">
              <div className="h-0.5 w-6 bg-[#F5C26B]" />
              <h2 className="text-white font-bold text-base">{t["awards.lottery"]}</h2>
            </div>
            <LotteryTextCard mobile desc={t["awards.lotteryDesc"]} prize={t["awards.lotteryPrize"]} />
          </div>
        </div>
      </div>

      <div className="hidden md:block">
        <PcBannerImage />
        <div className="max-w-[1104px] mx-auto px-6 mt-8 relative z-10 pb-12">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="grid grid-cols-2 gap-x-8 gap-y-8">
              {desktopSections.map((section, rowIndex) => (
                <div key={rowIndex} data-awards-row="true" data-testid="awards-section" data-section-title={section.title}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-0.5 w-6 bg-[#F5C26B]" />
                    <h2 className="font-bold text-lg text-[#1E293B]">{section.title}</h2>
                  </div>
                  <div className="space-y-4">
                    {section.items.map((item, ii) => (
                      <AwardCard key={ii} item={item} />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 border-t border-gray-100 pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-0.5 w-6 bg-[#F5C26B]" />
                <h2 className="font-bold text-lg text-[#1E293B]">{t["awards.lottery"]}</h2>
              </div>
              <LotteryTextCard desc={t["awards.lotteryDesc"]} prize={t["awards.lotteryPrize"]} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

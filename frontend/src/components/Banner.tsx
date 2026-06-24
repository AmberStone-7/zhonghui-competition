import { type LucideIcon } from "lucide-react";

const BASE = import.meta.env.BASE_URL;

interface BannerProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  /** Show the 20th anniversary hero content (for 报名上传 page) */
  hero?: boolean;
}

export default function Banner({ icon: Icon, title, subtitle, hero }: BannerProps) {
  return (
    <div className="relative w-full h-[300px] overflow-hidden">
      {/* Background Image */}
      <img
        src={`${BASE}assets/banner.png`}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {hero ? (
        /* Hero layout for 报名上传 */
        <div className="relative h-full max-w-6xl mx-auto px-6 flex items-center">
          <div className="flex-1 text-white">
            <p className="text-sm tracking-widest mb-2 opacity-80">2006-2026</p>
            <p className="text-[120px] leading-none font-black tracking-tighter mb-0">20</p>
            <p className="text-2xl tracking-[0.3em] uppercase mb-4">MAIN PAPER</p>
            <div className="inline-flex items-center gap-3 bg-[#B8860B] bg-opacity-80 backdrop-blur-sm rounded-lg px-4 py-2 mb-2">
              <img src={`${BASE}assets/logo-gold.png`} alt="" className="w-8 h-8 object-contain" />
              <span className="text-xl font-bold">特別橱窗大赛</span>
            </div>
            <p className="text-sm text-brand-pink mt-2 opacity-90">
              · Concurso de escaparate especial - Edición especial del 20. aniversario ·
            </p>
          </div>
          <div className="shrink-0">
            <a
              href="/register"
              className="inline-flex items-center justify-center bg-[#B8860B] hover:bg-[#9A6F09] text-white font-bold px-10 py-3.5 rounded-lg text-lg transition-colors shadow-lg"
            >
              报名参赛
            </a>
          </div>
        </div>
      ) : (
        /* Standard page banner */
        <div className="relative h-full flex flex-col items-center justify-center text-white">
          <Icon className="w-7 h-7 mb-3 opacity-90" />
          <h1 className="text-2xl font-bold mb-2">{title}</h1>
          <p className="text-sm text-brand-pink opacity-90">{subtitle}</p>
        </div>
      )}
    </div>
  );
}

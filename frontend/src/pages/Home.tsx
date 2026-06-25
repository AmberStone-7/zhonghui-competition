import { Link } from "react-router-dom";
import { ClipboardList, Image, ThumbsUp } from "lucide-react";
import { useLanguage } from "../hooks/useLanguage";

const BASE = import.meta.env.BASE_URL;

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="h5-page">
      {/* === Mobile H5 === */}
      <div
        className="md:hidden flex min-h-screen flex-col items-center px-4 pt-0 pb-8"
        style={{
          backgroundImage: `url(${BASE}assets/bg-h5-video.png)`,
          backgroundSize: "cover",
          backgroundPosition: "center top",
          backgroundRepeat: "no-repeat",
        }}
      >
        <img
          src={`${BASE}assets/h5-sample-4.png`}
          alt="Main Visual"
          className="mt-0 h-[180px] w-auto object-contain"
        />
        <img src={`${BASE}assets/logo-gold.png`} alt="Logo" className="-mt-[12px] h-[155px] w-auto object-contain" />

        <div className="mt-4 flex flex-col items-center gap-3 w-full max-w-[280px]">
          <div className="flex gap-4 w-full">
            <Link to="/register" className="flex-1 h-11 bg-brand-red text-white rounded-xl text-base font-bold flex items-center justify-center hover:bg-red-800 transition-colors">{t["home.register"]}</Link>
            <Link to="/vote" className="flex-1 h-11 bg-brand-gold text-white rounded-xl text-base font-bold flex items-center justify-center hover:bg-amber-700 transition-colors">{t["home.vote"]}</Link>
          </div>
          <div className="flex gap-3 w-full">
            <Link to="/showcase" className="flex-1 h-9 border border-white/40 bg-white/10 backdrop-blur-sm text-white rounded-lg text-[13px] font-bold flex items-center justify-center hover:bg-white/20 transition-colors">{t["home.showcase"]}</Link>
            <Link to="/rules" className="flex-1 h-9 border border-white/40 bg-white/10 backdrop-blur-sm text-white rounded-lg text-[13px] font-bold flex items-center justify-center hover:bg-white/20 transition-colors">{t["home.rules"]}</Link>
            <Link to="/awards" className="flex-1 h-9 border border-white/40 bg-white/10 backdrop-blur-sm text-white rounded-lg text-[13px] font-bold flex items-center justify-center hover:bg-white/20 transition-colors">{t["home.awards"]}</Link>
          </div>
        </div>
      </div>

      {/* === PC Layout === */}
      <div className="hidden md:block">
        <div
          className="relative h-[320px] overflow-hidden"
          style={{
            backgroundImage: `url(${BASE}assets/banner.png)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="max-w-6xl mx-auto px-6 mt-8 relative z-10 pb-12">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="grid grid-cols-3 gap-6">
              <Link to="/register" className="flex flex-col items-center gap-4 p-6 rounded-xl bg-brand-rose hover:bg-red-100 transition-colors group">
                <ClipboardList className="w-10 h-10 text-brand-red" />
                <span className="text-lg font-bold text-brand-red group-hover:text-red-800">{t["home.signup"]}</span>
                <span className="text-sm text-text-muted text-center">{t["home.signupDesc"]}</span>
              </Link>
              <Link to="/showcase" className="flex flex-col items-center gap-4 p-6 rounded-xl bg-brand-cream hover:bg-amber-100 transition-colors group">
                <Image className="w-10 h-10 text-brand-gold" />
                <span className="text-lg font-bold text-brand-gold group-hover:text-amber-800">{t["home.showcase"]}</span>
                <span className="text-sm text-text-muted text-center">{t["home.showcaseDesc"]}</span>
              </Link>
              <Link to="/vote" className="flex flex-col items-center gap-4 p-6 rounded-xl bg-brand-pink hover:bg-red-100 transition-colors group">
                <ThumbsUp className="w-10 h-10 text-brand-red" />
                <span className="text-lg font-bold text-brand-red group-hover:text-red-800">{t["home.vote"]}</span>
                <span className="text-sm text-text-muted text-center">{t["home.voteDesc"]}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

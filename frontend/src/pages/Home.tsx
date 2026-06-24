import { Link } from "react-router-dom";
import { ClipboardList, Image, ThumbsUp } from "lucide-react";

const BASE = import.meta.env.BASE_URL;

export default function Home() {
  return (
    <div className="h5-page">
      {/* === Mobile H5 === */}
      <div className="md:hidden flex flex-col items-center px-4 pt-12 pb-8" style={{ background: "#F0F9FF" }}>
        {/* MainPaperMark first */}
        <img src={`${BASE}assets/hero.png`} alt="Main Visual" className="w-[223px] h-[299px] object-contain mb-6" />

        {/* LogoGold second */}
        <img src={`${BASE}assets/logo-gold.png`} alt="Logo" className="w-[227px] h-[95px] object-contain mb-8" />

        {/* Nav Buttons */}
        <div className="flex flex-col gap-4 w-full max-w-[280px]">
          <Link to="/register" className="bg-brand-red text-white text-[22px] font-bold py-4 rounded-xl text-center shadow-lg hover:bg-red-800 transition-colors">
            报名参赛
          </Link>
          <Link to="/showcase" className="bg-brand-gold text-white text-[22px] font-bold py-4 rounded-xl text-center shadow-lg hover:bg-amber-700 transition-colors">
            作品展示
          </Link>
          <Link to="/vote" className="bg-brand-red text-white text-[22px] font-bold py-4 rounded-xl text-center shadow-lg hover:bg-red-800 transition-colors">
            人气投票
          </Link>
        </div>

        <div className="flex gap-4 mt-8 mb-12">
          <Link to="/rules" className="text-text-muted text-[16px] underline underline-offset-4">赛制规则</Link>
          <span className="text-text-placeholder">|</span>
          <Link to="/awards" className="text-text-muted text-[16px] underline underline-offset-4">赛事奖项</Link>
        </div>
      </div>

      {/* === PC Layout === */}
      <div className="hidden md:block">
        <div className="relative bg-gradient-to-b from-[#1a0a0a] via-[#6B1A1A] to-[#a02020] h-[300px] flex items-center justify-center">
          <div className="text-center">
            <img src={`${BASE}assets/logo-gold.png`} alt="Logo" className="w-[180px] h-[75px] object-contain mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white">中汇文具 20 周年 · 特别橱窗大赛</h1>
            <p className="text-white/70 mt-2">用橱窗展现你的创意，赢取丰厚奖品</p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 -mt-8 relative z-10 pb-12">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="grid grid-cols-3 gap-6">
              <Link to="/register" className="flex flex-col items-center gap-4 p-6 rounded-xl bg-brand-rose hover:bg-red-100 transition-colors group">
                <ClipboardList className="w-10 h-10 text-brand-red" />
                <span className="text-lg font-bold text-brand-red group-hover:text-red-800">报名参赛</span>
                <span className="text-sm text-text-muted text-center">提交您的橱窗作品，参与评选</span>
              </Link>
              <Link to="/showcase" className="flex flex-col items-center gap-4 p-6 rounded-xl bg-brand-cream hover:bg-amber-100 transition-colors group">
                <Image className="w-10 h-10 text-brand-gold" />
                <span className="text-lg font-bold text-brand-gold group-hover:text-amber-800">作品展示</span>
                <span className="text-sm text-text-muted text-center">浏览所有参赛橱窗作品</span>
              </Link>
              <Link to="/vote" className="flex flex-col items-center gap-4 p-6 rounded-xl bg-brand-pink hover:bg-red-100 transition-colors group">
                <ThumbsUp className="w-10 h-10 text-brand-red" />
                <span className="text-lg font-bold text-brand-red group-hover:text-red-800">人气投票</span>
                <span className="text-sm text-text-muted text-center">为您喜欢的作品投上一票</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useNavigate } from "react-router-dom";

const BASE = import.meta.env.BASE_URL;

export default function Auth() {
  const navigate = useNavigate();

  const handleConfirm = () => {
    sessionStorage.setItem("data_authorized", "1");
    navigate("/", { replace: true });
  };

  return (
    <div className="h5-page">
      {/* Mobile */}
      <div className="md:hidden h5-hero px-6 pt-12 pb-8 flex flex-col items-center justify-between">
        <div className="flex flex-col items-center gap-3 mt-8">
          <img src={`${BASE}assets/logo-gold.png`} alt="Logo" className="w-[110px] h-[46px] object-contain" />
          <h1 className="text-2xl font-bold text-white text-center">特别橱窗大赛</h1>
          <p className="text-[9px] text-white/70 text-center max-w-[250px] leading-relaxed">
            · Concurso de escaparate especial · Edicion especial del 20.
          </p>
        </div>

        <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 max-w-[322px] w-full my-8">
          <p className="text-[22px] font-bold text-[#61636C] text-center mb-5">iResearch</p>
          <p className="text-[11px] text-white leading-relaxed mb-3">
            为保障活动的公平性与透明度，参与者授权主办方收集并使用报名信息用于活动管理
          </p>
          <p className="text-[11px] text-white leading-relaxed mb-3">
            所有活动数据将通过第三方专业数据管理平台进行自动化记录、存储、统计与核验，确保参与资格、抽奖结果及评选数据真实有效
          </p>
          <p className="text-[11px] text-white leading-relaxed">
            主办方承诺严格遵守相关数据保护规定，对参与者信息进行安全管理，未经授权不会向第三方披露或用于其他商业用途
          </p>
        </div>

        <div className="flex gap-6 mt-4 mb-8">
          <button className="w-[118px] h-[56px] bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white text-[22px] font-bold">
            取消授权
          </button>
          <button
            onClick={handleConfirm}
            className="w-[118px] h-[56px] bg-brand-red rounded-xl text-white text-[22px] font-bold"
          >
            确认授权
          </button>
        </div>
      </div>

      {/* PC */}
      <div className="hidden md:flex min-h-screen items-center justify-center bg-gradient-to-b from-[#1a0a0a] via-[#4a1515] to-[#8B1A1A]">
        <div className="flex flex-col items-center gap-8 max-w-md p-8">
          <img src={`${BASE}assets/logo-gold.png`} alt="Logo" className="w-[220px] h-[88px] object-contain" />
          <h1 className="text-5xl font-bold text-white text-center">特别橱窗大赛</h1>
          <p className="text-base text-white/70 text-center max-w-[700px]">
            · Concurso de escaparate especial · Edicion especial del 20.
          </p>
          <div className="bg-white/70 backdrop-blur-md rounded-2xl p-8 w-full">
            <p className="text-4xl font-bold text-[#61636C] text-center mb-5">iResearch</p>
            <p className="text-2xl text-white leading-relaxed mb-3">
              为保障活动的公平性与透明度，参与者授权主办方收集并使用报名信息用于活动管理
            </p>
            <p className="text-2xl text-white leading-relaxed mb-3">
              所有活动数据将通过第三方专业数据管理平台进行自动化记录、存储、统计与核验，确保参与资格、抽奖结果及评选数据真实有效
            </p>
            <p className="text-2xl text-white leading-relaxed">
              主办方承诺严格遵守相关数据保护规定，对参与者信息进行安全管理，未经授权不会向第三方披露或用于其他商业用途
            </p>
          </div>
          <div className="flex gap-6">
            <button className="px-12 py-4 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white text-3xl font-bold">
              取消授权
            </button>
            <button
              onClick={handleConfirm}
              className="px-12 py-4 bg-brand-red rounded-xl text-white text-3xl font-bold"
            >
              确认授权
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

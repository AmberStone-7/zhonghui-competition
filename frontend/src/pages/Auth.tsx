import { useNavigate } from "react-router-dom";

const BASE = import.meta.env.BASE_URL;

export default function Auth() {
  const navigate = useNavigate();

  const handleConfirm = () => {
    sessionStorage.setItem("data_authorized", "1");
    const isPC = window.innerWidth >= 768;
    navigate(isPC ? "/register" : "/", { replace: true });
  };

  return (
    <div className="h5-page">
      <div
        className="md:hidden min-h-screen px-[26px] pt-[20px] pb-8"
        style={{
          backgroundImage: `url(${BASE}assets/bg-h5-video.png)`,
          backgroundSize: "cover",
          backgroundPosition: "center top",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="flex flex-col items-center pt-[24px]">
          <img src={`${BASE}assets/h5-sample-4.png`} alt="H5素材" className="h-[180px] w-auto object-contain" />
          <img src={`${BASE}assets/logo-gold.png`} alt="Logo" className="-mt-[12px] h-[155px] w-auto object-contain" />
        </div>

        <div className="mx-auto mt-[8px] w-full max-w-[322px] rounded-[30px] bg-[#D9B6B6B8] px-[18px] py-[24px]">
          <p className="mb-[28px] text-center text-[22px] font-bold text-[#61636C]">iResearch</p>
          <p className="mb-[18px] text-[11px] leading-[1.7] text-white">
            为保障活动的公平性与透明度，参与者授权主办方
            <br />
            收集并使用报名信息用于活动管理
          </p>
          <p className="mb-[18px] text-[11px] leading-[1.7] text-white">
            所有活动数据将通过第三方专业数据管理平台进行
            <br />
            自动化记录、存储、统计与核验，确保参与资格、
            <br />
            抽奖结果及评选数据真实有效、可追溯
          </p>
          <p className="text-[11px] leading-[1.7] text-white">
            主办方承诺严格遵守相关数据保护规定，对参与者
            <br />
            信息进行安全管理，未经授权不会向第三方披露或
            <br />
            用于其他商业用途
          </p>
        </div>

        <div className="mx-auto mt-[24px] flex w-full max-w-[322px] items-center justify-between">
          <button
            className="h-[56px] w-[118px] rounded-[12px] border border-white/35 bg-white/12 text-[22px] font-bold text-white backdrop-blur-sm"
          >
            取消授权
          </button>
          <button
            onClick={handleConfirm}
            className="h-[56px] w-[118px] rounded-[12px] bg-[#D91C1C] text-[22px] font-bold text-white"
          >
            确认授权
          </button>
        </div>
      </div>

      <div
        className="hidden min-h-screen md:flex md:flex-col md:items-center md:justify-center"
        style={{
          backgroundImage: `url(${BASE}assets/bg-h5-video.png)`,
          backgroundSize: "cover",
          backgroundPosition: "center top",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="flex flex-col items-center">
          <img src={`${BASE}assets/logo-gold.png`} alt="Logo" className="h-[350px] w-[850px] object-contain" />
        </div>

        <div className="mt-2 w-[960px] rounded-[38px] bg-[#D7B1B1B8] px-[130px] py-[36px]">
          <p className="mb-10 text-center text-[44px] font-bold text-[#61636C]">iResearch</p>
          <p className="mb-8 text-2xl leading-[1.8] text-white">
            为保障活动的公平性与透明度，参与者授权主办方
            <br />
            收集并使用报名信息用于活动管理
          </p>
          <p className="mb-8 text-2xl leading-[1.8] text-white">
            所有活动数据将通过第三方专业数据管理平台进行自动化记录、存储、统计与核验，确保参与资格、抽奖结果及评选数据真实有效、可追溯
          </p>
          <p className="text-2xl leading-[1.8] text-white">
            主办方承诺严格遵守相关数据保护规定，对参与者信息进行安全管理，未经授权不会向第三方披露或用于其他商业用途
          </p>
        </div>

        <div className="mt-2 flex w-[960px] items-center justify-between px-[120px]">
          <button
            className="h-[78px] w-[200px] rounded-[16px] border border-white/35 bg-white/12 text-3xl font-bold text-white backdrop-blur-sm"
          >
            取消授权
          </button>
          <button
            onClick={handleConfirm}
            className="h-[78px] w-[200px] rounded-[16px] bg-[#D91C1C] text-3xl font-bold text-white"
          >
            确认授权
          </button>
        </div>
      </div>
    </div>
  );
}

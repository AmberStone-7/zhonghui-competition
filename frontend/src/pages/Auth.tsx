import { useNavigate } from "react-router-dom";
import { useLanguage } from "../hooks/useLanguage";

const BASE = import.meta.env.BASE_URL;

export default function Auth() {
  const navigate = useNavigate();
  const { t } = useLanguage();

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
          <p className="mb-[28px] text-center text-[22px] font-bold text-[#61636C]">{t["auth.title"]}</p>
          <p className="mb-[18px] text-[11px] leading-[1.7] text-white">
            {t["auth.text1"]}
            <br />
            {t["auth.text1b"]}
          </p>
          <p className="mb-[18px] text-[11px] leading-[1.7] text-white">
            {t["auth.text2"]}
            <br />
            {t["auth.text2b"]}
            <br />
            {t["auth.text2c"]}
          </p>
          <p className="text-[11px] leading-[1.7] text-white">
            {t["auth.text3"]}
            <br />
            {t["auth.text3b"]}
            <br />
            {t["auth.text3c"]}
          </p>
        </div>

        <div className="mx-auto mt-[24px] flex w-full max-w-[322px] items-center justify-between">
          <button
            onClick={() => window.history.back()}
            className="h-[56px] w-[118px] rounded-[12px] border border-white/35 bg-white/12 text-[22px] font-bold text-white backdrop-blur-sm"
          >
            {t["auth.cancel"]}
          </button>
          <button
            onClick={handleConfirm}
            className="h-[56px] w-[118px] rounded-[12px] bg-[#D91C1C] text-[22px] font-bold text-white"
          >
            {t["auth.confirm"]}
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
          <p className="mb-10 text-center text-[44px] font-bold text-[#61636C]">{t["auth.title"]}</p>
          <p className="mb-8 text-2xl leading-[1.8] text-white">
            {t["auth.text1"]}
            <br />
            {t["auth.text1b"]}
          </p>
          <p className="mb-8 text-2xl leading-[1.8] text-white">
            {t["auth.text2"]}{t["auth.text2b"]}{t["auth.text2c"]}
          </p>
          <p className="text-2xl leading-[1.8] text-white">
            {t["auth.text3"]}{t["auth.text3b"]}{t["auth.text3c"]}
          </p>
        </div>

        <div className="mt-2 flex w-[960px] items-center justify-between px-[120px]">
          <button
            onClick={() => window.history.back()}
            className="h-[78px] w-[200px] rounded-[16px] border border-white/35 bg-white/12 text-3xl font-bold text-white backdrop-blur-sm"
          >
            {t["auth.cancel"]}
          </button>
          <button
            onClick={handleConfirm}
            className="h-[78px] w-[200px] rounded-[16px] bg-[#D91C1C] text-3xl font-bold text-white"
          >
            {t["auth.confirm"]}
          </button>
        </div>
      </div>
    </div>
  );
}

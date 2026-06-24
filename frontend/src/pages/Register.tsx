import { useState, useRef } from "react";
import { Upload, X, Camera } from "lucide-react";
import api from "../api/client";

const BASE = import.meta.env.BASE_URL;
const MAX_IMAGES = 3;

export default function Register() {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [taxId, setTaxId] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) return;
    const toAdd = files.slice(0, remaining);
    setImages((prev) => [...prev, ...toAdd]);
    toAdd.forEach((f) => setPreviews((prev) => [...prev, URL.createObjectURL(f)]));
    if (fileRef.current) fileRef.current.value = "";
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[idx]);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    if (!name || name.length < 2 || name.length > 20) { setError("姓名须为 2-20 字"); return; }
    if (!address) { setError("请输入门店地址"); return; }
    if (!/^1\d{10}$/.test(phone)) { setError("手机号格式错误"); return; }
    if (!taxId) { setError("请输入税号"); return; }
    if (images.length === 0) { setError("请上传至少一张作品图片"); return; }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("address", address);
      formData.append("phone", phone);
      formData.append("tax_id", taxId);
      images.forEach((img) => formData.append("images", img));

      const res = await api.post("/api/register", formData);
      setSuccess(res.data.message || "报名成功！");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string }; status?: number } };
      setError(e.response?.data?.detail || "报名失败，请稍后再试");
    } finally {
      setSubmitting(false);
    }
  };

  const FormContent = () => (
    <>
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center mb-6">
          <p className="text-green-700 font-bold text-lg mb-2">报名成功！</p>
          <p className="text-green-600 text-sm">{success}</p>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
      <div className="space-y-4">
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="姓名" maxLength={20} className="w-full h-12 px-4 bg-[#F3DCDC] border-0 rounded-xl text-base placeholder:text-[#968989] outline-none focus:ring-2 focus:ring-brand-red/30" />
        <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="地址" className="w-full h-12 px-4 bg-[#F3DCDC] border-0 rounded-xl text-base placeholder:text-[#968989] outline-none focus:ring-2 focus:ring-brand-red/30" />
        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))} placeholder="电话" maxLength={11} className="w-full h-12 px-4 bg-[#F3DCDC] border-0 rounded-xl text-base placeholder:text-[#968989] outline-none focus:ring-2 focus:ring-brand-red/30" />
        <input type="text" value={taxId} onChange={(e) => setTaxId(e.target.value)} placeholder="税号" className="w-full h-12 px-4 bg-[#F3DCDC] border-0 rounded-xl text-base placeholder:text-[#968989] outline-none focus:ring-2 focus:ring-brand-red/30" />
        <div className="space-y-3">
          {previews.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {previews.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img src={url} alt={`预览 ${i + 1}`} className="w-full h-full object-cover" />
                  <button onClick={() => removeImage(i)} className="absolute top-1 right-1 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70"><X className="w-3.5 h-3.5" /></button>
                </div>
              ))}
              {images.length < MAX_IMAGES && (
                <button onClick={() => fileRef.current?.click()} className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 hover:border-brand-red hover:bg-red-50 transition-colors"><Camera className="w-5 h-5 text-gray-400" /><span className="text-[10px] text-gray-400">添加</span></button>
              )}
            </div>
          )}
          {previews.length === 0 && (
            <button onClick={() => fileRef.current?.click()} className="w-full h-[200px] border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-brand-red hover:bg-red-50 transition-colors"><Upload className="w-8 h-8 text-gray-400" /><span className="text-sm text-gray-400">点击上传作品图片 (1-3张)</span></button>
          )}
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/heic" multiple onChange={handleUpload} className="hidden" />
        </div>
      </div>
      <button onClick={handleSubmit} disabled={submitting} className="w-full h-12 bg-brand-red text-white rounded-xl text-lg font-bold mt-6 hover:bg-red-800 transition-colors disabled:opacity-50">{submitting ? "提交中..." : "上传作品"}</button>
    </>
  );

  return (
    <div className="h5-page">
      {/* === Mobile === */}
      <div className="md:hidden min-h-screen" style={{ backgroundImage: `url(${BASE}assets/bg-h5-video.png)`, backgroundSize: 'cover', backgroundPosition: 'center top', backgroundRepeat: 'no-repeat' }}>
        <div className="flex flex-col items-center">
          <img src={`${BASE}assets/h5-sample-4.png`} alt="Main Paper Mark" className="h-[180px] w-[135px] object-contain" />
          <img src={`${BASE}assets/logo-gold.png`} alt="Logo" className="-mt-[29px] h-[130px] w-[280px] object-contain" />
        </div>
        <div className="relative z-10 px-[25px] pb-8 pt-[12px] space-y-[11px]">
          <div className="bg-brand-rose rounded-xl p-4">
            <p className="text-[#991B1B] font-bold text-[15px] mb-2">报名须知</p>
            <p className="text-[#6B7280] text-[13px] leading-relaxed">· 报名截止后不可修改作品</p>
            <p className="text-[#6B7280] text-[13px] leading-relaxed">· 作品将公开展示并接受投票</p>
            <p className="text-[#6B7280] text-[13px] leading-relaxed">· 请确保联系方式准确</p>
          </div>
          <div className="bg-brand-cream rounded-xl p-4">
            <p className="text-[#92400E] font-bold text-[15px] mb-2">参赛规则</p>
            <p className="text-[#6B7280] text-[13px] leading-relaxed">· 每位参赛者仅限提交一个作品</p>
            <p className="text-[#6B7280] text-[13px] leading-relaxed">· 作品必须为原创橱窗设计</p>
            <p className="text-[#6B7280] text-[13px] leading-relaxed">· 图片数量1-3张，单张≤10MB</p>
          </div>
          <div className="bg-[#D7B1B1B5] backdrop-blur-md rounded-[28px] px-5 py-3 shadow-sm"><FormContent /></div>
        </div>
      </div>
      {/* === PC === */}
      <div className="hidden md:block">
        <div className="relative h-[300px] overflow-hidden" style={{ backgroundImage: `url(${BASE}assets/banner.png)`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }} />
        <div className="max-w-[1104px] mx-auto px-6 mt-6 relative z-10 pb-12">
          <div className="rounded-[18px] bg-white/90 p-6 shadow-sm border border-gray-100 space-y-6">
            <div className="grid grid-cols-2 gap-[18px]">
              <div className="bg-brand-cream rounded-2xl border border-[#FDE68A] p-[22px]">
                <p className="text-[#92400E] font-bold text-[15px] mb-2">参赛规则</p>
                <p className="text-[#6B7280] text-[13px] leading-relaxed">· 每位参赛者仅限提交一个作品</p>
                <p className="text-[#6B7280] text-[13px] leading-relaxed">· 作品必须为原创橱窗设计</p>
                <p className="text-[#6B7280] text-[13px] leading-relaxed">· 图片数量1-3张，单张≤10MB</p>
              </div>
              <div className="bg-brand-rose rounded-2xl border border-[#FECACA] p-[22px]">
                <p className="text-[#991B1B] font-bold text-[15px] mb-2">报名须知</p>
                <p className="text-[#6B7280] text-[13px] leading-relaxed">· 报名截止后不可修改作品</p>
                <p className="text-[#6B7280] text-[13px] leading-relaxed">· 作品将公开展示并接受投票</p>
                <p className="text-[#6B7280] text-[13px] leading-relaxed">· 请确保联系方式准确</p>
              </div>
            </div>
            <div className="rounded-2xl border border-[#EAEAEA] bg-white p-7">
              <p className="mb-5 text-[18px] font-bold text-[#111827]">填写报名信息</p>
              <FormContent />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

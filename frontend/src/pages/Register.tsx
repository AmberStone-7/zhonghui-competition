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
      {/* Success */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center mb-6">
          <p className="text-green-700 font-bold text-lg mb-2">报名成功！</p>
          <p className="text-green-600 text-sm">{success}</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Form Fields */}
      <div className="space-y-4">
        <input
          type="text" value={name} onChange={(e) => setName(e.target.value)}
          placeholder="姓名" maxLength={20}
          className="w-full h-12 px-4 bg-[#F3DCDC] border-0 rounded-xl text-base placeholder:text-[#968989] outline-none focus:ring-2 focus:ring-brand-red/30"
        />
        <input
          type="text" value={address} onChange={(e) => setAddress(e.target.value)}
          placeholder="地址"
          className="w-full h-12 px-4 bg-[#F3DCDC] border-0 rounded-xl text-base placeholder:text-[#968989] outline-none focus:ring-2 focus:ring-brand-red/30"
        />
        <input
          type="tel" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
          placeholder="电话" maxLength={11}
          className="w-full h-12 px-4 bg-[#F3DCDC] border-0 rounded-xl text-base placeholder:text-[#968989] outline-none focus:ring-2 focus:ring-brand-red/30"
        />
        <input
          type="text" value={taxId} onChange={(e) => setTaxId(e.target.value)}
          placeholder="税号"
          className="w-full h-12 px-4 bg-[#F3DCDC] border-0 rounded-xl text-base placeholder:text-[#968989] outline-none focus:ring-2 focus:ring-brand-red/30"
        />

        {/* Image Upload */}
        <div className="space-y-3">
          {/* Previews */}
          {previews.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {previews.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img src={url} alt={`预览 ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {images.length < MAX_IMAGES && (
                <button
                  onClick={() => fileRef.current?.click()}
                  className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 hover:border-brand-red hover:bg-red-50 transition-colors"
                >
                  <Camera className="w-5 h-5 text-gray-400" />
                  <span className="text-[10px] text-gray-400">添加</span>
                </button>
              )}
            </div>
          )}

          {/* Upload button when no images */}
          {previews.length === 0 && (
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full h-[200px] border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-brand-red hover:bg-red-50 transition-colors"
            >
              <Upload className="w-8 h-8 text-gray-400" />
              <span className="text-sm text-gray-400">点击上传作品图片 (1-3张)</span>
            </button>
          )}

          <input
            ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/heic"
            multiple onChange={handleUpload} className="hidden"
          />
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full h-12 bg-brand-red text-white rounded-xl text-lg font-bold mt-6 hover:bg-red-800 transition-colors disabled:opacity-50"
      >
        {submitting ? "提交中..." : "上传作品"}
      </button>
    </>
  );

  return (
    <div className="h5-page">
      {/* === Mobile === */}
      <div className="md:hidden">
        <div className="h5-hero min-h-[40vh] flex items-center justify-center">
          <div className="text-center mt-8">
            <img src={`${BASE}assets/logo-gold.png`} alt="Logo" className="w-[180px] h-[75px] object-contain mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white">报名上传</h1>
            <p className="text-white/60 text-sm mt-1">提交您的橱窗作品</p>
          </div>
        </div>

        <div className="-mt-6 relative z-10 px-4 pb-8 space-y-4">
          {/* Form Card */}
          <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-sm">
            <FormContent />
          </div>

          {/* Notice Cards */}
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
        </div>
      </div>

      {/* === PC === */}
      <div className="hidden md:block">
        <div className="relative bg-gradient-to-b from-[#1a0a0a] via-[#6B1A1A] to-[#a02020] h-[240px] flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white">报名上传</h1>
            <p className="text-white/70 mt-2">提交您的橱窗作品，展现门店风采</p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-6 -mt-8 relative z-10 pb-12">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="md:grid md:grid-cols-5 md:gap-8">
              <div className="md:col-span-3">
                <FormContent />
              </div>
              <div className="md:col-span-2 space-y-4 mt-6 md:mt-0">
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

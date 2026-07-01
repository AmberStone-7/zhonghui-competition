import { useState, useRef } from "react";
import { Upload, X, Camera } from "lucide-react";
import api from "../api/client";
import { useLanguage } from "../hooks/useLanguage";

const BASE = import.meta.env.BASE_URL;
const MAX_IMAGES = 3;

export default function Register() {
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [taxId, setTaxId] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [posters, setPosters] = useState<File[]>([]);
  const [posterPreviews, setPosterPreviews] = useState<string[]>([]);
  const [schoolPosters, setSchoolPosters] = useState<File[]>([]);
  const [schoolPosterPreviews, setSchoolPosterPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const posterRef = useRef<HTMLInputElement>(null);
  const schoolPosterRef = useRef<HTMLInputElement>(null);

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

  const handlePosterUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = MAX_IMAGES - posters.length;
    if (remaining <= 0) return;
    const toAdd = files.slice(0, remaining);
    setPosters((prev) => [...prev, ...toAdd]);
    toAdd.forEach((f) => setPosterPreviews((prev) => [...prev, URL.createObjectURL(f)]));
    if (posterRef.current) posterRef.current.value = "";
  };

  const removePoster = (idx: number) => {
    setPosters((prev) => prev.filter((_, i) => i !== idx));
    setPosterPreviews((prev) => {
      URL.revokeObjectURL(prev[idx]);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const handleSchoolPosterUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = MAX_IMAGES - schoolPosters.length;
    if (remaining <= 0) return;
    const toAdd = files.slice(0, remaining);
    setSchoolPosters((prev) => [...prev, ...toAdd]);
    toAdd.forEach((f) => setSchoolPosterPreviews((prev) => [...prev, URL.createObjectURL(f)]));
    if (schoolPosterRef.current) schoolPosterRef.current.value = "";
  };

  const removeSchoolPoster = (idx: number) => {
    setSchoolPosters((prev) => prev.filter((_, i) => i !== idx));
    setSchoolPosterPreviews((prev) => {
      URL.revokeObjectURL(prev[idx]);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    if (!name || name.length < 2 || name.length > 20) { setError(t["register.error.nameLen"]); return; }
    if (!address) { setError(t["register.error.address"]); return; }
    if (!/^1\d{10}$/.test(phone)) { setError(t["register.error.phone"]); return; }
    if (!taxId) { setError(t["register.error.taxId"]); return; }
    if (images.length === 0) { setError(t["register.error.noImage"]); return; }
    if (posters.length === 0) { setError(t["register.error.noPoster"]); return; }
    if (schoolPosters.length === 0) { setError(t["register.error.noSchoolPoster"]); return; }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("address", address);
      formData.append("phone", phone);
      formData.append("tax_id", taxId);
      images.forEach((img) => formData.append("images", img));
      posters.forEach((img) => formData.append("poster_images", img));
      schoolPosters.forEach((img) => formData.append("school_poster_images", img));

      const res = await api.post("/api/register", formData);
      setSuccess(res.data.message || t["register.success"]);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string }; status?: number } };
      setError(e.response?.data?.detail || t["register.error.fail"]);
    } finally {
      setSubmitting(false);
    }
  };

  // Reusable multi-image upload section component
  const MultiUploadSection = ({
    title,
    previews,
    files,
    onUpload,
    onRemove,
    inputRef,
    hint,
  }: {
    title: string;
    previews: string[];
    files: File[];
    onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemove: (idx: number) => void;
    inputRef: React.RefObject<HTMLInputElement | null>;
    hint: string;
  }) => (
    <div className="space-y-3">
      <p className="text-sm font-medium text-gray-600">{title}</p>
      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {previews.map((url, i) => (
            <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
              <img src={url} alt={`${title} ${i + 1}`} className="w-full h-full object-cover" />
              <button onClick={() => onRemove(i)} className="absolute top-1 right-1 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70"><X className="w-3.5 h-3.5" /></button>
            </div>
          ))}
          {files.length < MAX_IMAGES && (
            <button onClick={() => inputRef.current?.click()} className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 hover:border-brand-red hover:bg-red-50 transition-colors"><Camera className="w-5 h-5 text-gray-400" /><span className="text-[10px] text-gray-400">{t["register.addImage"]}</span></button>
          )}
        </div>
      )}
      {previews.length === 0 && (
        <button onClick={() => inputRef.current?.click()} className="w-full h-[100px] border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-brand-red hover:bg-red-50 transition-colors"><Upload className="w-6 h-6 text-gray-400" /><span className="text-sm text-gray-400">{hint}</span></button>
      )}
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/heic" multiple onChange={onUpload} className="hidden" />
    </div>
  );

  const FormContent = () => (
    <>
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center mb-6">
          <p className="text-green-700 font-bold text-lg mb-2">{t["register.success"]}</p>
          <p className="text-green-600 text-sm">{success}</p>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
      <div className="space-y-4">
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={t["register.name"]} maxLength={20} className="w-full h-12 px-4 bg-[#F3DCDC] border-0 rounded-xl text-base placeholder:text-[#968989] outline-none focus:ring-2 focus:ring-brand-red/30" />
        <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder={t["register.address"]} className="w-full h-12 px-4 bg-[#F3DCDC] border-0 rounded-xl text-base placeholder:text-[#968989] outline-none focus:ring-2 focus:ring-brand-red/30" />
        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))} placeholder={t["register.phone"]} maxLength={11} className="w-full h-12 px-4 bg-[#F3DCDC] border-0 rounded-xl text-base placeholder:text-[#968989] outline-none focus:ring-2 focus:ring-brand-red/30" />
        <input type="text" value={taxId} onChange={(e) => setTaxId(e.target.value)} placeholder={t["register.taxId"]} className="w-full h-12 px-4 bg-[#F3DCDC] border-0 rounded-xl text-base placeholder:text-[#968989] outline-none focus:ring-2 focus:ring-brand-red/30" />

        {/* 橱窗照片 */}
        <MultiUploadSection
          title={t["register.uploadHint"]}
          previews={previews}
          files={images}
          onUpload={handleUpload}
          onRemove={removeImage}
          inputRef={fileRef}
          hint={t["register.uploadHint"]}
        />

        {/* 橱窗海报 */}
        <MultiUploadSection
          title={t["register.posterUpload"]}
          previews={posterPreviews}
          files={posters}
          onUpload={handlePosterUpload}
          onRemove={removePoster}
          inputRef={posterRef}
          hint={t["register.posterHint"]}
        />

        {/* 学讯海报 */}
        <MultiUploadSection
          title={t["register.schoolPosterUpload"]}
          previews={schoolPosterPreviews}
          files={schoolPosters}
          onUpload={handleSchoolPosterUpload}
          onRemove={removeSchoolPoster}
          inputRef={schoolPosterRef}
          hint={t["register.schoolPosterHint"]}
        />
      </div>
      <button onClick={handleSubmit} disabled={submitting} className="w-full h-12 bg-brand-red text-white rounded-xl text-lg font-bold mt-6 hover:bg-red-800 transition-colors disabled:opacity-50">{submitting ? t["register.submitting"] : t["register.submit"]}</button>
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
            <p className="text-[#991B1B] font-bold text-[15px] mb-2">{t["register.notice"]}</p>
            <p className="text-[#6B7280] text-[13px] leading-relaxed">· {t["register.notice1"]}</p>
            <p className="text-[#6B7280] text-[13px] leading-relaxed">· {t["register.notice2"]}</p>
            <p className="text-[#6B7280] text-[13px] leading-relaxed">· {t["register.notice3"]}</p>
          </div>
          <div className="bg-brand-cream rounded-xl p-4">
            <p className="text-[#92400E] font-bold text-[15px] mb-2">{t["register.rules"]}</p>
            <p className="text-[#6B7280] text-[13px] leading-relaxed">· {t["register.rules1"]}</p>
            <p className="text-[#6B7280] text-[13px] leading-relaxed">· {t["register.rules2"]}</p>
            <p className="text-[#6B7280] text-[13px] leading-relaxed">· {t["register.rules3"]}</p>
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
                <p className="text-[#92400E] font-bold text-[15px] mb-2">{t["register.rules"]}</p>
                <p className="text-[#6B7280] text-[13px] leading-relaxed">· {t["register.rules1"]}</p>
                <p className="text-[#6B7280] text-[13px] leading-relaxed">· {t["register.rules2"]}</p>
                <p className="text-[#6B7280] text-[13px] leading-relaxed">· {t["register.rules3"]}</p>
              </div>
              <div className="bg-brand-rose rounded-2xl border border-[#FECACA] p-[22px]">
                <p className="text-[#991B1B] font-bold text-[15px] mb-2">{t["register.notice"]}</p>
                <p className="text-[#6B7280] text-[13px] leading-relaxed">· {t["register.notice1"]}</p>
                <p className="text-[#6B7280] text-[13px] leading-relaxed">· {t["register.notice2"]}</p>
                <p className="text-[#6B7280] text-[13px] leading-relaxed">· {t["register.notice3"]}</p>
              </div>
            </div>
            <div className="rounded-2xl border border-[#EAEAEA] bg-white p-7">
              <p className="mb-5 text-[18px] font-bold text-[#111827]">{t["register.title"]}</p>
              <FormContent />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useRef } from "react";
import { ClipboardList, CircleCheck, Info, Megaphone } from "lucide-react";
import Banner from "../components/Banner";
import api from "../api/client";

export default function Register() {
  const [form, setForm] = useState({ name: "", address: "", tax_id: "", phone: "" });
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFiles = (newFiles: FileList) => {
    const remaining = 3 - files.length;
    const selected = Array.from(newFiles).slice(0, remaining);
    const updated = [...files, ...selected];
    setFiles(updated);

    selected.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviews((prev) => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const isFormValid =
    form.name.length >= 2 &&
    form.name.length <= 20 &&
    form.address.length > 0 &&
    form.tax_id.length > 0 &&
    /^1\d{10}$/.test(form.phone) &&
    files.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setSubmitting(true);
    setError("");

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("address", form.address);
    formData.append("tax_id", form.tax_id);
    formData.append("phone", form.phone);
    files.forEach((file) => formData.append("images", file));

    try {
      await api.post("/api/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccess(true);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status: number; data?: { detail?: string } } };
      if (axiosErr.response?.status === 409) {
        setError(axiosErr.response?.data?.detail || "报名信息重复，请勿重复提交");
      } else if (axiosErr.response?.status === 503) {
        setError("报名通道已关闭");
      } else {
        setError("提交失败，请稍后再试");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <>
        <Banner icon={ClipboardList} title="报名上传" subtitle="提交您的橱窗作品，参与 20 周年特别大赛" />
        <div className="max-w-2xl mx-auto px-5 py-16 text-center">
          <div className="text-6xl mb-4"><CircleCheck className="w-16 h-16 mx-auto text-green-600" /></div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">报名成功！</h2>
          <p className="text-gray-500">您的作品正在等待审核</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Banner icon={ClipboardList} title="报名上传" subtitle="提交您的橱窗作品，参与 20 周年特别大赛" />

      <div className="max-w-4xl mx-auto px-5 py-8">
        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
            <h3 className="font-bold text-amber-800 mb-3"><Info className="w-4 h-4 inline mr-1" /> 参赛规则</h3>
            <ul className="text-sm text-amber-700 space-y-2">
              <li>• 每位参赛者仅限提交一个作品</li>
              <li>• 作品必须为原创橱窗设计</li>
              <li>• 图片数量 1-3 张，单张不超过 10MB</li>
              <li>• 报名信息需真实有效</li>
            </ul>
          </div>
          <div className="bg-red-50 border border-red-100 rounded-lg p-6">
            <h3 className="font-bold text-red-800 mb-3"><Megaphone className="w-4 h-4 inline mr-1" /> 报名须知</h3>
            <ul className="text-sm text-red-700 space-y-2">
              <li>• 报名截止后不可修改作品</li>
              <li>• 作品将公开展示并接受投票</li>
              <li>• 请确保联系方式准确以便通知</li>
              <li>• 最终解释权归主办方所有</li>
            </ul>
          </div>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-bold text-lg mb-6">填写报名信息</h3>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">姓名</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="请输入您的姓名（2-20个字符）"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">地址</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="请输入您的详细地址"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">税号</label>
              <input
                type="text"
                value={form.tax_id}
                onChange={(e) => handleChange("tax_id", e.target.value)}
                placeholder="请输入您的税号"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">电话</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value.replace(/\D/g, "").slice(0, 11))}
                placeholder="请输入 11 位手机号码"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-none transition-all"
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                作品图片（最多 3 张）
              </label>
              <div className="flex flex-wrap gap-3">
                {previews.map((src, i) => (
                  <div key={i} className="relative w-28 h-28 rounded-lg overflow-hidden border border-gray-200">
                    <img src={src} alt={`preview-${i}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full text-xs flex items-center justify-center hover:bg-black/80"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {files.length < 3 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-28 h-28 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-red-400 hover:text-red-400 transition-colors"
                  >
                    <span className="text-2xl">+</span>
                    <span className="text-xs mt-1">添加图片</span>
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) handleFiles(e.target.files);
                  e.target.value = "";
                }}
              />
            </div>

            <button
              type="submit"
              disabled={!isFormValid || submitting}
              className="w-full py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "提交中..." : "提交报名"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

import { useState } from "react";
import api from "../api/client";

interface PhoneModalProps {
  workId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PhoneModal({ workId, onClose, onSuccess }: PhoneModalProps) {
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isValid = /^1\d{10}$/.test(phone);

  const handleConfirm = async () => {
    if (!isValid) return;
    setSubmitting(true);
    setError("");
    try {
      await api.post("/api/vote", { work_id: workId, phone });
      onSuccess();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status: number; data?: { detail?: string } } };
      if (axiosErr.response?.status === 409) {
        setError("该手机号已经投过票了");
      } else if (axiosErr.response?.status === 503) {
        setError("投票通道已关闭");
      } else {
        setError("投票失败，请稍后再试");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-lg p-6 w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold mb-2">手机号验证</h3>
        <p className="text-sm text-gray-500 mb-4">请输入您的 11 位手机号码进行投票验证</p>
        <input
          type="tel"
          maxLength={11}
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
          placeholder="请输入手机号码"
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-none mb-3"
        />
        {error && (
          <p className="text-sm text-red-500 mb-3">{error}</p>
        )}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isValid || submitting}
            className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "提交中..." : "确认投票"}
          </button>
        </div>
      </div>
    </div>
  );
}

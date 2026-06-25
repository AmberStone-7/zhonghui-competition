import { useState } from "react";
import { X } from "lucide-react";
import api from "../api/client";
import { useLanguage } from "../hooks/useLanguage";

interface PhoneModalProps {
  workId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PhoneModal({ workId, onClose, onSuccess }: PhoneModalProps) {
  const { t } = useLanguage();
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
        setError(t["phone.error.duplicate"]);
      } else if (axiosErr.response?.status === 503) {
        setError(t["phone.error.closed"]);
      } else {
        setError(t["phone.error.fail"]);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#111827]">{t["phone.title"]}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-[#64748B] mb-4">{t["phone.desc"]}</p>
        <input
          type="tel"
          maxLength={11}
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
          placeholder={t["phone.placeholder"]}
          className="w-full h-11 px-4 border border-gray-200 rounded-lg text-sm focus:border-brand-red focus:ring-2 focus:ring-red-50 outline-none mb-3 placeholder:text-[#9CA3AF]"
        />
        {error && (
          <p className="text-sm text-red-500 mb-3">{error}</p>
        )}
        <div className="flex gap-3 mt-4">
          <button
            onClick={onClose}
            className="flex-1 h-11 border border-gray-200 rounded-lg text-sm font-semibold text-[#374151] hover:bg-gray-50 transition-colors"
          >
            {t["phone.cancel"]}
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isValid || submitting}
            className="flex-1 h-11 bg-brand-red text-white rounded-lg text-sm font-semibold hover:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? t["phone.submitting"] : t["phone.confirm"]}
          </button>
        </div>
      </div>
    </div>
  );
}

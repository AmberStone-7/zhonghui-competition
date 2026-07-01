import { useState } from "react";
import { X, ShieldCheck } from "lucide-react";
import type { Work } from "../types";
import { verifyWorkScore, type ScoreDetail } from "../api/mock";

interface WorkDetailModalProps {
  work: Work;
  onClose: () => void;
  onVote?: () => void;
  canVote?: boolean;
  voteLabel?: string;
}

export default function WorkDetailModal({ work, onClose, onVote, canVote, voteLabel }: WorkDetailModalProps) {
  const [showVerify, setShowVerify] = useState(false);
  const [verifyPhone, setVerifyPhone] = useState("");
  const [verifyTaxId, setVerifyTaxId] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const [scoreDetail, setScoreDetail] = useState<ScoreDetail | null>(null);
  const [verifying, setVerifying] = useState(false);

  const allImages = [
    ...(work.images || []).map((url, i) => ({ url, label: `橱窗照片 ${i + 1}`, group: "橱窗照片" })),
    ...(work.poster_images || []).map((url, i) => ({ url, label: `橱窗海报 ${i + 1}`, group: "橱窗海报" })),
    ...(work.school_poster_images || []).map((url, i) => ({ url, label: `学讯海报 ${i + 1}`, group: "学讯海报" })),
  ];

  const groups: { label: string; images: { url: string; label: string }[] }[] = [];
  const photoGroup = allImages.filter(i => i.group === "橱窗照片");
  const posterGroup = allImages.filter(i => i.group === "橱窗海报");
  const schoolGroup = allImages.filter(i => i.group === "学讯海报");

  if (photoGroup.length) groups.push({ label: "橱窗照片", images: photoGroup });
  if (posterGroup.length) groups.push({ label: "橱窗海报", images: posterGroup });
  if (schoolGroup.length) groups.push({ label: "学讯海报", images: schoolGroup });

  const handleVerify = () => {
    setVerifyError("");
    if (!verifyPhone.trim() || !verifyTaxId.trim()) {
      setVerifyError("请输入手机号和税号");
      return;
    }
    setVerifying(true);
    setTimeout(() => {
      const result = verifyWorkScore(work.id, verifyPhone.trim(), verifyTaxId.trim());
      if (result.success && result.data) {
        setScoreDetail(result.data);
        setShowVerify(false);
      } else {
        setVerifyError(result.error || "验证失败，请确认信息正确");
      }
      setVerifying(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-5 py-4 border-b border-gray-100 rounded-t-2xl">
          <div>
            <p className="font-bold text-gray-900">{work.work_number}</p>
            <p className="text-sm text-gray-500">{work.name_masked}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 text-gray-500 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Image groups */}
        <div className="p-5 space-y-6">
          {groups.map((group, gi) => (
            <div key={gi}>
              <p className="text-sm font-semibold text-gray-700 mb-3">{group.label}</p>
              <div className="grid grid-cols-2 gap-3">
                {group.images.map((img, ii) => (
                  <div key={ii} className="rounded-xl overflow-hidden border border-gray-100">
                    <img
                      src={img.url}
                      alt={img.label}
                      className="w-full aspect-square object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23f3f4f6' width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-size='12'%3E暂无图片%3C/text%3E%3C/svg%3E";
                      }}
                    />
                    <p className="text-center text-xs text-gray-400 py-1.5">{img.label}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Score Detail Section */}
          {scoreDetail && (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <p className="text-sm font-bold text-amber-800">评分详情</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">A-品牌与活动规范</span>
                  <span className="font-bold text-gray-900">{scoreDetail.score_a != null ? scoreDetail.score_a.toFixed(1) : "-"} / 4</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">B-视觉设计表现</span>
                  <span className="font-bold text-gray-900">{scoreDetail.score_b != null ? scoreDetail.score_b.toFixed(1) : "-"} / 5</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">C-陈列专业度</span>
                  <span className="font-bold text-gray-900">{scoreDetail.score_c != null ? scoreDetail.score_c.toFixed(1) : "-"} / 4</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">D-执行与细节</span>
                  <span className="font-bold text-gray-900">{scoreDetail.score_d != null ? scoreDetail.score_d.toFixed(1) : "-"} / 2</span>
                </div>
                <div className="flex justify-between text-sm border-t border-amber-200 pt-2">
                  <span className="text-gray-600">人气分</span>
                  <span className="font-bold text-gray-900">{scoreDetail.popularity_score != null ? scoreDetail.popularity_score.toFixed(0) : "-"} / 5</span>
                </div>
                <div className="flex justify-between text-base border-t border-amber-300 pt-2">
                  <span className="font-bold text-gray-800">总分</span>
                  <span className="font-bold text-red-600 text-lg">{scoreDetail.total != null ? scoreDetail.total.toFixed(1) : "-"} / 20</span>
                </div>
              </div>
            </div>
          )}

          {/* Verification Form */}
          {showVerify && (
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
              <p className="text-sm font-semibold text-gray-700 mb-3">验证参赛身份</p>
              <p className="text-xs text-gray-500 mb-3">请输入报名时使用的手机号和税号，验证通过后可查看评分详情。</p>
              <input
                type="tel"
                value={verifyPhone}
                onChange={(e) => setVerifyPhone(e.target.value.replace(/\D/g, ""))}
                placeholder="手机号"
                maxLength={11}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-red-300"
              />
              <input
                type="text"
                value={verifyTaxId}
                onChange={(e) => setVerifyTaxId(e.target.value)}
                placeholder="税号 NIF / CIF"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-red-300"
              />
              {verifyError && <p className="text-xs text-red-600 mb-2">{verifyError}</p>}
              <div className="flex gap-2">
                <button
                  onClick={handleVerify}
                  disabled={verifying}
                  className="flex-1 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 cursor-pointer"
                >
                  {verifying ? "验证中..." : "确认验证"}
                </button>
                <button
                  onClick={() => { setShowVerify(false); setVerifyError(""); }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 cursor-pointer"
                >
                  取消
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white px-5 py-4 border-t border-gray-100 flex items-center justify-between rounded-b-2xl">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-sm text-gray-500">得票数</span>
              <span className="text-lg font-bold text-brand-red ml-2">{work.vote_count} 票</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!scoreDetail && (
              <button
                onClick={() => setShowVerify(!showVerify)}
                className="text-sm text-gray-600 hover:text-red-600 flex items-center gap-1 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                查看评分
              </button>
            )}
            {onVote && (
              <button
                onClick={(e) => { e.stopPropagation(); onVote(); }}
                disabled={!canVote}
                className="bg-brand-red text-white font-bold px-6 py-2.5 rounded-xl hover:bg-red-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                {voteLabel || "投票"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

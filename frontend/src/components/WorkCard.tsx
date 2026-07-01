import { type ReactNode, useState } from "react";
import { ImageOff } from "lucide-react";
import { useLanguage } from "../hooks/useLanguage";

interface WorkCardProps {
  work_number: string;
  name_masked: string;
  images: string[];
  vote_count: number;
  action?: ReactNode;
  onClick?: () => void;
}

export default function WorkCard({ work_number, name_masked, images, vote_count, action, onClick }: WorkCardProps) {
  const { t } = useLanguage();
  const hasImage = images.length > 0;
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className={`bg-white rounded-lg overflow-hidden border border-gray-200 transition-all hover:-translate-y-0.5 hover:shadow-md ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
    >
      {/* Image Area */}
      <div className="relative h-[120px] bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        {hasImage && !imgError ? (
          <img
            src={images[0]}
            alt={work_number}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <ImageOff className="w-8 h-8" />
          </div>
        )}
        <div className="absolute top-2 left-2 right-2 flex justify-between">
          <span className="bg-black/50 backdrop-blur-sm text-white/80 px-2 py-0.5 rounded text-xs font-semibold">
            {work_number}
          </span>
          <span className="bg-black/50 backdrop-blur-sm text-white/80 px-2 py-0.5 rounded text-xs">
            {vote_count}{t["vote.votes"]}
          </span>
        </div>
      </div>

      <div className="px-3 pt-2 pb-3">
        {action ? (
          <div className="space-y-2">
            <span className="block text-sm font-semibold text-[#111827]">{name_masked}</span>
            {action}
          </div>
        ) : (
          <span className="text-sm font-semibold text-[#111827]">{name_masked}</span>
        )}
      </div>
    </div>
  );
}

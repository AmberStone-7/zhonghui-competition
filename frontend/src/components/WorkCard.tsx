import { type ReactNode } from "react";
import { Heart } from "lucide-react";

interface WorkCardProps {
  work_number: string;
  name_masked: string;
  images: string[];
  vote_count: number;
  action?: ReactNode;
}

export default function WorkCard({ work_number, name_masked, images, vote_count, action }: WorkCardProps) {
  return (
    <div className="bg-white rounded-lg overflow-hidden border border-gray-200 transition-all hover:-translate-y-0.5 hover:shadow-lg">
      <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
        {images.length > 0 ? (
          <img src={images[0]} alt={work_number} className="w-full h-full object-cover" />
        ) : null}
        <span className="absolute top-3 left-3 bg-black/60 text-white px-2.5 py-1 rounded-md text-xs font-semibold">
          {work_number}
        </span>
        <span className="absolute top-3 right-3 bg-black/60 text-white px-2.5 py-1 rounded-md text-xs">
          {vote_count} 票
        </span>
      </div>
      <div className="p-4 flex justify-between items-center">
        <span className="font-semibold">{name_masked}</span>
        {action || <span className="text-sm text-amber-500 font-semibold"><Heart className="w-3.5 h-3.5 inline mr-1" /> {vote_count} 票</span>}
      </div>
    </div>
  );
}

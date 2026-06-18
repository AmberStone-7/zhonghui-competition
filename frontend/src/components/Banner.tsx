import { type LucideIcon } from "lucide-react";
import heroBg from "../assets/hero.png";

export default function Banner({ icon: Icon, title, subtitle }: { icon: LucideIcon; title: string; subtitle: string }) {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/60" />
      </div>
      <div className="relative py-16 px-5 text-center text-white">
        <Icon className="w-10 h-10 mx-auto mb-3" />
        <h1 className="text-2xl font-bold mb-2">{title}</h1>
        <p className="text-sm opacity-85">{subtitle}</p>
      </div>
    </div>
  );
}

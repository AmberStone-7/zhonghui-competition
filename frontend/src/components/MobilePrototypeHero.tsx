const BASE = import.meta.env.BASE_URL;

interface MobilePrototypeHeroProps {
  topMarkClassName?: string;
  logoClassName?: string;
}

export default function MobilePrototypeHero({
  topMarkClassName = 'h-[180px] w-[135px]',
  logoClassName = 'mt-[10px] h-[130px] w-[280px]',
}: MobilePrototypeHeroProps) {
  return (
    <div className="flex flex-col items-center">
      <img src={`${BASE}assets/h5-sample-4.png`} alt="Main Paper Mark" className={`${topMarkClassName} object-contain`} />
      <img src={`${BASE}assets/logo-gold.png`} alt="Logo" className={`${logoClassName} object-contain`} />
    </div>
  );
}

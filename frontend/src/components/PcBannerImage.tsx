const BASE = import.meta.env.BASE_URL;

export default function PcBannerImage() {
  return (
    <div
      className="relative h-[300px] overflow-hidden"
      style={{
        backgroundImage: `url(${BASE}assets/banner.png)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    />
  );
}

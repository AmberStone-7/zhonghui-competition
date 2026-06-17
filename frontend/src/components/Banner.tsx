export default function Banner({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) {
  return (
    <div className="bg-gradient-to-br from-red-600 to-red-800 text-white py-12 px-5 text-center">
      <div className="text-4xl mb-3">{icon}</div>
      <h1 className="text-2xl font-bold mb-2">{title}</h1>
      <p className="text-sm opacity-85">{subtitle}</p>
    </div>
  );
}

import { Outlet, Link, useLocation } from "react-router-dom";

const navItems = [
  { path: "/register", label: "报名上传" },
  { path: "/showcase", label: "作品展示" },
  { path: "/rules", label: "赛制规则" },
  { path: "/awards", label: "赛事奖项" },
  { path: "/vote", label: "人气投票" },
];

export default function Layout() {
  const location = useLocation();
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between flex-wrap gap-3">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">ZH</div>
            <div>
              <div className="font-bold text-base">中汇文具 20 周年</div>
              <div className="text-xs text-gray-500">特别橱窗大赛</div>
            </div>
          </Link>
          <nav className="flex gap-1 flex-wrap">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-md text-sm transition-all ${
                  location.pathname === item.path
                    ? "bg-red-50 text-red-600 font-semibold"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <Outlet />
    </div>
  );
}

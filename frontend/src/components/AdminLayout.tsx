import { storage } from "../utils/storage";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ClipboardList, FolderOpen, Pencil, Star, Download, Settings } from "lucide-react";

const navItems = [
  { to: "/admin/review", label: "报名审核", icon: ClipboardList },
  { to: "/admin/works", label: "作品管理", icon: FolderOpen },
  { to: "/admin/content", label: "内容管理", icon: Pencil },
  { to: "/admin/scores", label: "评分管理", icon: Star },
  { to: "/admin/export", label: "数据导出", icon: Download },
  { to: "/admin/config", label: "系统配置", icon: Settings },
];

const roleLabels: Record<string, string> = {
  super_admin: "超级管理员",
  scorer_a: "评分员A",
  scorer_b: "评分员B",
  scorer_c: "评分员C",
  scorer_d: "评分员D",
};

export default function AdminLayout() {
  const { role, logout } = useAuth();
  const navigate = useNavigate();
  const isSuperAdmin = role === "super_admin";
  const isMock = storage.getItem("mock_mode") === "1";

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {isMock && (
        <div className="bg-amber-500 text-white text-center text-xs font-medium py-1.5">
          演示模式 — 后端未连接，当前显示模拟数据。登录账号: admin / admin123
        </div>
      )}
      <header className="bg-slate-800 text-white h-14 flex items-center justify-between px-6">
        <h1 className="text-lg font-bold">管理后台</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-300">
            {roleLabels[role || ""] || role}
          </span>
          <button
            onClick={handleLogout}
            className="text-sm text-slate-300 hover:text-white cursor-pointer"
          >
            退出登录
          </button>
        </div>
      </header>

      <div className="flex">
        {isSuperAdmin && (
          <aside className="w-56 bg-white border-r border-gray-200 min-h-[calc(100vh-3.5rem)]">
            <nav className="py-4">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-red-50 text-red-600"
                        : "text-gray-700 hover:bg-gray-50"
                    }`
                  }
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </aside>
        )}

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

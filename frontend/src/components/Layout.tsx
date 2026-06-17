import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-red-600 text-white px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="text-xl font-bold">中汇文具 20 周年橱窗大赛</span>
          <div className="flex gap-4">
            <a href="/register" className="hover:underline">报名</a>
            <a href="/showcase" className="hover:underline">作品展示</a>
            <a href="/rules" className="hover:underline">赛制规则</a>
            <a href="/awards" className="hover:underline">赛事奖项</a>
            <a href="/vote" className="hover:underline">人气投票</a>
          </div>
        </div>
      </nav>
      <Outlet />
    </div>
  );
}

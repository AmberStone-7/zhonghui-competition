# 中汇文具 20 周年橱窗大赛 — 前端

React 19 + Vite 8 + Tailwind CSS 4 + TypeScript

## 开发

```bash
npm install
npm run dev        # http://localhost:5173/static/
npm test           # 15 个测试
npm run build      # 生产构建
```

## 项目结构

```
src/
├── App.tsx                    # 路由配置 (basename="/static")
├── main.tsx                   # React 挂载入口
├── index.css                  # Tailwind CSS + 品牌色主题
├── api/
│   ├── client.ts              # axios 实例 (JWT 拦截器)
│   └── mock.ts                # Mock 数据 (API 不可用时降级)
├── components/
│   ├── Layout.tsx             # 全局布局 (PC 导航 / 手机简化栏)
│   ├── AuthGuard.tsx          # 授权守卫 (sessionStorage.data_authorized)
│   ├── ErrorBoundary.tsx      # 错误边界
│   ├── MobilePrototypeHero.tsx # 手机端 H5 素材 + Logo
│   ├── PcBannerImage.tsx      # PC 端纯背景横幅
│   ├── WorkCard.tsx           # 作品卡片
│   ├── PhoneModal.tsx         # 投票手机号弹窗
│   ├── ProtectedRoute.tsx     # JWT 路由守卫
│   └── AdminLayout.tsx        # 管理后台侧边栏布局
├── hooks/
│   ├── useAuth.ts             # 认证状态管理
│   └── useVoteStatus.ts       # 投票通道状态
├── pages/
│   ├── Auth.tsx               # 数据授权页
│   ├── Home.tsx               # 首页
│   ├── Register.tsx           # 报名上传
│   ├── Showcase.tsx           # 作品展示
│   ├── Vote.tsx               # 人气投票
│   ├── Rules.tsx              # 赛制规则
│   ├── Awards.tsx             # 赛事奖项
│   ├── admin/                 # 管理后台页面
│   └── scorer/                # 评分员页面
└── test/
    ├── setup.ts               # Vitest 配置
    └── home-register.spec.tsx # 15 个测试
```

## Mock 数据

未连接后端时，作品展示和投票页面自动使用 `api/mock.ts` 中的 12 个模拟作品数据，页面顶部显示"当前为演示数据"提示。

## 构建配置

- **开发**: `vite.config.ts` 中 `base: '/'`，Router `basename="/static"`
- **生产**: Dockerfile 中 `npm run build -- --base /static/`，确保 Railway 部署资源路径正确

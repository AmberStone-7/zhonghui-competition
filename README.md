# 中汇文具 20 周年特别橱窗大赛系统

> 完整产品需求文档：[docs/PRD.md](docs/PRD.md)

## 技术架构

- **前端**: React 19 + Vite 8 + Tailwind CSS 4 + TypeScript → GitHub Pages 独立部署
- **后端**: Python FastAPI + SQLAlchemy 2.0 (async) → 部署 Railway
- **数据库**: Supabase PostgreSQL
- **存储**: Supabase Storage (图片上传)
- **测试**: Vitest + Testing Library (82 个测试)
- **路由**: HashRouter（所有路由 `/#/path` 格式）

## 线上地址

| 环境 | 地址 |
|------|------|
| **前台** | https://amberstone-7.github.io/zhonghui-competition/ |
| **后台登录** | https://amberstone-7.github.io/zhonghui-competition/#/admin/login |
| **Railway API** | https://zhonghui-competition-production.up.railway.app |

## 前端页面

| 页面 | 路径 | 说明 |
|------|------|------|
| 授权页 | `/#/auth` | 首次访问需确认数据授权 |
| 首页 | `/#/` | 手机端 Hero+按钮，PC 端三列卡片入口 |
| 报名上传 | `/#/register` | 表单 + 1-3 张图片上传 |
| 作品展示 | `/#/showcase` | 搜索/排序/分页，API 不可用时自动降级 mock 数据 |
| 人气投票 | `/#/vote` | 按票数排序，手机号验证投票 |
| 赛制规则 | `/#/rules` | 五类规则说明 |
| 赛事奖项 | `/#/awards` | 三类奖项展示 |
| 管理后台 | `/#/admin/*` | 审核/评分/排名/导出 |

## 前端结构

```
frontend/src/
├── types.ts              # 共享类型定义 (Work, AdminWork)
├── api/
│   ├── client.ts         # axios 实例 (JWT 拦截器)
│   └── mock.ts           # Mock 降级数据 (⚠️ DEMO ONLY)
├── components/
│   ├── Layout.tsx, AuthGuard.tsx, ErrorBoundary.tsx
│   ├── MobilePrototypeHero.tsx, PcBannerImage.tsx
│   ├── WorkCard.tsx, PhoneModal.tsx
│   ├── ProtectedRoute.tsx, AdminLayout.tsx, LanguageSwitcher.tsx
├── hooks/
│   ├── useAuth.ts        # 认证状态 Hook
│   ├── useLanguage.tsx   # 多语言 Hook (zh/en/es/fr/pt/pl/it)
│   └── useVoteStatus.ts  # 投票通道状态 Hook
├── utils/
│   └── storage.ts        # sessionStorage 安全包装 (try-catch)
├── pages/                # 8 个页面组件 + 管理后台 + 评分员
├── i18n/                 # 7 语言翻译
└── test/                 # 82 个 Vitest 测试
```

## 本地开发

```bash
cd frontend
npm install
npm run dev        # 开发服务器 → http://localhost:5173/
npm run build      # 生产构建 → frontend/dist/
npm test           # 运行 82 个测试
```

## 部署

### GitHub Pages（仅前端）

```bash
cd frontend
npx vite build --base /zhonghui-competition/
# 将 dist/ 推送到 gh-pages 分支
```

### Railway（前后端统一）

详见 [docs/部署避坑指南.md](docs/部署避坑指南.md)。

## 管理账户

| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin | admin123 | 超级管理员 |
| scorer_a | scorer123 | 评分员 A |
| scorer_b | scorer123 | 评分员 B |
| scorer_c | scorer123 | 评分员 C |
| scorer_d | scorer123 | 评分员 D |

⚠️ 生产环境请务必修改默认密码和 JWT_SECRET_KEY。

# 前端代码改进设计文档

> 2026-06-26 | 基于 Code Review 结论 | 影响范围：9 个改进项

## Overview

本次改进不改变任何 UI 呈现效果，仅提升代码安全性、健壮性和可维护性。共 9 项，按风险从低到高排序执行。

## 改进项详情

### 1. 提取共享类型定义（types.ts）

**Problem:** `Showcase.tsx` 和 `Vote.tsx` 各自定义了完全相同的 `Work` 接口，`mock.ts` 中有 `MockWork` 和 `MockAdminWork`。重复定义容易导致后续不一致。

**Solution:**
- 新建 `frontend/src/types.ts`，统一导出 `Work` 和 `AdminWork` 接口
- `Showcase.tsx`、`Vote.tsx` 改为 `import type { Work } from "../types"`，删除本地定义

**Risk:** 极低。纯类型层面改动，编译通过即可验证。

### 2. Review 页 workNumber 状态隔离

**Problem:** `workNumber` 是全局 state（`useState("")`），多个待审核作品的审批输入框共享同一个值。用户为作品 A 输入编号后切换到作品 B，可能误将 A 的编号赋给 B。

**Solution:**
- `useState("")` → `useState<Record<string, string>>({})`，按 `workId` 索引
- `handleApprove` 中从 `workNumbers[workId]` 取值
- 输入框绑定 `workNumbers[work.id] || ""`

**Risk:** 低。改动集中在单一组件的状态管理，不影响 UI 结构。

### 3. sessionStorage 操作统一包装

**Problem:** 5 个组件直接访问 `sessionStorage` 无异常保护，隐私模式或存储被禁用时可能导致白屏。

**Solution:**
- 新建 `frontend/src/utils/storage.ts`，提供带 try-catch 的 `getItem/setItem/removeItem`
- 替换 `AuthGuard.tsx`、`ProtectedRoute.tsx`、`useAuth.ts`、`useLanguage.tsx`、`AdminLayout.tsx` 中的裸调用

**Risk:** 低。包装器透明替换，行为不变。

### 4. 投票成功后改全页刷新为状态更新

**Problem:** `window.location.reload()` 是全页刷新，SPA 中不需要且体验差（白屏闪烁）。

**Solution:**
- 引入 `refreshKey` state，`useEffect` 依赖从 `[page]` 改为 `[page, refreshKey]`
- 成功回调：`setPage(1); setRefreshKey(k => k + 1)`，删除 `reload()`

**Risk:** 低。单向响应式数据流，无副作用。

### 5. Export 页下载失败改用内联错误提示

**Problem:** `alert()` 弹窗体验差，打断用户操作流。

**Solution:**
- 新增 `downloadError` state + JSX 中红色提示条
- 3 秒后自动消失

**Risk:** 低。仅 UI 提示方式变更。

### 6. 删除死代码

**Problem:** `Banner.tsx`、`design-tokens.css`、`assets/react.svg`、`assets/vite.svg` 在项目中完全未被引用。

**Solution:** 直接删除 4 个文件。

**Risk:** 极低。已验证零引用。

### 7. Config 页去除密码明文展示

**Problem:** Demo 模式下系统账户表展示密码明文，生产构建中有泄露风险。

**Solution:** 删除密码列，移除 `pwd` 字段。

**Risk:** 低。仅删除 UI 列和数据字段。

### 8. Mock 文件添加 Demo 注释

**Problem:** `MOCK_USERS` 硬编码密码，缺少用途说明。

**Solution:** 添加 `⚠️ DEMO ONLY — 仅用于本地开发和演示` 注释。

**Risk:** 极低。仅注释变更。

### 9. useVoteStatus Hook 添加 error 状态

**Problem:** API 失败时静默返回 `"closed"`，调用方无法区分"通道关闭"和"网络失败"。

**Solution:** 新增 `isError` 字段，`.catch()` 时设为 `true`。

**Risk:** 低。新增字段，不改变现有返回值语义。

## 执行顺序

| 序号 | 改进项 | 风险 | 新建文件 | 修改文件 |
|------|--------|------|----------|----------|
| 1 | 提取共享类型 | 极低 | `types.ts` | `Showcase.tsx`, `Vote.tsx` |
| 6 | 删除死代码 | 极低 | — | 删 4 文件 |
| 8 | Mock 注释 | 极低 | — | `mock.ts` |
| 3 | sessionStorage 包装 | 低 | `storage.ts` | 5 文件 |
| 2 | workNumber 隔离 | 低 | — | `Review.tsx` |
| 5 | Export 错误提示 | 低 | — | `Export.tsx` |
| 4 | 投票刷新优化 | 低 | — | `Vote.tsx` |
| 7 | 密码明文去除 | 低 | — | `Config.tsx` |
| 9 | useVoteStatus error | 低 | — | `useVoteStatus.ts` |

每项完成后执行 `npm run build` 确认无回归。

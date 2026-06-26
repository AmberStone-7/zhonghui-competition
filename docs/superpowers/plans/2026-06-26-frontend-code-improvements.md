# 前端代码改进实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实施 9 项前端代码改进，提升安全性、健壮性和可维护性，不改变 UI 呈现。

**Architecture:** 按风险由低到高顺序执行：新建共享类型模块 → 删除死代码 → 添加注释 → 包装 sessionStorage → Review 状态隔离 → Export 错误提示 → Vote 刷新优化 → Config 去密码 → useVoteStatus 错误状态。TDD 先行：storage、Review workNumber、useVoteStatus 三项写测试后实施。每项完成后跑 `npm run build` 验证。

**Tech Stack:** React 18 + TypeScript + Vite + Vitest + @testing-library/react

**Spec:** `docs/superpowers/specs/2026-06-26-frontend-code-improvements-design.md`

**Status:** ✅ 全部完成 (2026-06-26)

---

## 已完成任务

### Task 1: 提取共享类型定义 ✅

**Files:**
- Create: `frontend/src/types.ts`
- Modify: `frontend/src/pages/Showcase.tsx`
- Modify: `frontend/src/pages/Vote.tsx`

- [x] **Step 1: 创建 types.ts** — 导出 `Work` 和 `AdminWork` 接口
- [x] **Step 2: 修改 Showcase.tsx** — `import type { Work } from "../types"`，删除本地 interface
- [x] **Step 3: 修改 Vote.tsx** — 同上
- [x] **Step 4: 编译验证** — `npm run build` ✅

### Task 2: 删除死代码 ✅

**Files:**
- Delete: `frontend/src/components/Banner.tsx`
- Delete: `frontend/src/design-tokens.css`
- Delete: `frontend/src/assets/react.svg`
- Delete: `frontend/src/assets/vite.svg`

- [x] **Step 1: 删除 4 个未引用文件**
- [x] **Step 2: 编译验证** — `npm run build` ✅

### Task 3: Mock 文件添加 Demo 注释 ✅

**Files:**
- Modify: `frontend/src/api/mock.ts`

- [x] **Step 1: 在 MOCK_USERS 对象闭合后添加注释** — `// ⚠️ DEMO ONLY — 仅用于本地开发和演示，请勿将密码提交到生产环境`
- [x] **Step 2: 编译验证** — `npm run build` ✅

### Task 4: sessionStorage 操作统一包装 ✅

**Files:**
- Create: `frontend/src/utils/storage.ts`
- Create: `frontend/src/test/storage.test.ts`
- Modify: `frontend/src/components/AuthGuard.tsx`
- Modify: `frontend/src/components/ProtectedRoute.tsx`
- Modify: `frontend/src/hooks/useAuth.ts`
- Modify: `frontend/src/hooks/useLanguage.tsx`
- Modify: `frontend/src/components/AdminLayout.tsx`

- [x] **Step 1: 创建 storage.ts** — `getItem/setItem/removeItem` 带 try-catch
- [x] **Step 2: TDD RED** — 7 个 storage 测试失败（模块不存在）
- [x] **Step 3: TDD GREEN** — `npx vitest run src/test/storage.test.ts` 7/7 ✅
- [x] **Step 4: 替换 AuthGuard.tsx** — `sessionStorage.getItem` → `storage.getItem`
- [x] **Step 5: 替换 ProtectedRoute.tsx** — 同上
- [x] **Step 6: 替换 useAuth.ts** — 全部 getItem/setItem/removeItem → storage
- [x] **Step 7: 替换 useLanguage.tsx** — getItem/setItem → storage（保留原有 try-catch 冗余安全）
- [x] **Step 8: 替换 AdminLayout.tsx** — `sessionStorage.getItem` → `storage.getItem`
- [x] **Step 9: 编译验证** — `npm run build` ✅

### Task 5: Review 页 workNumber 状态隔离 ✅

**Files:**
- Modify: `frontend/src/pages/admin/Review.tsx`
- Modify: `frontend/src/test/admin-review.spec.tsx`

- [x] **Step 1: TDD RED** — UI-REV-007 测试确认 Bug（输入作品 A 编号后作品 B 输入框同步赋值）
- [x] **Step 2: 改 workNumber → workNumbers Record** — `useState<Record<string, string>>({})`
- [x] **Step 3: 改 handleApprove** — `workNumbers[workId]?.trim()` + `delete next[workId]` 清理
- [x] **Step 4: 改输入框绑定** — `value={workNumbers[work.id] || ""}` + per-key onChange
- [x] **Step 5: TDD GREEN** — UI-REV-007 通过，全部 Review 测试 6/6 ✅

### Task 6: Export 页下载失败改用内联错误提示 ✅

**Files:**
- Modify: `frontend/src/pages/admin/Export.tsx`

- [x] **Step 1: 引入 useState + storage** — 添加 `downloadError` state
- [x] **Step 2: 重构 handleDownload 为组件内函数** — `alert()` → `setDownloadError()` + 3s 自动清除
- [x] **Step 3: 替换 sessionStorage** — `sessionStorage.getItem("admin_token")` → `storage.getItem("admin_token")`
- [x] **Step 4: 修复 a.download** — 补充缺失的 `a.download = '${type}.${format}'`
- [x] **Step 5: 添加错误提示 JSX** — 红色提示条
- [x] **Step 6: 编译验证** — `npm run build` ✅

### Task 7: 投票成功后改全页刷新为状态更新 ✅

**Files:**
- Modify: `frontend/src/pages/Vote.tsx`

- [x] **Step 1: 添加 refreshKey state** — `useState(0)`
- [x] **Step 2: 修改 useEffect 依赖** — `[page]` → `[page, refreshKey]`
- [x] **Step 3: 修改 onSuccess 回调** — 删除 `window.location.reload()`，改为 `setPage(1); setRefreshKey(k => k + 1)`，toast 超时延长至 2000ms
- [x] **Step 4: 编译验证** — `npm run build` ✅
- [x] **Step 5: 确认** — `grep -r "window.location.reload"` 源码零匹配 ✅

### Task 8: Config 页去除密码明文展示 ✅

**Files:**
- Modify: `frontend/src/pages/admin/Config.tsx`

- [x] **Step 1: 删除密码展示** — 移除 `{isMockMode() ? ' — 密码: ${user.pwd}' : ""}`
- [x] **Step 2: 移除 pwd 字段** — 5 个 user 对象删除 `pwd` 属性
- [x] **Step 3: 编译验证** — `npm run build` ✅

### Task 9: useVoteStatus Hook 添加 error 状态 ✅

**Files:**
- Modify: `frontend/src/hooks/useVoteStatus.ts`
- Create: `frontend/src/test/use-vote-status.test.tsx`

- [x] **Step 1: TDD RED** — 2 个测试失败（`isError` undefined）
- [x] **Step 2: 添加 error state + catch** — `useState(false)` + `.catch(() => setError(true))`
- [x] **Step 3: 返回 isError** — `return { status, message, loading, isError: error }`
- [x] **Step 4: TDD GREEN** — 2/2 ✅

---

## 最终验证

- [x] `npm run build` — ✅
- [x] `npm test` — 82/84 ✅（2 个预先存在的 admin-login 失败，非本次引入）
- [x] 新增 TDD 测试 10 个全部通过

## 遗留项

以下 9 个文件仍有裸 `sessionStorage` 调用，建议后续批次处理：
`api/client.ts`, `pages/Auth.tsx`, `pages/admin/Dashboard.tsx`, `pages/admin/Works.tsx`, `pages/admin/Config.tsx`, `pages/admin/Review.tsx`, `pages/admin/Scores.tsx`, `pages/scorer/TaskList.tsx`, `pages/scorer/Scoring.tsx`

`useLanguage.tsx` 中 `detectLanguage` 和 `setLanguage` 保留了原有的 try-catch 包裹层（calls 内部已有 storage 保护），冗余但无害，可后续清理。

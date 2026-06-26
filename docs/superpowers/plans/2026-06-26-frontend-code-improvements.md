# 前端代码改进实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实施 9 项前端代码改进，提升安全性、健壮性和可维护性，不改变 UI 呈现。

**Architecture:** 按风险由低到高顺序执行：新建共享类型模块 → 删除死代码 → 添加注释 → 包装 sessionStorage → Review 状态隔离 → Export 错误提示 → Vote 刷新优化 → Config 去密码 → useVoteStatus 错误状态。每项完成后跑 `npm run build` 验证。

**Tech Stack:** React 18 + TypeScript + Vite

**Spec:** `docs/superpowers/specs/2026-06-26-frontend-code-improvements-design.md`

---

### Task 1: 提取共享类型定义

**Files:**
- Create: `frontend/src/types.ts`
- Modify: `frontend/src/pages/Showcase.tsx:9-14`
- Modify: `frontend/src/pages/Vote.tsx:10-16`

- [ ] **Step 1: 创建 types.ts**

```typescript
// frontend/src/types.ts
export interface Work {
  id: string;
  work_number: string;
  name_masked: string;
  images: string[];
  vote_count: number;
}

export interface AdminWork {
  id: string;
  work_number: string | null;
  contestant_name: string;
  contestant_phone: string;
  contestant_tax_id: string;
  contestant_address?: string;
  images: string[];
  status: string;
  reject_reason: string | null;
  created_at: string;
}
```

- [ ] **Step 2: 修改 Showcase.tsx — 删除本地 Work 定义，import types**

删除第 9-14 行的 `interface Work { ... }`，在文件顶部 import 区添加：
```typescript
import type { Work } from "../types";
```

- [ ] **Step 3: 修改 Vote.tsx — 删除本地 Work 定义，import types**

删除第 10-16 行的 `interface Work { ... }`，在文件顶部 import 区添加：
```typescript
import type { Work } from "../types";
```

- [ ] **Step 4: 编译验证**

```bash
cd frontend && npm run build
```
Expected: Build succeeds with no errors.

---

### Task 2: 删除死代码

**Files:**
- Delete: `frontend/src/components/Banner.tsx`
- Delete: `frontend/src/design-tokens.css`
- Delete: `frontend/src/assets/react.svg`
- Delete: `frontend/src/assets/vite.svg`

- [ ] **Step 1: 删除 4 个未引用文件**

```bash
rm frontend/src/components/Banner.tsx
rm frontend/src/design-tokens.css
rm frontend/src/assets/react.svg
rm frontend/src/assets/vite.svg
```

- [ ] **Step 2: 编译验证**

```bash
cd frontend && npm run build
```
Expected: Build succeeds with no errors.

---

### Task 3: Mock 文件添加 Demo 注释

**Files:**
- Modify: `frontend/src/api/mock.ts:59`

- [ ] **Step 1: 在 MOCK_USERS 上方添加注释**

在 `const MOCK_USERS` 行前插入：
```typescript
// ⚠️ DEMO ONLY — 仅用于本地开发和演示，请勿将密码提交到生产环境
```

- [ ] **Step 2: 编译验证**

```bash
cd frontend && npm run build
```
Expected: Build succeeds with no errors.

---

### Task 4: sessionStorage 操作统一包装

**Files:**
- Create: `frontend/src/utils/storage.ts`
- Modify: `frontend/src/components/AuthGuard.tsx`
- Modify: `frontend/src/components/ProtectedRoute.tsx`
- Modify: `frontend/src/hooks/useAuth.ts`
- Modify: `frontend/src/hooks/useLanguage.tsx`
- Modify: `frontend/src/components/AdminLayout.tsx`

- [ ] **Step 1: 创建 storage.ts 工具函数**

```typescript
// frontend/src/utils/storage.ts
function getItem(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function setItem(key: string, value: string): void {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    // silent — storage unavailable (e.g. private browsing)
  }
}

function removeItem(key: string): void {
  try {
    sessionStorage.removeItem(key);
  } catch {
    // silent
  }
}

export const storage = { getItem, setItem, removeItem };
```

- [ ] **Step 2: 替换 AuthGuard.tsx**

```diff
- const authorized = sessionStorage.getItem("data_authorized") === "1";
+ import { storage } from "../utils/storage";
+ const authorized = storage.getItem("data_authorized") === "1";
```

- [ ] **Step 3: 替换 ProtectedRoute.tsx**

```diff
- const token = sessionStorage.getItem("admin_token");
+ import { storage } from "../utils/storage";
+ const token = storage.getItem("admin_token");
```

- [ ] **Step 4: 替换 useAuth.ts**

将所有 `sessionStorage.getItem/setItem/removeItem` 替换为 `storage.getItem/setItem/removeItem`。导入 `storage`。

具体替换：
- `sessionStorage.getItem("admin_token")` → `storage.getItem("admin_token")`
- `sessionStorage.setItem(...)` → `storage.setItem(...)`
- `sessionStorage.removeItem(...)` → `storage.removeItem(...)`

- [ ] **Step 5: 替换 useLanguage.tsx**

该文件已有 try-catch，但仍统一改用 `storage`。替换 `sessionStorage.getItem(STORAGE_KEY)` 和 `sessionStorage.setItem(STORAGE_KEY, lang)`。

`detectLanguage` 中的 try-catch 可简化因为 `storage.getItem` 内部已处理异常。

- [ ] **Step 6: 替换 AdminLayout.tsx**

```diff
- const isMock = sessionStorage.getItem("mock_mode") === "1";
+ import { storage } from "../utils/storage";
+ const isMock = storage.getItem("mock_mode") === "1";
```

- [ ] **Step 7: 编译验证**

```bash
cd frontend && npm run build
```
Expected: Build succeeds with no errors.

---

### Task 5: Review 页 workNumber 状态隔离

**Files:**
- Modify: `frontend/src/pages/admin/Review.tsx`

- [ ] **Step 1: 将 workNumber 改为按 workId 索引的 Record**

```diff
- const [workNumber, setWorkNumber] = useState("");
+ const [workNumbers, setWorkNumbers] = useState<Record<string, string>>({});
```

- [ ] **Step 2: 修改 handleApprove 取值逻辑**

```diff
  const handleApprove = async (workId: string) => {
    ...
    try {
      const body: { work_number?: string } = {};
-     if (workNumber.trim()) body.work_number = workNumber.trim();
+     const num = workNumbers[workId]?.trim();
+     if (num) body.work_number = num;
      await api.post(`/api/admin/works/${workId}/approve`, body);
-     setWorkNumber("");
+     setWorkNumbers(prev => { const next = { ...prev }; delete next[workId]; return next; });
      fetchWorks();
```

- [ ] **Step 3: 修改输入框绑定**

```diff
  <input
    type="text"
-   value={workNumber}
-   onChange={(e) => setWorkNumber(e.target.value)}
+   value={workNumbers[work.id] || ""}
+   onChange={(e) => setWorkNumbers(prev => ({ ...prev, [work.id]: e.target.value }))}
    placeholder="作品编号（可选）"
    ...
  />
```

- [ ] **Step 4: 编译验证**

```bash
cd frontend && npm run build
```
Expected: Build succeeds with no errors.

---

### Task 6: Export 页下载失败改用内联错误提示

**Files:**
- Modify: `frontend/src/pages/admin/Export.tsx`

- [ ] **Step 1: 添加 error state**

在 `Export` 组件中添加：
```typescript
const [downloadError, setDownloadError] = useState("");
```

- [ ] **Step 2: 替换 alert 为 setDownloadError**

```diff
  .catch(() => {
-   alert("下载失败，请稍后重试");
+   setDownloadError("下载失败，请稍后重试");
+   setTimeout(() => setDownloadError(""), 3000);
  });
```

- [ ] **Step 3: 添加 JSX 错误提示**

在 `<h2>` 之后、`<div className="grid...">` 之前添加：
```tsx
{downloadError && (
  <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-md">
    {downloadError}
  </div>
)}
```

- [ ] **Step 4: 编译验证**

```bash
cd frontend && npm run build
```
Expected: Build succeeds with no errors.

---

### Task 7: 投票成功后改全页刷新为状态更新

**Files:**
- Modify: `frontend/src/pages/Vote.tsx`

- [ ] **Step 1: 添加 refreshKey state**

```diff
  const [usingMock, setUsingMock] = useState(false);
+ const [refreshKey, setRefreshKey] = useState(0);
  const size = 8;
```

- [ ] **Step 2: 修改 fetchWorks useEffect 依赖**

```diff
- }, [page]);
+ }, [page, refreshKey]);
```

- [ ] **Step 3: 修改投票成功回调**

```diff
- onSuccess={() => { setVotingWorkId(null); setVoteSuccess("投票成功！"); setTimeout(() => { setVoteSuccess(null); window.location.reload(); }, 1500); }}
+ onSuccess={() => { setVotingWorkId(null); setVoteSuccess("投票成功！"); setPage(1); setRefreshKey(k => k + 1); setTimeout(() => { setVoteSuccess(null); }, 2000); }}
```

- [ ] **Step 4: 编译验证**

```bash
cd frontend && npm run build
```
Expected: Build succeeds with no errors.

---

### Task 8: Config 页去除密码明文展示

**Files:**
- Modify: `frontend/src/pages/admin/Config.tsx`

- [ ] **Step 1: 删除表格"密码"列头**

删除 `<th className="...">密码</th>` 这一行（实际上当前表格头是 用户ID、角色、说明 三列，密码在说明列的 `{isMockMode() ? ` — 密码: ${user.pwd}` : ""}` 里）。

- [ ] **Step 2: 删除密码展示和内联 pwd 字段**

```diff
  <td className="...">
-   {user.desc}{isMockMode() ? ` — 密码: ${user.pwd}` : ""}
+   {user.desc}
  </td>
```

同时移除 user 数据中的 `pwd` 字段：
```diff
- { id: "admin", role: "超级管理员", desc: "系统超级管理员", pwd: "admin123" },
+ { id: "admin", role: "超级管理员", desc: "系统超级管理员" },
- { id: "scorer_a", role: "评分员A", desc: "A维度评分（品牌）", pwd: "scorer123" },
+ { id: "scorer_a", role: "评分员A", desc: "A维度评分（品牌）" },
- { id: "scorer_b", role: "评分员B", desc: "B维度评分（视觉）", pwd: "scorer123" },
+ { id: "scorer_b", role: "评分员B", desc: "B维度评分（视觉）" },
- { id: "scorer_c", role: "评分员C", desc: "C维度评分（陈列）", pwd: "scorer123" },
+ { id: "scorer_c", role: "评分员C", desc: "C维度评分（陈列）" },
- { id: "scorer_d", role: "评分员D", desc: "D维度评分（执行）", pwd: "scorer123" },
+ { id: "scorer_d", role: "评分员D", desc: "D维度评分（执行）" },
```

- [ ] **Step 2: 编译验证**

```bash
cd frontend && npm run build
```
Expected: Build succeeds with no errors.

---

### Task 9: useVoteStatus Hook 添加 error 状态

**Files:**
- Modify: `frontend/src/hooks/useVoteStatus.ts`

- [ ] **Step 1: 添加 isError state 和 catch 处理**

```diff
  import { useState, useEffect } from "react";
  import api from "../api/client";

  export function useVoteStatus() {
    const [status, setStatus] = useState<"open" | "closed" | "not_started">("closed");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);
+   const [error, setError] = useState(false);

    useEffect(() => {
      api.get("/api/vote/status")
        .then((res) => {
          setStatus(res.data.channel_status);
          setMessage(res.data.custom_message || "");
        })
+       .catch(() => setError(true))
        .finally(() => setLoading(false));
    }, []);

-   return { status, message, loading };
+   return { status, message, loading, isError: error };
  }
```

- [ ] **Step 2: 编译验证**

```bash
cd frontend && npm run build
```
Expected: Build succeeds with no errors.

---

## 最终验证

全部 9 项完成后：

```bash
cd frontend && npm run build && npm test
```
Expected: Build succeeds, all tests pass.

# 20 周年橱窗大赛 H5 前端重做 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> Each Phase can be executed in a separate conversation. Phase 0 must complete first; Phases A-B depend on Phase 0; Phases C-G depend on Phase 0 and are mutually independent.

**Goal:** 基于 `.pen` 原型重做全部公开前台页面：手机端 H5 + PC 端三段式布局，新增数据授权网关页。

**Architecture:** React 18 + Vite + Tailwind CSS，保留现有后端 API。手机端 375px 单列深色 hero 长卷；PC >= 768px 共享 Header nav + Banner + Content 卡片。AuthGuard 包裹公开路由拦截首次访问。

**Tech Stack:** React 19 + TypeScript + Vite 8 + Tailwind CSS 4 + react-router-dom 7 + axios + lucide-react icons

---

## Dependency Graph

```
Phase 0 (Foundation) ──┬── Phase A (Auth)      ← 新对话
                       ├── Phase B (Home)      ← 新对话
                       ├── Phase C (Register)  ← 新对话
                       ├── Phase D (Showcase)  ← 新对话
                       ├── Phase E (Rules)     ← 新对话
                       ├── Phase F (Awards)    ← 新对话
                       └── Phase G (Vote)      ← 新对话
```

**执行顺序：** 先完成 Phase 0，之后 A-G 可在任意顺序、任意对话中并行执行。

---

## Phase 0: Foundation（先决条件）

**对话编号：1/8**  
**产出：** 更新全局样式、Layout、路由、AuthGuard

### Task 0.1: Update global CSS for mobile H5 + responsive

**Files:**
- Modify: `frontend/src/index.css`

- [ ] **Step 1: Add mobile-first responsive styles**

在 `@theme` 块后追加：

```css
/* Mobile H5 container */
@media (max-width: 767px) {
  .h5-page {
    @apply min-h-screen flex flex-col;
    max-width: 100vw;
    overflow-x: hidden;
  }
  .h5-hero {
    @apply relative flex flex-col items-center justify-center;
    background: linear-gradient(180deg, #1a0a0a 0%, #4a1515 40%, #8B1A1A 100%);
    min-height: 100vh;
  }
  .h5-card {
    @apply bg-white rounded-xl shadow-sm mx-4;
  }
}

/* PC layout */
@media (min-width: 768px) {
  .pc-content {
    @apply max-w-6xl mx-auto px-6;
  }
}

/* Hide PC header nav on mobile, show mobile bottom nav */
@media (max-width: 767px) {
  .pc-header-nav { display: none; }
  .mobile-only { display: flex; }
}
@media (min-width: 768px) {
  .pc-header-nav { display: flex; }
  .mobile-only { display: none; }
}
```

- [ ] **Step 2: Verify CSS compiles**  
  Run: `cd frontend && npx tailwindcss -i src/index.css -o /dev/null --no-hashing`  
  Expected: No errors

- [ ] **Step 3: Commit**
  ```bash
  git add frontend/src/index.css
  git commit -m "feat: add mobile H5 + responsive base styles"
  ```

### Task 0.2: Update Layout.tsx for responsive header

**Files:**
- Modify: `frontend/src/components/Layout.tsx`

- [ ] **Step 1: Add mobile-only class to existing header nav**  
  给现有 `<nav>` 加 `className="pc-header-nav grid grid-cols-5 ..."`（PC 显示，移动端隐藏）

- [ ] **Step 2: Add mobile top bar**  
  在 header 内加简化的移动端顶栏（仅 Logo + 标题，无 nav）：
  
  ```tsx
  <div className="mobile-only flex items-center gap-3">
    <img src={`${BASE}assets/logo-gold.png`} className="w-10 h-6 object-contain" />
    <span className="font-bold text-sm">中汇文具 20 周年</span>
  </div>
  ```

- [ ] **Step 3: Verify layout**  
  Run: `cd frontend && npm run build`  
  Expected: No TSX errors

- [ ] **Step 4: Commit**
  ```bash
  git add frontend/src/components/Layout.tsx
  git commit -m "feat: responsive Layout header for mobile/PC"
  ```

### Task 0.3: Create AuthGuard component

**Files:**
- Create: `frontend/src/components/AuthGuard.tsx`

- [ ] **Step 1: Create AuthGuard**

```tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [checked, setChecked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const authorized = sessionStorage.getItem("data_authorized");
    if (authorized !== "1") {
      navigate("/auth", { replace: true });
    }
    setChecked(true);
  }, [navigate]);

  if (!checked) return null;
  return <>{children}</>;
}
```

- [ ] **Step 2: Commit**
  ```bash
  git add frontend/src/components/AuthGuard.tsx
  git commit -m "feat: add AuthGuard component for data authorization gate"
  ```

### Task 0.4: Update App.tsx routing

**Files:**
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: Add imports and routes**

```tsx
import AuthGuard from "./components/AuthGuard";
import Auth from "./pages/Auth";
import Home from "./pages/Home";

// Wrap public routes with AuthGuard:
<Route element={<AuthGuard><Layout /></AuthGuard>}>
  <Route path="/" element={<Home />} />
  <Route path="/register" element={<Register />} />
  {/* ... existing routes ... */}
</Route>
<Route path="/auth" element={<Auth />} />
```

- [ ] **Step 2: Verify build passes (will fail until Auth.tsx/Home.tsx created — expected)**  
  Run: `cd frontend && npx tsc --noEmit 2>&1 | head -20`  
  Expected: Errors only about missing Auth/Home modules — acceptable at this stage

- [ ] **Step 3: Commit**
  ```bash
  git add frontend/src/App.tsx
  git commit -m "feat: add /auth and /home routes with AuthGuard wrapper"
  ```

---

## Phase A: Auth Page（数据授权页）

**对话编号：2/8**  
**依赖：** Phase 0 完成  
**产出：** `frontend/src/pages/Auth.tsx`

### Task A.1: Create Auth page

**Files:**
- Create: `frontend/src/pages/Auth.tsx`

- [ ] **Step 1: Create Auth.tsx — mobile layout**

```tsx
import { useNavigate } from "react-router-dom";

const BASE = import.meta.env.BASE_URL;

export default function Auth() {
  const navigate = useNavigate();

  const handleConfirm = () => {
    sessionStorage.setItem("data_authorized", "1");
    navigate("/", { replace: true });
  };

  const handleCancel = () => {
    // stay on page or navigate to external
  };

  return (
    <div className="h5-page">
      {/* Mobile */ }
      <div className="md:hidden h5-hero px-6 pt-12 pb-8 flex flex-col items-center justify-between">
        {/* Logo + Title */ }
        <div className="flex flex-col items-center gap-3 mt-8">
          <img src={`${BASE}assets/logo-gold.png`} alt="Logo" className="w-[110px] h-[46px] object-contain" />
          <h1 className="text-2xl font-bold text-white text-center">特别橱窗大赛</h1>
          <p className="text-[9px] text-white/70 text-center max-w-[250px] leading-relaxed">
            · Concurso de escaparate especial · Edicion especial del 20.
          </p>
        </div>

        {/* Auth Card */ }
        <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 max-w-[322px] w-full my-8">
          <p className="text-[22px] font-bold text-[#61636C] text-center mb-5">iResearch</p>
          <p className="text-[11px] text-white leading-relaxed mb-3">
            为保障活动的公平性与透明度，参与者授权主办方收集并使用报名信息用于活动管理
          </p>
          <p className="text-[11px] text-white leading-relaxed mb-3">
            所有活动数据将通过第三方专业数据管理平台进行自动化记录、存储、统计与核验，确保参与资格、抽奖结果及评选数据真实有效
          </p>
          <p className="text-[11px] text-white leading-relaxed">
            主办方承诺严格遵守相关数据保护规定，对参与者信息进行安全管理，未经授权不会向第三方披露或用于其他商业用途
          </p>
        </div>

        {/* Buttons */ }
        <div className="flex gap-6 mt-4 mb-8">
          <button
            onClick={handleCancel}
            className="w-[118px] h-[56px] bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white text-[22px] font-bold"
          >
            取消授权
          </button>
          <button
            onClick={handleConfirm}
            className="w-[118px] h-[56px] bg-brand-red rounded-xl text-white text-[22px] font-bold"
          >
            确认授权
          </button>
        </div>
      </div>

      {/* PC layout */ }
      <div className="hidden md:flex min-h-screen items-center justify-center bg-gradient-to-b from-[#1a0a0a] via-[#4a1515] to-[#8B1A1A]">
        <div className="flex flex-col items-center gap-8 max-w-md">
          <img src={`${BASE}assets/logo-gold.png`} alt="Logo" className="w-[220px] h-[88px] object-contain" />
          <h1 className="text-5xl font-bold text-white text-center">特别橱窗大赛</h1>
          <p className="text-base text-white/70 text-center max-w-[700px]">
            · Concurso de escaparate especial · Edicion especial del 20.
          </p>
          <div className="bg-white/70 backdrop-blur-md rounded-2xl p-8 w-full">
            <p className="text-4xl font-bold text-[#61636C] text-center mb-5">iResearch</p>
            <p className="text-2xl text-white leading-relaxed mb-3">
              为保障活动的公平性与透明度，参与者授权主办方收集并使用报名信息用于活动管理
            </p>
            <p className="text-2xl text-white leading-relaxed mb-3">
              所有活动数据将通过第三方专业数据管理平台进行自动化记录、存储、统计与核验，确保参与资格、抽奖结果及评选数据真实有效
            </p>
            <p className="text-2xl text-white leading-relaxed">
              主办方承诺严格遵守相关数据保护规定，对参与者信息进行安全管理，未经授权不会向第三方披露或用于其他商业用途
            </p>
          </div>
          <div className="flex gap-6">
            <button onClick={handleCancel} className="px-12 py-4 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white text-3xl font-bold">
              取消授权
            </button>
            <button onClick={handleConfirm} className="px-12 py-4 bg-brand-red rounded-xl text-white text-3xl font-bold">
              确认授权
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**  
  Run: `cd frontend && npm run build`  
  Expected: No errors (if Home.tsx still missing, that's expected in a separate phase)

- [ ] **Step 3: Commit**
  ```bash
  git add frontend/src/pages/Auth.tsx
  git commit -m "feat: add data authorization gateway page (mobile + PC)"
  ```

---

## Phase B: Home Page（H5 首页落地页）

**对话编号：3/8**  
**依赖：** Phase 0 完成  
**产出：** `frontend/src/pages/Home.tsx`

### Task B.1: Create Home page

**Files:**
- Create: `frontend/src/pages/Home.tsx`

- [ ] **Step 1: Create Home.tsx with mobile H5 hero + PC card layout**

```tsx
import { Link } from "react-router-dom";
import { ClipboardList, Image, ThumbsUp, ScrollText, Trophy } from "lucide-react";

const BASE = import.meta.env.BASE_URL;

export default function Home() {
  return (
    <div className="h5-page">
      {/* === Mobile H5 Hero === */}
      <div className="md:hidden h5-hero px-4">
        {/* Logo */}
        <img src={`${BASE}assets/logo-gold.png`} alt="Logo" className="w-[227px] h-[95px] object-contain mt-20" />

        {/* Main Hero Mark */}
        <img src={`${BASE}assets/hero.png`} alt="Main Visual" className="w-[223px] h-[299px] object-contain my-8" />

        {/* Navigation Buttons */}
        <div className="flex flex-col gap-4 w-full max-w-[280px]">
          <Link to="/register" className="bg-brand-red text-white text-[22px] font-bold py-4 rounded-xl text-center shadow-lg hover:bg-red-800 transition-colors">
            报名参赛
          </Link>
          <Link to="/showcase" className="bg-brand-gold text-white text-[22px] font-bold py-4 rounded-xl text-center shadow-lg hover:bg-amber-700 transition-colors">
            作品展示
          </Link>
          <Link to="/vote" className="bg-brand-red text-white text-[22px] font-bold py-4 rounded-xl text-center shadow-lg hover:bg-red-800 transition-colors">
            人气投票
          </Link>
        </div>

        {/* Bottom Links */}
        <div className="flex gap-4 mt-8 mb-12">
          <Link to="/rules" className="text-white/80 text-[16px] underline underline-offset-4">赛制规则</Link>
          <span className="text-white/40">|</span>
          <Link to="/awards" className="text-white/80 text-[16px] underline underline-offset-4">赛事奖项</Link>
        </div>
      </div>

      {/* === PC Layout === */}
      <div className="hidden md:block">
        {/* Banner */}
        <div className="relative bg-gradient-to-b from-[#1a0a0a] via-[#6B1A1A] to-[#a02020] h-[300px] flex items-center justify-center">
          <div className="text-center">
            <img src={`${BASE}assets/logo-gold.png`} alt="Logo" className="w-[180px] h-[75px] object-contain mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white">中汇文具 20 周年 · 特别橱窗大赛</h1>
            <p className="text-white/70 mt-2">用橱窗展现你的创意，赢取丰厚奖品</p>
          </div>
        </div>

        {/* Card Grid */}
        <div className="max-w-6xl mx-auto px-6 -mt-8 relative z-10 pb-12">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="grid grid-cols-3 gap-6">
              <Link to="/register" className="flex flex-col items-center gap-4 p-6 rounded-xl bg-brand-rose hover:bg-red-100 transition-colors group">
                <ClipboardList className="w-10 h-10 text-brand-red" />
                <span className="text-lg font-bold text-brand-red group-hover:text-red-800">报名参赛</span>
                <span className="text-sm text-text-muted text-center">提交您的橱窗作品，参与评选</span>
              </Link>
              <Link to="/showcase" className="flex flex-col items-center gap-4 p-6 rounded-xl bg-brand-cream hover:bg-amber-100 transition-colors group">
                <Image className="w-10 h-10 text-brand-gold" />
                <span className="text-lg font-bold text-brand-gold group-hover:text-amber-800">作品展示</span>
                <span className="text-sm text-text-muted text-center">浏览所有参赛橱窗作品</span>
              </Link>
              <Link to="/vote" className="flex flex-col items-center gap-4 p-6 rounded-xl bg-brand-pink hover:bg-red-100 transition-colors group">
                <ThumbsUp className="w-10 h-10 text-brand-red" />
                <span className="text-lg font-bold text-brand-red group-hover:text-red-800">人气投票</span>
                <span className="text-sm text-text-muted text-center">为您喜欢的作品投上一票</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**  
  Run: `cd frontend && npm run build`  
  Expected: No errors

- [ ] **Step 3: Commit**
  ```bash
  git add frontend/src/pages/Home.tsx
  git commit -m "feat: add H5 home landing page with mobile hero + PC cards"
  ```

---

## Phase C: Register Page（报名上传页）

**对话编号：4/8**  
**依赖：** Phase 0 完成  
**产出：** `frontend/src/pages/Register.tsx`（重写）

### Task C.1: Rewrite Register page

**Files:**
- Modify: `frontend/src/pages/Register.tsx`

- [ ] **Step 1: Rewrite Register.tsx**

核心要求：
- 移动端：深色 hero 顶部 + 表单卡片（姓名/地址/电话/税号 四个输入框）+ 红色上传按钮 + 两张信息卡片（报名须知 + 参赛规则）
- PC 端：Header + Banner + 居中内容卡片，表单两列布局
- 上传限 3 张，满 3 张隐藏上传入口，每张缩略图带删除按钮
- 调用现有 `POST /api/register` 接口

**关键代码结构：**

```tsx
import { useState } from "react";
import { Upload, X } from "lucide-react";
import api from "../api/client";

const BASE = import.meta.env.BASE_URL;

export default function Register() {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [taxId, setTaxId] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const MAX_IMAGES = 3;

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) return;
    const toAdd = files.slice(0, remaining);
    setImages(prev => [...prev, ...toAdd]);
    toAdd.forEach(f => {
      const url = URL.createObjectURL(f);
      setPreviews(prev => [...prev, url]);
    });
  };

  const removeImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
    setPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    // validation...
    const formData = new FormData();
    formData.append("name", name);
    formData.append("address", address);
    formData.append("phone", phone);
    formData.append("tax_id", taxId);
    images.forEach(img => formData.append("images", img));

    setSubmitting(true);
    try {
      const res = await api.post("/api/register", formData);
      setSuccess(res.data.message);
    } catch (err: any) {
      setError(err.response?.data?.detail || "报名失败");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h5-page">
      {/* Mobile layout: dark hero + form card + info cards */ }
      {/* PC layout: Header + Banner + 2-column form card */ }
    </div>
  );
}
```

完整实现包含 mobile 和 PC 两套 JSX。

- [ ] **Step 2: Verify build**  
  Run: `cd frontend && npm run build`  
  Expected: No errors

- [ ] **Step 3: Commit**
  ```bash
  git add frontend/src/pages/Register.tsx
  git commit -m "feat: rewrite Register page per prototype (3-image limit, mobile + PC)"
  ```

---

## Phase D-G: Remaining Pages（剩余页面）

**对话编号：5/8, 6/8, 7/8, 8/8**  
**依赖：** Phase 0 完成，Phase C-G 互不依赖，可并行。

### Common Pattern

每个 Phase 遵循相同结构：
1. 重写对应 `frontend/src/pages/<Page>.tsx`
2. 移动端：深色 hero + 页面内容卡片堆叠
3. PC 端：共享 Header + Banner + `max-w-6xl` 居中内容卡片
4. 验证构建通过
5. 提交

### Phase D: Showcase Page (`frontend/src/pages/Showcase.tsx`)

- 搜索框 + 排序下拉
- 作品网格：缩略图 + 编号/票数叠加 + 参赛者名，PC 四列、移动端两列
- 分页导航
- 调用现有 `GET /api/works`

### Phase E: Rules Page (`frontend/src/pages/Rules.tsx`)

- 5 个编号步骤（参赛资格/作品要求/报名流程/评审规则/投票规则）
- 移动端竖向堆叠，PC 两列
- 底部黄底特别说明条
- 纯静态内容，无需 API

### Phase F: Awards Page (`frontend/src/pages/Awards.tsx`)

- 三段：专业评审类 / 人气投票类 / 特别奖项
- 每项卡片：左奖项名 + 右金色金额
- 金线分隔
- 纯静态内容

### Phase G: Vote Page (`frontend/src/pages/Vote.tsx`)

- 顶部通道状态指示条
- 作品网格 + 投票按钮
- PC 四列、移动端两列，分页
- 复用 `PhoneModal` 进行手机号验证
- 调用 `GET /api/vote/status` + `GET /api/works` + `POST /api/vote`

---

## Verification

全部 Phase 完成后，在任意对话中运行：

```bash
cd frontend && npm run build && npm run dev
```

然后检查 `/auth` → `/` → 各页面在 375px 和 1280px 视口的显示效果。

# Phase A: 数据授权页

> 复制以下内容到新对话窗口执行

## 任务

创建 `frontend/src/pages/Auth.tsx`，数据授权网关全屏页。

## 要求

- **移动端 (375px)**：深色全屏背景，上方 Logo + 标题 + 西班牙语副标题，中央半透明授权卡片（iResearch + 三段隐私声明），底部两个等宽按钮。确认后写 `sessionStorage.setItem("data_authorized", "1")` 跳转 `/`。
- **PC 端 (>=768px)**：居中卡片布局，`max-w-md`。

## 文件

- Create: `frontend/src/pages/Auth.tsx`
- 详细代码参考: `docs/superpowers/plans/2026-06-24-showcase-h5-frontend.md` Phase A

## 验证

```bash
cd frontend && npm run build
```

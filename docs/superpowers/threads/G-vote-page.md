# Phase G: 人气投票页

> 复制以下内容到新对话窗口执行

## 任务

重写 `frontend/src/pages/Vote.tsx`，人气投票页。

## 要求

- 顶部通道状态指示条（调用 `GET /api/vote/status`，绿色 badge 显示状态）
- 作品网格 + 金色投票按钮。PC 四列、移动端两列。分页。
- 点击投票 → 弹出 PhoneModal 验证手机号 → 调用 `POST /api/vote`。
- 复用现有 `frontend/src/components/PhoneModal.tsx`。

## 文件

- Rewrite: `frontend/src/pages/Vote.tsx`
- Reuse: `frontend/src/components/PhoneModal.tsx`, `frontend/src/api/client.ts`
- 参考现有接口: `docs/API接口文档.md`

## 验证

```bash
cd frontend && npm run build
```

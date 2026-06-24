# Phase D: 作品展示页

> 复制以下内容到新对话窗口执行

## 任务

重写 `frontend/src/pages/Showcase.tsx`，作品展示页。

## 要求

- 搜索框 + 排序下拉（按编号/最新/票数）
- 作品网格：缩略图占位 + 编号/票数叠加文字 + 参赛者名称
- PC 四列、移动端两列。分页导航。
- 调用现有 `GET /api/works`（search, sort, page, size 参数）。

## 文件

- Rewrite: `frontend/src/pages/Showcase.tsx`
- Reuse: `frontend/src/api/client.ts`, `frontend/src/components/WorkCard.tsx`
- 参考现有接口: `docs/API接口文档.md`

## 验证

```bash
cd frontend && npm run build
```

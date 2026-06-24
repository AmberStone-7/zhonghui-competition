# Phase C: 报名上传页

> 复制以下内容到新对话窗口执行

## 任务

重写 `frontend/src/pages/Register.tsx`，报名上传页。

## 要求

- **移动端**：深色 hero 顶部 + 表单卡片（姓名/地址/电话/税号 四个圆角输入框）+ 红色上传按钮。上传区限 3 张，满 3 张隐藏入口，每张缩略图可删除。下方两张信息卡片（报名须知 + 参赛规则）。
- **PC 端**：Header + Banner + 居中内容卡片，表单两列布局。
- 调用现有 `POST /api/register`（multipart/form-data）。

## 文件

- Rewrite: `frontend/src/pages/Register.tsx`
- 参考现有接口: `docs/API接口文档.md`

## 验证

```bash
cd frontend && npm run build
```

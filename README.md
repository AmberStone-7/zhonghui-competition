# 中汇文具 20 周年特别橱窗大赛系统

## 技术架构

- **前端**: React 18 + Vite + Tailwind CSS → 部署 Vercel
- **后端**: Python FastAPI + SQLAlchemy (async) → 部署 Railway
- **数据库**: Supabase PostgreSQL
- **存储**: Supabase Storage (图片上传)

## 本地开发

### 后端

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env  # 编辑环境变量
alembic upgrade head
python -m app.utils.seed
uvicorn app.main:app --reload
```

### 前端

```bash
cd frontend
npm install
cp .env.example .env  # 编辑 API URL
npm run dev
```

## 部署

### Railway (后端)

1. 创建 Railway 项目，连接 GitHub 仓库
2. 设置环境变量 (参照 .env.example)
3. 自动部署，启动时执行 migration + seed + 启动服务

### Vercel (前端)

1. 导入 frontend 目录
2. 设置 `VITE_API_URL` 为 Railway 后端 URL
3. 自动部署

## 管理账户

初始账户 (由 seed 脚本创建):
- 超级管理员: admin / admin123
- 评分员 A: scorer_a / score123
- 评分员 B: scorer_b / score123
- 评分员 C: scorer_c / score123
- 评分员 D: scorer_d / score123

⚠️ 生产环境请务必修改默认密码和 JWT_SECRET_KEY。

# 中汇文具 20 周年特别橱窗大赛系统

## 技术架构

- **前端**: React 18 + Vite + Tailwind CSS → 构建后由 FastAPI 提供静态资源
- **后端**: Python FastAPI + SQLAlchemy (async) → 部署 Railway
- **数据库**: Supabase PostgreSQL
- **存储**: Supabase Storage (图片上传)
- **部署方式**: 前后端统一通过 Railway Docker 服务部署

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

### Railway (前后端统一部署)

1. 创建 Railway 项目，连接 GitHub 仓库
2. 设置环境变量 (参照 .env.example)
3. 使用根目录 `Dockerfile` 构建镜像
4. Dockerfile 会完成前端构建，并将产物复制到 `/app/static`
5. 服务启动时执行 `bash startup.sh`，当前启动脚本仅负责启动 `uvicorn`

## 管理账户

初始账户 (由 seed 脚本创建):
- 超级管理员: admin / admin123
- 评分员 A: scorer_a / scorer123
- 评分员 B: scorer_b / scorer123
- 评分员 C: scorer_c / scorer123
- 评分员 D: scorer_d / scorer123

⚠️ 生产环境请务必修改默认密码和 JWT_SECRET_KEY。

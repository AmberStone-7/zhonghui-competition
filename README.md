# 中汇文具 20 周年特别橱窗大赛系统

## 技术架构

- **前端**: React 19 + Vite 8 + Tailwind CSS 4 + TypeScript → 构建后由 FastAPI 提供静态资源
- **后端**: Python FastAPI + SQLAlchemy 2.0 (async) → 部署 Railway
- **数据库**: Supabase PostgreSQL
- **存储**: Supabase Storage (图片上传)
- **测试**: Vitest + Testing Library (15 个测试)
- **部署方式**: 前后端统一通过 Railway Docker 服务部署

## 前端页面

| 页面 | 路径 | 说明 |
|------|------|------|
| 授权页 | `/auth` | 首次访问需确认数据授权 |
| 首页 | `/` | 手机端 Hero+按钮，PC 端三列卡片入口 |
| 报名上传 | `/register` | 表单 + 1-3 张图片上传 |
| 作品展示 | `/showcase` | 搜索/排序/分页，API 不可用时自动降级 mock 数据 |
| 人气投票 | `/vote` | 按票数排序，手机号验证投票 |
| 赛制规则 | `/rules` | 五类规则说明 |
| 赛事奖项 | `/awards` | 三类奖项展示 |
| 管理后台 | `/admin/*` | 审核/评分/排名/导出 |

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
npm run dev
# 访问 http://localhost:5173/static/
```

### 测试

```bash
cd frontend
npm test           # 15 个测试
npm run build      # 生产构建
```

## 部署

### Railway (前后端统一部署)

1. 创建 Railway 项目，连接 GitHub 仓库
2. 设置环境变量 (参照 .env.example)
3. 使用根目录 `Dockerfile` 构建镜像
4. Dockerfile 构建时执行 `npm run build -- --base /static/`，产物复制到 `/app/static`
5. 服务启动时执行 `bash startup.sh` 启动 uvicorn

## 管理账户

初始账户 (由 seed 脚本创建):
- 超级管理员: admin / admin123
- 评分员 A: scorer_a / scorer123
- 评分员 B: scorer_b / scorer123
- 评分员 C: scorer_c / scorer123
- 评分员 D: scorer_d / scorer123

⚠️ 生产环境请务必修改默认密码和 JWT_SECRET_KEY。

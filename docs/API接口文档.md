# API 接口文档

> 基础路径: 所有接口均以 `/api` 为前缀
> 认证方式: Bearer Token (JWT)，通过 `Authorization: Bearer <token>` 请求头传递
> 数据格式: JSON (报名接口除外，使用 multipart/form-data)

---

## 目录

- [1. 系统接口](#1-系统接口)
- [2. 公开接口 (无需认证)](#2-公开接口)
- [3. 管理端接口 (需要 JWT 认证)](#3-管理端接口)

---

## 1. 系统接口

### 1.1 健康检查

| 项目 | 说明 |
|------|------|
| **方法** | `GET` |
| **路径** | `/api/health` |
| **认证** | 无 |

**返回：**

```json
{
  "status": "ok"
}
```

---

## 2. 公开接口

### 2.1 参赛报名

| 项目 | 说明 |
|------|------|
| **方法** | `POST` |
| **路径** | `/api/register` |
| **认证** | 无 |
| **Content-Type** | `multipart/form-data` |

**请求参数 (Form Data)：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `name` | string | 是 | 参赛者姓名，2-20 字 |
| `address` | string | 是 | 门店地址 |
| `tax_id` | string | 是 | 税号 (唯一标识) |
| `phone` | string | 是 | 手机号，11 位，以 1 开头 |
| `images` | file[] | 是 | 作品图片，1-3 张，支持 JPEG/PNG/WebP/HEIC，单张 <= 10MB |

**成功返回 (201)：**

```json
{
  "message": "报名成功！您的作品正在等待审核，审核通过后将获得专属作品编号。"
}
```

**错误码：**

| 状态码 | 场景 | detail |
|--------|------|--------|
| 400 | 姓名长度不合规 | 姓名须为 2-20 字 |
| 400 | 手机号格式错误 | 手机号格式错误 |
| 400 | 图片数量超限 | 最多上传 3 张图片 |
| 400 | 无图片 | 请上传至少一张作品图片 |
| 400 | 格式不支持 | 不支持的图片格式: {type}，仅支持 JPEG/PNG/WebP/HEIC |
| 400 | 文件过大 | 单张图片不能超过 10MB |
| 409 | 重复报名 (税号或手机号) | 该税号或电话号码已报名 |
| 503 | 报名通道关闭 | 报名通道已关闭 |

---

### 2.2 作品列表

| 项目 | 说明 |
|------|------|
| **方法** | `GET` |
| **路径** | `/api/works` |
| **认证** | 无 |

**查询参数：**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `search` | string | `""` | 搜索作品编号或参赛者姓名 (模糊匹配) |
| `sort` | string | `"number"` | 排序方式: `number` (按编号) / `latest` (最新) / `votes` (票数最高) |
| `page` | int | `1` | 页码 (>= 1) |
| `size` | int | `12` | 每页数量 (1-50) |

**返回 (200)：**

```json
{
  "data": [
    {
      "id": "uuid-string",
      "work_number": "ZH26-001",
      "name_masked": "张**",
      "images": ["https://..."],
      "vote_count": 42
    }
  ],
  "total": 100,
  "page": 1,
  "size": 12
}
```

> 仅返回 `status = approved` 的作品。姓名脱敏显示 (仅保留首字 + "**")。

---

### 2.3 获取投票通道状态

| 项目 | 说明 |
|------|------|
| **方法** | `GET` |
| **路径** | `/api/vote/status` |
| **认证** | 无 |

**返回 (200)：**

```json
{
  "channel_status": "open",
  "custom_message": ""
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `channel_status` | string | 通道状态: `open` / `closed` / `not_started` |
| `custom_message` | string | 自定义提示信息 (通道关闭/未开始时返回配置文案) |

---

### 2.4 投票

| 项目 | 说明 |
|------|------|
| **方法** | `POST` |
| **路径** | `/api/vote` |
| **认证** | 无 |

**请求体 (JSON)：**

```json
{
  "work_id": "uuid-string",
  "phone": "13800138000"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `work_id` | UUID | 是 | 作品 ID |
| `phone` | string | 是 | 投票者手机号，须以 1 开头的 11 位数字 |

**成功返回 (200)：**

```json
{
  "message": "投票成功",
  "new_vote_count": 43
}
```

**错误码：**

| 状态码 | 场景 | detail |
|--------|------|--------|
| 409 | 手机号重复投票 | 您已对该作品投过票 |
| 409 | IP 重复投票 | 该 IP 已对该作品投过票 |
| 404 | 作品不存在或未审核 | 作品不存在或未审核 |
| 503 | 投票通道未开启 | 投票通道未开启 |

> 防刷策略: 同一手机号对同一作品限投 1 次 + 同一 IP 对同一作品限投 1 次。

---

### 2.5 获取站点配置

| 项目 | 说明 |
|------|------|
| **方法** | `GET` |
| **路径** | `/api/config/{key}` |
| **认证** | 无 |

**路径参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `key` | string | 配置项键名 |

**返回 (200)：**

配置存在时直接返回 JSON value 对象：

```json
{
  "status": "open",
  "start_time": "2025-07-01",
  "end_time": "2025-08-31"
}
```

配置不存在时：

```json
{
  "value": null
}
```

---

## 3. 管理端接口

> 以下接口均需在请求头中携带有效的 JWT Token:
> `Authorization: Bearer <token>`

### 3.1 管理员登录

| 项目 | 说明 |
|------|------|
| **方法** | `POST` |
| **路径** | `/api/admin/login` |
| **认证** | 无 (登录接口本身不需要 Token) |

**请求体 (JSON)：**

```json
{
  "username": "admin",
  "password": "password123"
}
```

**成功返回 (200)：**

```json
{
  "token": "eyJhbGciOiJI...",
  "role": "super_admin"
}
```

**错误码：**

| 状态码 | 场景 | detail |
|--------|------|--------|
| 401 | 用户名或密码错误 | 用户名或密码错误 |
| 423 | 账户已锁定 | 账户已锁定，请联系管理员解锁 |

> 登录失败累计 5 次后账户自动锁定。

---

### 3.2 作品列表 (管理端)

| 项目 | 说明 |
|------|------|
| **方法** | `GET` |
| **路径** | `/api/admin/works` |
| **权限** | `super_admin` |

**查询参数：**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `status` | string | `"all"` | 筛选状态: `all` / `pending` / `approved` / `rejected` / `deleted` |
| `page` | int | `1` | 页码 |
| `size` | int | `20` | 每页数量 (1-100) |

**返回 (200)：**

```json
{
  "data": [
    {
      "id": "uuid",
      "work_number": "ZH26-001",
      "contestant_name": "张三",
      "contestant_phone": "13800138000",
      "contestant_tax_id": "91110000...",
      "contestant_address": "北京市朝阳区...",
      "images": ["https://..."],
      "status": "approved",
      "reject_reason": null,
      "reviewed_at": "2025-07-01T10:00:00",
      "created_at": "2025-06-28T15:30:00"
    }
  ],
  "total": 50,
  "page": 1,
  "size": 20
}
```

---

### 3.3 审核通过

| 项目 | 说明 |
|------|------|
| **方法** | `POST` |
| **路径** | `/api/admin/works/{work_id}/approve` |
| **权限** | `super_admin` |

**路径参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `work_id` | UUID | 作品 ID |

**请求体 (JSON)：**

```json
{
  "work_number": "ZH26-001"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `work_number` | string | 否 | 自定义编号，不传则自动生成 (格式 ZH26-XXX) |

**成功返回 (200)：**

```json
{
  "message": "审核通过",
  "work_number": "ZH26-001"
}
```

**错误码：**

| 状态码 | 场景 | detail |
|--------|------|--------|
| 404 | 作品不存在 | 作品不存在 |
| 409 | 状态不正确 | 作品状态不正确，仅待审核作品可操作 |

---

### 3.4 审核拒绝

| 项目 | 说明 |
|------|------|
| **方法** | `POST` |
| **路径** | `/api/admin/works/{work_id}/reject` |
| **权限** | `super_admin` |

**路径参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `work_id` | UUID | 作品 ID |

**请求体 (JSON)：**

```json
{
  "reason": "图片模糊，无法辨认橱窗内容"
}
```

**成功返回 (200)：**

```json
{
  "message": "已拒绝"
}
```

**错误码：**

| 状态码 | 场景 | detail |
|--------|------|--------|
| 404 | 作品不存在 | 作品不存在 |
| 409 | 状态不正确 | 作品状态不正确，仅待审核作品可操作 |

---

### 3.5 删除作品

| 项目 | 说明 |
|------|------|
| **方法** | `DELETE` |
| **路径** | `/api/admin/works/{work_id}` |
| **权限** | `super_admin` |

**路径参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `work_id` | UUID | 作品 ID |

**成功返回 (200)：**

```json
{
  "message": "已删除"
}
```

> 软删除：将作品 status 设置为 `deleted`，不物理删除数据。

**错误码：**

| 状态码 | 场景 | detail |
|--------|------|--------|
| 404 | 作品不存在 | 作品不存在 |

---

### 3.6 获取配置项 (管理端)

| 项目 | 说明 |
|------|------|
| **方法** | `GET` |
| **路径** | `/api/admin/config/{key}` |
| **权限** | `super_admin` |

**路径参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `key` | string | 配置键名 |

**返回 (200)：**

```json
{
  "key": "popularity_score_config",
  "value": {
    "tiers": [
      { "min": 0, "max": 100, "score": 1 },
      { "min": 101, "max": 300, "score": 2 }
    ]
  }
}
```

**错误码：**

| 状态码 | 场景 | detail |
|--------|------|--------|
| 404 | 配置项不存在 | 配置项不存在 |

---

### 3.7 更新配置项

| 项目 | 说明 |
|------|------|
| **方法** | `PUT` |
| **路径** | `/api/admin/config/{key}` |
| **权限** | `super_admin` |

**路径参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `key` | string | 配置键名 |

**请求体 (JSON)：**

```json
{
  "value": {
    "tiers": [
      { "min": 0, "max": 200, "score": 1 }
    ]
  }
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `value` | object | 是 | 任意 JSON 对象 |

**成功返回 (200)：**

```json
{
  "message": "配置已更新"
}
```

> 如果 key 不存在则自动创建 (upsert 语义)。

---

### 3.8 获取通道状态

| 项目 | 说明 |
|------|------|
| **方法** | `GET` |
| **路径** | `/api/admin/channels` |
| **权限** | `super_admin` |

**返回 (200)：**

```json
{
  "register": {
    "status": "open",
    "start_time": "2025-07-01",
    "end_time": "2025-08-31"
  },
  "vote": {
    "status": "closed",
    "start_time": null,
    "end_time": null
  }
}
```

> 返回 `register` 和 `vote` 两个通道的当前状态。

---

### 3.9 更新通道状态

| 项目 | 说明 |
|------|------|
| **方法** | `PUT` |
| **路径** | `/api/admin/channels/{channel_type}` |
| **权限** | `super_admin` |

**路径参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `channel_type` | string | 通道类型: `register` / `vote` |

**请求体 (JSON)：**

```json
{
  "status": "open",
  "start_time": "2025-07-01T00:00:00",
  "end_time": "2025-08-31T23:59:59"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `status` | string | 是 | `open` 或 `closed` |
| `start_time` | string | 否 | 开始时间 (ISO 8601) |
| `end_time` | string | 否 | 结束时间 (ISO 8601) |

**成功返回 (200)：**

```json
{
  "message": "register 通道已更新",
  "value": {
    "status": "open",
    "start_time": "2025-07-01T00:00:00",
    "end_time": "2025-08-31T23:59:59"
  }
}
```

**错误码：**

| 状态码 | 场景 | detail |
|--------|------|--------|
| 400 | 无效通道类型 | 无效的通道类型 |

---

### 3.10 获取评分任务列表

| 项目 | 说明 |
|------|------|
| **方法** | `GET` |
| **路径** | `/api/admin/scoring/tasks` |
| **权限** | `scorer_a` / `scorer_b` / `scorer_c` / `scorer_d` |

**返回 (200)：**

```json
{
  "scorer_role": "scorer_a",
  "board_name": "品牌与活动规范",
  "max_score": 4,
  "tasks": [
    {
      "work_id": "uuid",
      "work_number": "ZH26-001",
      "contestant_name": "张三",
      "status": "reviewed"
    },
    {
      "work_id": "uuid",
      "work_number": "ZH26-002",
      "contestant_name": "李四",
      "status": "unreviewed"
    }
  ]
}
```

> 仅返回当前评分员角色对应板块的任务。`status` 表示该评分员对该作品的评分状态。

**错误码：**

| 状态码 | 场景 | detail |
|--------|------|--------|
| 403 | 非评分员角色 | 无评分权限 |

---

### 3.11 获取评分详情

| 项目 | 说明 |
|------|------|
| **方法** | `GET` |
| **路径** | `/api/admin/scoring/{work_id}` |
| **权限** | `scorer_a` / `scorer_b` / `scorer_c` / `scorer_d` |

**路径参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `work_id` | string | 作品 ID |

**返回 (200)：**

```json
{
  "work_info": {
    "number": "ZH26-001",
    "name": "张三",
    "images": ["https://..."]
  },
  "board": {
    "name": "品牌与活动规范",
    "max_score": 4,
    "items": [
      {
        "name": "官方海报规范展示",
        "options": [
          { "score": 1.0, "description": "完整展示、无遮挡、位置醒目" },
          { "score": 0.5, "description": "有张贴但不规范" },
          { "score": 0, "description": "未展示" }
        ]
      }
    ]
  },
  "current_score": {
    "items": [
      { "item_name": "官方海报规范展示", "selected_score": 1.0 }
    ],
    "subtotal": 3.5
  }
}
```

> `current_score` 为 `null` 表示尚未评分。

**错误码：**

| 状态码 | 场景 | detail |
|--------|------|--------|
| 403 | 非评分员角色 | 无评分权限 |
| 404 | 作品不存在 | 作品不存在 |

---

### 3.12 提交评分

| 项目 | 说明 |
|------|------|
| **方法** | `POST` |
| **路径** | `/api/admin/scoring/{work_id}` |
| **权限** | `scorer_a` / `scorer_b` / `scorer_c` / `scorer_d` |

**路径参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `work_id` | string | 作品 ID |

**请求体 (JSON)：**

```json
{
  "items": [
    { "item_name": "官方海报规范展示", "selected_score": 1.0 },
    { "item_name": "MP 产品陈列占比", "selected_score": 0.5 },
    { "item_name": "指定新品露出", "selected_score": 1.0 },
    { "item_name": "品牌识别度 - Logo 及视觉", "selected_score": 0.5 }
  ]
}
```

**成功返回 (200)：**

```json
{
  "subtotal": 3.0,
  "message": "评分已保存"
}
```

> 支持重复提交覆盖 (upsert)，直到评分被锁定。

**错误码：**

| 状态码 | 场景 | detail |
|--------|------|--------|
| 403 | 非评分员角色 | 无评分权限 |
| 423 | 评分已锁定 | 评分已锁定，不可修改 |

---

### 3.13 成绩排名

| 项目 | 说明 |
|------|------|
| **方法** | `GET` |
| **路径** | `/api/admin/scores` |
| **权限** | `super_admin` |

**查询参数：**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `page` | int | `1` | 页码 |
| `size` | int | `20` | 每页数量 (1-100) |
| `sort` | string | `"total"` | 排序字段 (当前仅支持按总分) |

**返回 (200)：**

```json
{
  "data": [
    {
      "work_id": "uuid",
      "work_number": "ZH26-001",
      "contestant_name": "张三",
      "score_a": 3.5,
      "score_b": 4.0,
      "score_c": 3.0,
      "score_d": 1.5,
      "popularity_score": 4.0,
      "total": 16.0,
      "rank": 1
    }
  ],
  "total": 50,
  "page": 1
}
```

---

### 3.14 锁定评分

| 项目 | 说明 |
|------|------|
| **方法** | `POST` |
| **路径** | `/api/admin/scores/{work_id}/lock` |
| **权限** | `super_admin` |

**路径参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `work_id` | string | 作品 ID |

**成功返回 (200)：**

```json
{
  "message": "已锁定 4 条评分记录"
}
```

> 锁定后所有评分员均不可修改该作品的评分。

**错误码：**

| 状态码 | 场景 | detail |
|--------|------|--------|
| 404 | 无评分记录 | 该作品暂无评分记录 |

---

### 3.15 重置用户密码

| 项目 | 说明 |
|------|------|
| **方法** | `POST` |
| **路径** | `/api/admin/users/{user_id}/reset-password` |
| **权限** | `super_admin` |

**路径参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `user_id` | string | 目标用户 ID |

**请求体 (JSON)：**

```json
{
  "new_password": "newPass123"
}
```

**成功返回 (200)：**

```json
{
  "message": "密码已重置"
}
```

> 重置密码同时会: 1) 清零 `failed_login_count`; 2) 若账户处于锁定状态则自动解锁 (status -> active)。

**错误码：**

| 状态码 | 场景 | detail |
|--------|------|--------|
| 404 | 用户不存在 | 用户不存在 |

---

### 3.16 数据导出

| 项目 | 说明 |
|------|------|
| **方法** | `GET` |
| **路径** | `/api/admin/export` |
| **权限** | `super_admin` |

**查询参数：**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `type` | string | 是 | — | 导出类型: `scores` / `registrations` / `votes` / `logs` |
| `format` | string | 否 | `"csv"` | 文件格式: `csv` / `xlsx` |

**返回：** 文件流 (StreamingResponse)

**导出类型说明：**

| type | 文件名 | 列说明 |
|------|--------|--------|
| `scores` | export_scores.csv/xlsx | 作品编号, 姓名, A-品牌(4), B-视觉(5), C-陈列(4), D-执行(2), 人气分(5), 总分(20), 排名 |
| `registrations` | export_registrations.csv/xlsx | 姓名, 地址, 税号, 电话, 作品编号, 状态, 提交时间 |
| `votes` | export_votes.csv/xlsx | 作品编号, 手机号 (脱敏), IP, 时间 |
| `logs` | export_logs.csv/xlsx | 操作人, 操作, 对象类型, 对象ID, 详情, 时间 |

**错误码：**

| 状态码 | 场景 | detail |
|--------|------|--------|
| 400 | 无效导出类型 | 无效的导出类型 |

---

## 通用错误码

| 状态码 | 场景 | 说明 |
|--------|------|------|
| 401 | Token 无效/过期 | `Token 已过期或无效` 或 `无效的 Token` |
| 401 | 账户锁定/不存在 | `账户不存在或已锁定` |
| 403 | 权限不足 | `无权限访问` |
| 404 | 资源不存在 | 各接口具体描述 |
| 409 | 冲突/状态错误 | 各接口具体描述 |
| 422 | 请求参数校验失败 | Pydantic 校验错误 (自动返回详情) |
| 423 | 资源锁定 | 账户锁定或评分锁定 |
| 503 | 服务不可用 | 通道关闭 |

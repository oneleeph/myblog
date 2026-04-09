# 个人博客系统

## 产品概述

一个功能完善的个人博客系统，支持文章发布与 Markdown 渲染、标签分类管理、用户后台管理、页面布局定制、文章数据导出，以及 GitHub Pages 部署。

## 核心功能

### 1. 文章管理
- 文章列表展示（分页、按标签筛选）
- 文章详情页（Markdown 渲染、代码高亮）
- 文章创建/编辑/删除
- 文章封面图上传
- 文章发布/草稿状态

### 2. 标签系统
- 标签列表页（按文章数量排序）
- 文章标签关联（多对多）
- 按标签筛选文章

### 3. 关于页面
- 博主介绍信息
- 个人头像展示
- 社交链接

### 4. 后台管理
- 页面布局配置（首页风格、每页文章数）
- 主题风格设置（主色调、字体等）
- 图片管理（上传、删除、浏览）
- 用户管理（添加、编辑、删除用户）
- 文章数据打包下载（JSON 格式）

### 5. 数据导出
- 全部文章数据打包为 JSON 下载
- 包含文章内容、标签、元数据

## 用户故事

### 博客访客
- 浏览文章列表，按标签筛选感兴趣的文章
- 查看文章详情，阅读 Markdown 渲染的内容
- 查看关于页面，了解博主信息
- 通过标签云快速导航

### 博主/管理员
- 登录后台管理面板
- 创建、编辑、发布/撤回文章
- 管理标签体系
- 自定义博客布局和风格
- 上传和管理图片资源
- 添加和管理后台用户
- 导出文章数据用于备份或迁移

## 页面结构

### 前台页面
| 路径 | 页面 | 说明 |
|------|------|------|
| `/` | 首页 | 文章列表，分页展示 |
| `/article/:id` | 文章详情 | Markdown 渲染文章内容 |
| `/tags` | 标签列表 | 所有标签及文章数 |
| `/tag/:slug` | 标签文章 | 该标签下的文章列表 |
| `/about` | 关于 | 博主介绍页 |

### 后台页面
| 路径 | 页面 | 说明 |
|------|------|------|
| `/admin` | 后台首页 | 数据概览 |
| `/admin/articles` | 文章管理 | 文章 CRUD |
| `/admin/articles/new` | 新建文章 | Markdown 编辑器 |
| `/admin/articles/:id/edit` | 编辑文章 | Markdown 编辑器 |
| `/admin/tags` | 标签管理 | 标签 CRUD |
| `/admin/settings` | 站点设置 | 布局、风格、图片 |
| `/admin/users` | 用户管理 | 用户 CRUD |
| `/admin/export` | 数据导出 | 文章数据打包下载 |

## 数据模型

### User
- id, username, email, passwordHash, role (admin/editor), avatar, createdAt, updatedAt

### Article
- id, title, slug, content (Markdown), excerpt, coverImage, status (published/draft), authorId, createdAt, updatedAt

### Tag
- id, name, slug, description, createdAt

### ArticleTag
- articleId, tagId

### SiteSetting
- key, value — 存储站点配置（布局、风格、关于页面内容等）

### Media
- id, filename, url, mimetype, size, uploadedBy, createdAt

## API 端点

### 认证
- POST /api/auth/login
- POST /api/auth/register
- GET /api/auth/me

### 文章
- GET /api/articles (列表，支持 ?tag=&page=&limit=)
- GET /api/articles/:id
- POST /api/articles
- PUT /api/articles/:id
- DELETE /api/articles/:id

### 标签
- GET /api/tags
- POST /api/tags
- PUT /api/tags/:id
- DELETE /api/tags/:id

### 设置
- GET /api/settings
- PUT /api/settings

### 媒体
- POST /api/media/upload
- GET /api/media
- DELETE /api/media/:id

### 用户
- GET /api/users
- POST /api/users
- PUT /api/users/:id
- DELETE /api/users/:id

### 导出
- GET /api/export/articles

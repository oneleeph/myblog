# 个人博客系统

一个功能完整的个人博客系统，采用现代化的全栈技术栈开发，支持文章管理、媒体库管理、用户管理等功能。

## 技术栈

### 后端
- **Node.js** + **TypeScript**
- **Express.js** - Web 服务器框架
- **PostgreSQL** - 关系型数据库
- **Prisma** - ORM 框架
- **JWT** - 认证机制
- **Zod** - 数据验证

### 前端
- **React 19** + **TypeScript**
- **Tailwind CSS** - 样式框架
- **React Router** - 路由管理
- **React Query** - 数据获取和状态管理
- **Tiptap** - 富文本编辑器
- **Radix UI** - UI 组件库
- **Framer Motion** - 动画效果

## 功能模块

### 核心功能
- **文章管理**：创建、编辑、删除文章，支持富文本编辑
- **标签管理**：创建和管理文章标签
- **媒体库**：支持文件上传、管理，支持文件夹组织
- **用户管理**：管理员和编辑权限管理
- **导入/导出**：支持文章和数据的导入导出
- **自动保存**：文章编辑时自动保存草稿

### 技术特性
- **响应式设计**：适配各种设备屏幕
- **现代化 UI**：使用 Tailwind CSS 和 Radix UI
- **类型安全**：全项目使用 TypeScript
- **数据验证**：使用 Zod 进行请求验证
- **错误处理**：完善的错误处理机制
- **日志记录**：使用 Pino 日志库

## 项目结构

```
myblog/
├── backend/            # 后端代码
│   ├── prisma/         # Prisma 数据库模型
│   ├── src/            # 源代码
│   │   ├── config/     # 配置文件
│   │   ├── middleware/ # 中间件
│   │   ├── modules/    # API 模块
│   │   └── types/      # 类型定义
│   └── package.json    # 后端依赖
├── frontend/           # 前端代码
│   ├── public/         # 静态资源
│   ├── src/            # 源代码
│   │   ├── components/ # 组件
│   │   ├── hooks/      # 自定义 hooks
│   │   ├── lib/        # 工具库
│   │   ├── pages/      # 页面
│   │   └── types/      # 类型定义
│   └── package.json    # 前端依赖
└── README.md           # 项目说明
```

## 安装和运行

### 前置要求
- Node.js 18+
- PostgreSQL 14+
- npm 或 pnpm

### 安装步骤

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd myblog
   ```

2. **安装依赖**
   ```bash
   # 安装后端依赖
   cd backend
   npm install
   
   # 安装前端依赖
   cd ../frontend
   npm install
   ```

3. **配置环境变量**
   - 后端：复制 `.env.example` 为 `.env` 并填写配置
   - 前端：配置 Vite 代理（已在 vite.config.ts 中配置）

4. **数据库初始化**
   ```bash
   cd backend
   npx prisma migrate dev
   npx prisma db seed
   ```

5. **启动开发服务器**
   ```bash
   # 启动后端服务器
   cd backend
   npm run dev
   
   # 启动前端服务器
   cd ../frontend
   npm run dev
   ```

6. **构建生产版本**
   ```bash
   # 构建后端
   cd backend
   npm run build
   
   # 构建前端
   cd ../frontend
   npm run build
   ```

## 管理员账号

### 默认管理员账号
- **用户名**：admin
- **密码**：admin123

### 注意事项
- 首次登录后请修改默认密码
- 管理员拥有所有权限，包括用户管理
- 编辑权限只能管理文章和媒体库

## API 文档

### 主要 API 端点
- **认证**：`/api/auth/*`
- **文章**：`/api/articles/*`
- **标签**：`/api/tags/*`
- **用户**：`/api/users/*`
- **媒体**：`/api/media/*`
- **设置**：`/api/settings/*`
- **导出**：`/api/export/*`

## 部署

### 本地部署
- 按照安装步骤启动开发服务器
- 或使用构建产物部署到本地服务器

### 云部署
- 支持 Vercel、Netlify 等平台
- 需要配置 PostgreSQL 数据库
- 环境变量配置参考 `.env.example`

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目。

## 许可证

MIT License

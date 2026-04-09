import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seed() {
  const password = await bcrypt.hash('admin123', 10)

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@blog.com',
      passwordHash: password,
      role: 'admin',
    },
  })

  // Create sample tags
  const tags = [
    { name: '技术', slug: 'tech', description: '技术相关文章' },
    { name: '生活', slug: 'life', description: '生活随笔' },
    { name: '教程', slug: 'tutorial', description: '教程和指南' },
    { name: '随笔', slug: 'essay', description: '个人感悟' },
  ]

  for (const tag of tags) {
    await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: {},
      create: tag,
    })
  }

  // Create sample articles
  const sampleArticles = [
    {
      title: '使用 Markdown 编写博客文章',
      slug: 'writing-blog-with-markdown',
      content: `# 使用 Markdown 编写博客文章

Markdown 是一种轻量级标记语言，非常适合用来编写博客文章。它简单易学，可以让您专注于内容创作。

## 基本语法

### 标题
使用 \`#\` 号来创建标题：

\`\`\`markdown
# 一级标题
## 二级标题
### 三级标题
\`\`\`

### 列表
- 无序列表项 1
- 无序列表项 2
- 无序列表项 3

1. 有序列表项 1
2. 有序列表项 2
3. 有序列表项 3

### 代码块

\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

### 引用

> 这是一段引用文字，可以用来展示名人名言或重要信息。

### 链接和图片

[访问 GitHub](https://github.com)

![示例图片](https://picsum.photos/800/400)

## 表格

| 功能 | 支持 | 备注 |
|------|------|------|
| Markdown 渲染 | ✅ | 完整支持 |
| 代码高亮 | ✅ | 多语言 |
| 图片展示 | ✅ | 响应式 |
| 标签分类 | ✅ | 多标签 |

---

开始用 Markdown 写作吧！`,
      excerpt: '了解如何使用 Markdown 语法编写精美的博客文章，包含标题、列表、代码块等常用语法。',
      status: 'published',
      authorId: admin.id,
      tagNames: ['技术', '教程'],
    },
    {
      title: '我的第一篇博客',
      slug: 'my-first-blog-post',
      content: `# 我的第一篇博客

欢迎来到我的个人博客！这是我发布的第一篇文章。

## 关于这个博客

这个博客使用现代化的技术栈构建：

- **前端**：React + TypeScript
- **后端**：Node.js + Express
- **数据库**：PostgreSQL
- **样式**：Tailwind CSS

## 未来计划

我计划在这个博客上分享：

1. 技术学习笔记
2. 项目开发经验
3. 生活感悟随笔
4. 有趣的工具推荐

> 写作是思考的最佳方式。把想法写下来，让它们变得更加清晰。

感谢你的阅读，希望你能在这里找到有价值的内容！`,
      excerpt: '欢迎来到我的个人博客，这里将记录我的技术成长和生活感悟。',
      status: 'published',
      authorId: admin.id,
      tagNames: ['生活', '随笔'],
    },
    {
      title: '如何高效学习编程',
      slug: 'how-to-learn-programming-efficiently',
      content: `# 如何高效学习编程

学习编程是一段充满挑战但也非常有成就感的旅程。以下是一些我从实践中总结的经验。

## 1. 从项目开始

不要只看教程，动手做项目是最好的学习方式：

- 从小项目开始（计算器、待办列表）
- 逐步增加复杂度
- 尝试模仿喜欢的应用

## 2. 学会阅读文档

官方文档是最权威的学习资源：

\`\`\`
官方文档 → 教程 → 实践 → 源码
\`\`\`

## 3. 坚持每天编码

养成习惯比突击学习更有效：

| 时间投入 | 建议频率 | 效果 |
|---------|---------|------|
| 每天至少30分钟 | 每天 | ⭐⭐⭐⭐⭐ |
| 周末集中学习 | 每周 | ⭐⭐⭐ |
| 偶尔看看教程 | 不定期 | ⭐⭐ |

## 4. 加入社区

- 参与开源项目
- 加入技术社区
- 和其他开发者交流

---

记住：**每个专家都曾是初学者**。保持好奇心，持续学习！`,
      excerpt: '分享高效学习编程的方法和经验，帮助初学者少走弯路。',
      status: 'published',
      authorId: admin.id,
      tagNames: ['教程', '技术'],
    },
  ]

  for (const article of sampleArticles) {
    const existing = await prisma.article.findUnique({ where: { slug: article.slug } })
    if (!existing) {
      const { tagNames, ...articleData } = article
      const created = await prisma.article.create({ data: articleData })
      for (const tagName of tagNames) {
        const tag = await prisma.tag.findUnique({ where: { name: tagName } })
        if (tag) {
          await prisma.articleTag.create({ data: { articleId: created.id, tagId: tag.id } })
        }
      }
    }
  }

  // Default site settings
  const defaultSettings = [
    { key: 'siteTitle', value: '我的博客' },
    { key: 'siteDescription', value: '一个记录技术与生活的个人博客' },
    { key: 'siteAuthor', value: '博主' },
    { key: 'postsPerPage', value: '10' },
    { key: 'layoutStyle', value: 'list' },
    { key: 'aboutContent', value: '## 关于我\n\n一个热爱技术的开发者，喜欢分享学习心得和生活感悟。\n\n### 技术栈\n\n- JavaScript / TypeScript\n- React\n- Node.js\n- PostgreSQL\n\n### 联系方式\n\n- GitHub: [github.com](https://github.com)' },
    { key: 'socialLinks', value: JSON.stringify([{ name: 'GitHub', url: 'https://github.com' }]) },
  ]

  for (const setting of defaultSettings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    })
  }

  console.log('✅ Seed completed!')
  console.log('👤 Admin user: admin / admin123')
}

seed()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

import { Router, Response, Request } from 'express'
import { prisma } from '../config/database'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { z } from 'zod'

const router = Router()

// Schema for import validation
const importSchema = z.object({
  version: z.string(),
  articles: z.array(
    z.object({
      title: z.string().min(1),
      slug: z.string().min(1),
      content: z.string().min(1),
      excerpt: z.string().optional(),
      coverImage: z.string().optional(),
      status: z.enum(['published', 'draft']),
      author: z.string(),
      tags: z.array(z.string()),
    })
  ),
  tags: z.array(z.object({
    name: z.string().min(1),
    slug: z.string().min(1),
    description: z.string().optional(),
  })).optional(),
})

// GET /api/export/articles
router.get('/articles', authMiddleware, async (_req, res: Response) => {
  const articles = await prisma.article.findMany({
    include: {
      author: { select: { username: true } },
      tags: { include: { tag: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const exportData = {
    exportedAt: new Date().toISOString(),
    version: '1.0',
    articles: articles.map((a) => ({
      id: a.id,
      title: a.title,
      slug: a.slug,
      content: a.content,
      excerpt: a.excerpt,
      coverImage: a.coverImage,
      status: a.status,
      author: a.author.username,
      tags: a.tags.map((t) => t.tag.name),
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
    })),
  }

  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Content-Disposition', `attachment; filename="blog-export-${Date.now()}.json"`)
  res.json({ status: 'success', data: exportData })
})

// GET /api/export/all
router.get('/all', authMiddleware, async (_req, res: Response) => {
  const [articles, tags, users] = await Promise.all([
    prisma.article.findMany({
      include: {
        author: { select: { username: true } },
        tags: { include: { tag: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.tag.findMany(),
    prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        avatar: true,
      },
    }),
  ])

  const exportData = {
    exportedAt: new Date().toISOString(),
    version: '1.0',
    articles: articles.map((a) => ({
      id: a.id,
      title: a.title,
      slug: a.slug,
      content: a.content,
      excerpt: a.excerpt,
      coverImage: a.coverImage,
      status: a.status,
      author: a.author.username,
      tags: a.tags.map((t) => t.tag.name),
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
    })),
    tags: tags.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      description: t.description,
      createdAt: t.createdAt,
    })),
    users: users.map((u) => ({
      id: u.id,
      username: u.username,
      email: u.email,
      role: u.role,
      avatar: u.avatar,
    })),
  }

  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Content-Disposition', `attachment; filename="blog-export-all-${Date.now()}.json"`)
  res.json({ status: 'success', data: exportData })
})

// POST /api/export/import
router.post('/import', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const data = importSchema.parse(req.body)

    // Process tags first
    if (data.tags) {
      for (const tagData of data.tags) {
        await prisma.tag.upsert({
          where: { slug: tagData.slug },
          create: tagData,
          update: tagData,
        })
      }
    }

    // Process articles
    const importedArticles = []
    for (const articleData of data.articles) {
      // Find author by username
      const author = await prisma.user.findUnique({ where: { username: articleData.author } })
      if (!author) {
        return res.status(400).json({
          status: 'error',
          message: `Author ${articleData.author} not found`,
        })
      }

      // Find or create tags
      const tagIds = []
      for (const tagName of articleData.tags) {
        const tag = await prisma.tag.findFirst({ where: { name: tagName } })
        if (tag) {
          tagIds.push(tag.id)
        } else {
          // Create tag if not found
          const newTag = await prisma.tag.create({
            data: {
              name: tagName,
              slug: tagName.toLowerCase().replace(/\s+/g, '-'),
            },
          })
          tagIds.push(newTag.id)
        }
      }

      // Create or update article
      const article = await prisma.article.upsert({
        where: { slug: articleData.slug },
        create: {
          ...articleData,
          authorId: author.id,
        },
        update: {
          ...articleData,
          authorId: author.id,
        },
      })

      // Connect tags
      if (tagIds.length > 0) {
        // First, remove existing tag connections
        await prisma.articleTag.deleteMany({ where: { articleId: article.id } })
        // Then, add new connections
        for (const tagId of tagIds) {
          await prisma.articleTag.create({
            data: {
              articleId: article.id,
              tagId,
            },
          })
        }
      }

      importedArticles.push(article)
    }

    res.json({
      status: 'success',
      message: `Successfully imported ${importedArticles.length} articles`,
      data: { importedArticles: importedArticles.length },
    })
  } catch (error) {
    console.error('Import error:', error)
    res.status(400).json({
      status: 'error',
      message: 'Failed to import data',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

export const exportRouter = router

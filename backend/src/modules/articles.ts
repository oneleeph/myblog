import { Router, Response } from 'express'
import { z } from 'zod'
import { prisma } from '../config/database'
import { authMiddleware, AuthRequest } from '../middleware/auth'

const router = Router()

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')

const createArticleSchema = z.object({
  title: z.string().min(1),
  slug: z.string().optional(),
  content: z.string().min(1),
  excerpt: z.string().optional(),
  coverImage: z.string().optional(),
  status: z.enum(['published', 'draft']).default('draft'),
  tagIds: z.array(z.string()).default([]),
})

const updateArticleSchema = createArticleSchema.partial()

const listQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
  tag: z.string().optional(),
  status: z.enum(['published', 'draft']).optional(),
  search: z.string().optional(),
})

// GET /api/articles
router.get('/', async (req, res: Response) => {
  const query = listQuerySchema.parse(req.query)
  const where: Record<string, unknown> = {}

  if (query.status) where.status = query.status
  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: 'insensitive' } },
      { content: { contains: query.search, mode: 'insensitive' } },
    ]
  }
  if (query.tag) {
    where.tags = { some: { tag: { slug: query.tag } } }
  }

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      include: {
        author: { select: { id: true, username: true, avatar: true } },
        tags: { include: { tag: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    }),
    prisma.article.count({ where }),
  ])

  res.json({
    status: 'success',
    data: articles,
    pagination: { page: query.page, limit: query.limit, total, pages: Math.ceil(total / query.limit) },
  })
})

// GET /api/articles/:id
router.get('/:id', async (req, res: Response) => {
  const article = await prisma.article.findUnique({
    where: { id: req.params.id },
    include: {
      author: { select: { id: true, username: true, avatar: true } },
      tags: { include: { tag: true } },
    },
  })
  if (!article) {
    return res.status(404).json({ status: 'error', message: '文章不存在' })
  }
  res.json({ status: 'success', data: article })
})

// POST /api/articles
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const data = createArticleSchema.parse(req.body)
  const slug = data.slug || slugify(data.title)

  const article = await prisma.article.create({
    data: {
      title: data.title,
      slug,
      content: data.content,
      excerpt: data.excerpt,
      coverImage: data.coverImage,
      status: data.status,
      authorId: req.user!.id,
      tags: {
        create: data.tagIds.map((tagId) => ({ tag: { connect: { id: tagId } } })),
      },
    },
    include: {
      author: { select: { id: true, username: true, avatar: true } },
      tags: { include: { tag: true } },
    },
  })

  res.status(201).json({ status: 'success', data: article })
})

// PUT /api/articles/:id
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const data = updateArticleSchema.parse(req.body)
  const id = req.params.id

  const existing = await prisma.article.findUnique({ where: { id } })
  if (!existing) {
    return res.status(404).json({ status: 'error', message: '文章不存在' })
  }

  const article = await prisma.article.update({
    where: { id },
    data: {
      ...data,
      slug: data.slug || (data.title ? slugify(data.title) : undefined),
      tags: data.tagIds
        ? {
            deleteMany: {},
            create: data.tagIds.map((tagId: string) => ({ tag: { connect: { id: tagId } } })),
          }
        : undefined,
    },
    include: {
      author: { select: { id: true, username: true, avatar: true } },
      tags: { include: { tag: true } },
    },
  })

  res.json({ status: 'success', data: article })
})

// DELETE /api/articles/:id
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const id = req.params.id
  const existing = await prisma.article.findUnique({ where: { id } })
  if (!existing) {
    return res.status(404).json({ status: 'error', message: '文章不存在' })
  }
  await prisma.article.delete({ where: { id } })
  res.json({ status: 'success', message: '文章已删除' })
})

export const articleRouter = router

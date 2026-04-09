import { Router, Response } from 'express'
import { z } from 'zod'
import { prisma } from '../config/database'
import { authMiddleware, AuthRequest } from '../middleware/auth'

const router = Router()

const tagSchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().optional(),
})

const slugify = (text: string) =>
  text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/^-+|-+$/g, '')

// GET /api/tags
router.get('/', async (_req, res: Response) => {
  const tags = await prisma.tag.findMany({
    include: { _count: { select: { articles: true } } },
    orderBy: { articles: { _count: 'desc' } },
  })
  res.json({ status: 'success', data: tags })
})

// POST /api/tags
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const data = tagSchema.parse(req.body)
  const slug = data.slug || slugify(data.name)
  const tag = await prisma.tag.create({ data: { name: data.name, slug, description: data.description } })
  res.status(201).json({ status: 'success', data: tag })
})

// PUT /api/tags/:id
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const data = tagSchema.parse(req.body)
  const tag = await prisma.tag.update({
    where: { id: req.params.id },
    data: { ...data, slug: data.slug || slugify(data.name) },
  })
  res.json({ status: 'success', data: tag })
})

// DELETE /api/tags/:id
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  await prisma.tag.delete({ where: { id: req.params.id } })
  res.json({ status: 'success', message: '标签已删除' })
})

export const tagRouter = router

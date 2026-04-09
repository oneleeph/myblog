import { Router, Response } from 'express'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '../config/database'
import { authMiddleware, adminOnly, AuthRequest } from '../middleware/auth'

const router = Router()

const createUserSchema = z.object({
  username: z.string().min(2).max(30),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['admin', 'editor']).default('editor'),
})

const updateUserSchema = z.object({
  username: z.string().min(2).max(30).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  role: z.enum(['admin', 'editor']).optional(),
  avatar: z.string().optional(),
})

// GET /api/users
router.get('/', authMiddleware, adminOnly, async (_req, res: Response) => {
  const users = await prisma.user.findMany({
    select: { id: true, username: true, email: true, role: true, avatar: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })
  res.json({ status: 'success', data: users })
})

// POST /api/users
router.post('/', authMiddleware, adminOnly, async (req: AuthRequest, res: Response) => {
  const data = createUserSchema.parse(req.body)
  const existing = await prisma.user.findFirst({
    where: { OR: [{ username: data.username }, { email: data.email }] },
  })
  if (existing) {
    return res.status(409).json({ status: 'error', message: '用户名或邮箱已存在' })
  }
  const passwordHash = await bcrypt.hash(data.password, 10)
  const user = await prisma.user.create({
    data: { ...data, passwordHash },
    select: { id: true, username: true, email: true, role: true, avatar: true },
  })
  res.status(201).json({ status: 'success', data: user })
})

// PUT /api/users/:id
router.put('/:id', authMiddleware, adminOnly, async (req: AuthRequest, res: Response) => {
  const data = updateUserSchema.parse(req.body)
  const updates: Record<string, unknown> = {}
  if (data.username) updates.username = data.username
  if (data.email) updates.email = data.email
  if (data.role) updates.role = data.role
  if (data.avatar) updates.avatar = data.avatar
  if (data.password) updates.passwordHash = await bcrypt.hash(data.password, 10)

  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: updates,
    select: { id: true, username: true, email: true, role: true, avatar: true },
  })
  res.json({ status: 'success', data: user })
})

// DELETE /api/users/:id
router.delete('/:id', authMiddleware, adminOnly, async (req: AuthRequest, res: Response) => {
  if (req.user!.id === req.params.id) {
    return res.status(400).json({ status: 'error', message: '不能删除自己的账号' })
  }
  await prisma.user.delete({ where: { id: req.params.id } })
  res.json({ status: 'success', message: '用户已删除' })
})

export const userRouter = router

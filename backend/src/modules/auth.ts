import { Router, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { prisma } from '../config/database'
import { env } from '../config/env'
import { authMiddleware, AuthRequest } from '../middleware/auth'

const router = Router()

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
})

const registerSchema = z.object({
  username: z.string().min(2).max(30),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['admin', 'editor']).default('editor'),
})

// POST /api/auth/login
router.post('/login', async (req: AuthRequest, res: Response) => {
  const { username, password } = loginSchema.parse(req.body)

  const user = await prisma.user.findUnique({ where: { username } })
  if (!user) {
    return res.status(401).json({ status: 'error', message: '用户名或密码错误' })
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    return res.status(401).json({ status: 'error', message: '用户名或密码错误' })
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  )

  res.json({
    status: 'success',
    data: {
      token,
      user: { id: user.id, username: user.username, email: user.email, role: user.role, avatar: user.avatar },
    },
  })
})

// POST /api/auth/register
router.post('/register', authMiddleware, async (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ status: 'error', message: '仅管理员可添加用户' })
  }

  const data = registerSchema.parse(req.body)
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

// GET /api/auth/me
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { id: true, username: true, email: true, role: true, avatar: true },
  })
  if (!user) {
    return res.status(404).json({ status: 'error', message: '用户不存在' })
  }
  res.json({ status: 'success', data: user })
})

export const authRouter = router

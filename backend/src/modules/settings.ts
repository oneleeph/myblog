import { Router, Response } from 'express'
import { prisma } from '../config/database'
import { authMiddleware, AuthRequest } from '../middleware/auth'

const router = Router()

// GET /api/settings
router.get('/', async (_req, res: Response) => {
  const settings = await prisma.siteSetting.findMany()
  const data: Record<string, string> = {}
  settings.forEach((s) => (data[s.key] = s.value))
  res.json({ status: 'success', data })
})

// PUT /api/settings
router.put('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const entries = req.body as Record<string, string>

  await prisma.$transaction(
    Object.entries(entries).map(([key, value]) =>
      prisma.siteSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      })
    )
  )

  res.json({ status: 'success', message: '设置已保存' })
})

export const settingsRouter = router

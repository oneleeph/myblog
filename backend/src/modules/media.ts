import { Router, Response } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { prisma } from '../config/database'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { env } from '../config/env'
import { z } from 'zod'

const router = Router()

const uploadDir = env.UPLOAD_DIR
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|svg\+xml/
    if (allowed.test(file.mimetype)) cb(null, true)
    else cb(new Error('不支持的文件类型'))
  },
})

const folderSchema = z.object({
  name: z.string().min(1).max(100),
  parentId: z.string().optional(),
})

// POST /api/media/upload
router.post('/upload', authMiddleware, upload.single('file'), async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ status: 'error', message: '请上传文件' })
  }

  const media = await prisma.media.create({
    data: {
      filename: req.file.originalname,
      url: `/uploads/${req.file.filename}`,
      mimetype: req.file.mimetype,
      size: req.file.size,
      uploadedBy: req.user!.id,
      folderId: req.body.folderId || null,
    },
  })

  res.status(201).json({ status: 'success', data: media })
})

// POST /api/media/batch-upload
router.post('/batch-upload', authMiddleware, upload.array('files', 10), async (req: AuthRequest, res: Response) => {
  const files = req.files as Express.Multer.File[]
  if (!files || files.length === 0) {
    return res.status(400).json({ status: 'error', message: '请上传文件' })
  }

  const mediaItems = await Promise.all(
    files.map((file) =>
      prisma.media.create({
        data: {
          filename: file.originalname,
          url: `/uploads/${file.filename}`,
          mimetype: file.mimetype,
          size: file.size,
          uploadedBy: req.user!.id,
          folderId: req.body.folderId || null,
        },
      })
    )
  )

  res.status(201).json({ status: 'success', data: mediaItems })
})

// GET /api/media
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { folderId, page = 1, limit = 20, search } = req.query

  const where: any = {}
  if (folderId && folderId !== 'all') {
    where.folderId = folderId
  }
  if (search) {
    where.filename = { contains: search as string, mode: 'insensitive' }
  }

  const [media, total] = await Promise.all([
    prisma.media.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { uploader: { select: { username: true } }, folder: { select: { name: true } } },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    }),
    prisma.media.count({ where }),
  ])

  res.json({
    status: 'success',
    data: media,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  })
})

// DELETE /api/media/:id
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const media = await prisma.media.findUnique({ where: { id: req.params.id } })
  if (!media) {
    return res.status(404).json({ status: 'error', message: '文件不存在' })
  }
  const filePath = path.join(uploadDir, path.basename(media.url))
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
  await prisma.media.delete({ where: { id: req.params.id } })
  res.json({ status: 'success', message: '文件已删除' })
})

// DELETE /api/media/batch-delete
router.delete('/batch-delete', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { ids } = req.body
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ status: 'error', message: '请提供要删除的文件ID列表' })
  }

  const mediaItems = await prisma.media.findMany({ where: { id: { in: ids } } })

  for (const media of mediaItems) {
    const filePath = path.join(uploadDir, path.basename(media.url))
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
  }

  await prisma.media.deleteMany({ where: { id: { in: ids } } })
  res.json({ status: 'success', message: `已删除 ${mediaItems.length} 个文件` })
})

// POST /api/media/folders
router.post('/folders', authMiddleware, async (req: AuthRequest, res: Response) => {
  const data = folderSchema.parse(req.body)

  let folderPath = '/'
  if (data.parentId) {
    const parentFolder = await prisma.mediaFolder.findUnique({ where: { id: data.parentId } })
    if (!parentFolder) {
      return res.status(404).json({ status: 'error', message: '父文件夹不存在' })
    }
    folderPath = `${parentFolder.path}${data.name}/`
  } else {
    folderPath = `/${data.name}/`
  }

  const folder = await prisma.mediaFolder.create({
    data: {
      name: data.name,
      path: folderPath,
      parentId: data.parentId,
    },
  })

  res.status(201).json({ status: 'success', data: folder })
})

// GET /api/media/folders
router.get('/folders', authMiddleware, async (_req: AuthRequest, res: Response) => {
  const folders = await prisma.mediaFolder.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      parent: { select: { name: true } },
      _count: { select: { media: true, children: true } },
    },
  })
  res.json({ status: 'success', data: folders })
})

// PUT /api/media/folders/:id
router.put('/folders/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const data = folderSchema.parse(req.body)
  const folder = await prisma.mediaFolder.update({
    where: { id: req.params.id },
    data: {
      name: data.name,
      parentId: data.parentId,
    },
  })
  res.json({ status: 'success', data: folder })
})

// DELETE /api/media/folders/:id
router.delete('/folders/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  await prisma.mediaFolder.delete({ where: { id: req.params.id } })
  res.json({ status: 'success', message: '文件夹已删除' })
})

// PUT /api/media/:id/move
router.put('/:id/move', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { folderId } = req.body
  const media = await prisma.media.update({
    where: { id: req.params.id },
    data: { folderId: folderId || null },
  })
  res.json({ status: 'success', data: media })
})

export const mediaRouter = router

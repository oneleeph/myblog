import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'

export interface AuthRequest extends Request {
  user?: { id: string; username: string; role: string }
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ status: 'error', message: '未提供认证令牌' })
  }

  const token = header.slice(7)
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as { id: string; username: string; role: string }
    req.user = payload
    next()
  } catch {
    return res.status(401).json({ status: 'error', message: '令牌无效或已过期' })
  }
}

export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ status: 'error', message: '需要管理员权限' })
  }
  next()
}

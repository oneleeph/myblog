import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2 } from 'lucide-react'
import apiClient from '@/lib/api-client'
import type { User } from '@/types'
import { FadeIn } from '@/components/MotionPrimitives'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function Users() {
  const [users, setUsers] = useState<User[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'editor' as 'admin' | 'editor' })

  const fetchUsers = () => {
    apiClient.get('/users').then((res) => setUsers(res.data.data))
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleSave = async () => {
    try {
      if (editingUser) {
        const updateData = { ...form }
        if (!updateData.password) delete (updateData as Record<string, unknown>).password
        await apiClient.put(`/users/${editingUser.id}`, updateData)
        toast.success('用户已更新')
      } else {
        await apiClient.post('/users', form)
        toast.success('用户已创建')
      }
      setDialogOpen(false)
      setEditingUser(null)
      setForm({ username: '', email: '', password: '', role: 'editor' })
      fetchUsers()
    } catch {
      toast.error('保存失败')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个用户吗？')) return
    try {
      await apiClient.delete(`/users/${id}`)
      toast.success('用户已删除')
      fetchUsers()
    } catch {
      toast.error('删除失败')
    }
  }

  const openEdit = (user: User) => {
    setEditingUser(user)
    setForm({ username: user.username, email: user.email, password: '', role: user.role })
    setDialogOpen(true)
  }

  return (
    <div>
      <FadeIn>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground">用户管理</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingUser(null); setForm({ username: '', email: '', password: '', role: 'editor' }) }}>
                <Plus className="w-4 h-4 mr-2" /> 添加用户
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingUser ? '编辑用户' : '添加用户'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>用户名</Label>
                  <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>邮箱</Label>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>密码 {editingUser && '（留空不修改）'}</Label>
                  <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>角色</Label>
                  <Select value={form.role} onValueChange={(v: 'admin' | 'editor') => setForm({ ...form, role: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">管理员</SelectItem>
                      <SelectItem value="editor">编辑</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleSave}>保存</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>用户名</TableHead>
                <TableHead>邮箱</TableHead>
                <TableHead>角色</TableHead>
                <TableHead>注册时间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role === 'admin' ? '管理员' : '编辑'}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(user.createdAt || '').toLocaleDateString('zh-CN')}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(user)}><Edit className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(user.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </FadeIn>
    </div>
  )
}

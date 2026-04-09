import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2 } from 'lucide-react'
import apiClient from '@/lib/api-client'
import type { Tag } from '@/types'
import { FadeIn } from '@/components/MotionPrimitives'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function TagsAdmin() {
  const [tags, setTags] = useState<Tag[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const [form, setForm] = useState({ name: '', slug: '', description: '' })

  const fetchTags = () => {
    apiClient.get('/tags').then((res) => setTags(res.data.data))
  }

  useEffect(() => {
    fetchTags()
  }, [])

  const handleSave = async () => {
    try {
      if (editingTag) {
        await apiClient.put(`/tags/${editingTag.id}`, form)
        toast.success('标签已更新')
      } else {
        await apiClient.post('/tags', form)
        toast.success('标签已创建')
      }
      setDialogOpen(false)
      setEditingTag(null)
      setForm({ name: '', slug: '', description: '' })
      fetchTags()
    } catch {
      toast.error('保存失败')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个标签吗？')) return
    try {
      await apiClient.delete(`/tags/${id}`)
      toast.success('标签已删除')
      fetchTags()
    } catch {
      toast.error('删除失败')
    }
  }

  const openEdit = (tag: Tag) => {
    setEditingTag(tag)
    setForm({ name: tag.name, slug: tag.slug, description: tag.description || '' })
    setDialogOpen(true)
  }

  return (
    <div>
      <FadeIn>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground">标签管理</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingTag(null); setForm({ name: '', slug: '', description: '' }) }}>
                <Plus className="w-4 h-4 mr-2" /> 新建标签
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingTag ? '编辑标签' : '新建标签'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>名称</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>描述</Label>
                  <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
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
                <TableHead>名称</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>描述</TableHead>
                <TableHead>文章数</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tags.map((tag) => (
                <TableRow key={tag.id}>
                  <TableCell className="font-medium">{tag.name}</TableCell>
                  <TableCell><Badge variant="outline">{tag.slug}</Badge></TableCell>
                  <TableCell>{tag.description}</TableCell>
                  <TableCell>{tag._count?.articles || 0}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(tag)}><Edit className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(tag.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
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

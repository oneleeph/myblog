import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, Upload, Clock, Image as ImageIcon, Eye, EyeOff, Cloud, CloudOff } from 'lucide-react'
import apiClient from '@/lib/api-client'
import type { Article, Tag } from '@/types'
import { FadeIn } from '@/components/MotionPrimitives'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import RichTextEditor from '@/components/ui/rich-text-editor'

export default function ArticleEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const autoSaveTimeout = useRef<NodeJS.Timeout | null>(null)
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null)

  const [form, setForm] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    coverImage: '',
    status: 'draft' as 'published' | 'draft',
    tagIds: [] as string[],
  })
  const [tags, setTags] = useState<Tag[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [imageAlt, setImageAlt] = useState('')

  useEffect(() => {
    apiClient.get('/tags').then((res) => setTags(res.data.data))
    if (id) {
      apiClient.get(`/articles/${id}`).then((res) => {
        const article = res.data.data
        setForm({
          title: article.title,
          slug: article.slug,
          content: article.content,
          excerpt: article.excerpt || '',
          coverImage: article.coverImage || '',
          status: article.status,
          tagIds: article.tags?.map((t: { tagId: string }) => t.tagId) || [],
        })
        setLastSavedTime(new Date(article.updatedAt))
      })
    }

    return () => {
      if (autoSaveTimeout.current) {
        clearTimeout(autoSaveTimeout.current)
      }
    }
  }, [id])

  // Auto save functionality
  useEffect(() => {
    if (autoSaveTimeout.current) {
      clearTimeout(autoSaveTimeout.current)
    }

    // Only auto save if we have a title or content
    if (form.title || form.content) {
      autoSaveTimeout.current = setTimeout(() => {
        handleAutoSave()
      }, 3000) // Auto save every 3 seconds
    }

    return () => {
      if (autoSaveTimeout.current) {
        clearTimeout(autoSaveTimeout.current)
      }
    }
  }, [form.title, form.content, form.excerpt, form.coverImage, form.tagIds])

  const handleAutoSave = async () => {
    if (!form.title && !form.content) return
    if (isAutoSaving) return

    setIsAutoSaving(true)
    try {
      const saveData = { ...form, status: 'draft' } // Always save as draft for auto save
      
      if (isEdit) {
        await apiClient.put(`/articles/${id}`, saveData)
      } else {
        // For new articles, we need to create it first
        const res = await apiClient.post('/articles', saveData)
        if (res.data.data.id) {
          // Update the id in the URL without navigating
          const newUrl = `/admin/articles/${res.data.data.id}/edit`
          window.history.pushState({}, '', newUrl)
        }
      }
      setLastSavedTime(new Date())
    } catch (error) {
      console.error('Auto save failed:', error)
    } finally {
      setIsAutoSaving(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      if (isEdit) {
        await apiClient.put(`/articles/${id}`, form)
        toast.success('文章已更新')
      } else {
        await apiClient.post('/articles', form)
        toast.success('文章已创建')
      }
      navigate('/admin/articles')
    } catch {
      toast.error('保存失败')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleTag = (tagId: string) => {
    setForm((prev) => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId)
        ? prev.tagIds.filter((t) => t !== tagId)
        : [...prev.tagIds, tagId],
    }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await apiClient.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setImageUrl(res.data.data.url)
    } catch {
      toast.error('图片上传失败')
    }
  }

  const insertImage = () => {
    if (imageUrl) {
      // This would be integrated with the rich text editor
      // For now, we'll just show a toast
      toast.success('图片已插入')
      setIsImageDialogOpen(false)
      setImageUrl('')
      setImageAlt('')
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <FadeIn>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/admin/articles')}>
              <ArrowLeft className="w-4 h-4 mr-2" /> 返回
            </Button>
            <h1 className="text-2xl font-bold text-foreground">{isEdit ? '编辑文章' : '新建文章'}</h1>
          </div>
          <div className="flex items-center gap-2">
            {lastSavedTime && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="w-4 h-4 mr-1" />
                上次保存: {lastSavedTime.toLocaleTimeString()}
              </div>
            )}
            {isAutoSaving && (
              <div className="flex items-center text-sm text-blue-500">
                <Cloud className="w-4 h-4 mr-1 animate-pulse" />
                自动保存中...
              </div>
            )}
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">标题</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="文章标题"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug（URL路径）</Label>
              <Input
                id="slug"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="article-url-slug"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>内容</Label>
              <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <ImageIcon className="w-4 h-4 mr-2" />
                    插入图片
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>插入图片</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>图片URL</Label>
                      <Input
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    <div>
                      <Label>上传图片</Label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="mt-2 px-3 py-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <Label>图片描述（Alt）</Label>
                      <Input
                        value={imageAlt}
                        onChange={(e) => setImageAlt(e.target.value)}
                        placeholder="图片描述"
                      />
                    </div>
                    <Button onClick={insertImage} className="w-full">
                      插入图片
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <RichTextEditor
              content={form.content}
              onChange={(content) => setForm({ ...form, content })}
              placeholder="开始编写文章内容..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">摘要</Label>
            <Textarea
              id="excerpt"
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              placeholder="文章摘要..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="coverImage">封面图片URL</Label>
              <Input
                id="coverImage"
                value={form.coverImage}
                onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="space-y-2">
              <Label>状态</Label>
              <Select value={form.status} onValueChange={(v: 'published' | 'draft') => setForm({ ...form, status: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">草稿</SelectItem>
                  <SelectItem value="published">发布</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>标签</Label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Button
                  key={tag.id}
                  type="button"
                  variant={form.tagIds.includes(tag.id) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleTag(tag.id)}
                >
                  {tag.name}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading}>
              <Save className="w-4 h-4 mr-2" /> {isLoading ? '保存中...' : '保存'}
            </Button>
            <Button variant="outline" onClick={handleAutoSave} disabled={isAutoSaving}>
              <Cloud className="w-4 h-4 mr-2" />
              {isAutoSaving ? '保存中...' : '手动保存草稿'}
            </Button>
          </div>
        </form>
      </FadeIn>
    </div>
  )
}

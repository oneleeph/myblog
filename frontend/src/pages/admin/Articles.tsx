import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Edit, Trash2, Filter } from 'lucide-react'
import apiClient from '@/lib/api-client'
import type { Article } from '@/types'
import { FadeIn } from '@/components/MotionPrimitives'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

export default function Articles() {
  const [articles, setArticles] = useState<Article[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all')

  const fetchArticles = () => {
    const params: Record<string, string | number> = { page, limit: 10 }
    if (statusFilter !== 'all') {
      params.status = statusFilter
    }
    apiClient.get('/articles', { params }).then((res) => {
      setArticles(res.data.data)
      setTotalPages(res.data.pagination.pages)
    })
  }

  useEffect(() => {
    fetchArticles()
  }, [page, statusFilter])

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这篇文章吗？')) return
    try {
      await apiClient.delete(`/articles/${id}`)
      toast.success('文章已删除')
      fetchArticles()
    } catch {
      toast.error('删除失败')
    }
  }

  return (
    <div>
      <FadeIn>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground">文章管理</h1>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as 'all' | 'published' | 'draft')}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="published">已发布</SelectItem>
                  <SelectItem value="draft">草稿</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Link to="/admin/articles/new">
              <Button><Plus className="w-4 h-4 mr-2" /> 新建文章</Button>
            </Link>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>标题</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>标签</TableHead>
                <TableHead>作者</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead>更新时间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell className="font-medium">{article.title}</TableCell>
                  <TableCell>
                    <Badge variant={article.status === 'published' ? 'default' : 'secondary'}>
                      {article.status === 'published' ? '已发布' : '草稿'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {article.tags?.map((t) => (
                        <Badge key={t.tagId} variant="outline" className="text-xs">{t.tag.name}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{article.author?.username}</TableCell>
                  <TableCell>{new Date(article.createdAt).toLocaleDateString('zh-CN')}</TableCell>
                  <TableCell>{new Date(article.updatedAt).toLocaleDateString('zh-CN')}</TableCell>
                  <TableCell className="text-right">
                    <Link to={`/admin/articles/${article.id}/edit`}>
                      <Button variant="ghost" size="sm"><Edit className="w-4 h-4" /></Button>
                    </Link>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(article.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-center gap-2 mt-4">
          <Button variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>上一页</Button>
          <span className="py-2 px-4 text-muted-foreground">第 {page} / {totalPages} 页</span>
          <Button variant="outline" disabled={page === totalPages} onClick={() => setPage(page + 1)}>下一页</Button>
        </div>
      </FadeIn>
    </div>
  )
}

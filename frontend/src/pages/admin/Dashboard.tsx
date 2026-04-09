import { useState, useEffect } from 'react'
import apiClient from '@/lib/api-client'
import { FadeIn } from '@/components/MotionPrimitives'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Tag, Users, Eye } from 'lucide-react'

interface Stats {
  articles: number
  published: number
  drafts: number
  tags: number
  users: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({ articles: 0, published: 0, drafts: 0, tags: 0, users: 0 })

  useEffect(() => {
    Promise.all([
      apiClient.get('/articles', { params: { limit: 1 } }),
      apiClient.get('/tags'),
      apiClient.get('/users'),
    ]).then(([articlesRes, tagsRes, usersRes]) => {
      const published = articlesRes.data.data.filter((a: { status: string }) => a.status === 'published').length
      setStats({
        articles: articlesRes.data.pagination.total,
        published,
        drafts: articlesRes.data.pagination.total - published,
        tags: tagsRes.data.data.length,
        users: usersRes.data.data.length,
      })
    })
  }, [])

  const cards = [
    { title: '总文章数', value: stats.articles, icon: FileText, color: 'text-primary' },
    { title: '已发布', value: stats.published, icon: Eye, color: 'text-success' },
    { title: '草稿', value: stats.drafts, icon: FileText, color: 'text-warning' },
    { title: '标签数', value: stats.tags, icon: Tag, color: 'text-info' },
    { title: '用户数', value: stats.users, icon: Users, color: 'text-accent' },
  ]

  return (
    <div>
      <FadeIn>
        <h1 className="text-2xl font-bold text-foreground mb-6">仪表盘</h1>
      </FadeIn>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((card, idx) => (
          <FadeIn key={card.title} delay={idx * 0.1}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-foreground">{card.value}</span>
                  <card.icon className={`w-8 h-8 ${card.color}`} />
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        ))}
      </div>
    </div>
  )
}

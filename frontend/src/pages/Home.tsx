import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import apiClient from '@/lib/api-client'
import type { Article, SiteSettings, Pagination } from '@/types'
import { ArticleCard } from '@/components/blog/ArticleCard'
import { FadeIn, Stagger } from '@/components/MotionPrimitives'
import { Button } from '@/components/ui/button'

export default function Home() {
  const [settings, setSettings] = useState<SiteSettings>({})
  const [articles, setArticles] = useState<Article[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [page, setPage] = useState(1)

  useEffect(() => {
    apiClient.get('/settings').then((res) => setSettings(res.data.data))
  }, [])

  useEffect(() => {
    apiClient.get('/articles', { params: { status: 'published', page, limit: 9 } }).then((res) => {
      setArticles(res.data.data)
      setPagination(res.data.pagination)
    })
  }, [page])

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <FadeIn>
        <section className="py-20 px-4 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4" style={{ fontSize: 'var(--font-size-display)' }}>
              {settings.siteTitle || 'My Blog'}
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {settings.siteDescription || '一个记录技术与生活的个人博客'}
            </p>
          </div>
        </section>
      </FadeIn>

      {/* Articles */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <Stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <FadeIn key={article.id}>
                <ArticleCard article={article} />
              </FadeIn>
            ))}
          </Stagger>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-12">
              <Button variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>
                <ChevronLeft className="w-4 h-4" /> 上一页
              </Button>
              <span className="text-muted-foreground">
                第 {page} / {pagination.pages} 页
              </span>
              <Button variant="outline" disabled={page === pagination.pages} onClick={() => setPage(page + 1)}>
                下一页 <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

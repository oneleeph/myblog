import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Hash, ArrowLeft } from 'lucide-react'
import apiClient from '@/lib/api-client'
import type { Article, Tag } from '@/types'
import { ArticleCard } from '@/components/blog/ArticleCard'
import { FadeIn, Stagger } from '@/components/MotionPrimitives'
import { Button } from '@/components/ui/button'

export default function TagArticles() {
  const { slug } = useParams()
  const [articles, setArticles] = useState<Article[]>([])
  const [tag, setTag] = useState<Tag | null>(null)

  useEffect(() => {
    apiClient.get('/tags').then((res) => {
      const found = res.data.data.find((t: Tag) => t.slug === slug)
      setTag(found)
    })
    apiClient.get('/articles', { params: { tag: slug, status: 'published' } }).then((res) => {
      setArticles(res.data.data)
    })
  }, [slug])

  return (
    <div className="min-h-screen bg-background py-20 px-4">
      <div className="container mx-auto">
        <FadeIn>
          <Link to="/tags">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" /> 返回标签列表
            </Button>
          </Link>

          <div className="flex items-center gap-3 mb-8">
            <Hash className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground" style={{ fontSize: 'var(--font-size-headline)' }}>
              {tag?.name || slug}
            </h1>
          </div>
          {tag?.description && (
            <p className="text-muted-foreground mb-8">{tag.description}</p>
          )}
        </FadeIn>

        <Stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <FadeIn key={article.id}>
              <ArticleCard article={article} />
            </FadeIn>
          ))}
        </Stagger>

        {articles.length === 0 && (
          <p className="text-center text-muted-foreground py-12">该标签下暂无文章</p>
        )}
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Calendar, User, ArrowLeft, Tag } from 'lucide-react'
import apiClient from '@/lib/api-client'
import type { Article } from '@/types'
import { MarkdownRenderer } from '@/components/blog/MarkdownRenderer'
import { FadeIn } from '@/components/MotionPrimitives'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function ArticleDetail() {
  const { id } = useParams()
  const [article, setArticle] = useState<Article | null>(null)

  useEffect(() => {
    if (id) {
      apiClient.get(`/articles/${id}`).then((res) => setArticle(res.data.data))
    }
  }, [id])

  if (!article) {
    return <div className="flex justify-center items-center min-h-screen">加载中...</div>
  }

  return (
    <div className="min-h-screen bg-background py-20 px-4">
      <div className="container mx-auto max-w-3xl">
        <FadeIn>
          <Link to="/">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" /> 返回首页
            </Button>
          </Link>

          <article>
            <header className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-4" style={{ fontSize: 'var(--font-size-headline)' }}>
                {article.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm">
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" /> {article.author?.username}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" /> {new Date(article.createdAt).toLocaleDateString('zh-CN')}
                </span>
              </div>
              {article.tags && article.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {article.tags.map((t) => (
                    <Link key={t.tagId} to={`/tag/${t.tag.slug}`}>
                      <Badge variant="secondary" className="hover:bg-primary hover:text-primary-foreground transition-colors">
                        <Tag className="w-3 h-3 mr-1" /> {t.tag.name}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}
            </header>

            {article.coverImage && (
              <img src={article.coverImage} alt={article.title} className="w-full rounded-lg mb-8" />
            )}

            <div className="prose-container">
              <MarkdownRenderer content={article.content} />
            </div>
          </article>
        </FadeIn>
      </div>
    </div>
  )
}

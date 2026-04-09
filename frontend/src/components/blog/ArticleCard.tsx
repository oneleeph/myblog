import { Link } from 'react-router-dom'
import { Calendar, User } from 'lucide-react'
import type { Article } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { HoverLift } from '@/components/MotionPrimitives'

interface Props {
  article: Article
}

export function ArticleCard({ article }: Props) {
  return (
    <HoverLift>
      <Link to={`/article/${article.id}`}>
        <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow">
          {article.coverImage ? (
            <img src={article.coverImage} alt={article.title} className="w-full h-48 object-cover" />
          ) : (
            <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <span className="text-4xl font-bold text-primary/50">{article.title[0]}</span>
            </div>
          )}
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold text-foreground mb-2 line-clamp-2">{article.title}</h2>
            {article.excerpt && (
              <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{article.excerpt}</p>
            )}
            <div className="flex flex-wrap gap-1 mb-3">
              {article.tags?.map((t) => (
                <Badge key={t.tagId} variant="secondary" className="text-xs">{t.tag.name}</Badge>
              ))}
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" /> {article.author?.username || 'Unknown'}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" /> {new Date(article.createdAt).toLocaleDateString('zh-CN')}
              </span>
            </div>
          </CardContent>
        </Card>
      </Link>
    </HoverLift>
  )
}

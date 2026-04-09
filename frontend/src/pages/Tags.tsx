import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Hash } from 'lucide-react'
import apiClient from '@/lib/api-client'
import type { Tag } from '@/types'
import { FadeIn, Stagger } from '@/components/MotionPrimitives'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([])

  useEffect(() => {
    apiClient.get('/tags').then((res) => setTags(res.data.data))
  }, [])

  return (
    <div className="min-h-screen bg-background py-20 px-4">
      <div className="container mx-auto">
        <FadeIn>
          <h1 className="text-3xl font-bold text-foreground mb-2" style={{ fontSize: 'var(--font-size-headline)' }}>
            标签分类
          </h1>
          <p className="text-muted-foreground mb-8">按标签浏览文章</p>
        </FadeIn>

        <Stagger className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {tags.map((tag) => (
            <FadeIn key={tag.id}>
              <Link to={`/tag/${tag.slug}`}>
                <Card className="hover:shadow-lg hover:border-primary/50 transition-all h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <Hash className="w-5 h-5 text-primary" />
                      <h2 className="text-lg font-semibold text-foreground">{tag.name}</h2>
                    </div>
                    {tag.description && (
                      <p className="text-muted-foreground text-sm mb-3">{tag.description}</p>
                    )}
                    <Badge variant="secondary">{tag._count?.articles || 0} 篇文章</Badge>
                  </CardContent>
                </Card>
              </Link>
            </FadeIn>
          ))}
        </Stagger>
      </div>
    </div>
  )
}

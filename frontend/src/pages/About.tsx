import { useState, useEffect } from 'react'
import { Github, Twitter, Mail } from 'lucide-react'
import apiClient from '@/lib/api-client'
import type { SiteSettings } from '@/types'
import { MarkdownRenderer } from '@/components/blog/MarkdownRenderer'
import { FadeIn } from '@/components/MotionPrimitives'
import { Card, CardContent } from '@/components/ui/card'

export default function About() {
  const [settings, setSettings] = useState<SiteSettings>({})

  useEffect(() => {
    apiClient.get('/settings').then((res) => setSettings(res.data.data))
  }, [])

  const socialLinks = settings.socialLinks ? JSON.parse(settings.socialLinks) : []

  return (
    <div className="min-h-screen bg-background py-20 px-4">
      <div className="container mx-auto max-w-3xl">
        <FadeIn>
          <h1 className="text-3xl font-bold text-foreground mb-8" style={{ fontSize: 'var(--font-size-headline)' }}>
            关于
          </h1>

          <Card className="mb-8">
            <CardContent className="p-6">
              <MarkdownRenderer content={settings.aboutContent || '暂无介绍'} />
            </CardContent>
          </Card>

          {socialLinks.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">社交链接</h2>
                <div className="flex gap-4">
                  {socialLinks.map((link: { name: string; url: string }, idx: number) => (
                    <a
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.name === 'GitHub' && <Github className="w-5 h-5" />}
                      {link.name === 'Twitter' && <Twitter className="w-5 h-5" />}
                      {link.name === 'Email' && <Mail className="w-5 h-5" />}
                      {link.name}
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </FadeIn>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { Save } from 'lucide-react'
import apiClient from '@/lib/api-client'
import type { SiteSettings } from '@/types'
import { FadeIn } from '@/components/MotionPrimitives'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

export default function Settings() {
  const [settings, setSettings] = useState<SiteSettings>({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    apiClient.get('/settings').then((res) => setSettings(res.data.data))
  }, [])

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await apiClient.put('/settings', settings)
      toast.success('设置已保存')
    } catch {
      toast.error('保存失败')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <FadeIn>
        <h1 className="text-2xl font-bold text-foreground mb-6">站点设置</h1>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>站点标题</Label>
            <Input
              value={settings.siteTitle || ''}
              onChange={(e) => setSettings({ ...settings, siteTitle: e.target.value })}
              placeholder="我的博客"
            />
          </div>

          <div className="space-y-2">
            <Label>站点描述</Label>
            <Textarea
              value={settings.siteDescription || ''}
              onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
              placeholder="一个记录技术与生活的个人博客"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>作者名称</Label>
            <Input
              value={settings.siteAuthor || ''}
              onChange={(e) => setSettings({ ...settings, siteAuthor: e.target.value })}
              placeholder="博主"
            />
          </div>

          <div className="space-y-2">
            <Label>每页文章数</Label>
            <Input
              type="number"
              value={settings.postsPerPage || '10'}
              onChange={(e) => setSettings({ ...settings, postsPerPage: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>首页布局</Label>
            <Select
              value={settings.layoutStyle || 'list'}
              onValueChange={(v) => setSettings({ ...settings, layoutStyle: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="list">列表</SelectItem>
                <SelectItem value="grid">网格</SelectItem>
                <SelectItem value="card">卡片</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>关于页面内容（Markdown）</Label>
            <Textarea
              value={settings.aboutContent || ''}
              onChange={(e) => setSettings({ ...settings, aboutContent: e.target.value })}
              placeholder="## 关于我&#10;&#10;这里是关于页面的内容..."
              rows={8}
            />
          </div>

          <div className="space-y-2">
            <Label>社交链接（JSON格式）</Label>
            <Textarea
              value={settings.socialLinks || '[]'}
              onChange={(e) => setSettings({ ...settings, socialLinks: e.target.value })}
              placeholder='[{"name": "GitHub", "url": "https://github.com"}]'
              rows={3}
            />
          </div>

          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="w-4 h-4 mr-2" /> {isLoading ? '保存中...' : '保存设置'}
          </Button>
        </div>
      </FadeIn>
    </div>
  )
}

import { useState } from 'react'
import { Download, Upload, FileJson, Database } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { FadeIn } from '@/components/MotionPrimitives'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { toast } from 'sonner'

export default function Export() {
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)

  const handleExport = async (type: 'articles' | 'all') => {
    setExporting(true)
    try {
      const res = await apiClient.get(`/export/${type}`)
      const data = res.data.data
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `blog-export-${type}-${Date.now()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('导出成功')
    } catch {
      toast.error('导出失败')
    } finally {
      setExporting(false)
    }
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImporting(true)
    try {
      const reader = new FileReader()
      reader.onload = async (event) => {
        try {
          const content = event.target?.result as string
          const data = JSON.parse(content)
          
          await apiClient.post('/export/import', data)
          toast.success('导入成功')
        } catch (error) {
          toast.error('文件格式错误')
        } finally {
          setImporting(false)
        }
      }
      reader.onerror = () => {
        toast.error('读取文件失败')
        setImporting(false)
      }
      reader.readAsText(file)
    } catch {
      toast.error('导入失败')
      setImporting(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <FadeIn>
        <h1 className="text-2xl font-bold text-foreground mb-6">数据导入/导出</h1>
      </FadeIn>

      <FadeIn delay={0.1}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileJson className="w-5 h-5" />
              导出数据
            </CardTitle>
            <CardDescription>
              将数据导出为 JSON 格式文件，可用于备份或迁移到其他平台。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">导出选项</h3>
              <div className="space-y-2">
                <Button
                  onClick={() => handleExport('articles')}
                  disabled={exporting}
                  className="w-full justify-start"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {exporting ? '导出中...' : '仅导出文章'}
                </Button>
                <Button
                  onClick={() => handleExport('all')}
                  disabled={exporting}
                  className="w-full justify-start"
                >
                  <Database className="w-4 h-4 mr-2" />
                  {exporting ? '导出中...' : '导出所有数据（文章、标签、用户）'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      <FadeIn delay={0.2}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              导入数据
            </CardTitle>
            <CardDescription>
              从 JSON 文件导入数据到系统中。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              导入的文件应包含以下结构：
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 mb-6">
              <li>• version: 版本号</li>
              <li>• articles: 文章数组</li>
              <li>• tags: 标签数组（可选）</li>
            </ul>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              disabled={importing}
              className="hidden"
              id="import-file"
            />
            <Button
              onClick={() => document.getElementById('import-file')?.click()}
              disabled={importing}
            >
              <Upload className="w-4 h-4 mr-2" />
              {importing ? '导入中...' : '选择 JSON 文件'}
            </Button>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  )
}

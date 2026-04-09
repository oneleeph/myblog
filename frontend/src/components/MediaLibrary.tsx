import { useState, useEffect } from 'react'
import {
  FolderPlus,
  Upload,
  Trash2,
  Folder,
  FolderOpen,
  Image as ImageIcon,
  Search,
  ChevronRight,
  MoreHorizontal,
  Check,
  X,
} from 'lucide-react'
import apiClient from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'

interface MediaItem {
  id: string
  filename: string
  url: string
  mimetype: string
  size: number
  folderId: string | null
  folder?: { name: string }
  createdAt: string
}

interface MediaFolder {
  id: string
  name: string
  path: string
  parentId: string | null
  parent?: { name: string }
  _count: { media: number; children: number }
}

export default function MediaLibrary() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [folders, setFolders] = useState<MediaFolder[]>([])
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [newFolderParent, setNewFolderParent] = useState<string | null>(null)

  useEffect(() => {
    loadFolders()
    loadMedia()
  }, [selectedFolder, searchQuery])

  const loadFolders = async () => {
    try {
      const res = await apiClient.get('/media/folders')
      setFolders(res.data.data)
    } catch (error) {
      console.error('Failed to load folders:', error)
    }
  }

  const loadMedia = async () => {
    setIsLoading(true)
    try {
      const params: Record<string, string | number> = { folderId: selectedFolder || 'all' }
      if (searchQuery) params.search = searchQuery
      const res = await apiClient.get('/media', { params })
      setMediaItems(res.data.data)
    } catch (error) {
      console.error('Failed to load media:', error)
      toast.error('加载媒体文件失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const formData = new FormData()
    if (selectedFolder) {
      formData.append('folderId', selectedFolder)
    }

    if (files.length === 1) {
      formData.append('file', files[0])
      try {
        await apiClient.post('/media/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        toast.success('文件上传成功')
      } catch (error) {
        toast.error('文件上传失败')
      }
    } else {
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i])
      }
      try {
        await apiClient.post('/media/batch-upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        toast.success(`成功上传 ${files.length} 个文件`)
      } catch (error) {
        toast.error('批量上传失败')
      }
    }

    loadMedia()
  }

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error('请输入文件夹名称')
      return
    }

    try {
      await apiClient.post('/media/folders', {
        name: newFolderName,
        parentId: newFolderParent,
      })
      toast.success('文件夹创建成功')
      setNewFolderName('')
      setNewFolderParent(null)
      setIsCreateFolderOpen(false)
      loadFolders()
    } catch (error) {
      toast.error('文件夹创建失败')
    }
  }

  const handleDeleteItem = async (id: string) => {
    try {
      await apiClient.delete(`/media/${id}`)
      toast.success('文件已删除')
      loadMedia()
    } catch (error) {
      toast.error('删除失败')
    }
  }

  const handleBatchDelete = async () => {
    if (selectedItems.size === 0) return

    try {
      await apiClient.delete('/media/batch-delete', { data: { ids: Array.from(selectedItems) } })
      toast.success(`已删除 ${selectedItems.size} 个文件`)
      setSelectedItems(new Set())
      loadMedia()
    } catch (error) {
      toast.error('批量删除失败')
    }
  }

  const handleDeleteFolder = async (id: string) => {
    if (!confirm('确定要删除此文件夹吗？文件夹中的所有文件也将被删除。')) return

    try {
      await apiClient.delete(`/media/folders/${id}`)
      toast.success('文件夹已删除')
      if (selectedFolder === id) {
        setSelectedFolder(null)
      }
      loadFolders()
    } catch (error) {
      toast.error('删除文件夹失败')
    }
  }

  const toggleSelectItem = (id: string) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedItems(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedItems.size === mediaItems.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(mediaItems.map((item) => item.id)))
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">媒体库</h2>
        <div className="flex gap-2">
          <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FolderPlus className="w-4 h-4 mr-2" />
                新建文件夹
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>新建文件夹</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">文件夹名称</label>
                  <Input
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="输入文件夹名称"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">父文件夹（可选）</label>
                  <select
                    value={newFolderParent || ''}
                    onChange={(e) => setNewFolderParent(e.target.value || null)}
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                  >
                    <option value="">无（根目录）</option>
                    {folders.map((folder) => (
                      <option key={folder.id} value={folder.id}>
                        {folder.path}
                      </option>
                    ))}
                  </select>
                </div>
                <Button onClick={handleCreateFolder} className="w-full">
                  创建文件夹
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button asChild>
            <label className="cursor-pointer">
              <Upload className="w-4 h-4 mr-2" />
              上传文件
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
              />
            </label>
          </Button>
          {selectedItems.size > 0 && (
            <Button variant="destructive" onClick={handleBatchDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              删除选中 ({selectedItems.size})
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">文件夹</h3>
          </div>
          <Button
            variant={selectedFolder === null ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setSelectedFolder(null)}
          >
            <FolderOpen className="w-4 h-4 mr-2" />
            全部文件
          </Button>
          {folders.map((folder) => (
            <div key={folder.id} className="flex items-center group">
              <Button
                variant={selectedFolder === folder.id ? 'default' : 'ghost'}
                className="flex-1 justify-start"
                onClick={() => setSelectedFolder(folder.id)}
              >
                <Folder className="w-4 h-4 mr-2" />
                <span className="truncate">{folder.name}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {folder._count.media}
                </span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleDeleteFolder(folder.id)}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    删除文件夹
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>

        <div className="lg:col-span-3">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="搜索文件..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8">加载中...</div>
          ) : mediaItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              暂无文件
            </div>
          ) : (
            <>
              <div className="mb-4">
                <Checkbox
                  checked={selectedItems.size === mediaItems.length && mediaItems.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
                <span className="ml-2 text-sm text-muted-foreground">
                  已选择 {selectedItems.size} / {mediaItems.length} 个文件
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {mediaItems.map((item) => (
                  <div
                    key={item.id}
                    className={`relative group border rounded-lg overflow-hidden cursor-pointer transition-all ${
                      selectedItems.has(item.id) ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => toggleSelectItem(item.id)}
                  >
                    <div className="aspect-square bg-muted flex items-center justify-center">
                      {item.mimetype.startsWith('image/') ? (
                        <img
                          src={item.url}
                          alt={item.filename}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-12 h-12 text-muted-foreground" />
                      )}
                    </div>
                    <div className="p-2">
                      <p className="text-sm truncate" title={item.filename}>
                        {item.filename}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(item.size)}
                      </p>
                    </div>
                    {selectedItems.has(item.id) && (
                      <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                    <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteItem(item.id)
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
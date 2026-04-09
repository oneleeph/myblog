import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { LayoutDashboard, FileText, Tags, Settings, Users, ImageIcon, Download, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/admin', label: '仪表盘', icon: LayoutDashboard, end: true },
  { to: '/admin/articles', label: '文章管理', icon: FileText },
  { to: '/admin/tags', label: '标签管理', icon: Tags },
  { to: '/admin/settings', label: '站点设置', icon: Settings },
  { to: '/admin/users', label: '用户管理', icon: Users },
  { to: '/admin/media', label: '媒体库', icon: ImageIcon },
  { to: '/admin/export', label: '数据导出', icon: Download },
]

export default function AdminLayout() {
  const { user, logout, isLoading } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">加载中...</div>
  }

  if (!user) {
    navigate('/login')
    return null
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 md:hidden bg-background border border-border rounded-lg p-2"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside className={cn(
        'fixed md:static inset-y-0 left-0 z-40 w-64 bg-card border-r border-border transform transition-transform md:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="p-6 border-b border-border">
          <h1 className="text-xl font-bold text-foreground">博客管理后台</h1>
          <p className="text-sm text-muted-foreground mt-1">欢迎，{user.username}</p>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors',
                isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="absolute bottom-4 left-4 right-4">
          <Button variant="ghost" className="w-full justify-start" onClick={logout}>
            <LogOut className="w-5 h-5 mr-3" /> 退出登录
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 md:p-8 pt-16 md:pt-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}

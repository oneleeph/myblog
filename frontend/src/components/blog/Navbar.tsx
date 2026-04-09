import { Link } from 'react-router-dom'
import { BookOpen, Tag, User, LogOut, Settings } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'

export function Navbar() {
  const { user, logout } = useAuth()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-foreground hover:text-primary transition-colors">
          My Blog
        </Link>
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
            <BookOpen className="w-4 h-4" /> 文章
          </Link>
          <Link to="/tags" className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
            <Tag className="w-4 h-4" /> 标签
          </Link>
          <Link to="/about" className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
            <User className="w-4 h-4" /> 关于
          </Link>
          {user ? (
            <>
              <Link to="/admin" className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                <Settings className="w-4 h-4" /> 管理
              </Link>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="w-4 h-4 mr-1" /> 退出
              </Button>
            </>
          ) : (
            <Link to="/login">
              <Button variant="outline" size="sm">登录</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}

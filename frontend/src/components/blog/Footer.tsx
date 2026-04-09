import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="bg-muted text-muted-foreground py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} My Blog. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/" className="hover:text-foreground transition-colors">首页</Link>
            <Link to="/tags" className="hover:text-foreground transition-colors">标签</Link>
            <Link to="/about" className="hover:text-foreground transition-colors">关于</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

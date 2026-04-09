import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AnimatedRoutes } from "@/components/AnimatedRoutes"
import { PageTransition } from "@/components/PageTransition"
import { AuthProvider } from "@/hooks/use-auth"
import { Navbar } from "@/components/blog/Navbar"
import { Footer } from "@/components/blog/Footer"

// Pages
import Home from "./pages/Home"
import ArticleDetail from "./pages/ArticleDetail"
import TagsPage from "./pages/Tags"
import TagArticles from "./pages/TagArticles"
import About from "./pages/About"
import Login from "./pages/Login"
import AdminLayout from "./pages/admin/AdminLayout"
import Dashboard from "./pages/admin/Dashboard"
import Articles from "./pages/admin/Articles"
import ArticleEditor from "./pages/admin/ArticleEditor"
import TagsAdmin from "./pages/admin/Tags"
import Settings from "./pages/admin/Settings"
import Users from "./pages/admin/Users"
import Media from "./pages/admin/Media"
import Export from "./pages/admin/Export"
import NotFound from "./pages/NotFound"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
    mutations: { retry: 1 },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <BrowserRouter>
            <div className="min-h-screen flex flex-col bg-background">
              <Navbar />
              <main className="flex-1 pt-16">
                <AnimatedRoutes>
                  <Route path="/" element={<PageTransition transition="slide-up"><Home /></PageTransition>} />
                  <Route path="/article/:id" element={<PageTransition transition="fade"><ArticleDetail /></PageTransition>} />
                  <Route path="/tags" element={<PageTransition transition="slide-up"><TagsPage /></PageTransition>} />
                  <Route path="/tag/:slug" element={<PageTransition transition="fade"><TagArticles /></PageTransition>} />
                  <Route path="/about" element={<PageTransition transition="fade"><About /></PageTransition>} />
                  <Route path="/login" element={<PageTransition transition="fade"><Login /></PageTransition>} />
                  <Route path="/admin" element={<PageTransition transition="fade"><AdminLayout /></PageTransition>}>
                    <Route index element={<Dashboard />} />
                    <Route path="articles" element={<Articles />} />
                    <Route path="articles/new" element={<ArticleEditor />} />
                    <Route path="articles/:id/edit" element={<ArticleEditor />} />
                    <Route path="tags" element={<TagsAdmin />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="users" element={<Users />} />
                    <Route path="media" element={<Media />} />
                    <Route path="export" element={<Export />} />
                  </Route>
                  <Route path="*" element={<PageTransition transition="fade"><NotFound /></PageTransition>} />
                </AnimatedRoutes>
              </main>
              <Footer />
            </div>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  )
}

export default App

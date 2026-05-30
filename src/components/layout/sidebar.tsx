'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Scale, LayoutDashboard, Calculator, History, LogOut, Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/calcular', label: 'Calcular Prazo', icon: Calculator },
  { href: '/historico', label: 'Histórico', icon: History },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('Sessão encerrada')
    router.push('/auth/login')
    router.refresh()
  }

  function toggleTheme() {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-slate-950 text-white border-r border-white/5">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/8">
        <div className="bg-blue-500 p-2 rounded-xl shadow-lg shadow-blue-500/30">
          <Scale className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold text-sm tracking-tight leading-tight">Calculadora</p>
          <p className="text-xs text-slate-400 leading-tight">de Prazos</p>
        </div>
      </div>

      {/* Navegação */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
              pathname === href
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                : 'text-slate-400 hover:bg-white/8 hover:text-white'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Rodapé */}
      <div className="px-3 py-4 border-t border-white/8 space-y-0.5">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-white/8 hover:text-white transition-all duration-150"
        >
          {theme === 'dark' ? (
            <><Sun className="h-4 w-4 shrink-0" />Modo claro</>
          ) : (
            <><Moon className="h-4 w-4 shrink-0" />Modo escuro</>
          )}
        </button>

        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-slate-400 hover:text-white hover:bg-white/8 rounded-xl"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sair
        </Button>
      </div>
    </aside>
  )
}

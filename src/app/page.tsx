import Link from 'next/link'
import { Scale, Calculator, Shield, Calendar } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <header className="px-8 py-5 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="bg-blue-500 p-2 rounded-lg">
            <Scale className="h-5 w-5" />
          </div>
          <span className="font-semibold text-lg">Calculadora de Prazos</span>
        </div>
        <div className="flex gap-3">
          <Link
            href="/auth/login"
            className={cn(buttonVariants({ variant: 'ghost' }), 'text-slate-300 hover:text-white')}
          >
            Entrar
          </Link>
          <Link
            href="/auth/register"
            className={cn(buttonVariants(), 'bg-blue-600 hover:bg-blue-500 text-white')}
          >
            Criar conta grátis
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-900/50 border border-blue-700 rounded-full px-4 py-1.5 text-sm text-blue-300 mb-8">
          <Scale className="h-4 w-4" />
          Para advogados brasileiros
        </div>

        <h1 className="text-5xl font-bold leading-tight mb-6">
          Calcule prazos jurídicos<br />
          <span className="text-blue-400">com precisão e rapidez</span>
        </h1>

        <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10">
          Contagem automática de dias úteis considerando feriados nacionais, estaduais e
          municipais de todo o Brasil. Nunca mais perca um prazo.
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            href="/auth/register"
            className={cn(buttonVariants({ size: 'lg' }), 'bg-blue-600 hover:bg-blue-500 text-white px-8')}
          >
            Começar gratuitamente
          </Link>
          <Link
            href="/auth/login"
            className={cn(
              buttonVariants({ variant: 'outline', size: 'lg' }),
              'border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white'
            )}
          >
            Já tenho conta
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 text-left">
          {[
            {
              icon: Calculator,
              title: 'Cálculo Automático',
              desc: 'Informe a comarca, data de início e dias úteis. A calculadora desconta fins de semana e todos os feriados automaticamente.',
            },
            {
              icon: Shield,
              title: 'Base Completa de Feriados',
              desc: 'Feriados nacionais, estaduais e municipais de todo o Brasil, sempre atualizados.',
            },
            {
              icon: Calendar,
              title: 'Histórico e Relatórios',
              desc: 'Salve todos os cálculos, visualize no calendário e exporte em PDF ou Excel.',
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6">
              <div className="bg-blue-600 p-2.5 rounded-lg w-fit mb-4">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

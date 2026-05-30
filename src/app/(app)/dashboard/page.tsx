import { createClient, isSupabaseConfigured } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calculator, History, CalendarDays, TrendingUp, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Calculo } from '@/lib/types'

export default async function DashboardPage() {
  if (!isSupabaseConfigured) return <SetupAviso />

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: calculos } = await supabase
    .from('calculos')
    .select('*, municipio:municipios(nome), estado:estados(nome)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const { count: totalCalculos } = await supabase
    .from('calculos')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const hoje = format(new Date(), 'yyyy-MM-dd')
  const { count: prazosProximos } = await supabase
    .from('calculos')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('data_fim', hoje)
    .lte('data_fim', format(new Date(Date.now() + 7 * 86400000), 'yyyy-MM-dd'))

  const nome = user.user_metadata?.nome || user.email

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Olá, {nome} 👋</h1>
        <p className="text-slate-500 mt-1">Bem-vindo à Calculadora de Prazos Jurídicos</p>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Cálculos</p>
                <p className="text-3xl font-bold mt-1">{totalCalculos ?? 0}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Calculator className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Prazos Próximos (7 dias)</p>
                <p className="text-3xl font-bold mt-1">{prazosProximos ?? 0}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <CalendarDays className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Mês atual</p>
                <p className="text-3xl font-bold mt-1 capitalize">
                  {format(new Date(), 'MMMM', { locale: ptBR })}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ação rápida */}
      <Card className="bg-blue-600 text-white border-0">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">Calcular novo prazo</h3>
              <p className="text-blue-100 text-sm mt-1">
                Selecione a comarca, data e número de dias úteis
              </p>
            </div>
            <Link href="/calcular" className={cn(buttonVariants({ variant: 'secondary' }), 'shrink-0')}>
              Calcular agora <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Últimos cálculos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-slate-500" />
            Últimos Cálculos
          </CardTitle>
          <Link href="/historico" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
            Ver todos
          </Link>
        </CardHeader>
        <CardContent>
          {calculos && calculos.length > 0 ? (
            <div className="space-y-3">
              {(calculos as (Calculo & { municipio: { nome: string } | null; estado: { nome: string } | null })[]).map((c) => {
                const dataFim = new Date(c.data_fim + 'T00:00:00')
                const isVencido = dataFim < new Date()
                const isProximo = !isVencido && dataFim <= new Date(Date.now() + 3 * 86400000)
                return (
                  <div key={c.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {c.titulo || `Prazo de ${c.dias_uteis} dias úteis`}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {c.municipio?.nome ? `${c.municipio.nome} / ` : ''}{c.estado?.nome || 'Nacional'}
                        {' · '}Início: {format(new Date(c.data_inicio + 'T00:00:00'), 'dd/MM/yyyy')}
                      </p>
                    </div>
                    <div className="ml-4 text-right shrink-0">
                      <p className="text-sm font-semibold">
                        {format(dataFim, 'dd/MM/yyyy')}
                      </p>
                      <Badge
                        variant={isVencido ? 'destructive' : isProximo ? 'outline' : 'secondary'}
                        className={`text-xs mt-0.5 ${isProximo && !isVencido ? 'border-orange-400 text-orange-600' : ''}`}
                      >
                        {isVencido ? 'Vencido' : isProximo ? 'Urgente' : `${c.dias_uteis} dias úteis`}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <Calculator className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm">Nenhum cálculo ainda. Comece calculando seu primeiro prazo!</p>
              <Link href="/calcular" className={cn(buttonVariants({ size: 'sm' }), 'mt-4 bg-blue-600 hover:bg-blue-700 text-white')}>
                Calcular prazo
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function SetupAviso() {
  return (
    <div className="p-8 flex items-center justify-center min-h-[60vh]">
      <div className="max-w-md text-center space-y-4">
        <div className="text-5xl">⚙️</div>
        <h2 className="text-xl font-bold">Supabase não configurado</h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Para usar o sistema, configure as variáveis de ambiente no arquivo{' '}
          <code className="bg-muted px-1 rounded">.env.local</code> com a URL e a chave do seu projeto Supabase.
        </p>
        <div className="bg-muted rounded-lg p-4 text-left text-xs font-mono">
          <p>NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co</p>
          <p>NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...</p>
        </div>
        <p className="text-xs text-muted-foreground">
          Depois execute o SQL em <code className="bg-muted px-1 rounded">supabase/schema.sql</code> no painel do Supabase.
        </p>
      </div>
    </div>
  )
}

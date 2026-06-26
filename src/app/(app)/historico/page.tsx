import { createClient, isSupabaseConfigured } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { History } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BotaoExportar } from '@/components/historico/botao-exportar'
import { TabelaHistorico } from '@/components/historico/tabela-historico'
import type { Calculo } from '@/lib/types'

export default async function HistoricoPage() {
  if (!isSupabaseConfigured) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center text-muted-foreground">
          <p className="font-medium">Supabase não configurado.</p>
          <p className="text-sm mt-1">Configure o <code>.env.local</code> para usar esta funcionalidade.</p>
        </div>
      </div>
    )
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: calculos } = await supabase
    .from('calculos')
    .select('*, municipio:municipios(nome), estado:estados(nome, sigla)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Histórico de Prazos</h1>
          <p className="text-slate-500 mt-1">Todos os cálculos realizados na sua conta</p>
        </div>
        {calculos && calculos.length > 0 && (
          <BotaoExportar calculos={calculos as any} />
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <History className="h-4 w-4 text-slate-500" />
            {calculos?.length ?? 0} cálculo(s) encontrado(s)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TabelaHistorico calculos={(calculos ?? []) as any} />
        </CardContent>
      </Card>
    </div>
  )
}

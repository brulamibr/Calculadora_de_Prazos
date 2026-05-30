import { createClient, isSupabaseConfigured } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { History, Download } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BotaoExportar } from '@/components/historico/botao-exportar'
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

  const hoje = new Date()

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Histórico de Prazos</h1>
          <p className="text-slate-500 mt-1">Todos os cálculos realizados na sua conta</p>
        </div>
        {calculos && calculos.length > 0 && (
          <BotaoExportar calculos={calculos as Calculo[]} />
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
          {calculos && calculos.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Identificação</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Comarca</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Início</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Dias úteis</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Prazo final</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Feriados</th>
                  </tr>
                </thead>
                <tbody>
                  {(calculos as (Calculo & { municipio: { nome: string } | null; estado: { nome: string; sigla: string } | null })[]).map((c) => {
                    const dataFim = new Date(c.data_fim + 'T00:00:00')
                    const isVencido = dataFim < hoje
                    const isProximo = !isVencido && dataFim <= new Date(hoje.getTime() + 3 * 86400000)
                    return (
                      <tr key={c.id} className="border-b hover:bg-muted transition-colors">
                        <td className="py-3 px-2 font-medium max-w-[180px] truncate">
                          {c.titulo || `Prazo ${c.dias_uteis}du`}
                        </td>
                        <td className="py-3 px-2 text-muted-foreground">
                          {c.municipio?.nome
                            ? `${c.municipio.nome}/${c.estado?.sigla}`
                            : c.estado?.nome || '—'}
                        </td>
                        <td className="py-3 px-2">
                          {format(new Date(c.data_inicio + 'T00:00:00'), 'dd/MM/yyyy')}
                        </td>
                        <td className="py-3 px-2 text-center">{c.dias_uteis}</td>
                        <td className="py-3 px-2 font-semibold">
                          {format(dataFim, 'dd/MM/yyyy')}
                          <span className="block text-xs font-normal text-muted-foreground">
                            {format(dataFim, 'EEEE', { locale: ptBR })}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <Badge
                            variant={isVencido ? 'destructive' : isProximo ? 'outline' : 'secondary'}
                            className={isProximo && !isVencido ? 'border-orange-400 text-orange-600' : ''}
                          >
                            {isVencido ? 'Vencido' : isProximo ? 'Urgente' : 'Ativo'}
                          </Badge>
                        </td>
                        <td className="py-3 px-2 text-center text-muted-foreground">
                          {Array.isArray(c.feriados_encontrados) ? c.feriados_encontrados.length : 0}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <History className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p>Nenhum cálculo encontrado.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

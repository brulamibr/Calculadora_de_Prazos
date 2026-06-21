import { createClient, isSupabaseConfigured } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { addDays, differenceInCalendarDays, format, isWeekend, nextMonday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { History } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BotaoExportar } from '@/components/historico/botao-exportar'
import type { Calculo } from '@/lib/types'

function proximoDiaUtil(data: Date): Date {
  const proximo = addDays(data, 1)
  if (isWeekend(proximo)) return nextMonday(proximo)
  return proximo
}

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
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-blue-700 text-white">
                    <th className="py-3 px-3 font-semibold text-left text-xs uppercase tracking-wide">Tribunal</th>
                    <th className="py-3 px-3 font-semibold text-left text-xs uppercase tracking-wide">Sistema</th>
                    <th className="py-3 px-3 font-semibold text-left text-xs uppercase tracking-wide">Data da Publicação</th>
                    <th className="py-3 px-3 font-semibold text-left text-xs uppercase tracking-wide">Início</th>
                    <th className="py-3 px-3 font-semibold text-center text-xs uppercase tracking-wide">Dias do Prazo</th>
                    <th className="py-3 px-3 font-semibold text-left text-xs uppercase tracking-wide">Fim</th>
                    <th className="py-3 px-3 font-semibold text-left text-xs uppercase tracking-wide">Dia da Semana</th>
                    <th className="py-3 px-3 font-semibold text-left text-xs uppercase tracking-wide">Cliente</th>
                    <th className="py-3 px-3 font-semibold text-left text-xs uppercase tracking-wide">Processo</th>
                    <th className="py-3 px-3 font-semibold text-left text-xs uppercase tracking-wide">Foro</th>
                    <th className="py-3 px-3 font-semibold text-left text-xs uppercase tracking-wide">Providência</th>
                    <th className="py-3 px-3 font-semibold text-center text-xs uppercase tracking-wide">Dias Restantes</th>
                  </tr>
                </thead>
                <tbody>
                  {(calculos as (Calculo & { municipio: { nome: string } | null; estado: { nome: string; sigla: string } | null })[]).map((c, i) => {
                    const dataPublicacao = new Date(c.data_inicio + 'T00:00:00')
                    const dataInicio = proximoDiaUtil(dataPublicacao)
                    const dataFim = new Date(c.data_fim + 'T00:00:00')
                    const hoje = new Date()
                    hoje.setHours(0, 0, 0, 0)
                    const diasRestantes = differenceInCalendarDays(dataFim, hoje)
                    const foro = c.municipio?.nome
                      ? `${c.municipio.nome}${c.estado?.sigla ? `/${c.estado.sigla}` : ''}`
                      : c.estado?.nome || '—'
                    return (
                      <tr
                        key={c.id}
                        className={i % 2 === 0 ? 'bg-orange-50 dark:bg-orange-950/20' : 'bg-orange-100/70 dark:bg-orange-950/40'}
                      >
                        <td className="py-2.5 px-3">{c.tribunal || '—'}</td>
                        <td className="py-2.5 px-3">{c.sistema || '—'}</td>
                        <td className="py-2.5 px-3">{format(dataPublicacao, 'dd/MM/yyyy')}</td>
                        <td className="py-2.5 px-3">{format(dataInicio, 'dd/MM/yyyy')}</td>
                        <td className="py-2.5 px-3 text-center">{c.dias_uteis}</td>
                        <td className="py-2.5 px-3 font-semibold">{format(dataFim, 'dd/MM/yyyy')}</td>
                        <td className="py-2.5 px-3 capitalize">{format(dataFim, 'EEE', { locale: ptBR })}</td>
                        <td className="py-2.5 px-3">{c.cliente || '—'}</td>
                        <td className="py-2.5 px-3 text-xs">{c.numero_processo || '—'}</td>
                        <td className="py-2.5 px-3">{foro}</td>
                        <td className="py-2.5 px-3">{c.providencia || '—'}</td>
                        <td className={`py-2.5 px-3 text-center font-semibold ${diasRestantes < 0 ? 'text-red-600' : diasRestantes <= 3 ? 'text-orange-600' : 'text-green-700'}`}>
                          {diasRestantes < 0 ? 'Vencido' : diasRestantes === 0 ? 'Hoje' : `${diasRestantes} dia${diasRestantes !== 1 ? 's' : ''}`}
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

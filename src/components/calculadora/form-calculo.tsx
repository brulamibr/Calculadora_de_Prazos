'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarIcon, Calculator, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { calcularPrazo, calcularPrazoCorridos, gerarRecessoForense } from '@/lib/calculadora'
import type { DiaDetalhe } from '@/lib/calculadora'
import { TRIBUNAIS, GRUPOS_TRIBUNAL, SISTEMAS } from '@/lib/tribunais'
import type { Estado, Feriado } from '@/lib/types'
import type { Tribunal } from '@/lib/tribunais'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

type TipoPrazo = 'uteis' | 'corridos'

interface MunicipioIBGE {
  id: number
  nome: string
}

interface FeriadoBrasilAPI {
  date: string
  name: string
  type: string
}

async function buscarFeriadosNacionais(anos: number[]): Promise<Feriado[]> {
  const resultados = await Promise.all(
    anos.map((ano) =>
      fetch(`https://brasilapi.com.br/api/feriados/v1/${ano}`)
        .then((r) => r.json())
        .then((data: FeriadoBrasilAPI[]) =>
          data.map((f, i) => ({
            id: `nacional-${ano}-${i}`,
            nome: f.name,
            data: f.date,
            tipo: 'nacional' as const,
            recorrente: false,
            estado_sigla: null,
            municipio_id: null,
          }))
        )
        .catch(() => [] as Feriado[])
    )
  )
  return resultados.flat()
}

const tribunaisPorGrupo = (Object.keys(GRUPOS_TRIBUNAL) as Tribunal['grupo'][]).map((grupo) => ({
  grupo,
  label: GRUPOS_TRIBUNAL[grupo],
  tribunais: TRIBUNAIS.filter((t) => t.grupo === grupo),
}))

export function FormCalculo() {
  const [estados, setEstados] = useState<Estado[]>([])
  const [municipios, setMunicipios] = useState<MunicipioIBGE[]>([])
  const [loadingMunicipios, setLoadingMunicipios] = useState(false)
  const [estadoSigla, setEstadoSigla] = useState<string>('')
  const [municipioNome, setMunicipioNome] = useState<string>('')
  const [dataInicio, setDataInicio] = useState<Date>()
  const [numeroDias, setNumeroDias] = useState<string>('15')
  const [tipoPrazo, setTipoPrazo] = useState<TipoPrazo>('uteis')
  const [tribunal, setTribunal] = useState<string>('')
  const [sistema, setSistema] = useState<string>('')
  const [sistemaOutro, setSistemaOutro] = useState<string>('')
  const [cliente, setCliente] = useState<string>('')
  const [numeroProcesso, setNumeroProcesso] = useState<string>('')
  const [providencia, setProvidencia] = useState<string>('')
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<{
    dataFim: Date
    feriadosEncontrados: Feriado[]
    diasCorridos: number
    detalheDias: DiaDetalhe[]
    tipoPrazo: TipoPrazo
    numeroDias: number
  } | null>(null)
  const [mostrarDetalhe, setMostrarDetalhe] = useState(false)

  useEffect(() => {
    async function carregarEstados() {
      const supabase = createClient()
      const { data } = await supabase.from('estados').select('*').order('nome')
      setEstados(data || [])
    }
    carregarEstados()
  }, [])

  useEffect(() => {
    if (!estadoSigla) { setMunicipios([]); return }
    setLoadingMunicipios(true)
    setMunicipioNome('')
    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estadoSigla}/municipios?orderBy=nome`)
      .then((r) => r.json())
      .then((data: MunicipioIBGE[]) => setMunicipios(data))
      .catch(() => toast.error('Erro ao carregar municípios'))
      .finally(() => setLoadingMunicipios(false))
  }, [estadoSigla])

  const sistemaFinal = sistema === 'Outro' ? sistemaOutro : sistema

  async function handleCalcular(e: { preventDefault(): void }) {
    e.preventDefault()
    if (!dataInicio) { toast.error('Selecione a data de início'); return }
    const dias = parseInt(numeroDias)
    if (!dias || dias <= 0) { toast.error('Informe um número válido de dias'); return }

    setLoading(true)
    try {
      const supabase = createClient()
      let res: { dataFim: Date; feriadosEncontrados: Feriado[]; diasCorridos: number; detalheDias: DiaDetalhe[] }
      let municipioId: number | null = null

      if (tipoPrazo === 'corridos') {
        const anoInicio = dataInicio.getFullYear()
        const anoFimEstimado = new Date(dataInicio.getTime() + dias * 86400000).getFullYear()
        const anosCorridos = Array.from(new Set([anoInicio, anoFimEstimado]))
        const feriadosCorridos = await buscarFeriadosNacionais(anosCorridos)
        const recessoCorridos = gerarRecessoForense(anosCorridos)
        res = calcularPrazoCorridos(dataInicio, dias, [...feriadosCorridos, ...recessoCorridos])
      } else {
        const anoInicio = dataInicio.getFullYear()
        const anoFimEstimado = new Date(dataInicio.getTime() + dias * 2 * 86400000).getFullYear()
        const anos = Array.from(new Set([anoInicio, anoFimEstimado]))
        const feriadosNacionais = await buscarFeriadosNacionais(anos)
        const diasRecessoForense = gerarRecessoForense(anos)

        const dataFimEstimada = new Date(dataInicio)
        dataFimEstimada.setDate(dataFimEstimada.getDate() + dias * 2 + 30)
        const dataInicioStr = format(dataInicio, 'yyyy-MM-dd')
        const dataFimStr = format(dataFimEstimada, 'yyyy-MM-dd')

        let feriadosEstaduais: Feriado[] = []
        if (estadoSigla) {
          const { data } = await supabase
            .from('feriados')
            .select('*')
            .eq('tipo', 'estadual')
            .eq('estado_sigla', estadoSigla)
            .gte('data', dataInicioStr)
            .lte('data', dataFimStr)
          feriadosEstaduais = (data || []) as Feriado[]
        }

        let feriadosMunicipais: Feriado[] = []
        if (municipioNome) {
          let { data: mData } = await supabase
            .from('municipios')
            .select('id')
            .eq('nome', municipioNome)
            .eq('estado_sigla', estadoSigla)
            .maybeSingle()
          if (!mData) {
            const ibgeMunicipio = municipios.find((m) => m.nome === municipioNome)
            const { data: inserted } = await supabase
              .from('municipios')
              .insert({
                nome: municipioNome,
                estado_sigla: estadoSigla,
                codigo_ibge: ibgeMunicipio ? String(ibgeMunicipio.id) : null,
              })
              .select('id')
              .single()
            mData = inserted
          }
          if (mData?.id) {
            municipioId = mData.id
            const { data } = await supabase
              .from('feriados')
              .select('*')
              .eq('tipo', 'municipal')
              .eq('municipio_id', mData.id)
              .gte('data', dataInicioStr)
              .lte('data', dataFimStr)
            feriadosMunicipais = (data || []) as Feriado[]
          }
        }

        res = calcularPrazo(dataInicio, dias, [
          ...feriadosNacionais,
          ...diasRecessoForense,
          ...feriadosEstaduais,
          ...feriadosMunicipais,
        ])
      }

      setResultado({ ...res, tipoPrazo, numeroDias: dias })

      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('calculos').insert({
          user_id: user.id,
          tribunal: tribunal || null,
          sistema: sistemaFinal || null,
          cliente: cliente || null,
          numero_processo: numeroProcesso || null,
          providencia: providencia || null,
          estado_sigla: estadoSigla || null,
          municipio_id: municipioId,
          data_inicio: format(dataInicio, 'yyyy-MM-dd'),
          dias_uteis: dias,
          data_fim: format(res.dataFim, 'yyyy-MM-dd'),
          feriados_encontrados: res.feriadosEncontrados,
        })
        toast.success('Cálculo salvo no histórico!')
      }
    } catch {
      toast.error('Erro ao calcular. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Formulário */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-blue-600" />
            Calcular Prazo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCalcular} className="space-y-5">

            {/* Tipo de prazo */}
            <div className="space-y-2">
              <Label>Tipo de contagem</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTipoPrazo('uteis')}
                  className={cn(
                    'rounded-lg border-2 px-4 py-2.5 text-sm font-medium transition-colors text-center',
                    tipoPrazo === 'uteis'
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400'
                      : 'border-border bg-background text-muted-foreground hover:bg-muted'
                  )}
                >
                  Dias Úteis
                  <span className="block text-xs font-normal mt-0.5 opacity-70">
                    Exclui fins de semana e feriados
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setTipoPrazo('corridos')}
                  className={cn(
                    'rounded-lg border-2 px-4 py-2.5 text-sm font-medium transition-colors text-center',
                    tipoPrazo === 'corridos'
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400'
                      : 'border-border bg-background text-muted-foreground hover:bg-muted'
                  )}
                >
                  Dias Corridos
                  <span className="block text-xs font-normal mt-0.5 opacity-70">
                    Conta todos os dias do calendário
                  </span>
                </button>
              </div>
            </div>

            {/* Tribunal */}
            <div className="space-y-2">
              <Label>Tribunal</Label>
              <Select value={tribunal} onValueChange={(v) => { if (v) setTribunal(v) }}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tribunal" />
                </SelectTrigger>
                <SelectContent>
                  {tribunaisPorGrupo.map((g) => (
                    <SelectGroup key={g.grupo}>
                      <SelectLabel>{g.label}</SelectLabel>
                      {g.tribunais.map((t) => (
                        <SelectItem key={t.sigla} value={t.sigla}>
                          {t.sigla} — {t.nome}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sistema */}
            <div className="space-y-2">
              <Label>Sistema</Label>
              <Select value={sistema} onValueChange={(v) => { if (v) setSistema(v) }}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o sistema" />
                </SelectTrigger>
                <SelectContent>
                  {SISTEMAS.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {sistema === 'Outro' && (
                <Input
                  placeholder="Informe o nome do sistema"
                  value={sistemaOutro}
                  onChange={(e) => setSistemaOutro(e.target.value)}
                  className="mt-2"
                />
              )}
            </div>

            {/* Cliente e Número do Processo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cliente">Cliente</Label>
                <Input
                  id="cliente"
                  placeholder="Nome do cliente"
                  value={cliente}
                  onChange={(e) => setCliente(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="numero-processo">Número do Processo</Label>
                <Input
                  id="numero-processo"
                  placeholder="0000000-00.0000.0.00.0000"
                  value={numeroProcesso}
                  onChange={(e) => setNumeroProcesso(e.target.value)}
                />
              </div>
            </div>

            {/* Providência */}
            <div className="space-y-2">
              <Label htmlFor="providencia">Providência</Label>
              <Input
                id="providencia"
                placeholder="Ex: Apresentar contestação"
                value={providencia}
                onChange={(e) => setProvidencia(e.target.value)}
              />
            </div>

            {/* Estado e Comarca — só relevantes para dias úteis */}
            {tipoPrazo === 'uteis' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Select value={estadoSigla} onValueChange={(v) => { if (v) setEstadoSigla(v) }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {estados.map((e) => (
                        <SelectItem key={e.sigla} value={e.sigla}>
                          {e.sigla} — {e.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Comarca / Município</Label>
                  <Select
                    value={municipioNome}
                    onValueChange={(v) => { if (v) setMunicipioNome(v) }}
                    disabled={!estadoSigla || loadingMunicipios}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          loadingMunicipios
                            ? 'Carregando...'
                            : estadoSigla
                            ? 'Selecione'
                            : 'Escolha o estado'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {municipios.map((m) => (
                        <SelectItem key={m.id} value={m.nome}>
                          {m.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Data da Publicação</Label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger
                  className={cn(
                    'flex h-9 w-full items-center justify-start gap-2 rounded-lg border border-border bg-background px-3 text-sm font-normal transition-colors hover:bg-muted',
                    !dataInicio && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="h-4 w-4 shrink-0" />
                  {dataInicio
                    ? format(dataInicio, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                    : 'Selecione a data'}
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dataInicio}
                    onSelect={(d) => { setDataInicio(d); setCalendarOpen(false) }}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dias">
                Número de dias do prazo
              </Label>
              <Input
                id="dias"
                type="number"
                min="1"
                max="365"
                value={numeroDias}
                onChange={(e) => setNumeroDias(e.target.value)}
                placeholder={tipoPrazo === 'uteis' ? 'Ex: 15' : 'Ex: 30'}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={loading}
            >
              {loading ? 'Calculando...' : 'Calcular Prazo Final'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Resultado */}
      {resultado ? (
        <Card className="border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/20">
          <CardHeader>
            <CardTitle className="text-blue-800">Resultado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(estadoSigla || tribunal || cliente || numeroProcesso || providencia) && (
              <div className="text-sm text-blue-700 space-y-0.5">
                {cliente && <p className="font-medium">Cliente: {cliente}</p>}
                {numeroProcesso && <p className="text-blue-600">Processo: {numeroProcesso}</p>}
                {tribunal && <p className="text-blue-600">Tribunal: {tribunal}{sistemaFinal ? ` · ${sistemaFinal}` : ''}</p>}
                {providencia && <p className="text-blue-600">Providência: {providencia}</p>}
                {resultado.tipoPrazo === 'uteis' && estadoSigla && (
                  <p className="text-blue-600">
                    {municipioNome ? `${municipioNome} / ` : ''}{estadoSigla}
                  </p>
                )}
              </div>
            )}

            <div className="bg-card rounded-xl p-6 text-center shadow-sm">
              <p className="text-sm text-muted-foreground mb-1">Data final do prazo</p>
              <p className="text-3xl font-bold text-blue-700">
                {format(resultado.dataFim, 'dd/MM/yyyy')}
              </p>
              <p className="text-sm text-muted-foreground mt-1 capitalize">
                {format(resultado.dataFim, 'EEEE', { locale: ptBR })}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-card rounded-lg p-3 text-center shadow-sm">
                <p className="text-xs text-muted-foreground">Dias corridos</p>
                <p className="text-xl font-semibold">{resultado.diasCorridos}</p>
              </div>
              <div className="bg-card rounded-lg p-3 text-center shadow-sm">
                <p className="text-xs text-muted-foreground">
                  {resultado.tipoPrazo === 'uteis' ? 'Dias úteis' : 'Dias contados'}
                </p>
                <p className="text-xl font-semibold">{resultado.numeroDias}</p>
              </div>
              <div className="bg-card rounded-lg p-3 text-center shadow-sm">
                <p className="text-xs text-muted-foreground">Feriados</p>
                <p className="text-xl font-semibold">{resultado.feriadosEncontrados.length}</p>
              </div>
            </div>

            <div className="flex justify-center">
              <Badge
                variant="secondary"
                className={cn(
                  'text-xs px-3 py-1',
                  resultado.tipoPrazo === 'uteis'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-slate-100 text-slate-600'
                )}
              >
                {resultado.tipoPrazo === 'uteis' ? 'Contagem em dias úteis' : 'Contagem em dias corridos'}
              </Badge>
            </div>

            {resultado.feriadosEncontrados.length > 0 && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    Feriados e recesso desconsiderados
                  </p>
                  <div className="space-y-1.5">
                    {resultado.feriadosEncontrados.map((f) => {
                      const ehRecesso = f.id.startsWith('recesso-')
                      return (
                      <div
                        key={f.id}
                        className="flex items-center justify-between bg-card rounded-lg px-3 py-2 text-sm shadow-sm"
                      >
                        <span>{f.nome}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">
                            {format(new Date(f.data + 'T00:00:00'), 'dd/MM', { locale: ptBR })}
                          </span>
                          <Badge
                            variant="secondary"
                            className={cn(
                              'text-xs capitalize',
                              ehRecesso ? 'bg-amber-100 text-amber-700' : ''
                            )}
                          >
                            {ehRecesso ? 'recesso' : f.tipo}
                          </Badge>
                        </div>
                      </div>
                      )
                    })}
                  </div>
                </div>
              </>
            )}

            {resultado.detalheDias.length > 0 && (
              <>
                <Separator />
                <div>
                  <button
                    type="button"
                    onClick={() => setMostrarDetalhe((v) => !v)}
                    className="flex items-center gap-1 text-sm font-medium text-blue-800 mb-2 hover:text-blue-600 transition-colors w-full"
                  >
                    {mostrarDetalhe ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    Contagem dia a dia ({resultado.detalheDias.length} dias)
                  </button>
                  {mostrarDetalhe && (
                    <div className="rounded-lg border border-blue-200 dark:border-blue-900 overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-blue-100/60 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300">
                            <th className="text-left px-3 py-2 font-medium">Data</th>
                            <th className="text-left px-3 py-2 font-medium">Dia</th>
                            <th className="text-left px-3 py-2 font-medium">Tipo</th>
                            {resultado.tipoPrazo === 'uteis' && (
                              <th className="text-right px-3 py-2 font-medium">#</th>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {resultado.detalheDias.map((d) => {
                            const date = new Date(d.data + 'T00:00:00')
                            const rowColor =
                              d.tipo === 'util'
                                ? ''
                                : d.tipo === 'feriado'
                                ? 'bg-amber-50 dark:bg-amber-950/20'
                                : 'bg-slate-50 dark:bg-slate-900/30'
                            const textColor =
                              d.tipo === 'util'
                                ? 'text-foreground'
                                : d.tipo === 'feriado'
                                ? 'text-amber-700 dark:text-amber-400'
                                : 'text-muted-foreground'
                            return (
                              <tr key={d.data} className={cn('border-t border-blue-100 dark:border-blue-900/50', rowColor)}>
                                <td className={cn('px-3 py-1.5 tabular-nums', textColor)}>
                                  {format(date, 'dd/MM/yyyy')}
                                </td>
                                <td className={cn('px-3 py-1.5 capitalize', textColor)}>
                                  {format(date, 'EEE', { locale: ptBR })}
                                </td>
                                <td className="px-3 py-1.5">
                                  {d.tipo === 'util' && (
                                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400">
                                      Útil
                                    </Badge>
                                  )}
                                  {d.tipo === 'sabado' && (
                                    <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-500">
                                      Sábado
                                    </Badge>
                                  )}
                                  {d.tipo === 'domingo' && (
                                    <Badge variant="secondary" className="text-xs bg-slate-200 text-slate-600">
                                      Domingo
                                    </Badge>
                                  )}
                                  {d.tipo === 'feriado' && (
                                    <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700">
                                      {d.nomeFeriado || 'Feriado'}
                                    </Badge>
                                  )}
                                </td>
                                {resultado.tipoPrazo === 'uteis' && (
                                  <td className="px-3 py-1.5 text-right tabular-nums font-medium text-blue-700 dark:text-blue-400">
                                    {d.contagemUtil ?? ''}
                                  </td>
                                )}
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed flex items-center justify-center min-h-64">
          <div className="text-center text-muted-foreground p-8">
            <Calculator className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">
              Preencha o formulário e clique em calcular para ver o resultado aqui.
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}

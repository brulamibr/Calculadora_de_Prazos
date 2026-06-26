'use client'

import { useMemo, useState } from 'react'
import { addDays, differenceInCalendarDays, format, isWeekend, nextMonday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowDown, ArrowUp, ArrowUpDown, History, Search, X } from 'lucide-react'
import { BotaoExcluir } from './botao-excluir'
import type { Calculo } from '@/lib/types'

type CalculoComJoin = Calculo & {
  municipio: { nome: string } | null
  estado: { nome: string; sigla: string } | null
}

type SortKey =
  | 'diasRestantes'
  | 'tribunal'
  | 'sistema'
  | 'dataPublicacao'
  | 'inicio'
  | 'diasPrazo'
  | 'fim'
  | 'diaSemana'
  | 'cliente'
  | 'processo'
  | 'foro'
  | 'providencia'

type SortDir = 'asc' | 'desc'

function proximoDiaUtil(data: Date): Date {
  const proximo = addDays(data, 1)
  if (isWeekend(proximo)) return nextMonday(proximo)
  return proximo
}

interface RowData {
  original: CalculoComJoin
  diasRestantes: number
  tribunal: string
  sistema: string
  dataPublicacao: Date
  inicio: Date
  diasPrazo: number
  fim: Date
  diaSemana: string
  cliente: string
  processo: string
  foro: string
  providencia: string
}

function buildRow(c: CalculoComJoin): RowData {
  const dataPublicacao = new Date(c.data_inicio + 'T00:00:00')
  const inicio = proximoDiaUtil(dataPublicacao)
  const fim = new Date(c.data_fim + 'T00:00:00')
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const municipioNome = c.municipio?.nome ?? ''
  const sigla = c.estado?.sigla ?? c.estado_sigla ?? ''
  const foro = municipioNome
    ? `${municipioNome}${sigla ? `/${sigla}` : ''}`
    : sigla || ''
  return {
    original: c,
    diasRestantes: differenceInCalendarDays(fim, hoje),
    tribunal: c.tribunal || '',
    sistema: c.sistema || '',
    dataPublicacao,
    inicio,
    diasPrazo: c.dias_uteis,
    fim,
    diaSemana: format(fim, 'EEE', { locale: ptBR }),
    cliente: c.cliente || '',
    processo: c.numero_processo || '',
    foro,
    providencia: c.providencia || '',
  }
}

const columns: { key: SortKey; label: string; align?: 'center' }[] = [
  { key: 'diasRestantes', label: 'Dias Restantes', align: 'center' },
  { key: 'tribunal', label: 'Tribunal' },
  { key: 'sistema', label: 'Sistema' },
  { key: 'dataPublicacao', label: 'Data da Publicação' },
  { key: 'inicio', label: 'Início' },
  { key: 'diasPrazo', label: 'Dias do Prazo', align: 'center' },
  { key: 'fim', label: 'Fim' },
  { key: 'diaSemana', label: 'Dia da Semana', align: 'center' },
  { key: 'cliente', label: 'Cliente' },
  { key: 'processo', label: 'Processo' },
  { key: 'foro', label: 'Foro' },
  { key: 'providencia', label: 'Providência' },
]

function compareFn(a: RowData, b: RowData, key: SortKey): number {
  switch (key) {
    case 'diasRestantes':
    case 'diasPrazo':
      return a[key] - b[key]
    case 'dataPublicacao':
    case 'inicio':
    case 'fim':
      return a[key].getTime() - b[key].getTime()
    default:
      return a[key].localeCompare(b[key], 'pt-BR')
  }
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <ArrowUpDown className="h-3 w-3 opacity-40" />
  return dir === 'asc'
    ? <ArrowUp className="h-3 w-3" />
    : <ArrowDown className="h-3 w-3" />
}

interface Props {
  calculos: CalculoComJoin[]
}

export function TabelaHistorico({ calculos }: Props) {
  const [busca, setBusca] = useState('')
  const [sortKey, setSortKey] = useState<SortKey | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  const rows = useMemo(() => calculos.map(buildRow), [calculos])

  const filtered = useMemo(() => {
    if (!busca.trim()) return rows
    const termo = busca.toLowerCase()
    return rows.filter((r) =>
      r.tribunal.toLowerCase().includes(termo) ||
      r.sistema.toLowerCase().includes(termo) ||
      r.cliente.toLowerCase().includes(termo) ||
      r.processo.toLowerCase().includes(termo) ||
      r.foro.toLowerCase().includes(termo) ||
      r.providencia.toLowerCase().includes(termo) ||
      format(r.dataPublicacao, 'dd/MM/yyyy').includes(termo) ||
      format(r.fim, 'dd/MM/yyyy').includes(termo)
    )
  }, [rows, busca])

  const sorted = useMemo(() => {
    if (!sortKey) return filtered
    const sorted = [...filtered].sort((a, b) => compareFn(a, b, sortKey))
    return sortDir === 'desc' ? sorted.reverse() : sorted
  }, [filtered, sortKey, sortDir])

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      if (sortDir === 'asc') {
        setSortDir('desc')
      } else {
        setSortKey(null)
        setSortDir('asc')
      }
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  if (calculos.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <History className="h-10 w-10 mx-auto mb-3 opacity-20" />
        <p>Nenhum cálculo encontrado.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Barra de busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Pesquisar por cliente, processo, tribunal, foro, providência..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full rounded-lg border border-border bg-background pl-10 pr-10 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        />
        {busca && (
          <button
            onClick={() => setBusca('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Contador */}
      <p className="text-xs text-muted-foreground">
        {sorted.length === rows.length
          ? `${rows.length} registro(s)`
          : `${sorted.length} de ${rows.length} registro(s)`}
        {sortKey && (
          <span className="ml-2">
            — ordenado por <span className="font-medium">{columns.find(c => c.key === sortKey)?.label}</span> ({sortDir === 'asc' ? 'crescente' : 'decrescente'})
          </span>
        )}
      </p>

      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-blue-700 text-white">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={`py-3 px-3 font-semibold text-xs uppercase tracking-wide cursor-pointer select-none hover:bg-blue-600 transition-colors ${col.align === 'center' ? 'text-center' : 'text-left'}`}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    <SortIcon active={sortKey === col.key} dir={sortDir} />
                  </span>
                </th>
              ))}
              <th className="py-3 px-3 font-semibold text-center text-xs uppercase tracking-wide">Ações</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r, i) => (
              <tr
                key={r.original.id}
                className={i % 2 === 0 ? 'bg-orange-50 dark:bg-orange-950/20' : 'bg-orange-100/70 dark:bg-orange-950/40'}
              >
                <td className={`py-2.5 px-3 text-center font-semibold ${r.diasRestantes < 0 ? 'text-red-600' : r.diasRestantes <= 3 ? 'text-orange-600' : 'text-green-700'}`}>
                  {r.diasRestantes < 0 ? 'Vencido' : r.diasRestantes === 0 ? 'Hoje' : `${r.diasRestantes} dia${r.diasRestantes !== 1 ? 's' : ''}`}
                </td>
                <td className="py-2.5 px-3">{r.tribunal || '—'}</td>
                <td className="py-2.5 px-3">{r.sistema || '—'}</td>
                <td className="py-2.5 px-3">{format(r.dataPublicacao, 'dd/MM/yyyy')}</td>
                <td className="py-2.5 px-3">{format(r.inicio, 'dd/MM/yyyy')}</td>
                <td className="py-2.5 px-3 text-center">{r.diasPrazo}</td>
                <td className="py-2.5 px-3 font-semibold">{format(r.fim, 'dd/MM/yyyy')}</td>
                <td className="py-2.5 px-3 capitalize text-center">{r.diaSemana}</td>
                <td className="py-2.5 px-3">{r.cliente || '—'}</td>
                <td className="py-2.5 px-3 text-xs">{r.processo || '—'}</td>
                <td className="py-2.5 px-3">{r.foro || '—'}</td>
                <td className="py-2.5 px-3">{r.providencia || '—'}</td>
                <td className="py-2.5 px-3 text-center">
                  <BotaoExcluir calculoId={r.original.id} />
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={13} className="py-8 text-center text-muted-foreground">
                  Nenhum resultado para &quot;{busca}&quot;
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

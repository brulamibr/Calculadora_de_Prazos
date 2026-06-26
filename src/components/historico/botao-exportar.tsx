'use client'

import { useState } from 'react'
import { addDays, differenceInCalendarDays, format, isWeekend, nextMonday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Download } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Calculo } from '@/lib/types'

type CalculoComJoin = Calculo & {
  municipio: { nome: string } | null
  estado: { nome: string; sigla: string } | null
}

interface Props {
  calculos: CalculoComJoin[]
}

function proximoDiaUtil(data: Date): Date {
  const proximo = addDays(data, 1)
  if (isWeekend(proximo)) return nextMonday(proximo)
  return proximo
}

export function BotaoExportar({ calculos }: Props) {
  const [loading, setLoading] = useState(false)

  function montarLinhas() {
    return calculos.map((c) => {
      const dataPublicacao = new Date(c.data_inicio + 'T00:00:00')
      const dataInicio = proximoDiaUtil(dataPublicacao)
      const dataFim = new Date(c.data_fim + 'T00:00:00')
      const foro = c.municipio?.nome
        ? `${c.municipio.nome}${c.estado?.sigla ? `/${c.estado.sigla}` : ''}`
        : ''
      const hoje = new Date()
      hoje.setHours(0, 0, 0, 0)
      const diasRestantes = differenceInCalendarDays(dataFim, hoje)
      return {
        diasRestantes: diasRestantes < 0 ? 'Vencido' : diasRestantes === 0 ? 'Hoje' : `${diasRestantes}`,
        tribunal: c.tribunal || '',
        sistema: c.sistema || '',
        dataPublicacao: format(dataPublicacao, 'dd/MM/yyyy'),
        inicio: format(dataInicio, 'dd/MM/yyyy'),
        diasPrazo: c.dias_uteis,
        fim: format(dataFim, 'dd/MM/yyyy'),
        diaSemana: format(dataFim, 'EEE', { locale: ptBR }),
        cliente: c.cliente || '',
        processo: c.numero_processo || '',
        foro,
        providencia: c.providencia || '',
      }
    })
  }

  async function exportarExcel() {
    setLoading(true)
    const XLSX = await import('xlsx')
    const rows = montarLinhas().map((r) => ({
      'Dias Restantes': r.diasRestantes,
      'Tribunal': r.tribunal,
      'Sistema': r.sistema,
      'Data da Publicação': r.dataPublicacao,
      'Início': r.inicio,
      'Dias do Prazo': r.diasPrazo,
      'Fim': r.fim,
      'Dia da Semana': r.diaSemana,
      'Cliente': r.cliente,
      'Processo': r.processo,
      'Foro': r.foro,
      'Providência': r.providencia,
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Prazos')
    XLSX.writeFile(wb, `prazos_${format(new Date(), 'yyyyMMdd')}.xlsx`)
    setLoading(false)
  }

  async function exportarPDF() {
    setLoading(true)
    const { default: jsPDF } = await import('jspdf')
    const { default: autoTable } = await import('jspdf-autotable')

    const doc = new jsPDF({ orientation: 'landscape' })
    doc.setFontSize(16)
    doc.text('Relatório de Prazos Jurídicos', 14, 20)
    doc.setFontSize(10)
    doc.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 28)

    const linhas = montarLinhas()

    autoTable(doc, {
      startY: 35,
      head: [['Dias Restantes', 'Tribunal', 'Sistema', 'Data Publicação', 'Início', 'Dias', 'Fim', 'Dia Sem.', 'Cliente', 'Processo', 'Foro', 'Providência']],
      body: linhas.map((r) => [
        r.diasRestantes,
        r.tribunal,
        r.sistema,
        r.dataPublicacao,
        r.inicio,
        String(r.diasPrazo),
        r.fim,
        r.diaSemana,
        r.cliente,
        r.processo,
        r.foro,
        r.providencia,
      ]),
      styles: { fontSize: 7 },
      headStyles: { fillColor: [30, 64, 175] },
    })

    doc.save(`prazos_${format(new Date(), 'yyyyMMdd')}.pdf`)
    setLoading(false)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm font-medium transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
      >
        <Download className="h-4 w-4" />
        Exportar
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportarExcel}>
          Exportar Excel (.xlsx)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportarPDF}>
          Exportar PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

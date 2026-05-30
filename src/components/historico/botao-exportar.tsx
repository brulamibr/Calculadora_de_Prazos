'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Download } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Calculo } from '@/lib/types'

interface Props {
  calculos: Calculo[]
}

export function BotaoExportar({ calculos }: Props) {
  const [loading, setLoading] = useState(false)

  async function exportarExcel() {
    setLoading(true)
    const XLSX = await import('xlsx')
    const rows = calculos.map((c) => ({
      'Identificação': c.titulo || '',
      'Estado': c.estado_sigla || '',
      'Início': format(new Date(c.data_inicio + 'T00:00:00'), 'dd/MM/yyyy'),
      'Dias Úteis': c.dias_uteis,
      'Prazo Final': format(new Date(c.data_fim + 'T00:00:00'), 'dd/MM/yyyy'),
      'Feriados': Array.isArray(c.feriados_encontrados) ? c.feriados_encontrados.length : 0,
      'Calculado em': format(new Date(c.created_at), 'dd/MM/yyyy HH:mm'),
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

    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text('Relatório de Prazos Jurídicos', 14, 20)
    doc.setFontSize(10)
    doc.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 28)

    autoTable(doc, {
      startY: 35,
      head: [['Identificação', 'Estado', 'Início', 'Dias úteis', 'Prazo Final', 'Status']],
      body: calculos.map((c) => {
        const dataFim = new Date(c.data_fim + 'T00:00:00')
        const status = dataFim < new Date() ? 'Vencido' : 'Ativo'
        return [
          c.titulo || `Prazo ${c.dias_uteis}du`,
          c.estado_sigla || '—',
          format(new Date(c.data_inicio + 'T00:00:00'), 'dd/MM/yyyy'),
          String(c.dias_uteis),
          format(dataFim, 'dd/MM/yyyy'),
          status,
        ]
      }),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [37, 99, 235] },
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

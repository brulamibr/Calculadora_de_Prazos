import { addDays, format, isWeekend, parseISO } from 'date-fns'
import type { Feriado } from '@/lib/types'

export type { Feriado }

export interface ResultadoCalculo {
  dataFim: Date
  feriadosEncontrados: Feriado[]
  diasCorridos: number
}

export function calcularPrazo(
  dataInicio: Date,
  diasUteis: number,
  feriados: Feriado[]
): ResultadoCalculo {
  const feriadosSet = new Set(feriados.map((f) => f.data))
  const feriadosEncontrados: Feriado[] = []

  let diasContados = 0
  let dataAtual = addDays(dataInicio, 1) // prazo começa no dia seguinte

  while (diasContados < diasUteis) {
    const dataStr = format(dataAtual, 'yyyy-MM-dd')
    const ehFeriado = feriadosSet.has(dataStr)

    if (ehFeriado) {
      const f = feriados.find((f) => f.data === dataStr)
      if (f && !feriadosEncontrados.find((x) => x.id === f.id)) {
        feriadosEncontrados.push(f)
      }
    }

    if (!isWeekend(dataAtual) && !ehFeriado) {
      diasContados++
    }

    if (diasContados < diasUteis) {
      dataAtual = addDays(dataAtual, 1)
    }
  }

  const diasCorridos = Math.round(
    (dataAtual.getTime() - dataInicio.getTime()) / (1000 * 60 * 60 * 24)
  )

  return { dataFim: dataAtual, feriadosEncontrados, diasCorridos }
}

export function calcularPrazoCorridos(
  dataInicio: Date,
  diasCorridos: number
): ResultadoCalculo {
  const dataFim = addDays(dataInicio, diasCorridos)
  return { dataFim, feriadosEncontrados: [], diasCorridos }
}

export function feriadosParaAno(feriados: Feriado[], ano: number): Feriado[] {
  return feriados
    .map((f) => {
      if (f.data.startsWith(String(ano))) return f
      // para feriados recorrentes, ajusta o ano
      const dataOriginal = parseISO(f.data)
      const novaData = new Date(ano, dataOriginal.getMonth(), dataOriginal.getDate())
      return { ...f, data: format(novaData, 'yyyy-MM-dd') }
    })
    .filter(Boolean) as Feriado[]
}

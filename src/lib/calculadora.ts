import { addDays, format, isWeekend, parseISO } from 'date-fns'
import type { Feriado } from '@/lib/types'

export type { Feriado }

export interface ResultadoCalculo {
  dataFim: Date
  feriadosEncontrados: Feriado[]
  diasCorridos: number
}

/**
 * Gera os dias do recesso forense (art. 220 CPC) para os anos informados.
 * O recesso vai de 20/12 de um ano a 20/01 do ano seguinte, inclusive.
 */
export function gerarRecessoForense(anos: number[]): Feriado[] {
  const diasSet = new Set<string>()
  const dias: Feriado[] = []

  function adicionarDia(data: string, id: string) {
    if (diasSet.has(data)) return
    diasSet.add(data)
    dias.push({
      id,
      nome: 'Recesso Forense (art. 220 CPC)',
      data,
      tipo: 'nacional',
      recorrente: true,
      estado_sigla: null,
      municipio_id: null,
    })
  }

  for (const ano of anos) {
    for (let dia = 1; dia <= 20; dia++) {
      const d = new Date(ano, 0, dia)
      adicionarDia(format(d, 'yyyy-MM-dd'), `recesso-${ano}-jan-${dia}`)
    }
    for (let dia = 20; dia <= 31; dia++) {
      const d = new Date(ano, 11, dia)
      adicionarDia(format(d, 'yyyy-MM-dd'), `recesso-${ano}-dez-${dia}`)
    }
    for (let dia = 1; dia <= 20; dia++) {
      const d = new Date(ano + 1, 0, dia)
      adicionarDia(format(d, 'yyyy-MM-dd'), `recesso-${ano + 1}-jan-${dia}`)
    }
  }

  return dias
}

export function calcularPrazo(
  dataInicio: Date,
  diasUteis: number,
  feriados: Feriado[]
): ResultadoCalculo {
  const feriadosSet = new Set(feriados.map((f) => f.data))
  const feriadosEncontrados: Feriado[] = []

  let diasContados = 0
  let dataAtual = addDays(dataInicio, 1)

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
      const dataOriginal = parseISO(f.data)
      const novaData = new Date(ano, dataOriginal.getMonth(), dataOriginal.getDate())
      return { ...f, data: format(novaData, 'yyyy-MM-dd') }
    })
    .filter(Boolean) as Feriado[]
}

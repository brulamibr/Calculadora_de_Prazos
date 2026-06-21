export interface Estado {
  sigla: string
  nome: string
}

export interface Municipio {
  id: number
  nome: string
  estado_sigla: string
  codigo_ibge: string | null
}

export interface Feriado {
  id: string
  nome: string
  data: string
  tipo: 'nacional' | 'estadual' | 'municipal'
  recorrente: boolean
  estado_sigla: string | null
  municipio_id: number | null
}

export interface Calculo {
  id: string
  user_id: string
  titulo: string | null
  estado_sigla: string | null
  municipio_id: number | null
  tribunal: string | null
  sistema: string | null
  cliente: string | null
  numero_processo: string | null
  providencia: string | null
  data_inicio: string
  dias_uteis: number
  data_fim: string
  feriados_encontrados: Feriado[]
  created_at: string
  municipio?: Municipio
  estado?: Estado
}

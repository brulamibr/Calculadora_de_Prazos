export interface Tribunal {
  sigla: string
  nome: string
  grupo: 'superiores' | 'trf' | 'tj' | 'trt' | 'tjm'
}

export const TRIBUNAIS: Tribunal[] = [
  // Tribunais Superiores
  { sigla: 'STF', nome: 'Supremo Tribunal Federal', grupo: 'superiores' },
  { sigla: 'STJ', nome: 'Superior Tribunal de Justiça', grupo: 'superiores' },
  { sigla: 'TST', nome: 'Tribunal Superior do Trabalho', grupo: 'superiores' },
  { sigla: 'TSE', nome: 'Tribunal Superior Eleitoral', grupo: 'superiores' },
  { sigla: 'STM', nome: 'Superior Tribunal Militar', grupo: 'superiores' },
  // Tribunais Regionais Federais
  { sigla: 'TRF1', nome: 'Tribunal Regional Federal da 1ª Região (DF, GO, TO, MT, BA, PI, MA, PA, AM, AC, RO, RR, AP)', grupo: 'trf' },
  { sigla: 'TRF2', nome: 'Tribunal Regional Federal da 2ª Região (RJ, ES)', grupo: 'trf' },
  { sigla: 'TRF3', nome: 'Tribunal Regional Federal da 3ª Região (SP, MS)', grupo: 'trf' },
  { sigla: 'TRF4', nome: 'Tribunal Regional Federal da 4ª Região (RS, SC, PR)', grupo: 'trf' },
  { sigla: 'TRF5', nome: 'Tribunal Regional Federal da 5ª Região (PE, CE, AL, RN, PB, SE)', grupo: 'trf' },
  { sigla: 'TRF6', nome: 'Tribunal Regional Federal da 6ª Região (MG)', grupo: 'trf' },
  // Tribunais de Justiça Estaduais
  { sigla: 'TJAC', nome: 'Tribunal de Justiça do Acre', grupo: 'tj' },
  { sigla: 'TJAL', nome: 'Tribunal de Justiça de Alagoas', grupo: 'tj' },
  { sigla: 'TJAP', nome: 'Tribunal de Justiça do Amapá', grupo: 'tj' },
  { sigla: 'TJAM', nome: 'Tribunal de Justiça do Amazonas', grupo: 'tj' },
  { sigla: 'TJBA', nome: 'Tribunal de Justiça da Bahia', grupo: 'tj' },
  { sigla: 'TJCE', nome: 'Tribunal de Justiça do Ceará', grupo: 'tj' },
  { sigla: 'TJDFT', nome: 'Tribunal de Justiça do Distrito Federal e dos Territórios', grupo: 'tj' },
  { sigla: 'TJES', nome: 'Tribunal de Justiça do Espírito Santo', grupo: 'tj' },
  { sigla: 'TJGO', nome: 'Tribunal de Justiça de Goiás', grupo: 'tj' },
  { sigla: 'TJMA', nome: 'Tribunal de Justiça do Maranhão', grupo: 'tj' },
  { sigla: 'TJMT', nome: 'Tribunal de Justiça de Mato Grosso', grupo: 'tj' },
  { sigla: 'TJMS', nome: 'Tribunal de Justiça de Mato Grosso do Sul', grupo: 'tj' },
  { sigla: 'TJMG', nome: 'Tribunal de Justiça de Minas Gerais', grupo: 'tj' },
  { sigla: 'TJPA', nome: 'Tribunal de Justiça do Pará', grupo: 'tj' },
  { sigla: 'TJPB', nome: 'Tribunal de Justiça da Paraíba', grupo: 'tj' },
  { sigla: 'TJPR', nome: 'Tribunal de Justiça do Paraná', grupo: 'tj' },
  { sigla: 'TJPE', nome: 'Tribunal de Justiça de Pernambuco', grupo: 'tj' },
  { sigla: 'TJPI', nome: 'Tribunal de Justiça do Piauí', grupo: 'tj' },
  { sigla: 'TJRJ', nome: 'Tribunal de Justiça do Rio de Janeiro', grupo: 'tj' },
  { sigla: 'TJRN', nome: 'Tribunal de Justiça do Rio Grande do Norte', grupo: 'tj' },
  { sigla: 'TJRS', nome: 'Tribunal de Justiça do Rio Grande do Sul', grupo: 'tj' },
  { sigla: 'TJRO', nome: 'Tribunal de Justiça de Rondônia', grupo: 'tj' },
  { sigla: 'TJRR', nome: 'Tribunal de Justiça de Roraima', grupo: 'tj' },
  { sigla: 'TJSC', nome: 'Tribunal de Justiça de Santa Catarina', grupo: 'tj' },
  { sigla: 'TJSP', nome: 'Tribunal de Justiça de São Paulo', grupo: 'tj' },
  { sigla: 'TJSE', nome: 'Tribunal de Justiça de Sergipe', grupo: 'tj' },
  { sigla: 'TJTO', nome: 'Tribunal de Justiça do Tocantins', grupo: 'tj' },
  // Tribunais Regionais do Trabalho
  { sigla: 'TRT1', nome: 'TRT 1ª Região — Rio de Janeiro', grupo: 'trt' },
  { sigla: 'TRT2', nome: 'TRT 2ª Região — São Paulo (Grande SP e Baixada Santista)', grupo: 'trt' },
  { sigla: 'TRT3', nome: 'TRT 3ª Região — Minas Gerais', grupo: 'trt' },
  { sigla: 'TRT4', nome: 'TRT 4ª Região — Rio Grande do Sul', grupo: 'trt' },
  { sigla: 'TRT5', nome: 'TRT 5ª Região — Bahia', grupo: 'trt' },
  { sigla: 'TRT6', nome: 'TRT 6ª Região — Pernambuco', grupo: 'trt' },
  { sigla: 'TRT7', nome: 'TRT 7ª Região — Ceará', grupo: 'trt' },
  { sigla: 'TRT8', nome: 'TRT 8ª Região — Pará e Amapá', grupo: 'trt' },
  { sigla: 'TRT9', nome: 'TRT 9ª Região — Paraná', grupo: 'trt' },
  { sigla: 'TRT10', nome: 'TRT 10ª Região — Distrito Federal e Tocantins', grupo: 'trt' },
  { sigla: 'TRT11', nome: 'TRT 11ª Região — Amazonas e Roraima', grupo: 'trt' },
  { sigla: 'TRT12', nome: 'TRT 12ª Região — Santa Catarina', grupo: 'trt' },
  { sigla: 'TRT13', nome: 'TRT 13ª Região — Paraíba', grupo: 'trt' },
  { sigla: 'TRT14', nome: 'TRT 14ª Região — Rondônia e Acre', grupo: 'trt' },
  { sigla: 'TRT15', nome: 'TRT 15ª Região — São Paulo (interior)', grupo: 'trt' },
  { sigla: 'TRT16', nome: 'TRT 16ª Região — Maranhão', grupo: 'trt' },
  { sigla: 'TRT17', nome: 'TRT 17ª Região — Espírito Santo', grupo: 'trt' },
  { sigla: 'TRT18', nome: 'TRT 18ª Região — Goiás', grupo: 'trt' },
  { sigla: 'TRT19', nome: 'TRT 19ª Região — Alagoas', grupo: 'trt' },
  { sigla: 'TRT20', nome: 'TRT 20ª Região — Sergipe', grupo: 'trt' },
  { sigla: 'TRT21', nome: 'TRT 21ª Região — Rio Grande do Norte', grupo: 'trt' },
  { sigla: 'TRT22', nome: 'TRT 22ª Região — Piauí', grupo: 'trt' },
  { sigla: 'TRT23', nome: 'TRT 23ª Região — Mato Grosso', grupo: 'trt' },
  { sigla: 'TRT24', nome: 'TRT 24ª Região — Mato Grosso do Sul', grupo: 'trt' },
  // Tribunais de Justiça Militar Estaduais
  { sigla: 'TJMESP', nome: 'Tribunal de Justiça Militar do Estado de São Paulo', grupo: 'tjm' },
  { sigla: 'TJMMG', nome: 'Tribunal de Justiça Militar de Minas Gerais', grupo: 'tjm' },
  { sigla: 'TJM-RS', nome: 'Tribunal de Justiça Militar do Rio Grande do Sul', grupo: 'tjm' },
]

export const GRUPOS_TRIBUNAL: Record<Tribunal['grupo'], string> = {
  superiores: 'Tribunais Superiores',
  trf: 'Tribunais Regionais Federais',
  tj: 'Tribunais de Justiça',
  trt: 'Tribunais Regionais do Trabalho',
  tjm: 'Tribunais de Justiça Militar',
}

export const SISTEMAS = [
  'Eproc',
  'Esaj',
  'JPE',
  'PJE',
  'Projudi',
  'Outro',
] as const

export type Sistema = (typeof SISTEMAS)[number]

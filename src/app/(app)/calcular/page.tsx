import { FormCalculo } from '@/components/calculadora/form-calculo'
import { AlertTriangle } from 'lucide-react'

export default function CalcularPage() {
  return (
    <div className="p-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Calcular Prazo</h1>
          <p className="text-slate-500 mt-1">
            Informe a comarca, data de início e o número de dias para obter o prazo final.
          </p>
        </div>
        <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-xs text-amber-800 sm:max-w-xs shadow-sm">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
          <p className="leading-relaxed">
            O resultado se baseia em dados públicos que podem conter incorreções. Sempre confira as suspensões de expediente forense na página do Tribunal onde tramita o processo. Não nos responsabilizamos por eventuais incorreções.
          </p>
        </div>
      </div>
      <FormCalculo />
    </div>
  )
}

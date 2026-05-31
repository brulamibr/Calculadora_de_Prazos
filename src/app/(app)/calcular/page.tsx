import { FormCalculo } from '@/components/calculadora/form-calculo'

export default function CalcularPage() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Calcular Prazo</h1>
        <p className="text-slate-500 mt-1">
          Informe a comarca, data de início e o número de dias para obter o prazo final.
        </p>
      </div>
      <FormCalculo />
    </div>
  )
}

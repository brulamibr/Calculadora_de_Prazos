'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface Props {
  calculoId: string
}

export function BotaoExcluir({ calculoId }: Props) {
  const [confirmando, setConfirmando] = useState(false)
  const [excluindo, setExcluindo] = useState(false)
  const router = useRouter()

  async function handleExcluir() {
    setExcluindo(true)
    const supabase = createClient()
    const { error } = await supabase.from('calculos').delete().eq('id', calculoId)
    if (error) {
      toast.error('Erro ao excluir o prazo.')
      setExcluindo(false)
      setConfirmando(false)
      return
    }
    toast.success('Prazo excluído com sucesso.')
    router.refresh()
  }

  if (confirmando) {
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={handleExcluir}
          disabled={excluindo}
          className="rounded px-2 py-1 text-xs font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
        >
          {excluindo ? '...' : 'Sim'}
        </button>
        <button
          onClick={() => setConfirmando(false)}
          disabled={excluindo}
          className="rounded px-2 py-1 text-xs font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300"
        >
          Não
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirmando(true)}
      className="rounded p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
      title="Excluir prazo"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  )
}

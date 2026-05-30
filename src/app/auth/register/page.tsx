'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Scale, MailCheck, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nome, setNome] = useState('')
  const [loading, setLoading] = useState(false)
  const [cadastrado, setCadastrado] = useState(false)

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nome } },
    })
    if (error) {
      toast.error(error.message)
    } else {
      setCadastrado(true)
    }
    setLoading(false)
  }

  // Tela de confirmação após cadastro
  if (cadastrado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center space-y-2">
            <div className="flex justify-center">
              <div className="bg-green-500 p-3 rounded-full">
                <MailCheck className="h-7 w-7 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl">Confirme seu e-mail</CardTitle>
            <CardDescription>Sua conta foi criada com sucesso!</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-center text-slate-600">
              Enviamos um link de ativação para:
            </p>
            <p className="text-center font-semibold text-blue-700 bg-blue-50 rounded-lg px-4 py-2">
              {email}
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                <div className="text-sm text-amber-800 space-y-1">
                  <p className="font-medium">Verifique também a pasta de Spam</p>
                  <p>
                    Se não encontrar o e-mail na sua caixa de entrada, procure na pasta{' '}
                    <strong>Spam</strong> ou <strong>Lixo Eletrônico</strong> — alguns
                    provedores filtram e-mails automáticos.
                  </p>
                </div>
              </div>
            </div>

            <ol className="text-sm text-slate-600 space-y-1 list-decimal list-inside">
              <li>Abra o e-mail de confirmação</li>
              <li>Clique no link <strong>"Confirmar e-mail"</strong></li>
              <li>Você será redirecionado para o sistema</li>
            </ol>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Link
              href="/auth/login"
              className="w-full text-center text-sm text-blue-600 hover:underline font-medium"
            >
              Já ativou? Clique aqui para entrar
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="bg-blue-600 p-3 rounded-full">
              <Scale className="h-7 w-7 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">Criar Conta</CardTitle>
          <CardDescription>Calculadora de Prazos Jurídicos</CardDescription>
        </CardHeader>
        <form onSubmit={handleRegister}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome completo</Label>
              <Input
                id="nome"
                placeholder="Dr. João Silva"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={loading}
            >
              {loading ? 'Criando conta...' : 'Criar conta'}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Já tem conta?{' '}
              <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">
                Entrar
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

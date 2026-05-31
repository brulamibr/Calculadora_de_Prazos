import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Headers de segurança para produção
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Impede que a página seja embutida em iframes (clickjacking)
          { key: 'X-Frame-Options', value: 'DENY' },
          // Impede sniffing de MIME type
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Controla informações de referência enviadas
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Força HTTPS por 1 ano (ativo somente em produção via Vercel)
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
          // Restringe recursos do navegador desnecessários
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          // Política básica de conteúdo (permite Supabase e APIs externas usadas)
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Scripts: próprios + inline necessário para Next.js
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              // Estilos: próprios + inline (TailwindCSS)
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              // Fontes: Google Fonts + self
              "font-src 'self' https://fonts.gstatic.com",
              // Imagens
              "img-src 'self' data: blob:",
              // Conexões externas permitidas (Supabase + APIs públicas usadas)
              `connect-src 'self' https://*.supabase.co wss://*.supabase.co https://brasilapi.com.br https://servicodados.ibge.gov.br`,
              // Frames: nenhum
              "frame-src 'none'",
              // Objetos: nenhum
              "object-src 'none'",
              // Base URI: apenas própria
              "base-uri 'self'",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

export default nextConfig

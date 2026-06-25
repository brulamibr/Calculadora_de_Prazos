# Deploy Calculadora de Prazos na VPS Hostinger

```
Domínio:      calculadora.blmlawgroup.tech
IP da VPS:    187.127.30.248
Repositório:  https://github.com/brulamibr/Calculadora_de_Prazos.git
```

Siga cada passo na ordem exata. Todos os comandos são para copiar e colar.

---

## PASSO 1 — Criar o registro DNS no painel da Hostinger

Isso faz o endereço `calculadora.blmlawgroup.tech` apontar para sua VPS.

1. Abra o navegador e acesse: **https://hpanel.hostinger.com.br**
2. Faça login com sua conta Hostinger
3. No menu do lado esquerdo, clique em **Domínios**
4. Clique no domínio **blmlawgroup.tech**
5. Clique em **DNS / Zona DNS** (ou "Gerenciar DNS")
6. Clique no botão **Adicionar Registro**
7. Preencha assim:
   - **Tipo:** A
   - **Nome:** calculadora
   - **Aponta para:** 187.127.30.248
   - **TTL:** 14400
8. Clique em **Salvar**

Pronto! Agora espere uns 5–15 minutos para propagar (às vezes é instantâneo).

---

## PASSO 2 — Abrir o terminal da VPS

Você precisa "entrar" na sua VPS para digitar comandos nela.

**Jeito mais fácil (pelo navegador):**

1. No painel da Hostinger, no menu esquerdo, clique em **VPS**
2. Clique na sua VPS (vai aparecer o IP 187.127.30.248)
3. Procure o botão **Terminal do navegador** (ou **Browser terminal**)
4. Clique nele
5. Vai abrir uma tela preta no navegador — é ali que você vai colar os comandos

**Jeito alternativo (pelo seu computador):**

1. No Windows, aperte as teclas `Win + R` ao mesmo tempo
2. Digite `cmd` e aperte Enter
3. Na tela preta que abrir, cole:
```
ssh root@187.127.30.248
```
4. Se perguntar algo sobre "fingerprint", digite `yes` e aperte Enter
5. Digite a senha da VPS (a que você definiu quando criou a VPS na Hostinger)

> **IMPORTANTE:** A partir de agora, TODOS os comandos abaixo devem ser colados nesse terminal da VPS (a tela preta). NÃO no seu computador.

---

## PASSO 3 — Atualizar o sistema da VPS

Cole este comando e aperte Enter. Espere terminar (1-2 minutos):

```bash
apt update && apt upgrade -y
```

Se aparecer uma tela roxa/rosa perguntando algo sobre "services", aperte Enter para aceitar o padrão.

---

## PASSO 4 — Instalar o Docker

Cole este comando e aperte Enter. Espere terminar (1-3 minutos):

```bash
curl -fsSL https://get.docker.com | sh
```

Para confirmar que instalou certo, cole:

```bash
docker --version
```

Deve aparecer algo como: `Docker version 27.x.x` — se apareceu, está certo.

---

## PASSO 5 — Instalar o Git

```bash
apt install git -y
```

---

## PASSO 6 — Abrir as portas do Firewall

Cole estes 4 comandos, um por um:

```bash
ufw allow OpenSSH
```

```bash
ufw allow 80/tcp
```

```bash
ufw allow 443/tcp
```

```bash
ufw --force enable
```

---

## PASSO 7 — Baixar o projeto do GitHub

```bash
cd /opt
```

```bash
git clone https://github.com/brulamibr/Calculadora_de_Prazos.git calculadora-prazos
```

```bash
cd calculadora-prazos
```

---

## PASSO 8 — Criar o arquivo com as credenciais do Supabase

Cole este comando inteiro (são 4 linhas, cole tudo de uma vez):

```bash
cat > .env.production << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=https://agscfkdclbjfuktheqgp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_cTCnUhV4SJojN40O3Rhw5A_EWQqy5_6
EOF
```

Para confirmar que criou certo, cole:

```bash
cat .env.production
```

Deve aparecer as duas linhas com a URL e a chave do Supabase.

---

## PASSO 9 — Preparar o Nginx temporário (só HTTP primeiro)

Antes de ter HTTPS, precisamos subir o site em HTTP simples para depois pedir o certificado SSL.

Salve o nginx original:

```bash
cp nginx/default.conf nginx/default.conf.bak
```

Crie a versão temporária (cole tudo de uma vez):

```bash
cat > nginx/default.conf << 'TMPEOF'
server {
    listen 80;
    server_name _;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        proxy_pass http://app:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
TMPEOF
```

---

## PASSO 10 — Subir a aplicação pela primeira vez

```bash
chmod +x deploy.sh
```

```bash
bash deploy.sh
```

> **ATENÇÃO:** Este passo demora de 3 a 10 minutos na primeira vez. Ele vai baixar imagens do Docker e compilar o projeto inteiro. Aguarde pacientemente até aparecer a mensagem **"Deploy concluído!"**

---

## PASSO 11 — Testar se funcionou

Abra uma nova aba no seu navegador e acesse:

```
http://187.127.30.248
```

**Se aparecer a tela de login da Calculadora de Prazos → FUNCIONOU!** Vá para o passo 12.

**Se NÃO aparecer**, cole este comando no terminal da VPS para ver o que aconteceu:

```bash
docker compose logs -f app
```

(Para sair dos logs, aperte `Ctrl + C`)

---

## PASSO 12 — Ativar HTTPS (certificado SSL grátis)

Agora vamos fazer o site funcionar com `https://` e o cadeado verde.

Cole este comando (é tudo uma linha só, cole inteiro):

```bash
docker compose run --rm certbot certonly --webroot --webroot-path=/var/www/certbot -d calculadora.blmlawgroup.tech --email brulamibr@gmail.com --agree-tos --no-eff-email
```

> Se aparecer **"Congratulations!"** → deu certo! Vá para o próximo comando.
>
> Se der erro tipo "DNS problem" → o DNS do passo 1 ainda não propagou. Espere mais uns minutos e tente de novo.

---

## PASSO 13 — Restaurar o Nginx com HTTPS

Agora que temos o certificado, voltamos o nginx completo com HTTPS:

```bash
cp nginx/default.conf.bak nginx/default.conf
```

---

## PASSO 14 — Reiniciar o Nginx

```bash
docker compose restart nginx
```

---

## PASSO 15 — Testar o HTTPS

Abra no navegador:

```
https://calculadora.blmlawgroup.tech
```

**Se aparecer o cadeado verde e a Calculadora de Prazos → PRONTO! Deploy concluído com sucesso!**

---
---

# Referência rápida — Para o dia a dia

## Como atualizar o site depois de fazer mudanças no código

Sempre que você fizer alterações e dar push no GitHub, entre na VPS e cole:

```bash
cd /opt/calculadora-prazos && git pull && bash deploy.sh
```

## Como ver se está tudo rodando

```bash
cd /opt/calculadora-prazos && docker compose ps
```

## Como ver erros / logs

```bash
cd /opt/calculadora-prazos && docker compose logs -f app
```

(Aperte `Ctrl + C` para sair dos logs)

## Como reiniciar tudo

```bash
cd /opt/calculadora-prazos && docker compose restart
```

## Como parar o site

```bash
cd /opt/calculadora-prazos && docker compose down
```

## Como ligar o site de novo

```bash
cd /opt/calculadora-prazos && docker compose up -d
```

---

# Problemas comuns e soluções

| O que aconteceu | O que fazer |
|-----------------|-------------|
| Site não abre pelo domínio | O DNS ainda não propagou. Teste pelo IP: `http://187.127.30.248` |
| Aparece "502 Bad Gateway" | A aplicação ainda está iniciando. Espere 30 segundos e recarregue a página |
| Erro ao pedir certificado SSL | O DNS precisa ter propagado primeiro. Espere mais e tente novamente |
| Tela toda branca | As credenciais do Supabase estão erradas. Verifique: `cat .env.production` |
| "Permission denied" | Verifique se você está logado como `root` na VPS |
| Esqueci a senha da VPS | No painel da Hostinger, vá em VPS → sua VPS → tem opção de redefinir senha |
| Quero ver se o domínio já propagou | Cole no terminal da VPS: `ping calculadora.blmlawgroup.tech` |

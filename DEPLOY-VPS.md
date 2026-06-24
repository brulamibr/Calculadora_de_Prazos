# Deploy na VPS Hostinger — Passo a Passo

> Domínio: calculadora.blmlawgroup.tech
> IP da VPS: 187.127.30.248
> Copie e cole os comandos na ordem.

---

## PARTE 1 — DNS (no painel Hostinger)

1. Acesse https://hpanel.hostinger.com.br
2. Vá em **Domínios** → clique em **blmlawgroup.tech**
3. Clique em **DNS / Zona DNS**
4. Clique em **Adicionar Registro**:
   - Tipo: **A**
   - Nome: **calculadora**
   - Valor: **187.127.30.248**
   - TTL: **14400**
5. Salve

> Propaga em 5-30 minutos normalmente.

---

## PARTE 2 — Acessar a VPS (SSH)

No painel Hostinger:
1. Vá em **VPS** → clique na sua VPS
2. Clique no botão **Terminal do navegador**

Ou pelo CMD do Windows:
```
ssh root@187.127.30.248
```

---

## PARTE 3 — Instalar Docker e Git

Cole estes comandos um por um:

```bash
apt update && apt upgrade -y
```

```bash
curl -fsSL https://get.docker.com | sh
```

```bash
apt install git -y
```

```bash
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
```

---

## PARTE 4 — Enviar o projeto

### Se tiver no GitHub:
```bash
cd /opt
git clone https://github.com/SEU_USUARIO/calculadora-prazos.git
cd calculadora-prazos
```

### Se NÃO tiver no GitHub (enviar do PC):

No CMD do Windows (não no SSH):
```powershell
scp -r "C:\Users\brula\Downloads\Calculadora de Prazos" root@187.127.30.248:/opt/calculadora-prazos
```

Depois volte ao SSH:
```bash
cd /opt/calculadora-prazos
```

---

## PARTE 5 — Primeiro deploy (HTTP)

### 5.1 — Nginx temporário (só HTTP para pegar SSL depois)

```bash
cp nginx/default.conf nginx/default.conf.bak
```

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

### 5.2 — Subir

```bash
chmod +x deploy.sh
bash deploy.sh
```

> Aguarde 3-10 minutos. Quando aparecer "Deploy concluído!" está pronto.

### 5.3 — Testar

Abra no navegador: `http://187.127.30.248`

> Se aparecer a tela de login, funcionou!

---

## PARTE 6 — Ativar HTTPS

### 6.1 — Obter certificado SSL

```bash
docker compose run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    -d calculadora.blmlawgroup.tech \
    --email brulamibr@gmail.com \
    --agree-tos \
    --no-eff-email
```

> Deve aparecer "Congratulations!"

### 6.2 — Restaurar Nginx com HTTPS

```bash
cp nginx/default.conf.bak nginx/default.conf
```

### 6.3 — Reiniciar

```bash
docker compose restart nginx
```

### 6.4 — Testar

Abra: `https://calculadora.blmlawgroup.tech`

> Cadeado verde + Calculadora de Prazos = sucesso!

---

## Comandos úteis

```bash
# Ver logs
docker compose logs -f app

# Reiniciar
docker compose restart

# Parar
docker compose down

# Atualizar após mudanças
cd /opt/calculadora-prazos
git pull
bash deploy.sh
```

---

## Problemas comuns

| Problema | Solução |
|----------|---------|
| Site não abre pelo domínio | DNS não propagou. Teste com `http://187.127.30.248` |
| 502 Bad Gateway | App iniciando. Espere 30s e recarregue |
| Erro no certificado | DNS precisa propagar primeiro |
| Tela branca | Verifique `.env.production` |

#!/bin/bash
set -e

echo "=========================================="
echo " Deploy - Calculadora de Prazos"
echo "=========================================="

# Verifica se .env.production existe
if [ ! -f .env.production ]; then
    echo "ERRO: .env.production não encontrado!"
    echo "Copie o .env.production e preencha com suas credenciais do Supabase."
    exit 1
fi

# Carrega variáveis para o build
export $(grep -v '^#' .env.production | xargs)

# Para containers existentes
echo "[1/4] Parando containers antigos..."
docker compose down 2>/dev/null || true

# Build da imagem
echo "[2/4] Construindo imagem Docker..."
docker compose build --no-cache

# Sobe os containers
echo "[3/4] Iniciando containers..."
docker compose up -d

# Status
echo "[4/4] Verificando status..."
sleep 5
docker compose ps

echo ""
echo "=========================================="
echo " Deploy concluído!"
echo " App rodando em http://localhost:3000"
echo "=========================================="

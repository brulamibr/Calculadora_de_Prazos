-- ============================================================
-- Migration: Adicionar campos tribunal, sistema, cliente,
--            numero_processo e providencia à tabela calculos
-- ============================================================

ALTER TABLE calculos ADD COLUMN IF NOT EXISTS tribunal text;
ALTER TABLE calculos ADD COLUMN IF NOT EXISTS sistema text;
ALTER TABLE calculos ADD COLUMN IF NOT EXISTS cliente text;
ALTER TABLE calculos ADD COLUMN IF NOT EXISTS numero_processo text;
ALTER TABLE calculos ADD COLUMN IF NOT EXISTS providencia text;

-- Adiciona campo de local da consulta (ex: Sala 01, Andar 2, Online)
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS location TEXT;

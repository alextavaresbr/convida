/**
 * CONFIGURAÇÃO DO PROJETO TIMOTINHO
 * Configurações centralizadas para o painel administrativo
 */

require('dotenv').config();

const config = {
  // Configurações do servidor
  port: process.env.PORT || 3001,
  host: process.env.HOST || '0.0.0.0',
  nodeEnv: process.env.NODE_ENV || 'development',

  // Configurações do Supabase
  supabase: {
    url: process.env.SUPABASE_URL || 'https://myqwknjakzzrhxqlnoqp.supabase.co',
    anonKey: process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15cXdrbmpha3p6cmh4cWxub3FwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4NzYwNTAsImV4cCI6MjA3MDQ1MjA1MH0.xE_0ZQZmyA9-PuuVYhP9fP6BXDbR4s0NEHVGEzx3KUo',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15cXdrbmpha3p6cmh4cWxub3FwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg3NjA1MCwiZXhwIjoyMDcwNDUyMDUwfQ.sLB2LnJ6ni_sDAi1mW-GRrHzgHc32mD-mgmjyhZ_S3Y'
  },

  // Configurações de CORS
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  },

  // Configurações de sessão
  session: {
    secret: process.env.SESSION_SECRET || 'timotinho_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 1000 // 1 hora
    }
  }
};

module.exports = config;

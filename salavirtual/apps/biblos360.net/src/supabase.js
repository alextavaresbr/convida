/**
 * Serviço de integração com Supabase
 * Substitui o sistema de arquivos JSON para usuários
 */

// Carregar dotenv apenas em desenvolvimento
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const { createClient } = require('@supabase/supabase-js');
const https = require('https');
const http = require('http');

class SupabaseService {
  constructor() {
    // Usar variáveis de ambiente para configuração segura
    const supabaseUrl = process.env.SUPABASE_URL || 'https://myqwknjakzzrhxqlnoqp.supabase.co';
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15cXdrbmpha3p6cmh4cWxub3FwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4NzYwNTAsImV4cCI6MjA3MDQ1MjA1MH0.xE_0ZQZmyA9-PuuVYhP9fP6BXDbR4s0NEHVGEzx3KUo';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15cXdrbmpha3p6cmh4cWxub3FwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg3NjA1MCwiZXhwIjoyMDcwNDUyMDUwfQ.sLB2LnJ6ni_sDAi1mW-GRrHzgHc32mD-mgmjyhZ_S3Y';

    console.log('🔍 SUPABASE.JS - Debug de configuração:');
    console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '[USANDO ENV VAR]' : '[USANDO FALLBACK]');
    console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '[USANDO ENV VAR]' : '[USANDO FALLBACK]');
    console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '[USANDO ENV VAR]' : '[USANDO FALLBACK]');

    console.log('✅ SUPABASE CONFIG - Credenciais carregadas');
    console.log('🌐 URL:', supabaseUrl);
    console.log('🔑 Keys configuradas');
    console.log('🚀 Production ready!');

    // Cliente público (para operações do frontend) - usar schema 'api'
    this.supabase = createClient(supabaseUrl, supabaseAnonKey, {
      db: { schema: 'api' }
    });

    // Cliente administrativo (para operações do backend) - usar schema 'api'
    this.adminClient = supabaseServiceKey
      ? createClient(supabaseUrl, supabaseServiceKey, {
        db: { schema: 'api' }
      })
      : this.supabase;

    this.tableName = 'users';
    this.detailTableName = 'inscricao_detalhes';
  }

  /**
   * Fazer requisição HTTP usando módulos nativos do Node.js
   */
  makeHttpRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const isHttps = urlObj.protocol === 'https:';
      const client = isHttps ? https : http;

      const reqOptions = {
        hostname: urlObj.hostname,
        port: urlObj.port || (isHttps ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: options.method || 'GET',
        headers: options.headers || {}
      };

      const req = client.request(reqOptions, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(data);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        });
      });

      req.on('error', (err) => {
        reject(err);
      });

      if (options.body) {
        req.write(options.body);
      }

      req.end();
    });
  }

  /**
   * Buscar usuário por ID
   */
  async getUserById(id) {
    try {
      const { data, error } = await this.adminClient
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = not found
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar usuário por ID:', error);
      throw error;
    }
  }

  /**
   * Criar/atualizar detalhes de inscrição por evento
   * onConflict: (user_id, ev)
   */
  async upsertEnrollmentDetails(details) {
    try {
      if (!details || !details.user_id || !details.ev) {
        throw new Error('Parâmetros inválidos para detalhes de inscrição');
      }

      // Normalização básica
      const payload = { ...details };
      if (Array.isArray(payload.divulgacao_social)) {
        payload.divulgacao_social = payload.divulgacao_social;
      }
      if (Array.isArray(payload.divulgacao_meios)) {
        payload.divulgacao_meios = payload.divulgacao_meios;
      }

      // Upsert na tabela de detalhes (schema api)
      const { data, error } = await this.adminClient
        .from(this.detailTableName)
        .upsert(payload, { onConflict: 'user_id,ev' })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao upsert detalhes de inscrição:', error);
      throw error;
    }
  }

  /**
   * Buscar usuário por email
   */
  async getUserByEmail(email) {
    try {
      const { data, error } = await this.adminClient
        .from(this.tableName)
        .select('*')
        .eq('email', email.toLowerCase())
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar usuário por email:', error);
      throw error;
    }
  }

  /**
   * Buscar usuário por CPF/CNPJ
   */
  async getUserByCpfCnpj(cpfCnpj) {
    try {
      const { data, error } = await this.adminClient
        .from(this.tableName)
        .select('*')
        .eq('cpf_cnpj', cpfCnpj)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar usuário por CPF/CNPJ:', error);
      throw error;
    }
  }

  /**
   * Criar novo usuário
   */
  async createUser(userData) {
    try {
      console.log('[SUPABASE DEBUG] === CRIANDO USUÁRIO ===');
      console.log('[SUPABASE DEBUG] Dados recebidos:', JSON.stringify(userData, null, 2));

            // Gerar novo ID se não fornecido
      if (!userData.id) {
        console.log('[SUPABASE DEBUG] Gerando novo ID...');
        userData.id = await this.generateNextId();
        console.log('[SUPABASE DEBUG] ID gerado:', userData.id);
      }

      // Formatar dados
      console.log('[SUPABASE DEBUG] Formatando dados...');
      const formattedData = this.formatUserData(userData);
      console.log('[SUPABASE DEBUG] Dados formatados:', JSON.stringify(formattedData, null, 2));

      console.log('[SUPABASE DEBUG] Executando INSERT na tabela:', this.tableName);
      console.log('[SUPABASE DEBUG] Schema:', this.schema);
      console.log('[SUPABASE DEBUG] Cliente:', this.adminClient ? 'CONFIGURADO' : 'NÃO CONFIGURADO');

      const { data, error } = await this.adminClient
        .from(this.tableName)
        .insert([formattedData])
        .select()
        .single();

      if (error) {
        console.error('[SUPABASE DEBUG] ❌ Erro no INSERT:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      console.log('[SUPABASE DEBUG] ✅ Usuário criado com sucesso:', {
        id: data.id,
        nome: data.nome,
        email: data.email
      });

      return data;
    } catch (error) {
      console.error('[SUPABASE DEBUG] ❌ ERRO GERAL ao criar usuário:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Atualizar usuário
   */
  async updateUser(id, userData) {
    try {
      const formattedData = this.formatUserData(userData);
      delete formattedData.id; // Não atualizar o ID
      delete formattedData.created_at; // Não atualizar data de criação

      const { data, error } = await this.adminClient
        .from(this.tableName)
        .update(formattedData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  }

  /**
   * Validar login por CPF e data de nascimento - VERSÃO SEGURA COM RPC JSON
   */
  async validateLoginByCpfAndBirth(cpfCnpj, dataNascimento) {
    try {
      console.log('[SUPABASE DEBUG] === VALIDAÇÃO LOGIN SEGURA ===');
      console.log('[SUPABASE DEBUG] Validando login:', { cpfCnpj, dataNascimento });

      // Converter data para formato DATE correto
      let dataFormatada = dataNascimento;
      if (dataNascimento.length === 8 && !dataNascimento.includes('-')) {
        const ano = dataNascimento.substring(0, 4);
        const mes = dataNascimento.substring(4, 6);
        const dia = dataNascimento.substring(6, 8);
        dataFormatada = `${ano}-${mes}-${dia}`;
        console.log('[SUPABASE DEBUG] Convertendo YYYYMMDD para YYYY-MM-DD:', `${dataNascimento} -> ${dataFormatada}`);
      }

      console.log('[SUPABASE DEBUG] Data formatada final:', dataFormatada);

      // NOVA ABORDAGEM: Usar função RPC segura com retorno JSON
      console.log('[SUPABASE DEBUG] === TENTATIVA 1: FUNÇÃO RPC SEGURA (JSON) ===');

      try {
        const { data, error } = await this.adminClient.rpc('validate_user_login', {
          p_cpf_cnpj: cpfCnpj,
          p_nascimento: dataFormatada
        });

        if (error) {
          console.error('[SUPABASE DEBUG] ❌ Erro na função RPC:', error);
          throw error;
        }

        console.log('[SUPABASE DEBUG] Resultado da função RPC (JSON):', data);

        // O retorno agora é um JSON direto
        if (data && data.success) {
          const user = {
            id: data.user_id,
            nome: data.nome,
            email: data.email,
            level: data.level,
            parceiro: data.parceiro
          };

          console.log('[SUPABASE DEBUG] ✅ Login válido via RPC:', {
            id: user.id,
            nome: user.nome?.substring(0, 10) + '...',
            level: user.level
          });

          console.log('[SUPABASE DEBUG] ✅ LOGIN VÁLIDO VIA RPC!');
          return { success: true, user };
        } else {
          console.log('[SUPABASE DEBUG] ❌ Login inválido (credenciais incorretas)');
          return { success: false, error: 'CPF ou data de nascimento inválidos' };
        }

      } catch (rpcError) {
        console.error('[SUPABASE DEBUG] ❌ Erro na função RPC:', rpcError.message);

        // FALLBACK: Se a função RPC falhar, tentar métodos antigos
        console.log('[SUPABASE DEBUG] === FALLBACK: TENTATIVAS DIRETAS ===');
        return await this.validateLoginByCpfAndBirth_Fallback(cpfCnpj, dataFormatada);
      }

    } catch (error) {
      console.error('[SUPABASE DEBUG] ❌ ERRO GERAL na validação:', error.message);
      console.error('[SUPABASE DEBUG] Stack:', error.stack);
      return { success: false, error: 'Erro interno no sistema' };
    }
  }

  /**
   * Método fallback para login (mantém compatibilidade)
   */
  async validateLoginByCpfAndBirth_Fallback(cpfCnpj, dataFormatada) {
    console.log('[SUPABASE DEBUG] Executando fallback...');

    // Tentativa 1: Campo 'nascimento' (nova estrutura) - USANDO SERVICE ROLE
    console.log('[SUPABASE DEBUG] === FALLBACK 1: Campo nascimento ===');
    let url = `${process.env.SUPABASE_URL}/rest/v1/users?cpf_cnpj=eq.${cpfCnpj}&nascimento=eq.${dataFormatada}`;
    console.log('[SUPABASE DEBUG] URL:', url);

    try {
      const response = await this.makeHttpRequest(url, {
        headers: {
          'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          'Accept-Profile': 'api'
        }
      });

      const users = JSON.parse(response);
      console.log('[SUPABASE DEBUG] Fallback 1 - Usuários encontrados:', users.length);

      if (users && users.length > 0) {
        const user = users[0];
        console.log('[SUPABASE DEBUG] ✅ Usuário encontrado via fallback:', {
          id: user.id,
          nome: user.nome?.substring(0, 10) + '...',
          level: user.level
        });

        if (user.level < 0) {
          console.log('[SUPABASE DEBUG] ❌ Usuário inativo (level < 0)');
          return { success: false, error: 'Usuário inativo' };
        }

        console.log('[SUPABASE DEBUG] ✅ LOGIN VÁLIDO VIA FALLBACK!');
        return { success: true, user };
      }
    } catch (e) {
      console.warn('[SUPABASE DEBUG] ❌ Fallback 1 falhou:', e.message);
    }

    console.log('[SUPABASE DEBUG] ❌ TODOS OS MÉTODOS FALHARAM');
    return { success: false, error: 'Usuário não encontrado' };
  }

  /**
   * Listar primeiros usuários para debug (temporário)
   */
  async debugListUsers() {
    try {
      console.log('[SUPABASE DEBUG] === CONFIGURAÇÕES ===');
      console.log('[SUPABASE DEBUG] URL:', process.env.SUPABASE_URL || 'NÃO CONFIGURADO');
      console.log('[SUPABASE DEBUG] Anon Key:', process.env.SUPABASE_ANON_KEY ? 'CONFIGURADO' : 'NÃO CONFIGURADO');
      console.log('[SUPABASE DEBUG] Service Key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'CONFIGURADO' : 'NÃO CONFIGURADO');
      console.log('[SUPABASE DEBUG] ===============================');

      console.log('[SUPABASE DEBUG] Listando primeiros usuários para debug...');

      const url = `${process.env.SUPABASE_URL}/rest/v1/users?limit=5`;
      console.log('[SUPABASE DEBUG] URL da consulta:', url);

      const response = await this.makeHttpRequest(url, {
        headers: {
          'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          'Accept-Profile': 'api'
        }
      });

      const users = JSON.parse(response);
      console.log('[SUPABASE DEBUG] Usuários encontrados:', users.length);
      console.log('[SUPABASE DEBUG] Response raw length:', response.length);

      if (users.length === 0) {
        console.log('[SUPABASE DEBUG] ⚠️  NENHUM USUÁRIO ENCONTRADO NO BANCO!');
        console.log('[SUPABASE DEBUG] Isso pode indicar:');
        console.log('[SUPABASE DEBUG] 1. Tabela vazia');
        console.log('[SUPABASE DEBUG] 2. Problema de permissão RLS');
        console.log('[SUPABASE DEBUG] 3. Schema incorreto');
        console.log('[SUPABASE DEBUG] 4. Credenciais inválidas');
      } else {
        users.forEach((user, index) => {
          console.log(`[SUPABASE DEBUG] Usuário ${index + 1}:`, {
            id: user.id,
            nome: user.nome?.substring(0, 10) + '...',
            cpf_cnpj: user.cpf_cnpj ? '***' + user.cpf_cnpj.slice(-3) : 'null',
            data_nascimento: user.data_nascimento,
            nascimento: user.nascimento,
            email: user.email?.substring(0, 5) + '***'
          });
        });
      }

      return users;
    } catch (error) {
      console.error('[SUPABASE DEBUG] ❌ ERRO ao listar usuários:', error.message);
      console.error('[SUPABASE DEBUG] Stack:', error.stack);

      if (error.message.includes('fetch')) {
        console.error('[SUPABASE DEBUG] Problema de conectividade com Supabase');
      } else if (error.message.includes('401') || error.message.includes('403')) {
        console.error('[SUPABASE DEBUG] Problema de autenticação/autorização');
      } else if (error.message.includes('404')) {
        console.error('[SUPABASE DEBUG] Endpoint não encontrado - verificar URL');
      }

      return [];
    }
  }

  /**
   * Validar login
   */
  async validateLogin(email, userData = {}) {
    try {
      const user = await this.getUserByEmail(email);

      if (!user) {
        return null;
      }

      // Verificar se o usuário está ativo (situacao: 1, 2, 5)
      if (![1, 2, 5].includes(user.situacao)) {
        return null;
      }

      // Atualizar dados de login se fornecidos
      if (Object.keys(userData).length > 0) {
        await this.updateUser(user.id, {
          ...userData,
          updated_at: new Date().toISOString()
        });
      }

      return user;
    } catch (error) {
      console.error('Erro ao validar login:', error);
      throw error;
    }
  }

  /**
   * Listar usuários com paginação
   */
  async getUsers(page = 1, limit = 100, filters = {}) {
    try {
      let query = this.supabase
        .from(this.tableName)
        .select('*', { count: 'exact' });

      // Aplicar filtros
      if (filters.situacao) {
        query = query.eq('situacao', filters.situacao);
      }
      if (filters.level !== undefined) {
        query = query.eq('level', filters.level);
      }
      if (filters.uf) {
        query = query.eq('uf', filters.uf);
      }
      if (filters.search) {
        query = query.or(`nome.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }

      // Paginação
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      query = query.range(from, to).order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      return {
        users: data,
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      };
    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      throw error;
    }
  }

  /**
   * Listar todos os usuários (versão simplificada para TIM)
   */
  async getAllUsers(limit = 10) {
    try {
      const { data: users, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Erro no Supabase getAllUsers:', error);
        return { users: [], total: 0 };
      }

      // Buscar total de usuários
      const { count, error: countError } = await this.supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true });

      const total = countError ? 0 : count;

      return {
        users: users || [],
        total: total || 0
      };
    } catch (error) {
      console.error('Erro ao buscar todos os usuários:', error);
      return { users: [], total: 0 };
    }
  }

  /**
   * Excluir usuário por ID (HARD DELETE)
   */
  async deleteUser(id) {
    try {
      console.log(`[Supabase] Excluindo usuário ID: ${id}...`);

      const { data, error } = await this.adminClient
        .from(this.tableName)
        .delete()
        .eq('id', id)
        .select();

      if (error) {
        console.error('Erro no Supabase deleteUser:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error(`Usuário com ID ${id} não encontrado ou já foi excluído`);
      }

      console.log(`[Supabase] Usuário ID ${id} excluído com sucesso:`, data[0]);
      return data[0];
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      throw error;
    }
  }

  /**
   * Contar usuários
   */
  async countUsers(filters = {}) {
    try {
      let query = this.supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true });

      // Aplicar filtros
      if (filters.situacao) {
        query = query.eq('situacao', filters.situacao);
      }
      if (filters.level !== undefined) {
        query = query.eq('level', filters.level);
      }

      const { count, error } = await query;

      if (error) {
        throw error;
      }

      return count;
    } catch (error) {
      console.error('Erro ao contar usuários:', error);
      throw error;
    }
  }

  /**
   * Gerar próximo ID sequencial
   */
  async generateNextId() {
    try {
      const { data, error } = await this.adminClient
        .from(this.tableName)
        .select('id')
        .order('id', { ascending: false })
        .limit(1);

      if (error) {
        throw error;
      }

      const maxId = data.length > 0 ? data[0].id : 0;
      return maxId + 1;
    } catch (error) {
      console.error('Erro ao gerar próximo ID:', error);
      throw error;
    }
  }

  /**
   * Formatar dados do usuário para o banco
   */
  formatUserData(userData) {
    const formatted = { ...userData };

    // Limpar campos vazios
    Object.keys(formatted).forEach(key => {
      if (formatted[key] === '' || formatted[key] === null || formatted[key] === undefined) {
        formatted[key] = null;
      }
    });

    // Formatar campos específicos
    if (formatted.email) {
      formatted.email = formatted.email.toLowerCase().trim();
    }
    if (formatted.nome) {
      formatted.nome = formatted.nome.trim();
    }
    if (formatted.uf && typeof formatted.uf === 'string') {
      formatted.uf = formatted.uf.toUpperCase().trim().substring(0, 2); // Garantir apenas 2 caracteres
    }

    // Converter data de nascimento para campo 'nascimento' (não 'data_nascimento')
    if (formatted.data_nascimento) {
      if (typeof formatted.data_nascimento === 'string' && formatted.data_nascimento.length === 8) {
        // Converter de YYYYMMDD para YYYY-MM-DD
        const year = formatted.data_nascimento.substring(0, 4);
        const month = formatted.data_nascimento.substring(4, 6);
        const day = formatted.data_nascimento.substring(6, 8);
        formatted.nascimento = `${year}-${month}-${day}`;
      } else if (typeof formatted.data_nascimento === 'string' && formatted.data_nascimento.includes('/')) {
        // Converter de DD/MM/YYYY para YYYY-MM-DD
        const parts = formatted.data_nascimento.split('/');
        if (parts.length === 3) {
          formatted.nascimento = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
      }
      // Remover campo antigo
      delete formatted.data_nascimento;
    }

    // Mapear campos antigos para novos campos FK
    if (formatted.sexo && !formatted.sexo_id) {
      formatted.sexo_id = parseInt(formatted.sexo) || null;
    }
    if (formatted.estado_civil && !formatted.estado_civil_id) {
      formatted.estado_civil_id = parseInt(formatted.estado_civil) || null;
    }
    if (formatted.fone_tipo && !formatted.fone_contato_tipo) {
      // Mapear valores numéricos para strings
      const foneTypeMap = { '1': 'cel', '2': 'resid', '3': 'prof' };
      formatted.fone_contato_tipo = foneTypeMap[formatted.fone_tipo] || formatted.fone_tipo;
    }
    if (formatted.denominacao_texto && !formatted.denominacao) {
      formatted.denominacao = formatted.denominacao_texto;
    }
    if (formatted.area_de_atuacao && !formatted.atuacao) {
      formatted.atuacao = formatted.area_de_atuacao;
    }

    // Tratar campos de telefone separados
    if (formatted.fone_contato_ddd && formatted.fone_contato_num && !formatted.fone_contato) {
      const tipo = formatted.fone_contato_tipo || '';
      const ddd = formatted.fone_contato_ddd.replace(/\D/g, '');
      const num = formatted.fone_contato_num.replace(/\D/g, '');
      formatted.fone_contato = `${tipo ? `${tipo}:` : ''}(${ddd}) ${num}`;
    }

    // Formatar arrays JSONB para campos de divulgação
    if (formatted.pesquisa1 && Array.isArray(formatted.pesquisa1)) {
      formatted.divulgacao_social = formatted.pesquisa1;
      delete formatted.pesquisa1;
    }
    if (formatted.pesquisa2 && Array.isArray(formatted.pesquisa2)) {
      formatted.divulgacao_meios = formatted.pesquisa2;
      delete formatted.pesquisa2;
    }

    // Mapear observações
    if (formatted.observacoes && !formatted.como_soube) {
      formatted.como_soube = formatted.observacoes;
    }

    // Garantir que campos numéricos FK sejam inteiros
    ['sexo_id', 'estado_civil_id', 'ocupacao_id'].forEach(field => {
      if (formatted[field] !== null && formatted[field] !== undefined) {
        formatted[field] = parseInt(formatted[field]) || null;
      }
    });

    // Garantir que level seja sempre um número (nunca null)
    if (formatted.level === null || formatted.level === undefined || formatted.level === '') {
      formatted.level = 0; // Valor padrão
    } else {
      formatted.level = parseInt(formatted.level) || 0;
    }

    // Mapear ocupacao_secular para ocupacao_id se necessário
    if (formatted.ocupacao_secular && !formatted.ocupacao_id) {
      // Se ocupacao_secular for um ID numérico
      const ocupacaoId = parseInt(formatted.ocupacao_secular);
      if (!isNaN(ocupacaoId)) {
        formatted.ocupacao_id = ocupacaoId;
      }
    }

    // Mapear denominacao_texto para denominacao se necessário
    if (formatted.denominacao_texto && !formatted.denominacao) {
      formatted.denominacao = formatted.denominacao_texto;
    }

    // Garantir que mailing seja boolean
    if (formatted.mailing !== null && formatted.mailing !== undefined) {
      formatted.mailing = Boolean(formatted.mailing);
    }

    // Remover campos não existentes na nova estrutura da tabela
    const validFields = [
      // Campos principais
      'id', 'nome', 'email', 'level', 'parceiro', 'password_hash', 'created_at', 'updated_at',
      // Novos campos da estrutura normalizada
      'cpf_cnpj', 'nascimento', 'apelido', 'fone_contato', 'fone_contato_ddd', 'fone_contato_num',
      'mailing', 'igreja_local', 'atuacao', 'cidade', 'uf', 'pais', 'como_soube',
      'divulgacao_social', 'divulgacao_meios',
      // Foreign Keys
      'sexo_id', 'estado_civil_id', 'fone_contato_tipo', 'denominacao', 'ocupacao_id',
      // Campos de compatibilidade (híbridos)
      'sexo', 'estado_civil', 'fone_tipo', 'denominacao_texto', 'ocupacao_natureza', 'ocupacao_religiosa'
    ];

    Object.keys(formatted).forEach(key => {
      if (!validFields.includes(key)) {
        delete formatted[key];
      }
    });

    return formatted;
  }

  /**
   * Testar conexão com o Supabase
   */
  async testConnection() {
    try {
      const { data, error } = await this.adminClient
        .from(this.tableName)
        .select('id')
        .limit(1);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Erro ao testar conexão:', error);
      return false;
    }
  }

  /**
   * Obter estatísticas do banco
   */
  async getStats() {
    try {
      const total = await this.countUsers();
      const ativos = await this.countUsers({ situacao: 1 });
      const admins = await this.countUsers({ level: 3 });

      return {
        total,
        ativos,
        admins,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      throw error;
    }
  }
}

module.exports = new SupabaseService();

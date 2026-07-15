# Política de Privacidade — AhLembrei

**Versão**: 1.0 — 13 de julho de 2026

## 1. Controlador dos Dados

**Nome**: Alexander Santos Goes
**E-mail**: alexander.goes@gmail.com

## 2. Dados Coletados

### 2.1. Dados fornecidos pelo Titular:
- Nome completo, e-mail, telefone
- Dados médicos: tipo sanguíneo, alergias, condições médicas, medicamentos
- Contatos de emergência: nome, parentesco, telefone, WhatsApp
- Documentos pessoais: RG, CPF, CNH (opcional, armazenados em nuvem)
- Endereço: CEP, logradouro, número, bairro, cidade, estado

### 2.2. Dados coletados automaticamente:
- Endereço IP
- Data e hora do acesso
- Páginas visitadas
- Agente do usuário (navegador)

### 2.3. Dados de terceiros:
- Dados de contatos de emergência fornecidos pelo Titular (nome, telefone, WhatsApp)

## 3. Finalidade do Tratamento

| Dado | Finalidade |
|------|-----------|
| Nome, e-mail, senha | Criação e gestão da conta |
| Dados médicos | Exibição na página de emergência |
| Contatos | Notificação familiar em emergências |
| Documentos | Identificação pessoal (não exibidos publicamente) |
| Endereço | Localização de referência para socorristas |
| IP e logs | Segurança e diagnóstico |

## 4. Base Legal

O tratamento de dados é realizado com base no:
- **Art. 7º, I da LGPD**: mediante consentimento do titular
- **Art. 7º, II da LGPD**: para cumprimento de obrigação legal
- **Art. 7º, X da LGPD**: para proteção da vida e da saúde do titular ou de terceiros

## 5. Compartilhamento de Dados

Os dados NÃO são compartilhados com terceiros para fins de marketing.

O compartilhamento ocorre apenas:
- Com Supabase (hospedagem do banco de dados e armazenamento)
- Com WhatsApp (disparo de notificações aos contatos, mediante ação do usuário)
- Com ViaCEP (consulta de endereço por CEP)
- Por determinação judicial ou legal

## 6. Segurança dos Dados

- Criptografia em trânsito: TLS 1.3
- Controle de acesso: Row Level Security (RLS) no PostgreSQL
- Isolamento: cada usuário só acessa seus próprios dados via autenticação JWT
- Documentos: armazenados em Supabase Storage com políticas de acesso restritas

## 7. Retenção e Exclusão

Os dados são mantidos enquanto a conta do Titular estiver ativa.

Após exclusão da conta, os dados são removidos em até 30 dias.

Os contatos de emergência podem solicitar a remoção de seus dados a qualquer momento através do e-mail do controlador.

## 8. Direitos do Titular (LGPD)

O Titular pode, a qualquer momento:
1. Confirmar a existência de tratamento de dados
2. Acessar seus dados pessoais
3. Corrigir dados incompletos, inexatos ou desatualizados
4. Anonimizar, bloquear ou eliminar dados desnecessários
5. Solicitar a portabilidade dos dados
6. Revogar o consentimento a qualquer tempo

Para exercer seus direitos, contate: alexander.goes@gmail.com

## 9. Cookies

A Plataforma utiliza cookies essenciais para funcionamento da autenticação (JWT armazenado em localStorage). Não são utilizados cookies de rastreamento ou publicidade.

## 10. Disposições Finais

Esta política pode ser atualizada periodicamente. Alterações significativas serão comunicadas aos usuários por e-mail.

Para questões relacionadas à privacidade, contate: alexander.goes@gmail.com

---

**AhLembrei** — Seus dados de emergência, mesmo sem o celular.

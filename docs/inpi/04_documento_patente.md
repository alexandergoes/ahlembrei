# Documento de Patente de Invenção — AhLembrei

> Este documento serve como base para futura solicitação de Patente de Invenção (PI)
> após a obtenção do Registro de Programa de Computador (RPC).

---

## 1. Campo da Invenção

Sistema e método para disponibilização de dados de emergência médica pessoal,
com notificação familiar automatizada e proteção de privacidade, operando
independentemente do dispositivo móvel do usuário.

## 2. Fundamentos da Invenção

### 2.1 Problema Técnico

Os sistemas existentes de dados médicos de emergência dependem do dispositivo
móvel do usuário (Medical ID do iOS, Google Health Connect, carteiras digitais).
Em situações de acidente, o celular pode estar descarregado, danificado, sem
sinal ou bloqueado por senha, impossibilitando o acesso aos dados críticos.

### 2.2 Solução Proposta

Sistema que utiliza QR Code físico impresso (independente de dispositivo)
vinculado a um perfil web público com dados médicos e contatos de emergência,
com mecanismo de revelação seletiva de telefones mediante ação explícita do
socorrista.

## 3. Estado da Técnica

### 3.1 Documentos Anteriores

| Documento | Problema | Diferença do AhLembrei |
|-----------|----------|------------------------|
| Medical ID (Apple) | Depende do iPhone ligado e desbloqueado | AhLembrei usa QR Code impresso, não depende de celular |
| Google Health Connect | Depende de Android com bateria e sinal | AhLembrei funciona sem celular |
| Pulseira MedicAlert | Informação limitada a gravação física | AhLembrei permite dados ilimitados e atualização remota |
| Carteira Digital SUS | Depende de app instalado e internet | QR Code funciona com qualquer leitor |
| US 2019/0122180 A1 | Revela todos os dados de uma vez | AhLembrei oculta telefones até notificação |

### 3.2 Vantagens do AhLembrei

1. **Independência de hardware**: QR Code impresso ≠ dependência de celular
2. **Privacidade adaptativa**: telefones ocultos até ação explícita do socorrista
3. **Notificação push reversa**: contatos são avisados automaticamente
4. **API pública sem autenticação**: qualquer QR Code reader funciona
5. **Atualização remota**: dados podem ser alterados sem reimprimir o QR Code

## 4. Descrição Detalhada

### 4.1 Arquitetura do Sistema

O sistema compreende três camadas principais:

**Camada de Apresentação (Frontend)**:
- Aplicação React 18 com Vite 7, estilizada com Tailwind CSS 3
- Página pública de emergência acessível via URL com UUID
- Painel do usuário (Dashboard) para gerenciamento de dados
- Geração de QR Code via biblioteca qrcode.react

**Camada de Serviços (Backend/BaaS)**:
- Supabase como Backend-as-a-Service
- Autenticação via Supabase Auth (JWT)
- Banco de dados PostgreSQL 15
- Armazenamento de documentos via Supabase Storage
- RLS (Row Level Security) para proteção multinível

**Camada de Notificação**:
- Servidor Express 5 para orquestração
- Integração com WhatsApp Web API
- Webhook para eventos de acesso

### 4.2 Método de Funcionamento

**Passo 1 — Cadastro**: Usuário cria conta e preenche dados pessoais, médicos,
contatos de emergência e documentos no Dashboard.

**Passo 2 — Vinculação**: O sistema gera um QR Code contendo a URL
`https://ahlembrei.com.br/emergency/{uuid}`, onde uuid é o identificador único
do usuário no banco de dados.

**Passo 3 — Impressão**: Usuário imprime o QR Code e o mantém na carteira,
no bolso ou em local acessível.

**Passo 4 — Emergência**: Em caso de acidente, qualquer pessoa com um smartphone
pode escanear o QR Code (com qualquer leitor — câmera nativa, Google Lens,
WhatsApp) e acessar a página de emergência.

**Passo 5 — Exibição Seletiva**: A página exibe nome, foto, tipo sanguíneo,
alergias e condições médicas. Os telefones dos contatos aparecem ocultos com
ícone de cadeado.

**Passo 6 — Notificação**: O socorrista clica em "Notificar Família Agora".
O sistema dispara mensagens via WhatsApp para todos os contatos cadastrados
informando a situação de emergência.

**Passo 7 — Revelação**: Imediatamente após o disparo, os telefones são
revelados na tela, permitindo que o socorrista ligue diretamente.

### 4.3 Aspectos de Segurança e Privacidade

- Acesso público apenas aos dados estritamente necessários para emergência
- Telefones protegidos por duplo fator de acesso: QR Code + clique consciente
- RLS do PostgreSQL garante que cada usuário vê apenas seus próprios dados
- Documentos pessoais (RG, CPF) não são exibidos na página pública
- Todas as conexões via HTTPS com criptografia TLS 1.3

## 5. Reivindicações

### Reivindicação 1 — Sistema

Sistema para disponibilização de dados de emergência caracterizado por:
- Um meio de armazenamento contendo um perfil de usuário com dados médicos e
  contatos de emergência;
- Um meio de codificação que associa um identificador único ao referido perfil;
- Um meio de leitura do código que redireciona para uma interface pública;
- Um meio de exibição seletiva que oculta números de telefone até recebimento
  de confirmação de ação do usuário leitor.

### Reivindicação 2 — Método

Método de fornecimento de dados de emergência caracterizado pelas etapas de:
a) Associar um QR Code a um identificador único de usuário;
b) Armazenar dados médicos e contatos em banco de dados relacional;
c) Disponibilizar interface pública acessível pelo QR Code;
d) Exibir dados médicos e ocultar telefones dos contatos;
e) Revelar telefones mediante ação explícita do usuário leitor.

### Reivindicação 3 — Sistema de acordo com a reivindicação 1,
caracterizado pelo meio de codificação ser um QR Code impresso em meio físico,
independente de dispositivo eletrônico do usuário titular dos dados.

### Reivindicação 4 — Sistema de acordo com a reivindicação 1,
caracterizado pelo meio de exibição seletiva compreender um mecanismo de
notificação automática aos contatos via WhatsApp API.

### Reivindicação 5 — Método de acordo com a reivindicação 2,
caracterizado pela etapa (e) compreender ainda o disparo simultâneo de
mensagens de texto para todos os contatos cadastrados.

### Reivindicação 6 — Sistema de acordo com a reivindicação 1,
caracterizado pelo meio de armazenamento utilizar banco de dados PostgreSQL
com Row Level Security para isolamento de dados entre usuários.

### Reivindicação 7 — Método de acordo com a reivindicação 2,
caracterizado pela interface pública não exigir autenticação do usuário leitor,
sendo acessível por qualquer dispositivo com leitor de QR Code e conexão à
internet.

### Reivindicação 8 — Sistema de acordo com a reivindicação 1,
caracterizado pelos dados médicos compreenderem tipo sanguíneo, alergias,
condições médicas preexistentes e medicamentos de uso contínuo.

## 6. Resumo

Sistema e método para disponibilização de dados de emergência médica pessoal
através de QR Code impresso em meio físico, com mecanismo de revelação seletiva
de contatos telefônicos e notificação familiar automatizada. O sistema opera
independentemente do dispositivo móvel do usuário titular dos dados, resolvendo
o problema técnico de inacessibilidade de informações críticas em situações de
emergência onde o celular do acidentado está indisponível. Compreende um
dashboard para gerenciamento remoto de dados, geração de QR Code único,
página pública de emergência com exibição seletiva de informações, e API de
notificação via WhatsApp.

---

## Próximos Passos

1. ✅ **Primeiro**: Registrar como Programa de Computador (RPC) — ~R$ 120, 3-6 meses
2. ❌ **Depois**: Solicitar Patente de Invenção (PI) — ~R$ 200, 12-24 meses
3. ❌ **Simultaneamente**: Registrar Marca no INPI — ~R$ 300, 6-12 meses
4. ❌ **Opcional**: Depósito de Desenho Industrial (layout do QR Code) — ~R$ 100

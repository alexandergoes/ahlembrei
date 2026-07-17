# Registro de Programa de Computador — AhLembrei

## Dados do Titular

- **Nome**: Alexander Santos Goes
- **CPF**: [inserir]
- **Endereço**: [inserir]
- **Telefone**: [inserir]
- **E-mail**: alexander.goes@gmail.com

## Dados do Programa

- **Nome**: AhLembrei — Sistema de Dados de Emergência
- **Versão**: 1.0.0
- **Data de Criação**: 2026
- **Linguagem**: JavaScript (React 18 + Node.js/Express 5)
- **Linhas de Código**: ~15.000
- **Plataforma**: Web (Web App Node.js)

## Resumo Descritivo

O AhLembrei é um sistema web SaaS que permite ao usuário cadastrar seus dados médicos, contatos de emergência e documentos pessoais em um perfil acessível via QR Code. Em situações de emergência, qualquer pessoa pode escanear o QR Code impresso na carteira do usuário e acessar uma página pública contendo:

1. **Dados do usuário**: nome, foto, tipo sanguíneo, alergias, condições médicas, medicamentos de uso contínuo
2. **Contatos de emergência**: nome, parentesco, telefone e WhatsApp — ocultos até autorização explícita do usuário via clique em "Notificar Família"
3. **Notificação automática**: ao clicar em "Notificar Família Agora", o sistema dispara mensagens via WhatsApp para todos os contatos cadastrados
4. **QR Code único**: perfil de emergência acessível por URL pública contendo UUID do usuário

### Funcionalidades do Dashboard (Painel do Usuário)

- Cadastro de dados pessoais e médicos
- Gerenciamento de contatos de emergência (QR Code do contato)
- Upload de documentos pessoais (RG, CPF, CNH) com armazenamento em nuvem
- Geração e download de QR Code personalizado para impressão
- Atualização de endereço com busca automática via ViaCEP

### Diferenciais Técnicos

- **Sem dependência de celular**: o QR Code é impresso na carteira física — funciona mesmo que o celular do acidentado esteja descarregado, quebrado ou sem sinal
- **Privacidade**: os dados só são exibidos mediante acesso ao QR Code; telefones são ocultos até notificação familiar
- **Atualização em tempo real**: qualquer alteração no dashboard reflete imediatamente na página de emergência
- **Escalabilidade**: arquitetura Stateless com Supabase como BaaS, permitindo escalar horizontalmente sem esforço

## Estrutura do Código Fonte

```
src/
├── components/
│   ├── dashboard/
│   │   ├── MyData.jsx        # Formulário de dados pessoais + endereço ViaCEP
│   │   ├── MyContacts.jsx    # Gerenciamento de contatos de emergência
│   │   ├── MyDocuments.jsx   # Upload/download de documentos
│   │   ├── MyQrCode.jsx      # Geração do QR Code personalizado
│   │   └── MySubscription.jsx # Planos e assinatura
│   ├── Emergency/
│   │   ├── EmergencyHeader.jsx
│   │   ├── EmergencyInfo.jsx
│   │   ├── EmergencyContacts.jsx
│   │   └── EmergencyNotify.jsx
│   └── ui/                   # Componentes de interface reutilizáveis
├── pages/
│   ├── EmergencyPage.jsx     # Página pública de emergência
│   ├── LandingPage.jsx       # Página inicial institucional
│   ├── DashboardPage.jsx     # Painel do usuário logado
│   ├── LoginPage.jsx         # Autenticação
│   └── AdminPage.jsx         # Painel administrativo
├── lib/
│   ├── api.js                # API calls (dashboard)
│   ├── emergencyApi.js       # API calls públicas (emergência)
│   ├── supabaseClient.js     # Configuração do Supabase
│   └── utils.js              # Utilitários
├── hooks/
│   └── useEmergencyData.js   # Hook de dados de emergência
├── index.css
├── main.jsx
└── App.jsx

server/
├── index.js                  # Servidor Express + rotas
├── routes/
│   ├── api.js                # API de contatos
│   ├── webhook.js            # Webhooks
│   └── supabase.js           # Proxy Supabase
└── middleware/
    └── auth.js               # Autenticação JWT
```

## Fluxo de Funcionamento

1. Usuário acessa `ahlembrei.com.br`, cria conta e faz login
2. No Dashboard, preenche dados pessoais, médicos, contatos e documentos
3. Sistema gera QR Code único vinculado à URL pública de emergência
4. Usuário imprime o QR Code e coloca na carteira
5. Em caso de acidente, socorrista escaneia o QR Code
6. Página de emergência exibe dados médicos e contatos
7. Socorrista clica "Notificar Família Agora" → WhatsApp dispara para todos os contatos
8. Telefones são revelados após o disparo, permitindo ligação direta

## Tecnologias Utilizadas

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Frontend | React | 18 |
| Build | Vite | 7 |
| Estilização | Tailwind CSS | 3 |
| Backend | Node.js / Express | 5 |
| Banco de Dados | PostgreSQL (Supabase) | 15 |
| Autenticação | Supabase Auth | — |
| Armazenamento | Supabase Storage | — |
| Hospedagem | Hostinger Web App Node.js | — |

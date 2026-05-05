# 💈 Sistema de Barbearia — API REST

> Projeto back-end desenvolvido com **Node.js + Express** para colocar em prática conceitos essenciais de desenvolvimento de APIs RESTful, autenticação, autorização e modelagem de banco de dados.

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Arquitetura e Estrutura de Pastas](#-arquitetura-e-estrutura-de-pastas)
- [Modelagem do Banco de Dados](#-modelagem-do-banco-de-dados)
- [Autenticação e Autorização](#-autenticação-e-autorização)
- [Endpoints da API](#-endpoints-da-api)
  - [Auth](#-auth)
  - [Usuários](#-usuários)
  - [Serviços](#-serviços)
  - [Agendamentos](#-agendamentos)
- [Validação de Dados](#-validação-de-dados)
- [Lógica de Conflito de Horários](#-lógica-de-conflito-de-horários)
- [Middlewares](#-middlewares)
- [Como Rodar o Projeto](#-como-rodar-o-projeto)

---

## 🧾 Sobre o Projeto

Este é um sistema de gerenciamento para uma barbearia, exposto como uma **API REST**. Ele permite:

- Cadastro e gerenciamento de **usuários** (admin, barbeiros e clientes)
- Cadastro e gerenciamento de **serviços** oferecidos pela barbearia
- Criação e gerenciamento de **agendamentos**, com verificação automática de conflito de horários

O foco do projeto é o aprendizado prático de:

- Estruturação de projetos Node.js com Express
- Autenticação stateless com **JWT**
- Controle de acesso baseado em **roles** (RBAC)
- ORM com **Prisma** e banco de dados **MariaDB/MySQL**
- Validação de dados com **Zod**
- Boas práticas de organização de código (rotas, controllers, middlewares, schemas)

---

## 🛠 Tecnologias Utilizadas

| Tecnologia | Finalidade |
|---|---|
| **Node.js** | Runtime JavaScript no servidor |
| **Express 5** | Framework web para criação das rotas e servidor HTTP |
| **Prisma ORM** | Mapeamento objeto-relacional, migrations e queries ao banco |
| **MariaDB / MySQL** | Banco de dados relacional |
| **JWT (jsonwebtoken)** | Geração e verificação de tokens de autenticação |
| **bcrypt** | Hash seguro de senhas |
| **Zod** | Validação e tipagem de dados nos schemas |
| **CORS** | Controle de origens permitidas para acessar a API |
| **dotenv** | Gerenciamento de variáveis de ambiente |
| **Nodemon** | Reinicialização automática do servidor em desenvolvimento |

---

## 🗂 Arquitetura e Estrutura de Pastas

O projeto segue o padrão **MVC simplificado** (Model-View-Controller), separando responsabilidades em camadas bem definidas:

```
sistema-barbearia/
│
├── config/
│   └── database.js          # Configuração da conexão com o banco via Prisma
│
├── controllers/
│   ├── auth.js              # Lógica de login e geração de token
│   ├── usuarios.js          # CRUD de usuários
│   ├── servicos.js          # CRUD de serviços
│   └── agendamentos.js      # CRUD de agendamentos + lógica de conflito
│
├── middlewares/
│   ├── autenticacao.js      # Verificação do JWT (quem é o usuário?)
│   ├── autorizacao.js       # Verificação de permissões (o que pode fazer?)
│   └── validacao.js         # Validação do body com Zod
│
├── routes/
│   ├── auth.js              # Rotas públicas de autenticação
│   ├── usuarios.js          # Rotas de usuários
│   ├── servicos.js          # Rotas de serviços
│   └── agendamentos.js      # Rotas de agendamentos
│
├── schemas/
│   ├── usuarioSchema.js     # Regras de validação para usuários
│   ├── servicoSchema.js     # Regras de validação para serviços
│   └── agendamentoSchema.js # Regras de validação para agendamentos
│
├── prisma/
│   ├── schema.prisma        # Modelos do banco de dados
│   └── migrations/          # Histórico de alterações no banco
│
├── server.js                # Ponto de entrada da aplicação
├── prisma.config.ts         # Configuração do Prisma CLI
└── package.json
```

### Por que essa separação?

- **`controllers/`** — contém toda a lógica de negócio. Cada função é responsável por uma operação específica.
- **`routes/`** — apenas define os endpoints e qual middleware/controller cada um usa. Sem lógica aqui.
- **`middlewares/`** — funções que interceptam as requisições antes de chegarem ao controller. Seguem o padrão `(req, res, next)`.
- **`schemas/`** — define as regras de validação dos dados recebidos, desacoplando essa responsabilidade dos controllers.

---

## 🗃 Modelagem do Banco de Dados

O banco possui **3 tabelas principais**, definidas no `prisma/schema.prisma`:

### `Usuario`
| Campo | Tipo | Descrição |
|---|---|---|
| `id` | Int (PK) | Identificador único |
| `nome` | String | Nome completo |
| `email` | String (único) | E-mail de login |
| `senha` | String | Senha hasheada com bcrypt |
| `telefone` | String (único) | Contato |
| `role` | Enum | `ADMIN`, `CLIENTE` ou `BARBEIRO` |

### `Servico`
| Campo | Tipo | Descrição |
|---|---|---|
| `id` | Int (PK) | Identificador único |
| `categoria` | String | Ex: "Corte", "Barba" |
| `descricao` | String | Descrição do serviço |
| `valor` | Decimal | Preço |
| `duracao` | Int | Duração em minutos |

### `Agendamento`
| Campo | Tipo | Descrição |
|---|---|---|
| `id` | Int (PK) | Identificador único |
| `servicoId` | Int (FK) | Referência ao serviço |
| `barbeiroId` | Int (FK) | Referência ao barbeiro (Usuario) |
| `clienteId` | Int (FK) | Referência ao cliente (Usuario) |
| `data_hora_inicio` | DateTime | Início do agendamento |
| `data_hora_fim` | DateTime | Calculado automaticamente pelo back-end |
| `status` | Enum | `PENDENTE`, `CONCLUIDO` ou `CANCELADO` |

> 💡 **Detalhe importante:** o campo `data_hora_fim` **não é enviado pelo cliente** — ele é calculado automaticamente no back-end somando `data_hora_inicio + duracao do serviço`. Isso garante consistência nos dados.

---

## 🔐 Autenticação e Autorização

O sistema utiliza **JWT (JSON Web Token)** para autenticação stateless.

### Fluxo de autenticação

```
1. Cliente faz POST /auth/login com { email, senha }
2. Back-end verifica as credenciais no banco
3. Se válidas, gera um token JWT contendo { id, role }
4. Cliente armazena o token e o envia no header de todas as requisições:
   Authorization: Bearer <token>
5. Middleware verifica e decodifica o token a cada requisição protegida
```

### Controle de acesso por roles

O sistema tem 3 níveis de acesso:

| Role | Permissões |
|---|---|
| `ADMIN` | Acesso total a todos os recursos |
| `BARBEIRO` | Visualiza seus próprios agendamentos |
| `CLIENTE` | Cria agendamentos e visualiza os seus |

Implementado em `middlewares/autorizacao.js` com duas funções:

- **`verificarRole(cargosPermitidos)`** — bloqueia acesso se o role do usuário não estiver na lista permitida
- **`verificarPropriedade`** — permite que um usuário acesse/edite apenas seus próprios recursos (a menos que seja ADMIN)

---

## 📡 Endpoints da API

### 🔑 Auth

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| `POST` | `/auth/login` | Público | Autentica e retorna um token JWT |

**Body esperado:**
```json
{
  "email": "usuario@email.com",
  "senha": "minhasenha123"
}
```

---

### 👤 Usuários

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| `POST` | `/usuarios` | Público | Cria um novo usuário |
| `GET` | `/usuarios` | ADMIN | Lista todos os usuários |
| `GET` | `/usuarios/:id` | Próprio usuário ou ADMIN | Busca usuário por ID |
| `PUT` | `/usuarios/:id` | Próprio usuário ou ADMIN | Atualiza dados do usuário |
| `DELETE` | `/usuarios/:id` | ADMIN | Remove um usuário |

> 🔒 A senha **nunca é retornada** nas respostas — o campo é removido antes de enviar ao cliente.

---

### ✂️ Serviços

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| `POST` | `/servicos` | ADMIN | Cria um novo serviço |
| `GET` | `/servicos` | Autenticado | Lista todos os serviços |
| `GET` | `/servicos/:id` | Autenticado | Busca serviço por ID |
| `PUT` | `/servicos/:id` | ADMIN | Atualiza um serviço |
| `DELETE` | `/servicos/:id` | ADMIN | Remove um serviço |

---

### 📅 Agendamentos

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| `POST` | `/agendamentos` | Autenticado | Cria um agendamento |
| `GET` | `/agendamentos` | Autenticado | Lista agendamentos (filtrado por role) |
| `GET` | `/agendamentos/:id` | Autenticado | Busca agendamento por ID |
| `PUT` | `/agendamentos/:id` | Dono ou ADMIN | Edita um agendamento |
| `DELETE` | `/agendamentos/:id` | ADMIN | Remove permanentemente |

#### Comportamento do `GET /agendamentos` por role:

- **ADMIN** → retorna todos os agendamentos
- **BARBEIRO** → retorna apenas os agendamentos onde ele é o barbeiro
- **CLIENTE** → retorna apenas seus próprios agendamentos

---

## ✅ Validação de Dados

Toda entrada de dados é validada com **Zod** antes de chegar ao controller. O middleware `validarDados(schema)` em `middlewares/validacao.js` aplica o schema e retorna erros detalhados caso a validação falhe:

```json
{
  "erro": "Erro de validação",
  "detalhes": [
    { "campo": "email", "mensagem": "Formato de e-mail inválido!" },
    { "campo": "senha", "mensagem": "A senha precisa ter no mínimo 8 caracteres!" }
  ]
}
```

Cada recurso tem seus schemas em `schemas/`:

- **Criação** (`createSchema`) — campos obrigatórios com regras estritas
- **Atualização** (`updateSchema`) — todos os campos opcionais via `.partial()`

---

## ⏰ Lógica de Conflito de Horários

Essa é uma das partes mais importantes do sistema. Ao criar ou editar um agendamento, o back-end verifica se o barbeiro já tem um compromisso no mesmo período.

### Como funciona:

```
Novo agendamento: 14:00 → 14:30 (serviço de 30 min)

Agendamentos existentes do barbeiro:
- 13:30 → 14:15 ← CONFLITO! Termina depois das 14:00
- 14:30 → 15:00 ← OK, começa exatamente quando o novo termina
- 13:00 → 14:00 ← OK, termina exatamente quando o novo começa
```

A query no Prisma usa dois critérios simultâneos:

```js
data_hora_inicio: { lt: fimNovoAgendamento },  // agendamento existente começa ANTES do novo terminar
data_hora_fim: { gt: inicioNovoAgendamento }    // agendamento existente termina DEPOIS do novo começar
```

Se **ambos forem verdadeiros ao mesmo tempo**, há sobreposição de horários. Agendamentos com status `CANCELADO` são ignorados na verificação.

---

## 🧩 Middlewares

### `verificarToken` (autenticacao.js)
Extrai e valida o JWT do header `Authorization: Bearer <token>`. Se válido, anexa `{ id, role }` em `req.usuario` para uso nos controllers e middlewares seguintes.

### `verificarRole(cargosPermitidos)` (autorizacao.js)
Factory function que retorna um middleware. Recebe um array de roles permitidas e bloqueia a requisição com `403` se o usuário não tiver permissão.

```js
// Exemplo de uso na rota:
router.post('/', verificarToken, verificarRole(['ADMIN']), criarServico);
```

### `verificarPropriedade` (autorizacao.js)
Compara o `id` da rota (`req.params.id`) com o `id` do usuário logado (`req.usuario.id`). ADMINs passam direto. Garante que usuários só acessem/editem seus próprios dados.

### `validarDados(schema)` (validacao.js)
Aplica o schema Zod no `req.body`. Em caso de erro, retorna `400` com detalhes dos campos inválidos. Em caso de sucesso, substitui `req.body` pelos dados já parseados/transformados pelo Zod.

---

## 🚀 Como Rodar o Projeto

### Pré-requisitos

- Node.js >= 20
- MariaDB ou MySQL rodando localmente

### Instalação

```bash
# Clone o repositório
git clone https://github.com/gabrieljvrz/backend-barbearia.git
cd sistema-barbearia

# Instale as dependências
npm install
```

### Configuração do ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
DATABASE_URL="mysql://usuario:senha@localhost:3306/barbearia"
JWT_SECRET="sua_chave_secreta_aqui"
PORT=8080
```

### Banco de dados

```bash
# Rode as migrations para criar as tabelas
npx prisma migrate deploy

# (Opcional) Visualize os dados no Prisma Studio
npx prisma studio
```

### Rodando o servidor

```bash
# Desenvolvimento (com hot reload)
npx nodemon server.js

# Produção
node server.js
```

O servidor estará disponível em `http://localhost:8080`.

---

## 📌 Aprendizados e Próximos Passos

Este projeto cobre os fundamentos de uma API REST em Node.js. Possíveis evoluções:

- [ ] Testes automatizados com **Vitest** ou **Jest**
- [ ] Documentação interativa com **Swagger/OpenAPI**
- [ ] Refresh tokens para melhor gestão de sessões
- [ ] Upload de imagens para perfil dos barbeiros
- [ ] Notificações de lembrete de agendamento por e-mail

---

<div align="center">
  Desenvolvido com 💙 como projeto de estudos em desenvolvimento back-end
</div>

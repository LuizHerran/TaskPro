# 🪚 TaskPro

<p align="center">
  <img src="https://img.shields.io/badge/Status-Em%20Desenvolvimento-blue" />
  <img src="https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB" />
  <img src="https://img.shields.io/badge/Backend-Node.js%20%2B%20TypeScript-3178C6" />
  <img src="https://img.shields.io/badge/Banco-SQLite-003B57" />
</p>

## 🚀 Primeiros Passos

Após clonar o repositório:

```bash
git clone https://github.com/seu-usuario/TaskPro.git
```

---

### 🔹 1. Inicie o Backend

Abra o terminal e acesse a pasta do backend:

```bash
cd backend
```

Instale as dependências:

```bash
npm install
```

Inicie o servidor:

```bash
npm run dev
```

---

### 🔹 2. Inicie o Frontend

Abra **outro terminal** e acesse a pasta do frontend:

```bash
cd frontend
```

Instale as dependências:

```bash
npm install
```

Inicie a aplicação:

```bash
npm run dev
```

---

### 🔹 3. Abra a aplicação

Após iniciar o frontend, o Vite exibirá algo parecido com:

```bash
Local: http://localhost:5173/
```

Segure **Ctrl** e clique no link para abrir a aplicação no navegador.

---

# 📖 Sobre o Projeto

O **TaskPro** é uma plataforma de marketplace voltada para o setor de marcenaria, conectando clientes e marceneiros de forma prática e organizada.

A aplicação permite:

- Cadastro e autenticação de usuários;
- Busca de marceneiros;
- Publicação e gerenciamento de serviços;
- Sistema de favoritos;
- Chat entre usuários;
- Agenda de serviços;
- Sistema de avaliações;
- Simulação de pagamentos;
- Upload de imagens.

---

# 🛠️ Tecnologias Utilizadas

## Frontend

- React
- TypeScript
- Vite
- CSS

## Backend

- Node.js
- Express
- TypeScript
- SQLite
- JWT para autenticação

---

# 📂 Estrutura do Projeto

```text
TaskPro
├── backend
│   ├── src
│   │   ├── routes
│   │   ├── db.ts
│   │   ├── initDB.ts
│   │   └── index.ts
│
├── frontend
│   ├── src
│   │   ├── pages
│   │   ├── components
│   │   ├── api
│   │   └── App.tsx
│
└── uploads
```

---

# 🔑 Funcionalidades

### Usuários

- Cadastro
- Login
- Perfil de usuário
- Upload de avatar

### Serviços

- Cadastro de serviços
- Busca de serviços
- Favoritar serviços
- Contratação

### Comunicação

- Chat entre cliente e marceneiro
- Agenda de compromissos

### Avaliações

- Sistema de notas e comentários

---

# ⚙️ Scripts Disponíveis

### Backend

```bash
npm run dev      # Executa em modo desenvolvimento
npm run build    # Compila o TypeScript
npm start        # Executa a versão compilada
```

### Frontend

```bash
npm run dev      # Executa em modo desenvolvimento
npm run build    # Gera a build de produção
npm run preview  # Visualiza a build localmente
```

---

# 👨‍💻 Desenvolvedores - Luiz Rocha, Victor Nogueira, Gustavo Xavier e Matheus Rios

Projeto desenvolvido por **Luiz Rocha**.

GitHub: https://github.com/LuizHerran

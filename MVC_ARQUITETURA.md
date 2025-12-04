# 🏗️ Arquitetura MVC - Sistema de Controle Financeiro

## 📁 Estrutura de Pastas

```
sistemaControleFinanceiro/
├── src/
│   ├── models/           # 📊 CAMADA DE DADOS
│   │   ├── Usuario.js
│   │   └── Transacao.js
│   ├── controllers/      # ⚙️ CAMADA DE LÓGICA
│   │   ├── UsuarioController.js
│   │   └── TransacaoController.js
│   └── routes/           # 🛣️ CAMADA DE ROTAS
│       ├── usuarioRoutes.js
│       └── transacaoRoutes.js
├── index-mvc.js          # 🚀 Servidor principal refatorado
├── paginaLogin.html      # 🎨 VIEW - Login
├── paginaPrincipal.html  # 🎨 VIEW - Principal
└── script.js             # 🎮 CONTROLLER Frontend (cliente)
```

---

## 🔄 Fluxo MVC no Seu Sistema

### **1. MODEL (Camada de Dados)**

**Arquivo: `src/models/Usuario.js` e `src/models/Transacao.js`**

- Responsável por **APENAS** interagir com o banco de dados
- Define métodos para CRUD (Create, Read, Update, Delete)
- Sem lógica de negócio, apenas queries

**Exemplo:**

```javascript
class Transacao {
  static criar(usuario_id, date, description, category, amount, type, callback) {
    const query = "INSERT INTO transacoes (...) VALUES (...)";
    db.query(query, [usuario_id, date, ...], callback);
  }
}
```

### **2. CONTROLLER (Camada de Lógica de Negócio)**

**Arquivo: `src/controllers/UsuarioController.js` e `src/controllers/TransacaoController.js`**

- Recebe requisições HTTP (requests)
- Valida os dados
- Chama os Models para buscar/salvar dados
- Retorna respostas (responses) formatadas

**Exemplo:**

```javascript
class TransacaoController {
  static criar(req, res) {
    // 1. Validar dados
    if (!usuario_id || !date) {
      return res.status(400).json({ erro: "Dados inválidos" });
    }

    // 2. Chamar Model
    Transacao.criar(usuario_id, date, ..., (err, result) => {
      // 3. Retornar resposta
      res.status(201).json({ mensagem: "Criado!", transacao: {...} });
    });
  }
}
```

### **3. ROUTES (Camada de Roteamento)**

**Arquivo: `src/routes/transacaoRoutes.js`**

- Define as URLs e quais Controllers executar
- Mapeia HTTP verbs (GET, POST, PUT, DELETE)

**Exemplo:**

```javascript
router.post("/", TransacaoController.criar); // POST /transacoes
router.get("/:id", TransacaoController.obter); // GET /transacoes/:id
router.delete("/:id", TransacaoController.deletar); // DELETE /transacoes/:id
```

### **4. VIEW (Camada de Apresentação)**

**Arquivos: `paginaLogin.html`, `paginaPrincipal.html`**

- Frontend HTML/CSS
- Exibe dados ao usuário
- Envia eventos para o Controller frontend

---

## 🔗 Exemplo de Fluxo Completo: Criar Transação

```
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND (Browser)                          │
├─────────────────────────────────────────────────────────────────┤
│  1. Usuário preenche formulário e clica "Adicionar"             │
│  2. script.js (Controller Frontend) captura evento              │
│  3. Faz POST para http://localhost:3000/transacoes              │
│     {usuario_id: 1, date: "2025-12-04", amount: 150.00, ...}  │
└──────────────────────┬──────────────────────────────────────────┘
                       │ HTTP REQUEST
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js/Express)                    │
├─────────────────────────────────────────────────────────────────┤
│  4. index-mvc.js recebe requisição                              │
│  5. transacaoRoutes.js roteia para TransacaoController.criar    │
│  6. TransacaoController valida dados e chama Transacao.criar    │
│  7. Transacao.criar (Model) executa SQL no MySQL               │
│     INSERT INTO transacoes (usuario_id, date, ...) VALUES (...)│
│  8. Database retorna ID da transação inserida                   │
│  9. TransacaoController retorna JSON com sucesso               │
│     {mensagem: "Transação criada!", transacao: {...}}          │
└──────────────────────┬──────────────────────────────────────────┘
                       │ HTTP RESPONSE (JSON)
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND (Browser)                          │
├─────────────────────────────────────────────────────────────────┤
│  10. script.js recebe resposta JSON                             │
│  11. Atualiza transactions array                                │
│  12. Chama renderTable() para atualizar VIEW (HTML)            │
│  13. Usuário vê nova transação na tabela!                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## ✅ Benefícios da Arquitetura MVC

| Benefício                          | Como Ajuda                                                |
| ---------------------------------- | --------------------------------------------------------- |
| **Separação de Responsabilidades** | Cada camada tem uma função específica                     |
| **Fácil Manutenção**               | Bugs em uma camada não afetam as outras                   |
| **Reutilização de Código**         | Models e Controllers podem ser usados por múltiplas Views |
| **Testabilidade**                  | Mais fácil criar testes unitários                         |
| **Escalabilidade**                 | Adicionar novas features é mais limpo                     |

---

## 🚀 Como Usar o Novo Sistema

### **1. Parar o servidor antigo**

```bash
# No terminal do Node.js, pressione Ctrl+C
```

### **2. Iniciar com o novo arquivo MVC**

```bash
node index-mvc.js
```

### **3. Testar no navegador**

```
http://localhost:3000/principal
```

---

## 📋 Checklist de Endpoints MVC

### **Usuários (routes/usuarioRoutes.js)**

- ✅ `POST /cadastro` → UsuarioController.cadastro
- ✅ `POST /login` → UsuarioController.login
- ✅ `GET /usuario/:id` → UsuarioController.obterPerfil

### **Transações (routes/transacaoRoutes.js)**

- ✅ `GET /transacoes/usuario/:usuarioId` → listarPorUsuario
- ✅ `GET /transacoes/:id` → obter
- ✅ `POST /transacoes` → criar
- ✅ `PUT /transacoes/:id` → atualizar
- ✅ `DELETE /transacoes/:id` → deletar
- ✅ `GET /transacoes/mes/:usuarioId/:mes/:ano` → buscarPorMes
- ✅ `GET /transacoes/resumo/:usuarioId` → obterResumo

---

## 🔧 Próximas Melhorias

1. **Middleware de Autenticação** - Proteger rotas com JWT/Session
2. **Validação de Dados** - Usar biblioteca como `joi` ou `express-validator`
3. **Tratamento de Erros** - Criar middleware centralizado para erros
4. **Logging** - Implementar sistema de logs (winston, morgan)
5. **Testes** - Adicionar testes unitários (Jest, Mocha)

---

## 📚 Resumo

A arquitetura **MVC** no seu sistema funciona assim:

- 📊 **MODEL**: Fala com o banco de dados (MySQL)
- ⚙️ **CONTROLLER**: Recebe request, valida, chama Model, retorna response
- 🛣️ **ROUTES**: Mapeia URLs para Controllers
- 🎨 **VIEW**: Frontend que o usuário vê e interage
- 🎮 **CONTROLLER Frontend**: `script.js` que captura eventos do usuário

**Tudo trabalha junto de forma organizada e profissional!** 🎯

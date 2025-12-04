# 🔌 API REST - Sistema de Controle Financeiro

## 📌 Informações Gerais

- **URL Base**: `http://localhost:3000/api/v1`
- **Versão**: 1.0.0
- **Formato de Resposta**: JSON
- **Autenticação**: Por enquanto localStorage (em desenvolvimento)

---

## 📚 Documentação Completa da API

### 1️⃣ AUTENTICAÇÃO

#### **Cadastrar Novo Usuário**

```http
POST /api/v1/auth/cadastro
Content-Type: application/json

{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "senha123"
}
```

**Resposta (201 Created):**

```json
{
  "mensagem": "Cadastro realizado com sucesso!"
}
```

---

#### **Fazer Login**

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "joao@email.com",
  "password": "senha123"
}
```

**Resposta (200 OK):**

```json
{
  "mensagem": "Login realizado com sucesso!",
  "usuario": {
    "id": 1,
    "email": "joao@email.com",
    "name": "João Silva"
  }
}
```

---

#### **Obter Perfil do Usuário**

```http
GET /api/v1/auth/perfil/:id
```

**Exemplo:**

```
GET /api/v1/auth/perfil/1
```

**Resposta (200 OK):**

```json
{
  "id": 1,
  "name": "João Silva",
  "email": "joao@email.com"
}
```

---

### 2️⃣ TRANSAÇÕES - CRUD Básico

#### **Listar Todas as Transações do Usuário**

```http
GET /api/v1/transacoes/usuario/:usuarioId
```

**Exemplo:**

```
GET /api/v1/transacoes/usuario/1
```

**Resposta (200 OK):**

```json
[
  {
    "id": 1,
    "usuario_id": 1,
    "date": "2025-12-04",
    "description": "Salário",
    "category": "Renda",
    "amount": 5000.0,
    "type": "entrada",
    "dataCriacao": "2025-12-04T10:30:00.000Z"
  },
  {
    "id": 2,
    "usuario_id": 1,
    "date": "2025-12-04",
    "description": "Aluguel",
    "category": "Moradia",
    "amount": 1500.0,
    "type": "saída",
    "dataCriacao": "2025-12-04T11:00:00.000Z"
  }
]
```

---

#### **Obter Uma Transação Específica**

```http
GET /api/v1/transacoes/:id
```

**Exemplo:**

```
GET /api/v1/transacoes/1
```

**Resposta (200 OK):**

```json
{
  "id": 1,
  "usuario_id": 1,
  "date": "2025-12-04",
  "description": "Salário",
  "category": "Renda",
  "amount": 5000.0,
  "type": "entrada"
}
```

---

#### **Criar Nova Transação**

```http
POST /api/v1/transacoes
Content-Type: application/json

{
  "usuario_id": 1,
  "date": "2025-12-04",
  "description": "Almoço",
  "category": "Alimentação",
  "amount": 45.50,
  "type": "saída"
}
```

**Resposta (201 Created):**

```json
{
  "mensagem": "Transação criada!",
  "transacao": {
    "id": 3,
    "usuario_id": 1,
    "date": "2025-12-04",
    "description": "Almoço",
    "category": "Alimentação",
    "amount": 45.5,
    "type": "saída"
  }
}
```

---

#### **Atualizar Uma Transação**

```http
PUT /api/v1/transacoes/:id
Content-Type: application/json

{
  "date": "2025-12-04",
  "description": "Almoço - Churrascaria",
  "category": "Alimentação",
  "amount": 65.00,
  "type": "saída"
}
```

**Exemplo:**

```
PUT /api/v1/transacoes/3
```

**Resposta (200 OK):**

```json
{
  "mensagem": "Transação atualizada!"
}
```

---

#### **Deletar Uma Transação**

```http
DELETE /api/v1/transacoes/:id
```

**Exemplo:**

```
DELETE /api/v1/transacoes/3
```

**Resposta (200 OK):**

```json
{
  "mensagem": "Transação deletada!"
}
```

---

### 3️⃣ FILTROS E BUSCAS

#### **Listar Transações por Mês/Ano**

```http
GET /api/v1/transacoes/filtro/mes/:usuarioId/:mes/:ano
```

**Exemplo:**

```
GET /api/v1/transacoes/filtro/mes/1/12/2025
```

**Resposta (200 OK):**

```json
[
  {
    "id": 1,
    "usuario_id": 1,
    "date": "2025-12-04",
    "description": "Salário",
    "category": "Renda",
    "amount": 5000.0,
    "type": "entrada"
  }
]
```

---

#### **Listar Transações por Categoria**

```http
GET /api/v1/transacoes/filtro/categoria/:usuarioId/:categoria
```

**Exemplo:**

```
GET /api/v1/transacoes/filtro/categoria/1/Alimentação
```

**Resposta (200 OK):**

```json
[
  {
    "id": 2,
    "usuario_id": 1,
    "date": "2025-12-04",
    "description": "Almoço",
    "category": "Alimentação",
    "amount": 45.5,
    "type": "saída"
  }
]
```

---

#### **Listar Transações por Tipo**

```http
GET /api/v1/transacoes/filtro/tipo/:usuarioId/:tipo
```

**Exemplo:**

```
GET /api/v1/transacoes/filtro/tipo/1/entrada
```

**Resposta (200 OK):**

```json
[
  {
    "id": 1,
    "usuario_id": 1,
    "date": "2025-12-04",
    "description": "Salário",
    "category": "Renda",
    "amount": 5000.0,
    "type": "entrada"
  }
]
```

---

### 4️⃣ ESTATÍSTICAS E RELATÓRIOS

#### **Resumo Mensal**

```http
GET /api/v1/estatisticas/resumo-mensal/:usuarioId/:mes/:ano
```

**Exemplo:**

```
GET /api/v1/estatisticas/resumo-mensal/1/12/2025
```

**Resposta (200 OK):**

```json
{
  "mes": 12,
  "ano": 2025,
  "totalEntradas": 5000.0,
  "totalSaidas": 1545.5,
  "saldo": 3454.5,
  "quantidadeTransacoes": 5
}
```

---

#### **Resumo Anual**

```http
GET /api/v1/estatisticas/resumo-anual/:usuarioId/:ano
```

**Exemplo:**

```
GET /api/v1/estatisticas/resumo-anual/1/2025
```

**Resposta (200 OK):**

```json
{
  "ano": 2025,
  "meses": [
    {
      "mes": 1,
      "totalEntradas": 5000.0,
      "totalSaidas": 1200.0,
      "saldo": 3800.0,
      "quantidadeTransacoes": 8
    },
    {
      "mes": 12,
      "totalEntradas": 5000.0,
      "totalSaidas": 1545.5,
      "saldo": 3454.5,
      "quantidadeTransacoes": 5
    }
  ],
  "totalAnual": {
    "entradas": 60000.0,
    "saidas": 18750.0,
    "saldo": 41250.0
  }
}
```

---

#### **Gastos por Categoria**

```http
GET /api/v1/estatisticas/categorias/:usuarioId
```

**Exemplo:**

```
GET /api/v1/estatisticas/categorias/1
```

**Resposta (200 OK):**

```json
[
  {
    "categoria": "Moradia",
    "total": 1500.0,
    "quantidade": 1,
    "tipo": "saída"
  },
  {
    "categoria": "Alimentação",
    "total": 300.5,
    "quantidade": 3,
    "tipo": "saída"
  },
  {
    "categoria": "Renda",
    "total": 5000.0,
    "quantidade": 1,
    "tipo": "entrada"
  }
]
```

---

#### **Evolução do Saldo**

```http
GET /api/v1/estatisticas/evolucao/:usuarioId
```

**Exemplo:**

```
GET /api/v1/estatisticas/evolucao/1
```

**Resposta (200 OK):**

```json
[
  {
    "data": "2025-12-01",
    "saldoAcumulado": 5000.0
  },
  {
    "data": "2025-12-02",
    "saldoAcumulado": 3500.0
  },
  {
    "data": "2025-12-04",
    "saldoAcumulado": 3454.5
  }
]
```

---

### 5️⃣ UTILITÁRIOS

#### **Verificar Status da API**

```http
GET /api/v1/health
```

**Resposta (200 OK):**

```json
{
  "status": "OK",
  "timestamp": "2025-12-04T10:30:00.000Z",
  "message": "API de Controle Financeiro está online!"
}
```

---

#### **Ver Documentação Completa**

```http
GET /api/docs
```

**Resposta (200 OK):**

```json
{
  "api": "Sistema de Controle Financeiro",
  "versao": "1.0.0",
  "baseUrl": "http://localhost:3000/api/v1",
  "endpoints": { ... }
}
```

---

## 🧪 Testando a API

### Usando cURL (Terminal)

```bash
# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"joao@email.com","password":"senha123"}'

# Listar transações
curl -X GET http://localhost:3000/api/v1/transacoes/usuario/1

# Criar transação
curl -X POST http://localhost:3000/api/v1/transacoes \
  -H "Content-Type: application/json" \
  -d '{"usuario_id":1,"date":"2025-12-04","description":"Almoço","category":"Alimentação","amount":45.50,"type":"saída"}'

# Ver resumo mensal
curl -X GET http://localhost:3000/api/v1/estatisticas/resumo-mensal/1/12/2025
```

---

### Usando Postman

1. Crie uma nova collection
2. Configure o base URL: `http://localhost:3000/api/v1`
3. Crie requests para cada endpoint
4. Salve as variáveis (usuarioId, transacaoId) para reutilizar

---

### Usando JavaScript (Fetch API)

```javascript
// Login
const response = await fetch("http://localhost:3000/api/v1/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "joao@email.com",
    password: "senha123",
  }),
});
const usuario = await response.json();

// Listar transações
const transacoes = await fetch(
  `http://localhost:3000/api/v1/transacoes/usuario/${usuario.usuario.id}`
).then((r) => r.json());

// Criar transação
const novaTransacao = await fetch("http://localhost:3000/api/v1/transacoes", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    usuario_id: usuario.usuario.id,
    date: "2025-12-04",
    description: "Almoço",
    category: "Alimentação",
    amount: 45.5,
    type: "saída",
  }),
}).then((r) => r.json());
```

---

## ❌ Códigos de Erro

| Código  | Descrição                                |
| ------- | ---------------------------------------- |
| **400** | Bad Request - Dados inválidos            |
| **401** | Unauthorized - Credenciais incorretas    |
| **404** | Not Found - Recurso não encontrado       |
| **500** | Internal Server Error - Erro no servidor |

**Exemplo de Erro:**

```json
{
  "erro": "Faltam dados obrigatórios"
}
```

---

## 🔒 Segurança (Próximas Melhorias)

- [ ] Implementar autenticação JWT
- [ ] Validação de dados com express-validator
- [ ] Rate limiting
- [ ] CORS configurado
- [ ] Validação de permissões (usuário só acessa seus dados)

---

## 📋 Resumo de Endpoints

| Método | Endpoint                                           | Descrição                |
| ------ | -------------------------------------------------- | ------------------------ |
| POST   | /auth/cadastro                                     | Registrar usuário        |
| POST   | /auth/login                                        | Fazer login              |
| GET    | /auth/perfil/:id                                   | Obter perfil             |
| GET    | /transacoes/usuario/:usuarioId                     | Listar transações        |
| GET    | /transacoes/:id                                    | Obter transação          |
| POST   | /transacoes                                        | Criar transação          |
| PUT    | /transacoes/:id                                    | Atualizar transação      |
| DELETE | /transacoes/:id                                    | Deletar transação        |
| GET    | /transacoes/filtro/mes/:usuarioId/:mes/:ano        | Transações por mês       |
| GET    | /transacoes/filtro/categoria/:usuarioId/:categoria | Transações por categoria |
| GET    | /transacoes/filtro/tipo/:usuarioId/:tipo           | Transações por tipo      |
| GET    | /estatisticas/resumo-mensal/:usuarioId/:mes/:ano   | Resumo mensal            |
| GET    | /estatisticas/resumo-anual/:usuarioId/:ano         | Resumo anual             |
| GET    | /estatisticas/categorias/:usuarioId                | Gastos por categoria     |
| GET    | /estatisticas/evolucao/:usuarioId                  | Evolução do saldo        |
| GET    | /health                                            | Status da API            |

---

## 🚀 Próximas Features

1. **Paginação** - Limitar resultados com `?page=1&limit=10`
2. **Ordenação** - Ordenar por campo com `?sort=date&order=asc`
3. **Busca** - Buscar por descrição com `?search=termo`
4. **Export** - Exportar dados em CSV/Excel
5. **Webhooks** - Notificações em tempo real

---

**Versão:** 1.0.0  
**Última atualização:** 2025-12-04  
**Desenvolvido com:** Node.js + Express + MySQL

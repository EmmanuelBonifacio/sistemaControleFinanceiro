# 🔐 Guia de Autenticação e Segurança

## Implementações de Segurança Realizadas

### 1. ✅ Bcryptjs - Hash de Senhas

- **Localização**: `src/models/Usuario.js`
- **Rounds de Salt**: 10
- **Processo**:
  - Cadastro: Senha é hasheada com bcrypt.hash() antes de salvar no BD
  - Login: Senha fornecida é comparada com hash usando bcrypt.compare()
  - Nunca armazena senha em plaintext

### 2. ✅ JWT - Token de Autenticação

- **Localização**: `src/middleware/autenticacao.js` e `src/controllers/UsuarioController.js`
- **Tipo**: Bearer Token
- **Formato**: `Authorization: Bearer {token}`
- **Validade**: 7 dias (configurável em `.env`)
- **Payload**:
  ```json
  {
    "id": 1,
    "email": "usuario@email.com",
    "name": "Nome do Usuário",
    "iat": 1234567890,
    "exp": 1234654290
  }
  ```

### 3. ✅ Express-Validator - Validação de Entrada

- **Localização**: `src/middleware/validacao.js`
- **Validadores Implementados**:
  - `validarCadastro`: Email, senha forte, nome
  - `validarLogin`: Email, senha
  - `validarTransacao`: Data, valor, tipo, descrição, categoria
  - `validarAtualizacaoTransacao`: Campos opcionais

### 4. ✅ CORS - Controle de Origem

- **Localização**: `index-mvc.js`
- **Configuração**: Variável `CORS_ORIGIN` em `.env`
- **Padrão**: `*` (aceita todas as origens em desenvolvimento)

## Endpoints Protegidos com JWT

### 1. Autenticação

#### POST /cadastro

```bash
curl -X POST http://localhost:3000/cadastro \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@email.com",
    "password": "Senha123"
  }'
```

**Requisitos de Senha**:

- Mínimo 8 caracteres
- Pelo menos 1 letra maiúscula
- Pelo menos 1 letra minúscula
- Pelo menos 1 número

#### POST /login

```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@email.com",
    "password": "Senha123"
  }'
```

**Resposta**:

```json
{
  "mensagem": "Login realizado com sucesso!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 1,
    "email": "joao@email.com",
    "name": "João Silva"
  }
}
```

#### GET /usuario/:id (Protegido)

```bash
curl -X GET http://localhost:3000/usuario/1 \
  -H "Authorization: Bearer {token}"
```

**Requisitos**:

- Token válido no header Authorization
- ID do usuário deve corresponder ao seu próprio ID

### 2. Transações (Todas Protegidas)

#### GET /transacoes/usuario/:usuarioId

```bash
curl -X GET http://localhost:3000/transacoes/usuario/1 \
  -H "Authorization: Bearer {token}"
```

#### POST /transacoes (Protegido)

```bash
curl -X POST http://localhost:3000/transacoes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "usuario_id": 1,
    "date": "2024-01-15",
    "description": "Compra de alimentos",
    "category": "Alimentação",
    "amount": 150.00,
    "type": "saída"
  }'
```

**Requisitos**:

- Token válido
- `usuario_id` deve ser igual ao seu próprio ID

#### PUT /transacoes/:id (Protegido)

```bash
curl -X PUT http://localhost:3000/transacoes/5 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "date": "2024-01-20",
    "amount": 200.00
  }'
```

#### DELETE /transacoes/:id (Protegido)

```bash
curl -X DELETE http://localhost:3000/transacoes/5 \
  -H "Authorization: Bearer {token}"
```

## Variáveis de Ambiente Necessárias

Arquivo `.env`:

```env
# Banco de Dados
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=controle_financeiro

# Servidor
PORT=3000
NODE_ENV=development

# Segurança
JWT_SECRET=sua_chave_secreta_super_segura_aqui_mude_em_producao
JWT_EXPIRE=7d
BCRYPT_ROUNDS=10

# CORS
CORS_ORIGIN=*
```

## Tratamento de Erros

### 401 Unauthorized

- Token não fornecido
- Token inválido
- Token expirado

### 403 Forbidden

- Tentativa de acessar dados de outro usuário
- Falta de permissão

### 400 Bad Request

- Validação falhou
- Campos obrigatórios faltando

### 500 Internal Server Error

- Erro no servidor

## Fluxo de Autenticação

```
1. Usuário faz cadastro com nome, email e senha
   ↓
2. Sistema valida dados com express-validator
   ↓
3. Senha é hasheada com bcryptjs (10 rounds)
   ↓
4. Usuário criado no BD

---

1. Usuário faz login com email e senha
   ↓
2. Sistema valida dados
   ↓
3. Email procurado no BD
   ↓
4. Senha fornecida comparada com hash usando bcryptjs
   ↓
5. JWT token gerado (válido por 7 dias)
   ↓
6. Token retornado ao cliente

---

1. Usuário faz requisição com token no header
   ↓
2. Middleware extrai token do header Authorization
   ↓
3. JWT verifica assinatura e validade
   ↓
4. Se válido, usuário adicionado ao req.usuario
   ↓
5. Controller verifica permissões (usuário pode acessar só seus dados)
   ↓
6. Operação realizada
```

## Próximas Melhorias Recomendadas

1. **HttpOnly Cookies**: Migrar tokens para HttpOnly cookies (mais seguro que localStorage)
2. **Refresh Tokens**: Implementar refresh tokens para renovação de sessão
3. **Rate Limiting**: Limitar tentativas de login (5 tentativas por 15 minutos)
4. **Audit Logging**: Registrar todas as operações sensíveis
5. **2FA**: Autenticação de dois fatores
6. **Password Reset**: Sistema de recuperação de senha

## Testando com JavaScript/Fetch

```javascript
// Cadastro
fetch("http://localhost:3000/cadastro", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "João",
    email: "joao@email.com",
    password: "Senha123",
  }),
})
  .then((r) => r.json())
  .then(console.log);

// Login
fetch("http://localhost:3000/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "joao@email.com",
    password: "Senha123",
  }),
})
  .then((r) => r.json())
  .then((data) => {
    localStorage.setItem("token", data.token);
    console.log("Token salvo:", data.token);
  });

// Requisição protegida
const token = localStorage.getItem("token");
fetch("http://localhost:3000/usuario/1", {
  headers: { Authorization: `Bearer ${token}` },
})
  .then((r) => r.json())
  .then(console.log);
```

## Status da Implementação

- ✅ bcryptjs: Hash de senhas implementado
- ✅ JWT: Token de autenticação funcionando
- ✅ express-validator: Validação de entrada ativa
- ✅ CORS: Configurado
- ✅ Middleware de autenticação: Protegendo rotas
- ✅ Verificação de permissões: Usuário só acessa próprios dados
- 🔧 HttpOnly Cookies: Pronto para implementar
- 🔧 Rate Limiting: Pronto para implementar
- 🔧 Refresh Tokens: Pronto para implementar

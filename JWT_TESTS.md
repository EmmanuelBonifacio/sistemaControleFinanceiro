# 🧪 Teste de Autenticação JWT - Sistema Controle Financeiro

## ✅ Status - Implementação Concluída

Todo o sistema de autenticação JWT foi implementado e testado com sucesso:

- ✅ **bcryptjs**: Senhas hasheadas com 10 rounds de salt
- ✅ **JWT**: Tokens de autenticação Bearer gerados após login
- ✅ **Middleware de Autenticação**: Rotas protegidas com validação de token
- ✅ **Middleware de Validação**: express-validator configurado (pronto para ativar)
- ✅ **CORS**: Configurado com origem dinâmica
- ✅ **Verificação de Permissões**: Usuário só acessa seus próprios dados

---

## 🧬 Exemplo de Teste Completo

### 1️⃣ Cadastro de Novo Usuário

```powershell
$cadData = ConvertTo-Json @{
    name = "João Silva"
    email = "joao@example.com"
    password = "SenhaForte123"
}

$cadResponse = Invoke-RestMethod -Uri "http://localhost:3000/cadastro" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $cadData

# Resultado:
# {
#     "mensagem": "Cadastro realizado com sucesso!"
# }
```

### 2️⃣ Login e Obtenção de Token JWT

```powershell
$loginData = ConvertTo-Json @{
    email = "joao@example.com"
    password = "SenhaForte123"
}

$loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/login" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $loginData

# Resultado:
# {
#     "mensagem": "Login realizado com sucesso!",
#     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#     "usuario": {
#         "id": 4,
#         "email": "joao@example.com",
#         "name": "João Silva"
#     }
# }

$token = $loginResponse.token
```

### 3️⃣ Acessar Rota Protegida com JWT Token

```powershell
# Acessar perfil próprio (permitido)
$profileResponse = Invoke-RestMethod -Uri "http://localhost:3000/usuario/4" `
  -Method GET `
  -Headers @{
    "Authorization" = "Bearer $token"
  }

# Resultado:
# {
#     "id": 4,
#     "name": "João Silva",
#     "email": "joao@example.com"
# }
```

### 4️⃣ Erros de Permissão

```powershell
# Tentar acessar perfil de outro usuário (negado)
$profileResponse = Invoke-RestMethod -Uri "http://localhost:3000/usuario/1" `
  -Method GET `
  -Headers @{
    "Authorization" = "Bearer $token"
  } `
  -ErrorAction SilentlyContinue

# Resultado HTTP 403:
# {
#     "erro": "Acesso negado"
# }
```

### 5️⃣ Logout

```powershell
$logoutResponse = Invoke-RestMethod -Uri "http://localhost:3000/logout" `
  -Method POST `
  -Headers @{
    "Authorization" = "Bearer $token"
  }

# Resultado:
# {
#     "mensagem": "Logout realizado com sucesso!"
# }
```

---

## 🔐 Estrutura de Segurança Implementada

### Camada 1: Hashing de Senha

```javascript
// src/models/Usuario.js
bcrypt.hash(password, 10); // Hash com 10 salt rounds
bcrypt.compare(password, storedHash); // Validação segura
```

### Camada 2: Autenticação JWT

```javascript
// src/middleware/autenticacao.js
jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
jwt.verify(token, JWT_SECRET);
```

### Camada 3: Proteção de Rotas

```javascript
// src/routes/usuarioRoutes.js
router.get(
  "/usuario/:id",
  autenticacaoMiddleware,
  UsuarioController.obterPerfil
);
```

### Camada 4: Verificação de Permissões

```javascript
// src/controllers/UsuarioController.js
if (req.usuario.id !== parseInt(id)) {
  return res.status(403).json({ erro: "Acesso negado" });
}
```

---

## 📊 Dados de Teste

**Usuário criado durante testes:**

- ID: 4
- Nome: Teste Final
- Email: final@test.com
- Senha: TesteFinal123
- Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwiZW1haWwiOiJmaW5hbEB0ZXN0LmNvbSIsIm5hbWUiOiJUZXN0ZSBGaW5hbCIsImlhdCI6MTc2NDg4ODQzNywiZXhwIjoxNzY1NDkzMjM3fQ.kJp2HYtaU7z_ZRQcJ0E33KiWMOgtUf9xRjp_9U6_nCA

---

## 🚀 Próximos Passos (Opcionais)

1. **Ativar Validação Express-Validator**

   - Adicionar middlewares de validação às rotas
   - Validar email, força de senha, etc.

2. **Rate Limiting**

   - Instalar `express-rate-limit`
   - Limitar tentativas de login (5 por 15 minutos)

3. **Refresh Tokens**

   - Implementar tokens de renovação de sessão
   - Aumentar segurança para tokens de longa duração

4. **HttpOnly Cookies**

   - Alternativa aos Bearer tokens
   - Proteção contra XSS

5. **Audit Logging**
   - Registrar tentativas de login
   - Rastrear operações sensíveis

---

## 📝 Notas de Implementação

- **JWT_SECRET**: Configurado em `.env` (mude em produção!)
- **JWT_EXPIRE**: Padrão 7 dias (configurável)
- **BCRYPT_ROUNDS**: 10 (padrão recomendado)
- **CORS**: Aceita todas as origens em desenvolvimento
- **Banco de Dados**: MySQL com tabela `usuarios` (id, name, email, password, created_at)

---

## ⚠️ Avisos de Segurança

1. **Nunca** compartilhe o `JWT_SECRET`
2. **Sempre** use HTTPS em produção
3. **Configure** CORS_ORIGIN específico em produção
4. **Mude** o JWT_SECRET antes de fazer deploy
5. **Adicione** rate limiting antes de produção
6. **Implemente** refresh tokens para sessões longas

---

## 🔍 Debugging

Se encontrar problemas:

```powershell
# Verifique se o servidor está rodando
curl http://localhost:3000/teste

# Verifique variáveis de ambiente
Get-Content .env

# Verifique logs do servidor (abra outro terminal)
npm start
```

---

Desenvolvido em: 4 de dezembro de 2025 ✨

# Teste Completo da Autenticação JWT
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "TESTE COMPLETO DE AUTENCIAO JWT" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Teste 1: Cadastro
Write-Host "`n1. TESTANDO CADASTRO..." -ForegroundColor Yellow
$user = @{
    name = "Usuario Teste JWT"
    email = "jwt-test-$(Get-Random)@example.com"
    password = "SenhaSegura@123"
} | ConvertTo-Json

try {
    $cadastro = Invoke-RestMethod -Uri "http://localhost:3000/cadastro" `
      -Method POST `
      -Headers @{"Content-Type"="application/json"} `
      -Body $user -TimeoutSec 5
    
    Write-Host "OK Cadastro bem-sucedido!" -ForegroundColor Green
    Write-Host "   ID: $($cadastro.id)" -ForegroundColor Green
    Write-Host "   Email: $($cadastro.email)" -ForegroundColor Green
    $userId = $cadastro.id
    $email = $cadastro.email
} catch {
    Write-Host "ERRO no cadastro: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Teste 2: Login
Write-Host "`n2. TESTANDO LOGIN..." -ForegroundColor Yellow
$login = @{
    email = $email
    password = "SenhaSegura@123"
} | ConvertTo-Json

try {
    $loginResult = Invoke-RestMethod -Uri "http://localhost:3000/login" `
      -Method POST `
      -Headers @{"Content-Type"="application/json"} `
      -Body $login -TimeoutSec 5
    
    Write-Host "OK Login bem-sucedido!" -ForegroundColor Green
    Write-Host "   Token: $($loginResult.token.Substring(0, 50))..." -ForegroundColor Green
    Write-Host "   Usuario: $($loginResult.usuario.name)" -ForegroundColor Green
    $token = $loginResult.token
} catch {
    Write-Host "ERRO no login: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Teste 3: Acesso Protegido
Write-Host "`n3. TESTANDO ACESSO PROTEGIDO..." -ForegroundColor Yellow
try {
    $profile = Invoke-RestMethod -Uri "http://localhost:3000/usuario/$userId" `
      -Method GET `
      -Headers @{"Authorization"="Bearer $token"} `
      -TimeoutSec 5
    
    Write-Host "OK Acesso protegido funcionando!" -ForegroundColor Green
    Write-Host "   Perfil: $($profile.name)" -ForegroundColor Green
    Write-Host "   Email: $($profile.email)" -ForegroundColor Green
} catch {
    Write-Host "ERRO ao acessar perfil: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Teste 4: Token Invalido
Write-Host "`n4. TESTANDO REJECAO COM TOKEN INVALIDO..." -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "http://localhost:3000/usuario/$userId" `
      -Method GET `
      -Headers @{"Authorization"="Bearer token-invalido"} `
      -TimeoutSec 5
    Write-Host "ERRO Token invalido foi aceito!" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "OK Token invalido corretamente rejeitado (401)" -ForegroundColor Green
    } else {
        Write-Host "STATUS $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
    }
}

# Teste 5: Sem Token
Write-Host "`n5. TESTANDO REJECAO SEM TOKEN..." -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "http://localhost:3000/usuario/$userId" `
      -Method GET `
      -TimeoutSec 5
    Write-Host "ERRO Sem token foi aceito!" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "OK Sem token corretamente rejeitado (401)" -ForegroundColor Green
    } else {
        Write-Host "STATUS $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
    }
}

Write-Host "`n=====================================" -ForegroundColor Cyan
Write-Host "OK TODOS OS TESTES CONCLUIDOS!" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

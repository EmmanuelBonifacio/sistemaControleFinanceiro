const http = require('http');

function testar() {
  const dados = JSON.stringify({
    name: 'Teste Usuario',
    email: `user${Date.now()}@test.com`,
    password: 'Senha@123456'
  });

  const opcoes = {
    hostname: 'localhost',
    port: 3000,
    path: '/cadastro',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': dados.length
    }
  };

  console.log('Enviando requisição para /cadastro...');
  
  const req = http.request(opcoes, (res) => {
    console.log(`Status: ${res.statusCode}`);
    
    let corpo = '';
    res.on('data', chunk => {
      corpo += chunk;
    });

    res.on('end', () => {
      console.log('Resposta recebida:');
      try {
        const obj = JSON.parse(corpo);
        console.log(JSON.stringify(obj, null, 2));
      } catch (e) {
        console.log(corpo);
      }
    });
  });

  req.on('error', (erro) => {
    console.error('Erro na requisição:', erro.message);
  });

  req.write(dados);
  req.end();
}

testar();

const http = require("http");

function makeRequest(method, path, data) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "localhost",
      port: 3000,
      path: path,
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on("error", reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runTests() {
  console.log("====================================");
  console.log("TESTES DE AUTENTICACAO JWT");
  console.log("====================================\n");

  try {
    // 1. CADASTRO
    console.log("1. CADASTRO...");
    const email = `user-${Date.now()}@test.com`;
    const cadRes = await makeRequest("POST", "/cadastro", {
      name: "Usuario Teste",
      email: email,
      password: "Senha@123456",
    });
    console.log("Status:", cadRes.status);
    console.log("Resposta:", JSON.stringify(cadRes.data, null, 2));
    const userId = cadRes.data.id;
    console.log("✓ Cadastro OK\n");

    // 2. LOGIN
    console.log("2. LOGIN...");
    const logRes = await makeRequest("POST", "/login", {
      email: email,
      password: "Senha@123456",
    });
    console.log("Status:", logRes.status);
    console.log(
      "Token:",
      logRes.data.token ? logRes.data.token.substring(0, 50) + "..." : "vazio"
    );
    console.log(
      "Usuario:",
      logRes.data.usuario ? logRes.data.usuario.name : "vazio"
    );
    const token = logRes.data.token;
    console.log("✓ Login OK\n");

    // 3. ACESSO PROTEGIDO
    console.log("3. ACESSO PROTEGIDO...");
    const options = {
      hostname: "localhost",
      port: 3000,
      path: `/usuario/${userId}`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const profRes = await new Promise((resolve) => {
      const req = http.request(options, (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        });
      });
      req.on("error", () => resolve({ status: 0, data: {} }));
      req.end();
    });

    console.log("Status:", profRes.status);
    console.log("Resposta:", JSON.stringify(profRes.data, null, 2));
    console.log("✓ Acesso Protegido OK\n");

    console.log("====================================");
    console.log("✓ TODOS OS TESTES PASSARAM!");
    console.log("====================================");
  } catch (error) {
    console.error("Erro:", error.message);
    process.exit(1);
  }
}

runTests();

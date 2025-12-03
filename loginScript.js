// Função para alternar entre formulários de login e cadastro
function toggleForms() {
  const loginCard = document.querySelector(".login-card");
  const signupCard = document.getElementById("signup-card");

  loginCard.style.display =
    loginCard.style.display === "none" ? "block" : "none";
  signupCard.style.display =
    signupCard.style.display === "none" ? "block" : "none";
}

// Evento do formulário de login
document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  try {
    const response = await fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      alert("Login realizado com sucesso!");
      // Redirecionar para página principal
      window.location.href = "/";
    } else {
      alert(data.erro || "Erro ao fazer login");
    }
  } catch (error) {
    console.error("Erro:", error);
    alert("Erro ao conectar com o servidor");
  }
});

// Evento do formulário de cadastro
document.getElementById("signup-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("signup-name").value;
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;
  const confirmPassword = document.getElementById(
    "signup-confirm-password"
  ).value;

  // Validação de senhas
  if (password !== confirmPassword) {
    alert("As senhas não coincidem!");
    return;
  }

  if (password.length < 6) {
    alert("A senha deve ter pelo menos 6 caracteres!");
    return;
  }

  try {
    const response = await fetch("/cadastro", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      alert("Cadastro realizado com sucesso! Faça login para continuar.");
      // Limpar formulário e voltar para login
      document.getElementById("signup-form").reset();
      toggleForms();
    } else {
      alert(data.erro || "Erro ao cadastrar");
    }
  } catch (error) {
    console.error("Erro:", error);
    alert("Erro ao conectar com o servidor");
  }
});

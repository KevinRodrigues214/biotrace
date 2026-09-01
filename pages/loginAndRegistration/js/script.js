// ===== 1. SELETORES DOS ELEMENTOS =====
const loginForm = document.getElementById('loginForm');
const registrationForm = document.getElementById('registrationForm');
const toRegisterLink = document.getElementById('toRegister');
const toLoginLink = document.getElementById('toLogin');

// Campos de Login
const loginInput = document.getElementById('login');
const passwordInput = document.getElementById('password');

// Campos de Registro
const regUserInput = document.getElementById('reg-user');
const regPasswordInput = document.getElementById('reg-password');

// ===== 2. TRANSIÇÃO DE TELAS =====
toRegisterLink.addEventListener('click', function(event) {
    event.preventDefault();
    limparErros();
    loginForm.classList.remove('context-active');
    registrationForm.classList.add('context-active');
});

toLoginLink.addEventListener('click', function(event) {
    event.preventDefault();
    limparErros();
    registrationForm.classList.remove('context-active');
    loginForm.classList.add('context-active');
});

// ===== 3. LÓGICA DE REGISTRO (CADASTRO) =====
registrationForm.addEventListener('submit', function(event) {
    event.preventDefault(); // Impede a página de recarregar
    limparErros();

    const username = regUserInput.value.trim();
    const password = regPasswordInput.value;

    // Busca a lista de usuários já cadastrados no localStorage (ou cria uma vazia)
    let usuarios = JSON.parse(localStorage.getItem('usuarios_temporarios')) || [];

    // Verifica se o usuário já existe
    const usuarioExiste = usuarios.some(user => user.username.toLowerCase() === username.toLowerCase());

    if (usuarioExiste) {
        mostrarErro('registrationForm', 'Este usuário já está cadastrado!');
        return;
    }

    // Salva o novo usuário na lista
    usuarios.push({ username: username, password: password });
    localStorage.setItem('usuarios_temporarios', JSON.stringify(usuarios));

    alert('Cadastro realizado com sucesso! Redirecionando para o Login...');
    
    // Limpa o formulário de registro e volta para a tela de login
    registrationForm.reset();
    registrationForm.classList.remove('context-active');
    loginForm.classList.add('context-active');
});

// ===== 4. LÓGICA DE LOGIN =====
loginForm.addEventListener('submit', function(event) {
    event.preventDefault(); // Impede a página de recarregar
    limparErros();

    const username = loginInput.value.trim();
    const password = passwordInput.value;

    // Busca a lista de usuários salvos no localStorage
    const usuarios = JSON.parse(localStorage.getItem('usuarios_temporarios')) || [];

    // Procura por um usuário com o mesmo login e senha
    const usuarioValido = usuarios.find(user => user.username.toLowerCase() === username.toLowerCase() && user.password === password);

       if (usuarioValido) {
        // SALVA O USUÁRIO ATUAL NA SESSÃO (Soma quando fechar a aba do navegador)
        sessionStorage.setItem('usuario_logado', usuarioValido.username);

        alert(`Bem-vindo de volta, ${usuarioValido.username}! Login efetuado com sucesso.`);
        window.location.href = '../homepage/'; 
    } else {
        mostrarErro('loginForm', 'Login ou senha incorretos.');
    }

});

// ===== 5. FUNÇÕES AUXILIARES DE ERRO =====
function mostrarErro(formId, mensagem) {
    // Procura o último elemento <small> de erro dentro do formulário específico
    const form = document.getElementById(formId);
    const erros = form.querySelectorAll('small');
    const erroFinal = erros[erros.length - 1]; // Usa o último <small> próximo ao botão
    
    if (erroFinal) {
        erroFinal.textContent = mensagem;
    }
}

function limparErros() {
    const todosErros = document.querySelectorAll('.login-error, .registration-error');
    todosErros.forEach(erro => erro.textContent = '');
}

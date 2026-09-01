// ===== 1. SELETORES DOS ELEMENTOS =====
const loginForm = document.getElementById('loginForm');
const registrationForm = document.getElementById('registrationForm');
const toRegisterLink = document.getElementById('toRegister');
const toLoginLink = document.getElementById('toLogin');

// Campos de Login
const loginInput = document.getElementById('login');
const passwordInput = document.getElementById('password');

// Campos de Registro (Atualizado com os novos inputs do seu HTML)
const regNameInput = document.getElementById('reg-name');
const regUserInput = document.getElementById('reg-user');
const regEmailInput = document.getElementById('reg-email');
const regPasswordInput = document.getElementById('reg-password');
const regConfirmPasswordInput = document.getElementById('reg-confirm-password');

// ===== 2. TRANSIÇÃO DE TELAS =====
toRegisterLink.addEventListener('click', function(event) {
    event.preventDefault();
    clearErrors();
    loginForm.classList.remove('context-active');
    registrationForm.classList.add('context-active');
});

toLoginLink.addEventListener('click', function(event) {
    event.preventDefault();
    clearErrors();
    registrationForm.classList.remove('context-active');
    loginForm.classList.add('context-active');
});

// ===== 3. FUNÇÃO AUXILIAR DE VALIDAÇÃO DE EMAIL (REGEX) =====
function validateEmailFormat(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// ===== 4. LÓGICA DE REGISTRO (CADASTRO) =====
registrationForm.addEventListener('submit', function(event) {
    event.preventDefault(); // Impede a página de recarregar
    clearErrors();

    const name = regNameInput.value.trim();
    const username = regUserInput.value.trim();
    const email = regEmailInput.value.trim();
    const password = regPasswordInput.value;
    const confirmPassword = regConfirmPasswordInput.value;

    // --- VALIDATION A: Email format ---
    if (!validateEmailFormat(email)) {
        showError('registrationForm', 'Please enter a valid email format.');
        return;
    }

    // --- VALIDATION B: Password length (minimum 6 characters) ---
    if (password.length < 6) {
        showError('registrationForm', 'Password must contain at least 6 characters.');
        return;
    }

    // --- VALIDATION C: Password confirmation ---
    if (password !== confirmPassword) {
        showError('registrationForm', 'The passwords do not match.');
        return;
    }

    // Busca a lista de usuários já cadastrados no localStorage (ou cria uma vazia)
    let users = JSON.parse(localStorage.getItem('temp_users')) || [];

    // Verifica se o usuário já existe
    const userExists = users.some(user => user.username.toLowerCase() === username.toLowerCase());
    const emailExists = users.some(user => user.email && user.email.toLowerCase() === email.toLowerCase());

    if (userExists) {
        showError('registrationForm', 'This username is already registered!');
        return;
    }

    if (emailExists) {
        showError('registrationForm', 'This email is already registered!');
        return;
    }

    // Save the user with all provided data (including the name for the header initials)
    users.push({ 
        name: name,
        username: username, 
        email: email,
        password: password 
    });
    localStorage.setItem('temp_users', JSON.stringify(users));

    alert('Registration successful! Redirecting to login...');
    
    // Limpa o formulário de registro e volta para a tela de login
    registrationForm.reset();
    registrationForm.classList.remove('context-active');
    loginForm.classList.add('context-active');
});

// ===== 5. LÓGICA DE LOGIN =====
loginForm.addEventListener('submit', function(event) {
    event.preventDefault(); // Impede a página de recarregar
    clearErrors();

    const usernameOrEmail = loginInput.value.trim();
    const password = passwordInput.value;

    // Busca a lista de usuários salvos no localStorage
    const users = JSON.parse(localStorage.getItem('temp_users')) || [];

    // Permite fazer login digitando tanto o Username quanto o E-mail
    const validUser = users.find(user => 
        (user.username.toLowerCase() === usernameOrEmail.toLowerCase() || 
         (user.email && user.email.toLowerCase() === usernameOrEmail.toLowerCase())) && 
        user.password === password
    );

    if (validUser) {
        // Save the full user name in session so the header can generate initials properly
        sessionStorage.setItem('logged_user', validUser.name || validUser.username);

        alert(`Welcome back, ${validUser.name || validUser.username}! You have successfully logged in.`);
        window.location.href = '../homepage/'; 


        

    } else {
        showError('loginForm', 'Invalid username/email or password.');
    }
});

// ===== 6. FUNÇÕES AUXILIARES DE ERRO =====
function showError(formId, message) {
    // Procura o último elemento <small> de erro dentro do formulário específico
    const form = document.getElementById(formId);
    const errors = form.querySelectorAll('small');
    const finalError = errors[errors.length - 1]; // Usa o último <small> próximo ao botão
    
    if (finalError) {
        finalError.textContent = message;
    }
}

function clearErrors() {
    const allErrors = document.querySelectorAll('.login-error, .registration-error');
    allErrors.forEach(error => error.textContent = '');
}
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
registrationForm.addEventListener('submit', async function(event) {
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

    if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password)) {
        showError('registrationForm', 'Password must be at least 8 characters and contain a letter and a number.');
        return;
    }

    // --- VALIDATION C: Password confirmation ---
    if (password !== confirmPassword) {
        showError('registrationForm', 'The passwords do not match.');
        return;
    }

    try {
        await window.BioTraceApi.request('/auth/register', {
            method: 'POST',
            body: { name, username, email, password }
        });

        alert('Registration successful! Please log in with your new account.');
        registrationForm.reset();
        registrationForm.classList.remove('context-active');
        loginForm.classList.add('context-active');
    } catch (error) {
        showError('registrationForm', error.message);
    }
});

// ===== 5. LÓGICA DE LOGIN =====
loginForm.addEventListener('submit', async function(event) {
    event.preventDefault(); // Impede a página de recarregar
    clearErrors();

    const email = loginInput.value.trim();
    const password = passwordInput.value;

    try {
        const result = await window.BioTraceApi.request('/auth/login', {
            method: 'POST',
            body: { email, password }
        });

        sessionStorage.setItem('auth_token', result.token);
        sessionStorage.setItem('auth_user_id', result.user.id);
        sessionStorage.setItem('logged_user', result.user.name || result.user.username);
        window.location.href = '../homepage/';
    } catch (error) {
        showError('loginForm', error.message);
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
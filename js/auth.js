/* =========================================================
   AUTH.JS - SISTEMA DE AUTENTICACIÓN GANSTA CAPS
   Login/Register funcional con localStorage
   ========================================================= */

// =========================================================
// CONFIGURACIÓN
// =========================================================
const AUTH_CONFIG = {
    STORAGE_KEYS: {
        USERS: 'gansta_caps_users',
        CURRENT_USER: 'gansta_caps_current_user'
    },
    DEMO_ACCOUNTS: [
        {
            id: 'demo_admin',
            name: 'Administrador Demo',
            email: 'admin@gansta.com',
            password: 'admin123',
            role: 'admin',
            createdAt: new Date().toISOString()
        },
        {
            id: 'demo_cliente',
            name: 'Cliente Demo',
            email: 'cliente@test.com',
            password: 'cliente123',
            role: 'cliente',
            createdAt: new Date().toISOString()
        }
    ]
};

// =========================================================
// VARIABLES GLOBALES
// =========================================================
let users = [];
let currentUser = null;

// =========================================================
// INICIALIZACIÓN
// =========================================================
document.addEventListener('DOMContentLoaded', function() {
    initializeAuth();
    setupEventListeners();
    loadDemoAccounts();
});

function initializeAuth() {
    loadUsersFromStorage();
    console.log('✅ Sistema de autenticación inicializado');
}

// =========================================================
// EVENT LISTENERS
// =========================================================
function setupEventListeners() {
    // Formularios
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
}

// =========================================================
// MANEJO DEL LOGIN
// =========================================================
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const submitBtn = e.target.querySelector('.btn-auth');

    // Validaciones básicas
    if (!email || !password) {
        showAlert('Por favor completa todos los campos', 'error');
        return;
    }

    if (!isValidEmail(email)) {
        showAlert('Por favor ingresa un email válido', 'error');
        return;
    }

    // Mostrar estado de carga
    setButtonLoading(submitBtn, true);

    try {
        // Simular delay de red para UX
        await delay(1000);

        // Buscar usuario
        const user = users.find(u => 
            u.email.toLowerCase() === email.toLowerCase() && 
            u.password === password
        );

        if (user) {
            // Login exitoso
            await loginSuccess(user);
        } else {
            // Credenciales incorrectas
            showAlert('❌ Email o contraseña incorrectos', 'error');
        }
    } catch (error) {
        console.error('Error en login:', error);
        showAlert('❌ Error al iniciar sesión. Intenta nuevamente.', 'error');
    } finally {
        setButtonLoading(submitBtn, false);
    }
}

// =========================================================
// MANEJO DEL REGISTRO
// =========================================================
async function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const role = document.getElementById('registerRole').value;
    const submitBtn = e.target.querySelector('.btn-auth');

    // Validaciones
    if (!name || !email || !password || !role) {
        showAlert('❌ Por favor completa todos los campos', 'error');
        return;
    }

    if (!isValidEmail(email)) {
        showAlert('❌ Por favor ingresa un email válido', 'error');
        return;
    }

    if (password.length < 6) {
        showAlert('❌ La contraseña debe tener al menos 6 caracteres', 'error');
        return;
    }

    if (name.length < 2) {
        showAlert('❌ El nombre debe tener al menos 2 caracteres', 'error');
        return;
    }

    // Verificar si el email ya existe
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        showAlert('❌ Ya existe una cuenta con este email', 'error');
        return;
    }

    // Mostrar estado de carga
    setButtonLoading(submitBtn, true);

    try {
        // Simular delay de red
        await delay(1200);

        // Crear nuevo usuario
        const newUser = {
            id: generateUserId(),
            name: name,
            email: email.toLowerCase(),
            password: password,
            role: role,
            createdAt: new Date().toISOString(),
            lastLogin: null
        };

        // Agregar a la lista de usuarios
        users.push(newUser);
        saveUsersToStorage();

        showAlert('🎉 ¡Cuenta creada exitosamente! Ya puedes iniciar sesión.', 'success');
        
        // Cambiar a formulario de login después de 2 segundos
        setTimeout(() => {
            switchToLogin();
            // Pre-llenar el email
            document.getElementById('loginEmail').value = email;
        }, 2000);

    } catch (error) {
        console.error('Error en registro:', error);
        showAlert('❌ Error al crear la cuenta. Intenta nuevamente.', 'error');
    } finally {
        setButtonLoading(submitBtn, false);
    }
}

// =========================================================
// LOGIN EXITOSO
// =========================================================
// REEMPLAZAR esta función en auth.js
async function loginSuccess(user) {
    // Actualizar último login
    user.lastLogin = new Date().toISOString();
    saveUsersToStorage();

    // Guardar sesión actual
    currentUser = user;
    saveCurrentUserToStorage();

    // Mostrar mensaje de éxito
    const firstName = getFirstName(user.name);
    showAlert(`🎉 ¡Bienvenido, ${firstName}!`, 'success');

    // Verificar si hay redirección pendiente
    setTimeout(() => {
        const redirectUrl = localStorage.getItem('gansta_caps_redirect_after_login');
        
        if (redirectUrl) {
            // Limpiar y redirigir a donde quería ir
            localStorage.removeItem('gansta_caps_redirect_after_login');
            window.location.href = redirectUrl;
        } else {
            // Redirección normal por rol
            redirectByRole(user.role);
        }
    }, 2000);
}

// =========================================================
// REDIRECCIÓN POR ROL
// =========================================================
function redirectByRole(role) {
    switch(role) {
        case 'admin':
            window.location.href = 'index.html?admin=true';
            break;
        case 'cliente':
            window.location.href = 'catalogo.html';
            break;
        default:
            window.location.href = 'index.html';
    }
}

// =========================================================
// CAMBIAR ENTRE FORMULARIOS
// =========================================================
function switchToLogin() {
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginTab && registerTab && loginForm && registerForm) {
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
    }
}

// =========================================================
// GESTIÓN DE USUARIOS Y STORAGE
// =========================================================
function loadUsersFromStorage() {
    try {
        const storedUsers = localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.USERS);
        users = storedUsers ? JSON.parse(storedUsers) : [];
    } catch (error) {
        console.error('Error cargando usuarios:', error);
        users = [];
    }
}

function saveUsersToStorage() {
    try {
        localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.USERS, JSON.stringify(users));
    } catch (error) {
        console.error('Error guardando usuarios:', error);
    }
}

function saveCurrentUserToStorage() {
    try {
        localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
    } catch (error) {
        console.error('Error guardando sesión:', error);
    }
}

function loadCurrentUserFromStorage() {
    try {
        const storedUser = localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.CURRENT_USER);
        return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
        console.error('Error cargando sesión:', error);
        return null;
    }
}

// =========================================================
// CARGAR CUENTAS DEMO
// =========================================================
function loadDemoAccounts() {
    AUTH_CONFIG.DEMO_ACCOUNTS.forEach(demoAccount => {
        const existingUser = users.find(u => u.email === demoAccount.email);
        if (!existingUser) {
            users.push({ ...demoAccount });
        }
    });
    saveUsersToStorage();
}

// =========================================================
// UTILIDADES DE VALIDACIÓN
// =========================================================
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// =========================================================
// SISTEMA DE ALERTAS
// =========================================================
function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alertContainer');
    if (!alertContainer) return;

    // Limpiar alertas anteriores
    alertContainer.innerHTML = '';

    const alert = document.createElement('div');
    alert.className = `alert ${type}`;
    alert.textContent = message;

    alertContainer.appendChild(alert);

    // Auto-remover después de 5 segundos
    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
        }
    }, 5000);
}

// =========================================================
// UTILIDADES UI
// =========================================================
function setButtonLoading(button, isLoading) {
    if (isLoading) {
        button.disabled = true;
        button.style.opacity = '0.7';
        button.textContent = 'Cargando...';
    } else {
        button.disabled = false;
        button.style.opacity = '1';
        // Restaurar texto original
        if (button.classList.contains('btn-login')) {
            button.textContent = 'INICIAR SESIÓN';
        } else {
            button.textContent = 'CREAR CUENTA';
        }
    }
}

// =========================================================
// UTILIDADES GENERALES
// =========================================================
function generateUserId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function getFirstName(fullName) {
    if (!fullName) return 'Usuario';
    return fullName.split(' ')[0];
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// =========================================================
// API PÚBLICA PARA OTRAS PÁGINAS
// =========================================================
window.AuthSystem = {
    // Verificar si hay usuario logueado
    getCurrentUser: function() {
        return loadCurrentUserFromStorage();
    },
    
    // Cerrar sesión
    logout: function() {
        localStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.CURRENT_USER);
        window.location.href = 'login.html';
    },
    
    // Verificar si es admin
    isAdmin: function() {
        const user = loadCurrentUserFromStorage();
        return user && user.role === 'admin';
    },
    
    // Verificar si es cliente
    isCliente: function() {
        const user = loadCurrentUserFromStorage();
        return user && user.role === 'cliente';
    },
    
    // Requerir login (usar en otras páginas)
    requireAuth: function(allowedRoles = []) {
        const user = loadCurrentUserFromStorage();
        
        if (!user) {
            alert('Debes iniciar sesión para acceder a esta página');
            window.location.href = 'login.html';
            return false;
        }
        
        if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
            alert('No tienes permisos para acceder a esta página');
            window.location.href = 'index.html';
            return false;
        }
        
        return true;
    }
};

// =========================================================
// DEBUG (SOLO PARA DESARROLLO)
// =========================================================
window.AuthDebug = {
    getAllUsers: () => users,
    getCurrentUser: () => loadCurrentUserFromStorage(),
    clearAllData: () => {
        localStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.USERS);
        localStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.CURRENT_USER);
        location.reload();
    },
    loginAs: (email) => {
        const user = users.find(u => u.email === email);
        if (user) {
            localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
            location.reload();
        }
    }
};

console.log('🔐 Sistema de autenticación cargado');
console.log('💡 Usa AuthDebug en consola para debug');
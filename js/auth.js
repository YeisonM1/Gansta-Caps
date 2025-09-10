/* =========================================================
   AUTH.JS - SISTEMA DE AUTENTICACIÓN GANSTA CAPS
   Versión mejorada con seguridad y usuarios demo fijos
   ========================================================= */

// =========================================================
// CONFIGURACIÓN
// =========================================================
const AUTH_CONFIG = {
    STORAGE_KEYS: {
        USERS: 'gansta_caps_users',
        CURRENT_USER: 'gansta_caps_current_user'
    },
    // Usuarios demo que SIEMPRE existirán
    DEMO_ACCOUNTS: [
        {
            id: 'demo_admin_2025',
            name: 'Administrador Demo',
            email: 'admin@ganstacaps.com',
            password: 'GanstaAdmin2025!',
            role: 'admin',
            createdAt: '2025-01-01T00:00:00.000Z',
            lastLogin: null,
            isDemo: true
        },
        {
            id: 'demo_cliente_2025',
            name: 'Cliente Demo',
            email: 'cliente@ganstacaps.com',
            password: 'GanstaCliente2025!',
            role: 'cliente',
            createdAt: '2025-01-01T00:00:00.000Z',
            lastLogin: null,
            isDemo: true
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
    console.log('🔐 Inicializando sistema de autenticación...');
    
    // IMPORTANTE: Resetear sistema si es necesario
    resetSystemIfNeeded();
    
    initializeAuth();
    setupEventListeners();
    loadDemoAccounts();
    showDemoCredentials();
});

function resetSystemIfNeeded() {
    // Si quieres limpiar TODO el sistema, descomenta estas líneas:
    // localStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.USERS);
    // localStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.CURRENT_USER);
    // console.log('🗑️ Sistema resetado completamente');
}

function initializeAuth() {
    loadUsersFromStorage();
    console.log('✅ Sistema de autenticación inicializado');
}

// =========================================================
// MOSTRAR CREDENCIALES DEMO (SOLO PARA DESARROLLO)
// =========================================================
function showDemoCredentials() {
    // Mostrar info de cuentas demo en consola
    console.log('🎓 CUENTAS DEMO DISPONIBLES:');
    console.log('👨‍💼 ADMIN: admin@ganstacaps.com / GanstaAdmin2025!');
    console.log('🛒 CLIENTE: cliente@ganstacaps.com / GanstaCliente2025!');
    
    // Opcional: Mostrar en la interfaz (solo para desarrollo)
    const alertContainer = document.getElementById('alertContainer');
    if (alertContainer && window.location.hostname === 'localhost') {
        const demoInfo = document.createElement('div');
        demoInfo.className = 'alert info';
        demoInfo.innerHTML = `
            <strong>🎓 Cuentas de prueba disponibles:</strong><br>
            <small>👨‍💼 Admin: admin@ganstacaps.com / GanstaAdmin2025!</small><br>
            <small>🛒 Cliente: cliente@ganstacaps.com / GanstaCliente2025!</small>
        `;
        alertContainer.appendChild(demoInfo);
        
        // Auto-remover después de 10 segundos
        setTimeout(() => demoInfo.remove(), 10000);
    }
}

// =========================================================
// EVENT LISTENERS
// =========================================================
function setupEventListeners() {
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
        showAlert('❌ Por favor completa todos los campos', 'error');
        return;
    }

    if (!isValidEmail(email)) {
        showAlert('❌ Por favor ingresa un email válido', 'error');
        return;
    }

    // Mostrar estado de carga
    setButtonLoading(submitBtn, true);

    try {
        // Simular delay de red para UX
        await delay(800);

        // Buscar usuario (incluyendo demos)
        const user = users.find(u => 
            u.email.toLowerCase() === email.toLowerCase() && 
            u.password === password
        );

        if (user) {
            await loginSuccess(user);
        } else {
            showAlert('❌ Email o contraseña incorrectos', 'error');
            
            // Hint útil para desarrollo
            if (window.location.hostname === 'localhost') {
                setTimeout(() => {
                    showAlert('💡 Usa las cuentas demo mostradas arriba', 'info');
                }, 2000);
            }
        }
    } catch (error) {
        console.error('Error en login:', error);
        showAlert('❌ Error al iniciar sesión. Intenta nuevamente.', 'error');
    } finally {
        setButtonLoading(submitBtn, false);
    }
}

// =========================================================
// MANEJO DEL REGISTRO (SOLO CLIENTES)
// =========================================================
async function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const submitBtn = e.target.querySelector('.btn-auth');

    // Validaciones
    if (!name || !email || !password) {
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

    // Validar que no use emails reservados
    const reservedEmails = ['admin@ganstacaps.com', 'administrator@ganstacaps.com'];
    if (reservedEmails.includes(email.toLowerCase())) {
        showAlert('❌ Este email está reservado para el sistema', 'error');
        return;
    }

    // Mostrar estado de carga
    setButtonLoading(submitBtn, true);

    try {
        await delay(1000);

        // Crear nuevo usuario (SIEMPRE como cliente)
        const newUser = {
            id: generateUserId(),
            name: name,
            email: email.toLowerCase(),
            password: password,
            role: 'cliente', // ✅ SIEMPRE cliente
            createdAt: new Date().toISOString(),
            lastLogin: null,
            isDemo: false
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
async function loginSuccess(user) {
    // Actualizar último login
    user.lastLogin = new Date().toISOString();
    saveUsersToStorage();

    // Guardar sesión actual
    currentUser = user;
    saveCurrentUserToStorage();

    // Mostrar mensaje personalizado
    const firstName = getFirstName(user.name);
    const welcomeMessage = user.isDemo ? 
        `🎓 Bienvenido, ${firstName}! (Cuenta demo)` : 
        `🎉 ¡Bienvenido, ${firstName}!`;
    
    showAlert(welcomeMessage, 'success');

    // Log para desarrollo
    console.log('✅ Login exitoso:', {
        user: user.name,
        role: user.role,
        isDemo: user.isDemo || false
    });

    // Redirección después de 2 segundos
    setTimeout(() => {
        const redirectUrl = localStorage.getItem('gansta_caps_redirect_after_login');
        
        if (redirectUrl) {
            localStorage.removeItem('gansta_caps_redirect_after_login');
            window.location.href = redirectUrl;
        } else {
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
            window.location.href = 'admin.html';
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
        console.log(`📊 Cargados ${users.length} usuarios del storage`);
    } catch (error) {
        console.error('Error cargando usuarios:', error);
        users = [];
    }
}

function saveUsersToStorage() {
    try {
        localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.USERS, JSON.stringify(users));
        console.log(`💾 Guardados ${users.length} usuarios en storage`);
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
// CARGAR CUENTAS DEMO (FORZAR CREACIÓN)
// =========================================================
function loadDemoAccounts() {
    let demoAccountsCreated = 0;
    
    AUTH_CONFIG.DEMO_ACCOUNTS.forEach(demoAccount => {
        const existingUser = users.find(u => u.email === demoAccount.email);
        
        if (!existingUser) {
            // Crear cuenta demo
            users.push({ ...demoAccount });
            demoAccountsCreated++;
        } else if (existingUser.password !== demoAccount.password) {
            // Actualizar contraseña si cambió
            existingUser.password = demoAccount.password;
            existingUser.isDemo = true;
            console.log(`🔄 Actualizada cuenta demo: ${existingUser.email}`);
        }
    });
    
    if (demoAccountsCreated > 0) {
        console.log(`✨ Creadas ${demoAccountsCreated} cuentas demo`);
    }
    
    saveUsersToStorage();
    console.log(`🎯 Total usuarios en sistema: ${users.length}`);
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
    alert.innerHTML = message; // Usar innerHTML para permitir HTML simple

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
    getCurrentUser: function() {
        return loadCurrentUserFromStorage();
    },
    
    logout: function() {
        localStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.CURRENT_USER);
        window.location.href = 'login.html';
    },
    
    isAdmin: function() {
        const user = loadCurrentUserFromStorage();
        return user && user.role === 'admin';
    },
    
    isCliente: function() {
        const user = loadCurrentUserFromStorage();
        return user && user.role === 'cliente';
    },
    
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
    },
    
    // Nueva función para crear admin (solo desde consola)
    createAdmin: function(name, email, password) {
        if (typeof window === 'undefined' || window.location.hostname !== 'localhost') {
            console.error('❌ Solo disponible en desarrollo');
            return false;
        }
        
        const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (existingUser) {
            console.error('❌ Email ya existe');
            return false;
        }
        
        const newAdmin = {
            id: generateUserId(),
            name: name,
            email: email.toLowerCase(),
            password: password,
            role: 'admin',
            createdAt: new Date().toISOString(),
            lastLogin: null,
            isDemo: false
        };
        
        users.push(newAdmin);
        saveUsersToStorage();
        console.log('✅ Admin creado:', email);
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
        if (confirm('⚠️ ¿Estás seguro? Esto borrará TODOS los datos.')) {
            localStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.USERS);
            localStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.CURRENT_USER);
            location.reload();
        }
    },
    
    resetToDemo: () => {
        localStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.USERS);
        localStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.CURRENT_USER);
        console.log('🔄 Sistema resetado a cuentas demo únicamente');
        location.reload();
    },
    
    loginAs: (email) => {
        const user = users.find(u => u.email === email);
        if (user) {
            localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
            console.log('✅ Logueado como:', email);
            location.reload();
        } else {
            console.error('❌ Usuario no encontrado');
        }
    },
    
    showStats: () => {
        console.log('📊 ESTADÍSTICAS DEL SISTEMA:');
        console.log('Total usuarios:', users.length);
        console.log('Admins:', users.filter(u => u.role === 'admin').length);
        console.log('Clientes:', users.filter(u => u.role === 'cliente').length);
        console.log('Cuentas demo:', users.filter(u => u.isDemo).length);
    }
};

console.log('🔐 Sistema de autenticación cargado');
console.log('💡 Usa AuthDebug en consola para debug');
console.log('🎓 Credenciales demo en consola ↑');
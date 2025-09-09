/* =========================================================
   PAGE-PROTECTION.JS - PROTECCIÓN SIMPLE DE PÁGINAS
   ========================================================= */

// Configurar qué páginas necesitan protección
const PROTECTED_PAGES = {
    // Páginas que requieren login (cualquier usuario)
    LOGIN_REQUIRED: ['perfil.html', 'mis-pedidos.html'],
    
    // Páginas solo para administradores
    ADMIN_ONLY: ['admin.html']
};

// Ejecutar protección cuando carga la página
document.addEventListener('DOMContentLoaded', function() {
    protectCurrentPage();
});

function protectCurrentPage() {
    const currentPage = getCurrentPageName();
    const currentUser = getCurrentUser();
    
    console.log('🔒 Verificando página:', currentPage);
    console.log('👤 Usuario actual:', currentUser ? currentUser.name : 'Sin login');
    
    // Verificar si la página requiere login
    if (PROTECTED_PAGES.LOGIN_REQUIRED.includes(currentPage)) {
        if (!currentUser) {
            showAccessDenied(
                'Debes iniciar sesión para acceder a esta página',
                () => redirectToLogin()
            );
            return;
        }
    }
    
    // Verificar si la página es solo para admin
    if (PROTECTED_PAGES.ADMIN_ONLY.includes(currentPage)) {
        if (!currentUser) {
            showAccessDenied(
                'Debes iniciar sesión como administrador',
                () => redirectToLogin()
            );
            return;
        }
        
        if (currentUser.role !== 'admin') {
            showAccessDenied(
                'Solo los administradores pueden acceder a esta página',
                () => window.location.href = 'index.html'
            );
            return;
        }
    }
    
    console.log('✅ Acceso autorizado');
}

function getCurrentPageName() {
    const path = window.location.pathname;
    return path.split('/').pop() || 'index.html';
}

function getCurrentUser() {
    // Intentar obtener de AuthSystem
    if (typeof window.AuthSystem !== 'undefined') {
        return window.AuthSystem.getCurrentUser();
    }
    
    // Fallback a localStorage
    try {
        const stored = localStorage.getItem('gansta_caps_current_user');
        return stored ? JSON.parse(stored) : null;
    } catch (error) {
        return null;
    }
}

function redirectToLogin() {
    // Guardar dónde quería ir para redirigir después
    localStorage.setItem('gansta_caps_redirect_after_login', window.location.href);
    window.location.href = 'login.html';
}

function showAccessDenied(message, onClose) {
    // Crear modal simple
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Montserrat', sans-serif;
    `;
    
    modal.innerHTML = `
        <div style="
            background: white;
            padding: 3rem;
            border-radius: 15px;
            max-width: 400px;
            width: 90%;
            text-align: center;
            box-shadow: 0 25px 50px rgba(0,0,0,0.3);
        ">
            <div style="
                font-size: 4rem;
                margin-bottom: 1rem;
            ">🔒</div>
            
            <h2 style="
                color: #0D0B09;
                margin-bottom: 1rem;
                font-size: 2rem;
            ">Acceso Restringido</h2>
            
            <p style="
                color: #666;
                margin-bottom: 2rem;
                line-height: 1.5;
            ">${message}</p>
            
            <button onclick="this.parentElement.parentElement.remove(); (${onClose})();" style="
                background: linear-gradient(135deg, #FACC15, #F59E0B);
                color: #0D0B09;
                border: none;
                padding: 1rem 2rem;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                font-size: 1.4rem;
            ">Entendido</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
}

console.log('🛡️ Sistema de protección cargado');
/* =========================================================
   HEADER-AUTH.JS - HEADER INTELIGENTE CON AUTENTICACIÓN
   Versión corregida: elimina botón acceso y muestra inicial correcta
   ========================================================= */

// =========================================================
// INICIALIZACIÓN
// =========================================================
document.addEventListener('DOMContentLoaded', function() {
    // Delay pequeño para asegurar que AuthSystem esté cargado
    setTimeout(updateHeaderAuth, 100);
    setupLogoutListeners();
});

// =========================================================
// ACTUALIZAR HEADER SEGÚN ESTADO DE AUTENTICACIÓN
// =========================================================
function updateHeaderAuth() {
    // Verificar si estamos en la página de login
    if (window.location.pathname.includes('login.html')) {
        return; // No hacer nada en la página de login
    }

    console.log('🔄 Actualizando header auth...');

    // Verificar si existe el sistema de auth
    const currentUser = typeof window.AuthSystem !== 'undefined' ? 
        window.AuthSystem.getCurrentUser() : null;

    console.log('👤 Usuario actual:', currentUser);

    const navigation = document.querySelector('.navegacion-desktop');
    if (!navigation) {
        console.log('❌ No se encontró navegación desktop');
        return;
    }

    // LIMPIAR TODOS los elementos de auth existentes
    cleanupAuthElements(navigation);

    if (currentUser) {
        // Usuario logueado - mostrar perfil
        console.log('✅ Mostrando perfil de usuario');
        showUserProfile(navigation, currentUser);
    } else {
        // Usuario no logueado - mostrar botón acceso
        console.log('🔐 Mostrando botón de acceso');
        showAccessButton(navigation);
    }
}

// =========================================================
// LIMPIAR ELEMENTOS DE AUTH EXISTENTES
// =========================================================
function cleanupAuthElements(navigation) {
    // Buscar y eliminar TODOS los elementos de auth posibles
    const authSelectors = [
        '.auth-access-btn',
        '.user-profile-btn',
        'a[href="login.html"]', // El botón acceso original
        '.auth-element' // Clase genérica por si acaso
    ];

    authSelectors.forEach(selector => {
        const elements = navigation.querySelectorAll(selector);
        elements.forEach(element => {
            // Verificar que no sea un icono social
            if (!element.closest('.iconos') && !element.closest('.iconos-footer')) {
                console.log('🗑️ Eliminando elemento:', selector);
                element.remove();
            }
        });
    });

    // También buscar elementos con el texto "Acceso"
    const allLinks = navigation.querySelectorAll('a');
    allLinks.forEach(link => {
        if (link.textContent.trim() === 'Acceso' && link.href && link.href.includes('login.html')) {
            if (!link.closest('.iconos') && !link.closest('.iconos-footer')) {
                console.log('🗑️ Eliminando botón Acceso encontrado');
                link.remove();
            }
        }
    });
}

// =========================================================
// MOSTRAR BOTÓN DE ACCESO
// =========================================================
function showAccessButton(navigation) {
    const accessBtn = document.createElement('a');
    accessBtn.href = 'login.html';
    accessBtn.className = 'auth-access-btn auth-element';
    accessBtn.textContent = 'Acceso';
    accessBtn.style.cssText = `
        border: 1px solid rgba(250, 204, 21, 0.6);
        color: #FACC15;
        padding: 0.8rem 1.2rem;
        border-radius: 8px;
        font-weight: 500;
        text-decoration: none;
        margin-left: 1rem;
        transition: all 0.3s ease;
        font-size: 1.4rem;
    `;

    // Efectos hover
    accessBtn.addEventListener('mouseenter', function() {
        this.style.background = 'rgba(250, 204, 21, 0.1)';
        this.style.borderColor = '#FACC15';
    });

    accessBtn.addEventListener('mouseleave', function() {
        this.style.background = 'transparent';
        this.style.borderColor = 'rgba(250, 204, 21, 0.6)';
    });

    // Agregar al final de la navegación, antes de los iconos sociales
    const iconos = navigation.querySelector('.iconos');
    if (iconos) {
        navigation.insertBefore(accessBtn, iconos);
    } else {
        navigation.appendChild(accessBtn);
    }

    console.log('✅ Botón acceso agregado');
}

// =========================================================
// MOSTRAR PERFIL DE USUARIO
// =========================================================
function showUserProfile(navigation, user) {
    const firstName = getFirstName(user.name);
    const userInitial = firstName.charAt(0).toUpperCase();
    const isAdmin = user.role === 'admin';

    console.log('👤 Creando perfil para:', firstName, 'Inicial:', userInitial);

    const userProfile = document.createElement('div');
    userProfile.className = 'user-profile-btn auth-element';
    userProfile.style.cssText = `
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-left: 1rem;
        position: relative;
    `;

    userProfile.innerHTML = `
        <div class="user-info-display" style="
            display: flex;
            align-items: center;
            gap: 0.8rem;
            background: rgba(250, 204, 21, 0.1);
            border: 1px solid rgba(250, 204, 21, 0.3);
            border-radius: 20px;
            padding: 0.6rem 1.2rem;
            cursor: pointer;
            transition: all 0.3s ease;
            color: white;
            font-size: 1.4rem;
            font-weight: 500;
        ">
            <div class="user-avatar" style="
                width: 28px;
                height: 28px;
                background: linear-gradient(135deg, #FACC15, #F59E0B);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 700;
                color: #0D0B09;
                font-size: 1.3rem;
                font-family: var(--fuente-titulos);
            ">
                ${userInitial}
            </div>
            <span class="user-name">${firstName}</span>
            ${isAdmin ? '<span style="background: #ef4444; color: white; padding: 0.2rem 0.6rem; border-radius: 10px; font-size: 1rem; margin-left: 0.4rem;">ADMIN</span>' : ''}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="transition: transform 0.3s ease;">
                <polyline points="6,9 12,15 18,9"></polyline>
            </svg>
        </div>

        <div class="user-dropdown" style="
            position: absolute;
            top: calc(100% + 8px);
            right: 0;
            background: #111;
            border-radius: 12px;
            padding: 0.8rem 0;
            min-width: 200px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
            opacity: 0;
            pointer-events: none;
            transform: translateY(-10px);
            transition: all 0.3s ease;
            z-index: 1000;
        ">
            <div style="padding: 1rem 1.5rem; border-bottom: 1px solid rgba(255, 255, 255, 0.1); margin-bottom: 0.5rem;">
                <div style="color: white; font-weight: 600; font-size: 1.4rem;">${user.name}</div>
                <div style="color: #FACC15; font-size: 1.2rem; text-transform: capitalize;">${user.role}</div>
            </div>
            
            <a href="perfil.html" class="dropdown-item" style="
                display: block;
                padding: 0.8rem 1.5rem;
                color: rgba(255, 255, 255, 0.9);
                text-decoration: none;
                font-size: 1.3rem;
                transition: all 0.3s ease;
            ">
                👤 Mi Perfil
            </a>
            
            <a href="catalogo.html" class="dropdown-item" style="
                display: block;
                padding: 0.8rem 1.5rem;
                color: rgba(255, 255, 255, 0.9);
                text-decoration: none;
                font-size: 1.3rem;
                transition: all 0.3s ease;
            ">
                🛒 Catálogo
            </a>
            
            ${isAdmin ? `
            <a href="admin.html" class="dropdown-item" style="
                display: block;
                padding: 0.8rem 1.5rem;
                color: rgba(255, 255, 255, 0.9);
                text-decoration: none;
                font-size: 1.3rem;
                transition: all 0.3s ease;
            ">
                👨‍💼 Panel Admin
            </a>
            ` : ''}
            
            <div style="height: 1px; background: rgba(255, 255, 255, 0.1); margin: 0.5rem 1rem;"></div>
            
            <button class="logout-btn" style="
                display: block;
                width: 100%;
                padding: 0.8rem 1.5rem;
                background: none;
                border: none;
                color: #ef4444;
                text-align: left;
                font-size: 1.3rem;
                cursor: pointer;
                transition: all 0.3s ease;
                font-family: inherit;
            ">
                🚪 Cerrar Sesión
            </button>
        </div>
    `;

    // Eventos del dropdown
    const userInfo = userProfile.querySelector('.user-info-display');
    const dropdown = userProfile.querySelector('.user-dropdown');
    const chevron = userProfile.querySelector('svg');
    let isOpen = false;

    // Toggle dropdown
    userInfo.addEventListener('click', function(e) {
        e.stopPropagation();
        isOpen = !isOpen;
        
        if (isOpen) {
            dropdown.style.opacity = '1';
            dropdown.style.pointerEvents = 'auto';
            dropdown.style.transform = 'translateY(0)';
            chevron.style.transform = 'rotate(180deg)';
            userInfo.style.background = 'rgba(250, 204, 21, 0.2)';
        } else {
            dropdown.style.opacity = '0';
            dropdown.style.pointerEvents = 'none';
            dropdown.style.transform = 'translateY(-10px)';
            chevron.style.transform = 'rotate(0deg)';
            userInfo.style.background = 'rgba(250, 204, 21, 0.1)';
        }
    });

    // Cerrar al hacer click fuera
    document.addEventListener('click', function() {
        if (isOpen) {
            isOpen = false;
            dropdown.style.opacity = '0';
            dropdown.style.pointerEvents = 'none';
            dropdown.style.transform = 'translateY(-10px)';
            chevron.style.transform = 'rotate(0deg)';
            userInfo.style.background = 'rgba(250, 204, 21, 0.1)';
        }
    });

    // Hover effects para dropdown items
    const dropdownItems = userProfile.querySelectorAll('.dropdown-item, .logout-btn');
    dropdownItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.background = 'rgba(255, 255, 255, 0.1)';
            this.style.color = '#FACC15';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.background = 'transparent';
            this.style.color = this.classList.contains('logout-btn') ? '#ef4444' : 'rgba(255, 255, 255, 0.9)';
        });
    });

    // Hover effect para el perfil principal
    userInfo.addEventListener('mouseenter', function() {
        if (!isOpen) {
            this.style.background = 'rgba(250, 204, 21, 0.15)';
            this.style.borderColor = 'rgba(250, 204, 21, 0.5)';
        }
    });

    userInfo.addEventListener('mouseleave', function() {
        if (!isOpen) {
            this.style.background = 'rgba(250, 204, 21, 0.1)';
            this.style.borderColor = 'rgba(250, 204, 21, 0.3)';
        }
    });

    // Agregar al final de la navegación, antes de los iconos sociales
    const iconos = navigation.querySelector('.iconos');
    if (iconos) {
        navigation.insertBefore(userProfile, iconos);
    } else {
        navigation.appendChild(userProfile);
    }

    console.log('✅ Perfil de usuario agregado con inicial:', userInitial);
}

// =========================================================
// CONFIGURAR LOGOUT
// =========================================================
function setupLogoutListeners() {
    // Delegación de eventos para el botón de logout
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('logout-btn')) {
            handleLogout();
        }
    });
}

function handleLogout() {
    const confirmLogout = confirm('¿Estás seguro de que quieres cerrar sesión?');
    
    if (confirmLogout) {
        if (typeof window.AuthSystem !== 'undefined') {
            window.AuthSystem.logout();
        } else {
            localStorage.removeItem('gansta_caps_current_user');
            window.location.href = 'login.html';
        }
    }
}

// =========================================================
// UTILIDADES
// =========================================================
function getFirstName(fullName) {
    if (!fullName) return 'Usuario';
    return fullName.trim().split(' ')[0];
}

// =========================================================
// API PÚBLICA
// =========================================================
window.HeaderAuth = {
    update: updateHeaderAuth,
    forceUpdate: function() {
        console.log('🔄 Forzando actualización del header...');
        setTimeout(updateHeaderAuth, 50);
    }
};

// =========================================================
// ACTUALIZAR CUANDO CAMBIE EL ESTADO
// =========================================================
window.addEventListener('storage', function(e) {
    if (e.key === 'gansta_caps_current_user') {
        console.log('📡 Detectado cambio en storage, actualizando header...');
        setTimeout(updateHeaderAuth, 100);
    }
});

// Actualizar al cambiar de página
window.addEventListener('pageshow', function() {
    console.log('📄 Página mostrada, actualizando header...');
    setTimeout(updateHeaderAuth, 100);
});

console.log('🎯 Header Auth cargado correctamente');
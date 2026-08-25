import { API } from "./api.js";
import { CONFIG } from "./config.js";
import { APP, Store } from "./store.js";

function checkAuth() {
    const token = localStorage.getItem(CONFIG.TOKEN_KEY);
    const userJson = localStorage.getItem(CONFIG.USER_KEY);
    
    if (token && userJson) {
        try {
            const user = JSON.parse(userJson);
            APP.token = token;
            APP.user = user;
            showDashboard(user.rol);
        } catch (e) {
            logout();
        }
    } else {
        showScreen('login-screen');
    }
}


async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember').checked;
    
    const errorDiv = document.getElementById('login-error');
    const btnText = document.querySelector('#login-form .btn-text');
    const btnLoading = document.querySelector('#login-form .btn-loading');
    
    errorDiv.style.display = 'none';
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline';
    
    try {
        const response = await API.login(email, password);
        
        // Guardar datos
        APP.token = response.access_token;
        APP.user = response.user;
        
        localStorage.setItem(CONFIG.TOKEN_KEY, response.access_token);
        localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(response.user));
        
        if (remember) {
            localStorage.setItem(CONFIG.REMEMBER_KEY, 'true');
        }
        
        // Mostrar dashboard según rol
        showDashboard(response.user.rol);

        // Iniciar notificaciones push y auto-refresh
        if (typeof iniciarNotificaciones === 'function') {
            iniciarNotificaciones(response.user);
        }
        
    } catch (error) {
        errorDiv.textContent = error.message || 'Credenciales inválidas';
        errorDiv.style.display = 'block';
    } finally {
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
    }
}


async function logout(options = {}) {
    const { revoke = true } = options;
    const token = localStorage.getItem(CONFIG.TOKEN_KEY);

    if (revoke && token) {
        try {
            await API.logout();
        } catch (error) {
            console.warn('No se pudo revocar token en backend:', error);
        }
    }

    APP.token = null;
    APP.user = null;
    clearAdminAutoRefresh();
    
    localStorage.removeItem(CONFIG.TOKEN_KEY);
    localStorage.removeItem(CONFIG.USER_KEY);
    localStorage.removeItem(CONFIG.REMEMBER_KEY);
    
    // Detener push y notificaciones
    if (typeof detenerNotificaciones === 'function') {
        detenerNotificaciones();
    }
    
    showScreen('login-screen');
    document.getElementById('login-form').reset();
}


function forceLogoutByExpiredSession() {
    logout({ revoke: false });
}

window.forceLogoutByExpiredSession = forceLogoutByExpiredSession;

// ============ NAVEGACIÓN ============



export { checkAuth, handleLogin, logout, forceLogoutByExpiredSession };
window.checkAuth = checkAuth;
window.handleLogin = handleLogin;
window.logout = logout;
window.forceLogoutByExpiredSession = forceLogoutByExpiredSession;

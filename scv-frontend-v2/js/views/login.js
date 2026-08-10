import { API, auth } from '../api.js';
import { ICONS, showToast } from '../ui.js';

export function renderLoginView() {
    return `
        <div class="login-body-wrapper">
            <div class="login-wrapper">
                <!-- BANNER IZQUIERDO -->
                <div class="login-banner">
                    <div class="banner-content">
                        <div class="kicker">Centro de operaciones</div>
                        <h1 class="banner-title">Control Vehicular para Jornada Industrial</h1>
                        <p class="banner-desc">Monitoreo de patio, auditoría técnica de flota y control de mantenimientos en tiempo real.</p>
                        
                        <div class="banner-markers">
                            <div class="marker">Despacho</div>
                            <div class="marker">Chequeo</div>
                            <div class="marker">Turnos</div>
                        </div>
                    </div>
                </div>

                <!-- FORMULARIO DERECHO -->
                <div class="login-form-container">
                    <div class="login-brand">
                        <div class="brand-icon">
                            ${ICONS.shield}
                        </div>
                        <div class="brand-text">SCV<br><span style="font-size: 0.85rem; font-weight: 500; color: #6b7280;">TransLogix</span></div>
                    </div>

                    <div class="login-header">
                        <h2>Iniciar Sesión</h2>
                        <p>Ingrese sus credenciales operativas</p>
                    </div>

                    <form id="login-form" autocomplete="on">
                        <div class="form-group">
                            <label class="form-label" for="login-username">Usuario o Correo</label>
                            <div class="input-wrapper">
                                <span class="input-icon">
                                    <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                </span>
                                <input type="text" id="login-username" class="form-input" placeholder="ej. sebas o usuario@translogix.com" required autocomplete="username" autofocus>
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="login-password">Contraseña</label>
                            <div class="input-wrapper">
                                <span class="input-icon">
                                    <svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                </span>
                                <input type="password" id="login-password" class="form-input" placeholder="••••••••" required autocomplete="current-password">
                            </div>
                        </div>

                        <button type="submit" id="btn-login-submit" class="btn-submit">
                            <span>Ingresar a SCV</span>
                            ${ICONS.arrowLeft ? `<svg viewBox="0 0 24 24" style="transform: rotate(180deg);"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>` : ''}
                        </button>

                        <div id="login-error" class="login-feedback"></div>
                    </form>
                </div>
            </div>
        </div>
    `;
}

export function initLoginView(onSuccess) {
    const form = document.getElementById('login-form');
    const userInput = document.getElementById('login-username');
    const passInput = document.getElementById('login-password');
    const errorBox = document.getElementById('login-error');
    const submitBtn = document.getElementById('btn-login-submit');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = userInput.value.trim();
        const password = passInput.value;

        if (!username || !password) {
            errorBox.textContent = 'Por favor ingrese su usuario y contraseña.';
            errorBox.style.display = 'block';
            return;
        }

        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>Validando credenciales...</span>`;
        errorBox.style.display = 'none';

        try {
            const data = await API.auth.login(username, password);
            auth.setSession(data.access_token, data.user);
            showToast(`¡Bienvenido, ${data.user.nombre || data.user.email}!`, 'success');
            if (onSuccess) onSuccess(data.user);
        } catch (err) {
            errorBox.textContent = err.message || 'Credenciales inválidas. Intente nuevamente.';
            errorBox.style.display = 'block';
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `
                <span>Ingresar a SCV</span>
                <svg viewBox="0 0 24 24" style="transform: rotate(180deg); width:20px; height:20px;"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            `;
        }
    });
}

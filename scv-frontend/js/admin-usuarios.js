function setUsuariosFeedback(message, isError = false) {
    const feedback = document.getElementById('usuarios-feedback');
    if (!feedback) return;

    feedback.textContent = message;
    feedback.classList.toggle('is-error', isError);
}

function rolLabel(rol) {
    if (rol === 'admin') return 'Admin';
    if (rol === 'operario_movimientos') return 'Operario Movimientos';
    if (rol === 'operario_chequeo') return 'Operario Chequeo';
    return rol || 'Sin rol';
}

function resetUsuariosFilters() {
    APP.admin.usuariosFilters = {
        query: '',
        estado: 'todos',
        rol: 'todos',
        orden: 'nombre_asc',
        emailDomain: ''
    };

    const usuariosSearch = document.getElementById('usuarios-search');
    const usuariosEstado = document.getElementById('usuarios-estado');
    const usuariosRol = document.getElementById('usuarios-rol');
    const usuariosOrden = document.getElementById('usuarios-orden');
    const usuariosEmailDomain = document.getElementById('usuarios-email-domain');

    if (usuariosSearch) usuariosSearch.value = '';
    if (usuariosEstado) usuariosEstado.value = 'todos';
    if (usuariosRol) usuariosRol.value = 'todos';
    if (usuariosOrden) usuariosOrden.value = 'nombre_asc';
    if (usuariosEmailDomain) usuariosEmailDomain.value = '';

    renderUsuariosList();
}

async function loadUsuariosManagement() {
    try {
        setUsuariosFeedback('Cargando usuarios...');
        APP.admin.usuarios = await API.getUsuarios();
        renderUsuariosList();
        setUsuariosFeedback(`${APP.admin.usuarios.length} usuarios cargados.`);
    } catch (error) {
        setUsuariosFeedback(error.message || 'No se pudo cargar la lista de usuarios.', true);
    }
}

function getFilteredUsuarios(usuarios) {
    const filters = APP.admin.usuariosFilters;
    const query = normalizeText(filters.query).trim();
    const emailDomain = normalizeText(filters.emailDomain).replace(/^@/, '').trim();

    const filtered = usuarios.filter((usuario) => {
        const estadoMatch =
            filters.estado === 'todos'
            || (filters.estado === 'activos' && usuario.activo)
            || (filters.estado === 'inactivos' && !usuario.activo);

        const rolMatch = filters.rol === 'todos' || usuario.rol === filters.rol;

        const emailDomainMatch =
            !emailDomain
            || normalizeText(usuario.email).endsWith(`@${emailDomain}`)
            || normalizeText(usuario.email).includes(emailDomain);

        if (!estadoMatch || !rolMatch || !emailDomainMatch) {
            return false;
        }

        if (!query) {
            return true;
        }

        const searchable = [
            usuario.nombre,
            usuario.email,
            usuario.rol,
            rolLabel(usuario.rol),
            usuario.activo ? 'activo' : 'inactivo'
        ]
            .map(normalizeText)
            .join(' ');

        return searchable.includes(query);
    });

    return filtered.sort((a, b) => {
        if (filters.orden === 'nombre_desc') {
            return normalizeText(b.nombre).localeCompare(normalizeText(a.nombre));
        }
        if (filters.orden === 'email_asc') {
            return normalizeText(a.email).localeCompare(normalizeText(b.email));
        }
        if (filters.orden === 'rol_asc') {
            const byRol = normalizeText(a.rol).localeCompare(normalizeText(b.rol));
            if (byRol !== 0) return byRol;
            return normalizeText(a.nombre).localeCompare(normalizeText(b.nombre));
        }

        return normalizeText(a.nombre).localeCompare(normalizeText(b.nombre));
    });
}

function updateUsuariosResults(visible, total) {
    const results = document.getElementById('usuarios-results');
    if (!results) return;

    results.textContent = `Mostrando ${visible} de ${total} usuarios.`;
}

function renderUsuariosList() {
    const container = document.getElementById('usuarios-list');
    if (!container) return;

    const filteredUsuarios = getFilteredUsuarios(APP.admin.usuarios);
    updateUsuariosResults(filteredUsuarios.length, APP.admin.usuarios.length);

    if (!APP.admin.usuarios.length) {
        container.innerHTML = '<p class="empty-message">No hay usuarios registrados.</p>';
        return;
    }

    if (!filteredUsuarios.length) {
        container.innerHTML = '<p class="empty-message">No hay resultados con los filtros actuales.</p>';
        return;
    }

    container.innerHTML = filteredUsuarios.map((usuario) => {
        const isSelf = APP.user?.id === usuario.id;
        return `
        <article class="management-item">
            <div class="management-item-main">
                <p class="management-item-title">${usuario.nombre}</p>
                <p class="management-item-subtitle">${usuario.email}</p>
                <p class="management-item-meta">Rol: ${rolLabel(usuario.rol)}</p>
            </div>
            <div class="management-item-actions">
                <span class="status-badge ${usuario.activo ? 'is-active' : 'is-inactive'}">${usuario.activo ? 'Activo' : 'Inactivo'}</span>
                <button type="button" class="btn-ghost btn-item" data-action="edit" data-id="${usuario.id}">Editar</button>
                <button type="button" class="btn-danger btn-item" data-action="deactivate" data-id="${usuario.id}" ${usuario.activo && !isSelf ? '' : 'disabled'}>${isSelf ? 'Tu sesión' : 'Desactivar'}</button>
            </div>
        </article>
    `;
    }).join('');
}

function openUsuarioForm(usuario = null) {
    const title = document.getElementById('usuario-form-title');
    const form = document.getElementById('usuario-form');
    const passwordInput = document.getElementById('usr-password');
    if (!title || !form || !passwordInput) return;

    APP.admin.editingUsuarioId = usuario?.id || null;
    title.textContent = usuario ? 'Editar usuario' : 'Nuevo usuario';

    form.reset();
    passwordInput.required = !usuario;
    passwordInput.placeholder = usuario ? 'Dejar vacío para conservar actual' : 'Mínimo 6 caracteres';

    if (usuario) {
        form.nombre.value = usuario.nombre || '';
        form.email.value = usuario.email || '';
        form.rol.value = usuario.rol || '';
    }

    toggleModal('usuario-modal', true);
    form.nombre.focus();
}

function closeUsuarioForm() {
    const form = document.getElementById('usuario-form');
    const passwordInput = document.getElementById('usr-password');
    APP.admin.editingUsuarioId = null;

    if (form) {
        form.reset();
    }
    if (passwordInput) {
        passwordInput.required = true;
        passwordInput.placeholder = 'Mínimo 6 caracteres';
    }

    toggleModal('usuario-modal', false);
}

async function handleUsuarioSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData);

    if (!payload.password) {
        delete payload.password;
    }

    try {
        if (APP.admin.editingUsuarioId) {
            await API.updateUsuario(APP.admin.editingUsuarioId, payload);
            setUsuariosFeedback('Usuario actualizado correctamente.');
        } else {
            await API.createUsuario(payload);
            setUsuariosFeedback('Usuario creado correctamente.');
        }

        closeUsuarioForm();
        await loadUsuariosManagement();
    } catch (error) {
        setUsuariosFeedback(error.message || 'No se pudo guardar el usuario.', true);
    }
}

async function handleUsuariosListClick(e) {
    const button = e.target.closest('button[data-action]');
    if (!button) return;

    const usuarioId = parseInt(button.dataset.id, 10);
    const usuario = APP.admin.usuarios.find((item) => item.id === usuarioId);

    if (!usuario) return;

    if (button.dataset.action === 'edit') {
        openUsuarioForm(usuario);
        return;
    }

    if (button.dataset.action === 'deactivate') {
        if (APP.user?.id === usuario.id) {
            await showAppAlert('Acción bloqueada', 'No puedes desactivar tu propio usuario.');
            return;
        }

        const confirmed = await showAppConfirm(
            'Desactivar usuario',
            `Se desactivará ${usuario.nombre}. El usuario no podrá volver a iniciar sesión.`
        );
        if (!confirmed) return;

        try {
            await API.deleteUsuario(usuarioId);
            setUsuariosFeedback(`Usuario ${usuario.nombre} desactivado.`);
            await loadUsuariosManagement();
        } catch (error) {
            setUsuariosFeedback(error.message || 'No se pudo desactivar el usuario.', true);
        }
    }
}

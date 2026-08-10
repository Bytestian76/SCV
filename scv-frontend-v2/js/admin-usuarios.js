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
        <tr>
            <td>
                <div class="cell-main">${usuario.nombre}</div>
                <div class="cell-sub">ID: ${usuario.id} | Rol: ${rolLabel(usuario.rol)}</div>
            </td>
            <td>
                <div style="color: var(--text-main);">${usuario.email}</div>
            </td>
            <td>
                <span class="badge ${usuario.activo ? 'badge-success' : 'badge-neutral'}">${usuario.activo ? 'ACTIVO' : 'INACTIVO'}</span>
            </td>
            <td>
                <div class="table-actions">
                    <button class="btn-icon" title="Ver Detalles" data-action="ver" data-id="${usuario.id}">
                        <svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    </button>
                    <button class="btn-icon" title="Editar" data-action="edit" data-id="${usuario.id}">
                        <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button class="btn-icon ${usuario.activo ? 'danger' : ''}" title="${usuario.activo ? 'Desactivar' : 'Activar'}" data-action="${usuario.activo ? 'deactivate' : 'activate'}" data-id="${usuario.id}" ${isSelf ? 'disabled' : ''}>
                        <svg viewBox="0 0 24 24"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>
                    </button>
                </div>
            </td>
        </tr>
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
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;

    const action = btn.dataset.action;
    const id = parseInt(btn.dataset.id, 10);
    const usuario = APP.admin.usuarios.find(u => u.id === id);

    if (!usuario) return;

    if (action === 'edit') {
        openUsuarioForm(usuario);
    } else if (action === 'deactivate') {
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
            await API.deleteUsuario(id);
            setUsuariosFeedback(`Usuario ${usuario.nombre} desactivado.`);
            await loadUsuariosManagement();
        } catch (error) {
            setUsuariosFeedback(error.message || 'No se pudo desactivar el usuario.', true);
        }
    } else if (action === 'activate') {
        const confirmed = await showAppConfirm(
            'Reactivar usuario',
            `${usuario.nombre} recuperará el acceso al sistema.`
        );
        if (!confirmed) return;

        try {
            await API.activateUsuario(id);
            setUsuariosFeedback(`Usuario ${usuario.nombre} reactivado.`);
            await loadUsuariosManagement();
        } catch (error) {
            setUsuariosFeedback(error.message || 'No se pudo reactivar el usuario.', true);
        }
    } else if (action === 'ver') {
        openUsuarioDetails(usuario);
    }
}

function openUsuarioDetails(usuario) {
    const modal = document.getElementById('usuario-detalle-modal');
    if (!modal) return;

    document.getElementById('detalle-usr-nombre').textContent = usuario.nombre;
    const estadoBadge = document.getElementById('detalle-usr-estado');
    estadoBadge.textContent = usuario.activo ? 'ACTIVO' : 'INACTIVO';
    estadoBadge.className = 'badge ' + (usuario.activo ? 'badge-success' : 'badge-neutral');

    document.getElementById('detalle-usr-email').textContent = usuario.email;
    document.getElementById('detalle-usr-rol').textContent = rolLabel(usuario.rol);
    document.getElementById('detalle-usr-id').textContent = usuario.id;

    toggleModal('usuario-detalle-modal', true);
}

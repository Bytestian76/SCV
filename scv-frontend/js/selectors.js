// ============ SELECTORES ============

async function loadSelectores() {
    resetSelectorPickers();
}

function scheduleSelectorSearch(key, query, callback) {
    if (APP.selectorSearchTimers[key]) {
        clearTimeout(APP.selectorSearchTimers[key]);
    }

    APP.selectorSearchTimers[key] = setTimeout(() => {
        callback(query);
    }, 220);
}

function getSelectorConfig() {
    return {
        'mov-vehiculo': {
            type: 'vehiculo',
            inputId: 'mov-vehiculo-search',
            hiddenId: 'vehiculo',
            resultsId: 'mov-vehiculo-results',
            selectedId: 'mov-vehiculo-selected',
            kilometrajeFieldId: 'kilometraje',
            soatFieldId: 'mov-soat',
            rtmFieldId: 'mov-rtm'
        },
        'mov-conductor': {
            type: 'conductor',
            inputId: 'mov-conductor-search',
            hiddenId: 'conductor',
            resultsId: 'mov-conductor-results',
            selectedId: 'mov-conductor-selected'
        },
        'ch-vehiculo': {
            type: 'vehiculo',
            inputId: 'ch-vehiculo-search',
            hiddenId: 'ch-vehiculo',
            resultsId: 'ch-vehiculo-results',
            selectedId: 'ch-vehiculo-selected',
            kilometrajeFieldId: 'ch-kilometraje',
            soatFieldId: 'ch-soat',
            rtmFieldId: 'ch-rtm'
        },
        'ch-conductor': {
            type: 'conductor',
            inputId: 'ch-conductor-search',
            hiddenId: 'ch-conductor',
            resultsId: 'ch-conductor-results',
            selectedId: 'ch-conductor-selected'
        },
        'mt-vehiculo': {
            type: 'vehiculo',
            inputId: 'mt-vehiculo-search',
            hiddenId: 'mt-vehiculo',
            resultsId: 'mt-vehiculo-results',
            selectedId: 'mt-vehiculo-selected'
        }
    };
}

function getSelectorLabel(type, item) {
    if (!item) return '';
    if (type === 'vehiculo') {
        return `${item.placa} · ${item.marca} ${item.modelo}`;
    }
    return `${item.nombre} · ${item.cedula}`;
}

function setSelectorSelectedText(selectorKey, text = '') {
    const config = getSelectorConfig()[selectorKey];
    const selectedEl = document.getElementById(config?.selectedId || '');
    if (!selectedEl) return;
    selectedEl.textContent = text || (config.type === 'vehiculo' ? 'Sin vehículo seleccionado.' : 'Sin conductor seleccionado.');
}

function hideAllSelectorResults() {
    document.querySelectorAll('.selector-results').forEach((resultsEl) => {
        resultsEl.classList.remove('is-open');
    });
}

function clearSelectorSelection(selectorKey, clearInput = false) {
    const config = getSelectorConfig()[selectorKey];
    if (!config) return;

    const hiddenInput = document.getElementById(config.hiddenId);
    const searchInput = document.getElementById(config.inputId);
    const resultsEl = document.getElementById(config.resultsId);

    if (hiddenInput) hiddenInput.value = '';
    if (searchInput && clearInput) searchInput.value = '';
    if (resultsEl) {
        resultsEl.innerHTML = '';
        resultsEl.classList.remove('is-open');
    }

    APP.selectorSelections[selectorKey] = null;
    APP.selectorOptions[selectorKey] = [];
    setSelectorSelectedText(selectorKey);

    if (config.type === 'vehiculo') {
        syncVehiculoFechasToFields(null, {
            kilometrajeFieldId: config.kilometrajeFieldId,
            soatFieldId: config.soatFieldId,
            rtmFieldId: config.rtmFieldId
        });
    }
}

function resetSelectorPickers() {
    const config = getSelectorConfig();
    Object.keys(config).forEach((selectorKey) => {
        clearSelectorSelection(selectorKey, true);
    });
}

function renderSelectorResults(selectorKey, items = []) {
    const config = getSelectorConfig()[selectorKey];
    if (!config) return;

    const resultsEl = document.getElementById(config.resultsId);
    if (!resultsEl) return;

    APP.selectorOptions[selectorKey] = items;

    if (!items.length) {
        resultsEl.innerHTML = '<div class="selector-empty">Sin resultados</div>';
        resultsEl.classList.add('is-open');
        return;
    }

    resultsEl.innerHTML = items.map((item) => {
        const title = config.type === 'vehiculo'
            ? `${item.placa} · ${item.marca} ${item.modelo}`
            : `${item.nombre}`;
        const subtitle = config.type === 'vehiculo'
            ? `Km: ${item.kilometraje ?? 0} · SOAT: ${item.fecha_venc_soat || 'N/R'} · RTM: ${item.fecha_venc_rtm || 'N/R'}`
            : `Cédula: ${item.cedula || 'N/R'}`;

        return `
            <button type="button" class="selector-result-item" data-selector-key="${selectorKey}" data-item-id="${item.id}">
                <span class="selector-result-title">${title}</span>
                <span class="selector-result-subtitle">${subtitle}</span>
            </button>
        `;
    }).join('');

    resultsEl.classList.add('is-open');
}

function selectSearchResult(selectorKey, itemId) {
    const config = getSelectorConfig()[selectorKey];
    if (!config) return;

    const item = (APP.selectorOptions[selectorKey] || []).find((option) => String(option.id) === String(itemId));
    if (!item) return;

    const hiddenInput = document.getElementById(config.hiddenId);
    const searchInput = document.getElementById(config.inputId);
    const resultsEl = document.getElementById(config.resultsId);

    if (hiddenInput) hiddenInput.value = String(item.id);
    if (searchInput) searchInput.value = getSelectorLabel(config.type, item);
    if (resultsEl) {
        resultsEl.innerHTML = '';
        resultsEl.classList.remove('is-open');
    }

    APP.selectorSelections[selectorKey] = item;
    setSelectorSelectedText(selectorKey, `Seleccionado: ${getSelectorLabel(config.type, item)}`);

    if (config.type === 'vehiculo') {
        syncVehiculoFechasToFields(item, {
            kilometrajeFieldId: config.kilometrajeFieldId,
            soatFieldId: config.soatFieldId,
            rtmFieldId: config.rtmFieldId
        });
    }
}

function handleSelectorResultClick(e) {
    const optionBtn = e.target.closest('.selector-result-item');
    if (!optionBtn) return;
    selectSearchResult(optionBtn.dataset.selectorKey, optionBtn.dataset.itemId);
}

function handleSelectorSearchKeydown(event, selectorKey) {
    if (event.key === 'Escape') {
        hideAllSelectorResults();
        return;
    }

    if (event.key !== 'Enter') {
        return;
    }

    const options = APP.selectorOptions[selectorKey] || [];
    if (!options.length) {
        return;
    }

    event.preventDefault();
    selectSearchResult(selectorKey, options[0].id);
}

async function loadVehiculosForSelect(selectId, search = '') {
    try {
        const MAP = { vehiculo: 'mov-vehiculo', 'ch-vehiculo': 'ch-vehiculo', 'mt-vehiculo': 'mt-vehiculo' };
        const selectorKey = MAP[selectId] || 'mov-vehiculo';
        const config = getSelectorConfig()[selectorKey];
        if (!config) return;

        const cleanSearch = (search || '').trim();
        const currentSelected = APP.selectorSelections[selectorKey] || null;
        const searchInput = document.getElementById(config.inputId);

        if (currentSelected && searchInput && searchInput.value !== getSelectorLabel(config.type, currentSelected)) {
            clearSelectorSelection(selectorKey, false);
        }

        const vehiculos = await API.getSelectorVehiculos(cleanSearch, 20);
        renderSelectorResults(selectorKey, vehiculos);
    } catch (error) {
        console.error('No se pudieron cargar vehiculos para selector:', error);
    }
}

async function loadConductoresForSelect(selectId, search = '') {
    try {
        const selectorKey = selectId === 'conductor' ? 'mov-conductor' : 'ch-conductor';
        const config = getSelectorConfig()[selectorKey];
        if (!config) return;

        const cleanSearch = (search || '').trim();
        const currentSelected = APP.selectorSelections[selectorKey] || null;
        const searchInput = document.getElementById(config.inputId);

        if (currentSelected && searchInput && searchInput.value !== getSelectorLabel(config.type, currentSelected)) {
            clearSelectorSelection(selectorKey, false);
        }

        const conductores = await API.getSelectorConductores(cleanSearch, 20);
        renderSelectorResults(selectorKey, conductores);
    } catch (error) {
        console.error('No se pudieron cargar conductores para selector:', error);
    }
}

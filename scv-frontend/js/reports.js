const PDF_LIBRARY_SOURCES = [
    'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js',
    'https://cdn.jsdelivr.net/npm/jspdf-autotable@3.8.2/dist/jspdf.plugin.autotable.min.js'
];

let pdfLibrariesPromise = null;

function getExportTimestamp() {
    const now = new Date();
    const year = String(now.getFullYear());
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    return `${year}${month}${day}_${hour}${minute}`;
}

function toExcelCellValue(value) {
    if (value === null || value === undefined) return '';
    if (typeof value === 'boolean') return value ? 'Si' : 'No';
    return String(value);
}

function xmlEscape(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function sanitizeSheetName(name) {
    return String(name || 'Reporte')
        .replace(/[\\/*?:\[\]]/g, '_')
        .slice(0, 31);
}

function formatExportFilterValue(value) {
    if (value === null || value === undefined || value === '') return '';
    if (typeof value === 'boolean') return value ? 'Si' : 'No';
    return String(value);
}

function buildActiveFiltersSummary(filters = []) {
    const active = filters
        .map((filter) => {
            const label = filter?.label || '';
            const value = formatExportFilterValue(filter?.value).trim();
            if (!label || !value) return null;
            return `${label}: ${value}`;
        })
        .filter(Boolean);

    if (!active.length) {
        return 'Sin filtros (vista completa)';
    }

    return active.join(' | ');
}

function buildExcelWorkbookXml({ sheetName, title, headers, rows, filtersSummary = '' }) {
    const safeSheetName = sanitizeSheetName(sheetName);
    const totalColumns = Math.max(1, headers.length);
    const mergeAcross = Math.max(0, totalColumns - 1);

    const columnDefs = Array.from({ length: totalColumns }, (_, idx) => {
        if (idx === 0) return '<Column ss:AutoFitWidth="0" ss:Width="160"/>';
        if (idx === totalColumns - 1) return '<Column ss:AutoFitWidth="0" ss:Width="220"/>';
        return '<Column ss:AutoFitWidth="0" ss:Width="135"/>';
    }).join('');

    const headerCells = headers
        .map((header) => `<Cell ss:StyleID="header"><Data ss:Type="String">${xmlEscape(header)}</Data></Cell>`)
        .join('');

    const rowMarkup = rows
        .map((row, rowIndex) => {
            const styleId = rowIndex % 2 === 0 ? 'dataEven' : 'dataOdd';
            const cells = row.map((cell) => {
                const value = toExcelCellValue(cell);
                const numeric = Number(value);
                const isNumeric = value !== '' && Number.isFinite(numeric) && /^-?\d+(\.\d+)?$/.test(value);
                const dataType = isNumeric ? 'Number' : 'String';
                const dataValue = isNumeric ? value : xmlEscape(value);
                return `<Cell ss:StyleID="${styleId}"><Data ss:Type="${dataType}">${dataValue}</Data></Cell>`;
            }).join('');
            return `<Row>${cells}</Row>`;
        })
        .join('');

    const reportTitle = title || sheetName;
    const generatedAt = new Date().toLocaleString();
    const subtitle = `Generado: ${generatedAt}`;

    return `<?xml version="1.0" encoding="UTF-8"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="title">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Font ss:Bold="1" ss:Size="14" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#203246" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="meta">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center" ss:WrapText="1"/>
   <Font ss:Bold="1" ss:Color="#203246"/>
   <Interior ss:Color="#E8EEF4" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#C7D3DE"/>
   </Borders>
  </Style>
  <Style ss:ID="header">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
   <Font ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#2F5D83" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#8EA9C1"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#8EA9C1"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#8EA9C1"/>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#8EA9C1"/>
   </Borders>
  </Style>
  <Style ss:ID="dataEven">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center" ss:WrapText="1"/>
   <Interior ss:Color="#FFFFFF" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D4DEE8"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D4DEE8"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D4DEE8"/>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D4DEE8"/>
   </Borders>
  </Style>
  <Style ss:ID="dataOdd">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center" ss:WrapText="1"/>
   <Interior ss:Color="#F6FAFE" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D4DEE8"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D4DEE8"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D4DEE8"/>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D4DEE8"/>
   </Borders>
  </Style>
 </Styles>
 <Worksheet ss:Name="${xmlEscape(safeSheetName)}">
  <Table ss:ExpandedColumnCount="${totalColumns}" ss:DefaultRowHeight="17">
   ${columnDefs}
   <Row ss:AutoFitHeight="0" ss:Height="26"><Cell ss:StyleID="title" ss:MergeAcross="${mergeAcross}"><Data ss:Type="String">${xmlEscape(reportTitle)}</Data></Cell></Row>
   <Row><Cell ss:StyleID="meta" ss:MergeAcross="${mergeAcross}"><Data ss:Type="String">${xmlEscape(subtitle)}</Data></Cell></Row>
   <Row><Cell ss:StyleID="meta" ss:MergeAcross="${mergeAcross}"><Data ss:Type="String">${xmlEscape(`Filtros: ${filtersSummary}`)}</Data></Cell></Row>
   <Row></Row>
   <Row>${headerCells}</Row>
   ${rowMarkup}
  </Table>
 </Worksheet>
</Workbook>`;
}

function downloadExcelFile(filename, xmlContent) {
    const blob = new Blob([`\ufeff${xmlContent}`], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 0);
}

function exportExcelReport({ prefix, sheetName, title, headers, rows, filters = [] }) {
    if (!Array.isArray(rows) || rows.length === 0) {
        return false;
    }

    const filename = `${prefix}_${getExportTimestamp()}.xls`;
    const filtersSummary = buildActiveFiltersSummary(filters);
    const xml = buildExcelWorkbookXml({ sheetName, title, headers, rows, filtersSummary });
    downloadExcelFile(filename, xml);
    return true;
}

function getJsPdfConstructor() {
    const ctor = window?.jspdf?.jsPDF;
    return typeof ctor === 'function' ? ctor : null;
}

function loadExternalScript(src) {
    const loadedScript = document.querySelector(`script[data-external-src="${src}"]`);
    if (loadedScript && loadedScript.dataset.loaded === 'true') {
        return Promise.resolve();
    }

    if (loadedScript) {
        return new Promise((resolve, reject) => {
            loadedScript.addEventListener('load', () => resolve(), { once: true });
            loadedScript.addEventListener('error', () => reject(new Error(`No se pudo cargar ${src}`)), { once: true });
        });
    }

    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.dataset.externalSrc = src;
        script.onload = () => {
            script.dataset.loaded = 'true';
            resolve();
        };
        script.onerror = () => reject(new Error(`No se pudo cargar ${src}`));
        document.body.appendChild(script);
    });
}

function hasPdfRuntimeReady() {
    const JsPdf = getJsPdfConstructor();
    if (!JsPdf) return false;

    try {
        const probe = new JsPdf({ unit: 'pt', format: 'a4' });
        return typeof probe.autoTable === 'function';
    } catch (_error) {
        return false;
    }
}

async function ensurePdfLibrariesLoaded() {
    if (hasPdfRuntimeReady()) {
        return true;
    }

    if (!pdfLibrariesPromise) {
        pdfLibrariesPromise = loadExternalScript(PDF_LIBRARY_SOURCES[0])
            .then(() => loadExternalScript(PDF_LIBRARY_SOURCES[1]))
            .catch((error) => {
                console.error('No se pudieron cargar librerias PDF:', error);
                return false;
            })
            .then(() => hasPdfRuntimeReady());
    }

    const isReady = await pdfLibrariesPromise;
    if (!isReady) {
        pdfLibrariesPromise = null;
    }
    return isReady;
}

function exportPdfReport({
    prefix,
    title,
    headers,
    rows,
    filters = [],
    summary = '',
    orientation = 'portrait',
    didParseCell = null
}) {
    if (!Array.isArray(rows) || rows.length === 0) {
        return false;
    }

    const JsPdf = getJsPdfConstructor();
    if (!JsPdf) {
        return null;
    }

    const doc = new JsPdf({ orientation, unit: 'pt', format: 'a4' });
    if (typeof doc.autoTable !== 'function') {
        return null;
    }

    const margin = 36;
    const pageWidth = doc.internal.pageSize.getWidth();
    const contentWidth = pageWidth - (margin * 2);
    const generatedAt = new Date().toLocaleString();
    const filtersText = `Filtros: ${buildActiveFiltersSummary(filters)}`;

    doc.setFillColor(44, 122, 75);
    doc.roundedRect(margin, margin - 10, contentWidth, 30, 4, 4, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(title || 'Reporte SCV', margin + 10, margin + 9);

    let cursorY = margin + 30;
    doc.setTextColor(31, 45, 57);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Generado: ${generatedAt}`, margin, cursorY);
    cursorY += 12;

    const wrappedFilters = doc.splitTextToSize(filtersText, contentWidth);
    doc.text(wrappedFilters, margin, cursorY);
    cursorY += (wrappedFilters.length * 11);

    if (summary) {
        const wrappedSummary = doc.splitTextToSize(summary, contentWidth);
        doc.setFont('helvetica', 'bold');
        doc.text(wrappedSummary, margin, cursorY);
        doc.setFont('helvetica', 'normal');
        cursorY += (wrappedSummary.length * 11);
    }

    const tableRows = rows.map((row) => row.map((cell) => toExcelCellValue(cell)));

    doc.autoTable({
        startY: cursorY + 4,
        head: [headers],
        body: tableRows,
        theme: 'grid',
        margin: { left: margin, right: margin },
        styles: {
            font: 'helvetica',
            fontSize: 8.3,
            textColor: [44, 58, 50],
            cellPadding: { top: 4, right: 4, bottom: 4, left: 4 },
            lineColor: [204, 204, 204],
            lineWidth: 0.35,
            overflow: 'linebreak'
        },
        headStyles: {
            fillColor: [44, 122, 75],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            halign: 'center',
            lineColor: [170, 196, 178],
            lineWidth: 0.5
        },
        alternateRowStyles: {
            fillColor: [242, 242, 242]
        },
        didParseCell: typeof didParseCell === 'function' ? didParseCell : undefined
    });

    doc.save(`${prefix}_${getExportTimestamp()}.pdf`);
    return true;
}

async function exportVehiculosReport() {
    const vehiculos = getFilteredVehiculos(APP.admin.vehiculos || []);
    const exported = exportExcelReport({
        prefix: 'reporte_vehiculos',
        sheetName: 'Vehiculos',
        title: 'SCV - Reporte de Vehiculos',
        filters: [
            { label: 'Busqueda', value: APP.admin.filters.query },
            { label: 'Estado', value: APP.admin.filters.estado !== 'todos' ? APP.admin.filters.estado : '' },
            { label: 'Orden', value: APP.admin.filters.orden },
            { label: 'Ano desde', value: APP.admin.filters.anioMin },
            { label: 'Ano hasta', value: APP.admin.filters.anioMax }
        ],
        headers: ['Placa', 'Marca', 'Modelo', 'Ano', 'Empresa', 'Kilometraje', 'SOAT', 'RTM', 'Estado'],
        rows: vehiculos.map((vehiculo) => [
            vehiculo.placa || '',
            vehiculo.marca || '',
            vehiculo.modelo || '',
            vehiculo.año || '',
            vehiculo.empresa || '',
            vehiculo.kilometraje ?? 0,
            vehiculo.fecha_venc_soat || '',
            vehiculo.fecha_venc_rtm || '',
            vehiculo.activo ? 'Activo' : 'Inactivo'
        ])
    });

    if (!exported) {
        await showAppAlert('Sin datos para exportar', 'No hay vehiculos en pantalla con los filtros actuales.');
        return;
    }

    setVehiculosFeedback(`${vehiculos.length} vehiculos exportados a Excel.`);
}

async function exportConductoresReport() {
    const conductores = getFilteredConductores(APP.admin.conductores || []);
    const exported = exportExcelReport({
        prefix: 'reporte_conductores',
        sheetName: 'Conductores',
        title: 'SCV - Reporte de Conductores',
        filters: [
            { label: 'Busqueda', value: APP.admin.conductoresFilters.query },
            { label: 'Estado', value: APP.admin.conductoresFilters.estado !== 'todos' ? APP.admin.conductoresFilters.estado : '' },
            { label: 'Categoria', value: APP.admin.conductoresFilters.categoria !== 'todas' ? APP.admin.conductoresFilters.categoria : '' },
            { label: 'Orden', value: APP.admin.conductoresFilters.orden },
            { label: 'Licencia contiene', value: APP.admin.conductoresFilters.licencia }
        ],
        headers: ['Nombre', 'Cedula', 'Licencia', 'Categoria', 'Vence Licencia', 'Estado'],
        rows: conductores.map((conductor) => [
            conductor.nombre || '',
            conductor.cedula || '',
            conductor.licencia || '',
            conductor.categoria || '',
            conductor.fecha_venc_licencia || '',
            conductor.activo ? 'Activo' : 'Inactivo'
        ])
    });

    if (!exported) {
        await showAppAlert('Sin datos para exportar', 'No hay conductores en pantalla con los filtros actuales.');
        return;
    }

    setConductoresFeedback(`${conductores.length} conductores exportados a Excel.`);
}

async function exportUsuariosReport() {
    const usuarios = getFilteredUsuarios(APP.admin.usuarios || []);
    const exported = exportExcelReport({
        prefix: 'reporte_usuarios',
        sheetName: 'Usuarios',
        title: 'SCV - Reporte de Usuarios',
        filters: [
            { label: 'Busqueda', value: APP.admin.usuariosFilters.query },
            { label: 'Estado', value: APP.admin.usuariosFilters.estado !== 'todos' ? APP.admin.usuariosFilters.estado : '' },
            { label: 'Rol', value: APP.admin.usuariosFilters.rol !== 'todos' ? rolLabel(APP.admin.usuariosFilters.rol) : '' },
            { label: 'Orden', value: APP.admin.usuariosFilters.orden },
            { label: 'Dominio email', value: APP.admin.usuariosFilters.emailDomain }
        ],
        headers: ['Nombre', 'Email', 'Rol', 'Estado'],
        rows: usuarios.map((usuario) => [
            usuario.nombre || '',
            usuario.email || '',
            rolLabel(usuario.rol),
            usuario.activo ? 'Activo' : 'Inactivo'
        ])
    });

    if (!exported) {
        await showAppAlert('Sin datos para exportar', 'No hay usuarios en pantalla con los filtros actuales.');
        return;
    }

    setUsuariosFeedback(`${usuarios.length} usuarios exportados a Excel.`);
}

async function exportChequeosReport() {
    const chequeos = getFilteredChequeos();
    const exported = exportExcelReport({
        prefix: 'reporte_chequeos',
        sheetName: 'Chequeos',
        title: 'SCV - Reporte de Chequeos',
        filters: [
            { label: 'Busqueda', value: APP.admin.chequeosFilters.query },
            { label: 'Fecha inicio', value: APP.admin.chequeosFilters.fechaInicio },
            { label: 'Fecha fin', value: APP.admin.chequeosFilters.fechaFin },
            { label: 'Orden', value: APP.admin.chequeosFilters.orden }
        ],
        headers: ['Fecha', 'Placa', 'Conductor', 'Inspector', 'Kilometraje', 'Items', 'Observaciones'],
        rows: chequeos.map((chequeo) => [
            chequeo.fecha_hora ? formatApiDateTime(chequeo.fecha_hora) : '',
            chequeo.vehiculo?.placa || '',
            chequeo.conductor?.nombre || '',
            chequeo.usuario?.nombre || '',
            chequeo.kilometraje ?? '',
            chequeo.total_items ?? 0,
            chequeo.obs_generales || ''
        ])
    });

    if (!exported) {
        await showAppAlert('Sin datos para exportar', 'No hay chequeos en pantalla con los filtros actuales.');
        return;
    }

    setChequeosFeedback(`${chequeos.length} chequeos exportados a Excel.`);
}

async function exportMovimientosReport() {
    const movimientos = getFilteredMovimientos();
    const exported = exportExcelReport({
        prefix: 'reporte_movimientos',
        sheetName: 'Movimientos',
        title: 'SCV - Reporte de Movimientos',
        filters: [
            { label: 'Busqueda', value: APP.admin.movimientosFilters.query },
            { label: 'Tipo', value: APP.admin.movimientosFilters.tipo !== 'todos' ? formatMovimientoTipo(APP.admin.movimientosFilters.tipo) : '' },
            { label: 'Fecha inicio', value: APP.admin.movimientosFilters.fechaInicio },
            { label: 'Fecha fin', value: APP.admin.movimientosFilters.fechaFin },
            { label: 'Orden', value: APP.admin.movimientosFilters.orden }
        ],
        headers: ['Fecha', 'Tipo', 'Placa', 'Conductor', 'Operario', 'Kilometraje', 'Bascula', 'Auxiliar', 'Proveedor/Destino', 'Sacas', 'Observaciones'],
        rows: movimientos.map((movimiento) => [
            movimiento.fecha_hora ? formatApiDateTime(movimiento.fecha_hora) : '',
            formatMovimientoTipo(movimiento.tipo),
            movimiento.vehiculo?.placa || '',
            movimiento.conductor?.nombre || '',
            movimiento.usuario?.nombre || '',
            movimiento.kilometraje ?? '',
            formatBasculaLabel(movimiento.bascula),
            movimiento.auxiliar || '',
            movimiento.proveedor || '',
            movimiento.sacas ?? '',
            movimiento.observaciones || ''
        ])
    });

    if (!exported) {
        await showAppAlert('Sin datos para exportar', 'No hay movimientos en pantalla con los filtros actuales.');
        return;
    }

    setMovimientosFeedback(`${movimientos.length} movimientos exportados a Excel.`);
}

async function exportVehiculosPdfReport() {
    const isPdfReady = await ensurePdfLibrariesLoaded();
    if (!isPdfReady) {
        await showAppAlert('Exportacion PDF no disponible', 'No se pudo cargar la libreria PDF en esta sesion. Intenta nuevamente.');
        return;
    }

    const vehiculos = getFilteredVehiculos(APP.admin.vehiculos || []);
    const exported = exportPdfReport({
        prefix: 'reporte_vehiculos',
        title: 'SCV - Reporte de Vehiculos',
        filters: [
            { label: 'Busqueda', value: APP.admin.filters.query },
            { label: 'Estado', value: APP.admin.filters.estado !== 'todos' ? APP.admin.filters.estado : '' },
            { label: 'Orden', value: APP.admin.filters.orden },
            { label: 'Ano desde', value: APP.admin.filters.anioMin },
            { label: 'Ano hasta', value: APP.admin.filters.anioMax }
        ],
        summary: `Total vehiculos: ${vehiculos.length}`,
        headers: ['Placa', 'Marca', 'Modelo', 'Ano', 'Empresa', 'Kilometraje', 'SOAT', 'RTM', 'Estado'],
        rows: vehiculos.map((vehiculo) => [
            vehiculo.placa || '',
            vehiculo.marca || '',
            vehiculo.modelo || '',
            vehiculo.año || '',
            vehiculo.empresa || '',
            vehiculo.kilometraje ?? 0,
            vehiculo.fecha_venc_soat || '',
            vehiculo.fecha_venc_rtm || '',
            vehiculo.activo ? 'Activo' : 'Inactivo'
        ]),
        didParseCell: (data) => {
            if (data.section !== 'body' || data.column.index !== 8) return;
            const value = String(data.cell.raw || '').trim().toLowerCase();
            if (value === 'activo') {
                data.cell.styles.textColor = [26, 122, 58];
                data.cell.styles.fontStyle = 'bold';
            }
            if (value === 'inactivo') {
                data.cell.styles.textColor = [176, 35, 24];
                data.cell.styles.fontStyle = 'bold';
            }
        }
    });

    if (!exported) {
        await showAppAlert('Sin datos para exportar', 'No hay vehiculos en pantalla con los filtros actuales.');
        return;
    }

    setVehiculosFeedback(`${vehiculos.length} vehiculos exportados a PDF.`);
}

async function exportConductoresPdfReport() {
    const isPdfReady = await ensurePdfLibrariesLoaded();
    if (!isPdfReady) {
        await showAppAlert('Exportacion PDF no disponible', 'No se pudo cargar la libreria PDF en esta sesion. Intenta nuevamente.');
        return;
    }

    const conductores = getFilteredConductores(APP.admin.conductores || []);
    const exported = exportPdfReport({
        prefix: 'reporte_conductores',
        title: 'SCV - Reporte de Conductores',
        filters: [
            { label: 'Busqueda', value: APP.admin.conductoresFilters.query },
            { label: 'Estado', value: APP.admin.conductoresFilters.estado !== 'todos' ? APP.admin.conductoresFilters.estado : '' },
            { label: 'Categoria', value: APP.admin.conductoresFilters.categoria !== 'todas' ? APP.admin.conductoresFilters.categoria : '' },
            { label: 'Orden', value: APP.admin.conductoresFilters.orden },
            { label: 'Licencia contiene', value: APP.admin.conductoresFilters.licencia }
        ],
        summary: `Total conductores: ${conductores.length}`,
        headers: ['Nombre', 'Cedula', 'Licencia', 'Categoria', 'Vence Licencia', 'Estado'],
        rows: conductores.map((conductor) => [
            conductor.nombre || '',
            conductor.cedula || '',
            conductor.licencia || '',
            conductor.categoria || '',
            conductor.fecha_venc_licencia || '',
            conductor.activo ? 'Activo' : 'Inactivo'
        ])
    });

    if (!exported) {
        await showAppAlert('Sin datos para exportar', 'No hay conductores en pantalla con los filtros actuales.');
        return;
    }

    setConductoresFeedback(`${conductores.length} conductores exportados a PDF.`);
}

async function exportUsuariosPdfReport() {
    const isPdfReady = await ensurePdfLibrariesLoaded();
    if (!isPdfReady) {
        await showAppAlert('Exportacion PDF no disponible', 'No se pudo cargar la libreria PDF en esta sesion. Intenta nuevamente.');
        return;
    }

    const usuarios = getFilteredUsuarios(APP.admin.usuarios || []);
    const exported = exportPdfReport({
        prefix: 'reporte_usuarios',
        title: 'SCV - Reporte de Usuarios',
        filters: [
            { label: 'Busqueda', value: APP.admin.usuariosFilters.query },
            { label: 'Estado', value: APP.admin.usuariosFilters.estado !== 'todos' ? APP.admin.usuariosFilters.estado : '' },
            { label: 'Rol', value: APP.admin.usuariosFilters.rol !== 'todos' ? rolLabel(APP.admin.usuariosFilters.rol) : '' },
            { label: 'Orden', value: APP.admin.usuariosFilters.orden },
            { label: 'Dominio email', value: APP.admin.usuariosFilters.emailDomain }
        ],
        summary: `Total usuarios: ${usuarios.length}`,
        headers: ['Nombre', 'Email', 'Rol', 'Estado'],
        rows: usuarios.map((usuario) => [
            usuario.nombre || '',
            usuario.email || '',
            rolLabel(usuario.rol),
            usuario.activo ? 'Activo' : 'Inactivo'
        ])
    });

    if (!exported) {
        await showAppAlert('Sin datos para exportar', 'No hay usuarios en pantalla con los filtros actuales.');
        return;
    }

    setUsuariosFeedback(`${usuarios.length} usuarios exportados a PDF.`);
}

async function exportChequeosPdfReport() {
    const isPdfReady = await ensurePdfLibrariesLoaded();
    if (!isPdfReady) {
        await showAppAlert('Exportacion PDF no disponible', 'No se pudo cargar la libreria PDF en esta sesion. Intenta nuevamente.');
        return;
    }

    const chequeos = getFilteredChequeos();
    const exported = exportPdfReport({
        prefix: 'reporte_chequeos',
        title: 'SCV - Reporte de Chequeos',
        filters: [
            { label: 'Busqueda', value: APP.admin.chequeosFilters.query },
            { label: 'Fecha inicio', value: APP.admin.chequeosFilters.fechaInicio },
            { label: 'Fecha fin', value: APP.admin.chequeosFilters.fechaFin },
            { label: 'Orden', value: APP.admin.chequeosFilters.orden }
        ],
        summary: `Total chequeos: ${chequeos.length}`,
        headers: ['Fecha', 'Placa', 'Conductor', 'Inspector', 'Kilometraje', 'Items', 'Observaciones'],
        rows: chequeos.map((chequeo) => [
            chequeo.fecha_hora ? formatApiDateTime(chequeo.fecha_hora) : '',
            chequeo.vehiculo?.placa || '',
            chequeo.conductor?.nombre || '',
            chequeo.usuario?.nombre || '',
            chequeo.kilometraje ?? '',
            chequeo.total_items ?? 0,
            chequeo.obs_generales || ''
        ]),
        orientation: 'landscape'
    });

    if (!exported) {
        await showAppAlert('Sin datos para exportar', 'No hay chequeos en pantalla con los filtros actuales.');
        return;
    }

    setChequeosFeedback(`${chequeos.length} chequeos exportados a PDF.`);
}

async function exportMovimientosPdfReport() {
    const isPdfReady = await ensurePdfLibrariesLoaded();
    if (!isPdfReady) {
        await showAppAlert('Exportacion PDF no disponible', 'No se pudo cargar la libreria PDF en esta sesion. Intenta nuevamente.');
        return;
    }

    const movimientos = getFilteredMovimientos();
    const totalEntradas = movimientos.filter((movimiento) => movimiento.tipo === 'entrada').length;
    const totalSalidas = movimientos.filter((movimiento) => movimiento.tipo === 'salida').length;

    const exported = exportPdfReport({
        prefix: 'reporte_movimientos',
        title: 'SCV - Reporte de Movimientos',
        filters: [
            { label: 'Busqueda', value: APP.admin.movimientosFilters.query },
            { label: 'Tipo', value: APP.admin.movimientosFilters.tipo !== 'todos' ? formatMovimientoTipo(APP.admin.movimientosFilters.tipo) : '' },
            { label: 'Fecha inicio', value: APP.admin.movimientosFilters.fechaInicio },
            { label: 'Fecha fin', value: APP.admin.movimientosFilters.fechaFin },
            { label: 'Orden', value: APP.admin.movimientosFilters.orden }
        ],
        summary: `Total movimientos: ${movimientos.length} | Entradas: ${totalEntradas} | Salidas: ${totalSalidas}`,
        headers: ['Fecha', 'Tipo', 'Placa', 'Conductor', 'Operario', 'Kilometraje', 'Bascula', 'Auxiliar', 'Proveedor/Destino', 'Sacas', 'Observaciones'],
        rows: movimientos.map((movimiento) => [
            movimiento.fecha_hora ? formatApiDateTime(movimiento.fecha_hora) : '',
            formatMovimientoTipo(movimiento.tipo),
            movimiento.vehiculo?.placa || '',
            movimiento.conductor?.nombre || '',
            movimiento.usuario?.nombre || '',
            movimiento.kilometraje ?? '',
            formatBasculaLabel(movimiento.bascula),
            movimiento.auxiliar || '',
            movimiento.proveedor || '',
            movimiento.sacas ?? '',
            movimiento.observaciones || ''
        ]),
        orientation: 'landscape',
        didParseCell: (data) => {
            if (data.section !== 'body' || data.column.index !== 1) return;
            const value = String(data.cell.raw || '').trim().toLowerCase();
            if (value === 'entrada') {
                data.cell.styles.textColor = [26, 122, 58];
                data.cell.styles.fontStyle = 'bold';
            }
            if (value === 'salida') {
                data.cell.styles.textColor = [176, 35, 24];
                data.cell.styles.fontStyle = 'bold';
            }
        }
    });

    if (!exported) {
        await showAppAlert('Sin datos para exportar', 'No hay movimientos en pantalla con los filtros actuales.');
        return;
    }

    setMovimientosFeedback(`${movimientos.length} movimientos exportados a PDF.`);
}

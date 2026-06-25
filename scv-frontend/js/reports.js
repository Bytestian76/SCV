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

async function exportHallazgosReport() {
    if (!APP.admin.hallazgosFilters) APP.admin.hallazgosFilters = { query: '', estado: 'todas', prioridad: 'todas', categoria: 'todas' };
    const hallazgos = APP.admin.hallazgos || [];
    const exported = exportExcelReport({
        prefix: 'reporte_hallazgos',
        sheetName: 'Hallazgos',
        title: 'SCV - Reporte de Hallazgos',
        filters: [
            { label: 'Busqueda', value: APP.admin.hallazgosFilters.query },
            { label: 'Estado', value: APP.admin.hallazgosFilters.estado !== 'todas' ? APP.admin.hallazgosFilters.estado : '' },
            { label: 'Prioridad', value: APP.admin.hallazgosFilters.prioridad !== 'todas' ? APP.admin.hallazgosFilters.prioridad : '' },
            { label: 'Categoria', value: APP.admin.hallazgosFilters.categoria !== 'todas' ? APP.admin.hallazgosFilters.categoria : '' }
        ],
        headers: ['ID', 'Fecha', 'Vehículo', 'Tipo', 'Categoría', 'Prioridad', 'Estado', 'Descripción', 'Reportado por'],
        rows: hallazgos.map((h) => [
            h.id || '',
            h.fecha_creacion ? formatApiDateTime(h.fecha_creacion) : '',
            h.vehiculo?.placa || '',
            h.tipo || '',
            h.categoria || '',
            h.criticidad || '',
            h.estado || '',
            h.descripcion || '',
            h.usuario_reporta?.nombre || ''
        ])
    });

    if (!exported) {
        await showAppAlert('Sin datos para exportar', 'No hay hallazgos en pantalla con los filtros actuales.');
        return;
    }

    setHallazgosFeedback(`${hallazgos.length} hallazgos exportados a Excel.`);
}

async function exportOrdenesReport() {
    if (!APP.admin.ordenesFilters) APP.admin.ordenesFilters = { query: '', estado: 'todas', prioridad: 'todas' };
    const ordenes = APP.admin.ordenes || [];
    const exported = exportExcelReport({
        prefix: 'reporte_ordenes',
        sheetName: 'Ordenes',
        title: 'SCV - Reporte de Ordenes de Trabajo',
        filters: [
            { label: 'Busqueda', value: APP.admin.ordenesFilters.query },
            { label: 'Estado', value: APP.admin.ordenesFilters.estado !== 'todas' ? APP.admin.ordenesFilters.estado : '' },
            { label: 'Prioridad', value: APP.admin.ordenesFilters.prioridad !== 'todas' ? APP.admin.ordenesFilters.prioridad : '' }
        ],
        headers: ['ID', 'Fecha', 'Vehículo', 'Descripción', 'Prioridad', 'Estado', 'Mecánico Asignado'],
        rows: ordenes.map((o) => [
            o.id || '',
            o.fecha_creacion ? formatApiDateTime(o.fecha_creacion) : '',
            o.vehiculo?.placa || '',
            (o.descripcion || '').split('\n')[0] || '',
            o.prioridad || '',
            o.estado || '',
            o.responsable?.nombre || ''
        ])
    });

    if (!exported) {
        await showAppAlert('Sin datos para exportar', 'No hay órdenes en pantalla con los filtros actuales.');
        return;
    }

    setOrdenesFeedback(`${ordenes.length} órdenes exportadas a Excel.`);
}

async function exportHallazgosPdfReport() {
    const isPdfReady = await ensurePdfLibrariesLoaded();
    if (!isPdfReady) {
        await showAppAlert('Exportacion PDF no disponible', 'No se pudo cargar la libreria PDF en esta sesion. Intenta nuevamente.');
        return;
    }

    if (!APP.admin.hallazgosFilters) APP.admin.hallazgosFilters = { query: '', estado: 'todas', prioridad: 'todas', categoria: 'todas' };
    const hallazgos = APP.admin.hallazgos || [];
    const exported = exportPdfReport({
        prefix: 'reporte_hallazgos',
        title: 'SCV - Reporte de Hallazgos',
        filters: [
            { label: 'Busqueda', value: APP.admin.hallazgosFilters.query },
            { label: 'Estado', value: APP.admin.hallazgosFilters.estado !== 'todas' ? APP.admin.hallazgosFilters.estado : '' },
            { label: 'Prioridad', value: APP.admin.hallazgosFilters.prioridad !== 'todas' ? APP.admin.hallazgosFilters.prioridad : '' },
            { label: 'Categoria', value: APP.admin.hallazgosFilters.categoria !== 'todas' ? APP.admin.hallazgosFilters.categoria : '' }
        ],
        summary: `Total hallazgos: ${hallazgos.length}`,
        headers: ['ID', 'Fecha', 'Vehículo', 'Tipo', 'Categoría', 'Prioridad', 'Estado', 'Descripción'],
        rows: hallazgos.map((h) => [
            h.id || '',
            h.fecha_creacion ? formatApiDateTime(h.fecha_creacion) : '',
            h.vehiculo?.placa || '',
            h.tipo || '',
            h.categoria || '',
            h.criticidad || '',
            h.estado || '',
            h.descripcion || ''
        ]),
        orientation: 'landscape'
    });

    if (!exported) {
        await showAppAlert('Sin datos para exportar', 'No hay hallazgos en pantalla con los filtros actuales.');
        return;
    }

    setHallazgosFeedback(`${hallazgos.length} hallazgos exportados a PDF.`);
}

async function exportOrdenesPdfReport() {
    const isPdfReady = await ensurePdfLibrariesLoaded();
    if (!isPdfReady) {
        await showAppAlert('Exportacion PDF no disponible', 'No se pudo cargar la libreria PDF en esta sesion. Intenta nuevamente.');
        return;
    }

    if (!APP.admin.ordenesFilters) APP.admin.ordenesFilters = { query: '', estado: 'todas', prioridad: 'todas' };
    const ordenes = APP.admin.ordenes || [];
    const exported = exportPdfReport({
        prefix: 'reporte_ordenes',
        title: 'SCV - Reporte de Ordenes de Trabajo',
        filters: [
            { label: 'Busqueda', value: APP.admin.ordenesFilters.query },
            { label: 'Estado', value: APP.admin.ordenesFilters.estado !== 'todas' ? APP.admin.ordenesFilters.estado : '' },
            { label: 'Prioridad', value: APP.admin.ordenesFilters.prioridad !== 'todas' ? APP.admin.ordenesFilters.prioridad : '' }
        ],
        summary: `Total órdenes: ${ordenes.length}`,
        headers: ['ID', 'Fecha', 'Vehículo', 'Descripción', 'Prioridad', 'Estado', 'Mecánico'],
        rows: ordenes.map((o) => [
            o.id || '',
            o.fecha_creacion ? formatApiDateTime(o.fecha_creacion) : '',
            o.vehiculo?.placa || '',
            (o.descripcion || '').split('\n')[0] || '',
            o.prioridad || '',
            o.estado || '',
            o.responsable?.nombre || ''
        ]),
        orientation: 'landscape'
    });

    if (!exported) {
        await showAppAlert('Sin datos para exportar', 'No hay órdenes en pantalla con los filtros actuales.');
        return;
    }

    setOrdenesFeedback(`${ordenes.length} órdenes exportadas a PDF.`);
}

// ============ EXPORTACIONES INDIVIDUALES (COMPROBANTES) ============

async function exportSingleHallazgoPdf(hallazgoId) {
    const isPdfReady = await ensurePdfLibrariesLoaded();
    if (!isPdfReady) {
        await showAppAlert('Exportación PDF no disponible', 'No se pudo cargar la librería PDF. Intenta de nuevo.');
        return;
    }

    try {
        const h = await API.getHallazgo(hallazgoId);
        if (!h) throw new Error('Hallazgo no encontrado');

        const JsPdf = getJsPdfConstructor();
        const doc = new JsPdf({ orientation: 'portrait', unit: 'pt', format: 'a4' });

        const margin = 36;
        const pageWidth = doc.internal.pageSize.getWidth();
        const contentWidth = pageWidth - (margin * 2);

        // Header
        doc.setFillColor(31, 45, 57);
        doc.roundedRect(margin, margin - 10, contentWidth, 32, 4, 4, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text(`COMPROBANTE DE HALLAZGO #${h.id}`, margin + 10, margin + 11);

        let cursorY = margin + 35;
        doc.setTextColor(31, 45, 57);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(`Fecha Impresión: ${new Date().toLocaleString()}`, margin, cursorY);
        cursorY += 15;

        const rows = [
            ['ID de Hallazgo', h.id || ''],
            ['Fecha de Registro', h.fecha_creacion ? formatApiDateTime(h.fecha_creacion) : ''],
            ['Vehículo', h.vehiculo ? `${h.vehiculo.placa} - ${h.vehiculo.marca} ${h.vehiculo.modelo}` : 'Sin vehículo'],
            ['Tipo', h.tipo || 'operacion'],
            ['Categoría', h.categoria || ''],
            ['Prioridad / Criticidad', h.criticidad ? h.criticidad.toUpperCase() : ''],
            ['Estado', h.estado ? h.estado.toUpperCase() : ''],
            ['Reportado por', h.usuario_reporta?.nombre || ''],
            ['Descripción', h.descripcion || '']
        ];

        doc.autoTable({
            startY: cursorY,
            head: [['Campo', 'Detalle']],
            body: rows,
            theme: 'grid',
            margin: { left: margin, right: margin },
            styles: { fontSize: 9, font: 'helvetica' },
            headStyles: { fillColor: [44, 122, 75], textColor: 255 }
        });

        doc.save(`comprobante_hallazgo_${h.id}.pdf`);
        return true;
    } catch (err) {
        console.error('Error exportando hallazgo PDF:', err);
        showAppAlert('Error', 'No se pudo generar el comprobante PDF.');
        return false;
    }
}

async function exportSingleHallazgoExcel(hallazgoId) {
    try {
        const h = await API.getHallazgo(hallazgoId);
        if (!h) throw new Error('Hallazgo no encontrado');

        const rows = [
            ['ID de Hallazgo', h.id || ''],
            ['Fecha de Registro', h.fecha_creacion ? formatApiDateTime(h.fecha_creacion) : ''],
            ['Vehículo', h.vehiculo ? `${h.vehiculo.placa} - ${h.vehiculo.marca} ${h.vehiculo.modelo}` : ''],
            ['Tipo', h.tipo || ''],
            ['Categoría', h.categoria || ''],
            ['Prioridad / Criticidad', h.criticidad || ''],
            ['Estado', h.estado || ''],
            ['Reportado por', h.usuario_reporta?.nombre || ''],
            ['Descripción', h.descripcion || '']
        ];

        const exported = exportExcelReport({
            prefix: `comprobante_hallazgo_${h.id}`,
            sheetName: 'Hallazgo',
            title: `SCV - Comprobante de Hallazgo #${h.id}`,
            headers: ['Campo', 'Detalle'],
            rows: rows
        });

        return exported;
    } catch (err) {
        console.error('Error exportando hallazgo Excel:', err);
        showAppAlert('Error', 'No se pudo generar el archivo Excel.');
        return false;
    }
}

async function exportSingleOrdenPdf(ordenId) {
    const isPdfReady = await ensurePdfLibrariesLoaded();
    if (!isPdfReady) {
        await showAppAlert('Exportación PDF no disponible', 'No se pudo cargar la librería PDF. Intenta de nuevo.');
        return;
    }

    try {
        const o = await API.getOrdenTrabajo(ordenId);
        if (!o) throw new Error('Orden no encontrada');

        const actividades = await API.getOrdenActividades(ordenId) || [];
        const costos = await API.getOrdenCostos(ordenId) || [];

        const JsPdf = getJsPdfConstructor();
        const doc = new JsPdf({ orientation: 'portrait', unit: 'pt', format: 'a4' });

        const margin = 36;
        const pageWidth = doc.internal.pageSize.getWidth();
        const contentWidth = pageWidth - (margin * 2);

        // Header
        doc.setFillColor(31, 45, 57);
        doc.roundedRect(margin, margin - 10, contentWidth, 32, 4, 4, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text(`COMPROBANTE DE ORDEN DE TRABAJO #${o.id}`, margin + 10, margin + 11);

        let cursorY = margin + 35;
        doc.setTextColor(31, 45, 57);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(`Fecha Impresión: ${new Date().toLocaleString()}`, margin, cursorY);
        cursorY += 15;

        // General Info Table
        const infoRows = [
            ['ID de Orden', o.id || '', 'Prioridad', o.prioridad ? o.prioridad.toUpperCase() : ''],
            ['Vehículo', o.vehiculo ? `${o.vehiculo.placa} (${o.vehiculo.marca} ${o.vehiculo.modelo})` : '', 'Estado', o.estado ? o.estado.toUpperCase() : ''],
            ['Mecánico', o.responsable?.nombre || 'Sin asignar', 'Horario', o.hora_inicio && o.hora_fin ? `${o.hora_inicio} - ${o.hora_fin}` : 'No programado'],
            ['Fecha Creación', o.fecha_creacion ? formatApiDateTime(o.fecha_creacion) : '', 'Hallazgo Asociado', o.hallazgo ? `#${o.hallazgo.id}` : 'Ninguno'],
            ['Descripción', o.descripcion || '', '', '']
        ];

        doc.autoTable({
            startY: cursorY,
            head: [['Detalles Generales', '', '', '']],
            body: infoRows,
            theme: 'striped',
            margin: { left: margin, right: margin },
            styles: { fontSize: 8.5, font: 'helvetica' },
            headStyles: { fillColor: [44, 122, 75], textColor: 255 },
            didParseCell: function(data) {
                if (data.row.index === 4 && data.cell.colSpan === 1) {
                    data.cell.colSpan = 4;
                }
            }
        });

        cursorY = doc.lastAutoTable.finalY + 20;

        // Activities Table
        const actHeaders = ['Título', 'Descripción', 'Estado'];
        const actRows = actividades.map(a => [
            a.titulo || 'Actividad',
            a.descripcion || '',
            a.estado ? a.estado.toUpperCase() : 'PENDIENTE'
        ]);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text('Actividades Realizadas / Programadas', margin, cursorY);
        cursorY += 8;

        if (actRows.length === 0) {
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(9);
            doc.text('No hay actividades registradas en esta orden.', margin, cursorY);
            cursorY += 15;
        } else {
            doc.autoTable({
                startY: cursorY,
                head: [actHeaders],
                body: actRows,
                theme: 'grid',
                margin: { left: margin, right: margin },
                styles: { fontSize: 8, font: 'helvetica' },
                headStyles: { fillColor: [70, 80, 95] }
            });
            cursorY = doc.lastAutoTable.finalY + 20;
        }

        // Costs Table
        const costHeaders = ['Concepto / Descripción', 'Tipo', 'Monto'];
        const costRows = costos.map(c => [
            c.descripcion || 'Costo',
            c.tipo_gasto || 'otro',
            formatCurrency(c.valor_total || c.valor)
        ]);

        const totalCost = costos.reduce((sum, c) => sum + Number(c.valor_total || c.valor || 0), 0);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text('Costos Asociados', margin, cursorY);
        cursorY += 8;

        if (costRows.length === 0) {
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(9);
            doc.text('No hay costos registrados en esta orden.', margin, cursorY);
        } else {
            doc.autoTable({
                startY: cursorY,
                head: [costHeaders],
                body: [...costRows, ['', 'TOTAL', formatCurrency(totalCost)]],
                theme: 'grid',
                margin: { left: margin, right: margin },
                styles: { fontSize: 8, font: 'helvetica' },
                headStyles: { fillColor: [70, 80, 95] },
                didParseCell: function(data) {
                    if (data.row.index === costRows.length) {
                        data.cell.fontStyle = 'bold';
                    }
                }
            });
        }

        doc.save(`comprobante_orden_${o.id}.pdf`);
        return true;
    } catch (err) {
        console.error('Error exportando orden PDF:', err);
        showAppAlert('Error', 'No se pudo generar el comprobante PDF.');
        return false;
    }
}

async function exportSingleOrdenExcel(ordenId) {
    try {
        const o = await API.getOrdenTrabajo(ordenId);
        if (!o) throw new Error('Orden no encontrada');

        const actividades = await API.getOrdenActividades(ordenId) || [];
        const costos = await API.getOrdenCostos(ordenId) || [];

        const rows = [];
        
        rows.push(['COMPROBANTE DE ORDEN DE TRABAJO #' + o.id]);
        rows.push([]);
        
        rows.push(['Detalles Generales']);
        rows.push(['ID Orden', o.id, 'Prioridad', o.prioridad]);
        rows.push(['Vehículo', o.vehiculo ? `${o.vehiculo.placa} (${o.vehiculo.marca} ${o.vehiculo.modelo})` : '', 'Estado', o.estado]);
        rows.push(['Mecánico', o.responsable?.nombre || 'Sin asignar', 'Horario', o.hora_inicio && o.hora_fin ? `${o.hora_inicio} - ${o.hora_fin}` : 'No programado']);
        rows.push(['Fecha Creación', o.fecha_creacion ? formatApiDateTime(o.fecha_creacion) : '']);
        rows.push(['Descripción', o.descripcion || '']);
        rows.push([]);

        rows.push(['Actividades']);
        rows.push(['Título', 'Descripción', 'Estado']);
        if (actividades.length === 0) {
            rows.push(['Sin actividades registradas']);
        } else {
            actividades.forEach(a => {
                rows.push([a.titulo || '', a.descripcion || '', a.estado || '']);
            });
        }
        rows.push([]);

        rows.push(['Costos']);
        rows.push(['Concepto', 'Tipo', 'Monto']);
        if (costos.length === 0) {
            rows.push(['Sin costos registrados']);
        } else {
            costos.forEach(c => {
                rows.push([c.descripcion || '', c.tipo_gasto || '', c.valor_total || c.valor || 0]);
            });
            const totalCost = costos.reduce((sum, c) => sum + Number(c.valor_total || c.valor || 0), 0);
            rows.push(['', 'TOTAL', totalCost]);
        }

        const exported = exportExcelReport({
            prefix: `comprobante_orden_${o.id}`,
            sheetName: `Orden ${o.id}`,
            title: `SCV - Comprobante de Orden #${o.id}`,
            headers: ['SCV - Detalle de Orden'],
            rows: rows
        });

        return exported;
    } catch (err) {
        console.error('Error exportando orden Excel:', err);
        showAppAlert('Error', 'No se pudo generar el archivo Excel.');
        return false;
    }
}

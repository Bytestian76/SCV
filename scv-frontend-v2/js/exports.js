/**
 * exports.js — Motor de exportación v2
 * Funciones limpias sin dependencias de la v1.
 * Cada función pública recibe el array de datos ya filtrado desde la vista.
 */

// ─── CONFIG PDF ──────────────────────────────────────────────────────────────
const PDF_LIBS = [
    'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js',
    'https://cdn.jsdelivr.net/npm/jspdf-autotable@3.8.2/dist/jspdf.plugin.autotable.min.js'
];
let _pdfPromise = null;

// ─── HELPERS INTERNOS ────────────────────────────────────────────────────────

function _ts() {
    const n = new Date();
    return `${n.getFullYear()}${String(n.getMonth()+1).padStart(2,'0')}${String(n.getDate()).padStart(2,'0')}_${String(n.getHours()).padStart(2,'0')}${String(n.getMinutes()).padStart(2,'0')}`;
}

function _esc(v) {
    return String(v ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
}

function _cell(v) {
    if (v === null || v === undefined) return '';
    if (typeof v === 'boolean') return v ? 'Sí' : 'No';
    return String(v);
}

function _buildXml({ sheetName, title, headers, rows }) {
    const cols = headers.length;
    const mergeAcross = Math.max(0, cols - 1);
    const colDefs = Array.from({ length: cols }, (_, i) =>
        i === 0 ? '<Column ss:AutoFitWidth="0" ss:Width="160"/>' :
        i === cols - 1 ? '<Column ss:AutoFitWidth="0" ss:Width="220"/>' :
        '<Column ss:AutoFitWidth="0" ss:Width="135"/>'
    ).join('');

    const headerCells = headers.map(h =>
        `<Cell ss:StyleID="header"><Data ss:Type="String">${_esc(h)}</Data></Cell>`
    ).join('');

    const rowMarkup = rows.map((row, ri) => {
        const style = ri % 2 === 0 ? 'dataEven' : 'dataOdd';
        const cells = row.map(c => {
            const val = _cell(c);
            const num = Number(val);
            const isNum = val !== '' && Number.isFinite(num) && /^-?\d+(\.\d+)?$/.test(val);
            return `<Cell ss:StyleID="${style}"><Data ss:Type="${isNum ? 'Number' : 'String'}">${isNum ? val : _esc(val)}</Data></Cell>`;
        }).join('');
        return `<Row>${cells}</Row>`;
    }).join('');

    const generated = new Date().toLocaleString('es-CO');

    return `<?xml version="1.0" encoding="UTF-8"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
<Styles>
 <Style ss:ID="title"><Alignment ss:Horizontal="Left" ss:Vertical="Center"/><Font ss:Bold="1" ss:Size="14" ss:Color="#1F4E3D"/><Interior ss:Color="#EAF3ED" ss:Pattern="Solid"/></Style>
 <Style ss:ID="subtitle"><Font ss:Italic="1" ss:Size="9" ss:Color="#6B7280"/><Interior ss:Color="#F9FAFB" ss:Pattern="Solid"/></Style>
 <Style ss:ID="header"><Alignment ss:Horizontal="Center" ss:Vertical="Center"/><Font ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#2C7A4B" ss:Pattern="Solid"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2"/></Borders></Style>
 <Style ss:ID="dataEven"><Alignment ss:Vertical="Center"/><Interior ss:Color="#FFFFFF" ss:Pattern="Solid"/></Style>
 <Style ss:ID="dataOdd"><Alignment ss:Vertical="Center"/><Interior ss:Color="#F2F9F5" ss:Pattern="Solid"/></Style>
</Styles>
<Worksheet ss:Name="${_esc(sheetName.slice(0, 31))}">
<Table>${colDefs}
<Row ss:Height="28"><Cell ss:MergeAcross="${mergeAcross}" ss:StyleID="title"><Data ss:Type="String">${_esc(title)}</Data></Cell></Row>
<Row ss:Height="18"><Cell ss:MergeAcross="${mergeAcross}" ss:StyleID="subtitle"><Data ss:Type="String">Generado: ${generated}</Data></Cell></Row>
<Row>${headerCells}</Row>
${rowMarkup}
</Table>
</Worksheet>
</Workbook>`;
}

function _downloadExcel(filename, xml) {
    const blob = new Blob([`\ufeff${xml}`], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), { href: url, download: filename, style: 'display:none' });
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 300);
}

function _excelFile({ prefix, sheetName, title, headers, rows }) {
    if (!rows?.length) return false;
    _downloadExcel(`${prefix}_${_ts()}.xls`, _buildXml({ sheetName, title, headers, rows }));
    return true;
}

async function _ensurePdf() {
    if (_pdfPromise) return _pdfPromise;
    _pdfPromise = (async () => {
        for (const src of PDF_LIBS) {
            await new Promise((res, rej) => {
                if (document.querySelector(`script[src="${src}"]`)) return res();
                const s = document.createElement('script');
                s.src = src; s.onload = res; s.onerror = rej;
                document.head.appendChild(s);
            });
        }
        return true;
    })().catch(() => false);
    return _pdfPromise;
}

async function _downloadPdf({ prefix, title, headers, rows }) {
    if (!rows?.length) return false;
    const ok = await _ensurePdf();
    if (!ok) return false;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const margin = 14;
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFillColor(31, 78, 61);
    doc.rect(0, 0, pageWidth, 22, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold').setFontSize(12);
    doc.text(title, margin, 14);
    doc.setFont('helvetica', 'normal').setFontSize(8);
    doc.text(`Generado: ${new Date().toLocaleString('es-CO')}`, pageWidth - margin, 14, { align: 'right' });

    doc.autoTable({
        startY: 28,
        head: [headers],
        body: rows.map(r => r.map(c => _cell(c))),
        theme: 'grid',
        margin: { left: margin, right: margin },
        styles: { font: 'helvetica', fontSize: 7.5, textColor: [44, 58, 50], cellPadding: 3, lineColor: [204, 204, 204], lineWidth: 0.3, overflow: 'linebreak' },
        headStyles: { fillColor: [44, 122, 75], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' },
        alternateRowStyles: { fillColor: [242, 249, 245] }
    });

    doc.save(`${prefix}_${_ts()}.pdf`);
    return true;
}

// ─── API PÚBLICA ─────────────────────────────────────────────────────────────

export function exportVehiculosExcel(data) {
    return _excelFile({
        prefix: 'scv_vehiculos', sheetName: 'Vehículos', title: 'SCV — Reporte de Vehículos',
        headers: ['Placa', 'Tipo', 'Marca', 'Modelo', 'Capacidad (kg)', 'Estado'],
        rows: data.map(v => [v.placa, v.tipo_vehiculo || v.tipo, v.marca, v.modelo, v.capacidad_carga_kg ?? '', v.estado || (v.activo === false ? 'INACTIVO' : 'ACTIVO')])
    });
}
export async function exportVehiculosPdf(data) {
    return _downloadPdf({
        prefix: 'scv_vehiculos', title: 'SCV — Reporte de Vehículos',
        headers: ['Placa', 'Tipo', 'Marca', 'Modelo', 'Capacidad (kg)', 'Estado'],
        rows: data.map(v => [v.placa, v.tipo_vehiculo || v.tipo, v.marca, v.modelo, v.capacidad_carga_kg ?? '', v.estado || (v.activo === false ? 'INACTIVO' : 'ACTIVO')])
    });
}

export function exportConductoresExcel(data) {
    return _excelFile({
        prefix: 'scv_conductores', sheetName: 'Conductores', title: 'SCV — Reporte de Conductores',
        headers: ['Nombre', 'Cédula', 'Licencia', 'Categoría', 'Teléfono', 'Estado'],
        rows: data.map(c => [c.nombre || c.nombre_completo, c.cedula || c.documento, c.numero_licencia || c.licencia, c.categoria_licencia, c.telefono || c.celular, c.activo === false ? 'INACTIVO' : 'ACTIVO'])
    });
}
export async function exportConductoresPdf(data) {
    return _downloadPdf({
        prefix: 'scv_conductores', title: 'SCV — Reporte de Conductores',
        headers: ['Nombre', 'Cédula', 'Licencia', 'Categoría', 'Teléfono', 'Estado'],
        rows: data.map(c => [c.nombre || c.nombre_completo, c.cedula || c.documento, c.numero_licencia || c.licencia, c.categoria_licencia, c.telefono || c.celular, c.activo === false ? 'INACTIVO' : 'ACTIVO'])
    });
}

export function exportUsuariosExcel(data) {
    return _excelFile({
        prefix: 'scv_usuarios', sheetName: 'Usuarios', title: 'SCV — Reporte de Usuarios',
        headers: ['Nombre', 'Email', 'Rol', 'Estado', 'Creación'],
        rows: data.map(u => [u.nombre, u.email, u.rol, u.activo === false ? 'INACTIVO' : 'ACTIVO', u.created_at ? new Date(u.created_at).toLocaleDateString('es-CO') : ''])
    });
}
export async function exportUsuariosPdf(data) {
    return _downloadPdf({
        prefix: 'scv_usuarios', title: 'SCV — Reporte de Usuarios',
        headers: ['Nombre', 'Email', 'Rol', 'Estado', 'Creación'],
        rows: data.map(u => [u.nombre, u.email, u.rol, u.activo === false ? 'INACTIVO' : 'ACTIVO', u.created_at ? new Date(u.created_at).toLocaleDateString('es-CO') : ''])
    });
}

export function exportMovimientosExcel(data) {
    return _excelFile({
        prefix: 'scv_movimientos', sheetName: 'Movimientos', title: 'SCV — Reporte de Movimientos',
        headers: ['Fecha y Hora', 'Tipo', 'Placa', 'Conductor', 'Kilometraje', 'Destino / Origen', 'Observaciones'],
        rows: data.map(m => {
            const fecha = m.fecha_hora || m.created_at;
            return [fecha ? new Date(fecha).toLocaleString('es-CO') : '', m.tipo_movimiento || m.tipo, m.vehiculo_placa || m.placa, m.conductor_nombre || m.conductor, m.kilometraje ?? '', m.destino || m.origen, m.observaciones || m.novedades];
        })
    });
}
export async function exportMovimientosPdf(data) {
    return _downloadPdf({
        prefix: 'scv_movimientos', title: 'SCV — Reporte de Movimientos',
        headers: ['Fecha y Hora', 'Tipo', 'Placa', 'Conductor', 'Km', 'Destino / Origen', 'Observaciones'],
        rows: data.map(m => {
            const fecha = m.fecha_hora || m.created_at;
            return [fecha ? new Date(fecha).toLocaleString('es-CO') : '', m.tipo_movimiento || m.tipo, m.vehiculo_placa || m.placa, m.conductor_nombre || m.conductor, m.kilometraje ?? '', m.destino || m.origen, m.observaciones || m.novedades];
        })
    });
}

export function exportChequeosExcel(data) {
    return _excelFile({
        prefix: 'scv_chequeos', sheetName: 'Chequeos', title: 'SCV — Reporte de Chequeos Preoperacionales',
        headers: ['Fecha', 'Placa', 'Conductor', 'Tipo Chequeo', 'Estado', 'Hallazgos', 'Observaciones'],
        rows: data.map(c => {
            const fecha = c.fecha_hora || c.created_at;
            return [fecha ? new Date(fecha).toLocaleDateString('es-CO') : '', c.vehiculo_placa || c.placa || c.vehiculo?.placa, c.conductor_nombre || c.conductor || c.conductor?.nombre, c.tipo_chequeo || 'Preoperacional', c.estado || 'APROBADO', c.total_hallazgos ?? c.hallazgos ?? 0, c.obs_generales || c.observaciones];
        })
    });
}
export async function exportChequeosPdf(data) {
    return _downloadPdf({
        prefix: 'scv_chequeos', title: 'SCV — Reporte de Chequeos Preoperacionales',
        headers: ['Fecha', 'Placa', 'Conductor', 'Tipo Chequeo', 'Estado', 'Hallazgos', 'Observaciones'],
        rows: data.map(c => {
            const fecha = c.fecha_hora || c.created_at;
            return [fecha ? new Date(fecha).toLocaleDateString('es-CO') : '', c.vehiculo_placa || c.placa || c.vehiculo?.placa, c.conductor_nombre || c.conductor || c.conductor?.nombre, c.tipo_chequeo || 'Preoperacional', c.estado || 'APROBADO', c.total_hallazgos ?? c.hallazgos ?? 0, c.obs_generales || c.observaciones];
        })
    });
}

export function exportHallazgosExcel(data) {
    return _excelFile({
        prefix: 'scv_hallazgos', sheetName: 'Hallazgos', title: 'SCV — Reporte de Hallazgos de Inspección',
        headers: ['ID', 'Vehículo', 'Elemento / Descripción', 'Severidad', 'Fecha Detección', 'Estado'],
        rows: data.map(h => {
            const fecha = h.fecha_deteccion || h.created_at;
            return [h.id, h.vehiculo?.placa || h.vehiculo_placa || h.placa, h.elemento || h.descripcion, h.severidad || h.prioridad, fecha ? new Date(fecha).toLocaleDateString('es-CO') : '', h.estado];
        })
    });
}
export async function exportHallazgosPdf(data) {
    return _downloadPdf({
        prefix: 'scv_hallazgos', title: 'SCV — Reporte de Hallazgos de Inspección',
        headers: ['ID', 'Vehículo', 'Elemento / Descripción', 'Severidad', 'Fecha Detección', 'Estado'],
        rows: data.map(h => {
            const fecha = h.fecha_deteccion || h.created_at;
            return [h.id, h.vehiculo?.placa || h.vehiculo_placa || h.placa, h.elemento || h.descripcion, h.severidad || h.prioridad, fecha ? new Date(fecha).toLocaleDateString('es-CO') : '', h.estado];
        })
    });
}

export function exportOrdenesExcel(data) {
    return _excelFile({
        prefix: 'scv_ordenes', sheetName: 'Órdenes', title: 'SCV — Reporte de Órdenes de Trabajo',
        headers: ['Código', 'Vehículo', 'Descripción / Falla', 'Prioridad', 'Responsable', 'Estado'],
        rows: data.map(o => [o.id || o.codigo, o.vehiculo?.placa || o.vehiculo_placa || o.placa, o.descripcion, o.prioridad, o.responsable?.nombre || o.responsable_externo, o.estado])
    });
}
export async function exportOrdenesPdf(data) {
    return _downloadPdf({
        prefix: 'scv_ordenes', title: 'SCV — Reporte de Órdenes de Trabajo',
        headers: ['Código', 'Vehículo', 'Descripción / Falla', 'Prioridad', 'Responsable', 'Estado'],
        rows: data.map(o => [o.id || o.codigo, o.vehiculo?.placa || o.vehiculo_placa || o.placa, o.descripcion, o.prioridad, o.responsable?.nombre || o.responsable_externo, o.estado])
    });
}

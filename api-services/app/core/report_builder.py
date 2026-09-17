"""
report_builder.py — Generador centralizado de reportes SCV.
Produce archivos XLSX (openpyxl) y PDF (reportlab) con el estilo
visual verde oscuro de Normetales Movilidad.
"""
from __future__ import annotations

import io
from datetime import datetime
from typing import Any, List

# ── Colores corporativos ────────────────────────────────────────────────────
PRIMARY_HEX   = "1E5C35"   # verde oscuro — cabecera banner y thead
ACCENT_HEX    = "2D7A48"   # verde medio — bandas alternas thead
WHITE_HEX     = "FFFFFF"
ROW_ALT_HEX   = "F2F8F4"   # verde muy claro — filas alternas
BORDER_HEX    = "C8DDD1"
TEXT_DARK     = "121D18"
GREEN_TIPO    = "1A7A3F"   # "Entrada"
RED_TIPO      = "C0392B"   # "Salida"


# ═══════════════════════════════════════════════════════════════════════════
#  XLSX
# ═══════════════════════════════════════════════════════════════════════════

def build_xlsx(
    titulo: str,
    subtitulos: List[str],
    columnas: List[str],
    filas: List[List[Any]],
    tipo_col_idx: int | None = None,   # columna con "Entrada"/"Salida" para colorear
) -> bytes:
    """Genera un XLSX estilizado y devuelve los bytes del archivo."""
    from openpyxl import Workbook
    from openpyxl.styles import (
        Font, PatternFill, Alignment, Border, Side, GradientFill
    )
    from openpyxl.utils import get_column_letter

    wb = Workbook()
    ws = wb.active
    ws.title = titulo[:31]  # Excel limita a 31 chars

    n_cols = len(columnas)

    # ── 1. BANNER DE TÍTULO ─────────────────────────────────────────────────
    ws.merge_cells(start_row=1, start_column=1, end_row=2, end_column=n_cols)
    banner_cell = ws.cell(row=1, column=1)
    banner_cell.value = f"SCV — {titulo}"
    banner_cell.font = Font(name="Calibri", bold=True, size=16, color=WHITE_HEX)
    banner_cell.fill = PatternFill("solid", fgColor=PRIMARY_HEX)
    banner_cell.alignment = Alignment(horizontal="left", vertical="center",
                                       indent=1, wrap_text=False)
    ws.row_dimensions[1].height = 28
    ws.row_dimensions[2].height = 10

    # ── 2. LÍNEAS DE METADATA ───────────────────────────────────────────────
    meta_start_row = 3
    for i, sub in enumerate(subtitulos):
        row_idx = meta_start_row + i
        ws.merge_cells(start_row=row_idx, start_column=1,
                       end_row=row_idx, end_column=n_cols)
        cell = ws.cell(row=row_idx, column=1)
        cell.value = sub
        # La primera línea de meta va en negrita (totales)
        cell.font = Font(name="Calibri", size=10,
                         bold=(i == len(subtitulos) - 1),
                         color=TEXT_DARK)
        cell.alignment = Alignment(horizontal="left", vertical="center", indent=1)
        ws.row_dimensions[row_idx].height = 16

    # fila vacía separadora
    sep_row = meta_start_row + len(subtitulos)
    ws.row_dimensions[sep_row].height = 6

    # ── 3. CABECERA DE TABLA ────────────────────────────────────────────────
    header_row = sep_row + 1
    fill_hdr = PatternFill("solid", fgColor=PRIMARY_HEX)
    thin = Side(style="thin", color=BORDER_HEX)
    border_hdr = Border(left=thin, right=thin, top=thin, bottom=thin)

    for col_i, col_name in enumerate(columnas, start=1):
        cell = ws.cell(row=header_row, column=col_i, value=col_name.upper())
        cell.font = Font(name="Calibri", bold=True, size=10, color=WHITE_HEX)
        cell.fill = fill_hdr
        cell.alignment = Alignment(horizontal="center", vertical="center",
                                   wrap_text=True)
        cell.border = border_hdr
    ws.row_dimensions[header_row].height = 24

    # ── 4. FILAS DE DATOS ───────────────────────────────────────────────────
    fill_white = PatternFill("solid", fgColor=WHITE_HEX)
    fill_alt   = PatternFill("solid", fgColor=ROW_ALT_HEX)
    border_row = Border(left=thin, right=thin, top=thin, bottom=thin)

    for row_i, fila in enumerate(filas):
        excel_row = header_row + 1 + row_i
        fill = fill_white if row_i % 2 == 0 else fill_alt
        for col_i, valor in enumerate(fila, start=1):
            cell = ws.cell(row=excel_row, column=col_i, value=valor)
            cell.fill = fill
            cell.border = border_row
            cell.alignment = Alignment(horizontal="center", vertical="center",
                                       wrap_text=False)

            # Color especial para columna Tipo (Entrada/Salida)
            if tipo_col_idx is not None and col_i == tipo_col_idx + 1:
                if isinstance(valor, str):
                    if valor.lower() == "entrada":
                        cell.font = Font(name="Calibri", size=10,
                                         bold=True, color=GREEN_TIPO)
                    elif valor.lower() == "salida":
                        cell.font = Font(name="Calibri", size=10,
                                         bold=True, color=RED_TIPO)
                    else:
                        cell.font = Font(name="Calibri", size=10, color=TEXT_DARK)
                else:
                    cell.font = Font(name="Calibri", size=10, color=TEXT_DARK)
            else:
                cell.font = Font(name="Calibri", size=10, color=TEXT_DARK)

        ws.row_dimensions[excel_row].height = 18

    # ── 5. ANCHO DE COLUMNAS (auto-ajuste) ──────────────────────────────────
    for col_i, col_name in enumerate(columnas, start=1):
        letter = get_column_letter(col_i)
        max_len = len(col_name)
        for fila in filas:
            val = fila[col_i - 1] if col_i - 1 < len(fila) else ""
            max_len = max(max_len, len(str(val)) if val is not None else 0)
        ws.column_dimensions[letter].width = min(max(max_len + 3, 10), 45)

    # ── 6. FREEZE PANES ────────────────────────────────────────────────────
    ws.freeze_panes = ws.cell(row=header_row + 1, column=1)

    buf = io.BytesIO()
    wb.save(buf)
    return buf.getvalue()


# ═══════════════════════════════════════════════════════════════════════════
#  PDF
# ═══════════════════════════════════════════════════════════════════════════

def build_pdf(
    titulo: str,
    subtitulos: List[str],
    columnas: List[str],
    filas: List[List[Any]],
    tipo_col_idx: int | None = None,
) -> bytes:
    """Genera un PDF estilizado y devuelve los bytes del archivo."""
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import landscape, A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import cm
    from reportlab.platypus import (
        SimpleDocTemplate, Table, TableStyle, Paragraph,
        Spacer, HRFlowable,
    )

    COLOR_PRIMARY = colors.HexColor(f"#{PRIMARY_HEX}")
    COLOR_ALT     = colors.HexColor(f"#{ROW_ALT_HEX}")
    COLOR_BORDER  = colors.HexColor(f"#{BORDER_HEX}")
    COLOR_GREEN_T = colors.HexColor(f"#{GREEN_TIPO}")
    COLOR_RED_T   = colors.HexColor(f"#{RED_TIPO}")
    COLOR_DARK    = colors.HexColor(f"#{TEXT_DARK}")

    buf = io.BytesIO()
    page_w, page_h = landscape(A4)

    doc = SimpleDocTemplate(
        buf,
        pagesize=landscape(A4),
        leftMargin=1.5 * cm,
        rightMargin=1.5 * cm,
        topMargin=1.5 * cm,
        bottomMargin=1.5 * cm,
    )

    styles = getSampleStyleSheet()
    story = []

    # ── BANNER ──────────────────────────────────────────────────────────────
    banner_style = ParagraphStyle(
        "Banner",
        fontSize=18,
        fontName="Helvetica-Bold",
        textColor=colors.white,
        backColor=COLOR_PRIMARY,
        leftIndent=10,
        spaceAfter=0,
        spaceBefore=0,
        leading=28,
        borderPadding=(8, 12, 8, 12),
    )
    story.append(Paragraph(f"SCV — {titulo}", banner_style))
    story.append(Spacer(1, 8))

    # ── METADATA ─────────────────────────────────────────────────────────
    meta_normal = ParagraphStyle("MetaNormal", fontSize=9, fontName="Helvetica",
                                  textColor=COLOR_DARK, spaceAfter=2)
    meta_bold   = ParagraphStyle("MetaBold",   fontSize=9, fontName="Helvetica-Bold",
                                  textColor=COLOR_DARK, spaceAfter=6)
    for i, sub in enumerate(subtitulos):
        st = meta_bold if i == len(subtitulos) - 1 else meta_normal
        story.append(Paragraph(sub, st))

    story.append(Spacer(1, 6))
    story.append(HRFlowable(width="100%", thickness=1,
                             color=COLOR_PRIMARY, spaceAfter=6))

    # ── TABLA ──────────────────────────────────────────────────────────────
    usable_width = page_w - 3 * cm  # margen L + R

    # Header row
    header_row_data = [col.upper() for col in columnas]
    table_data = [header_row_data]

    # Filas
    def fmt(v: Any) -> str:
        if v is None:
            return ""
        return str(v)

    for fila in filas:
        table_data.append([fmt(v) for v in fila])

    # Ancho de columnas: distribución proporcional
    col_widths = _calc_col_widths(columnas, filas, usable_width)

    tbl = Table(table_data, colWidths=col_widths, repeatRows=1)

    # Estilo base
    tbl_style = [
        # Header
        ("BACKGROUND",   (0, 0), (-1, 0), COLOR_PRIMARY),
        ("TEXTCOLOR",    (0, 0), (-1, 0), colors.white),
        ("FONTNAME",     (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE",     (0, 0), (-1, 0), 8),
        ("ALIGN",        (0, 0), (-1, 0), "CENTER"),
        ("VALIGN",       (0, 0), (-1, 0), "MIDDLE"),
        ("ROWBACKGROUND", (0, 0), (-1, 0), COLOR_PRIMARY),
        # Data rows
        ("FONTNAME",     (0, 1), (-1, -1), "Helvetica"),
        ("FONTSIZE",     (0, 1), (-1, -1), 8),
        ("ALIGN",        (0, 1), (-1, -1), "CENTER"),
        ("VALIGN",       (0, 1), (-1, -1), "MIDDLE"),
        ("TEXTCOLOR",    (0, 1), (-1, -1), COLOR_DARK),
        # Grid
        ("GRID",         (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ("TOPPADDING",   (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING",  (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
    ]

    # Filas alternas
    for row_i in range(1, len(table_data)):
        if row_i % 2 == 0:
            tbl_style.append(("BACKGROUND", (0, row_i), (-1, row_i), COLOR_ALT))

    # Colorear columna Tipo si aplica
    if tipo_col_idx is not None:
        for row_i, fila in enumerate(filas, start=1):
            if tipo_col_idx < len(fila):
                val = str(fila[tipo_col_idx]).lower()
                if val == "entrada":
                    tbl_style.append(
                        ("TEXTCOLOR", (tipo_col_idx, row_i),
                         (tipo_col_idx, row_i), COLOR_GREEN_T)
                    )
                    tbl_style.append(
                        ("FONTNAME", (tipo_col_idx, row_i),
                         (tipo_col_idx, row_i), "Helvetica-Bold")
                    )
                elif val == "salida":
                    tbl_style.append(
                        ("TEXTCOLOR", (tipo_col_idx, row_i),
                         (tipo_col_idx, row_i), COLOR_RED_T)
                    )
                    tbl_style.append(
                        ("FONTNAME", (tipo_col_idx, row_i),
                         (tipo_col_idx, row_i), "Helvetica-Bold")
                    )

    tbl.setStyle(TableStyle(tbl_style))
    story.append(tbl)

    # ── PIE DE PÁGINA (via onFirstPage) ─────────────────────────────────────
    def _footer(canvas, doc):
        canvas.saveState()
        canvas.setFont("Helvetica", 7)
        canvas.setFillColor(colors.HexColor("#8a9c93"))
        canvas.drawString(
            1.5 * cm, 0.8 * cm,
            f"SCV — Normetales Movilidad | Generado: {datetime.now().strftime('%d/%m/%Y %H:%M')}"
        )
        canvas.drawRightString(
            page_w - 1.5 * cm, 0.8 * cm,
            f"Pág. {doc.page}"
        )
        canvas.restoreState()

    doc.build(story, onFirstPage=_footer, onLaterPages=_footer)
    return buf.getvalue()


# ── Helpers ─────────────────────────────────────────────────────────────────

def _calc_col_widths(columnas: List[str], filas: List[List[Any]],
                     total_width: float) -> List[float]:
    """Calcula anchos de columna proporcionales al contenido máximo."""
    from reportlab.lib.units import cm
    n = len(columnas)
    if n == 0:
        return []

    max_chars = []
    for i, col in enumerate(columnas):
        mx = len(col)
        for fila in filas:
            if i < len(fila):
                mx = max(mx, len(str(fila[i]) if fila[i] is not None else ""))
        max_chars.append(max(mx, 4))

    total_chars = sum(max_chars)
    widths = [(c / total_chars) * total_width for c in max_chars]

    # Asegurar mínimo y máximo
    min_w = 1.2 * cm
    max_w = 6 * cm
    return [max(min_w, min(w, max_w)) for w in widths]

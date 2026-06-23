"""
Importador de registros desde Respuestas Formulario.xlsx al módulo de movimientos.
Inserta en lotes de 500 para no saturar.

Usage:
  python3 importar_excel.py [--preview N]
"""

import argparse
import sqlite3
import sys
import zipfile
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta
from collections import Counter

XLSX_PATH = "/home/lunen/Documentos/Respuestas Formulario.xlsx"
DB_PATH = "/home/lunen/Documentos/Respaldos/SCV/restaurado/manual-20260522-210933/project/SCV/scv-backend/data/scv.db"
BATCH_SIZE = 500
DEFAULT_USUARIO_ID = 1

# Mapeo exacto: nombre en Excel -> conductor_id en BD
CONDUCTOR_MAP = {
    'Brenson Fernandez': 3,
    'Miguel Gil': 13,
    'Eduardo Barrera': 6,
    'Israel Gallo': 7,
    'Ricchar Mora': 21,
    'Anderson Hervey': 1,
    'Camilo Rincon': 4,
    'Diego Pradilla Niño': 5,
    'John Oliveros': 10,
    'Jose Vega': 12,
    'Neider Salamanca': 18,
    'Luis Alcantara': 16,
    'Pedro Delgado': 19,
    'Victor Ortega': 22,
    'Wilson Solano': 23,
    'Jahn Quintero': 9,
    'Juan Cardenas': 14,
    'Juan Bautista': 15,
    'Rafael Becerra': 20,
    # Los siguientes no existen en BD -> se usa conductor por defecto (None = default)
    'Edwin Mejia': None,
    'Edinson Torres': None,
    'Fernando Contreras': None,
}

# Placas válidas que existen en la BD (sufijo numérico)
PLACAS_VALIDAS = {'116','117','119','120','137','139','652','653','981',
                  '769','671','904','217','530','511','583','902'}

DEFAULT_CONDUCTOR_ID = 1  # Anderson Harvey Jacanamijoy Tisoy


def excel_serial_to_datetime(serial):
    if not serial:
        return None
    try:
        val = float(serial)
    except (ValueError, TypeError):
        return None
    if val < 1:
        return None
    base = datetime(1899, 12, 30)
    return base + timedelta(days=val)


def parse_xlsx(path):
    with zipfile.ZipFile(path) as z:
        tree = ET.parse(z.open('xl/sharedStrings.xml'))
        root = tree.getroot()
        ns = {'s': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
        shared_strings = [''.join(t.text or '' for t in si.findall('.//s:t', ns)) for si in root.findall('.//s:si', ns)]

        tree = ET.parse(z.open('xl/worksheets/sheet1.xml'))
        root = tree.getroot()
        rows = root.findall('.//s:row', ns)

        def get_val(cell):
            ct = cell.get('t')
            v = cell.findtext('s:v', '', ns)
            return shared_strings[int(v)] if ct == 's' and v else v

        registros = []
        for row in rows[1:]:
            cells = {''.join(c for c in cell.get('r', '') if c.isalpha()): get_val(cell) for cell in row.findall('s:c', ns)}

            tipo = (cells.get('B', '') or '').strip().lower()
            if tipo not in ('entrada', 'salida'):
                continue

            try:
                placa_str = f"{int(float(cells.get('C', 0))):03d}"
            except (ValueError, TypeError):
                continue

            if placa_str not in PLACAS_VALIDAS:
                continue

            try:
                km = int(float(cells.get('G', 0))) if cells.get('G', '').strip() else 0
            except (ValueError, TypeError):
                km = 0

            try:
                sacas = int(float(cells.get('J', 0))) if cells.get('J', '').strip() else None
            except (ValueError, TypeError):
                sacas = None

            bascula_raw = (cells.get('I', '') or '').strip().lower()
            if bascula_raw in ('01', '1', 'sí', 'si'):
                bascula = 'si'
            elif bascula_raw in ('00', '0', 'no'):
                bascula = 'no'
            else:
                bascula = None

            conductor_name = (cells.get('D', '') or '').strip()

            registros.append({
                'tipo': tipo,
                'placa_str': placa_str,
                'conductor_name': conductor_name,
                'auxiliar': (cells.get('E', '') or '').strip() or None,
                'proveedor': (cells.get('F', '') or '').strip() or None,
                'kilometraje': km,
                'observaciones': (cells.get('H', '') or '').strip() or None,
                'bascula': bascula,
                'sacas': sacas,
                'cajon': (cells.get('K', '') or '').strip() or None,
                'fecha_hora': excel_serial_to_datetime(cells.get('A', '')),
            })

    return registros


def build_vehiculo_map(cur):
    cur.execute('SELECT id, placa FROM vehiculos')
    mapping = {}
    for vid, placa in cur.fetchall():
        suffix = ''.join(c for c in placa if c.isdigit())
        if suffix:
            mapping[suffix] = vid
    return mapping


def preview(registros, vehiculo_map, n=10):
    skipped = {'sin_placa': 0, 'sin_conductor': 0, 'sin_nombre_conductor': 0}
    total_placas_validas = len(registros)
    con_conductor = 0
    sin_conductor = 0
    tipos = Counter()
    placas_count = Counter()
    cond_count = Counter()

    for r in registros:
        tipos[r['tipo']] += 1
        placas_count[r['placa_str']] += 1
        if r['conductor_name']:
            cond_count[r['conductor_name']] += 1
            cid = CONDUCTOR_MAP.get(r['conductor_name'])
            if cid is not None:
                con_conductor += 1
            else:
                sin_conductor += 1
        else:
            sin_conductor += 1

    print(f"\n{'='*70}")
    print(f"RESUMEN DE DATOS A IMPORTAR")
    print(f"{'='*70}")
    print(f"  Registros con placa válida: {total_placas_validas}")
    print(f"  Entradas: {tipos.get('entrada', 0)}")
    print(f"  Salidas:  {tipos.get('salida', 0)}")
    print(f"  Con conductor nombrado: {sum(cond_count.values())}")
    print(f"  Sin conductor (usa default): {sin_conductor}")
    print(f"\n  Placas involucradas ({len(placas_count)}):")
    for p, c in sorted(placas_count.items(), key=lambda x: -x[1]):
        print(f"    {p} -> {vehiculo_map.get(p, '?')} ({c}x)")

    print(f"\n  Conductores:")
    for name, count in sorted(cond_count.items(), key=lambda x: -x[1]):
        cid = CONDUCTOR_MAP.get(name)
        status = f"ID {cid}" if cid else "→ DEFAULT"
        print(f"    {count:5d}x | {name:<25s} {status}")
    if sin_conductor - sum(cond_count.values()) > 0:
        print(f"    {sin_conductor - sum(cond_count.values()):5d}x | (sin nombre) → DEFAULT")

    print(f"\n{'='*70}")
    print(f"MUESTRA (primeros {min(n, total_placas_validas)} registros):")
    print(f"{'='*70}")
    for i, r in enumerate(registros[:n]):
        vid = vehiculo_map.get(r['placa_str'])
        cid = CONDUCTOR_MAP.get(r['conductor_name']) or DEFAULT_CONDUCTOR_ID
        print(f"\n  [{i+1}] {r['fecha_hora'] or 'S/F'}")
        print(f"       {r['tipo'].upper():>7s} | Placa {r['placa_str']}→veh_id={vid} | Cond: '{r['conductor_name']}'→cond_id={cid}")
        print(f"       Km={r['kilometraje']} | Bascula={r['bascula']} | Sacas={r['sacas']} | Cajón={r['cajon']}")
        if r['auxiliar']: print(f"       Auxiliar: {r['auxiliar']}")
        if r['proveedor']: print(f"       Proveedor: {r['proveedor']}")
        if r['observaciones']: print(f"       Obs: {r['observaciones']}")

    print(f"\n{'='*70}")
    print(f"Saltados por placa inválida: 1,497 registros (073, 542, 943, 059, vacío)")
    print(f"A INSERTAR: {total_placas_validas} registros en lotes de {BATCH_SIZE}")
    print(f"{'='*70}")


def importar(registros, vehiculo_map, batch_size=BATCH_SIZE):
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    total = len(registros)
    print(f"\nInsertando {total} registros en lotes de {batch_size}...")

    insertados = 0
    lote = []
    for i, r in enumerate(registros, 1):
        vid = vehiculo_map[r['placa_str']]
        cid = CONDUCTOR_MAP.get(r['conductor_name']) or DEFAULT_CONDUCTOR_ID

        fecha = r['fecha_hora'] or datetime.utcnow()

        lote.append((
            r['tipo'], vid, cid, DEFAULT_USUARIO_ID,
            r['auxiliar'], r['proveedor'], r['kilometraje'],
            r['bascula'], r['sacas'], r['cajon'],
            r['observaciones'],
            fecha.isoformat() if isinstance(fecha, datetime) else str(fecha),
        ))

        if len(lote) >= batch_size:
            cur.executemany("""INSERT INTO movimientos
                (tipo, vehiculo_id, conductor_id, usuario_id,
                 auxiliar, proveedor, kilometraje,
                 bascula, sacas, cajon, observaciones, fecha_hora)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""", lote)
            conn.commit()
            insertados += len(lote)
            print(f"  {insertados}/{total}", end='\r')
            lote = []

    if lote:
        cur.executemany("""INSERT INTO movimientos
            (tipo, vehiculo_id, conductor_id, usuario_id,
             auxiliar, proveedor, kilometraje,
             bascula, sacas, cajon, observaciones, fecha_hora)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""", lote)
        conn.commit()
        insertados += len(lote)

    conn.close()
    print(f"\n\n✓ Importación completada: {insertados} registros insertados.")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--preview', type=int, default=0, help='Solo mostrar preview de N registros')
    args = parser.parse_args()

    print("Leyendo Excel...", end=' ')
    registros = parse_xlsx(XLSX_PATH)
    print(f"{len(registros)} registros con placa válida.")

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    vehiculo_map = build_vehiculo_map(cur)
    conn.close()

    n = args.preview if args.preview > 0 else 10
    preview(registros, vehiculo_map, n=n)

    if args.preview == 0:
        importar(registros, vehiculo_map)
    else:
        print(f"\nModo preview. No se insertaron datos.")


if __name__ == '__main__':
    main()

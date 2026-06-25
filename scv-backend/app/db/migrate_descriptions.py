import sqlite3

SECCIONES_MAP = {
    "frenos_direccion": "Frenos y Dirección",
    "luces_cabina": "Luces y Cabina",
    "niveles_estado_general": "Niveles y Estado General",
    "equipo_carreteras_extintor": "Equipo de Carreteras y Extintor",
    "kit_herramientas_verificaciones": "Kit de Herramientas y Verificaciones"
}

VALORES_MANTENIMIENTO = {"no_conforme", "mal_estado", "largo", "genera_ruido", "vibra", "tira_lado", "bajo", "presenta_fugas", "no_tiene", "incompleto"}

def migrate():
    conn = sqlite3.connect('/app/data/scv.db')
    cur = conn.cursor()

    # Query all chequeos
    cur.execute("SELECT id FROM chequeos")
    chequeo_ids = [row[0] for row in cur.fetchall()]

    print(f"Iniciando migración de descripciones para {len(chequeo_ids)} chequeos...")

    for ch_id in chequeo_ids:
        # Get failing items
        cur.execute("""
            SELECT seccion, item, valor, observacion, marcar_mantenimiento 
            FROM chequeo_items 
            WHERE chequeo_id = ?
        """, (ch_id,))
        
        items = cur.fetchall()
        items_con_mantenimiento = []
        for seccion, item, valor, observacion, marcar_mantenimiento in items:
            requiere_mante = (
                marcar_mantenimiento or
                valor in VALORES_MANTENIMIENTO or
                observacion
            )
            if requiere_mante:
                items_con_mantenimiento.append({
                    'seccion': seccion,
                    'item': item,
                    'observacion': observacion
                })

        if items_con_mantenimiento:
            secciones_fallidas = {}
            for ci in items_con_mantenimiento:
                sec_nombre = SECCIONES_MAP.get(ci['seccion'], ci['seccion'].replace("_", " ").title())
                if sec_nombre not in secciones_fallidas:
                    secciones_fallidas[sec_nombre] = []
                
                detalles_item = ci['item'].replace("_", " ").capitalize()
                obs = ci['observacion']
                if obs and obs.strip().lower() != "sin observacion" and obs.strip().lower() != "sin observación":
                    detalles_item += f": {obs}"
                secciones_fallidas[sec_nombre].append(detalles_item)
            
            partes_desc = []
            for sec, items_list in secciones_fallidas.items():
                partes_desc.append(f"Fallo en {sec} ({', '.join(items_list)})")
            
            descripcion_limpia = f"Chequeo {ch_id}: " + "; ".join(partes_desc)
            descripcion_limpia = descripcion_limpia[:500]

            # Update hallazgos
            cur.execute("""
                UPDATE hallazgos 
                SET descripcion = ? 
                WHERE chequeo_id = ? AND origen = 'chequeo'
            """, (descripcion_limpia, ch_id))

            # Update mantenimientos
            cur.execute("""
                UPDATE mantenimientos 
                SET descripcion = ? 
                WHERE chequeo_origen_id = ? AND tipo = 'correctivo'
            """, (descripcion_limpia, ch_id))

    conn.commit()
    print("Migración finalizada exitosamente.")
    conn.close()

if __name__ == '__main__':
    migrate()

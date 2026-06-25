import sqlite3

def run_migration():
    conn = sqlite3.connect('/app/data/scv.db')
    cursor = conn.cursor()

    cursor.execute("PRAGMA foreign_keys=off;")
    
    # Get current schema for debug
    cursor.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='ordenes_trabajo'")
    row = cursor.fetchone()
    if row:
        print("Old schema:", row[0])
    
    # Check if there are columns we might miss
    cursor.execute("PRAGMA table_info(ordenes_trabajo)")
    columns = [row[1] for row in cursor.fetchall()]
    print("Columns:", columns)
    
    # Create new table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS ordenes_trabajo_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hallazgo_id INTEGER UNIQUE REFERENCES hallazgos(id),
        vehiculo_id INTEGER NOT NULL REFERENCES vehiculos(id),
        responsable_id INTEGER REFERENCES usuarios(id),
        prioridad VARCHAR(20) NOT NULL DEFAULT 'media',
        estado VARCHAR(30) NOT NULL DEFAULT 'pendiente',
        descripcion TEXT,
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        fecha_inicio DATETIME,
        fecha_cierre DATETIME,
        hora_inicio VARCHAR(10),
        hora_fin VARCHAR(10),
        responsable_externo VARCHAR(255)
    )
    """)
    
    # Make sure we only insert columns that exist in old table
    cols_to_copy = []
    for col in ["id", "hallazgo_id", "vehiculo_id", "responsable_id", "prioridad", "estado", "descripcion", "fecha_creacion", "fecha_inicio", "fecha_cierre", "hora_inicio", "hora_fin", "responsable_externo"]:
        if col in columns:
            cols_to_copy.append(col)
            
    cols_str = ", ".join(cols_to_copy)
    
    cursor.execute(f"INSERT INTO ordenes_trabajo_new ({cols_str}) SELECT {cols_str} FROM ordenes_trabajo")
    
    cursor.execute("DROP TABLE ordenes_trabajo")
    cursor.execute("ALTER TABLE ordenes_trabajo_new RENAME TO ordenes_trabajo")
    
    conn.commit()
    conn.close()
    print("Migration successful")

if __name__ == '__main__':
    run_migration()

from app.database import engine

try:
    conn = engine.connect()
    print("✓ Database connection successful!")
    print(conn)
    conn.close()
except Exception as e:
    print(f"✗ Database connection failed: {e}")

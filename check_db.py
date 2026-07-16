import sqlite3
from pathlib import Path

db_path = Path('backend/data/support_crm.db')
if db_path.exists():
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Check admin_users table
    cursor.execute('SELECT COUNT(*) as count FROM admin_users')
    count = cursor.fetchone()
    print(f'Admin users count: {count["count"]}')
    
    # List all admin users
    cursor.execute('SELECT id, email, hashed_password FROM admin_users')
    for row in cursor.fetchall():
        print(f'ID: {row["id"]}, Email: {row["email"]}, HashedPwd: {row["hashed_password"][:20]}...')
    
    conn.close()
else:
    print('Database not found')

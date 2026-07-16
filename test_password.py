import sqlite3
import bcrypt
from pathlib import Path

db_path = Path('backend/data/support_crm.db')
if db_path.exists():
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Get admin user
    cursor.execute('SELECT hashed_password FROM admin_users WHERE email = ?', ('admin@example.com',))
    admin = cursor.fetchone()
    
    if admin:
        hashed_pwd = admin["hashed_password"]
        password_to_check = "admin123"
        
        print(f'Hashed password from DB: {hashed_pwd}')
        print(f'Password to check: {password_to_check}')
        
        # Test verification
        try:
            is_valid = bcrypt.checkpw(password_to_check.encode(), hashed_pwd.encode())
            print(f'Verification result: {is_valid}')
        except Exception as e:
            print(f'Error during verification: {e}')
    
    conn.close()
else:
    print('Database not found')

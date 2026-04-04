import psycopg2
from psycopg2 import extensions

def create_db():
    try:
        # Connect to default postgres database
        conn = psycopg2.connect(
            dbname='postgres',
            user='root',
            password='root',
            host='localhost',
            port='5432'
        )
    except:
        # Try without user/pass if that fails
        try:
            conn = psycopg2.connect(
                dbname='postgres',
                host='localhost',
                port='5432'
            )
        except Exception as e:
            print(f"Failed to connect: {e}")
            return

    conn.set_isolation_level(extensions.ISOLATION_LEVEL_AUTOCOMMIT)
    cursor = conn.cursor()
    
    try:
        cursor.execute('CREATE DATABASE location_db')
        print("Database location_db created successfully!")
    except psycopg2.errors.DuplicateDatabase:
        print("Database location_db already exists.")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    create_db()

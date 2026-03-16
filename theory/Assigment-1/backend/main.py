from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import psycopg2
import os
import time

app = FastAPI()

DB_HOST = os.getenv("DB_HOST", "db")
DB_NAME = os.getenv("DB_NAME", "appdb")
DB_USER = os.getenv("DB_USER", "appuser")
DB_PASS = os.getenv("DB_PASS", "apppassword")

def get_conn():
    return psycopg2.connect(
        host=DB_HOST, dbname=DB_NAME,
        user=DB_USER, password=DB_PASS
    )

def init_db():
    for i in range(10):
        try:
            conn = get_conn()
            cur = conn.cursor()
            cur.execute("""
                CREATE TABLE IF NOT EXISTS records (
                    id SERIAL PRIMARY KEY,
                    name TEXT NOT NULL,
                    value TEXT NOT NULL
                )
            """)
            conn.commit()
            cur.close()
            conn.close()
            print("DB initialized")
            return
        except Exception as e:
            print(f"DB not ready ({e}), retrying in 3s...")
            time.sleep(3)
    raise Exception("Could not connect to DB after 10 retries")

@app.on_event("startup")
def startup():
    init_db()

class Record(BaseModel):
    name: str
    value: str

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/records")
def create_record(record: Record):
    try:
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO records (name, value) VALUES (%s, %s) RETURNING id",
            (record.name, record.value)
        )
        new_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        return {"id": new_id, "name": record.name, "value": record.value}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/records")
def get_records():
    try:
        conn = get_conn()
        cur = conn.cursor()
        cur.execute("SELECT id, name, value FROM records")
        rows = cur.fetchall()
        cur.close()
        conn.close()
        return [{"id": r[0], "name": r[1], "value": r[2]} for r in rows]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
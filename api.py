from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3
from datetime import datetime

app = FastAPI()

# Add CORS middleware with appropriate configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with specific origin(s) as needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)




class ActivityInput(BaseModel):
    topic: str
    subtopic: str
    start_date: str
    end_date: str

def create_activity_table():
    conn = sqlite3.connect("activity_tracker.db")
    cursor = conn.cursor()
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS activities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        start_date DATETIME,
        end_date DATETIME,
        topic TEXT,
        subtopic TEXT
    );
    ''')
    conn.commit()

def insert_activity(topic, subtopic, start_date, end_date):
    conn = sqlite3.connect("activity_tracker.db")
    cursor = conn.cursor()
    cursor.execute('''
    INSERT INTO activities (start_date, end_date, topic, subtopic)
    VALUES (?, ?, ?, ?);
    ''', (start_date, end_date, topic, subtopic))
    conn.commit()

def list_activities(start_date, end_date):
    conn = sqlite3.connect("activity_tracker.db")
    cursor = conn.cursor()
    cursor.execute('''
    SELECT start_date, end_date, topic, subtopic
    FROM activities
    WHERE start_date >= ? AND end_date <= ?;
    ''', (start_date, end_date))
    activities = cursor.fetchall()
    return activities

@app.on_event("startup")
async def startup_event():
    create_activity_table()

@app.post("/add_activity")
def start_new_activity(activity_input: ActivityInput):
    try:
        topic = activity_input.topic
        subtopic = activity_input.subtopic
        start_date = activity_input.start_date
        end_date = activity_input.end_date

        if topic and subtopic and start_date and end_date:
            insert_activity(topic, subtopic, start_date, end_date)
            conn.commit()  # Commit the transaction after inserting data
            return {"message": "Activity inserted successfully."}
        else:
            raise HTTPException(status_code=400, detail="Missing required fields in request data.")
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/list_activities")
def list_user_activities(start_date: str, end_date: str):
    try:
        activities = list_activities(start_date, end_date)
        return {"activities": activities}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

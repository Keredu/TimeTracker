from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3
from datetime import datetime
from typing import List, Optional  # Import the Optional type

app = FastAPI()

# Add CORS middleware with appropriate configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with specific origin(s) as needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Topic(BaseModel):
    id: int
    name: str

class Subtopic(BaseModel):
    id: int
    topic_id: int
    name: str

class ActivityInput(BaseModel):
    id: Optional[int] = None
    topic: Optional[str] = None 
    subtopic: Optional[str] = None 
    start_date: Optional[str] = None 
    end_date: Optional[str] = None 

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

def create_topic_table():
    conn = sqlite3.connect("activity_tracker.db")
    cursor = conn.cursor()
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS topics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT
    );
    ''')
    conn.commit()
    conn.close()

def create_subtopic_table():
    conn = sqlite3.connect("activity_tracker.db")
    cursor = conn.cursor()
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS subtopics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        topic_id INTEGER,
        name TEXT,
        FOREIGN KEY (topic_id) REFERENCES topics (id)
    );
    ''')
    conn.commit()
    conn.close()

def populate_topics_and_subtopics():
    create_topic("Programming")
    create_topic("Science")
    create_topic("History")
    
    create_subtopic(1, "Python")
    create_subtopic(1, "Java")
    create_subtopic(2, "Biology")
    create_subtopic(2, "Physics")
    create_subtopic(3, "Ancient Civilizations")

def insert_activity(topic, subtopic, start_date):
    conn = sqlite3.connect("activity_tracker.db")
    cursor = conn.cursor()
    cursor.execute('''
    INSERT INTO activities (start_date, topic, subtopic)
    VALUES (?, ?, ?);
    ''', (start_date, topic, subtopic))
    conn.commit()

    # Get the ID of the last inserted row
    inserted_id = cursor.lastrowid
    return inserted_id

def finish_activity_in_db(activity_id, end_date):
    conn = sqlite3.connect("activity_tracker.db")
    cursor = conn.cursor()

    cursor.execute('SELECT id FROM activities WHERE id = ?', (activity_id,))
    activity = cursor.fetchone()

    if not activity:
        raise HTTPException(status_code=404, detail=f"Activity with id {activity_id} not found.")

    cursor.execute('UPDATE activities SET end_date = ? WHERE id = ?', (end_date, activity_id))
    conn.commit()

def get_topics_from_db():
    conn = sqlite3.connect("activity_tracker.db")
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM topics")
    topics = cursor.fetchall()
    conn.close()
    return [Topic(id=topic[0], name=topic[1]) for topic in topics]

def get_subtopics_by_topic_id(topic_id):
    conn = sqlite3.connect("activity_tracker.db")
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM subtopics WHERE topic_id=?", (topic_id,))
    subtopics = cursor.fetchall()
    conn.close()
    return [Subtopic(id=subtopic[0], topic_id=subtopic[1], name=subtopic[2]) for subtopic in subtopics]


def create_topic(name):
    conn = sqlite3.connect("activity_tracker.db")
    cursor = conn.cursor()
    cursor.execute("INSERT INTO topics (name) VALUES (?)", (name,))
    conn.commit()
    conn.close()

def create_subtopic(topic_id, name):
    conn = sqlite3.connect("activity_tracker.db")
    cursor = conn.cursor()
    cursor.execute("INSERT INTO subtopics (topic_id, name) VALUES (?, ?)", (topic_id, name))
    conn.commit()
    conn.close()

from typing import List

def get_not_done_activities_from_db():
    conn = sqlite3.connect("activity_tracker.db")
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM activities WHERE end_date IS NULL')
    not_done_activities = cursor.fetchall()

    activities = []
    for row in not_done_activities:
        activity = {
            "id": row[0],
            "start_date": row[1],
            "end_date": row[2],
            "topic": row[3],
            "subtopic": row[4]
        }
        activities.append(activity)

    return activities

def delete_activity_from_db(activity_id):
    conn = sqlite3.connect("activity_tracker.db")
    cursor = conn.cursor()

    cursor.execute('SELECT id FROM activities WHERE id = ?', (activity_id,))
    activity = cursor.fetchone()

    if not activity:
        raise HTTPException(status_code=404, detail=f"Activity with id {activity_id} not found.")

    cursor.execute('DELETE FROM activities WHERE id = ?', (activity_id,))
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
    create_topic_table()
    create_subtopic_table()
    populate_topics_and_subtopics()

@app.post("/add_activity")
def start_new_activity(activity_input: ActivityInput):
    try:
        topic = activity_input.topic
        subtopic = activity_input.subtopic
        start_date = activity_input.start_date
        print(activity_input)
        if topic and subtopic and start_date:
            inserted_id = insert_activity(topic, subtopic, start_date)
            return {"message": "Activity inserted successfully.", "id": inserted_id}
        else:
            raise HTTPException(status_code=400, detail="Missing required fields in request data.")
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))
    
@app.post("/finish_activity/{activity_id}")
def finish_activity(activity_id: int, activity_input: ActivityInput):
    print(activity_id)
    try:
        end_date = activity_input.end_date
        finish_activity_in_db(activity_id, end_date)
        return {"message": f"Activity {activity_id} has been updated with end date {end_date}"}
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/get_not_dones", response_model=List[ActivityInput])
def get_not_dones():
    try:
        not_done_activities = get_not_done_activities_from_db()
        return not_done_activities
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/delete_activity/{activity_id}")
def delete_activity(activity_id: int):
    try:
        delete_activity_from_db(activity_id)
        return {"message": f"Activity {activity_id} has been deleted"}
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/get_topics", response_model=List[Topic])
def get_topics():
    try:
        topics = get_topics_from_db()
        return topics
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/get_subtopics/{topic_id}", response_model=List[Subtopic])
def get_subtopics(topic_id: int):
    try:
        subtopics = get_subtopics_by_topic_id(topic_id)
        return subtopics
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

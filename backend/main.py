from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from typing import List, Optional
from pydantic import BaseModel
import json
import uuid
import os
from datetime import date

# -------------------------------------------
# If you need AWS Lambda serverless support, install mangum
# and uncomment the following import and handler line.
# -------------------------------------------
# from mangum import Mangum

app = FastAPI()

# Allow CORS (adjust allowed origins for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change "*" to specific origins for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Use an environment variable for the data file if needed
DATA_FILE = os.getenv("DATABASE_FILE", "database.json")

# Create the JSON file if it doesn't exist.
if not os.path.exists(DATA_FILE):
    with open(DATA_FILE, "w") as f:
        json.dump({"users": [], "tasks": []}, f)

def read_data():
    with open(DATA_FILE, "r") as f:
        return json.load(f)

def write_data(data):
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=4)

# ------------------ Data Models ------------------
class TaskBase(BaseModel):
    description: str
    deadline: Optional[str] = None
    start_date: Optional[str] = None
    responsible_person: Optional[str] = None

class TaskCreate(TaskBase):
    pass

class Task(TaskBase):
    id: str
    completed: bool = False
    user: str

class User(BaseModel):
    username: str
    password: str
    name: Optional[str] = None
    phone: Optional[str] = None

# ------------------ Authentication Helpers ------------------
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

def fake_decode_token(token: str):
    # In production, decode and verify a JWT using a secret key (optionally from an env variable)
    # Example: SECRET_KEY = os.getenv("SECRET_KEY", "fallback-secret-key")
    return token

def get_current_user(token: str = Depends(oauth2_scheme)):
    data = read_data()
    user_identifier = fake_decode_token(token)
    for u in data.get("users", []):
        if u["username"] == user_identifier:
            return user_identifier
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid authentication credentials"
    )

# ------------------ Authentication Endpoints ------------------
@app.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    data = read_data()
    for user in data.get("users", []):
        if user["username"] == form_data.username:
            if user["password"] == form_data.password:
                return {"access_token": user["username"], "token_type": "bearer"}
            else:
                raise HTTPException(status_code=400, detail="Incorrect password")
    raise HTTPException(status_code=400, detail="User not found, please sign up.")

@app.post("/signup")
async def signup(user: User):
    data = read_data()
    for existing in data.get("users", []):
        if existing["username"] == user.username:
            raise HTTPException(status_code=400, detail="User already exists, please sign in.")
    new_user = user.dict()
    data["users"].append(new_user)
    write_data(data)
    return {"access_token": user.username, "token_type": "bearer"}

# ------------------ Task Endpoints ------------------
@app.post("/tasks", response_model=Task)
async def add_task(task: TaskCreate, current_user: str = Depends(get_current_user)):
    data = read_data()
    task_id = str(uuid.uuid4())
    # Use today’s date if start_date is not provided
    start_date_str = task.start_date if task.start_date else date.today().isoformat()
    new_task = {
        "id": task_id,
        "description": task.description,
        "deadline": task.deadline,
        "start_date": start_date_str,
        "responsible_person": task.responsible_person,
        "completed": False,
        "user": current_user
    }
    data["tasks"].append(new_task)
    write_data(data)
    return new_task

@app.get("/tasks", response_model=List[Task])
async def get_tasks(all: bool = False, current_user: str = Depends(get_current_user)):
    data = read_data()
    if all:
        return [Task(**t) for t in data["tasks"]]
    return [Task(**t) for t in data["tasks"] if t["user"] == current_user]

@app.put("/tasks/{task_id}/complete", response_model=Task)
async def complete_task(task_id: str, current_user: str = Depends(get_current_user)):
    data = read_data()
    for t in data["tasks"]:
        if t["id"] == task_id and t["user"] == current_user:
            t["completed"] = True
            write_data(data)
            return t
    raise HTTPException(status_code=404, detail="Task not found")

@app.delete("/tasks/{task_id}")
async def delete_task(task_id: str, current_user: str = Depends(get_current_user)):
    data = read_data()
    for idx, t in enumerate(data["tasks"]):
        if t["id"] == task_id and t["user"] == current_user:
            data["tasks"].pop(idx)
            write_data(data)
            return {"detail": "Task deleted"}
    raise HTTPException(status_code=404, detail="Task not found")

# ------------------ Optional Serverless Deployment ------------------
# Uncomment the following line if you installed mangum and want AWS Lambda support.
# handler = Mangum(app)

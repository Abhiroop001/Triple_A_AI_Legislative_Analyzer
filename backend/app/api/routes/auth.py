from fastapi import APIRouter, HTTPException
from app.schemas.auth_schema import Register, Login
from app.core.security import hash_password, verify_password, create_token
from app.core.firebase import db

router = APIRouter()

@router.post("/register")
def register(user: Register):

    users = db.collection("users")
    existing = users.where("email", "==", user.email).limit(1).stream()
    if list(existing):
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed = hash_password(user.password)

    users.add({
        "email": user.email,
        "password": hashed
    })

    token = create_token({"email": user.email})

    return {"message": "User registered", "token": token}


@router.post("/login")
def login(user: Login):

    users = db.collection("users")

    query = users.where("email", "==", user.email).limit(1).stream()
    user_list = list(query)

    if not user_list:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    data = user_list[0].to_dict()

    if not verify_password(user.password, data["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_token({"email": user.email})

    return {"token": token}
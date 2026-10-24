from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import engine, Base, get_db
import models
import schemas
from hashing import Hash

# Δημιουργία των πινάκων στη βάση (αν δεν υπάρχουν)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="ASOEE Marketplace API")

@app.get("/")
def read_root():
    return {"message": "Welcome to ASOEE Marketplace API"}

# --- ΕΝΔΩΜΑΤΩΣΗ ΕΓΓΡΑΦΗΣ ΧΡΗΣΤΗ (SIGN UP) ---
@app.post("/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):

    hashed_password = Hash.encrypt(request.password)

    new_user = models.User(
        username = request.username,
        email = request.email,
        password = hashed_password  
    )
    
    # 5. Προσθήκη στη βάση και αποθήκευση (Commit)
    db.add(new_user)
    db.commit()
    db.refresh(new_user) # Ανανέωση για να πάρει το ID που του έδωσε η βάση

    return new_user
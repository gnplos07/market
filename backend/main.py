from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import engine, Base, get_db
import models
import schemas

# Δημιουργία των πινάκων στη βάση (αν δεν υπάρχουν)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="ASOEE Marketplace API")

@app.get("/")
def read_root():
    return {"message": "Welcome to ASOEE Marketplace API"}

# --- ΕΝΔΩΜΑΤΩΣΗ ΕΓΓΡΑΦΗΣ ΧΡΗΣΤΗ (SIGN UP) ---
@app.post("/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    
    # 1. Έλεγχος αν υπάρχει ήδη χρήστης με αυτό το email στη βάση
    existing_user_email = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
        
    # 2. Έλεγχος αν υπάρχει ήδη χρήστης με αυτό το username
    existing_user_name = db.query(models.User).filter(models.User.username == user.username).first()
    if existing_user_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )

    # 3. Προσωρινή αποθήκευση κωδικού (Αργότερα θα βάλουμε κρυπτογράφηση)
    # Εδώ κανονικά θα κάναμε hash τον κωδικό, αλλά για τώρα ας το δούμε απλό
    fake_hashed_password = user.password + "_not_really_hashed"

    # 4. Δημιουργία του νέου User object με βάση το SQLAlchemy Model
    new_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=fake_hashed_password
    )

    # 5. Προσθήκη στη βάση και αποθήκευση (Commit)
    db.add(new_user)
    db.commit()
    db.refresh(new_user) # Ανανέωση για να πάρει το ID που του έδωσε η βάση

    # 6. Επιστροφή του χρήστη (Το Pydantic θα φροντίσει να κρύψει τον κωδικό!)
    return new_user
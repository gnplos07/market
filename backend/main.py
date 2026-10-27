from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import engine, Base, get_db
import models
import schemas
from hashing import Hash
from token import create_access_token
from oauth2 import get_current_user

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

@app.post("/login")
def login(request: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    
    # 1. Ψάχνουμε στη βάση αν υπάρχει χρήστης με αυτό το username
    user = db.query(models.User).filter(models.User.username == request.username).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid credentials (User not found)"
        )
    
    # 2. Ελέγχουμε αν ο κωδικός ταιριάζει με το hash της βάσης
    if not Hash.verify(request.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect password"
        )
    
    # 3. Αν όλα είναι σωστά, δημιουργούμε το JWT Token
    access_token = create_access_token(data={"sub": user.email})
    
    # 4. Επιστρέφουμε το token πίσω στον client
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/users/me")
def get_current_user_profile(current_user: str = Depends(get_current_user)):
    return { 
        "message": " Access approved ",
        "current_user_email": current_user 

    }

@app.post("/books",response_model= schemas.BookResponse)
def create_book(
    book: schemas.BookCreate,
    db: Session = Depends(get_db),
    current_user : str = Depends(get_current_user)
):
    user = db.query(models.User).filter(models.User.email == current_user).first()

    new_book = models.Book(
        title=book.title,
        price=book.price,
        description=book.description,
        state=book.state,
        owner_id=user.id)

    db.add(new_book)
    db.commit()
    db.refresh(new_book)
    
    return new_book
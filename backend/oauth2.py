from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
import os 

oauth2_scheme = OAuth2PasswordBearer(tokenUrl= "login")

SECRET_KEY = os.getenv("SECRET_KEY", "super_secret_fallback_key_12345")
ALGORITHM = "HS256"
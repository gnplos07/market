from datetime import datetime, timedelta
import os
from jose import jtw

SECRET_KEY = os.getenv("SECRET_KEY", "super_secret_key_fallback")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRES_TIME = 30 

def create_access_token(data:dict):
    to_encode = data.copy()
    expire = datetime.utcnow()+ timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
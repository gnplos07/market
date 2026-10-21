from fastapi import FastAPI

Base.metadata.create_all(bind=engine)
app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Το API ανανεώνεται αυτόματα"}

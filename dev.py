import uvicorn
from fastapi import Request
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from api.index import app

# Mount static files for local development
app.mount("/static", StaticFiles(directory="static"), name="static")

# Route for index.html
@app.get("/")
async def serve_index(request: Request):
    return FileResponse("index.html")

if __name__ == "__main__":
    print("Running local development server at http://127.0.0.1:8000")
    uvicorn.run("dev:app", host="127.0.0.1", port=8000, reload=True)

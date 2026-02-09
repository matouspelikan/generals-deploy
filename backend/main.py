import os
import sys
import uuid
import tempfile
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware

GENERALS_BOTS_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../generals-bots'))
if GENERALS_BOTS_PATH not in sys.path:
    sys.path.insert(0, GENERALS_BOTS_PATH)

from game_runner import run_simulation

app = FastAPI(title="Generals Deploy", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = Path(tempfile.gettempdir()) / "generals_deploy_models"
UPLOAD_DIR.mkdir(exist_ok=True)

uploaded_models = {}


@app.post("/api/upload")
async def upload_model(
    file: UploadFile = File(...),
    agent_slot: int = Form(...)
):
    if agent_slot not in [0, 1]:
        raise HTTPException(status_code=400, detail="agent_slot must be 0 or 1")
    
    if not file.filename.endswith('.eqx'):
        raise HTTPException(status_code=400, detail="File must be a .eqx model file")
    
    model_id = str(uuid.uuid4())
    file_path = UPLOAD_DIR / f"{model_id}.eqx"
    
    content = await file.read()
    with open(file_path, 'wb') as f:
        f.write(content)
    
    uploaded_models[model_id] = {
        'path': str(file_path),
        'original_name': file.filename,
        'agent_slot': agent_slot
    }
    
    return {
        'success': True,
        'model_id': model_id,
        'filename': file.filename
    }


@app.post("/api/simulate")
async def simulate_game(
    agent_0_type: str = Form(...),
    agent_1_type: str = Form(...),
    model_0_id: Optional[str] = Form(None),
    model_1_id: Optional[str] = Form(None),
    grid_size: int = Form(8),
    max_turns: int = Form(500),
    seed: Optional[int] = Form(None)
):
    valid_types = ['ppo', 'expander', 'random']
    if agent_0_type not in valid_types:
        raise HTTPException(status_code=400, detail=f"Invalid agent_0_type: {agent_0_type}")
    if agent_1_type not in valid_types:
        raise HTTPException(status_code=400, detail=f"Invalid agent_1_type: {agent_1_type}")
    
    model_0_path = None
    model_1_path = None
    
    if agent_0_type == 'ppo':
        if not model_0_id or model_0_id not in uploaded_models:
            raise HTTPException(status_code=400, detail="PPO agent 0 requires a valid model_0_id")
        model_0_path = uploaded_models[model_0_id]['path']
    
    if agent_1_type == 'ppo':
        if not model_1_id or model_1_id not in uploaded_models:
            raise HTTPException(status_code=400, detail="PPO agent 1 requires a valid model_1_id")
        model_1_path = uploaded_models[model_1_id]['path']
    
    if grid_size < 4 or grid_size > 16:
        raise HTTPException(status_code=400, detail="grid_size must be between 4 and 16")
    
    if seed is None:
        import random
        seed = random.randint(0, 2**31 - 1)
    
    try:
        result = run_simulation(
            agent_0_type=agent_0_type,
            agent_1_type=agent_1_type,
            model_0_path=model_0_path,
            model_1_path=model_1_path,
            grid_size=grid_size,
            max_turns=max_turns,
            seed=seed
        )
        return JSONResponse(content=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/health")
async def health_check():
    return {"status": "ok"}


FRONTEND_DIR = Path(__file__).parent.parent / "frontend"

@app.get("/")
async def serve_index():
    return FileResponse(FRONTEND_DIR / "index.html")


if FRONTEND_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(FRONTEND_DIR)), name="static")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

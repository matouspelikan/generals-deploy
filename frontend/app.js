const state = {
    models: {
        0: { id: null, filename: null },
        1: { id: null, filename: null }
    },
    simulation: null,
    currentFrame: 0,
    isPlaying: false,
    playbackInterval: null
};

const COLORS = {
    player0: '#f85149',
    player1: '#58a6ff',
    neutral: '#6e7681',
    mountain: '#484f58',
    city: '#8b949e',
    fog: '#21262d',
    general: '#ffd700',
    background: '#0d1117',
    grid: '#30363d',
    text: '#e6edf3'
};

const CELL_SIZE = 48;

function updateAgentUI(agentIdx) {
    const typeSelect = document.getElementById(`agent-${agentIdx}-type`);
    const uploadDiv = document.getElementById(`agent-${agentIdx}-upload`);

    if (typeSelect.value === 'ppo') {
        uploadDiv.classList.remove('hidden');
    } else {
        uploadDiv.classList.add('hidden');
        state.models[agentIdx] = { id: null, filename: null };
        document.getElementById(`agent-${agentIdx}-status`).textContent = '';
    }
}

async function handleFileSelect(agentIdx) {
    const fileInput = document.getElementById(`agent-${agentIdx}-file`);
    const statusDiv = document.getElementById(`agent-${agentIdx}-status`);
    const file = fileInput.files[0];

    if (!file) return;

    if (!file.name.endsWith('.eqx')) {
        statusDiv.textContent = 'Error: File must be .eqx';
        statusDiv.classList.add('error');
        return;
    }

    statusDiv.textContent = 'Uploading...';
    statusDiv.classList.remove('error');

    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('agent_slot', agentIdx);

        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Upload failed');
        }

        const result = await response.json();
        state.models[agentIdx] = {
            id: result.model_id,
            filename: result.filename
        };

        statusDiv.textContent = `Loaded: ${result.filename}`;
        statusDiv.classList.remove('error');

    } catch (error) {
        statusDiv.textContent = `Error: ${error.message}`;
        statusDiv.classList.add('error');
        state.models[agentIdx] = { id: null, filename: null };
    }
}

async function startSimulation() {
    const agent0Type = document.getElementById('agent-0-type').value;
    const agent1Type = document.getElementById('agent-1-type').value;

    if (agent0Type === 'ppo' && !state.models[0].id) {
        alert('Please upload a model for Agent 0');
        return;
    }
    if (agent1Type === 'ppo' && !state.models[1].id) {
        alert('Please upload a model for Agent 1');
        return;
    }

    const gridSize = parseInt(document.getElementById('grid-size').value);
    const maxTurns = parseInt(document.getElementById('max-turns').value);

    document.getElementById('loading-overlay').classList.add('visible');
    document.getElementById('play-btn').disabled = true;

    try {
        const formData = new FormData();
        formData.append('agent_0_type', agent0Type);
        formData.append('agent_1_type', agent1Type);
        formData.append('grid_size', gridSize);
        formData.append('max_turns', maxTurns);

        if (agent0Type === 'ppo') {
            formData.append('model_0_id', state.models[0].id);
        }
        if (agent1Type === 'ppo') {
            formData.append('model_1_id', state.models[1].id);
        }

        const response = await fetch('/api/simulate', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Simulation failed');
        }

        state.simulation = await response.json();
        state.currentFrame = 0;
        state.isPlaying = true;

        setupCanvas(state.simulation.grid_size);

        document.getElementById('game-panel').classList.add('visible');

        const slider = document.getElementById('frame-slider');
        slider.max = state.simulation.frames.length - 1;
        slider.value = 0;

        startPlayback();

    } catch (error) {
        alert(`Simulation error: ${error.message}`);
    } finally {
        document.getElementById('loading-overlay').classList.remove('visible');
        document.getElementById('play-btn').disabled = false;
    }
}

function setupCanvas(gridSize) {
    const canvas = document.getElementById('game-canvas');
    const size = gridSize * CELL_SIZE;
    canvas.width = size;
    canvas.height = size;
}

function renderFrame(frame) {
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const gridSize = state.simulation.grid_size;

    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const x = col * CELL_SIZE;
            const y = row * CELL_SIZE;

            let cellColor = COLORS.fog;

            const isMountain = frame.mountains[row][col];
            const isCity = frame.cities[row][col];
            const isGeneral = frame.generals[row][col];
            const ownedBy0 = frame.ownership[0][row][col];
            const ownedBy1 = frame.ownership[1][row][col];
            const armyCount = frame.armies[row][col];

            if (isMountain) {
                cellColor = COLORS.mountain;
            } else if (ownedBy0) {
                cellColor = COLORS.player0;
            } else if (ownedBy1) {
                cellColor = COLORS.player1;
            } else if (armyCount > 0) {
                cellColor = COLORS.neutral;
            }

            ctx.fillStyle = cellColor;
            ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);

            ctx.strokeStyle = COLORS.grid;
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);

            if (isMountain) {
                drawMountain(ctx, x, y);
            } else if (isGeneral) {
                drawGeneral(ctx, x, y);
            } else if (isCity) {
                drawCity(ctx, x, y);
            }

            if (armyCount > 0 && !isMountain) {
                ctx.fillStyle = COLORS.text;
                ctx.font = 'bold 14px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(
                    armyCount.toString(),
                    x + CELL_SIZE / 2,
                    y + CELL_SIZE / 2 + (isGeneral || isCity ? 8 : 0)
                );
            }
        }
    }

    updateStats(frame);
}

function drawMountain(ctx, x, y) {
    ctx.fillStyle = '#666';
    ctx.beginPath();
    ctx.moveTo(x + CELL_SIZE / 2, y + 10);
    ctx.lineTo(x + CELL_SIZE - 10, y + CELL_SIZE - 10);
    ctx.lineTo(x + 10, y + CELL_SIZE - 10);
    ctx.closePath();
    ctx.fill();
}

function drawGeneral(ctx, x, y) {
    ctx.fillStyle = COLORS.general;
    ctx.beginPath();
    ctx.moveTo(x + 10, y + 20);
    ctx.lineTo(x + 10, y + 12);
    ctx.lineTo(x + 16, y + 16);
    ctx.lineTo(x + CELL_SIZE / 2, y + 8);
    ctx.lineTo(x + CELL_SIZE - 16, y + 16);
    ctx.lineTo(x + CELL_SIZE - 10, y + 12);
    ctx.lineTo(x + CELL_SIZE - 10, y + 20);
    ctx.closePath();
    ctx.fill();
}

function drawCity(ctx, x, y) {
    ctx.fillStyle = COLORS.city;
    ctx.fillRect(x + 14, y + 12, 8, 14);
    ctx.fillRect(x + 24, y + 8, 10, 18);
}

function updateStats(frame) {
    const agents = state.simulation.agents;

    document.getElementById('p0-army').textContent = frame.stats[agents[0]].army;
    document.getElementById('p0-land').textContent = frame.stats[agents[0]].land;
    document.getElementById('p1-army').textContent = frame.stats[agents[1]].army;
    document.getElementById('p1-land').textContent = frame.stats[agents[1]].land;

    document.getElementById('turn-display').textContent = `Turn ${frame.turn}`;

    const statusEl = document.getElementById('game-status');
    if (frame.is_done) {
        if (frame.winner === 0) {
            statusEl.textContent = `${agents[0]} wins!`;
            statusEl.className = 'winner-0';
        } else if (frame.winner === 1) {
            statusEl.textContent = `${agents[1]} wins!`;
            statusEl.className = 'winner-1';
        } else {
            statusEl.textContent = 'Draw';
            statusEl.className = '';
        }
    } else {
        statusEl.textContent = '';
        statusEl.className = '';
    }

    document.getElementById('frame-slider').value = state.currentFrame;
    document.getElementById('frame-counter').textContent =
        `${state.currentFrame} / ${state.simulation.frames.length - 1}`;
}

function startPlayback() {
    if (state.playbackInterval) {
        clearInterval(state.playbackInterval);
    }

    const speed = parseInt(document.getElementById('playback-speed').value);

    state.isPlaying = true;
    document.getElementById('pause-btn').textContent = 'Pause';

    state.playbackInterval = setInterval(() => {
        if (state.currentFrame < state.simulation.frames.length - 1) {
            state.currentFrame++;
            renderFrame(state.simulation.frames[state.currentFrame]);
        } else {
            stopPlayback();
        }
    }, speed);

    renderFrame(state.simulation.frames[state.currentFrame]);
}

function stopPlayback() {
    if (state.playbackInterval) {
        clearInterval(state.playbackInterval);
        state.playbackInterval = null;
    }
    state.isPlaying = false;
    document.getElementById('pause-btn').textContent = 'Play';
}

function togglePause() {
    if (state.isPlaying) {
        stopPlayback();
    } else {
        if (state.currentFrame >= state.simulation.frames.length - 1) {
            state.currentFrame = 0;
        }
        startPlayback();
    }
}

function restartPlayback() {
    state.currentFrame = 0;
    if (!state.isPlaying) {
        renderFrame(state.simulation.frames[0]);
        updateStats(state.simulation.frames[0]);
    } else {
        startPlayback();
    }
}

function prevFrame() {
    if (state.currentFrame > 0) {
        state.currentFrame--;
        stopPlayback();
        renderFrame(state.simulation.frames[state.currentFrame]);
    }
}

function nextFrame() {
    if (state.currentFrame < state.simulation.frames.length - 1) {
        state.currentFrame++;
        stopPlayback();
        renderFrame(state.simulation.frames[state.currentFrame]);
    }
}

function seekToFrame(frameIdx) {
    state.currentFrame = parseInt(frameIdx);
    renderFrame(state.simulation.frames[state.currentFrame]);
}

function saveReplay() {
    if (!state.simulation) {
        alert('No simulation to save');
        return;
    }

    const replay = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        ...state.simulation
    };

    const json = JSON.stringify(replay, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `replay_${timestamp}.json`;

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function handleReplayLoad() {
    const fileInput = document.getElementById('replay-file');
    const statusDiv = document.getElementById('replay-status');
    const file = fileInput.files[0];

    if (!file) return;

    if (!file.name.endsWith('.json')) {
        statusDiv.textContent = 'Error: File must be .json';
        statusDiv.classList.add('error');
        return;
    }

    statusDiv.textContent = 'Loading...';
    statusDiv.classList.remove('error');

    const reader = new FileReader();

    reader.onload = function (e) {
        try {
            const replay = JSON.parse(e.target.result);

            if (!replay.frames || !replay.grid_size || !replay.agents) {
                throw new Error('Invalid replay file format');
            }

            state.simulation = replay;
            state.currentFrame = 0;
            state.isPlaying = false;

            setupCanvas(state.simulation.grid_size);

            document.getElementById('game-panel').classList.add('visible');

            const slider = document.getElementById('frame-slider');
            slider.max = state.simulation.frames.length - 1;
            slider.value = 0;

            renderFrame(state.simulation.frames[0]);

            statusDiv.textContent = `Loaded: ${file.name} (${replay.frames.length} frames)`;
            statusDiv.classList.remove('error');

        } catch (error) {
            statusDiv.textContent = `Error: ${error.message}`;
            statusDiv.classList.add('error');
        }
    };

    reader.onerror = function () {
        statusDiv.textContent = 'Error reading file';
        statusDiv.classList.add('error');
    };

    reader.readAsText(file);
}

document.addEventListener('DOMContentLoaded', () => {
    updateAgentUI(0);
    updateAgentUI(1);
});

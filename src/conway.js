// conway.js

export function renderGrid() {
    const terminalContainer = document.getElementById('output_box');

    terminalContainer.innerHTML = '';

    const canvas = document.createElement('canvas');
    canvas.width = terminalContainer.clientWidth;
    canvas.height = terminalContainer.clientHeight;
    canvas.style.width = '100%';
    canvas.style.height = '90%';
    canvas.style.borderRadius = '8px';
    canvas.style.zIndex = '3';
    canvas.style.display = 'block';
    canvas.style.pointerEvents = 'auto';
    terminalContainer.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const gridSize = 25;

    const getCSSVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    const strokeColor = getCSSVar('--grid-line') || 'rgba(204, 197, 185, 0.15)';
    const fillColor = getCSSVar('--grid-fill') || 'rgba(235, 94, 40, 1)';

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1;

    const cols = Math.floor(canvas.width / gridSize);
    const rows = Math.floor(canvas.height / gridSize);
    let cells = Array.from({ length: rows }, () => Array(cols).fill(0));

    let isDrawing = false;
    let drawState = 1;
    let running = false;
    let stepRequested = false;

    let lastStepTime = 0;
    let simulationDelay = 200; // ms

    function drawGrid() {
        const now = performance.now();
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const cell = cells[y][x];

                if (typeof cell === 'object' && cell.alive) {
                    const age = now - cell.createdAt;
                    const alpha = Math.min(age / simulationDelay, 1);
                    const rgba = fillColor.replace(/rgba?\(([^)]+)\)/, (_, values) => {
                        const [r, g, b] = values.split(',').map(v => v.trim()).slice(0, 3);
                        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
                    });
                    ctx.fillStyle = rgba;
                    ctx.fillRect(x * gridSize, y * gridSize, gridSize, gridSize);
                }

                ctx.strokeRect(x * gridSize, y * gridSize, gridSize, gridSize);
            }
        }
    }

    function countAliveNeighbors(x, y) {
        let count = 0;
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                const nx = x + dx;
                const ny = y + dy;
                if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
                    if (typeof cells[ny][nx] === 'object' && cells[ny][nx].alive) {
                        count++;
                    }
                }
            }
        }
        return count;
    }

    function stepSimulation() {
        const now = performance.now();
        const newCells = Array.from({ length: rows }, () => Array(cols).fill(0));

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const alive = typeof cells[y][x] === 'object' && cells[y][x].alive;
                const neighbors = countAliveNeighbors(x, y);

                if (alive && (neighbors === 2 || neighbors === 3)) {
                    newCells[y][x] = { alive: true, createdAt: cells[y][x].createdAt };
                } else if (!alive && neighbors === 3) {
                    newCells[y][x] = { alive: true, createdAt: now };
                }
            }
        }

        cells = newCells;
    }

    function animate(now) {
        if ((running && now - lastStepTime > simulationDelay) || stepRequested) {
            stepSimulation();
            lastStepTime = now;
            stepRequested = false;
        }
        drawGrid();
        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);

    function setCellFromEvent(e, stateOverride = null) {
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / (rect.width / canvas.width) / gridSize);
        const y = Math.floor((e.clientY - rect.top) / (rect.height / canvas.height) / gridSize);

        if (x >= 0 && x < cols && y >= 0 && y < rows) {
            if ((stateOverride ?? drawState) === 1) {
                cells[y][x] = { alive: true, createdAt: performance.now() };
            } else {
                cells[y][x] = 0;
            }
        }
    }

    canvas.addEventListener('mousedown', (e) => {
        e.preventDefault();
        isDrawing = true;
        drawState = e.button === 2 ? 0 : 1;
        setCellFromEvent(e);
    });

    canvas.addEventListener('mousemove', (e) => {
        if (isDrawing) setCellFromEvent(e);
    });

    canvas.addEventListener('mouseup', () => isDrawing = false);
    canvas.addEventListener('mouseleave', () => isDrawing = false);
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    window.addEventListener('resize', () => {
        canvas.width = terminalContainer.clientWidth;
        canvas.height = terminalContainer.clientHeight;
    });

    const userEntry = document.getElementById('user_entry');
    userEntry.innerHTML = `
        <div id="control_panel" style="display: flex; flex-direction: row; gap: 20px; align-items: flex-start; justify-content: flex-start; flex-wrap: wrap;">
            <button id="start_button">Start</button>
            <button id="stop_button">Stop</button>
            <button id="reset_button">Reset</button>
            <button id="step_button">Step</button>
            <button id="exit_button">Exit</button>
            <label for="speed_slider">Speed:</label>
            <input type="range" id="speed_slider" min="50" max="1000" step="50" value="800">
        </div>
    `;
    userEntry.style.zIndex = '10';
    userEntry.style.position = 'relative';

    document.getElementById('start_button').addEventListener('click', () => {
        running = true;
    });

    document.getElementById('stop_button').addEventListener('click', () => {
        running = false;
    });

    document.getElementById('reset_button').addEventListener('click', () => {
        cells = Array.from({ length: rows }, () => Array(cols).fill(0));
    });

    document.getElementById('step_button').addEventListener('click', () => {
        stepRequested = true;
    });

    document.getElementById('speed_slider').addEventListener('input', (e) => {
        simulationDelay = 1050 - parseInt(e.target.value, 10); // reverse
    });

    document.getElementById('exit_button').addEventListener('click', () => {
        // exit functionality placeholder
    });

    return { canvas, ctx, gridSize, cells, rows, cols };
}

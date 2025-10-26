<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Devast Base Editor (H for Help)</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        /* Custom CSS for Game/App Styling */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
        html, body {
            height: 100%;
            margin: 0;
            padding: 0;
            font-family: 'Inter', sans-serif;
            background-color: #1a1a1a; /* Dark background for contrast */
            overflow: hidden; /* Prevent body scroll */
        }
        .app-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 1rem;
            width: 100%;
            height: 100%;
            overflow-y: auto; /* Allow scrolling if content is taller than screen */
        }
        /* Style the canvas to ensure it doesn't cause overflow and is treated as a block element */
        #gridCanvas {
            max-width: 90vh; /* Limit size to viewport height */
            max-height: 90vh; /* Limit size to viewport height */
            margin: auto;
            display: block;
            border: 2px solid #505050; /* Subtle border around the whole grid */
            border-radius: 0.5rem;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
            touch-action: none; /* Disable default touch actions on canvas */
        }

        /* Utility classes for interactivity and appearance */
        .sidebar {
            background: #2a2a2a;
            border-radius: 0.75rem;
            padding: 1rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
            max-height: calc(100vh - 4rem);
            overflow-y: auto;
            scrollbar-width: none; /* Firefox */
        }
        .sidebar::-webkit-scrollbar {
            display: none; /* Chrome, Safari */
        }
        .item-button {
            transition: all 0.1s;
            transform-origin: center;
            border: 2px solid transparent;
        }
        .item-button:hover {
            transform: scale(1.05);
            box-shadow: 0 0 10px rgba(79, 70, 229, 0.5);
        }
        .item-button.selected {
            border-color: #4f46e5;
            box-shadow: 0 0 15px #4f46e5;
            transform: scale(1.1);
        }
    </style>
</head>
<body class="bg-[#1a1a1a] flex flex-col h-full">

    <!-- Header -->
    <header class="w-full bg-[#2a2a2a] p-3 shadow-lg fixed top-0 z-10">
        <div class="max-w-7xl mx-auto flex justify-between items-center">
            <h1 class="text-2xl font-bold text-indigo-400">Base Grid Editor</h1>
            
            <!-- LLM Feature Buttons -->
            <div class="flex space-x-3">
                <button id="analyzeButton" onclick="callGeminiAnalysis()" class="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-1 px-3 rounded-lg shadow-md transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed">
                    Analyze Base Layout ✨
                </button>
                <button id="describeButton" onclick="callGeminiDescription()" class="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-1 px-3 rounded-lg shadow-md transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed">
                    Describe Item ✨
                </button>
            </div>
            
            <div id="coordinateDisplay" class="text-sm text-gray-400 font-mono tracking-wider bg-[#1a1a1a] px-3 py-1 rounded-full shadow-inner">
                X: 0, Y: 0 | Selected: Stone Wall
            </div>
            <button id="helpButton" class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-1 px-3 rounded-lg shadow-md transition duration-150">
                H for Help
            </button>
        </div>
    </header>

    <!-- Main Content Area -->
    <div class="flex flex-1 pt-16 pb-4 overflow-hidden">

        <!-- Sidebar (Item Selection) -->
        <div id="itemSelection" class="sidebar w-1/4 max-w-xs ml-4 mr-2 hidden md:block">
            <h2 class="text-xl font-bold text-gray-200 mb-4 border-b border-gray-600 pb-2">Select Object</h2>
            <div id="itemButtons" class="grid grid-cols-2 gap-3">
                <!-- Buttons will be generated here -->
            </div>
        </div>

        <!-- Canvas Container -->
        <div id="canvasContainer" class="flex-1 flex justify-center items-center p-2">
            <canvas id="gridCanvas" class="bg-white"></canvas>
        </div>
    </div>

    <!-- Help Modal -->
    <div id="helpModal" class="fixed inset-0 bg-black bg-opacity-75 hidden z-20 items-center justify-center">
        <div class="bg-[#2a2a2a] p-8 rounded-xl shadow-2xl max-w-lg w-full transform scale-100 transition-transform duration-300">
            <h2 class="text-3xl font-bold text-indigo-400 mb-4 border-b border-gray-700 pb-2">Editor Help & Controls</h2>
            <div class="space-y-4">
                <h3 class="text-xl font-semibold text-indigo-300">Navigation</h3>
                <ul class="list-disc list-inside space-y-2 text-gray-300 ml-4">
                    <li>**Zoom**: Use the **Scroll Wheel** (or pinch on touch devices).</li>
                    <li>**Pan/Move**: Use **WASD** keys or **Middle Mouse Click & Drag**.</li>
                    <li>**Rotate Ghost Preview**: Press **R** to rotate the object ghost before placing (only for applicable items like 3x1 features, **Fridge**, **Door**, or **Bag**).</li>
                    <li>**Toggle Help**: Press **H** to show/hide this modal.</li>
                </ul>

                <h3 class="text-xl font-semibold text-indigo-300">Placement Modes</h3>
                <ul class="list-disc list-inside space-y-2 text-gray-300 ml-4">
                    <li>**Click (🖱️)**: Single click to place or remove the selected object.</li>
                    <li>**Line (📏)**: Click and drag to quickly place objects in a straight line (horizontal or vertical).</li>
                    <li>**Clone (📋)**: First drag a box to select an area, then click to place the copy of that area.</li>
                    <li>**Delete (🗑️)**: Click and drag a box to delete all objects within that area.</li>
                </ul>
            </div>
            
            <div class="mt-6 text-center text-sm text-gray-500 border-t border-gray-700 pt-3">
                <p>The base grid is **149x149**. Start building by closing this window!</p>
            </div>
        </div>
    </div>

    <!-- LLM Analysis Modal -->
    <div id="analysisModal" class="fixed inset-0 bg-black bg-opacity-75 hidden z-20 items-center justify-center">
        <div class="bg-[#2a2a2a] p-8 rounded-xl shadow-2xl max-w-xl w-full transform scale-100 transition-transform duration-300">
            <div class="flex justify-between items-start border-b border-gray-700 pb-2 mb-4">
                <h2 class="text-3xl font-bold text-emerald-400">Tactical Analysis Results</h2>
                <button onclick="document.getElementById('analysisModal').classList.add('hidden')" class="text-gray-400 hover:text-white">&times;</button>
            </div>
            <div id="analysisContent" class="max-h-96 overflow-y-auto text-sm">
                <!-- Content will be inserted here -->
            </div>
            <div class="mt-4 text-center">
                <button onclick="document.getElementById('analysisModal').classList.add('hidden')" class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-150">
                    Close
                </button>
            </div>
        </div>
    </div>

    <script type="module">
        // Global variables for Firebase access (required for state persistence)
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
        const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null;
        const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

        import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
        import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
        import { getFirestore, doc, setDoc, onSnapshot, collection, query, runTransaction, getDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
        import { setLogLevel } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
        
        // --- Firebase Setup ---
        let db, auth, userId = null;
        let listenerAttached = false; 
        
        // Uncomment to enable Firestore debug logs
        // setLogLevel('Debug');

        if (firebaseConfig) {
            const app = initializeApp(firebaseConfig);
            db = getFirestore(app);
            auth = getAuth(app);
            
            // Authentication State Change Listener
            onAuthStateChanged(auth, async (user) => {
                if (user) {
                    // User is authenticated (by custom token or anonymous sign-in)
                    userId = user.uid;
                    
                    // Start listening for data only if the listener is not yet attached
                    if (db && !listenerAttached) {
                        listenerAttached = true; // Mark as attached immediately
                        setupFirestoreListener();
                    }
                } else {
                    // User is null (unauthenticated state), try to sign in using the provided token first
                    if (initialAuthToken) {
                         try {
                            await signInWithCustomToken(auth, initialAuthToken);
                            // Success will trigger onAuthStateChanged again with the new user object
                        } catch (error) {
                            console.error("Custom token sign-in failed, trying anonymous sign-in:", error);
                             try {
                                // If custom token fails, fall back to anonymous sign-in
                                await signInAnonymously(auth);
                            } catch (error) {
                                console.error("Error signing in anonymously:", error);
                                // If all auth fails, set fallback ID and force listener setup (though it will likely still fail on rules)
                                if (!listenerAttached) {
                                    userId = crypto.randomUUID(); 
                                    listenerAttached = true;
                                    console.warn("Authentication failed, proceeding with mock user ID. Data persistence will likely fail due to security rules.");
                                    setupFirestoreListener();
                                }
                            }
                        }
                    } else if (db && !listenerAttached) {
                        // If no custom token exists, attempt anonymous sign-in
                        try {
                            await signInAnonymously(auth);
                        } catch (error) {
                            console.error("Error signing in anonymously:", error);
                             if (!listenerAttached) {
                                userId = crypto.randomUUID(); 
                                listenerAttached = true;
                                console.warn("Authentication failed, proceeding with mock user ID. Data persistence will likely fail due to security rules.");
                                setupFirestoreListener();
                            }
                        }
                    }
                }
            });

            // Initial sign-in attempt if we have a token (to kick off the onAuthStateChanged)
            if (initialAuthToken) {
                // signInWithCustomToken is now handled inside onAuthStateChanged's 'else' block
                // but we should ensure an initial state is set up if the token exists.
                // We'll trust the onAuthStateChanged to manage the flow robustly.
            }


        } else {
            console.error("Firebase config is missing. Data persistence is disabled.");
            userId = 'local-user'; // Use a mock ID for local development
            listenerAttached = true;
        }

        // --- Grid and Canvas Setup ---
        const GRID_SIZE = 149; // Max size 149x149
        const TILE_SIZE = 32; // Default size in pixels
        const CANVAS_ID = 'gridCanvas';
        const canvas = document.getElementById(CANVAS_ID);
        const ctx = canvas.getContext('2d');
        
        let offsetX = 0; // Viewport offset X
        let offsetY = 0; // Viewport offset Y
        let zoom = 1.0;  // Zoom level

        let gridData = {}; // Stores placed objects: { 'x,y': { id: N, rot: R } }
        let selectedItem = null;
        let selectedItemId = 1; // Default to Stone Wall

        // --- Interaction State ---
        let isDragging = false;
        let lastMouseX = 0;
        let lastMouseY = 0;
        let rotation = 0; // 0, 1, 2, 3 for 0, 90, 180, 270 degrees
        let isDrawingLine = false;
        let isCloning = false;
        let isDeleting = false;
        let startGridX = 0;
        let startGridY = 0;
        let currentGridX = 0;
        let currentGridY = 0;
        let mode = 'click'; // 'click', 'line', 'clone', 'delete'

        // --- Item Definitions and Drawing Functions ---

        // Base drawing for 1x1 objects
        function drawSimpleBlock(ctx, x, y, size, rotation, isGhost, color) {
            ctx.fillStyle = isGhost ? `rgba(${hexToRgb(color)}, 0.4)` : color;
            ctx.fillRect(x, y, size, size);
            ctx.strokeStyle = isGhost ? 'rgba(0,0,0,0.5)' : color;
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, size, size);
        }

        function hexToRgb(hex) {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return `${r}, ${g}, ${b}`;
        }

        // Specific Drawing Functions
        function drawWall(ctx, x, y, size, rotation, isGhost = false, color) {
            const fill = isGhost ? `rgba(${hexToRgb(color)}, 0.4)` : color;
            ctx.fillStyle = fill;
            ctx.fillRect(x, y, size, size);

            ctx.strokeStyle = isGhost ? 'rgba(0,0,0,0.5)' : '#666666';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, size, size);
        }

        // NEW: Drawing function for half-height walls
        function drawHalfWall(ctx, x, y, size, rotation, isGhost = false, color) {
            const halfHeight = size * 0.5;
            const startY = y + (size - halfHeight); // Start drawing from the bottom half

            const fill = isGhost ? `rgba(${hexToRgb(color)}, 0.4)` : color;
            ctx.fillStyle = fill;
            ctx.fillRect(x, startY, size, halfHeight);

            // Outline for clarity
            ctx.strokeStyle = isGhost ? 'rgba(0,0,0,0.5)' : '#666666';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, startY, size, halfHeight);
        }

        function drawDoor(ctx, x, y, size, rotation, isGhost = false, color) {
            const fill = isGhost ? `rgba(${hexToRgb(color)}, 0.4)` : color;
            ctx.fillStyle = fill;
            ctx.fillRect(x, y, size, size);
            
            ctx.fillStyle = isGhost ? 'rgba(0,0,0,0.6)' : '#333333';
            // Draw a vertical line representing the door
            if (rotation % 2 === 0) { // 0 or 2 (up/down orientation)
                ctx.fillRect(x + size * 0.4, y, size * 0.2, size);
            } else { // 1 or 3 (left/right orientation)
                ctx.fillRect(x, y + size * 0.4, size, size * 0.2);
            }
        }

        function drawBag(ctx, x, y, size, rotation, isGhost = false, color) {
            const fill = isGhost ? `rgba(${hexToRgb(color)}, 0.4)` : color;
            ctx.fillStyle = fill;
            ctx.fillRect(x, y, size, size);
            
            ctx.fillStyle = isGhost ? 'rgba(0,0,0,0.6)' : '#795548';
            ctx.fillRect(x + size * 0.1, y + size * 0.1, size * 0.8, size * 0.8);
            
            // Draw an X to represent the bag/container
            ctx.strokeStyle = isGhost ? 'rgba(255,255,255,0.7)' : '#FFFFFF';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x + size * 0.2, y + size * 0.2);
            ctx.lineTo(x + size * 0.8, y + size * 0.8);
            ctx.moveTo(x + size * 0.8, y + size * 0.2);
            ctx.lineTo(x + size * 0.2, y + size * 0.8);
            ctx.stroke();
        }

        function drawFridge(ctx, x, y, size, rotation, isGhost = false, color) {
            const fill = isGhost ? `rgba(${hexToRgb(color)}, 0.4)` : color;
            ctx.fillStyle = fill;
            ctx.fillRect(x, y, size, size);

            // Door handle
            ctx.fillStyle = isGhost ? 'rgba(255,255,255,0.7)' : '#A0A0A0';
            ctx.fillRect(x + size * 0.7, y + size * 0.15, size * 0.1, size * 0.7);
        }

        // The master list of placeable objects
        const items = [
            // Structural Walls (ID 1-9)
            { id: 1, name: 'Stone Wall', color: '#999999', size: 1, structure: true, width: 1, height: 1, blocks: 1, rotate: false, draw: drawWall },
            { id: 2, name: 'Wooden Wall', color: '#A0522D', size: 1, structure: true, width: 1, height: 1, blocks: 1, rotate: false, draw: drawWall },
            { id: 3, name: 'Brick Wall', color: '#B22222', size: 1, structure: true, width: 1, height: 1, blocks: 1, rotate: false, draw: drawWall },
            { id: 4, name: 'Metal Wall', color: '#888888', size: 1, structure: true, width: 1, height: 1, blocks: 1, rotate: false, draw: drawWall },
            
            // NEW ITEM: Metal Low Wall
            { id: 70, name: 'Metal Low Wall', color: '#888888', size: 1, structure: true, width: 1, height: 0.5, blocks: 1, rotate: false, draw: drawHalfWall },

            // Doors/Gates (ID 10-11)
            { id: 10, name: 'Door', color: '#D2B48C', size: 1, structure: false, width: 1, height: 1, blocks: 1, rotate: true, draw: drawDoor },
            { id: 11, name: 'Metal Gate', color: '#696969', size: 3, structure: false, width: 3, height: 1, blocks: 3, rotate: true, draw: drawDoor },

            // Storage/Utility (ID 12-19)
            // FRIDGE COLOR UPDATED to #000000 (Black)
            { id: 12, name: 'Fridge', color: '#000000', size: 1, structure: false, width: 1, height: 1, blocks: 1, rotate: true, draw: drawFridge },
            { id: 13, name: 'Bag', color: '#8B4513', size: 1, structure: false, width: 1, height: 1, blocks: 1, rotate: true, draw: drawBag },
            { id: 14, name: 'Small Box', color: '#CD853F', size: 1, structure: false, width: 1, height: 1, blocks: 1, rotate: false, draw: drawSimpleBlock },
            { id: 15, name: 'Large Chest', color: '#8B4513', size: 2, structure: false, width: 2, height: 1, blocks: 2, rotate: false, draw: drawSimpleBlock },
            { id: 16, name: 'Workbench', color: '#555555', size: 3, structure: false, width: 3, height: 1, blocks: 3, rotate: true, draw: drawSimpleBlock },
            
            // Traps/Defenses (ID 20+)
            { id: 20, name: 'Spikes', color: '#CC0000', size: 1, structure: false, width: 1, height: 1, blocks: 1, rotate: false, draw: drawSimpleBlock },
            { id: 21, name: 'Tesla Coil', color: '#00BFFF', size: 1, structure: false, width: 1, height: 1, blocks: 1, rotate: false, draw: drawSimpleBlock },
        ];

        // --- Core Functions ---

        // Find an item by its ID
        function getItem(id) {
            return items.find(item => item.id === id);
        }

        // Get the item currently selected by the user
        function getCurrentItem() {
            return items.find(item => item.id === selectedItemId);
        }

        // Draw the main grid and objects
        function drawGrid() {
            // Set canvas size dynamically based on its container, maintaining max size
            const container = document.getElementById('canvasContainer');
            const maxCanvasSize = Math.min(container.clientWidth, container.clientHeight) * 0.95;
            const size = Math.min(maxCanvasSize, TILE_SIZE * GRID_SIZE * zoom);
            
            canvas.width = size;
            canvas.height = size;
            
            // Calculate effective tile size based on zoom
            const effectiveTileSize = canvas.width / (GRID_SIZE * zoom);

            // Clear canvas and draw background
            ctx.fillStyle = '#222222';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Determine visible grid area (only draw what's on screen)
            const startX = Math.floor(offsetX);
            const startY = Math.floor(offsetY);
            const endX = Math.ceil(offsetX + canvas.width / effectiveTileSize);
            const endY = Math.ceil(offsetY + canvas.height / effectiveTileSize);

            // Draw grid lines
            ctx.strokeStyle = '#333333';
            ctx.lineWidth = 1;

            // Draw vertical lines
            for (let x = startX; x <= endX; x++) {
                const drawX = (x - offsetX) * effectiveTileSize;
                if (drawX >= 0 && drawX <= canvas.width) {
                    ctx.beginPath();
                    ctx.moveTo(drawX, 0);
                    ctx.lineTo(drawX, canvas.height);
                    ctx.stroke();
                }
            }

            // Draw horizontal lines
            for (let y = startY; y <= endY; y++) {
                const drawY = (y - offsetY) * effectiveTileSize;
                if (drawY >= 0 && drawY <= canvas.height) {
                    ctx.beginPath();
                    ctx.moveTo(0, drawY);
                    ctx.lineTo(0, drawY);
                    ctx.lineTo(canvas.width, drawY);
                    ctx.stroke();
                }
            }

            // Draw placed objects
            for (const key in gridData) {
                const [gx, gy] = key.split(',').map(Number);
                const obj = gridData[key];
                const item = getItem(obj.id);

                if (!item) continue; // Skip unknown IDs

                const drawX = (gx - offsetX) * effectiveTileSize;
                const drawY = (gy - offsetY) * effectiveTileSize;

                // Only draw if within bounds
                if (drawX + effectiveTileSize > 0 && drawX < canvas.width &&
                    drawY + effectiveTileSize > 0 && drawY < canvas.height) {
                    
                    ctx.save();
                    // Translate to the center of the drawing area for rotation
                    if (item.rotate) {
                        ctx.translate(drawX + effectiveTileSize / 2, drawY + effectiveTileSize / 2);
                        ctx.rotate(obj.rot * Math.PI / 2); // 0, 90, 180, 270 degrees
                        item.draw(ctx, -effectiveTileSize / 2, -effectiveTileSize / 2, effectiveTileSize, obj.rot, false, item.color);
                    } else {
                        item.draw(ctx, drawX, drawY, effectiveTileSize, obj.rot, false, item.color);
                    }
                    ctx.restore();
                }
            }
            
            // Highlight the cell under the mouse
            drawGhostPreview(effectiveTileSize);
        }

        // Draw the ghost preview of the selected item or selection box
        function drawGhostPreview(effectiveTileSize) {
            if (currentGridX < 0 || currentGridX >= GRID_SIZE || currentGridY < 0 || currentGridY >= GRID_SIZE) return;

            const item = getCurrentItem();
            const drawX = (currentGridX - offsetX) * effectiveTileSize;
            const drawY = (currentGridY - offsetY) * effectiveTileSize;

            ctx.save();
            ctx.strokeStyle = 'rgba(79, 70, 229, 0.8)'; // Indigo highlight
            ctx.lineWidth = 3;
            ctx.setLineDash([5, 5]);

            if (isCloning || isDeleting) {
                // Draw selection/delete box
                const x1 = Math.min(startGridX, currentGridX);
                const y1 = Math.min(startGridY, currentGridY);
                const x2 = Math.max(startGridX, currentGridX);
                const y2 = Math.max(startGridY, currentGridY);

                const boxDrawX = (x1 - offsetX) * effectiveTileSize;
                const boxDrawY = (y1 - offsetY) * effectiveTileSize;
                const boxWidth = (x2 - x1 + 1) * effectiveTileSize;
                const boxHeight = (y2 - y1 + 1) * effectiveTileSize;

                ctx.fillStyle = isDeleting ? 'rgba(255, 0, 0, 0.2)' : 'rgba(79, 70, 229, 0.2)';
                ctx.fillRect(boxDrawX, boxDrawY, boxWidth, boxHeight);
                ctx.strokeRect(boxDrawX, boxDrawY, boxWidth, boxHeight);

            } else if (isDrawingLine) {
                // Draw line preview
                ctx.strokeRect(drawX, drawY, effectiveTileSize, effectiveTileSize);

                const lineX1 = Math.min(startGridX, currentGridX);
                const lineY1 = Math.min(startGridY, currentGridY);
                const lineX2 = Math.max(startGridX, currentGridX);
                const lineY2 = Math.max(startGridY, currentGridY);

                for (let x = lineX1; x <= lineX2; x++) {
                    for (let y = lineY1; y <= lineY2; y++) {
                        if (x === currentGridX || y === currentGridY) {
                            const lineDrawX = (x - offsetX) * effectiveTileSize;
                            const lineDrawY = (y - offsetY) * effectiveTileSize;
                            
                            ctx.save();
                            ctx.globalAlpha = 0.5;
                            ctx.fillStyle = `rgba(${hexToRgb(item.color)}, 0.3)`;
                            ctx.fillRect(lineDrawX, lineDrawY, effectiveTileSize, effectiveTileSize);
                            ctx.restore();
                        }
                    }
                }
            } else if (item) {
                // Draw single item ghost
                ctx.setLineDash([]);
                
                // Rotation logic for ghost
                if (item.rotate) {
                    ctx.translate(drawX + effectiveTileSize / 2, drawY + effectiveTileSize / 2);
                    ctx.rotate(rotation * Math.PI / 2);
                    item.draw(ctx, -effectiveTileSize / 2, -effectiveTileSize / 2, effectiveTileSize, rotation, true, item.color);
                } else {
                    item.draw(ctx, drawX, drawY, effectiveTileSize, rotation, true, item.color);
                }
                
                ctx.strokeRect(-effectiveTileSize/2, -effectiveTileSize/2, effectiveTileSize, effectiveTileSize);
            }

            ctx.restore();
        }


        // --- Interaction Handlers ---

        function getGridCoords(clientX, clientY) {
            const rect = canvas.getBoundingClientRect();
            const canvasX = clientX - rect.left;
            const canvasY = clientY - rect.top;

            const effectiveTileSize = canvas.width / (GRID_SIZE * zoom);

            const gridX = Math.floor(canvasX / effectiveTileSize + offsetX);
            const gridY = Math.floor(canvasY / effectiveTileSize + offsetY);

            // Clamp coordinates to grid bounds
            const clampedX = Math.max(0, Math.min(GRID_SIZE - 1, gridX));
            const clampedY = Math.max(0, Math.min(GRID_SIZE - 1, gridY));

            return { gridX: clampedX, gridY: clampedY };
        }
        
        // Handle grid cell interactions (place/remove)
        async function handleGridAction(gx, gy) {
            const key = `${gx},${gy}`;
            const item = getCurrentItem();

            if (mode === 'delete' || (mode === 'click' && gridData[key] && gridData[key].id === selectedItemId)) {
                // Delete if in delete mode, or if in click mode and clicking on the same item
                deleteObject(key);
            } else if (mode === 'click' || mode === 'line') {
                // Place or replace
                if (item) {
                    const obj = { id: item.id, rot: item.rotate ? rotation : 0 };
                    await placeObject(key, obj);
                }
            }
        }

        async function handleCloneAction(gx, gy) {
            if (gx === startGridX && gy === startGridY) return;

            const x1 = Math.min(startGridX, gx);
            const y1 = Math.min(startGridY, gy);
            const x2 = Math.max(startGridX, gx);
            const y2 = Math.max(startGridY, gy);

            // 1. Identify the objects to clone (source area)
            const objectsToClone = {};
            for (let x = x1; x <= x2; x++) {
                for (let y = y1; y <= y2; y++) {
                    const key = `${x},${y}`;
                    if (gridData[key]) {
                        objectsToClone[key] = gridData[key];
                    }
                }
            }

            // 2. Clear flags and switch mode to click for placement
            isCloning = false;
            mode = 'click';

            if (Object.keys(objectsToClone).length === 0) {
                console.log("No objects selected to clone.");
                return;
            }

            // 3. Set the first object in the cloned selection as the temporary selected item
            const firstKey = Object.keys(objectsToClone)[0];
            const firstObj = objectsToClone[firstKey];
            const firstItem = getItem(firstObj.id);
            if (firstItem) {
                selectedItemId = firstItem.id;
                selectedItem = firstItem;
                rotation = firstObj.rot;
                updateSelectionDisplay();
            }

            // 4. Update the mouse listener to handle placement on the next click
            canvas.onmousedown = (e) => {
                if (e.button === 0) { // Left click
                    const { gridX: targetX, gridY: targetY } = getGridCoords(e.clientX, e.clientY);
                    
                    // The offset is calculated from the top-left corner of the source selection
                    const offsetX = targetX - x1;
                    const offsetY = targetY - y1;

                    // Execute the placement transaction
                    const batchData = {};
                    for (const key in objectsToClone) {
                        const [sourceX, sourceY] = key.split(',').map(Number);
                        const targetKey = `${sourceX + offsetX},${sourceY + offsetY}`;
                        const targetObj = objectsToClone[key];
                        
                        // Check bounds before adding to batch
                        const [tx, ty] = targetKey.split(',').map(Number);
                        if (tx >= 0 && tx < GRID_SIZE && ty >= 0 && ty < GRID_SIZE) {
                            batchData[targetKey] = targetObj;
                        }
                    }

                    if (Object.keys(batchData).length > 0) {
                        placeBatch(batchData);
                    }
                    
                    // Reset to click mode after batch placement
                    resetInteractionState();
                }
            };
        }
        
        async function handleDeleteAction(gx, gy) {
            if (gx === startGridX && gy === startGridY) return;

            const x1 = Math.min(startGridX, gx);
            const y1 = Math.min(startGridY, gy);
            const x2 = Math.max(startGridX, gx);
            const y2 = Math.max(startGridY, gy);

            const keysToDelete = [];
            for (let x = x1; x <= x2; x++) {
                for (let y = y1; y <= y2; y++) {
                    const key = `${x},${y}`;
                    if (gridData[key]) {
                        keysToDelete.push(key);
                    }
                }
            }
            
            if (keysToDelete.length > 0) {
                await deleteBatch(keysToDelete);
            }
        }

        async function handleLineAction(gx, gy) {
            if (gx === startGridX && gy === startGridY) return;

            const x1 = Math.min(startGridX, gx);
            const y1 = Math.min(startGridY, gy);
            const x2 = Math.max(startGridX, gx);
            const y2 = Math.max(startGridY, gy);

            const batchData = {};
            const item = getCurrentItem();

            for (let x = x1; x <= x2; x++) {
                for (let y = y1; y <= y2; y++) {
                    // Only draw straight lines (either X or Y must match the start point)
                    if (x === startGridX || y === startGridY) {
                        const key = `${x},${y}`;
                        // Only place if item is defined
                        if (item) {
                            batchData[key] = { id: item.id, rot: item.rotate ? rotation : 0 };
                        }
                    }
                }
            }
            
            if (Object.keys(batchData).length > 0) {
                await placeBatch(batchData);
            }
        }

        function resetInteractionState() {
            isDrawingLine = false;
            isCloning = false;
            isDeleting = false;
            mode = 'click';
            // Restore default mouse listeners
            setupEventListeners();
        }

        // --- Event Listeners ---

        function setupEventListeners() {
            // Remove previous listeners to avoid duplicates, especially after clone mode
            canvas.onmousedown = null; 
            canvas.onmousemove = null;
            canvas.onmouseup = null;
            canvas.onwheel = null;
            
            // Mouse down handler
            canvas.onmousedown = (e) => {
                const { gridX, gridY } = getGridCoords(e.clientX, e.clientY);
                startGridX = gridX;
                startGridY = gridY;

                if (e.button === 1 || e.button === 2) { // Middle or Right click for panning
                    isDragging = true;
                    lastMouseX = e.clientX;
                    lastMouseY = e.clientY;
                } else if (e.button === 0) { // Left click for action
                    if (mode === 'click') {
                        handleGridAction(gridX, gridY);
                    } else if (mode === 'line') {
                        isDrawingLine = true;
                    } else if (mode === 'clone') {
                        isCloning = true;
                    } else if (mode === 'delete') {
                        isDeleting = true;
                    }
                }
            };

            // Mouse move handler
            canvas.onmousemove = (e) => {
                const { gridX, gridY } = getGridCoords(e.clientX, e.clientY);
                currentGridX = gridX;
                currentGridY = gridY;

                if (isDragging) {
                    const dx = e.clientX - lastMouseX;
                    const dy = e.clientY - lastMouseY;
                    
                    const effectiveTileSize = canvas.width / (GRID_SIZE * zoom);
                    
                    offsetX -= dx / effectiveTileSize;
                    offsetY -= dy / effectiveTileSize;
                    
                    // Clamp offsets to keep the grid in view
                    offsetX = Math.max(0, Math.min(GRID_SIZE - canvas.width / effectiveTileSize, offsetX));
                    offsetY = Math.max(0, Math.min(GRID_SIZE - canvas.height / effectiveTileSize, offsetY));
                    
                    lastMouseX = e.clientX;
                }
                
                updateSelectionDisplay();
                drawGrid(); // Redraw frequently on mouse move
            };

            // Mouse up handler
            canvas.onmouseup = (e) => {
                isDragging = false;
                const { gridX, gridY } = getGridCoords(e.clientX, e.clientY);

                if (e.button === 0) { // Left click release
                    if (isDrawingLine) {
                        handleLineAction(gridX, gridY);
                    } else if (isCloning) {
                        handleCloneAction(gridX, gridY);
                    } else if (isDeleting) {
                        handleDeleteAction(gridX, gridY);
                    }
                    resetInteractionState(); // Reset mode flags
                }
            };

            // Mouse wheel for zoom
            canvas.onwheel = (e) => {
                e.preventDefault();
                const zoomFactor = 1.1;
                const oldZoom = zoom;
                
                if (e.deltaY < 0) {
                    zoom *= zoomFactor;
                } else {
                    zoom /= zoomFactor;
                }
                
                // Clamp zoom level
                zoom = Math.max(0.2, Math.min(4.0, zoom));

                // Recenter view based on mouse position
                const rect = canvas.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;

                // Calculate grid coordinate under the mouse before zoom
                const gridXBefore = mouseX / (canvas.width / (GRID_SIZE * oldZoom)) + offsetX;
                const gridYBefore = mouseY / (canvas.height / (GRID_SIZE * oldZoom)) + offsetY;

                // Calculate new offsets to keep the same grid coordinate under the mouse
                const effectiveTileSize = canvas.width / (GRID_SIZE * zoom);
                offsetX = gridXBefore - (mouseX / effectiveTileSize);
                offsetY = gridYBefore - (mouseY / effectiveTileSize);

                // Re-clamp offsets after zoom
                offsetX = Math.max(0, Math.min(GRID_SIZE - canvas.width / effectiveTileSize, offsetX));
                offsetY = Math.max(0, Math.min(GRID_SIZE - canvas.height / effectiveTileSize, offsetY));

                drawGrid();
            };

            // Keyboard controls
            document.onkeydown = (e) => {
                const step = 5;
                let moved = false;
                
                const effectiveTileSize = canvas.width / (GRID_SIZE * zoom);
                const viewWidthInTiles = canvas.width / effectiveTileSize;
                const viewHeightInTiles = canvas.height / effectiveTileSize;

                switch (e.key.toLowerCase()) {
                    case 'w': offsetY -= step; moved = true; break;
                    case 's': offsetY += step; moved = true; break;
                    case 'a': offsetX -= step; moved = true; break;
                    case 'd': offsetX += step; moved = true; break;
                    case 'r': // Rotate
                        const currentItem = getCurrentItem();
                        if (currentItem && currentItem.rotate) {
                            rotation = (rotation + 1) % 4;
                            drawGrid();
                        }
                        break;
                    case 'h': // Toggle Help Modal
                        document.getElementById('helpModal').classList.toggle('hidden');
                        break;
                    case '1': mode = 'click'; updateModeDisplay(); break;
                    case '2': mode = 'line'; updateModeDisplay(); break;
                    case '3': mode = 'clone'; updateModeDisplay(); break;
                    case '4': mode = 'delete'; updateModeDisplay(); break;
                }

                if (moved) {
                    // Clamp movement offsets
                    offsetX = Math.max(0, Math.min(GRID_SIZE - viewWidthInTiles, offsetX));
                    offsetY = Math.max(0, Math.min(GRID_SIZE - viewHeightInTiles, offsetY));
                    drawGrid();
                }
            };

            // Handle window resize
            window.onresize = () => {
                drawGrid();
            };
        }

        // --- UI & Initialization ---

        function updateSelectionDisplay() {
            const item = getCurrentItem();
            const modeName = mode.charAt(0).toUpperCase() + mode.slice(1);
            const selectedName = item ? item.name : 'None';
            
            document.getElementById('coordinateDisplay').innerHTML = 
                `X: ${currentGridX}, Y: ${currentGridY} | Mode: ${modeName} | Selected: ${selectedName}`;
        }
        
        function updateModeDisplay() {
            // In a real app, you'd update specific UI buttons here to show the active mode
            console.log(`Mode changed to: ${mode}`);
        }

        function createItemButtons() {
            const container = document.getElementById('itemButtons');
            container.innerHTML = '';
            
            items.forEach(item => {
                const button = document.createElement('button');
                button.className = `item-button p-2 flex flex-col items-center justify-center text-sm rounded-lg shadow-md transition duration-150`;
                button.style.backgroundColor = '#3a3a3a';
                button.style.color = '#FFFFFF';
                
                // Create a small canvas for the item preview
                const previewCanvas = document.createElement('canvas');
                const previewSize = 48;
                previewCanvas.width = previewSize;
                previewCanvas.height = previewSize;
                const pCtx = previewCanvas.getContext('2d');

                // Draw the item preview
                pCtx.fillStyle = '#1a1a1a';
                pCtx.fillRect(0, 0, previewSize, previewSize);
                item.draw(pCtx, 0, 0, previewSize, 0, false, item.color);
                
                const nameDiv = document.createElement('div');
                nameDiv.textContent = item.name;
                nameDiv.className = 'mt-1 text-xs text-gray-300 truncate';

                button.appendChild(previewCanvas);
                button.appendChild(nameDiv);

                if (item.id === selectedItemId) {
                    button.classList.add('selected');
                }
                
                button.onclick = () => {
                    selectedItemId = item.id;
                    selectedItem = item;
                    mode = 'click'; // Reset to click mode when selecting a new item
                    document.querySelectorAll('.item-button').forEach(btn => btn.classList.remove('selected'));
                    button.classList.add('selected');
                    updateSelectionDisplay();
                };
                
                container.appendChild(button);
            });
        }
        
        // Initial setup on window load
        window.onload = function() {
            // Center the view on the grid
            offsetX = GRID_SIZE / 2 - canvas.clientWidth / TILE_SIZE / 2;
            offsetY = GRID_SIZE / 2 - canvas.clientHeight / TILE_SIZE / 2;

            selectedItem = getCurrentItem();
            createItemButtons();
            setupEventListeners();
            drawGrid();
            
            // Show help modal on start
            document.getElementById('helpModal').classList.remove('hidden');
            
            // Button handlers for mode change
            document.getElementById('helpButton').onclick = () => {
                document.getElementById('helpModal').classList.toggle('hidden');
            };
        };

        // --- Gemini API Logic ---

        function serializeGridData() {
            if (Object.keys(gridData).length === 0) {
                return "The grid is currently empty. The user needs a description of a base design they are planning. Treat this as a blank slate and provide general, initial advice.";
            }

            // Map item IDs to their names
            const itemMap = items.reduce((acc, item) => {
                acc[item.id] = item.name;
                return acc;
            }, {});

            const baseSummary = {
                wallCount: 0,
                defenseCount: 0,
                storageCount: 0,
                layout: {} // { itemName: [coords] }
            };

            for (const key in gridData) {
                const [x, y] = key.split(',').map(Number);
                const obj = gridData[key];
                const name = itemMap[obj.id] || `Unknown Item ID ${obj.id}`;

                if (!baseSummary.layout[name]) {
                    baseSummary.layout[name] = [];
                }
                // Only log coordinates for the first 10 placements of an item type to keep the prompt short
                if (baseSummary.layout[name].length < 10) {
                    baseSummary.layout[name].push(`(${x},${y})`);
                }

                // Count categories (ID ranges)
                if (obj.id >= 1 && obj.id <= 9 || obj.id === 70) {
                    baseSummary.wallCount++;
                } else if (obj.id >= 20) {
                    baseSummary.defenseCount++;
                } else if (obj.id >= 12 && obj.id <= 19) {
                    baseSummary.storageCount++;
                }
            }

            let prompt = "Base Layout Map Summary:\n";
            prompt += `Total unique blocks placed: ${Object.keys(gridData).length}\n`;
            prompt += `Total walls (including low walls): ${baseSummary.wallCount}\n`;
            prompt += `Total defenses (Spikes, Tesla Coil): ${baseSummary.defenseCount}\n`;
            prompt += `Total storage/utilities (Fridge, Chests, Workbench): ${baseSummary.storageCount}\n\n`;
            
            prompt += "Specific Placement Details (first 10 coordinates listed per item type for context):\n";
            
            // Sort items for readability
            const sortedItemNames = Object.keys(baseSummary.layout).sort();
            
            sortedItemNames.forEach(name => {
                const count = baseSummary.layout[name].length;
                prompt += `- ${name} (Total: ${count} tiles). Coords: ${baseSummary.layout[name].join(', ')}${count > 10 ? '...' : ''}\n`;
            });
            
            prompt += `\n--- End of Grid Data. Focus your analysis on the placement and ratio of these items. ---\n`;
            
            return prompt;
        }

        window.callGeminiAnalysis = async function() {
            const analysisModal = document.getElementById('analysisModal');
            const analysisContent = document.getElementById('analysisContent');
            const analyzeButton = document.getElementById('analyzeButton');
            const describeButton = document.getElementById('describeButton');
            
            analyzeButton.disabled = true;
            describeButton.disabled = true;

            analysisContent.innerHTML = '<div class="text-center py-8"><svg class="animate-spin h-8 w-8 text-emerald-400 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><p class="mt-2 text-emerald-300">Analyzing base structure...</p></div>';
            analysisModal.classList.remove('hidden');

            const serializedData = serializeGridData();
            const apiKey = ""; 
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
            
            const systemPrompt = "You are a highly experienced survival game base planning strategist. Your task is to analyze the provided base layout and give constructive, strategic feedback. Focus on defense (wall placement, trap usage), resource management (storage accessibility), and overall efficiency. Keep the analysis friendly, encouraging, and structured into 3 distinct, concise points (Defense, Utility, Efficiency).";
            
            const userQuery = `Analyze the following base structure data from the user's grid editor. Provide a detailed critique and specific suggestions based on its strengths and weaknesses. The grid is 149x149. The coordinates are (X, Y). \n\n${serializedData}`;

            const payload = {
                contents: [{ parts: [{ text: userQuery }] }],
                systemInstruction: {
                    parts: [{ text: systemPrompt }]
                },
            };

            let responseText = "Sorry, the tactical analysis server is currently offline. Please try fortifying your base later.";
            let delay = 1000; // 1 second initial delay
            const maxRetries = 3;

            for (let i = 0; i < maxRetries; i++) {
                try {
                    const response = await fetch(apiUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });

                    const result = await response.json();
                    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

                    if (text) {
                        responseText = text;
                        break; // Success! Exit loop
                    }
                } catch (e) {
                    // Log error but continue to retry
                    console.error(`Gemini API call failed, retrying in ${delay/1000}s...`, e);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    delay *= 2; // Exponential backoff
                }
            }

            // Convert Markdown response to HTML for display
            const htmlContent = responseText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                        .replace(/\n\n/g, '<br><br>')
                                        .replace(/\n/g, '<br>');
                                           
            analysisContent.innerHTML = `<p class="text-gray-200">${htmlContent}</p>`;
            analyzeButton.disabled = false;
            describeButton.disabled = false;
        }

        window.callGeminiDescription = async function() {
            const analysisModal = document.getElementById('analysisModal');
            const analysisContent = document.getElementById('analysisContent');
            const analyzeButton = document.getElementById('analyzeButton');
            const describeButton = document.getElementById('describeButton');
            
            const item = getCurrentItem();
            if (!item) {
                analysisContent.innerHTML = '<p class="text-red-400">Please select an item first from the sidebar!</p>';
                analysisModal.classList.remove('hidden');
                return;
            }

            analyzeButton.disabled = true;
            describeButton.disabled = true;

            analysisContent.innerHTML = '<div class="text-center py-8"><svg class="animate-spin h-8 w-8 text-purple-400 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><p class="mt-2 text-purple-300">Creating item description for ' + item.name + '...</p></div>';
            analysisModal.classList.remove('hidden');

            const apiKey = ""; 
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
            
            const systemPrompt = "You are a creative writer for a post-apocalyptic survival game called Devast. Write a short, exciting, and thematic description for the item the user provides. Include its key features and a bit of lore or strategic advice. Keep it to one short, engaging paragraph.";
            
            const itemDetails = `Item Name: ${item.name}. ID: ${item.id}. Structure: ${item.structure ? 'Wall/Structure' : 'Utility/Trap'}. Rotatable: ${item.rotate ? 'Yes' : 'No'}. Color: ${item.color}.`;
            const userQuery = `Write a description for the following game item:\n\n${itemDetails}`;

            const payload = {
                contents: [{ parts: [{ text: userQuery }] }],
                systemInstruction: {
                    parts: [{ text: systemPrompt }]
                },
            };

            let responseText = "Sorry, I couldn't generate a description for this item right now.";
            let delay = 1000;
            const maxRetries = 3;

            for (let i = 0; i < maxRetries; i++) {
                try {
                    const response = await fetch(apiUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });

                    const result = await response.json();
                    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

                    if (text) {
                        responseText = text;
                        break;
                    }
                } catch (e) {
                    console.error(`Gemini API call failed, retrying in ${delay/1000}s...`, e);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    delay *= 2;
                }
            }

            // Convert Markdown response to HTML for display
            const htmlContent = responseText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                        .replace(/\n\n/g, '<br><br>')
                                        .replace(/\n/g, '<br>');
                                           
            analysisContent.innerHTML = `<p class="text-gray-200">${htmlContent}</p>`;
            analyzeButton.disabled = false;
            describeButton.disabled = false;
        }


        // --- Firestore Data Operations ---

        function getDocRef(docId = 'grid-data') {
            if (!db || !userId) return null;
            // Public collection path for collaborative projects
            const collectionPath = `/artifacts/${appId}/public/data/editor-maps`;
            return doc(db, collectionPath, docId);
        }

        // Set up real-time listener for grid data
        function setupFirestoreListener() {
            const docRef = getDocRef();
            if (!docRef) return;
            
            onSnapshot(docRef, (docSnap) => {
                if (docSnap.exists()) {
                    // Data is stored under the 'data' field
                    const data = docSnap.data().data || {};
                    // Deserialize complex objects if needed, but for this simple structure, direct assignment works
                    gridData = data;
                } else {
                    gridData = {}; // Initialize empty if document doesn't exist
                    console.log("No existing data found. Starting fresh.");
                }
                drawGrid();
            }, (error) => {
                console.error("Firestore listen error:", error);
            });
        }
        
        // Place a single object
        async function placeObject(key, obj) {
            if (!db || !userId) return;

            const docRef = getDocRef();
            if (!docRef) return;

            try {
                await runTransaction(db, async (transaction) => {
                    const docSnap = await transaction.get(docRef);
                    let currentData = docSnap.exists() ? docSnap.data().data || {} : {};

                    // Perform the update
                    const existing = currentData[key];
                    if (existing && existing.id === obj.id) {
                        // If clicking on the same object, delete it (toggle behavior)
                        delete currentData[key];
                    } else {
                        // Place new object
                        currentData[key] = obj;
                    }

                    transaction.set(docRef, { data: currentData, userId: userId }, { merge: true });
                });
            } catch (error) {
                console.error("Transaction failed (placeObject):", error);
            }
        }
        
        // Place a batch of objects (used for line/clone)
        async function placeBatch(batchData) {
            if (!db || !userId) return;

            const docRef = getDocRef();
            if (!docRef) return;

            try {
                await runTransaction(db, async (transaction) => {
                    const docSnap = await transaction.get(docRef);
                    let currentData = docSnap.exists() ? docSnap.data().data || {} : {};

                    // Merge batch data into current data
                    Object.assign(currentData, batchData);

                    transaction.set(docRef, { data: currentData, userId: userId }, { merge: true });
                });
            } catch (error) {
                console.error("Transaction failed (placeBatch):", error);
            }
        }

        // Delete a single object
        async function deleteObject(key) {
             if (!db || !userId) return;

            const docRef = getDocRef();
            if (!docRef) return;

            try {
                await runTransaction(db, async (transaction) => {
                    const docSnap = await transaction.get(docRef);
                    let currentData = docSnap.exists() ? docSnap.data().data || {} : {};

                    // Delete the key
                    delete currentData[key];

                    // NOTE: Firestore doesn't allow deleting nested fields inside a map directly using dot notation in set/update if the parent doesn't exist or is a transaction.
                    // The safest way is to update the entire map, or use a complex update if only deleting a few known fields. 
                    // Since the map size is relatively small, updating the whole map is simpler in a transaction.
                    transaction.set(docRef, { data: currentData, userId: userId }, { merge: true });
                });
            } catch (error) {
                console.error("Transaction failed (deleteObject):", error);
            }
        }

        // Delete a batch of objects
        async function deleteBatch(keysToDelete) {
            if (!db || !userId) return;

            const docRef = getDocRef();
            if (!docRef) return;

            try {
                await runTransaction(db, async (transaction) => {
                    const docSnap = await transaction.get(docRef);
                    let currentData = docSnap.exists() ? docSnap.data().data || {} : {};

                    // Delete all keys in the batch
                    keysToDelete.forEach(key => {
                        delete currentData[key];
                    });

                    transaction.set(docRef, { data: currentData, userId: userId }, { merge: true });
                });
            } catch (error) {
                console.error("Transaction failed (deleteBatch):", error);
            }
        }
        
    </script>
</body>
</html>

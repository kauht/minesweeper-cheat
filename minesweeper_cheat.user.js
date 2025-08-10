// ==UserScript==
// @name         minesweeper.online cheat
// @namespace    http://tampermonkey.net/
// @version      08/10/2025
// @description  Click 'A' to activate auto-play [dangerous]
// @author       kauht
// @grant        none
// @downloadURL https://raw.githubusercontent.com/kauht/minesweeper-cheat/refs/heads/master/minesweeper_cheat.user.js
// @updateURL https://raw.githubusercontent.com/kauht/minesweeper-cheat/refs/heads/master/minesweeper_cheat.user.js
// ==/UserScript==

(function() {
    'use strict';
    const cells = new Map();
    let AreaBlock = null;
    
    function getPos(element) {
        if (!element || !element.dataset) return null;
        const x = parseInt(element.dataset.x);
        const y = parseInt(element.dataset.y);
        if (isNaN(x) || isNaN(y)) return null;
        return [x, y];
    }
    
    function checkAround(pos) {
        const around = [];
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                if (dx === 0 && dy === 0) continue;
                around.push([pos[0] + dx, pos[1] + dy]); // idk either dw
            }
        }
        return around;
    }
    
    function highlight(pos) {
        const cell = document.querySelector(`[data-x="${pos[0]}"][data-y="${pos[1]}"]`);
        if (cell) {
            cell.style.outline = "2px solid blue";
            cell.style.transition = "outline 0.3s ease";
        }
    }
    
    function isChordable(pos) {
        const currentCell = cells.get(pos.toString());
        if (!currentCell || isNaN(parseInt(currentCell))) {
            return false;
        }
        
        const bombCount = parseInt(currentCell);
        const around = checkAround(pos);
        let flagCount = 0;
        let closedCount = 0;
        
        for (const p of around) {
            const cellState = cells.get(p.toString());
            if (cellState === 'f') {
                flagCount++;
            } else if (cellState === 'h') {
                closedCount++;
            }
        }

        // only chord if there are closed cells in its proximity and has the right number of flags near it
        return flagCount === bombCount && closedCount > 0;
    }
    
    function checkBoard(clicked) {
        console.log("checking board...");
        cells.clear();
        
        if (!AreaBlock) return;
        
        // clear outlines
        Array.from(AreaBlock.children).forEach(child => {
            child.style.outline = '';
        });

        Array.from(AreaBlock.children).forEach(child => {
            const pos = getPos(child);
            if (!pos) return;
            
            if (child.className.includes("hdn_flag")) {
                cells.set(pos.toString(), 'f');
            } else if (child.className.includes("hdn_closed")) {
                cells.set(pos.toString(), 'h'); // started using toString and using the cells map
            } else {                            // like [string, char] to avoid headaches
                // get number [0-8] from class name (hdn_typeX)
                const typeMatch = child.className.match(/hdn_type(\d)/);
                if (typeMatch) {
                    cells.set(pos.toString(), typeMatch[1]);
                }
            }
        });
        
        // check chordable cells
        cells.forEach((value, key) => {
            if (isNaN(value)) return;
            
            const pos = key.split(',').map(Number);
            if (isChordable(pos)) {
                console.log(`Cell at [${pos}] is chordable`);
                highlight(pos);
            }
        });
    }
    
    function initCells() {
        AreaBlock = document.getElementById("AreaBlock");
        if (!AreaBlock) {
            setTimeout(initCells, 500);
            return;
        }
        checkBoard(null);
    }
    
    function initCheat() {
        console.log('Starting Cheat...');
        initCells();
        
        document.addEventListener("mousedown", (event) => {
            update(event.target);
        });
        
        
        setInterval(() => checkBoard(null), 1000);
    }
    
    function update(clicked) {
        const pos = getPos(clicked);
        if (pos) {
            console.log(`Clicked at [${pos}]`);
            checkBoard(clicked);
        }
    }
    
    if (document.readyState === "loading") {
        document.addEventListener('DOMContentLoaded', initCheat);
    } else {
        initCheat();
    }
})();
const canvas = document.getElementById('mapEditorCanvas');
const ctx = canvas.getContext('2d');

import {Grid} from "/js/class/grid/Grid.js"; 
import {Mouse} from "/js/class/mouseHandling/Mouse.js"; 

let grid = new Grid(canvas, ctx);
let mouse = new Mouse(canvas);

grid.create();

canvas.addEventListener('mousedown', (evt) => {
    let cursorPos = mouse.getCursorPos(evt);
    grid.fillCell(cursorPos);
});





const canvas = document.getElementById('mapEditorCanvas');
const ctx = canvas.getContext('2d');

import {Grid} from "/js/class/grid/Grid.js"; 
import {Mouse} from "/js/class/mouseHandling/Mouse.js"; 
import {MapDownloader} from "/js/class/download/MapDownloader.js"; 

let grid = new Grid(canvas, ctx);
let mouse = new Mouse(canvas);
let mapDownloader = new MapDownloader(canvas);

grid.create();

const dlButton = document.getElementById('dlMapBtn');

dlButton.addEventListener('click', () => {
    let rndmName = Date.now() + Math.random();
    let map = grid.getMap();
    console.log(map);
    //mapDownloader.downloadMap(map, rndmName);
})

canvas.addEventListener('mousedown', (evt) => {
    let cursorPos = mouse.getCursorPos(evt);
    grid.fillCell(cursorPos);
});







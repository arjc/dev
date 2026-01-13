const cells = document.querySelectorAll('.cell-grid div'); 

selectedCell = null;

cells.forEach(cell => {
    cell.setAttribute('onclick', 'flip(this)');
    
});

function flip(cell) {
    cell.classList.add('flipped');
    selectedCell = cell;
}


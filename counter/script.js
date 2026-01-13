let x = 0;
let y = 0;
let z = 0;
let mode = 'cartesian';
let is2D = false;
let xUsed = false;
let yUsed = false;
let zUsed = false;

// Audio preloading
let pastAudio;
let futureAudio;
let audioLoaded = false;

function preloadAudio() {
    if (!audioLoaded) {
        pastAudio = new Audio('audio/past.mp3');
        futureAudio = new Audio('audio/future.mp3');
        pastAudio.load();
        futureAudio.load();
        audioLoaded = true;
    }
}

const numSpan = document.querySelector("#displayNum");
const modeButtons = document.querySelector("#modeButtons");
const ctrlGrid = document.querySelector("#ctrlGrid");
const vectorBtn = document.querySelector("#vector");
const complexBtn = document.querySelector("#complex");
const trigBtn = document.querySelector("#trig");
const cartesianBtn = document.querySelector("#cartesian");
const polarBtn = document.querySelector("#polar");
const exponentialBtn = document.querySelector("#exponential");
const matrixBtn = document.querySelector("#matrix");

const yIncrementBtn = document.querySelector("#yIncrement");
const yDecrementBtn = document.querySelector("#yDecrement");
const zIncrementBtn = document.querySelector("#zIncrement");
const zDecrementBtn = document.querySelector("#zDecrement");
const tIncrementBtn = document.querySelector("#tIncrement");
const tDecrementBtn = document.querySelector("#tDecrement");
const pageWrapper = document.querySelector("#pageWrapper");

cartesianBtn.classList.add('active');

// Initial positioning
setTimeout(() => {
    numSpan.classList.add('positioned');
}, 100);

function increment() {
    preloadAudio(); // Preload on first button press
    x += 1;
    if (!xUsed) {
        xUsed = true;
        showYControls();
    }
    updateDisplay();
}

function decrement() {
    preloadAudio(); // Preload on first button press
    x -= 1;
    if (!xUsed) {
        xUsed = true;
        showYControls();
    }
    updateDisplay();
}

function yIncrement() {
    preloadAudio(); // Preload on first button press
    y += 1;
    if (!yUsed) {
        yUsed = true;
        showZControls();
    }
    check2DMode();
    updateDisplay();
}

function yDecrement() {
    preloadAudio(); // Preload on first button press
    y -= 1;
    if (!yUsed) {
        yUsed = true;
        showZControls();
    }
    check2DMode();
    updateDisplay();
}

function zIncrement() {
    preloadAudio(); // Preload on first button press
    z += 1;
    if (!zUsed) {
        zUsed = true;
        showTControls();
    }
    check2DMode();
    updateDisplay();
}

function zDecrement() {
    preloadAudio(); // Preload on first button press
    z -= 1;
    if (!zUsed) {
        zUsed = true;
        showTControls();
    }
    check2DMode();
    updateDisplay();
}

function tIncrement() {
    // Travel to the future - close window
    if (futureAudio) {
        futureAudio.currentTime = 0;
        futureAudio.play().catch(() => { });
    }

    document.body.classList.add('time-travel');

    setTimeout(() => {
        pageWrapper.classList.add('stretch-y');
    }, 100);

    setTimeout(() => {
        window.close();
        // If window.close() doesn't work (blocked by browser), show a message
        setTimeout(() => {
            window.alert("TIME SHALL GET YOU NO MATTER WHAT!")
        }, 500);
    }, 10000);

}

function tDecrement() {
    // Travel to the past - go back
    if (pastAudio) {
        pastAudio.currentTime = 0;
        pastAudio.play().catch(() => { });
    }

    document.body.classList.add('time-travel');

    setTimeout(() => {
        pageWrapper.classList.add('stretch-x');
    }, 100);

    setTimeout(() => {
        document.body.classList.add('final-white');
    }, 4350);

    setTimeout(() => {
        window.history.back();
        setTimeout(() => {
            window.alert("TIME IS NOT A LIE!")
        }, 500);
    }, 10000);
}

function showYControls() {
    yIncrementBtn.classList.remove('hidden');
    yDecrementBtn.classList.remove('hidden');
    document.title = '2D Counter';
}

function showZControls() {
    zIncrementBtn.classList.remove('hidden');
    zDecrementBtn.classList.remove('hidden');
    document.title = '3D Counter';
}

function showTControls() {
    tIncrementBtn.classList.remove('hidden');
    tDecrementBtn.classList.remove('hidden');
    document.title = '4D Counter?';
}

function hideYControls() {
    yIncrementBtn.classList.add('hidden');
    yDecrementBtn.classList.add('hidden');
    document.title = 'Counter';
}

function hideZControls() {
    zIncrementBtn.classList.add('hidden');
    zDecrementBtn.classList.add('hidden');
    document.title = '2D Counter';
}

function hideTControls() {
    tIncrementBtn.classList.add('hidden');
    tDecrementBtn.classList.add('hidden');
    document.title = '3D Counter';
}

function reset() {
    x = 0;
    y = 0;
    z = 0;
    xUsed = false;
    yUsed = false;
    zUsed = false;
    hideYControls();
    hideZControls();
    hideTControls();
    check2DMode();
    updateDisplay();
}

function check2DMode() {
    const should2D = y !== 0 || z !== 0;

    if (should2D && !is2D) {
        // Entering 2D/3D mode
        is2D = true;
        numSpan.classList.remove('floating');
        modeButtons.classList.add('visible');
    } else if (!should2D && is2D) {
        // Exiting 2D mode
        is2D = false;
        numSpan.classList.add('floating');
        modeButtons.classList.remove('visible');
    }
}

function updateButtonLabels(showsZ) {
    if (showsZ) {
        cartesianBtn.querySelector('.btn-text').textContent = '(x, y, z)';
        vectorBtn.querySelector('.btn-text').textContent = 'xî + yĵ + zk';
        complexBtn.querySelector('.btn-text').textContent = 'x + yi + zj';
        matrixBtn.querySelector('.btn-text').textContent = '[ x  y  z ]';
    } else {
        cartesianBtn.querySelector('.btn-text').textContent = '(x, y)';
        vectorBtn.querySelector('.btn-text').textContent = 'xî + yĵ';
        complexBtn.querySelector('.btn-text').textContent = 'x + yi';
        matrixBtn.querySelector('.btn-text').textContent = '[ x  y ]';
    }
}

function updateDisplay() {
    let displayText = '';
    let showsZ = false;

    if (!is2D) {
        // 1D mode: just show x
        displayText = `${x}`;
    } else {
        // 2D/3D mode: show according to selected format

        switch (mode) {
            case 'cartesian':
                if (z !== 0) {
                    displayText = `(${x}, ${y}, ${z})`;
                    showsZ = true;
                } else {
                    displayText = `(${x}, ${y})`;
                }
                break;
            case 'vector':
                let parts = [];
                if (x !== 0) parts.push(`${x}î`);
                if (y !== 0) parts.push(`${y >= 0 && parts.length > 0 ? '+' : ''}${y}ĵ`);
                if (z !== 0) {
                    parts.push(`${z >= 0 && parts.length > 0 ? '+' : ''}${z}k̂`);
                    showsZ = true;
                }
                displayText = parts.length > 0 ? parts.join(' ') : '0';
                break;
            case 'complex':
                if (y >= 0) {
                    displayText = `${x} + ${y}i`;
                } else {
                    displayText = `${x} - ${Math.abs(y)}i`;
                }
                if (z !== 0) {
                    displayText += z >= 0 ? ` + ${z}j` : ` - ${Math.abs(z)}j`;
                    showsZ = true;
                }
                break;
            case 'polar':
                const r2D = Math.sqrt(x * x + y * y);
                const theta2D = Math.atan2(y, x);
                const theta2DDeg = (theta2D * 180 / Math.PI).toFixed(2);
                displayText = `${r2D.toFixed(2)}∠${theta2DDeg}°`;
                if (z !== 0) {
                    displayText += `, z=${z}`;
                    showsZ = true;
                }
                break;
            case 'trig':
                const rTrig = Math.sqrt(x * x + y * y);
                const thetaTrig = Math.atan2(y, x);
                displayText = `${rTrig.toFixed(2)}(cos ${thetaTrig.toFixed(3)}, sin ${thetaTrig.toFixed(3)})`;
                if (z !== 0) {
                    displayText += `, z=${z}`;
                    showsZ = true;
                }
                break;
            case 'exponential':
                const rExp = Math.sqrt(x * x + y * y);
                const thetaExp = Math.atan2(y, x);
                displayText = `${rExp.toFixed(2)}e^(i${thetaExp.toFixed(3)})`;
                if (z !== 0) {
                    displayText += `, z=${z}`;
                    showsZ = true;
                }
                break;
            case 'matrix':
                if (z !== 0) {
                    displayText = `[ ${x}  ${y}  ${z} ]`;
                    showsZ = true;
                } else {
                    displayText = `[ ${x}  ${y} ]`;
                }
                break;
        }
    }

    numSpan.textContent = displayText;

    // Update button labels based on whether z is shown in display
    if (is2D) {
        updateButtonLabels(showsZ);
    }
}

function setActiveButton(activeBtn) {
    [cartesianBtn, vectorBtn, complexBtn, polarBtn, trigBtn, exponentialBtn, matrixBtn].forEach(btn => {
        btn.classList.remove('active');
    });
    activeBtn.classList.add('active');
}

function chngToCartesian() {
    mode = 'cartesian';
    setActiveButton(cartesianBtn);
    updateDisplay();
}

function chngToVector() {
    mode = 'vector';
    setActiveButton(vectorBtn);
    updateDisplay();
}

function chngToComplex() {
    mode = 'complex';
    setActiveButton(complexBtn);
    updateDisplay();
}

function chngToPolar() {
    mode = 'polar';
    setActiveButton(polarBtn);
    updateDisplay();
}

function chngToTrig() {
    mode = 'trig';
    setActiveButton(trigBtn);
    updateDisplay();
}

function chngToExponential() {
    mode = 'exponential';
    setActiveButton(exponentialBtn);
    updateDisplay();
}

function chngToMatrix() {
    mode = 'matrix';
    setActiveButton(matrixBtn);
    updateDisplay();
}
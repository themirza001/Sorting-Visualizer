let n = 40; // Default number of elements
const array = [];
let audioCtx = null;
let animationFrameId = null;
let swaps = [];
let animating = false;
let paused = false;
let timeoutId = null;

init();

function init() {
  array.length = 0; // Clear existing array
  for (let i = 0; i < n; i++) {
    array.push(Math.random());
  }
  showBars(); // Initialize the display
  document.getElementById('arraySizeDisplay').innerText = n;
}

function updateArraySize() {
  const newSize = parseInt(document.getElementById('arraySize').value, 10);
  if (isNaN(newSize) || newSize < 5) {
    alert('Please enter a valid number of values (minimum is 5).');
    return;
  }
  n = newSize;
  reset(); // Call reset to update the array and stop any ongoing animation
}

function play() {
  if (animating) {
    return; // Prevent starting a new animation if one is already running
  }
  animating = true;
  paused = false;
  const algorithm = document.getElementById('algorithm').value;
  switch (algorithm) {
    case 'bubbleSort':
      swaps = bubbleSort([...array]);
      break;
    case 'quickSort':
      swaps = quickSort([...array]);
      break;
    case 'selectionSort':
      swaps = selectionSort([...array]);
      break;
    case 'mergeSort':
      swaps = mergeSort([...array]);
      break;
  }
  animate();
}

function animate() {
  if (swaps.length === 0) {
    showBars(); // Ensure final state is displayed
    animating = false;
    return;
  }
  if (paused) {
    animationFrameId = requestAnimationFrame(animate);
    return;
  }
  const [i, j] = swaps.shift();
  [array[i], array[j]] = [array[j], array[i]];
  showBars([i, j]);
  playNote(200 + array[i] * 500);
  playNote(200 + array[j] * 500);

  const speed = parseInt(document.getElementById('speed').value, 10);
  timeoutId = setTimeout(function () {
    animate();
  }, speed);
}

function pause() {
  if (animating && !paused) {
    paused = true;
    cancelAnimationFrame(animationFrameId);
    clearTimeout(timeoutId);
  }
}

function resume() {
  if (animating && paused) {
    paused = false;
    animate();
  }
}

function reset() {
  // Stop ongoing animation
  animating = false;
  paused = false;
  cancelAnimationFrame(animationFrameId);
  clearTimeout(timeoutId);

  // Reinitialize the array and display
  init();
}

function bubbleSort(array) {
  const swaps = [];
  let swapped;
  do {
    swapped = false;
    for (let i = 0; i < array.length - 1; i++) {
      if (array[i] > array[i + 1]) {
        swaps.push([i, i + 1]);
        swapped = true;
        [array[i], array[i + 1]] = [array[i + 1], array[i]];
      }
    }
  } while (swapped);
  return swaps;
}

function quickSort(array, low = 0, high = array.length - 1, swaps = []) {
  if (low < high) {
    const pi = partition(array, low, high, swaps);
    quickSort(array, low, pi - 1, swaps);
    quickSort(array, pi + 1, high, swaps);
  }
  return swaps;
}

function partition(array, low, high, swaps) {
  const pivot = array[high];
  let i = low - 1;
  for (let j = low; j <= high - 1; j++) {
    if (array[j] < pivot) {
      i++;
      swaps.push([i, j]);
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
  swaps.push([i + 1, high]);
  [array[i + 1], array[high]] = [array[high], array[i + 1]];
  return i + 1;
}

function selectionSort(array) {
  const swaps = [];
  for (let i = 0; i < array.length - 1; i++) {
    let minIndex = i;
    for (let j = i + 1; j < array.length; j++) {
      if (array[j] < array[minIndex]) {
        minIndex = j;
      }
    }
    if (minIndex !== i) {
      swaps.push([i, minIndex]);
      [array[i], array[minIndex]] = [array[minIndex], array[i]];
    }
  }
  return swaps;
}



function showBars(indices) {
  const container = document.getElementById('container');
  container.innerHTML = '';
  for (let i = 0; i < array.length; i++) {
    const bar = document.createElement('div');
    bar.style.height = array[i] * 100 + '%';
    bar.classList.add('bar');
    if (indices && indices.includes(i)) {
      bar.classList.add('swap');
    }
    container.appendChild(bar);
  }
}

function playNote(freq) {
  if (audioCtx === null) {
    audioCtx = new (AudioContext ||
      webkitAudioContext ||
      window.webkitAudioContext)();
  }
  const dur = 0.1;
  const osc = audioCtx.createOscillator();
  osc.frequency.value = freq;
  osc.start();
  osc.stop(audioCtx.currentTime + dur);
  const node = audioCtx.createGain();
  node.gain.value = 0.1;
  node.gain.linearRampToValueAtTime(0, audioCtx.currentTime + dur);
  osc.connect(node);
  node.connect(audioCtx.destination);
}

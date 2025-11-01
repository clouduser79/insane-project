// Titles and images
const TITLES = [
  'Click to start',
  'Thank you',
  'For being',
  'In my life.',
];

const IMAGES = [
  '/static/myimage.png', // intro image
  '/static/Screenshot_20251019_134140_Chrome.jpg',
  '/static/Screenshot_20251019_134126_Chrome.jpg',
  '/static/Screenshot_20251019_134153_Chrome.jpg',
];

let currentIndex = 0;
let userName = '';

document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('nameInput') as HTMLInputElement | null;
  const button = document.getElementById('submitButton') as HTMLButtonElement | null;

  if (!input || !button) return;

  button.addEventListener('click', () => {
    const name = input.value.trim();
    if (!name) {
      alert('Please enter your name first!');
      return;
    }

    userName = name;

    // Replace body content with animation container
    document.body.innerHTML = '<div id="app"></div>';
    currentIndex = 0;
    renderApp();

    // Start animation and music on first click
    document.addEventListener(
      'click',
      () => {
        playLoopingMusic('/static/background.mp3');

        let index = 1;
        setInterval(() => {
          currentIndex = index;
          renderApp();
          index = index >= 3 ? 1 : index + 1;
        }, 500);
      },
      { once: true }
    );
  });
});

function renderApp(): void {
  const app = document.querySelector<HTMLDivElement>('#app');
  if (!app) return;

  app.innerHTML = `
    <link
      href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap"
      rel="stylesheet"
    />

    <style>
      html, body {
        margin: 0;
        padding: 0;
        height: 100%;
        width: 100%;
        font-family: 'Roboto', Arial, sans-serif;
        background: linear-gradient(135deg, #00035B 0%, #006400 100%);
        overflow: hidden;
      }

      body, #app {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
      }

      main {
        background: rgba(0, 0, 0, 0.3);
        padding: 2.5rem 3rem;
        border-radius: 12px;
        box-shadow: 0 8px 40px rgba(0,0,0,0.3);
        text-align: center;
        max-width: 500px;
        width: 90%;
        color: #fff;
      }

      h1 {
        margin: 0 0 1.5rem 0;
        font-size: 2rem;
        font-weight: 700;
      }

      img {
        width: 220px;
        border-radius: 8px;
        margin-bottom: 1.2rem;
        box-shadow: 0 6px 25px rgba(0,0,0,0.4);
      }

      p {
        font-size: 1rem;
        color: #e0e0e0;
      }
    </style>

    <main>
      <h1>${TITLES[currentIndex]}</h1>
      <img src="${IMAGES[currentIndex]}" alt="Image">
      <p>Enjoy the show, <strong>${userName}</strong>.</p>
    </main>
  `;
}

// Smooth looping background music
async function playLoopingMusic(url: string) {
  const audioCtx = new AudioContext();
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

  const playBuffer = (when = 0) => {
    const source = audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioCtx.destination);
    source.start(when);
    return source;
  };

  // Start twice for a seamless loop
  playBuffer(0);
  playBuffer(audioBuffer.duration);

  // Keep looping
  setInterval(() => playBuffer(), audioBuffer.duration * 1000);
}
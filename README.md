# React Web Player

A modern web application for displaying images with custom background music. Upload your own image and MP3 file to create a personalized presentation with infinite looping playback.

## Features

- **Single Image Upload**: Upload one image to display in your presentation
- **Custom Music Upload**: Upload any MP3 file as background music
- **Infinite Loop**: Song and presentation play continuously until stopped
- **Dynamic Background**: Background color extracted from uploaded image creates matching gradient
- **Stop Control**: Stop button to halt playback and return to home screen
- **File Info Display**: Shows uploaded image and song file names during presentation
- **Responsive Design**: Works on desktop browsers
- **Volume Control**: Adjust audio levels during playback

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Styling**: CSS3 with inline styles
- **Audio**: Web Audio API
- **Build Tool**: Vite
- **Deployment**: GitHub Pages

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/clouduser79/web-player.git
   cd web-player/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## How to Use

1. Upload an MP3 file of your choice as background music
2. Upload a single image to display
3. Click "Start Presentation" to begin
4. The song and image will loop infinitely
5. Click "Stop & Return Home" to stop playback and return to the upload screen
6. Use the volume control to adjust audio levels during playback

## Recent Changes

### v1.0.2 (May 17, 2026)

**Major Updates:**
- Renamed application to "React Web Player"
- Limited image upload to 1 image
- Added custom MP3 file upload (removed pre-loaded songs)
- Removed message input feature
- Removed all background animations and sparkle effects
- Implemented background color extraction from uploaded image
- Added infinite looping for song and presentation
- Added stop button to halt playback
- Added file info box displaying image and song names
- Removed image preview thumbnails (shows text confirmation instead)
- Styled submit button with purple theme

**Deleted Features:**
- Multiple image upload support
- Pre-loaded music tracks
- Message/name input
- Sparkle background animations
- Image preview thumbnails

**Bug Fixes:**
- Fixed audio not stopping when stop button clicked
- Fixed song name not displaying in info box

## Browser Support

The application is fully responsive and works on:
- Desktop browsers (Chrome, Firefox, Safari, Edge)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with React and Vite
- Web Audio API for audio playback
- Canvas API for color extraction

## Contact

For any questions or feedback, please open an issue on GitHub.
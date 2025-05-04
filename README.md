# TraceMate - Camera Tracing Web Application

TraceMate is a modern web application designed to assist users in tracing images onto physical surfaces. It overlays a semi-transparent image on top of a live camera feed, allowing users to trace the image onto paper or other surfaces.

## Features

- Image upload functionality
- Live camera feed with image overlay
- Adjustable overlay settings (opacity, scale, position, rotation, tilt)
- Touch and mouse gestures for direct image manipulation
- 3D perspective controls with tilt on X and Y axes
- Camera selection for devices with multiple cameras
- Full screen mode for an immersive experience
- Paper alignment guides to help with positioning
- Responsive design for various screen sizes
- Camera permission management
- Resource-efficient camera handling (stops when not in use)
- Modern frosted glass UI

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/traceMate.git
   ```
2. Navigate to the project directory:
   ```bash
   cd traceMate
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Development

To run the application in development mode:

```bash
npm start
```

The application will be available at [http://localhost:3000](http://localhost:3000).

### Building for Production

To build the application for production:

```bash
npm run build
```

The build files will be created in the `build` directory and can be deployed to any static hosting service.

## Deployment

TraceMate can be deployed to various platforms:

### Netlify

1. Create a new site from Git in the Netlify dashboard
2. Connect to your GitHub repository
3. Set the build command to `npm run build`
4. Set the publish directory to `build`

### Vercel

1. Import your GitHub repository in the Vercel dashboard
2. Vercel will automatically detect the React application settings
3. Deploy with default settings

### GitHub Pages

1. Install the gh-pages package:
   ```bash
   npm install --save-dev gh-pages
   ```
2. Add the following to your `package.json`:
   ```json
   "homepage": "https://yourusername.github.io/traceMate",
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d build"
   }
   ```
3. Deploy to GitHub Pages:
   ```bash
   npm run deploy
   ```

## Usage Instructions

1. **Upload an Image**: Start by uploading an image you want to trace
2. **Adjust the Overlay**: Use the adjustment panel to modify opacity, scale, position, rotation, and tilt
3. **Direct Manipulation**: You can also directly manipulate the image with:
   - Drag: Move the image with one finger or mouse drag
   - Pinch/Wheel: Zoom in/out with two fingers or mouse wheel
   - Two-finger rotate: Rotate the image with two fingers
4. **Fullscreen Mode**: Toggle fullscreen for a better tracing experience
5. **Switch Cameras**: If your device has multiple cameras, you can switch between them

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- React.js for the frontend framework
- TypeScript for type safety
- Media Streams API for camera access
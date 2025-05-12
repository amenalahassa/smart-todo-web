# PWA Icons Guide

This file serves as a guide for improving the PWA icons for the Smart Todo App.

## Current Icons

The application currently uses the following icons for PWA functionality:

1. **favicon.ico** - 32x32px icon for browser tabs and bookmarks
2. **masked-icon.svg** - SVG icon for PWA installation and splash screens

These icons provide basic PWA functionality, but for a production application, you may want to create additional optimized icons.

## Icon Design Guidelines

- Use the app's primary color (#4CAF50) as the background
- Include the app's logo or initials (ST for Smart Todo)
- Ensure icons are clear and recognizable at small sizes
- For the maskable icon, ensure important content is within the safe zone (centered 80% of the image)

## How to Create Icons

You can create these icons using any image editing software like Photoshop, GIMP, or online tools like:

- [Favicon Generator](https://realfavicongenerator.net/)
- [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator)

Alternatively, you can convert the provided masked-icon.svg to PNG files of the required sizes.

## Enhancing PWA Icons

To enhance the PWA experience, consider adding the following additional icons:

1. **apple-touch-icon.png** - 180x180px icon for iOS devices
2. **pwa-192x192.png** - 192x192px icon for Android devices
3. **pwa-512x512.png** - 512x512px icon for Android devices and maskable icon

When adding these icons, you'll need to update:
1. The `vite.config.js` file to include these icons in the manifest
2. The `index.html` file to add appropriate link tags for iOS support

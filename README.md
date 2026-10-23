# We Are Stardust

**We Are Stardust** is a cinematic, single-page scrollytelling experience about the universe’s journey from the Big Bang to life on Earth—and the elements that make us.

## What’s inside

- Five story chapters: **Origin**, **Journey**, **Awakening**, **Reach**, and **Return**.
- An animated star field, galaxy and cosmic visual effects rendered with Canvas and CSS.
- Scroll-triggered reveals, chapter navigation, and a reading progress bar.
- Responsive styling and support for the system’s reduced-motion preference.

## Run locally

There is no build step or package installation. Open `index.html` in a modern browser, or serve the project directory with any static file server. A local server is recommended for consistent browser behavior.

The page loads its Cormorant Garamond and Inter fonts from Google Fonts, so an internet connection is needed for those fonts. System fallback fonts are defined in the stylesheet.

## Project files

| File | Purpose |
| --- | --- |
| `index.html` | Page structure, story content, and navigation |
| `style.css` | Layout, responsive design, visual effects, and animations |
| `script.js` | Canvas effects, scroll interactions, and navigation behavior |

## Customize

- Edit chapter copy and section markup in `index.html`.
- Adjust colors, typography, layout, and animation styles in `style.css`.
- Change the interactive effects and scroll behavior in `script.js`.

## Browser support

Use a current browser with JavaScript, CSS animations, Canvas 2D, and `IntersectionObserver` support enabled. If JavaScript is disabled, the page’s story content remains in the document, but interactive effects and scroll reveals will not run.

# Magnetic Attraction & Repulsion Interactive

Self-contained Year 8 magnetic forces activity for Canvas/GitHub Pages.

## Folder structure
- index.html
- style.css
- script.js
- assets/
  - bar-magnet-ns.svg
  - bar-magnet-sn.svg
  - magnetic-field-lines.svg

All standalone graphical files are stored in the `assets` folder.

## Canvas size
Designed for an 800 × 600 iframe.

Example:

```html
<iframe
  src="https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/"
  width="800"
  height="600"
  style="border:0; max-width:100%;"
  loading="lazy"
  title="Magnetic Attraction and Repulsion Interactive">
</iframe>
```

No external libraries, fonts, APIs, images, or network resources are used.


## Elastic animation update
The first-page demonstration now uses a damped spring simulation. Magnets accelerate toward or away from their target positions, overshoot, rebound and settle. The effect scales with the selected distance so closer magnets respond more strongly. The challenge page also includes a short elastic preview animation when pole choices change.

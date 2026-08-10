const sharp = require('sharp');
const size = 256;

// SVG circle mask — white circle = keep, transparent = cut
const circleSvg = `<svg width="${size}" height="${size}"><circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="white"/></svg>`;
const circleBuffer = Buffer.from(circleSvg);

sharp('public/logo.png')
  // Resize to 310x310 to zoom in and make the logo larger/bigger (perusu) inside the circle
  .resize(310, 310, { fit: 'cover', background: { r: 255, g: 255, b: 255, alpha: 1 } })
  // Extract the center 256x256
  .extract({ left: 27, top: 27, width: size, height: size })
  // Boost brightness to make it extra bright and clear
  .modulate({ brightness: 1.25, saturation: 1.3 })
  // Mask it to be circular
  .composite([{ input: circleBuffer, blend: 'dest-in' }])
  .png()
  // Save to public/barlogo.png (referenced in layout.tsx) and copy to src/app/icon.png
  .toFile('public/barlogo.png')
  .then(() => {
    return sharp('public/barlogo.png')
      .toFile('src/app/icon.png');
  })
  .then(info => console.log('✅ Circular favicon created at public/barlogo.png and src/app/icon.png:', info))
  .catch(err => console.error('❌ Error:', err));

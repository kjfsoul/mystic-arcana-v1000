/**
 * Generate placeholder images for Sophia's progressive reveal states
 * These represent the visual progression from cloaked figure to fully revealed
 */

const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Create placeholder images using canvas
function generatePlaceholderImages() {
  const width = 400;
  const height = 600;
  const outputDir = path.join(__dirname, '../public/images/readers/sophia');

  // Ensure directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Level configurations
  const levels = [
    {
      level: 1,
      description: 'Dark cloaked silhouette with glowing hands',
      bgColor: '#0a0a0a',
      figureColor: '#1a1a2e',
      glowColor: '#9d4edd',
      opacity: 0.3,
      blur: 8
    },
    {
      level: 2,
      description: 'Clearer silhouette with mystical aura',
      bgColor: '#0f0f1e',
      figureColor: '#2a2a4e',
      glowColor: '#a855f7',
      opacity: 0.5,
      blur: 6
    },
    {
      level: 3,
      description: 'Some facial features visible',
      bgColor: '#141428',
      figureColor: '#3a3a6e',
      glowColor: '#c084fc',
      opacity: 0.7,
      blur: 4
    },
    {
      level: 4,
      description: 'Mostly revealed with cosmic energy',
      bgColor: '#1a1a3a',
      figureColor: '#4a4a8e',
      glowColor: '#e9d5ff',
      opacity: 0.85,
      blur: 2
    },
    {
      level: 5,
      description: 'Fully revealed cosmic oracle',
      bgColor: '#1e1e4e',
      figureColor: '#5a5aae',
      glowColor: '#f3e8ff',
      opacity: 1.0,
      blur: 0
    }
  ];

  levels.forEach(({ level, description, bgColor, figureColor, glowColor, opacity, blur }) => {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    // Add cosmic star field effect
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 2;
      const brightness = Math.random() * opacity;
      
      ctx.fillStyle = `rgba(255, 255, 255, ${brightness * 0.3})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Apply blur effect for lower levels
    if (blur > 0) {
      ctx.filter = `blur(${blur}px)`;
    }

    // Draw figure silhouette
    ctx.save();
    ctx.globalAlpha = opacity;
    
    // Head/hood
    ctx.fillStyle = figureColor;
    ctx.beginPath();
    ctx.ellipse(width/2, height * 0.25, 80, 100, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body/cloak
    ctx.beginPath();
    ctx.moveTo(width/2 - 100, height * 0.35);
    ctx.quadraticCurveTo(width/2, height * 0.3, width/2 + 100, height * 0.35);
    ctx.lineTo(width/2 + 120, height * 0.9);
    ctx.lineTo(width/2 - 120, height * 0.9);
    ctx.closePath();
    ctx.fill();

    // Add mystical glow around hands
    const handY = height * 0.6;
    const leftHandX = width/2 - 80;
    const rightHandX = width/2 + 80;

    // Create radial gradient for glowing hands
    const glowGradient = ctx.createRadialGradient(leftHandX, handY, 0, leftHandX, handY, 40);
    glowGradient.addColorStop(0, glowColor);
    glowGradient.addColorStop(0.5, `${glowColor}88`);
    glowGradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(leftHandX, handY, 40, 0, Math.PI * 2);
    ctx.fill();

    const glowGradient2 = ctx.createRadialGradient(rightHandX, handY, 0, rightHandX, handY, 40);
    glowGradient2.addColorStop(0, glowColor);
    glowGradient2.addColorStop(0.5, `${glowColor}88`);
    glowGradient2.addColorStop(1, 'transparent');
    
    ctx.fillStyle = glowGradient2;
    ctx.beginPath();
    ctx.arc(rightHandX, handY, 40, 0, Math.PI * 2);
    ctx.fill();

    // Add facial features for higher levels
    if (level >= 3) {
      ctx.globalAlpha = opacity * 0.7;
      
      // Eyes (glowing)
      ctx.fillStyle = glowColor;
      ctx.beginPath();
      ctx.arc(width/2 - 25, height * 0.22, 3 + level, 0, Math.PI * 2);
      ctx.arc(width/2 + 25, height * 0.22, 3 + level, 0, Math.PI * 2);
      ctx.fill();
    }

    // Add cosmic energy effects for higher levels
    if (level >= 4) {
      ctx.globalAlpha = 0.3;
      const energyGradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, 200);
      energyGradient.addColorStop(0, 'transparent');
      energyGradient.addColorStop(0.5, `${glowColor}44`);
      energyGradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = energyGradient;
      ctx.fillRect(0, 0, width, height);
    }

    ctx.restore();

    // Add level indicator text
    ctx.filter = 'none';
    ctx.fillStyle = glowColor;
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.globalAlpha = 0.8;
    ctx.fillText(`Level ${level}`, width/2, height - 20);

    // Save the image
    const buffer = canvas.toBuffer('image/png');
    const filename = path.join(outputDir, `level_${level}.png`);
    fs.writeFileSync(filename, buffer);
    console.log(`✨ Created ${filename} - ${description}`);
  });

  console.log('\n✅ All placeholder images generated successfully!');
}

// Run the generator
try {
  generatePlaceholderImages();
} catch (error) {
  console.error('Error generating images:', error);
  console.log('\nNote: This script requires the "canvas" package. Install it with:');
  console.log('npm install canvas');
}
import * as PIXI from 'pixi.js';

export function createBackgroundField() {
    // Create a canvas for the background
    const canvas = document.createElement('canvas');
    canvas.id = 'backgroundCanvas';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '-1';
    canvas.style.opacity = '0.3';

    // Create PIXI application for background
    const app = new PIXI.Application({
        view: canvas,
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: 0x2a5a2a, // Dark green field color
        antialias: true,
    });

    // Scale to fit field proportionally
    const fieldWidth = 2560;
    const fieldHeight = 1440;
    const scale = Math.max(canvas.width / fieldWidth, canvas.height / fieldHeight);
    
    const graphics = new PIXI.Graphics();
    
    // Draw grass pattern background
    graphics.beginFill(0x2a5a2a); // Dark green
    graphics.drawRect(0, 0, canvas.width, canvas.height);
    graphics.endFill();

    // Add grass texture with lines
    for (let i = 0; i < canvas.height; i += 40) {
        graphics.lineStyle(1, i % 80 === 0 ? 0x1a4a1a : 0x3a6a3a, 0.3);
        graphics.moveTo(0, i);
        graphics.lineTo(canvas.width, i);
    }

    // Center the field elements
    const offsetX = (canvas.width - fieldWidth * scale) / 2;
    const offsetY = (canvas.height - fieldHeight * scale) / 2;

    // Draw field boundaries
    graphics.lineStyle(6 * scale, 0xFFFFFF, 0.8);
    graphics.drawRect(offsetX, offsetY, fieldWidth * scale, fieldHeight * scale);

    // Halfway line
    graphics.lineStyle(4 * scale, 0xFFFFFF, 0.8);
    graphics.moveTo(offsetX + fieldWidth * scale / 2, offsetY);
    graphics.lineTo(offsetX + fieldWidth * scale / 2, offsetY + fieldHeight * scale);

    // Center circle
    graphics.drawCircle(
        offsetX + fieldWidth * scale / 2, 
        offsetY + fieldHeight * scale / 2, 
        fieldWidth * scale * 0.1
    );

    // Goal areas (simplified)
    const goalWidth = fieldWidth * scale * 0.15;
    const goalHeight = fieldHeight * scale * 0.3;
    const goalY = offsetY + (fieldHeight * scale - goalHeight) / 2;

    // Left goal area
    graphics.drawRect(offsetX, goalY, goalWidth, goalHeight);
    
    // Right goal area  
    graphics.drawRect(offsetX + fieldWidth * scale - goalWidth, goalY, goalWidth, goalHeight);

    app.stage.addChild(graphics);

    return canvas;
}
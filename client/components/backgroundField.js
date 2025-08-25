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
    canvas.style.opacity = '0.4';

    const ctx = canvas.getContext('2d');
    
    // Draw field background
    ctx.fillStyle = '#2a5a2a'; // Dark green
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add grass texture with horizontal lines
    ctx.strokeStyle = '#1a4a1a';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.height; i += 40) {
        ctx.globalAlpha = i % 80 === 0 ? 0.5 : 0.2;
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }
    
    // Scale to fit field proportionally
    const fieldWidth = 2560;
    const fieldHeight = 1440;
    const scale = Math.max(canvas.width / fieldWidth, canvas.height / fieldHeight);
    
    // Center the field elements
    const offsetX = (canvas.width - fieldWidth * scale) / 2;
    const offsetY = (canvas.height - fieldHeight * scale) / 2;

    // Draw field boundaries
    ctx.globalAlpha = 0.8;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 6 * scale;
    ctx.strokeRect(offsetX, offsetY, fieldWidth * scale, fieldHeight * scale);

    // Halfway line
    ctx.lineWidth = 4 * scale;
    ctx.beginPath();
    ctx.moveTo(offsetX + fieldWidth * scale / 2, offsetY);
    ctx.lineTo(offsetX + fieldWidth * scale / 2, offsetY + fieldHeight * scale);
    ctx.stroke();

    // Center circle
    ctx.beginPath();
    ctx.arc(
        offsetX + fieldWidth * scale / 2, 
        offsetY + fieldHeight * scale / 2, 
        fieldWidth * scale * 0.1,
        0, 2 * Math.PI
    );
    ctx.stroke();

    // Goal areas (simplified)
    const goalWidth = fieldWidth * scale * 0.15;
    const goalHeight = fieldHeight * scale * 0.3;
    const goalY = offsetY + (fieldHeight * scale - goalHeight) / 2;

    // Left goal area
    ctx.strokeRect(offsetX, goalY, goalWidth, goalHeight);
    
    // Right goal area  
    ctx.strokeRect(offsetX + fieldWidth * scale - goalWidth, goalY, goalWidth, goalHeight);

    return canvas;
}
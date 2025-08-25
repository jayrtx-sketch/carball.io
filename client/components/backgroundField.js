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
    
    // Draw field background with gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#3b8f3b');
    gradient.addColorStop(0.5, '#2d7d32');
    gradient.addColorStop(1, '#1b5e20');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add grass texture with horizontal lines
    ctx.globalAlpha = 0.3;
    for (let i = 0; i < canvas.height; i += 30) {
        ctx.strokeStyle = i % 60 === 0 ? '#4caf50' : '#66bb6a';
        ctx.lineWidth = 1;
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

    // Reset alpha and draw field lines in bright white
    ctx.globalAlpha = 1.0;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = Math.max(4 * scale, 2);
    
    // Draw field boundaries
    ctx.strokeRect(offsetX, offsetY, fieldWidth * scale, fieldHeight * scale);

    // Halfway line
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

    // Left goal area - blue tint
    ctx.strokeStyle = '#2196f3';
    ctx.strokeRect(offsetX, goalY, goalWidth, goalHeight);
    
    // Right goal area - red tint
    ctx.strokeStyle = '#f44336';
    ctx.strokeRect(offsetX + fieldWidth * scale - goalWidth, goalY, goalWidth, goalHeight);

    return canvas;
}
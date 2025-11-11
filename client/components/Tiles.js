import * as PIXI from 'pixi.js';
import { WORLD_WIDTH, WORLD_HEIGHT } from '../constants';

export default function createTiles(app) {
    // Create soccer field background
    const fieldGraphics = new PIXI.Graphics();
    
    // Draw grass field
    fieldGraphics.beginFill(0x1B5E20); // Dark green grass
    fieldGraphics.drawRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    fieldGraphics.endFill();
    
    // Add field lines
    fieldGraphics.lineStyle(4, 0xFFFFFF, 0.8);
    
    // Center line
    fieldGraphics.moveTo(WORLD_WIDTH / 2, 0);
    fieldGraphics.lineTo(WORLD_WIDTH / 2, WORLD_HEIGHT);
    
    // Center circle
    fieldGraphics.drawCircle(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, 200);
    
    // Field border
    fieldGraphics.drawRect(50, 50, WORLD_WIDTH - 100, WORLD_HEIGHT - 100);
    
    // Goal areas
    const goalWidth = 400;
    const goalDepth = 150;
    
    // Left goal area
    fieldGraphics.drawRect(50, WORLD_HEIGHT / 2 - goalWidth / 2, goalDepth, goalWidth);
    
    // Right goal area
    fieldGraphics.drawRect(WORLD_WIDTH - 50 - goalDepth, WORLD_HEIGHT / 2 - goalWidth / 2, goalDepth, goalWidth);
    
    // Penalty boxes
    const penaltyWidth = 600;
    const penaltyDepth = 250;
    
    // Left penalty box
    fieldGraphics.drawRect(50, WORLD_HEIGHT / 2 - penaltyWidth / 2, penaltyDepth, penaltyWidth);
    
    // Right penalty box
    fieldGraphics.drawRect(WORLD_WIDTH - 50 - penaltyDepth, WORLD_HEIGHT / 2 - penaltyWidth / 2, penaltyDepth, penaltyWidth);
    
    // Corner arcs
    const cornerRadius = 50;
    fieldGraphics.arc(50, 50, cornerRadius, 0, Math.PI / 2);
    fieldGraphics.arc(WORLD_WIDTH - 50, 50, cornerRadius, Math.PI / 2, Math.PI);
    fieldGraphics.arc(50, WORLD_HEIGHT - 50, cornerRadius, -Math.PI / 2, 0);
    fieldGraphics.arc(WORLD_WIDTH - 50, WORLD_HEIGHT - 50, cornerRadius, Math.PI, 3 * Math.PI / 2);
    
    // Add to stage at the bottom (rendered first)
    app.stage.addChildAt(fieldGraphics, 0);
    
    // Add subtle grid pattern for depth
    const gridGraphics = new PIXI.Graphics();
    gridGraphics.lineStyle(1, 0x2E7D32, 0.3);
    
    const gridSize = 100;
    for (let x = 0; x < WORLD_WIDTH; x += gridSize) {
        gridGraphics.moveTo(x, 0);
        gridGraphics.lineTo(x, WORLD_HEIGHT);
    }
    for (let y = 0; y < WORLD_HEIGHT; y += gridSize) {
        gridGraphics.moveTo(0, y);
        gridGraphics.lineTo(WORLD_WIDTH, y);
    }
    
    app.stage.addChildAt(gridGraphics, 1);
}
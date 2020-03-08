import { AbstractWeapon } from './AbstractWeapon.js';

export class Shotgun extends AbstractWeapon {
    constructor(ctx, drawingTools, playerPos, playerAngle) {
        super (ctx, drawingTools, playerPos, playerAngle)
        this.width = 20;
        this.height = 10;
    }
}
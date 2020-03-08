import { AbstractWeapon } from './AbstractWeapon.js';

export class RocketLauncher extends AbstractWeapon {
    constructor(ctx, drawingTools, playerPos, playerAngle) {
        super (ctx, drawingTools, playerPos, playerAngle)
        this.width = 16;
        this.height = 6;
    }
}
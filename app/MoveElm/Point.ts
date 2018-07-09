export class Point {
    public x: number;
    public y: number;
    constructor(x?: number, y?: number) {
        if ((x != undefined) && (y != undefined)) {
            this.x = x;
            this.y = y;
        }
    }
}
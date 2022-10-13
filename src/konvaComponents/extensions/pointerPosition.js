import {Stage} from "konva";

Stage.prototype.getOffsetPointerPosition = function () {
    const offsetX = this.offsetX() * this.scaleX();
    const offsetY = this.offsetY() * this.scaleX();

    const pos = this.getPointerPosition();
    return {
        x: pos.x + offsetX,
        y: pos.y + offsetY
    };
};
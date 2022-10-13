import {Group, Rect, Transformer} from 'konva';
import {comparePoints} from "../utils";
import EventBus from "../stores/eventBus";

export default class CropTool {
    constructor(options) {
        this.stage = options.stage;
        this.markUpLayer = options.markUpLayer;
        this.onSave = options.onSave;
        this.isActive = false;
        this.isDrawingRect = false;
        this.isTransforming = false;
        this.currentRectangle = null;
        this.currentRectangleGroup = null;
        this.deactivateAllTools = options.deactivateAllTools;
        this.activateLastUsedTool = options.activateLastUsedTool;
        this.currentTransformAttributes = null;
        this.isTouchDevice = options.isTouchDevice;
        this.originalStageDimensions = null;

        this.deleteCanvasObjectCallback = () => {
            this.resetStageToOriginal();
            this.removeCurrentRectGroup();
        };

        this.undoCallback = () => {
            this.resetStageToOriginal();
            this.removeCurrentRectGroup();
        };

        this.removeCropCallback = () => {
            this.resetStageToOriginal();
            this.removeCurrentRectGroup();
            this.activateLastUsedTool();
        };

        this.applyCropCallback = () => {
            this.applyCrop();
        };
    }

    setStage(stage, markUpLayer) {
        this.stage = stage;
        this.markUpLayer = markUpLayer;
    }

    init() {
        this.stage.on('click touchend', (e) => {
            this.setStageClickHandler(e);
        });
    }

    createCropBox() {
        if (this.currentRectangle) return;

        const rectGroup = new Group({
            name: `CropRectGroup`
        });

        const rect = new Rect({
            name: 'Rect',
            x: this.stage.offsetX(),
            y: this.stage.offsetY(),
            width: this.stage.width() / this.stage.scaleX(),
            height: this.stage.height() / this.stage.scaleX(),
            // scaleX: this.stage.scaleX(),
            // scaleY: this.stage.scaleX(),
            draggable: true,
            opacity: 0,
            pixelSize: 1000,
            fill: '#000'
        });
        rectGroup.add(rect);

        this.setRectGroupMetadata(rectGroup);
        rectGroup.moveToTop();
        this.markUpLayer.add(rectGroup);
        this.currentRectangleGroup = rectGroup;
        this.currentRectangle = rect;
        this.addTransformer(rectGroup);
        this.markUpLayer.draw();

        this.originalStageDimensions = {
            width: this.stage.width(),
            height: this.stage.height(),
            offsetX: this.stage.offsetX(),
            offsetY: this.stage.offsetY()
        };

        EventBus.$emit('showCropPrompt', true);
    }

    setRectGroupMetadata(rectGroup) {
        rectGroup.isCropGroup = true;

        const rect = rectGroup.findOne('.Rect');
        if (rect) rect.isCropGroup = true;
    }

    setStageClickHandler(e) {
        if (!e.target.isCropGroup) {
            if (this.currentRectangleGroup && !this.isDrawingRect && !this.isTransforming) {
                this.resetStageToOriginal();
                this.removeCurrentRectGroup();
                this.isDrawingRect = false;
                this.activateLastUsedTool();
            }
        }
    }

    activate() {
        EventBus.$on('deleteCanvasObject', this.deleteCanvasObjectCallback);
        EventBus.$on('undo', this.undoCallback);
        EventBus.$on('redo', this.undoCallback);
        EventBus.$on('removeCrop', this.removeCropCallback);
        EventBus.$on('applyCrop', this.applyCropCallback);

        this.isActive = true;
        this.createCropBox();
    }

    deactivate() {
        EventBus.$off('deleteCanvasObject', this.deleteCanvasObjectCallback);
        EventBus.$off('undo', this.undoCallback);
        EventBus.$off('redo', this.undoCallback);
        EventBus.$off('removeCrop', this.removeCropCallback);
        EventBus.$off('applyCrop', this.applyCropCallback);

        this.isActive = false;

        this.isDrawingRect = false;
        this.resetStageToOriginal();
        this.removeCurrentRectGroup();
    }

    setTransformHandler(rectGroup) {
        const rectangle = rectGroup.findOne('.Rect');
        rectangle.on('transform', () => {
            if (rectangle.scaleX() >= 0) {
                const currentWidth = rectangle.width();
                rectangle.width(currentWidth * rectangle.scaleX());
                rectangle.scaleX(1);
            } else {
                rectangle.setAttrs(this.currentTransformAttributes);
            }

            if (rectangle.scaleY() >= 0) {
                const currentHeight = rectangle.height();
                rectangle.height(currentHeight * rectangle.scaleY());
                rectangle.scaleY(1);
            } else {
                rectangle.setAttrs(this.currentTransformAttributes);
            }

            this.resizeStageToRect();

            this.currentTransformAttributes = Object.assign({}, rectangle.getAttrs());
            this.stage.draw();
        });

        rectangle.on('transformend', () => {
            setTimeout(() => {
                this.isTransforming = false;
            }, 10);
            this.currentTransformAttributes = null;
        });

        rectangle.on('transformstart', () => {
            this.isTransforming = true;
            this.currentTransformAttributes = Object.assign({}, rectangle.getAttrs());
        });

        rectangle.on('dragstart touchstart', () => {
            this.isTransforming = true;
        });

        rectangle.on('dragend touchend', () => {
            setTimeout(() => {
                this.isTransforming = false;
            }, 10);
        });

        rectangle.on('dragmove touchmove', () => {
            this.resizeStageToRect();
            this.stage.draw();
        });
    }

    resizeStageToRect() {
        if (!this.currentRectangle) return;

        const stagePoints = {
            topLeft: {
                x: this.stage.offsetX(),
                y: this.stage.offsetY()
            },
            bottomRight: {
                x: this.stage.offsetX() + this.stage.width() / this.stage.scaleX(),
                y: this.stage.offsetY() + this.stage.height() / this.stage.scaleX()
            }
        };

        const ogStagePoints = {
            topLeft: {
                x: this.originalStageDimensions.offsetX,
                y: this.originalStageDimensions.offsetY
            },
            bottomRight: {
                x: this.originalStageDimensions.offsetX + this.originalStageDimensions.width / this.stage.scaleX(),
                y: this.originalStageDimensions.offsetY + this.originalStageDimensions.height / this.stage.scaleX()
            }
        };

        let newStageX = stagePoints.topLeft.x;
        let newStageY = stagePoints.topLeft.y;
        let newStageWidth = this.stage.width();
        let newStageHeight = this.stage.height();

        const rectanglePoints = {
            topLeft: {
                x: this.currentRectangle.x(),
                y: this.currentRectangle.y()
            },
            bottomRight: {
                x: this.currentRectangle.x() + this.currentRectangle.width(),
                y: this.currentRectangle.y() + this.currentRectangle.height()
            }
        }

        let comp = comparePoints(rectanglePoints.topLeft, stagePoints.topLeft);
        if (comp.diffX < 0 || comp.diffY < 0) {
            if (comp.diffX < 0) {
                newStageX = newStageX + comp.diffX;
                newStageWidth = newStageWidth + ((-1) * comp.diffX) * this.stage.scaleX();
            }

            if (comp.diffY < 0) {
                newStageY = newStageY + comp.diffY;
                newStageHeight = newStageHeight + ((-1) * comp.diffY) * this.stage.scaleX();
            }
        }

        let ogComp = comparePoints(rectanglePoints.topLeft, ogStagePoints.topLeft);
        if (ogComp.diffX <= 0 && comp.diffX > 0) {
            newStageX = newStageX + (comp.diffX);
            newStageWidth = newStageWidth + ((-1) * comp.diffX * this.stage.scaleX());
        }
        if (ogComp.diffY <= 0 && comp.diffY > 0) {
            newStageY = newStageY + (comp.diffY);
            newStageHeight = newStageHeight + ((-1) * comp.diffY * this.stage.scaleX());
        }

        let stageComp = comparePoints(stagePoints.topLeft, ogStagePoints.topLeft);
        if (stageComp.diffX < 0 && ogComp.diffX > 0) {
            newStageX = ogStagePoints.topLeft.x;
            newStageWidth = newStageWidth + (stageComp.diffX * this.stage.scaleX());
        }
        if (stageComp.diffY < 0 && ogComp.diffY > 0) {
            newStageY = ogStagePoints.topLeft.y;
            newStageHeight = newStageHeight + (stageComp.diffY * this.stage.scaleX());
        }

        comp = comparePoints(rectanglePoints.bottomRight, stagePoints.bottomRight);
        if (comp.diffX > 0 || comp.diffY > 0) {
            if (comp.diffX > 0) {
                newStageWidth = newStageWidth + comp.diffX;
            }

            if (comp.diffY > 0) {
                newStageHeight = newStageHeight + comp.diffY;
            }
        }

        ogComp = comparePoints(rectanglePoints.bottomRight, ogStagePoints.bottomRight);
        if (ogComp.diffX >= 0 && comp.diffX < 0) {
            newStageWidth = newStageWidth + (comp.diffX * this.stage.scaleX());
        }
        if (ogComp.diffY >= 0 && comp.diffY < 0) {
            newStageHeight = newStageHeight + (comp.diffY * this.stage.scaleX());
        }

        stageComp = comparePoints(stagePoints.bottomRight, ogStagePoints.bottomRight);
        if (stageComp.diffX > 0 && ogComp.diffX < 0) {
            newStageX = newStageX - stageComp.diffX;
            newStageWidth = newStageWidth - (stageComp.diffX * this.stage.scaleX());
        }
        if (stageComp.diffY > 0 && ogComp.diffY < 0) {
            newStageY = newStageY - stageComp.diffY;
            newStageHeight = newStageHeight - (stageComp.diffY * this.stage.scaleX());
        }

        this.stage.setAttrs({
            offsetX: newStageX,
            offsetY: newStageY,
            width: newStageWidth,
            height: newStageHeight
        });
        //EventBus.$emit('resizeCanvas');
    }

    addTransformer(rectGroup) {
        const rect = rectGroup.findOne('.Rect');

        let transformer = new Transformer({
            node: rect,
            anchorCornerRadius: 2,
            anchorSize: 24,
            anchorStroke: '#0071df',
            borderStroke: '#0071df',
            enabledAnchors: ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right', 'middle-left', 'middle-right'],
            padding: 0,
            borderStrokeWidth: 2,
            keepRatio: false,
            rotateEnabled: false
        });
        rectGroup.transformer = transformer;
        rect.transformer = transformer;
        this.setTransformHandler(rectGroup);
        this.markUpLayer.add(transformer);
        transformer.show();

        this.markUpLayer.draw();
    }

    removeTransformer(rectGroup) {
        if (rectGroup) {
            const rectToggle = rectGroup.findOne('.RectToggle');
            if (rectToggle) {
                rectToggle.destroy();
            }

            if (rectGroup.transformer) {
                rectGroup.transformer.destroy();
                rectGroup.transformer = undefined;
            }
            this.markUpLayer.draw();
        }
    }

    removeCrop() {
        this.removeCurrentRectGroup();
    }

    removeCurrentRectGroup() {
        if (this.currentRectangleGroup && !this.isDrawingRect) {
            this.removeTransformer(this.currentRectangleGroup);
            this.currentRectangleGroup.destroy();
            this.currentRectangleGroup = null;
            this.currentRectangle = null;
            this.originalStageDimensions = null;
            this.stage.batchDraw();
        }

        EventBus.$emit('showCropPrompt', false);
    }

    resetStageToOriginal() {
        this.stage.setAttrs({
            ...this.originalStageDimensions
        });
    }

    copyCurrentObject() {
        return null;
    }

    pasteObject() {
    }

    isObjectSelected() {
        return false;
    }

    applyCrop() {
        if (this.currentRectangle) {
            const cropWidth = this.currentRectangle.width() * this.stage.scaleX();
            const cropHeight = this.currentRectangle.height() * this.stage.scaleX();
            const cropOffsetX = this.currentRectangle.x();
            const cropOffsetY = this.currentRectangle.y();

            this.stage.setAttrs({
                width: cropWidth,
                height: cropHeight,
                offsetX: cropOffsetX,
                offsetY: cropOffsetY
            });

            this.stage.draw();
        }

        this.removeCurrentRectGroup();
        EventBus.$emit('resizeCanvas');

        this.onSave();

        EventBus.$emit('showCropPrompt', false);
        this.activateLastUsedTool();
    }
}
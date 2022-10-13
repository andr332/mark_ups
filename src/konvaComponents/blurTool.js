import {Group, Rect, Transformer} from 'konva';
import {getScaledCoordinate} from "../utils";
import anchorStyle from "./styles/anchorStyle";
import EventBus from "../stores/eventBus";

export default class BlurTool {
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
        this.currentTransformAttributes = null;
        this.isTouchDevice = options.isTouchDevice;
        this.currentBlurArea = null;

        this.blurData = null;

        EventBus.$on('deleteCanvasObject', () => {
            this.removeCurrentRectGroup();
        });

        EventBus.$on('undo', () => {
            this.removeCurrentRectGroup();
        });

        EventBus.$on('redo', () => {
            this.removeCurrentRectGroup();
        });

        EventBus.$on('removeBlur', () => {
            this.removeCurrentRectGroup();
        });
    }

    setStage(stage, markUpLayer) {
        this.stage = stage;
        this.markUpLayer = markUpLayer;
    }

    init() {
        this.stage.on('contentMousedown touchstart', (e) => {
            if (!this.isActive || this.currentRectangle || e.evt.button === 2) {
                return;
            }

            this.isDrawingRect = true;
            const pos = this.stage.getOffsetPointerPosition();
            const scaledPos = getScaledCoordinate({
                x: pos.x,
                y: pos.y,
                scale: this.stage.scaleX()
            });
            this.addRectGroup(scaledPos, 'Empty');
        });

        this.stage.on('contentMouseup touchend', () => {
            if (!this.isActive || !this.currentRectangle) {
                return;
            }

            if (this.currentRectangle.width() === 0 || this.currentRectangle.height() === 0) {
                this.removeCurrentRectGroup();
                this.markUpLayer.draw();
            }

            setTimeout(() => this.isDrawingRect = false, 1);
        });

        this.stage.on('contentMousemove touchmove', () => {
            if (!this.isActive || !this.isDrawingRect) {
                return;
            }

            const pos = this.stage.getOffsetPointerPosition();
            const scaledPos = getScaledCoordinate({
                x: pos.x,
                y: pos.y,
                scale: this.stage.scaleX()
            });
            const width = scaledPos.x - this.currentRectangle.getAttr('x');
            const height = scaledPos.y - this.currentRectangle.getAttr('y');
            this.currentRectangle.width(width);
            this.currentRectangle.height(height);
            this.markUpLayer.draw();

            this.updateBlurArea();
        });

        this.stage.on('click touchend', (e) => {
            this.setStageClickHandler(e);
        });
    }

    createBlurArea() {
        const blurArea = document.createElement('div');
        const konvaJsContent = document.getElementsByClassName('konvajs-content')[0];
        konvaJsContent.insertBefore(blurArea, konvaJsContent.children[1]);

        blurArea.style.position = 'absolute';

        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        if (isSafari) blurArea['-webkit-backdrop-filter'] = 'blur(10px)';

        blurArea.style['backdrop-filter'] = 'blur(10px)';

        const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
        if (isFirefox) blurArea.style.backgroundColor = 'rgba(0,113,223,0.2)';

        this.currentBlurArea = blurArea;
        this.updateBlurArea();

        EventBus.$emit('showBlurPrompt', true);
    }

    updateBlurArea() {
        if (!this.currentBlurArea) return;

        const rectPosition = this.currentRectangle.absolutePosition();
        const areaPosition = {
            x: rectPosition.x,
            y: rectPosition.y
        };

        let scaledHeight = this.currentRectangle.height() * this.stage.scaleY();
        let scaledWidth = this.currentRectangle.width() * this.stage.scaleX();

        const stageWidth = this.stage.width();
        const stageHeight = this.stage.height();

        if (scaledWidth > 0) {
            if (areaPosition.x < 0) {
                scaledWidth = scaledWidth + areaPosition.x;
                areaPosition.x = 0;
            } else if (areaPosition.x + scaledWidth > stageWidth) {
                scaledWidth = stageWidth - areaPosition.x;
            }
        } else {
            areaPosition.x = areaPosition.x + scaledWidth;
            scaledWidth = (-1) * scaledWidth;
        }

        if (scaledHeight > 0) {
            if (areaPosition.y < 0) {
                scaledHeight = scaledHeight + areaPosition.y;
                areaPosition.y = 0;
            } else if (areaPosition.y + scaledHeight > stageHeight) {
                scaledHeight = stageHeight - areaPosition.y;
            }
        } else {
            areaPosition.y = areaPosition.y + scaledHeight;
            scaledHeight = (-1) * scaledHeight;
        }

        this.blurData = {
            x: areaPosition.x / this.stage.scaleX() + this.stage.offsetX(),
            y: areaPosition.y / this.stage.scaleY() + this.stage.offsetY(),
            width: scaledWidth / this.stage.scaleX(),
            height: scaledHeight  / this.stage.scaleY()
        };

        this.currentBlurArea.style.top = areaPosition.y + 'px';
        this.currentBlurArea.style.left = areaPosition.x + 'px';
        this.currentBlurArea.style.height = scaledHeight + 'px';
        this.currentBlurArea.style.width = scaledWidth + 'px';
    }

    removeBlurArea() {
        if (this.currentBlurArea) {
            this.currentBlurArea.remove();
            this.currentBlurArea = null;
        }
    }

    addRectGroup(pos) {
        const rectGroup = new Group({
            name: `BlurRectGroup`
        });

        const rect = new Rect({
            name: 'Rect',
            x: pos.x,
            y: pos.y,
            width: 0,
            height: 0,
            draggable: true,
            opacity: 0,
            blurRadius: 40,
            pixelSize: 1000,
            fill: '#000',
            zIndex: 0
        });
        rectGroup.add(rect);

        this.setRectGroupMetadata(rectGroup);
        this.markUpLayer.add(rectGroup);
        this.currentRectangleGroup = rectGroup;
        this.currentRectangle = rect;
        this.addTransformer(rectGroup);
        this.currentRectangleGroup.moveToBottom();
        this.markUpLayer.draw();

        this.createBlurArea();
    }

    setRectGroupMetadata(rectGroup) {
        rectGroup.isBlurGroup = true;

        const rect = rectGroup.findOne('.Rect');
        if (rect) rect.isBlurGroup = true;
    }

    setStageClickHandler(e) {
        if (!e.target.isBlurGroup) {
            if (this.currentRectangleGroup && !this.isDrawingRect && !this.isTransforming) {
                this.removeCurrentRectGroup();
                this.isDrawingRect = false;
            }
        }
    }

    activate() {
        this.isActive = true;
    }

    deactivate() {
        this.isActive = false;

        this.isDrawingRect = false;
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

            this.currentTransformAttributes = Object.assign({}, rectangle.getAttrs());
            this.stage.batchDraw();

            this.updateBlurArea();
        });

        rectangle.on('transformend', () => {
            this.isTransforming = false;
            this.currentTransformAttributes = null;
        });

        rectangle.on('transformstart', () => {
            this.isTransforming = true;
            this.currentTransformAttributes = Object.assign({}, rectangle.getAttrs());
        });

        rectangle.on('dragmove touchmove', () => {
            this.updateBlurArea();
        });
    }

    addTransformer(rectGroup) {
        const rect = rectGroup.findOne('.Rect');

        let transformer = new Transformer({
            node: rect,
            enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
            keepRatio: false,
            rotateEnabled: false,
            ...anchorStyle(this.isTouchDevice)
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

    removeBlur() {
        this.removeCurrentRectGroup();
    }

    removeCurrentRectGroup() {
        if (this.currentRectangleGroup && !this.isDrawingRect) {
            this.removeTransformer(this.currentRectangleGroup);
            this.removeBlurArea();
            this.currentRectangleGroup.destroy();
            this.currentRectangleGroup = null;
            this.currentRectangle = null;
            this.blurData = null;
            this.markUpLayer.batchDraw();
        }

        EventBus.$emit('showBlurPrompt', false);
    }

    copyCurrentObject() {
        return null;
    }

    pasteObject() {
    }

    isObjectSelected() {
        return !!this.currentRectangle;
    }
}
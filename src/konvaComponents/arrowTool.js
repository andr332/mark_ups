import {Arrow, Transformer, Circle, Node} from 'konva';
import {getScaledCoordinate} from "../utils";
import anchorStyle from "./styles/anchorStyle";
import {arrowThickness, getArrowLineThickness} from "./styles/lineThicknes";
import {arrowColor} from "./styles/color";
import {DESKTOP_ANCHOR_SIZE, ToolNames, TOUCH_ANCHOR_SIZE} from "../constants";
import EventBus from "../stores/eventBus";
import store from "../stores/appStore";

export default class ArrowTool {
    constructor(options) {
        this.stage = options.stage;
        this.markUpLayer = options.markUpLayer;
        this.onSave = options.onSave;
        this.lineThickness = options.lineThickness;
        this.changeGlobalLineThickness = options.setLineThickness;
        this.color = options.color;
        this.changeGlobalColor = options.setColor;
        this.isActive = false;
        this.isPaintingArrow = false;
        this.isTransforming = false;
        this.currentArrow = null;
        this.arrows = [];
        this.deactivateAllTools = options.deactivateAllTools;
        this.currentStartAnchor = null;
        this.currentEndAnchor = null;
        this.isTouchDevice = options.isTouchDevice;
 
        this.timeout = null; // timer to detect if touch event is long

        EventBus.$on('deleteCanvasObject', () => {
            this.removeCurrentArrow();
        });
        EventBus.$on('moveCanvasObjecttoLeft', (x) => {
          this.movetoLeft(x);
        });
        EventBus.$on('moveCanvasObjecttoDown', (y) => {
          this.movetoTop(y);
        });
        EventBus.$on('moveDownCurrentObject', ()=> {
          if(this.currentArrow){
            this.moveDown();
          }
        });
        EventBus.$on('moveUpCurrentObject', () => {
          if(this.currentArrow){
            this.moveUp();
          }
        });
        EventBus.$on('moveToTopObject', () => {
          if(this.currentArrow){
            this.moveToTop();
          }
        });
        EventBus.$on('moveToBottomObject', () => {
          if(this.currentArrow){
            this.moveToBottom();
          }
        });
    }

    setStage(stage, markUpLayer) {
        this.stage = stage;
        this.markUpLayer = markUpLayer;

        this.findExistingArrows();
    }

    init() {
        this.findExistingArrows();

        this.stage.on('contentMousedown touchstart', (e) => {
            this.longTouchStart(e); // start checking if touch event is long

            if (!this.isActive || this.currentArrow || e.evt.button === 2) {
                return;
            }

            this.isPaintingArrow = true;
            const pos = this.stage.getOffsetPointerPosition();
            const scaledPos = getScaledCoordinate({
                x: pos.x,
                y: pos.y,
                scale: this.stage.scaleX()
            });
            this.currentArrow = new Arrow({
                points: [scaledPos.x, scaledPos.y, scaledPos.x, scaledPos.y],
                pointerLength: 16,
                pointerWidth : 20,
                lineCap: 'round',
                draggable: true,
                ...arrowThickness[this.lineThickness],
                ...arrowColor[this.color]
            });
            this.setArrowMetadata(this.currentArrow);
            this.setClickHandler(this.currentArrow);
            this.markUpLayer.add(this.currentArrow);
            this.arrows.push(this.currentArrow);
            this.addTransformer(this.currentArrow);
            this.addAnchors(true);
            this.markUpLayer.draw();
        });

        this.stage.on('contentMouseup touchend', () => {
            this.longTouchEnd(); // end checking if touch event is long

            if (!this.isActive || !this.currentArrow || !this.isPaintingArrow) {
                return;
            }

            if (this.currentArrow.width() <= 20) {
                this.removeCurrentArrow();
            } else {
                this.removeAnchors();
                this.removeTransformer(this.currentArrow);
                this.currentArrow = null;
            }

            this.isPaintingArrow = false;

            this.onSave();
        });

        this.stage.on('contentMousemove touchmove', () => {
            this.longTouchEnd(); // disable checking if touch event is long

            if (!this.isActive || !this.isPaintingArrow || !this.currentArrow) {
                return;
            }

            const pos = this.stage.getOffsetPointerPosition();
            const scaledPos = getScaledCoordinate({
                x: pos.x,
                y: pos.y,
                scale: this.stage.scaleX()
            });
            const oldPoints = this.currentArrow.points();
            this.currentArrow.points([oldPoints[0], oldPoints[1], scaledPos.x, scaledPos.y]);
            this.updateAnchorPositions();
            this.markUpLayer.batchDraw();
        });

        this.stage.on('click touchstart', (e) => {
            this.setStageClickHandler(e);
        });

        this.stage.on('contextmenu', (e) => {
            this.setContextmenu(e);
        });

        this.stage.container().addEventListener('keyup', (e) => {
          if(e.keyCode == 37 || e.keyCode == 38 || e.keyCode == 39 || e.keyCode == 40 || e.keyCode == 221 || e.keyCode == 219)
            this.onSave();
        });
    }

    findExistingArrows() {
        this.arrows = this.markUpLayer.find('Arrow');

        for (let arrow of this.arrows) {
            this.setArrowMetadata(arrow);
            this.setClickHandler(arrow);
        }
    }

    setContextmenu(){
        if(this.currentArrow) {
            let containerRect = this.stage.container().getBoundingClientRect();
            let top = containerRect.top + this.stage.getPointerPosition().y;
            let left = containerRect.left + this.stage.getPointerPosition().x+ 4;

            let leftCorrdCorrection = containerRect.right - left;
            let topCoordCorrection = containerRect.bottom - top;

            const contextMenuHeigth = store().state.contextMenuHeigth;
            const contextMenuNodeWidth = store().state.contextMenuWidth;

            if(leftCorrdCorrection < contextMenuNodeWidth) leftCorrdCorrection = contextMenuNodeWidth - leftCorrdCorrection
            else leftCorrdCorrection = 0

            if(topCoordCorrection < contextMenuHeigth) topCoordCorrection = contextMenuHeigth - topCoordCorrection
            else topCoordCorrection = 0

            top -= topCoordCorrection
            left -= leftCorrdCorrection

            store().commit('setContextItemActive', {
                style: {
                    top: `${top}px`,
                    left: `${left}px`,
                }
            })
            
            EventBus.$emit('setContextmenu');
        }
    }

    longTouchStart(e){
        if(this.currentArrow && this.timeout == null){
            this.timeout = setTimeout(() => {
                this.setContextmenu(e);
            }, 400);        
        }
    }

    longTouchEnd(){
        clearTimeout(this.timeout);
        this.timeout = null;
    }

    // Show layer one step top
    moveUp() {
        this.currentArrow.moveUp();
        this.currentArrow.transformer.moveToTop();
        this.currentStartAnchor.moveToTop();
        this.currentEndAnchor.moveToTop();
        this.markUpLayer.draw();
        this.focus();
    }

    // Show layer at the top all layers
    moveToTop() {
        this.currentArrow.moveToTop();
        this.currentArrow.transformer.moveToTop();
        this.currentStartAnchor.moveToTop();
        this.currentEndAnchor.moveToTop();
        this.markUpLayer.draw();
        this.focus();
    }

    // Show layer one step down
    moveDown() {
        this.currentArrow.moveDown();
        this.currentArrow.transformer.moveToTop();
        this.currentStartAnchor.moveToTop();
        this.currentEndAnchor.moveToTop();
        this.markUpLayer.draw();
        this.focus();
    }

    // Show layer at the bottom all layers
    moveToBottom() {
        this.currentArrow.moveToBottom();
        this.currentArrow.transformer.moveToTop();
        this.currentStartAnchor.moveToTop();
        this.currentEndAnchor.moveToTop();
        this.markUpLayer.draw();
        this.focus();
    }

    // Move Object to Left/Right 1/5 px
    movetoLeft(xx) {
      if(this.currentArrow) {
        var x = this.currentArrow.x();
        this.currentArrow.x(x + xx);
      }
      if(this.currentStartAnchor) {
        x = this.currentStartAnchor.x();
        this.currentStartAnchor.x(x + xx);
      }
      if(this.currentEndAnchor) {
        x = this.currentEndAnchor.x();
        this.currentEndAnchor.x(x + xx);
      }
      this.markUpLayer.draw();
    }
  
    // Move Object to Top/down 1/5 px
    movetoTop(yy) {
        if(this.currentArrow) {
            var y = this.currentArrow.y();
            this.currentArrow.y(y + yy);
        }
        if(this.currentStartAnchor) {
            y = this.currentStartAnchor.y();
            this.currentStartAnchor.y(y + yy);
        }
        if(this.currentEndAnchor) {
            y = this.currentEndAnchor.y();
            this.currentEndAnchor.y(y + yy);
        }
        this.markUpLayer.draw();
    }

    focus(){
        this.stage.container().tabIndex = 1;
        this.stage.container().focus();
    }

    activate() {
        this.isActive = true;
        this.focus();
    }

    deactivate() {
        this.isActive = false;

        this.isPaintingArrow = false;
        this.removeAnchors();
        this.removeTransformer(this.currentArrow);
        this.currentArrow = null;
    }

    setArrowDragHandler(arrow) {
        arrow.on('dragmove', () => {
            this.updateAnchorPositions();
        });

        arrow.on('dragend', () => {
            this.onSave();
        });
    }

    addTransformer(arrow) {
        this.changeGlobalLineThickness(getArrowLineThickness(arrow.getAttrs()));
        this.changeGlobalColor(arrow.getAttrs().fill);

        let transformer = new Transformer({
            node: arrow,
            resizeEnabled: false,
            rotateEnabled: false,
            ...anchorStyle
        });
        arrow.transformer = transformer;
        this.markUpLayer.add(transformer);
        this.setArrowDragHandler(arrow);
        transformer.show();
        this.markUpLayer.draw();
    }

    removeTransformer(arrow) {
        if (arrow && arrow.transformer) {
            arrow.transformer.destroy();
            arrow.transformer = undefined;
            this.markUpLayer.draw();
        }
    }

    addAnchors(disableEvents=false) {
        this.removeAnchors();
        const updateArrowCoordinates = () => {
            const points = [
              this.currentStartAnchor.x(),
              this.currentStartAnchor.y(),
              this.currentEndAnchor.x(),
              this.currentEndAnchor.y()
            ];

            // Have to reset the arrow offset to 0 on each update
            this.currentArrow.position({
                x: 0,
                y: 0
            });
            this.currentArrow.points(points);
            this.markUpLayer.batchDraw();
        };

        const arrowOffset = this.currentArrow.position();
        const arrowPoints = this.currentArrow.points();

        const inverseScale = 1 / this.stage.scaleX();

        const anchorProperties = {
            radius: this.isTouchDevice ? TOUCH_ANCHOR_SIZE : DESKTOP_ANCHOR_SIZE,
            fill: '#FFFFFF',
            stroke: '#0071df',
            strokeWidth: 1,
            draggable: true,
            name: 'manipulation',
            scaleX: inverseScale,
            scaleY: inverseScale
        };

        this.currentStartAnchor = new Circle({
            x: arrowPoints[0] + arrowOffset.x,
            y: arrowPoints[1] + arrowOffset.y,
            ...anchorProperties
        });

        if (!disableEvents) {
            this.currentStartAnchor.on('dragstart touchstart', () => {
                this.isTransforming = true;
            });
            this.currentStartAnchor.on('dragmove touchmove', updateArrowCoordinates);
            this.currentStartAnchor.on('dragend touchend', () => {
                this.isTransforming = false;
                this.onSave();
            });
        }

        this.markUpLayer.add(this.currentStartAnchor);

        this.currentEndAnchor = new Circle({
            x: arrowPoints[2] + arrowOffset.x,
            y: arrowPoints[3] + arrowOffset.y,
            ...anchorProperties
        });

        if (!disableEvents) {
            this.currentEndAnchor.on('dragstart touchstart', () => {
                this.isTransforming = true;
            });
            this.currentEndAnchor.on('dragmove touchmove', updateArrowCoordinates);
            this.currentEndAnchor.on('dragend touchend', () => {
                this.isTransforming = false;
                this.onSave();
            });
        }

        this.markUpLayer.add(this.currentEndAnchor);

        this.markUpLayer.batchDraw();
    }

    updateAnchorPositions() {
        if (!this.currentArrow || !this.currentStartAnchor || !this.currentEndAnchor) {
            return;
        }

        const arrowPoints = this.currentArrow.points();
        const arrowOffset = this.currentArrow.position();

        this.currentStartAnchor.position({
            x: arrowPoints[0] + arrowOffset.x,
            y: arrowPoints[1] + arrowOffset.y
        });

        this.currentEndAnchor.position({
            x: arrowPoints[2] + arrowOffset.x,
            y: arrowPoints[3] + arrowOffset.y
        });

        this.markUpLayer.batchDraw();
    }

    removeAnchors() {
        if (this.currentStartAnchor) {
            this.currentStartAnchor.destroy();
            this.currentStartAnchor = null;
        }

        if (this.currentEndAnchor) {
            this.currentEndAnchor.destroy();
            this.currentEndAnchor = null;
        }

        this.markUpLayer.batchDraw();
    }

    setArrowMetadata(arrow) {
        arrow.isArrow = true;
    }

    setClickHandler(arrow) {
        arrow.on('click mousedown touchstart', (e) => {
            this.deactivateAllTools('ArrowTool');

            if (this.currentArrow && this.currentArrow !== e.target) {
                this.removeTransformer(this.currentArrow);
                this.currentArrow = null;
            }

            if (!arrow.transformer) {
                this.addTransformer(arrow);
            }

            this.currentArrow = arrow;
            this.addAnchors();
        });
    }

    removeCurrentArrow() {
        if (this.currentArrow) {
            this.removeAnchors();
            this.removeArrowFromArray(this.currentArrow);

            this.removeTransformer(this.currentArrow);
            this.currentArrow.destroy();
            this.currentArrow = null;
            this.isPaintingArrow = false;
            this.markUpLayer.draw();

            this.onSave();
        }
    }

    removeArrowFromArray(arrow) {
        let arrowIndex = -1;
        for (let i = 0; i < this.arrows.length; i++) {
            if (this.arrows[i] === arrow) {
                arrowIndex = i;
            }
        }

        if (arrowIndex >= 0) {
            this.arrows.splice(arrowIndex, 1);
        }
    }

    setStageClickHandler(e) {
        EventBus.$emit('objectSeleted', e);
        if (this.arrows) {
            if (!e.target.isArrow) {
                if (this.currentArrow && !this.isPaintingArrow && !this.isTransforming) {
                    this.removeTransformer(this.currentArrow);
                    this.removeAnchors();
                    this.currentArrow = null;
                    this.isPaintingArrow = false;
                }
            }
        }
    }

    setLineThickness(lineThickness) {
        this.lineThickness = lineThickness;
        const newArrowThickness = arrowThickness[this.lineThickness];

        if (this.currentArrow && this.currentArrow.getAttrs().strokeWidth !== newArrowThickness.strokeWidth) {
            this.currentArrow.setAttrs(newArrowThickness);
            this.markUpLayer.draw();
            this.onSave();
        }
    }

    setColor(color) {
      this.color = color;

      if (this.currentArrow && this.currentArrow.getAttrs().fill !== this.color) {
        this.currentArrow.setAttrs(arrowColor[this.color]);
        this.markUpLayer.draw();
        this.onSave();
      }
    }

    copyCurrentObject() {
        if (this.currentArrow) {
            const newArrow = this.currentArrow.clone();

            return newArrow.toObject();
        }

        return null;
    }

    pasteObject(json) {
        if (this.currentArrow) {
            this.deactivate();
        }

        this.deactivateAllTools(ToolNames.ArrowTool);

        const newArrow = Node.create(json);
        this.markUpLayer.add(newArrow);
        this.setArrowMetadata(newArrow);
        this.setClickHandler(newArrow);

        this.currentArrow = newArrow;
        this.arrows.push(newArrow);
        this.addTransformer(newArrow);
        this.addAnchors();
        this.markUpLayer.draw();

        this.onSave();
    }

    isObjectSelected() {
        return !!this.currentArrow;
    }
}
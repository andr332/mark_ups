import {Line, Transformer, Circle, Node} from 'konva';
import {getScaledCoordinate} from "../utils";
import anchorStyle from "./styles/anchorStyle";
import {getPenLineThickness, penThickness} from "./styles/lineThicknes";
import {penColor} from "./styles/color";
import {DESKTOP_ANCHOR_SIZE, ToolNames, TOUCH_ANCHOR_SIZE} from "../constants";
import EventBus from "../stores/eventBus";
import store from "../stores/appStore";

export default class LineTool {
  constructor(options) {
    this.stage = options.stage;
    this.markUpLayer = options.markUpLayer;
    this.onSave = options.onSave;
    this.lineThickness = options.lineThickness;
    this.changeGlobalLineThickness = options.setLineThickness;
    this.color = options.color;
    this.changeGlobalColor = options.setColor;
    this.isActive = false;
    this.isPaintingLine = false;
    this.currentLine = null;
    this.lines = [];
    this.deactivateAllTools = options.deactivateAllTools;
    this.currentStartAnchor = null;
    this.currentEndAnchor = null;
    this.isTouchDevice = options.isTouchDevice;

    this.timeout = null; // timer to detect if touch event is long

    EventBus.$on('deleteCanvasObject', () => {
      this.removeCurrentLine();
    });
    EventBus.$on('moveCanvasObjecttoLeft', (x) => {
      this.movetoLeft(x);
    });
    EventBus.$on('moveCanvasObjecttoDown', (y) => {
      this.movetoTop(y);
    });
    EventBus.$on('moveDownCurrentObject', ()=> {
      if(this.currentLine){
        this.moveDown();
      }
    });
    EventBus.$on('moveUpCurrentObject', () => {
      if(this.currentLine){
        this.moveUp();
      }
    });
    EventBus.$on('moveToTopObject', () => {
      if(this.currentLine){
        this.moveToTop();
      }
    });
    EventBus.$on('moveToBottomObject', () => {
      if(this.currentLine){
        this.moveToBottom();
      }
    });
  }

  setStage(stage, markUpLayer) {
    this.stage = stage;
    this.markUpLayer = markUpLayer;

    this.findExistingLines();
  }

  init() {
    this.findExistingLines();

    this.stage.on('contentMousedown touchstart', (e) => {
      this.longTouchStart(); // start checking if touch event is long

      if (!this.isActive || this.currentLine || e.evt.button === 2) {
        return;
      }

      this.isPaintingLine = true;
      const pos = this.stage.getOffsetPointerPosition();
      const scaledPos = getScaledCoordinate({
        x: pos.x,
        y: pos.y,
        scale: this.stage.scaleX()
      });
      this.currentLine = new Line({
        name: 'Line',
        points: [scaledPos.x, scaledPos.y, scaledPos.x, scaledPos.y],
        lineCap: 'round',
        draggable: true,
        ...penThickness[this.lineThickness],
        ...penColor[this.color]
      });
      this.setLineMetadata(this.currentLine);
      this.setClickHandler(this.currentLine);
      this.markUpLayer.add(this.currentLine);
      this.lines.push(this.currentLine);
      this.addTransformer(this.currentLine);
      this.addAnchors(true);
      this.markUpLayer.draw();
    });

    this.stage.on('contentMouseup touchend', () => {
      this.longTouchEnd(); // end checking if touch event is long

      if (!this.isActive || !this.currentLine || !this.isPaintingLine) {
        return;
      }

      if (this.currentLine.width() <= 20 && this.currentLine.height() <= 20) {
        this.removeCurrentLine();
      } else {
        this.removeAnchors();
        this.removeTransformer(this.currentLine);
        this.currentLine = null;
      }

      this.isPaintingLine = false;

      this.onSave();
    });

    this.stage.on('contentMousemove touchmove', () => {
      this.longTouchEnd(); // disable checking if touch event is long

      if (!this.isActive || !this.isPaintingLine || !this.currentLine) {
        return;
      }

      const pos = this.stage.getOffsetPointerPosition();
      const scaledPos = getScaledCoordinate({
        x: pos.x,
        y: pos.y,
        scale: this.stage.scaleX()
      });
      const oldPoints = this.currentLine.points();
      this.currentLine.points([oldPoints[0], oldPoints[1], scaledPos.x, scaledPos.y]);
      this.updateAnchorPositions();
      this.markUpLayer.batchDraw();
    });

    this.stage.on('click touchend', (e) => {
      this.setStageClickHandler(e);
    });

    this.stage.on('contextmenu', () => {
      if(this.currentLine) {
        let containerRect = this.stage.container().getBoundingClientRect();
        store().commit('setContextItemActive', {
            style: {
                top: `${containerRect.top + this.stage.getPointerPosition().y}px`,
                left: `${containerRect.left + this.stage.getPointerPosition().x+ 4}px`,
            }
        })
        EventBus.$emit('setContextmenu', true);
      }
      this.setContextmenu();
    });

    this.stage.container().addEventListener('keyup', (e) => {
      if(e.keyCode == 37 || e.keyCode == 38 || e.keyCode == 39 || e.keyCode == 40 || e.keyCode == 221 || e.keyCode == 219)
        this.onSave();
    });
  }

  findExistingLines() {
    this.lines = this.markUpLayer.find('.Line');

    for (let line of this.lines) {
      this.setLineMetadata(line);
      this.setClickHandler(line);
    }
  }

  setContextmenu(){
    if(this.currentLine) {
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

  longTouchStart(){
    if(this.currentLine){
      this.timeout = setTimeout(() => {
          this.setContextmenu();
      }, 400);  
    }      
  }

  longTouchEnd(){
    clearTimeout(this.timeout);
  }

  // Show layer one step top
  moveUp() {
    if(this.currentLine) {
      this.currentLine.moveUp();
      this.currentLine.transformer.moveToTop();
      this.currentStartAnchor.moveToTop();
      this.currentEndAnchor.moveToTop();
      this.markUpLayer.draw();
      this.focus();
    } 
  }

  // Show layer at the top all layers
  moveToTop() {
    this.currentLine.moveToTop();
    this.currentLine.transformer.moveToTop();
    this.currentStartAnchor.moveToTop();
    this.currentEndAnchor.moveToTop();
    this.markUpLayer.draw();
    this.focus();
  }

  // Show layer one step down
  moveDown() {
    this.currentLine.moveDown();
    this.currentLine.transformer.moveToTop();
    this.currentStartAnchor.moveToTop();
    this.currentEndAnchor.moveToTop();
    this.markUpLayer.draw();
    this.focus();
  }

  // Show layer at the bottom all layers
  moveToBottom() {
    this.currentLine.moveToBottom();
    this.currentLine.transformer.moveToTop();
    this.currentStartAnchor.moveToTop();
    this.currentEndAnchor.moveToTop();
    this.markUpLayer.draw();
    this.focus();
  }

  // Move Object to Left/Right 1/5 px
  movetoLeft(xx) {
    var x = this.currentLine.x();
    this.currentLine.x(x + xx);
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
    var y = this.currentLine.y();
    this.currentLine.y(y + yy);
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

    this.isPaintingLine = false;
    this.removeAnchors();
    this.removeTransformer(this.currentLine);
    this.currentLine = null;
  }

  setLineDragHandler(line) {
    line.on('dragmove', () => {
      this.updateAnchorPositions();
    });

    line.on('dragend', () => {
      this.onSave();
    });
  }

  addTransformer(line) {
    this.changeGlobalLineThickness(getPenLineThickness(line.getAttrs()));
    this.changeGlobalColor(line.getAttrs().stroke);

    let transformer = new Transformer({
      node: line,
      resizeEnabled: false,
      rotateEnabled: false,
      ...anchorStyle(this.isTouchDevice)
    });
    line.transformer = transformer;
    this.markUpLayer.add(transformer);
    this.setLineDragHandler(line);
    transformer.show();
    this.markUpLayer.draw();
  }

  removeTransformer(line) {
    if (line && line.transformer) {
      line.transformer.destroy();
      line.transformer = undefined;
      this.markUpLayer.draw();
    }
  }

  addAnchors(disableEvents=false) {
    this.removeAnchors();
    const updateLineCoordinates = () => {
      const points = [
        this.currentStartAnchor.x(),
        this.currentStartAnchor.y(),
        this.currentEndAnchor.x(),
        this.currentEndAnchor.y()
      ];

      this.currentLine.position({
        x: 0,
        y: 0
      });
      this.currentLine.points(points);
      this.markUpLayer.batchDraw();
    };

    const lineOffset = this.currentLine.position();
    const linePoints = this.currentLine.points();

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
      x: linePoints[0] + lineOffset.x,
      y: linePoints[1] + lineOffset.y,
      ...anchorProperties
    });

    if (!disableEvents) {
      this.currentStartAnchor.on('dragstart touchstart', () => {
        this.isPaintingLine = true;
      });
      this.currentStartAnchor.on('dragmove touchmove', updateLineCoordinates);
      this.currentStartAnchor.on('dragend touchend', () => {
        this.isPaintingLine = false;
        this.onSave();
      });
    }

    this.markUpLayer.add(this.currentStartAnchor);

    this.currentEndAnchor = new Circle({
      x: linePoints[2] + lineOffset.x,
      y: linePoints[3] + lineOffset.y,
      ...anchorProperties
    });

    if (!disableEvents) {
      this.currentEndAnchor.on('dragstart touchstart', () => {
        this.isPaintingLine = true;
      });
      this.currentEndAnchor.on('dragmove touchmove', updateLineCoordinates);
      this.currentEndAnchor.on('dragend touchend', () => {
        this.isPaintingLine = false;
        this.onSave();
      });
    }

    this.markUpLayer.add(this.currentEndAnchor);

    this.markUpLayer.batchDraw();
  }

  updateAnchorPositions() {
    if (!this.currentLine || !this.currentStartAnchor || !this.currentEndAnchor) {
      return;
    }

    const linePoints = this.currentLine.points();
    const lineOffset = this.currentLine.position();

    this.currentStartAnchor.position({
      x: linePoints[0] + lineOffset.x,
      y: linePoints[1] + lineOffset.y
    });

    this.currentEndAnchor.position({
      x: linePoints[2] + lineOffset.x,
      y: linePoints[3] + lineOffset.y
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

  setLineMetadata(line) {
    line.isLine = true;
  }

  setClickHandler(line) {
    line.on('click mousedown touchstart', (e) => {
      this.deactivateAllTools('LineTool');

      if (this.currentLine && this.currentLine !== e.target) {
        this.removeTransformer(this.currentLine);
        this.currentLine = null;
      }

      if (!line.transformer) {
        this.addTransformer(line);
      }

      this.currentLine = line;
      this.addAnchors();
    });
  }

  removeCurrentLine() {
    if (this.currentLine) {
      this.removeAnchors();
      this.removeLineFromArray(this.currentLine);

      this.removeTransformer(this.currentLine);
      this.currentLine.destroy();
      this.currentLine = null;
      this.isPaintingLine = false;
      this.markUpLayer.draw();

      this.onSave();
    }
  }

  removeLineFromArray(line) {
    let lineIndex = -1;
    for (let i = 0; i < this.lines.length; i++) {
      if (this.lines[i] === line) {
        lineIndex = i;
      }
    }

    if (lineIndex >= 0) {
      this.lines.splice(lineIndex, 1);
    }
  }

  setStageClickHandler(e) {
    EventBus.$emit('objectSeleted', e);
    if (this.lines) {
      if (!e.target.isLine) {
        if (this.currentLine && !this.isPaintingLine) {
          this.removeTransformer(this.currentLine);
          this.removeAnchors();
          this.currentLine = null;
          this.isPaintingLine = false;
        }
      }
    }
  }

  setLineThickness(lineThickness) {
    this.lineThickness = lineThickness;
    const newLineThickness = penThickness[this.lineThickness];

    if (this.currentLine && this.currentLine.getAttrs().strokeWidth !== newLineThickness.strokeWidth) {
      this.currentLine.setAttrs(newLineThickness);
      this.markUpLayer.draw();
      this.onSave();
    }
  }

  setColor(color) {
    this.color = color;

    if (this.currentLine && this.currentLine.getAttrs().stroke !== this.color) {
      this.currentLine.setAttrs(penColor[this.color]);
      this.markUpLayer.draw();
      this.onSave();
    }
  }

  copyCurrentObject() {
    if (this.currentLine) {
      const newLine = this.currentLine.clone();

      return newLine.toObject();
    }

    return null;
  }

  pasteObject(json) {
    if (this.currentLine) {
      this.deactivate();
    }

    this.deactivateAllTools(ToolNames.LineTool);

    const newLine = Node.create(json);
    this.markUpLayer.add(newLine);
    this.setLineMetadata(newLine);
    this.setClickHandler(newLine);

    this.currentLine = newLine;
    this.lines.push(newLine);
    this.addTransformer(newLine);
    this.addAnchors();
    this.markUpLayer.draw();

    this.onSave();
  }

  isObjectSelected() {
    return !!this.currentLine;
  }
}
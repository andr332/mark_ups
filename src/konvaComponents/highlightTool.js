import {Line, Node, Transformer} from 'konva';
import {getScaledCoordinate} from "../utils";
import anchorStyle from "./styles/anchorStyle";
import {getPenLineThickness, penThickness} from "./styles/lineThicknes";
import {penColor} from "./styles/color";
import {ToolNames} from "../constants";
import EventBus from "../stores/eventBus";
import store from "../stores/appStore";

export default class HighlightTool {
  constructor(options) {
    this.stage = options.stage;
    this.markUpLayer = options.markUpLayer;
    this.onSave = options.onSave;
    this.isActive = false;
    this.deactivateAllTools = options.deactivateAllTools;
    this.lines = [];
    this.currentLine = null;
    this.isPenPainting = false;
    this.lineThickness = options.lineThickness;
    this.changeGlobalLineThickness = options.setLineThickness;
    this.color = options.color;
    this.changeGlobalColor = options.setColor;
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

    this.stage.on('mousedown touchstart', (e) => {
      this.longTouchStart(); // start checking if touch event is long

      if (!this.isActive || this.currentLine || e.evt.button === 2) return;

      this.isPenPainting = true;
      let pos = this.stage.getOffsetPointerPosition();
      const scaledPos = getScaledCoordinate({
        x: pos.x,
        y: pos.y,
        scale: this.stage.scaleX()
      });
      this.currentLine = new Line({
        name: 'Highlight-Line',
        globalCompositeOperation: 'source-over',
        points: [scaledPos.x, scaledPos.y],
        draggable: true,
        opacity: 0.47,
        lineCap: 'round',
        lineJoin: 'round',
        ...penThickness[this.lineThickness],
        ...penColor[this.color]
      });
      this.setLineMetadata(this.currentLine);
      this.setClickHandler(this.currentLine);
      this.markUpLayer.add(this.currentLine);
    });

    this.stage.on('mouseup touchend', () => {
      this.longTouchEnd(); // end checking if touch event is long

      if (!this.isActive || !this.currentLine || !this.isPenPainting) return;

      this.currentLine.bezier(true);
      this.currentLine.lineCap('round');
      this.currentLine.lineJoin('round');
      this.markUpLayer.draw();

      this.isPenPainting = false;
      this.currentLine = null;

      this.onSave();
    });

    // and core function - drawing
    this.stage.on('mousemove touchmove', () => {
      this.longTouchEnd(); // disable checking if touch event is long
      
      if (!this.isActive || !this.isPenPainting || !this.currentLine) return;

      const pos = this.stage.getOffsetPointerPosition();
      const scaledPos = getScaledCoordinate({
        x: pos.x,
        y: pos.y,
        scale: this.stage.scaleX()
      });
      let newPoints = this.currentLine.points().concat([scaledPos.x, scaledPos.y]);
      this.currentLine.points(newPoints);
      this.markUpLayer.draw();
    });

    this.stage.on('click', (e) => {
      this.setStageClickHandler(e);
    });

    this.stage.on('contextmenu', () => {
      this.setContextmenu();
    });

    this.stage.container().addEventListener('keyup', (e) => {
      if(e.keyCode == 37 || e.keyCode == 38 || e.keyCode == 39 || e.keyCode == 40 || e.keyCode == 221 || e.keyCode == 219)
        this.onSave();
    });
  }

  findExistingLines() {
    this.lines = this.markUpLayer.find('.Highlight-Line');

    for (let line of this.lines) {
      this.setLineMetadata(line);
      this.setClickHandler(line);
    }
  }

  setContextmenu(){
    if(this.currentLine){
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
    if(this.currentLine) {
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
    this.currentLine.moveUp();
    this.currentLine.transformer.moveToTop();
    this.markUpLayer.draw();
    this.focus();
  }

  // Show layer at the top all layers
  moveToTop() {
    this.currentLine.moveToTop();
    this.currentLine.transformer.moveToTop();
    this.markUpLayer.draw();
    this.focus();
  }

  // Show layer one step down
  moveDown() {
    this.currentLine.moveDown();
    this.currentLine.transformer.moveToTop();
    this.markUpLayer.draw();
    this.focus();
  }

  // Show layer at the bottom all layers
  moveToBottom() {
    this.currentLine.moveToBottom();
    this.currentLine.transformer.moveToTop();
    this.markUpLayer.draw();
    this.focus();
  }

  // Move Object to Left/Right 1/5 px
  movetoLeft(xx) {
    var x = this.currentLine.x();
    this.currentLine.x(x + xx);
    this.markUpLayer.draw();
  }

  // Move Object to Top/down 1/5 px
  movetoTop(yy) {
    var y = this.currentLine.y();
    this.currentLine.y(y + yy);
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

    this.isPenPainting = false;
    this.removeTransformer(this.currentLine);
    this.currentLine = null;
  }

  setLineMetadata(line) {
    line.isLine = true;
  }

  setClickHandler(line) {
    line.on('click mousedown touchstart', (e) => {
      this.deactivateAllTools('HighlightTool');

      if (this.currentLine && this.currentLine !== e.target) {
        this.removeTransformer(this.currentLine);
        this.currentLine = null;
      }

      if (!line.transformer) {
        this.addTransformer(line);
      }

      this.currentLine = line;
    });
  }

  addTransformer(line) {
    this.changeGlobalLineThickness(getPenLineThickness(line.getAttrs()));
    this.changeGlobalColor(line.getAttrs().stroke);

    let transformer = new Transformer({
      node: line,
      resizeEnabled: false,
      rotateEnabled: true,
      ...anchorStyle(this.isTouchDevice)
    });
    line.transformer = transformer;
    this.setTransformHandler(line);
    this.markUpLayer.add(transformer);
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

  setTransformHandler(line) {
    line.on('dragend', () => {
      this.onSave();
    });

    line.on('transformend', () => {
      this.onSave();
    });
  }

  removeCurrentLine() {
    if (this.currentLine && !this.isPenPainting) {
      this.removeLineFromArray(this.currentLine);

      this.removeTransformer(this.currentLine);
      this.currentLine.destroy();
      this.currentLine = null;
      this.markUpLayer.draw();

      this.onSave();
    }
  }

  removeLineFromArray(arrow) {
    let lineIndex = -1;
    for (let i = 0; i < this.lines.length; i++) {
      if (this.lines[i] === arrow) {
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
        if (this.currentLine) {
          this.removeTransformer(this.currentLine);
          this.currentLine = null;
          this.isPenPainting = false;
        }
      }
    }
  }

  setLineThickness(lineThickness) {
    this.lineThickness = lineThickness;
    const newPenThickness = penThickness[this.lineThickness];

    if (this.currentLine && this.currentLine.getAttrs().strokeWidth !== newPenThickness.strokeWidth) {
      this.currentLine.setAttrs(newPenThickness);
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

    this.deactivateAllTools(ToolNames.PenTool);

    const newLine = Node.create(json);
    this.markUpLayer.add(newLine);
    this.setLineMetadata(newLine);
    this.setClickHandler(newLine);

    this.currentLine = newLine;
    this.lines.push(newLine);
    this.addTransformer(newLine);
    this.markUpLayer.draw();

    this.onSave();
  }

  isObjectSelected() {
    return !!this.currentLine;
  }
}
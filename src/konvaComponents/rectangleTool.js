import {Group, Rect, Transformer, Node} from 'konva';
import {calculateCenterCoordinate, calculateNewObjectSize, getScaledCoordinate} from "../utils";
import anchorStyle from "./styles/anchorStyle";
import {getRectangleLineThickness, rectangleThickness} from "./styles/lineThicknes";
import {emptyRectangleColor, filledRectangleColor} from "./styles/color";
import {ToolNames} from "../constants";
import EventBus from "../stores/eventBus";
import store from "../stores/appStore";

const RECT_TOGGLE_MARGIN = 15;

export default class RectangleTool {
  constructor(options) {
    this.stage = options.stage;
    this.markUpLayer = options.markUpLayer;
    this.onSave = options.onSave;
    this.isActive = false;
    this.isDrawingRect = false;
    this.isTransforming = false;
    this.currentRectangle = null;
    this.currentRectangleGroup = null;
    this.currentRectangleToggle = null;
    this.rectangleGroups = [];
    this.deactivateAllTools = options.deactivateAllTools;
    this.lineThickness = options.lineThickness;
    this.changeGlobalLineThickness = options.setLineThickness;
    this.color = options.color;
    this.changeGlobalColor = options.setColor;
    this.currentTransformAttributes = null;
    this.isTouchDevice = options.isTouchDevice;

    this.timeout = null; // timer to detect if touch event is long

    EventBus.$on('deleteCanvasObject', () => {
      this.removeCurrentRectGroup();
    });
    EventBus.$on('moveCanvasObjecttoLeft', (x) => {
      this.movetoLeft(x);
    });
    EventBus.$on('moveCanvasObjecttoDown', (x) => {
      this.movetoTop(x);
    });
    EventBus.$on('moveDownCurrentObject', ()=> {
      if(this.currentRectangleGroup){
        this.moveDown();
      }
    });
    EventBus.$on('moveUpCurrentObject', () => {
      if(this.currentRectangleGroup){
        this.moveUp();
      }
    });
    EventBus.$on('moveToTopObject', () => {
      if(this.currentRectangleGroup){
        this.moveToTop();
      }
    });
    EventBus.$on('moveToBottomObject', () => {
      if(this.currentRectangleGroup){
        this.moveToBottom();
      }
    });
  }

  setStage(stage, markUpLayer) {
    this.stage = stage;
    this.markUpLayer = markUpLayer;

    this.findExistingRectGroups();
  }

  init() {
    this.findExistingRectGroups();

    this.stage.on('contentMousedown touchstart', (e) => {
      this.longTouchStart(); // start checking if touch event is long

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
      this.longTouchEnd(); // end checking if touch event is long

      if (!this.isActive || !this.currentRectangle) {
        return;
      }

      if (this.currentRectangle.width() === 0 || this.currentRectangle.height() === 0) {
        this.removeTransformer(this.currentRectangleGroup);
        this.removeRectGroupFromArray(this.currentRectangleGroup);
        this.currentRectangleGroup.destroy();
        this.markUpLayer.draw();
      }

      if (this.currentRectangleGroup && this.isDrawingRect) {
        this.removeTransformer(this.currentRectangleGroup);
        this.currentRectangleGroup = null;
        this.currentRectangle = null;
        this.currentRectangleToggle = null;
      }

      this.isDrawingRect = false;
      this.onSave();
    });

    this.stage.on('contentMousemove touchmove', () => {
      this.longTouchEnd(); // disable checking if touch event is long

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
      this.recalculateToggleGroup(this.currentRectangleGroup);
      this.markUpLayer.draw();
    });

    this.stage.on('click touchend', (e) => {
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

  findExistingRectGroups() {
    this.rectangleGroups = this.markUpLayer.find('.RectGroup-Filled');
    this.rectangleGroups.push(...this.markUpLayer.find('.RectGroup-Empty'));

    for (let rectGroup of this.rectangleGroups) {
      this.setRectGroupMetadata(rectGroup);
      this.setClickHandler(rectGroup);

      if (rectGroup.name() === 'RectGroup-Filled') {
        rectGroup.rectStyle = 'filled';
      } else {
        rectGroup.rectStyle = 'empty';
      }
    }
  }

  addRectGroup(pos, style) {
    const rectGroup = new Group({
      name: `RectGroup-${style}`
    });
    rectGroup.rectStyle = style.toLowerCase();

    const colorAttrs = rectGroup.rectStyle === 'filled' ? filledRectangleColor[this.color] : emptyRectangleColor[this.color];

    const rect = new Rect({
      name: 'Rect',
      x: pos.x,
      y: pos.y,
      width: 0,
      height: 0,
      draggable: true,
      opacity: 1,
      strokeScaleEnabled: true,
      ...rectangleThickness[this.lineThickness],
      ...colorAttrs
    });
    rectGroup.add(rect);

    this.setRectGroupMetadata(rectGroup);
    this.setClickHandler(rectGroup);
    this.markUpLayer.add(rectGroup);
    this.currentRectangleGroup = rectGroup;
    this.currentRectangle = rect;
    this.rectangleGroups.push(rectGroup);
    this.addTransformer(rectGroup);
    this.markUpLayer.draw();
  }

  setClickHandler(rectGroup) {
    rectGroup.on('click mousedown touchstart', (e) => {
      this.deactivateAllTools('RectangleTool');

      if (this.currentRectangleGroup && this.currentRectangleGroup !== e.target) {
        this.removeTransformer(this.currentRectangleGroup);
        this.currentRectangleGroup = null;
        this.currentRectangle = null;
        this.currentRectangleToggle = null;
      }

      this.currentRectangleGroup = rectGroup;
      this.currentRectangle = rectGroup.findOne('Rect');

      if (!rectGroup.transformer) {
        this.addTransformer(rectGroup);
      }
    });
  }

  setRectGroupMetadata(rectGroup) {
    rectGroup.isRectGroup = true;

    const rect = rectGroup.findOne('.Rect');
    if (rect) rect.isRectGroup = true;
  }

  setStageClickHandler(e) {
    EventBus.$emit('objectSeleted', e);
    if (this.rectangleGroups) {
      if (!e.target.isRectGroup) {
        if (this.currentRectangleGroup && !this.isDrawingRect && !this.isTransforming) {
          this.removeTransformer(this.currentRectangleGroup);
          this.currentRectangleGroup = null;
          this.currentRectangle = null;
          this.currentRectangleToggle = null;
          this.isDrawingRect = false;
        }
      }
    }
  }

  setContextmenu(){
    if(this.currentRectangleGroup) {
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
    if(this.currentRectangleGroup){
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
    console.log('moveUp function')
    this.currentRectangleGroup.moveUp();
    this.currentRectangleGroup.transformer.moveToTop();
    this.markUpLayer.draw();
    this.focus();
  }

  // Show layer at the top all layers
  moveToTop() {
    this.currentRectangleGroup.moveToTop(); 
    this.currentRectangleGroup.transformer.moveToTop();
    this.markUpLayer.draw();
    this.focus();
  }

  // Show layer one step down
  moveDown() {
    this.currentRectangleGroup.moveDown();
    this.currentRectangleGroup.transformer.moveToTop();
    this.markUpLayer.draw();
    this.focus();
  }

  // Show layer at the bottom all layers
  moveToBottom() {
    this.currentRectangleGroup.moveToBottom(); 
    this.currentRectangleGroup.transformer.moveToTop();
    this.markUpLayer.draw();
    this.focus();
  }

  // Move Object to Left/Right 1/5 px
  movetoLeft(xx) {
    if(this.currentRectangleToggle) {
      var x = this.currentRectangleToggle.x();
      this.currentRectangleToggle.x(x + xx);
    }
    if(this.currentRectangle) {
      x = this.currentRectangle.x();
      this.currentRectangle.x(x + xx);
    }
    this.markUpLayer.draw();
  }

  // Move Object to Top/down 1/5 px
  movetoTop(yy) {
    if(this.currentRectangleToggle) {
      var y = this.currentRectangleToggle.y();
      this.currentRectangleToggle.y(y + yy);
    }
    if(this.currentRectangle) {
      y = this.currentRectangle.y();
      this.currentRectangle.y(y + yy);
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

    this.isDrawingRect = false;
    this.removeTransformer(this.currentRectangleGroup);
    this.currentRectangle = null;
    this.currentRectangleGroup = null;
    this.currentRectangleToggle = null;
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
      this.recalculateToggleGroup(rectGroup);
      this.stage.batchDraw();
    });

    rectangle.on('transformend', () => {
      this.isTransforming = false;
      this.currentTransformAttributes = null;

      this.onSave();
    });

    rectangle.on('transformstart', () => {
      this.isTransforming = true;
      this.currentTransformAttributes = Object.assign({}, rectangle.getAttrs());
    });

    rectangle.on('dragmove touchmove', () => {
      this.recalculateToggleGroup(rectGroup);
    });

    rectangle.on('dragend touchend', () => {
      this.onSave();
    });
  }

  addTransformer(rectGroup) {
    const rect = rectGroup.findOne('.Rect');
    this.changeGlobalLineThickness(getRectangleLineThickness(rect.getAttrs()));
    this.changeGlobalColor(rect.getAttrs().stroke);

    let transformer = new Transformer({
      node: rect,
      enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
      keepRatio: false,
      ...anchorStyle(this.isTouchDevice)
    });
    rectGroup.transformer = transformer;
    rect.transformer = transformer;
    this.setTransformHandler(rectGroup);
    this.markUpLayer.add(transformer);
    transformer.show();

    const rectToggle = this.createRectToggle(rectGroup);
    rectGroup.add(rectToggle);
    this.currentRectangleToggle = rectToggle;
    this.recalculateToggleGroup(rectGroup);

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

  removeRectGroupFromArray(rectGroup) {
    let rectGroupIndex = -1;
    for (let i = 0; i < this.rectangleGroups.length; i++) {
      if (this.rectangleGroups[i] === rectGroup) {
        rectGroupIndex = i;
      }
    }

    if (rectGroupIndex >= 0) {
      this.rectangleGroups.splice(rectGroupIndex, 1);
    }
  }

  removeCurrentRectGroup() {
    if (this.currentRectangleGroup && !this.isDrawingRect) {
      this.removeRectGroupFromArray(this.currentRectangleGroup);

      this.removeTransformer(this.currentRectangleGroup);
      this.currentRectangleGroup.destroy();
      this.currentRectangleGroup = null;
      this.currentRectangle = null;
      this.currentRectangleToggle = null;
      this.markUpLayer.batchDraw();

      this.onSave();
    }
  }

  setLineThickness(lineThickness) {
    this.lineThickness = lineThickness;
    const newRectangleThickness = rectangleThickness[this.lineThickness];

    if (this.currentRectangle && this.currentRectangle.getAttrs().strokeWidth !== newRectangleThickness.strokeWidth) {
      this.currentRectangle.setAttrs(newRectangleThickness);
      this.recalculateToggleGroup(this.currentRectangleGroup);
      this.markUpLayer.draw();
      this.onSave();
    }
  }

  setColor(color) {
    this.color = color;

    if (this.currentRectangle && this.currentRectangle.getAttrs().stroke !== this.color) {
      const rectAttrs = this.currentRectangleGroup.rectStyle === 'filled' ? filledRectangleColor[this.color] : emptyRectangleColor[this.color];
      this.currentRectangle.setAttrs(rectAttrs);
      this.updateRectToggleColor();
      this.markUpLayer.draw();
      this.onSave();
    }
  }

  createRectToggle(rectGroup) {
    const existingToggleGroup = rectGroup.findOne('.RectToggle');
    if (existingToggleGroup) existingToggleGroup.destroy();

    const rect = rectGroup.findOne('.Rect');
    const color = rect.getAttrs().stroke;
    const inverseScale = 1 / this.stage.scaleX();

    let toggleGroup = new Group({
      name: 'RectToggle',
      draggable: false,
      scaleX: inverseScale,
      scaleY: inverseScale
    });
    let toggleGroupAttrs = {};

    if (rectGroup.rectStyle === 'filled') {
      toggleGroupAttrs = {
        ...emptyRectangleColor[color],
        strokeWidth: 2
      };
    } else {
      toggleGroupAttrs = {
        ...filledRectangleColor[color],
        strokeWidth: 0
      };
    }

    let toggleGroupRect = new Rect({
      name: 'RectToggleBox',
      width: 30,
      height: 30,
      opacity: 1,
      cornerRadius: 2,
      ...toggleGroupAttrs
    });

    toggleGroup.add(toggleGroupRect);

    toggleGroup.on('click mousedown touchend', () => {
      this.rectToggleClicked(toggleGroup);
    });

    return toggleGroup;
  }

  recalculateToggleGroup(rectGroup) {
    const toggleGroup = rectGroup.findOne('.RectToggle');

    if (toggleGroup) {
      const rect = rectGroup.findOne('.Rect');
      const rectAttrs = rect.getAttrs();
      const rotation = rect.rotation();

      const rectStroke = (rectAttrs.strokeWidth ?? 0) / 2;
      const pixelMargin = RECT_TOGGLE_MARGIN / this.stage.scaleX();
      const anchorPoint = {
        x: rectAttrs.x + (rect.width() / 2 - pixelMargin) * Math.cos(rotation * Math.PI / 180) + (rect.height() + pixelMargin + rectStroke) * Math.sin(-rotation * Math.PI / 180),
        y: rectAttrs.y + (rect.height() + pixelMargin + rectStroke) * Math.cos(rotation * Math.PI / 180) + (rect.width() / 2 - pixelMargin) * Math.sin(rotation * Math.PI / 180)
      };

      toggleGroup.setAttrs({
        x: anchorPoint.x,
        y: anchorPoint.y,
        rotation: rotation
      });

      this.markUpLayer.draw();
    }
  }

  rectToggleClicked() {
    if (this.currentRectangleGroup.rectStyle === 'filled') {
      const rectAttrs = emptyRectangleColor[this.color];
      this.currentRectangle.setAttrs(rectAttrs);
      this.currentRectangleGroup.rectStyle = 'empty';
      this.currentRectangleGroup.name('RectGroup-Empty');
      this.updateRectToggleColor();
    } else {
      const rectAttrs = filledRectangleColor[this.color];
      this.currentRectangle.setAttrs(rectAttrs);
      this.currentRectangleGroup.rectStyle = 'filled';
      this.currentRectangleGroup.name('RectGroup-Filled');
      this.updateRectToggleColor();
    }

    this.markUpLayer.draw();
    this.onSave();
  }

  updateRectToggleColor() {
    if (!this.currentRectangleGroup || !this.currentRectangleToggle) {
      return;
    }

    const rectToggle = this.currentRectangleToggle.findOne('Rect');

    if (!rectToggle) return;

    let rectToggleAttrs = {};

    if (this.currentRectangleGroup.rectStyle === 'filled') {
      rectToggleAttrs = {
        ...emptyRectangleColor[this.color],
        strokeWidth: 2
      };
    } else {
      rectToggleAttrs = {
        ...filledRectangleColor[this.color],
        strokeWidth: 0
      };
    }

    rectToggle.setAttrs(rectToggleAttrs);
  }

  copyCurrentObject() {
    if (this.currentRectangleGroup) {
      const newRectGroup = this.currentRectangleGroup.clone();
      const newRectToggle = newRectGroup.findOne('.RectToggle');
      if (newRectToggle) newRectToggle.destroy();

      return newRectGroup.toObject();
    }

    return null;
  }

  pasteObject(json) {
    if (this.currentRectangleGroup) {
      this.deactivate();
    }

    this.deactivateAllTools(ToolNames.RectangleTool);

    const newRectGroup = Node.create(json);
    const newRect = newRectGroup.findOne('.Rect');
    this.markUpLayer.add(newRectGroup);
    this.setRectGroupMetadata(newRectGroup);
    this.setClickHandler(newRectGroup);

    if (newRectGroup.name() === 'RectGroup-Filled') {
      newRectGroup.rectStyle = 'filled';
    } else {
      newRectGroup.rectStyle = 'empty';
    }

    const newRectSize = calculateNewObjectSize({
      width: this.stage.width(),
      height: this.stage.height()
    }, {
      width: newRect.width(),
      height: newRect.height()
    }, Number(process.env.VUE_APP_MAX_PASTED_OBJECT_PERCENTAGE));
    const newCoord = calculateCenterCoordinate({
      offsetX: this.stage.offsetX(),
      offsetY: this.stage.offsetY(),
      width: this.stage.width(),
      height: this.stage.height()
    }, newRectSize, this.stage.scaleX());

    newRect.setAttrs({
      ...newRectSize,
      ...newCoord
    });

    this.currentRectangleGroup = newRectGroup;
    this.currentRectangle = newRect;
    this.rectangleGroups.push(newRectGroup);
    this.addTransformer(newRectGroup);
    this.markUpLayer.draw();

    this.onSave();
  }

  isObjectSelected() {
    return !!this.currentRectangle;
  }
}
import {Ellipse, Group, Node, Transformer} from 'konva';
import {calculateNewObjectSize, getScaledCoordinate} from "../utils";
import anchorStyle from "./styles/anchorStyle";
import {getEllipseLineThickness, ellipseThickness} from "./styles/lineThicknes";
import {emptyEllipseColor, filledEllipseColor} from "./styles/color";
import {ToolNames} from "../constants";
import EventBus from "../stores/eventBus";
import store from "../stores/appStore";

const ELLIPSE_TOGGLE_MARGIN = 30;

export default class EllipseTool {
  constructor(options) {
    this.stage = options.stage;
    this.markUpLayer = options.markUpLayer;
    this.onSave = options.onSave;
    this.isActive = false;
    this.isDrawingEllipse = false;
    this.currentEllipse = null;
    this.currentEllipseGroup = null;
    this.currentEllipseToggle = null;
    this.ellipseGroups = [];
    this.deactivateAllTools = options.deactivateAllTools;
    this.lineThickness = options.lineThickness;
    this.changeGlobalLineThickness = options.setLineThickness;
    this.color = options.color;
    this.changeGlobalColor = options.setColor;
    this.currentTransformAttributes = null;
    this.isTouchDevice = options.isTouchDevice;

    this.timeout = null; // timer to detect if touch event is long

    EventBus.$on('deleteCanvasObject', () => {
      this.removeCurrentEllipseGroup();
    });
    EventBus.$on('moveCanvasObjecttoLeft', (x) => {
      this.movetoLeft(x);
    });
    EventBus.$on('moveCanvasObjecttoDown', (x) => {
      this.movetoTop(x);
    });
    EventBus.$on('moveDownCurrentObject', ()=> {
      if(this.currentEllipseGroup){
        this.moveDown();
      }
    });
    EventBus.$on('moveUpCurrentObject', () => {
      if(this.currentEllipseGroup){
        this.moveUp();
      }
    });
    EventBus.$on('moveToTopObject', () => {
      if(this.currentEllipseGroup){
        this.moveToTop();
      }
    });
    EventBus.$on('moveToBottomObject', () => {
      if(this.currentEllipseGroup){
        this.moveToBottom();
      }
    });
  }

  setStage(stage, markUpLayer) {
    this.stage = stage;
    this.markUpLayer = markUpLayer;

    this.findExistingEllipseGroups();
  }

  init() {
    this.findExistingEllipseGroups();

    this.stage.on('contentMousedown touchstart', (e) => {
      this.longTouchStart(); // start checking if touch event is long

      if (!this.isActive || this.currentEllipse || e.evt.button === 2) {
        return;
      }

      this.isDrawingEllipse = true;
      const pos = this.stage.getOffsetPointerPosition();
      const scaledPos = getScaledCoordinate({
        x: pos.x,
        y: pos.y,
        scale: this.stage.scaleX()
      });
      this.addEllipseGroup(scaledPos, 'Empty');
    });

    this.stage.on('contentMouseup touchend', () => {
      this.longTouchEnd(); // end checking if touch event is long

      if (!this.isActive || !this.isDrawingEllipse || !this.currentEllipse) {
        return;
      }

      if (this.currentEllipse.radiusX() === 0 || this.currentEllipse.radiusY() === 0) {
        this.removeCurrentEllipseGroup();
      }

      if (this.currentEllipse && this.isDrawingEllipse) {
        this.removeTransformer(this.currentEllipseGroup);
        this.currentEllipse = null;
        this.currentEllipseGroup = null;
        this.currentEllipseToggle = null;
      }

      this.isDrawingEllipse = false;
      this.onSave();
    });

    this.stage.on('contentMousemove touchmove', () => {
      this.longTouchEnd(); // disable checking if touch event is long
      
      if (!this.isActive || !this.isDrawingEllipse) {
        return;
      }

      const pos = this.stage.getOffsetPointerPosition();
      const scaledPos = getScaledCoordinate({
        x: pos.x,
        y: pos.y,
        scale: this.stage.scaleX()
      });
      const radiusX = Math.abs(scaledPos.x - this.currentEllipse.getAttr('x'));
      const radiusY = Math.abs(scaledPos.y - this.currentEllipse.getAttr('y'));
      this.currentEllipse.radiusX(radiusX);
      this.currentEllipse.radiusY(radiusY);
      this.recalculateToggleGroup(this.currentEllipseGroup);
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

  findExistingEllipseGroups() {
    this.ellipseGroups = this.markUpLayer.find('.EllipseGroup-Filled');
    this.ellipseGroups.push(...this.markUpLayer.find('.EllipseGroup-Empty'));

    for (let ellipseGroup of this.ellipseGroups) {
      this.setEllipseGroupMetadata(ellipseGroup);
      this.setClickHandler(ellipseGroup);

      if (ellipseGroup.name() === 'EllipseGroup-Filled') {
        ellipseGroup.ellipseStyle = 'filled';
      } else {
        ellipseGroup.ellipseStyle = 'empty';
      }
    }
  }

  addEllipseGroup(pos, style) {
    const ellipseGroup = new Group({
      name: `EllipseGroup-${style}`
    });
    ellipseGroup.ellipseStyle = style.toLowerCase();

    const colorAttrs = ellipseGroup.ellipseStyle === 'filled' ? filledEllipseColor[this.color] : emptyEllipseColor[this.color];

    const ellipse = new Ellipse({
      name: 'Ellipse',
      x: pos.x,
      y: pos.y,
      radiusX: 0,
      radiusY: 0,
      draggable: true,
      strokeScaleEnabled: true,
      ...ellipseThickness[this.lineThickness],
      ...colorAttrs
    });
    ellipseGroup.add(ellipse);

    this.setEllipseGroupMetadata(ellipseGroup);
    this.setClickHandler(ellipseGroup);
    this.markUpLayer.add(ellipseGroup);
    this.currentEllipseGroup = ellipseGroup;
    this.currentEllipse = ellipse;
    this.ellipseGroups.push(ellipseGroup);
    this.addTransformer(ellipseGroup);
    this.markUpLayer.draw();
  }

  setContextmenu(){
    if(this.currentEllipse)
    {
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
    if(this.currentEllipse) {
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
    this.currentEllipseGroup.moveUp();
    this.currentEllipseGroup.transformer.moveToTop();
    this.markUpLayer.draw();
    this.focus();
  }

  // Show layer at the top all layers
  moveToTop() {
    this.currentEllipseGroup.moveToTop();
    this.currentEllipseGroup.transformer.moveToTop();
    this.markUpLayer.draw();
    this.focus();
  }

  // Show layer one step down
  moveDown() {
    this.currentEllipseGroup.moveDown();
    this.currentEllipseGroup.transformer.moveToTop();
    this.markUpLayer.draw();
    this.focus();
  }

  // Show layer at the bottom all layers
  moveToBottom() {
    this.currentEllipseGroup.moveToBottom();
    this.currentEllipseGroup.transformer.moveToTop();
    this.markUpLayer.draw(); 
    this.focus();
  }

  // Move Object to Left/Right 1/5 px
  movetoLeft(xx) {
    if(this.currentEllipseToggle) {
      var x = this.currentEllipseToggle.x();
      this.currentEllipseToggle.x(x + xx);
    }
    if(this.currentEllipse) {
      x = this.currentEllipse.x();
      this.currentEllipse.x(x + xx);
    }
    this.markUpLayer.draw();
  }

  // Move Object to Top/down 1/5 px
  movetoTop(yy) {
    if(this.currentEllipseToggle) {
      var y = this.currentEllipseToggle.y();
      this.currentEllipseToggle.y(y + yy);
    }
    if(this.currentEllipse) {
      y = this.currentEllipse.y();
      this.currentEllipse.y(y + yy);
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

    this.isDrawingEllipse = false;
    this.removeTransformer(this.currentEllipseGroup);
    this.currentEllipse = null;
    this.currentEllipseGroup = null;
    this.currentEllipseToggle = null;
  }

  setEllipseGroupMetadata(ellipseGroup) {
    ellipseGroup.isEllipseGroup = true;

    const ellipse = ellipseGroup.findOne('.Ellipse');
    if (ellipse) ellipse.isEllipseGroup = true;
  }

  setClickHandler(ellipseGroup) {
    ellipseGroup.on('click mousedown touchstart', (e) => {
      this.deactivateAllTools('EllipseTool');

      if (this.currentEllipseGroup && this.currentEllipseGroup !== e.target) {
        this.removeTransformer(this.currentEllipseGroup);
        this.currentEllipseGroup = null;
        this.currentEllipse = null;
        this.currentEllipseToggle = false;
      }

      this.currentEllipseGroup = ellipseGroup;
      this.currentEllipse = ellipseGroup.findOne('.Ellipse');

      if (!ellipseGroup.transformer) {
        this.addTransformer(ellipseGroup);
      }
    });
  }

  addTransformer(ellipseGroup) {
    const ellipse = ellipseGroup.findOne('.Ellipse');

    this.changeGlobalLineThickness(getEllipseLineThickness(ellipse.getAttrs()));
    this.changeGlobalColor(ellipse.getAttrs().stroke);

    let transformer = new Transformer({
      node: ellipse,
      enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
      keepRatio: false,
      ...anchorStyle(this.isTouchDevice)
    });
    ellipseGroup.transformer = transformer;
    this.setTransformHandler(ellipseGroup);
    this.markUpLayer.add(transformer);
    transformer.show();

    const ellipseToggle = this.createEllipseToggle(ellipseGroup);
    ellipseGroup.add(ellipseToggle);
    this.currentEllipseToggle = ellipseToggle;
    this.recalculateToggleGroup(ellipseGroup);

    this.markUpLayer.draw();
  }

  removeTransformer(ellipseGroup) {
    if (ellipseGroup) {
      const ellipseToggle = ellipseGroup.findOne('.EllipseToggle');
      if (ellipseToggle) {
        ellipseToggle.destroy();
      }

      if (ellipseGroup.transformer) {
        ellipseGroup.transformer.destroy();

        ellipseGroup.transformer = undefined;
      }

      this.markUpLayer.draw();
    }
  }

  setTransformHandler(ellipseGroup) {
    const ellipse = ellipseGroup.findOne('.Ellipse');
    ellipse.on('transform', () => {
      if (ellipse.scaleX() >= 0) {
        const currentWidth = ellipse.width();
        ellipse.width(currentWidth * ellipse.scaleX());
        ellipse.scaleX(1);
      } else {
        ellipse.setAttrs(this.currentTransformAttributes);
      }

      if (ellipse.scaleY() >= 0) {
        const currentHeight = ellipse.height();
        ellipse.height(currentHeight * ellipse.scaleY());
        ellipse.scaleY(1);
      } else {
        ellipse.setAttrs(this.currentTransformAttributes);
      }

      this.currentTransformAttributes = Object.assign({}, ellipse.getAttrs());
      this.recalculateToggleGroup(ellipseGroup);
      this.stage.batchDraw();
    });

    ellipse.on('transformend', () => {
      this.currentTransformAttributes = null;
      this.onSave();
    });

    ellipse.on('transformstart', () => {
      this.currentTransformAttributes = Object.assign({}, ellipse.getAttrs());
    });

    ellipse.on('dragmove', () => {
      this.recalculateToggleGroup(ellipseGroup);
    });

    ellipse.on('dragend', () => {
      this.onSave();
    });
  }

  removeCurrentEllipseGroup() {
    if (this.currentEllipseGroup && !this.isDrawingEllipse) {
      this.removeEllipseGroupFromArray(this.currentEllipse);

      this.removeTransformer(this.currentEllipseGroup);
      this.currentEllipseGroup.destroy();
      this.currentEllipseGroup = null;
      this.currentEllipse = null;
      this.currentEllipseToggle = null;
      this.markUpLayer.draw();

      this.onSave();
    }
  }

  removeEllipseGroupFromArray(ellipseGroup) {
    let ellipseGroupIndex = -1;
    for (let i = 0; i < this.ellipseGroups.length; i++) {
      if (this.ellipseGroups[i] === ellipseGroup) {
        ellipseGroupIndex = i;
      }
    }

    if (ellipseGroupIndex >= 0) {
      this.ellipseGroups.splice(ellipseGroupIndex, 1);
    }
  }

  setStageClickHandler(e) {
    EventBus.$emit('objectSeleted', e);
    if (this.ellipseGroups || !this.isDrawingEllipse) {
      if (!e.target.isEllipseGroup) {
        if (this.currentEllipseGroup) {
          this.removeTransformer(this.currentEllipseGroup);
          this.currentEllipse = null;
          this.currentEllipseGroup = null;
          this.currentEllipseToggle = null;
          this.isDrawingEllipse = false;
        }
      }
    }
  }

  setLineThickness(lineThickness) {
    this.lineThickness = lineThickness;
    const newEllipseThickness = ellipseThickness[this.lineThickness];

    if (this.currentEllipse && this.currentEllipse.getAttrs().strokeWidth !== newEllipseThickness.strokeWidth) {
      this.currentEllipse.setAttrs(newEllipseThickness);
      this.recalculateToggleGroup(this.currentEllipseGroup);
      this.markUpLayer.draw();
      this.onSave();
    }
  }

  setColor(color) {
    this.color = color;

    if (this.currentEllipse && this.currentEllipse.getAttrs().stroke !== this.color) {
      const ellipseAttrs = this.currentEllipseGroup.ellipseStyle === 'filled' ? filledEllipseColor[this.color] : emptyEllipseColor[this.color];
      this.currentEllipse.setAttrs(ellipseAttrs);
      this.updateEllipseToggleColor();
      this.markUpLayer.draw();
      this.onSave();
    }
  }

  createEllipseToggle(ellipseGroup) {
    const existingToggleGroup = ellipseGroup.findOne('.EllipseToggle');
    if (existingToggleGroup) existingToggleGroup.destroy();

    const ellipse = ellipseGroup.findOne('.Ellipse');
    const color = ellipse.getAttrs().stroke;
    const scale = 1 / this.stage.scaleX(); // inverse scale

    let toggleGroup = new Group({
      name: 'EllipseToggle',
      draggable: false,
      scaleX: scale,
      scaleY: scale
    });
    let toggleGroupAttrs = {};

    if (ellipseGroup.ellipseStyle === 'filled') {
      toggleGroupAttrs = {
        ...emptyEllipseColor[color],
        strokeWidth: 2
      };
    } else {
      toggleGroupAttrs = {
        ...filledEllipseColor[color],
        strokeWidth: 0
      };
    }

    let toggleGroupCircle = new Ellipse({
      name: 'EllipseToggleCircle',
      radiusX: 15,
      radiusY: 15,
      opacity: 1,
      cornerRadius: 2,
      ...toggleGroupAttrs
    });

    toggleGroup.add(toggleGroupCircle);

    toggleGroup.on('click mousedown touchstart', () => {
      this.ellipseToggleClicked(toggleGroup);
    });

    return toggleGroup;
  }

  ellipseToggleClicked() {
    if (this.currentEllipseGroup.ellipseStyle === 'filled') {
      const ellipseAttrs = emptyEllipseColor[this.color];
      this.currentEllipse.setAttrs(ellipseAttrs);
      this.currentEllipseGroup.ellipseStyle = 'empty';
      this.currentEllipseGroup.name('EllipseGroup-Empty');
      this.updateEllipseToggleColor();
    } else {
      const ellipseAttrs = filledEllipseColor[this.color];
      this.currentEllipse.setAttrs(ellipseAttrs);
      this.currentEllipseGroup.ellipseStyle = 'filled';
      this.currentEllipseGroup.name('EllipseGroup-Filled');
      this.updateEllipseToggleColor();
    }

    this.markUpLayer.draw();
    this.onSave();
  }

  updateEllipseToggleColor() {
    if (!this.currentEllipseGroup || !this.currentEllipseToggle) {
      return;
    }

    const ellipseToggle = this.currentEllipseToggle.findOne('Ellipse');

    if (!ellipseToggle) return;

    let ellipseToggleAttrs = {};

    if (this.currentEllipseGroup.ellipseStyle === 'filled') {
      ellipseToggleAttrs = {
        ...emptyEllipseColor[this.color],
        strokeWidth: 2
      };
    } else {
      ellipseToggleAttrs = {
        ...filledEllipseColor[this.color],
        strokeWidth: 0
      };
    }

    ellipseToggle.setAttrs(ellipseToggleAttrs);
  }

  recalculateToggleGroup(ellipseGroup) {
    const toggleGroup = ellipseGroup.findOne('.EllipseToggle');

    if (toggleGroup) {
      const ellipse = ellipseGroup.findOne('.Ellipse');
      const ellipseAttrs = ellipse.getAttrs();
      const rotation = ellipse.rotation();


      const ellipseStroke = (ellipseAttrs.strokeWidth ?? 0) / 2;
      const pixelMargin = ELLIPSE_TOGGLE_MARGIN / this.stage.scaleX();
      const anchorPoint = {
        x: ellipseAttrs.x + (ellipse.radiusY() + pixelMargin + ellipseStroke) * Math.sin(-rotation * Math.PI / 180),
        y: ellipseAttrs.y + (ellipse.radiusY() + pixelMargin + ellipseStroke) * Math.cos(rotation * Math.PI / 180)
      };

      toggleGroup.setAttrs({
        x: anchorPoint.x,
        y: anchorPoint.y,
        rotation: rotation
      });

      this.markUpLayer.draw();
    }
  }

  copyCurrentObject() {
    if (this.currentEllipseGroup) {
      const newEllipseGroup = this.currentEllipseGroup.clone();
      const newEllipseToggle = newEllipseGroup.findOne('.EllipseToggle');
      if (newEllipseToggle) newEllipseToggle.destroy();

      return newEllipseGroup.toObject();
    }

    return null;
  }

  pasteObject(json) {
    if (this.currentEllipseGroup) {
      this.deactivate();
    }

    this.deactivateAllTools(ToolNames.EllipseTool);

    const newEllipseGroup = Node.create(json);
    const newEllipse = newEllipseGroup.findOne('.Ellipse');
    this.markUpLayer.add(newEllipseGroup);
    this.setEllipseGroupMetadata(newEllipseGroup);
    this.setClickHandler(newEllipseGroup);

    if (newEllipseGroup.name() === 'EllipseGroup-Filled') {
      newEllipseGroup.rectStyle = 'filled';
    } else {
      newEllipseGroup.rectStyle = 'empty';
    }

    const newEllipseSize = calculateNewObjectSize({
      width: this.stage.width(),
      height: this.stage.height()
    }, {
      width: newEllipse.width(),
      height: newEllipse.height()
    }, Number(process.env.VUE_APP_MAX_PASTED_OBJECT_PERCENTAGE));
    const newCoord = {
      x: this.stage.width() / this.stage.scaleX() / 2,
      y: this.stage.height() / this.stage.scaleX() / 2
    };

    newEllipse.setAttrs({
      ...newEllipseSize,
      ...newCoord
    });

    this.currentEllipseGroup = newEllipseGroup;
    this.currentEllipse = newEllipse;
    this.ellipseGroups.push(newEllipseGroup);
    this.addTransformer(newEllipseGroup);
    this.markUpLayer.draw();

    this.onSave();
  }

  isObjectSelected() {
    return !!this.currentEllipse;
  }
}
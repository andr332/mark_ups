import {Image as KonvaImage, Node, Transformer} from 'konva';
import anchorStyle from "./styles/anchorStyle";
import {buildAttachmentDownloadUrl} from "../services/markUpService";
import {calculateCenterCoordinate, calculateNewObjectSize} from "../utils";
import {ToolNames} from "../constants";
import EventBus from "../stores/eventBus";
import store from "../stores/appStore";

const MAX_CANVAS_PERCENT = 0.75;

const createImgFromSrc = (src) => {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      resolve(image);
    }
    image.crossOrigin = 'Anonymous';
    image.src = src;
  });
};

export default class ImageTool {
  constructor(options) {
    this.stage = options.stage;
    this.markUpLayer = options.markUpLayer;
    this.onSave = options.onSave;
    this.isActive = false;
    this.currentImage = null;
    this.images = [];
    this.deactivateAllTools = options.deactivateAllTools;
    this.activateLastUsedTool = options.activateLastUsedTool;
    this.currentTransformAnchor = null;
    this.attachments = options.attachments;
    this.isTouchDevice = options.isTouchDevice;

    this.timeout = null; // timer to detect if touch event is long

    EventBus.$on('deleteCanvasObject', () => {
      this.removeCurrentImage();
    });
    EventBus.$on('moveCanvasObjecttoLeft', (x) => {
      this.movetoLeft(x);
    });
    EventBus.$on('moveCanvasObjecttoDown', (y) => {
      this.movetoTop(y);
    });
    EventBus.$on('moveDownCurrentObject', ()=> {
      if(this.currentImage){
        this.moveDown();
      }
    });
    EventBus.$on('moveUpCurrentObject', () => {
      if(this.currentImage){
        this.moveUp();
      }
    });
    EventBus.$on('moveToTopObject', () => {
      if(this.currentImage){
        this.moveToTop();
      }
    });
    EventBus.$on('moveToBottomObject', () => {
      if(this.currentImage){
        this.moveToBottom();
      }
    });

    this.init();
  }

  setStage(stage, markUpLayer) {
    this.stage = stage;
    this.markUpLayer = markUpLayer;

    this.findExistingImages();
  }

  async init() {
    await this.findExistingImages();

    this.stage.on('click touchend', (e) => {
      this.setStageClickHandler(e);
    });

    this.stage.on('contentMousedown touchstart', (e) => {
      this.longTouchStart(); // start checking if touch event is long
      if (!this.isActive || this.currentImage || e.evt.button === 2) {
        return;
      }
    });

    this.stage.on('contentMouseup touchend', () => {
      this.longTouchEnd(); // end checking if touch event is long
    });

    this.stage.on('contentMousemove touchmove', () => {
      this.longTouchEnd(); // end checking if touch event is long
    });

    this.stage.on('contextmenu', () => {
      this.setContextmenu();
    });

    this.stage.container().addEventListener('keyup', (e) => {
      if(e.keyCode == 37 || e.keyCode == 38 || e.keyCode == 39 || e.keyCode == 40 || e.keyCode == 221 || e.keyCode == 219)
        this.onSave();
    });
  }

  async findExistingImages() {
    this.images = this.markUpLayer.find('.Image');

    let imgsLoaded = false;
    for (let imageNode of this.images) {
      if (!imageNode.image()) {
        const attachmentId = imageNode.getAttrs().identifier;
        const mimeType = imageNode.getAttrs().mimeType;
        if (attachmentId) {
          const image = await createImgFromSrc(buildAttachmentDownloadUrl(attachmentId, mimeType));
          imageNode.image(image);
        }
      }

      this.setImageMetadata(imageNode);
      this.setClickHandler(imageNode);
      imgsLoaded = true;
    }

    if (imgsLoaded) this.markUpLayer.batchDraw();
  }

  addImage(identifier, mimeType) {
    return new Promise((resolve) => {
      KonvaImage.fromURL(buildAttachmentDownloadUrl(identifier, mimeType), (image) => {
        const imageSize = calculateNewObjectSize({
          width: this.stage.width(),
          height: this.stage.height()
        }, {
          width: image.width(),
          height: image.height()
        }, MAX_CANVAS_PERCENT);
        image.width(imageSize.width);
        image.height(imageSize.height);
        const scale = this.stage.scaleX();
        const centerCoord = calculateCenterCoordinate({
          offsetX: this.stage.offsetX(),
          width: this.stage.width(),
          offsetY: this.stage.offsetY(),
          height: this.stage.height()
        }, {
          width: image.width(),
          height: image.height()
        }, scale);

        image.setAttrs({
          name: 'Image',
          x: centerCoord.x,
          y: centerCoord.y,
          draggable: true,
          identifier,
          mimeType
        });

        this.setImageMetadata(image);
        this.setClickHandler(image);
        this.markUpLayer.add(image);
        this.currentImage = image;
        this.images.push(image);
        this.addTransformer(image);
        this.markUpLayer.draw();
        this.onSave();

        resolve();
      });
    });
  }

  setClickHandler(image) {
    image.on('click mousedown touchstart', (e) => {
      this.deactivateAllTools('ImageTool');

      if (this.currentImage && this.currentImage !== e.target) {
        this.removeTransformer(this.currentImage);
        this.currentImage = null;
      }

      this.currentImage = image;

      if (!image.transformer) {
        this.addTransformer(image);
      }
    });
  }

  setImageMetadata(image) {
    image.isImage = true;
  }

  setStageClickHandler(e) {
    EventBus.$emit('objectSeleted', e);
    if (this.images) {
      if (!e.target.isImage) {
        if (this.currentImage) {
          this.removeTransformer(this.currentImage);
          this.currentImage = null;
          this.activateLastUsedTool();
        }
      }
    }
  }

  setContextmenu(){
    if(this.currentImage)
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
    if(this.currentImage && this.timeout == null){
      this.timeout = setTimeout(() => {
          this.setContextmenu();
      }, 400);    
    }
  }

  longTouchEnd(){
    clearTimeout(this.timeout);
    this.timeout = null;
  }

  // Show layer one step top
  moveUp() {
    this.currentImage.moveUp();
    this.currentImage.transformer.moveToTop();
    this.markUpLayer.draw();
    this.focus();
  }

  // Show layer at the top all layers
  moveToTop() {
    this.currentImage.moveToTop();
    this.currentImage.transformer.moveToTop();
    this.markUpLayer.draw();
    this.focus();
  }

  // Show layer one step down
  moveDown() {
    this.currentImage.moveDown();
    this.currentImage.transformer.moveToTop();
    this.markUpLayer.draw();
    this.focus();
  }

  // Show layer at the bottom all layers
  moveToBottom() {
    this.currentImage.moveToBottom();
    this.currentImage.transformer.moveToTop();
    this.markUpLayer.draw();
    this.focus();
  }

  focus(){
    this.stage.container().tabIndex = 1;
    this.stage.container().focus();
  }

  // Move Object to Left/Right 1/5 px
  movetoLeft(xx) {
    var x = this.currentImage.x();
    this.currentImage.x(x + xx);
    this.markUpLayer.draw();
  }

  // Move Object to Top/down 1/5 px
  movetoTop(yy) {
    var y = this.currentImage.y();
    this.currentImage.y(y + yy);
    this.markUpLayer.draw();
  }

  activate() {
    this.isActive = true;
    this.focus();
  }

  deactivate() {
    this.isActive = false;

    if (this.currentImage) {
      this.removeTransformer(this.currentImage);
      this.currentImage = null;
    }
  }

  setTransformHandler(image) {
    image.on('transform', () => {
      if (image.scaleX() >= 0) {
        const currentWidth = image.width();
        image.width(currentWidth * image.scaleX());
        image.scaleX(1);
      } else {
        image.setAttrs(this.currentTransformAttributes);
      }

      if (image.scaleY() >= 0) {
        const currentHeight = image.height();
        image.height(currentHeight * image.scaleY());
        image.scaleY(1);
      } else {
        image.setAttrs(this.currentTransformAttributes);
      }

      this.currentTransformAttributes = Object.assign({}, image.getAttrs());
      this.stage.batchDraw();
    });

    image.on('transformend', () => {
      image.transformer.setAttrs({
        keepRatio: false
      });

      this.currentTransformAttributes = null;
      this.currentTransformAnchor = null;

      this.onSave();
    });

    image.on('transformstart', () => {
      this.currentTransformAttributes = Object.assign({}, image.getAttrs());
    });

    image.transformer.on('transformstart', (arg1) => {
      this.currentTransformAnchor = arg1.evt.currentTarget.attrs.name.split(' ')[0];
      if (this.currentTransformAnchor.indexOf('middle') === -1) {
        image.transformer.setAttrs({
          keepRatio: true
        });
      }
    });

    image.on('dragend', () => {
      this.onSave();
    });
  }

  addTransformer(image) {
    let transformer = new Transformer({
      node: image,
      enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'middle-left', 'middle-right'],
      keepRatio: false,
      ...anchorStyle(this.isTouchDevice)
    });
    image.transformer = transformer;
    this.setTransformHandler(image);
    this.markUpLayer.add(transformer);
    transformer.show();

    this.markUpLayer.draw();
  }

  removeTransformer(image) {
    if (image && image.transformer) {
      image.transformer.destroy();
      image.transformer = undefined;
      this.markUpLayer.draw();
    }
  }

  removeImageFromArray(image) {
    let imageIndex = -1;
    for (let i = 0; i < this.images.length; i++) {
      if (this.images[i] === image) {
        imageIndex = i;
      }
    }

    if (imageIndex >= 0) {
      this.images.splice(imageIndex, 1);
    }
  }

  removeCurrentImage() {
    if (this.currentImage) {
      this.removeImageFromArray(this.currentImage);

      this.removeTransformer(this.currentImage);
      this.currentImage.destroy();
      this.currentImage = null;
      this.markUpLayer.batchDraw();

      this.activateLastUsedTool();

      this.onSave();
    }
  }

  copyCurrentObject() {
    if (this.currentImage) {
      const newImage = this.currentImage.clone();
      return newImage.toObject();
    }

    return null;
  }

  async pasteObject(json) {
    if (this.currentImage) {
      this.deactivate();
    }

    this.deactivateAllTools(ToolNames.ImageTool);

    const newImage = Node.create(json);

    const newImageSize = calculateNewObjectSize({
      width: this.stage.width(),
      height: this.stage.height()
    }, {
      width: newImage.width(),
      height: newImage.height()
    }, Number(process.env.VUE_APP_MAX_PASTED_OBJECT_PERCENTAGE));
    const newCoord = calculateCenterCoordinate({
      offsetX: this.stage.offsetX(),
      width: this.stage.width(),
      offsetY: this.stage.offsetY(),
      height: this.stage.height()
    }, newImageSize, this.stage.scaleX());

    newImage.setAttrs({
      ...newImageSize,
      ...newCoord
    });

    this.markUpLayer.add(newImage);

    await this.findExistingImages();

    this.currentImage = newImage;
    this.addTransformer(newImage);
    this.markUpLayer.draw();

    this.onSave();
  }

  isObjectSelected() {
    return !!this.currentImage;
  }
}
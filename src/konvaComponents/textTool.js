import {Text, Transformer, Group, Rect, Node} from 'konva';
import {calculateCenterCoordinate, getScaledCoordinate} from "../utils";
import anchorStyle from "./styles/anchorStyle";
import {getTextLineThickness, textThickness} from "./styles/lineThicknes";
import {highlightedTextColor} from "./styles/color";
import textBoxWidth from "./styles/textBoxWidth";
import {ToolNames} from "../constants";
import EventBus from "../stores/eventBus";
import store from "../stores/appStore";

const SCALE_RATIO_TOLERANCE = 0.25;
const MIN_FONT_SIZE = 8;
const MAX_FONT_SIZE = 100;
const HIDE_MIDDLE_RIGHT_ANCHOR_HEIGHT = 14.5;
const HIGHLIGHT_TEXT_MARGIN = 10;
const TEXT_TOGGLE_MARGIN = 15;

export default class TextTool {
    constructor(options) {
        this.stage = options.stage;
        this.markUpLayer = options.markUpLayer;
        this.onSave = options.onSave;
        this.deactivateAllTools = options.deactivateAllTools;
        this.textGroups = [];
        this.currentTextGroup = null;
        this.currentTextNode = null;
        this.currentTextToggle = null;
        this.currentTextArea = null;
        this.currentTransformRatio = null;
        this.currentTransformAttributes = null;
        this.currentTransformAnchor = null;
        this.lineThickness = options.lineThickness;
        this.changeGlobalLineThickness = options.setLineThickness;
        this.ensureLineThicknessSet = options.ensureLineThicknessSet;
        this.color = options.color;
        this.changeGlobalColor = options.setColor;
        this.isTouchDevice = options.isTouchDevice;

        this.timeout = null; // timer to detect if touch event is long

        EventBus.$on('deleteCanvasObject', () => {
            this.removeCurrentTextGroup();
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

        this.findExistingTextGroups();
    }

    init() {
        this.findExistingTextGroups();

        this.stage.on('click touchend', (e) => {
            this.setStageClickHandler(e);
        });

        this.stage.on('contentMousedown touchstart', (e) => {
            this.longTouchStart(); // start checking if touch event is long

            if (!this.isActive || this.currentTextGroup || e.evt.button === 2) {
                return;
            }

            const pos = this.stage.getOffsetPointerPosition();
            const scaledPos = getScaledCoordinate({
                x: pos.x,
                y: pos.y,
                scale: this.stage.scaleX()
            });
            const textGroup = this.addTextBoxGroup(scaledPos);
            this.startEditing(textGroup);
        });

        this.stage.on('contentMouseup touchend', () => {
            this.longTouchEnd(); // end checking if touch event is long
        })

        this.stage.on('contentMousemove touchmove', () => {
            this.longTouchEnd(); // end checking if touch event is long
        })

        this.stage.on('contextmenu', () => {
            this.setContextmenu();
        });

        this.stage.container().addEventListener('keyup', (e) => {
          if(e.keyCode == 37 || e.keyCode == 38 || e.keyCode == 39 || e.keyCode == 40 || e.keyCode == 221 || e.keyCode == 219)
            this.onSave();
        });
    }

    findExistingTextGroups() {
        this.textGroups = this.markUpLayer.find('.TextGroup-Highlighted');
        this.textGroups.push(...this.markUpLayer.find('.TextGroup'));

        for (let textGroup of this.textGroups) {
            this.setTextGroupMetadata(textGroup);
            this.setClickHandler(textGroup);
            this.setDoubleClickHandler(textGroup);

            if (textGroup.name() === 'TextGroup-Highlighted') {
                textGroup.textStyle = 'highlighted';
            } else {
                textGroup.textStyle = 'normal';
            }
        }
    }

    removeCurrentTextGroup() {
        if (this.currentTextGroup && !this.currentTextGroup.editingMode) {
            this.removeTextGroupFromArray(this.currentTextNode);

            this.removeTransformer(this.currentTextGroup);
            this.currentTextGroup.destroy();
            this.currentTextGroup = null;
            this.currentTextNode = null;
            this.currentTextToggle = null;
            this.ensureLineThicknessSet();
            this.markUpLayer.batchDraw();

            this.onSave();
        }
    }

    removeTextGroupFromArray(textGroup) {
        let textGroupIndex = -1;
        for (let i = 0; i < this.textGroups.length; i++) {
            if (this.textGroups[i] === textGroup) {
                textGroupIndex = i;
            }
        }

        if (textGroupIndex >= 0) {
            this.textGroups.splice(textGroupIndex, 1);
        }
    }

    setContextmenu(){
        if( this.currentTextGroup) {
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
        if(this.currentTextGroup){
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
        this.currentTextGroup.moveUp();
        this.currentTextNode.transformer.moveToTop();
        this.markUpLayer.draw();
        this.focus()
    }

    // Show layer at the top all layers
    moveToTop() {
        this.currentTextGroup.moveToTop();
        this.currentTextNode.transformer.moveToTop();
        this.markUpLayer.draw();
        this.focus()
    }

    // Show layer one step down
    moveDown() {
        this.currentTextGroup.moveDown();
        this.currentTextNode.transformer.moveToTop();
        this.markUpLayer.draw();
        this.focus()
    }

    // Show layer at the bottom all layers
    moveToBottom() {
        this.currentTextGroup.moveToBottom(); 
        this.currentTextNode.transformer.moveToTop();
        this.markUpLayer.draw();
        this.focus()
    }

    // Move Object to Left/Right 1/5 px
    movetoLeft(xx) {
        let x = this.currentTextNode.x();
        this.currentTextNode.x(x + xx);

        const textBackground = this.currentTextGroup.findOne('.TextBackground');
        let backgroundX = textBackground.x()   
        textBackground.x(backgroundX + xx)  
        
        let toggleX = this.currentTextToggle.x()
        this.currentTextToggle.x(toggleX + xx)

        this.markUpLayer.draw();
        this.focus()
    }
  
    // Move Object to Top/down 1/5 px
    movetoTop(yy) {
        let y = this.currentTextNode.y();
        this.currentTextNode.y(y + yy);

        const textBackground = this.currentTextGroup.findOne('.TextBackground');
        let backgroundY = textBackground.y()   
        textBackground.y(backgroundY + yy)  
        
        let toggleY = this.currentTextToggle.y()
        this.currentTextToggle.y(toggleY + yy)

        this.markUpLayer.draw();
        this.focus()
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

        this.removeTransformer(this.currentTextGroup);
        this.stopEditing();
        this.currentTextNode = null;
        this.currentTextGroup = null;
        this.ensureLineThicknessSet();
    }

    stopEditing() {
        let saveRequired = false;
        if (this.currentTextArea) {
            if (this.currentTextArea.parentNode) {
                this.currentTextArea.parentNode.removeChild(this.currentTextArea);
            }

            saveRequired = true;

            this.currentTextArea = null;
        }

        if (this.currentTextNode) {
            this.currentTextGroup.editingMode = false;

            if (this.currentTextNode.text() === '') {
                this.removeCurrentTextGroup();
            } else {
                this.currentTextNode.show();
            }
        }

        this.markUpLayer.batchDraw();

        if (saveRequired) this.onSave();
    }

    addTextBoxGroup(pos) {
        this.deactivateAllTools('TextTool');
        const textGroup = new Group({
            name: 'TextGroup-Highlighted'
        });
        textGroup.textStyle = 'highlighted';
        let textNode = new Text({
            name: 'TextNode',
            text: '',
            x: pos.x,
            y: pos.y,
            draggable: true,
            fontFamily: 'Source Sans Pro',
            fontStyle: 'bold',
            lineHeight: 1.1,
            ...textThickness[this.lineThickness],
            ...textBoxWidth[this.lineThickness],
            ...this.getColorAttributes(this.color, textGroup.textStyle).text
        });
        textGroup.add(textNode);

        if (textGroup.textStyle === 'highlighted') {
            let textBackground = new Rect({
                name: 'TextBackground',
                x: textNode.getAttrs().x - HIGHLIGHT_TEXT_MARGIN,
                y: textNode.getAttrs().y - HIGHLIGHT_TEXT_MARGIN,
                width: textGroup.width() + (HIGHLIGHT_TEXT_MARGIN * 2),
                height: textGroup.height() + (HIGHLIGHT_TEXT_MARGIN * 2),
                opacity: 1,
                cornerRadius: 2,
                ...this.getColorAttributes(this.color, textGroup.textStyle).rect
            });
            textGroup.add(textBackground);

            textNode.zIndex(1);
            textBackground.zIndex(0);
        }

        this.markUpLayer.add(textGroup);
        this.setTextGroupMetadata(textGroup);
        this.setClickHandler(textGroup);
        this.setDoubleClickHandler(textGroup);
        this.addTransformer(textGroup);
        this.recalculateTextGroupRect(textGroup);
        this.currentTextGroup = textGroup;
        this.currentTextNode = textNode;
        this.textGroups.push(textNode);
        return textGroup;
    }

    setTextGroupMetadata(textGroup) {
        textGroup.isTextGroup = true;
    }

    addTransformer(textGroup) {
        const textNode = textGroup.findOne('.TextNode');
        const localTextLineThickness = getTextLineThickness(textNode.getAttrs());
        if(localTextLineThickness) this.changeGlobalLineThickness(localTextLineThickness);
        this.changeGlobalColor(this.getTextGroupColor(textGroup));
        
        const scaledHeight = textNode.height() * this.stage.scaleX();
        const shouldHideMiddleRightAnchor = scaledHeight <= HIDE_MIDDLE_RIGHT_ANCHOR_HEIGHT;
        let transformer = new Transformer({
            node: textNode,
            enabledAnchors: shouldHideMiddleRightAnchor ? ['middle-left', 'bottom-right'] : ['middle-left', 'middle-right', 'bottom-right'],
            padding: HIGHLIGHT_TEXT_MARGIN,
            ...anchorStyle(this.isTouchDevice)
        });
        textNode.transformer = transformer;
        this.setTransformHandler(textGroup);
        this.markUpLayer.add(transformer);
        transformer.show();

        const textToggle = this.createTextToggle(textGroup);
        textGroup.add(textToggle);
        this.currentTextToggle = textToggle;
        this.recalculateTextGroupRect(textGroup);

        this.markUpLayer.draw();
    }

    removeTransformer(textGroup) {
        if (textGroup) {
            const textToggle = textGroup.findOne('.TextToggle');
            if (textToggle) {
                textToggle.destroy();
            }

            const textNode = textGroup.findOne('.TextNode');
            if (textNode && textNode.transformer) {
                textNode.transformer.destroy();
                textNode.transformer = undefined;
                this.markUpLayer.draw();
            }
        }
    }

    setClickHandler(textGroup) {
        textGroup.on('click mousedown touchstart', (e) => {
            this.deactivateAllTools('TextTool');

            if (this.currentTextGroup && this.currentTextGroup !== e.target) {
                this.removeTransformer(this.currentTextGroup);
                this.stopEditing();
                this.currentTextGroup = null;
                this.currentTextNode = null;
                this.currentTextToggle = null;
                this.ensureLineThicknessSet();
            }

            if (!textGroup.transformer) {
                this.addTransformer(textGroup);
            }

            this.currentTextGroup = textGroup;
            this.currentTextNode = textGroup.findOne('.TextNode');
        });
    }

    setStageClickHandler(e) {
        EventBus.$emit('objectSeleted', e);
        if (this.textGroups) {
            if (!(e.target.parent && e.target.parent.isTextGroup)) {
                if (this.currentTextGroup) {
                    this.removeTransformer(this.currentTextGroup);
                    this.stopEditing();
                    this.currentTextNode = null;
                    this.currentTextGroup = null;
                    this.currentTextToggle = null;
                    this.ensureLineThicknessSet();
                }
            }
        }
    }

    startEditing(textGroup) {
        let textNode = textGroup.findOne('.TextNode');
        // hide text node and transformer:
        textNode.hide();
        textGroup.editingMode = true;
        this.currentTextNode = textNode;
        this.removeTransformer(textGroup);
        this.markUpLayer.draw();

        // create textarea over canvas with absolute position
        // first we need to find position for textarea
        // how to find it?

        // at first lets find position of text node relative to the stage:
        const textPosition = textNode.absolutePosition();

        // then lets find position of stage container on the page:
        const stageBox = this.stage.container().getBoundingClientRect();

        const viewport = document.documentElement;
        const container = document.getElementById('markup-scroll-wrapper-contents');
        // so position of textarea will be the sum of positions above:
        const areaPosition = {
            x: (stageBox.left + viewport.scrollLeft - container.getBoundingClientRect().x) + textPosition.x,
            y: (stageBox.top + viewport.scrollTop - container.getBoundingClientRect().y) + textPosition.y
        };

        // create textarea and style it
        const textarea = document.createElement('textarea');
        container.appendChild(textarea);
        this.currentTextArea = textarea;
        this.currentTextArea.isTextNode = true;

        const setTextAreaWidth = () => {
            const scale = textNode.getAbsoluteScale().x;
            let newWidth = textNode.width() * scale;

            if (!newWidth) {
                // set width for placeholder
                newWidth = textNode.placeholder.length * textNode.fontSize();
            }
            // some extra fixes on different browsers
            const isSafari = /^((?!chrome|android).)*safari/i.test(
              navigator.userAgent
            );
            const isFirefox =
              navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
            if (isSafari || isFirefox) {
                newWidth = Math.ceil(newWidth);
            }

            const isEdge =
              document.documentMode || /Edge/.test(navigator.userAgent);
            if (isEdge) {
                newWidth += 1;
            }
            textarea.style.width = newWidth + 'px';
        };

        const setTextAreaHeight = () => {
            const scale = textNode.getAbsoluteScale().x;
            const textAreaHeight = textNode.height() * scale;
            if (textarea.style.height !== textAreaHeight + 'px') {
                textarea.style.height = textAreaHeight + 'px';
            }
        };

        const scale = textNode.getAbsoluteScale().x;

        const setTextAreaFontSize = () => {
            textarea.style.fontSize = textNode.fontSize() * scale + 'px';
        };

        const setTextAreaFontColor = () => {
            textarea.style.borderColor = this.getCurrentColorAttributes().text.fill;
            textarea.style.color = this.getCurrentColorAttributes().text.fill;
        };

        // apply many styles to match text on canvas as close as possible
        // remember that text rendering on canvas and on the textarea can be different
        // and sometimes it is hard to make it 100% the same. But we will try...
        textarea.value = textNode.text();
        textarea.style.position = 'absolute';
        textarea.style.top = areaPosition.y + 'px';
        textarea.style.left = areaPosition.x + 'px';
        setTextAreaWidth();
        setTextAreaHeight();
        setTextAreaFontSize();
        setTextAreaFontColor();
        textarea.recalcHeight = () => {
            setTextAreaHeight();
        };
        textarea.setFontSize = () => {
            setTextAreaFontSize();
        };
        textarea.setFontColor = () => {
            setTextAreaFontColor();
        };
        textarea.setBorder = () => {
            if (textGroup.textStyle === 'highlighted') {
                textarea.style.border = 'none';
            } else {
                textarea.style.border = 'solid';
            }
        };
        textarea.setBorder();
        textarea.style.borderWidth = '2px';
        textarea.style.borderRadius = '2px';
        textarea.style.borderColor = this.getCurrentColorAttributes().text.fill;
        textarea.style.overflow = 'hidden';
        textarea.style.background = 'none';
        textarea.style.outline = 'none';
        textarea.style.resize = 'none';
        textarea.style.fontWeight = 'Bold';
        textarea.style.lineHeight = textNode.lineHeight();
        textarea.style.fontFamily = textNode.fontFamily();
        textarea.style.transformOrigin = 'left top';
        textarea.style.textAlign = textNode.align();
        textarea.style.color = this.getCurrentColorAttributes().text.fill;
        let rotation = textNode.rotation();
        let transform = '';
        if (rotation) {
            transform += 'rotateZ(' + rotation + 'deg)';
        }

        let px = 0;
        // also we need to slightly move textarea on firefox
        // because it jumps a bit
        const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1; // Take out of here
        if (isFirefox) {
            px += 2 + Math.round(textNode.fontSize() / 20);
        }
        transform += 'translateY(-' + px + 'px)';
        textarea.style.transform = transform;

        setTimeout(() => {
            textarea.focus();
        }, 10);

        textarea.addEventListener('keydown', (e) => {
            // on escape
            if (e.keyCode === 27) {
                this.stopEditing();
            }
        });

        textarea.addEventListener('input', () => {
            textNode.text(textarea.value);
            setTextAreaHeight();
            this.recalculateTextGroupRect(textGroup);
        });
    }

    setDoubleClickHandler(textGroup) {
        textGroup.on('dblclick dbltap', () => {
            this.startEditing(textGroup);
        });
    }

    setTransformHandler(textGroup) {
        const textNode = textGroup.findOne('.TextNode');
        textNode.on('transform', () => {
            const scaleX = textNode.scaleX();

            if (this.currentTransformAnchor === 'bottom-right') {
                let newFontSize = textNode.fontSize() * scaleX;
                if (newFontSize < MIN_FONT_SIZE) {
                    newFontSize = MIN_FONT_SIZE;
                } else if (newFontSize > MAX_FONT_SIZE) {
                    newFontSize = MAX_FONT_SIZE;
                }

                textNode.setAttrs({
                    width: textNode.width() * scaleX,
                    fontSize: newFontSize,
                    scaleX: 1,
                    scaleY: 1
                });
                
                const localTextLineThickness = getTextLineThickness(textNode.getAttrs());
                if(localTextLineThickness) this.changeGlobalLineThickness(localTextLineThickness);

                const newTransformRatio = textNode.width() / textNode.height();
                if (!(this.currentTransformRatio - SCALE_RATIO_TOLERANCE < newTransformRatio && this.currentTransformRatio + SCALE_RATIO_TOLERANCE > newTransformRatio)) {
                    textNode.setAttrs(this.currentTransformAttributes);
                }
            } else if (this.currentTransformAnchor.indexOf('middle') > -1) {
                textNode.setAttrs({
                    width: textNode.width() * scaleX,
                    scaleX: 1,
                    scaleY: 1
                });

                if (textNode.width() <= textNode.fontSize()) {
                    textNode.setAttrs(this.currentTransformAttributes);
                }
            }

            const scaledHeight = textNode.height() * this.stage.scaleX();
            let shouldHideMiddleRightAnchor = scaledHeight <= HIDE_MIDDLE_RIGHT_ANCHOR_HEIGHT;
            textNode.transformer.setAttrs({
                enabledAnchors: shouldHideMiddleRightAnchor ? ['middle-left', 'bottom-right'] : ['middle-left', 'middle-right', 'bottom-right']
            });

            this.recalculateTextGroupRect(textGroup);

            this.currentTransformAttributes = Object.assign({}, textNode.getAttrs());
        });

        textNode.on('transformend', () => {
            this.currentTransformRatio = null;
            this.currentTransformAttributes = null;
            this.currentTransformAnchor = null;

            this.onSave();
        });

        textNode.on('transformstart', () => {
            this.currentTransformRatio = textNode.width() / textNode.height();
            this.currentTransformAttributes = Object.assign({}, textNode.getAttrs());
        });

        textNode.on('dragmove', () => {
           this.recalculateTextGroupRect(textGroup);
        });

        textNode.on('dragend', () => {
            this.onSave();
        });

        textNode.transformer.on('transformstart', (arg1) => {
            this.currentTransformAnchor = arg1.evt.currentTarget.attrs.name.split(' ')[0];
        });
    }

    setLineThickness(lineThickness) {
        if (!lineThickness) {
            return;
        }

        this.lineThickness = lineThickness;
        const newTextThickness = textThickness[this.lineThickness];

        if (this.isActive && this.currentTextNode && this.currentTextNode.getAttrs().fontSize !== newTextThickness.fontSize) {
            this.currentTextNode.setAttrs(newTextThickness);
            this.markUpLayer.draw();
            this.recalculateTextGroupRect(this.currentTextGroup);
            this.onSave();
        }

        if (this.currentTextArea) {
            this.currentTextArea.recalcHeight();
            this.currentTextArea.setFontSize();
        }
    }

    setColor(color) {
        this.color = color;

        if (this.currentTextGroup && this.getCurrentColor() !== this.color) {
            this.currentTextNode.setAttrs(this.getColorAttributes(this.color, this.currentTextGroup.textStyle).text);

            if (this.currentTextGroup.textStyle === 'highlighted') {
                const textBackground = this.currentTextGroup.findOne('.TextBackground');
                textBackground.setAttrs(this.getColorAttributes(this.color, this.currentTextGroup.textStyle).rect);
            }

            this.updateTextToggleColor();

            this.markUpLayer.draw();
            this.onSave();
        }

        if (this.currentTextArea && this.currentTextArea.style.color !== this.color) {
            this.currentTextArea.setFontColor();
        }
    }

    updateTextToggleColor() {
        if (!this.currentTextToggle || !this.currentTextGroup) {
            return;
        }

        const rect = this.currentTextToggle.findOne('.TextToggleBox');
        const text = this.currentTextToggle.findOne('.TextToggleText');

        if (!rect || !text) return;

        let rectColorAttributes = {};

        if (this.currentTextGroup.textStyle === 'highlighted') {
            rectColorAttributes = this.getColorAttributes(this.color, this.currentTextGroup.textStyle).rect;
            rectColorAttributes.strokeWidth = 0;
        } else {
            rectColorAttributes = {
                stroke: this.color,
                strokeWidth: 2
            };
        }

        rect.setAttrs(rectColorAttributes);

        let colorAttributes = this.getColorAttributes(this.color, this.currentTextGroup.textStyle).text;
        text.setAttrs(colorAttributes);
    }

    recalculateTextGroupRect(textGroup) {
        const rect = textGroup.findOne('.TextBackground');
        const textNode = textGroup.findOne('.TextNode');
        const textNodeAttrs = textNode.getAttrs();
        const rotation = textNode.rotation() === undefined ? 0 : textNode.rotation();

        if (rect) {
            const rectAttrs = rect.getAttrs();

            if (rectAttrs.width !== textNode.width()
              || rectAttrs.height !== textNode.height()
              || rect.rotation() !== textNode.rotation()
              || rectAttrs.x !== textNodeAttrs.x
              || rectAttrs.y !== textNodeAttrs.y) {
                const xMargin = HIGHLIGHT_TEXT_MARGIN * Math.cos(rotation * Math.PI / 180) - HIGHLIGHT_TEXT_MARGIN * Math.sin(rotation * Math.PI / 180);
                const yMargin = HIGHLIGHT_TEXT_MARGIN * Math.sin(rotation * Math.PI / 180) + HIGHLIGHT_TEXT_MARGIN * Math.cos(rotation * Math.PI / 180);
                rect.setAttrs({
                    x: textNodeAttrs.x + xMargin * -1,
                    y: textNodeAttrs.y + yMargin * -1,
                    width: textNode.width() + (HIGHLIGHT_TEXT_MARGIN * 2),
                    height: textNode.height() + (HIGHLIGHT_TEXT_MARGIN * 2),
                    rotation: textNode.rotation()
                });
            }
        }

        const toggleGroup = textGroup.findOne('.TextToggle');
        if (toggleGroup) {
            const pixelMargin = TEXT_TOGGLE_MARGIN / this.stage.scaleX();
            const anchorPoint = {
                x: textNodeAttrs.x + (textNode.width() / 2 - pixelMargin) * Math.cos(rotation * Math.PI / 180) + (textNode.height() + pixelMargin) * Math.sin(-rotation * Math.PI / 180),
                y: textNodeAttrs.y + (textNode.height() + pixelMargin) * Math.cos(rotation * Math.PI / 180) + (textNode.width() / 2 - pixelMargin) * Math.sin(rotation * Math.PI / 180)
            };

            toggleGroup.setAttrs({
                x: anchorPoint.x,
                y: anchorPoint.y,
                rotation: textNode.rotation()
            });
        }

        this.markUpLayer.draw();
    }

    getCurrentColorAttributes() {
        return this.getColorAttributes(this.color, this.currentTextGroup.textStyle);
    }

    getColorAttributes(color, textStyle) {
        if (textStyle === 'highlighted') {
            return {
                text: {
                    fill: highlightedTextColor[color].fontColor
                },
                rect: {
                    fill: highlightedTextColor[color].backgroundColor
                }
            };
        } else {
            return {
                text: {
                    fill: color
                }
            };
        }
    }

    getCurrentColor() {
        if (this.currentTextGroup) {
            return this.getTextGroupColor(this.currentTextGroup);
        }

        return null;
    }

    getTextGroupColor(textGroup) {
        if (textGroup.textStyle === 'highlighted') {
            const textBackground = textGroup.findOne('Rect');
            return textBackground.getAttrs().fill;
        }

        const textNode = textGroup.findOne('Text');
        return textNode.getAttrs().fill;
    }

    createTextToggle(textGroup) {
        const existingToggleGroup = textGroup.findOne('.TextToggle');
        if (existingToggleGroup) existingToggleGroup.destroy();

        const textNode = textGroup.findOne('.TextNode');
        const color = this.getTextGroupColor(textGroup);
        const inverseScale = 1 / this.stage.scaleX();
        const pixelMargin = TEXT_TOGGLE_MARGIN / this.stage.scaleX();

        let toggleGroup = new Group({
            name: 'TextToggle',
            draggable: false,
            x: textNode.getAttrs().x + textNode.width() / 2 - pixelMargin,
            y: textNode.getAttrs().y + textNode.height() + pixelMargin,
            width: 30,
            height: 30,
            scaleX: inverseScale,
            scaleY: inverseScale
        });
        let rectColorAttributes = {};

        if (textGroup.textStyle === 'highlighted') {
            rectColorAttributes = this.getColorAttributes(color, textGroup.textStyle).rect;
            rectColorAttributes.strokeWidth = 0;
        } else {
            rectColorAttributes = {
                stroke: color,
                strokeWidth: 2
            };
        }

        let rect = new Rect({
            name: 'TextToggleBox',
            width: 30,
            height: 30,
            opacity: 1,
            cornerRadius: 2,
            ...rectColorAttributes
        });

        toggleGroup.add(rect);

        let colorAttributes = this.getColorAttributes(color, textGroup.textStyle).text;

        const toggleTextNode = new Text({
            name: 'TextToggleText',
            text: 'Aa',
            x: 6,
            y: 6,
            draggable: true,
            width: 30,
            fontFamily: 'Source Sans Pro',
            fontStyle: 'bold',
            lineHeight: 1.25,
            fontSize: 16,
            ...colorAttributes
        });

        toggleGroup.on('click mousedown touchstart', () => {
          this.textToggleClicked(toggleGroup);
        });

        toggleGroup.add(toggleTextNode);
        return toggleGroup;
    }

    textToggleClicked() {
        if (this.currentTextGroup.textStyle === 'highlighted') {
            const textBackground = this.currentTextGroup.findOne('.TextBackground');
            textBackground.destroy();
            this.currentTextGroup.textStyle = 'normal';
            this.currentTextNode.setAttrs(this.getColorAttributes(this.color, this.currentTextGroup.textStyle).text);
            this.updateTextToggleColor();
            this.currentTextGroup.name('TextGroup');
            this.markUpLayer.draw();
        } else {
            this.currentTextGroup.textStyle = 'highlighted';
            const textBackground = new Rect({
                name: 'TextBackground',
                opacity: 1,
                cornerRadius: 2,
                ...this.getColorAttributes(this.color, this.currentTextGroup.textStyle).rect
            });
            this.currentTextGroup.add(textBackground);
            this.currentTextNode.zIndex(1);
            textBackground.zIndex(0);
            this.currentTextNode.setAttrs(this.getColorAttributes(this.color, this.currentTextGroup.textStyle).text);
            this.recalculateTextGroupRect(this.currentTextGroup);
            this.updateTextToggleColor();
            this.currentTextGroup.name('TextGroup-Highlighted');
            this.markUpLayer.draw();
        }

        this.onSave();
    }

    copyCurrentObject() {
        if (this.currentTextGroup) {
            const newTextGroup = this.currentTextGroup.clone();
            const newTextToggle = newTextGroup.findOne('.TextToggle');
            if (newTextToggle) newTextToggle.destroy();

            return newTextGroup.toObject();
        }

        return null;
    }

    pasteObject(json) {
        if (this.currentTextGroup) {
            this.deactivate();
        }

        this.deactivateAllTools(ToolNames.TextTool);

        const newTextGroup = Node.create(json);
        const newTextNode = newTextGroup.findOne('.TextNode');
        this.markUpLayer.add(newTextGroup);
        this.setTextGroupMetadata(newTextGroup);
        this.setClickHandler(newTextGroup);
        this.setDoubleClickHandler(newTextGroup);

        if (newTextGroup.name() === 'TextGroup-Highlighted') {
            newTextGroup.textStyle = 'highlighted';
        } else {
            newTextGroup.textStyle = 'normal';
        }

        const newCoord = calculateCenterCoordinate({
            offsetX: this.stage.offsetX(),
            offsetY: this.stage.offsetY(),
            width: this.stage.width(),
            height: this.stage.height()
        }, {
            width: newTextNode.width(),
            height: newTextNode.height()
        }, this.stage.scaleX());

        newTextNode.setAttrs({
            ...newCoord
        });

        this.currentTextGroup = newTextGroup;
        this.currentTextNode = newTextNode;
        this.textGroups.push(newTextGroup);
        this.addTransformer(newTextGroup);
        this.markUpLayer.draw();

        this.onSave();
    }

    isObjectSelected() {
        return !!this.currentTextGroup;
    }

    isEditing() {
        return this.currentTextGroup && this.currentTextGroup.editingMode;
    }
}
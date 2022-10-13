import {Text, Transformer, Group, Rect, Node} from 'konva';
import {calculateCenterCoordinate} from "../utils";
import anchorStyle from "./styles/anchorStyle";
import {getTextLineThickness, textThickness} from "./styles/lineThicknes";
import {signTextColor} from "./styles/color";
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

export default class SignatureTool {
    constructor(options) {
        this.stage = options.stage;
        this.markUpLayer = options.markUpLayer;
        this.onSave = options.onSave;
        this.deactivateAllTools = options.deactivateAllTools;
        this.SignatureGroups = [];
        this.currentSignatureGroup = null;
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
            this.removeCurrentSignatureGroup();
        });
        EventBus.$on('moveCanvasObjecttoLeft', (x) => {
          this.movetoLeft(x);
        });
        EventBus.$on('moveCanvasObjecttoDown', (y) => {
          this.movetoTop(y);
        });
        EventBus.$on('moveDownCurrentObject', ()=> {
          if(this.currentSignatureGroup){
            this.moveDown();
          }
        });
        EventBus.$on('moveUpCurrentObject', () => {
          if(this.currentSignatureGroup){
            this.moveUp();
          }
        });
        EventBus.$on('moveToTopObject', () => {
          if(this.currentSignatureGroup){
            this.moveToTop();
          }
        });
        EventBus.$on('moveToBottomObject', () => {
          if(this.currentSignatureGroup){
            this.moveToBottom();
          }
        });
    }

    setStage(stage, markUpLayer) {
        this.stage = stage;
        this.markUpLayer = markUpLayer;

        this.findExistingSignatureGroups();
    }

    init() {
        this.findExistingSignatureGroups();

        document.fonts.onloadingdone = () => { //re-draw once font faces are loaded to display correct fontFamily
            this.stage.batchDraw()
        };

        this.stage.on('click touchend', (e) => {
            this.setStageClickHandler(e);
        });

        EventBus.$on('setSignature', (fontObj) => {
            const pos = this.stage.getContainer().getBoundingClientRect();
            const scaledPos = {
                x: pos.width/2,
                y: pos.height/2,
            };
            
            const SignatureGroup = this.addTextBoxGroup(scaledPos, fontObj);
            this.startEditing(SignatureGroup);
            this.stopEditing();
        });

        this.stage.on('contentMousedown touchstart', (e) => {
            this.longTouchStart(); // start checking if touch event is long

            if (!this.isActive || this.currentSignatureGroup || e.evt.button === 2) {
                return;
            }
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

    findExistingSignatureGroups() {
        this.SignatureGroups = this.markUpLayer.find('.SignatureGroup-Highlighted');
        this.SignatureGroups.push(...this.markUpLayer.find('.SignatureGroup'));

        for (let SignatureGroup of this.SignatureGroups) {
            this.setSignatureGroupMetadata(SignatureGroup);
            this.setClickHandler(SignatureGroup);
            // this.setDoubleClickHandler(SignatureGroup);

            if (SignatureGroup.name() === 'SignatureGroup-Highlighted') {
                SignatureGroup.textStyle = 'highlighted';
            } else {
                SignatureGroup.textStyle = 'normal';
            }
        }
    }

    removeCurrentSignatureGroup() {
        if (this.currentSignatureGroup && !this.currentSignatureGroup.editingMode) {
            this.removeSignatureGroupFromArray(this.currentTextNode);

            this.removeTransformer(this.currentSignatureGroup);
            this.currentSignatureGroup.destroy();
            this.currentSignatureGroup = null;
            this.currentTextNode = null;
            this.currentTextToggle = null;
            this.ensureLineThicknessSet();
            this.markUpLayer.batchDraw();

            this.onSave();
        }
    }

    removeSignatureGroupFromArray(SignatureGroup) {
        let SignatureGroupIndex = -1;
        for (let i = 0; i < this.SignatureGroups.length; i++) {
            if (this.SignatureGroups[i] === SignatureGroup) {
                SignatureGroupIndex = i;
            }
        }

        if (SignatureGroupIndex >= 0) {
            this.SignatureGroups.splice(SignatureGroupIndex, 1);
        }
    }

    setContextmenu(){
        if( this.currentSignatureGroup) {
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
        if(this.currentSignatureGroup){
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
        this.currentSignatureGroup.moveUp();
        this.currentTextNode.transformer.moveToTop();
        this.markUpLayer.draw();
        this.focus()
    }

    // Show layer at the top all layers
    moveToTop() {
        this.currentSignatureGroup.moveToTop();
        this.currentTextNode.transformer.moveToTop();
        this.markUpLayer.draw();
        this.focus()
    }

    // Show layer one step down
    moveDown() {
        this.currentSignatureGroup.moveDown();
        this.currentTextNode.transformer.moveToTop();
        this.markUpLayer.draw();
        this.focus()
    }

    // Show layer at the bottom all layers
    moveToBottom() {
        this.currentSignatureGroup.moveToBottom();
        this.currentTextNode.transformer.moveToTop();
        this.markUpLayer.draw();
        this.focus()
    }

    // Move Object to Left/Right 1/5 px
    movetoLeft(xx) {
        let x = this.currentTextNode.x();
        this.currentTextNode.x(x + xx);

        const textBackground = this.currentSignatureGroup.findOne('.TextBackground');
        let backgroundX = textBackground.x()   
        textBackground.x(backgroundX + xx)    

        this.markUpLayer.draw();
        this.focus()
    }
  
    // Move Object to Top/down 1/5 px
    movetoTop(yy) {
        let y = this.currentTextNode.y();
        this.currentTextNode.y(y + yy);

        const textBackground = this.currentSignatureGroup.findOne('.TextBackground');
        let backgroundY = textBackground.y()   
        textBackground.y(backgroundY + yy)   

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

        this.removeTransformer(this.currentSignatureGroup);
        this.stopEditing();
        this.currentTextNode = null;
        this.currentSignatureGroup = null;
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
            this.currentSignatureGroup.editingMode = false;

            if (this.currentTextNode.text() === '') {
                this.removeCurrentSignatureGroup();
            } else {
                this.currentTextNode.show();
            }
        }

        this.markUpLayer.batchDraw();

        if (saveRequired) this.onSave();
    }

    addTextBoxGroup(pos, fontObj) {
        this.deactivateAllTools('SignatureTool');
        const SignatureGroup = new Group({
            name: 'SignatureGroup-Highlighted'
        });
        SignatureGroup.textStyle = 'highlighted';
        let textNode = new Text({
            name: 'TextNode',
            text: fontObj.text,
            x: pos.x,
            y: pos.y,
            draggable: true,
            fontFamily: fontObj.font,
            fontSize: 40, // set default font size
            fontStyle: 'bold',
            lineHeight: 1.1,
            // ...textThickness[this.lineThickness], //set font size depends on selected this.lineThickness
            ...textBoxWidth[this.lineThickness],
            ...this.getColorAttributes(this.color, SignatureGroup.textStyle).text
        });

        textNode.x(textNode.x() - (textNode.getClientRect().width / 2)) // correcting position to place on the center of canvas
        textNode.y(textNode.y() - (textNode.getClientRect().height / 2)) // correcting position to place on the center of canvas

        SignatureGroup.add(textNode);
        if (SignatureGroup.textStyle === 'highlighted') {
            let textBackground = new Rect({
                name: 'TextBackground',
                x: textNode.getAttrs().x - HIGHLIGHT_TEXT_MARGIN,
                y: textNode.getAttrs().y - HIGHLIGHT_TEXT_MARGIN,
                width: SignatureGroup.width() + (HIGHLIGHT_TEXT_MARGIN * 2),
                height: SignatureGroup.height() + (HIGHLIGHT_TEXT_MARGIN * 2),
                opacity: 1,
                cornerRadius: 2,
                ...this.getColorAttributes(this.color, SignatureGroup.textStyle).rect
            });
            SignatureGroup.add(textBackground);

            textNode.zIndex(1);
            textBackground.zIndex(0);
        }

        this.markUpLayer.add(SignatureGroup);
        this.setSignatureGroupMetadata(SignatureGroup);
        this.setClickHandler(SignatureGroup);
        // this.setDoubleClickHandler(SignatureGroup);
        this.addTransformer(SignatureGroup);
        this.recalculateSignatureGroupRect(SignatureGroup);
        this.currentSignatureGroup = SignatureGroup;
        this.currentTextNode = textNode;
        this.SignatureGroups.push(textNode);
        return SignatureGroup;
    }

    setSignatureGroupMetadata(SignatureGroup) {
        SignatureGroup.isSignatureGroup = true;
    }

    addTransformer(SignatureGroup) {
        const textNode = SignatureGroup.findOne('.TextNode');
        const localTextLineThickness = getTextLineThickness(textNode.getAttrs());
        if(localTextLineThickness) this.changeGlobalLineThickness(localTextLineThickness);
        this.changeGlobalColor(this.getSignatureGroupColor(SignatureGroup));

        const scaledHeight = textNode.height() * this.stage.scaleX();
        const shouldHideMiddleRightAnchor = scaledHeight <= HIDE_MIDDLE_RIGHT_ANCHOR_HEIGHT;
        let transformer = new Transformer({
            node: textNode,
            enabledAnchors: shouldHideMiddleRightAnchor ? ['middle-left', 'bottom-right'] : ['middle-left', 'middle-right', 'bottom-right'],
            padding: HIGHLIGHT_TEXT_MARGIN,
            ...anchorStyle(this.isTouchDevice)
        });
        textNode.transformer = transformer;
        this.setTransformHandler(SignatureGroup);
        this.markUpLayer.add(transformer);
        transformer.show();

        this.markUpLayer.draw();
    }

    removeTransformer(SignatureGroup) {
        if (SignatureGroup) {
            const textToggle = SignatureGroup.findOne('.TextToggle');
            if (textToggle) {
                textToggle.destroy();
            }

            const textNode = SignatureGroup.findOne('.TextNode');
            if (textNode && textNode.transformer) {
                textNode.transformer.destroy();
                textNode.transformer = undefined;
                this.markUpLayer.draw();
            }
        }
    }

    setClickHandler(SignatureGroup) {
        SignatureGroup.on('click mousedown touchstart', (e) => {
            this.deactivateAllTools('SignatureTool');

            if (this.currentSignatureGroup && this.currentSignatureGroup !== e.target) {
                this.removeTransformer(this.currentSignatureGroup);
                this.stopEditing();
                this.currentSignatureGroup = null;
                this.currentTextNode = null;
                this.currentTextToggle = null;
                this.ensureLineThicknessSet();
            }

            if (!SignatureGroup.transformer) {
                this.addTransformer(SignatureGroup);
            }

            this.currentSignatureGroup = SignatureGroup;
            this.currentTextNode = SignatureGroup.findOne('.TextNode');
        });
    }

    setStageClickHandler(e) {
        EventBus.$emit('objectSeleted', e);
        if (this.SignatureGroups) {
            if (!(e.target.parent && e.target.parent.isSignatureGroup)) {
                if (this.currentSignatureGroup) {
                    this.removeTransformer(this.currentSignatureGroup);
                    this.stopEditing();
                    this.currentTextNode = null;
                    this.currentSignatureGroup = null;
                    this.currentTextToggle = null;
                    this.ensureLineThicknessSet();
                }
            }
        }
    }

    startEditing(SignatureGroup) {
        let textNode = SignatureGroup.findOne('.TextNode');
        // hide text node and transformer:
        textNode.hide();
        SignatureGroup.editingMode = true;
        this.currentTextNode = textNode;
        this.removeTransformer(SignatureGroup);
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
            if (SignatureGroup.textStyle === 'highlighted') {
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
            this.recalculateSignatureGroupRect(SignatureGroup);
        });
    }

    setDoubleClickHandler(SignatureGroup) {
        SignatureGroup.on('dblclick dbltap', () => {
            this.startEditing(SignatureGroup);
        });
    }

    setTransformHandler(SignatureGroup) {
        const textNode = SignatureGroup.findOne('.TextNode');
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

            this.recalculateSignatureGroupRect(SignatureGroup);

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
           this.recalculateSignatureGroupRect(SignatureGroup);
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
            this.recalculateSignatureGroupRect(this.currentSignatureGroup);
            this.onSave();
        }

        if (this.currentTextArea) {
            this.currentTextArea.recalcHeight();
            this.currentTextArea.setFontSize();
        }
    }

    setColor(color) {
        this.color = color;

        if (this.currentSignatureGroup && this.getCurrentColor() !== this.color) {
            console.log(this.color,'this color')
            this.currentTextNode.setAttrs(this.getColorAttributes(this.color, this.currentSignatureGroup.textStyle).text);

            if (this.currentSignatureGroup.textStyle === 'highlighted') {
                const textBackground = this.currentSignatureGroup.findOne('.TextBackground');
                textBackground.setAttrs(this.getColorAttributes(this.color, this.currentSignatureGroup.textStyle).rect);
            }

            this.markUpLayer.draw();
            this.onSave();
        }

        if (this.currentTextArea && this.currentTextArea.style.color !== this.color) {
            this.currentTextArea.setFontColor();
        }
    }

    recalculateSignatureGroupRect(SignatureGroup) {
        const rect = SignatureGroup.findOne('.TextBackground');
        const textNode = SignatureGroup.findOne('.TextNode');
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

        const toggleGroup = SignatureGroup.findOne('.TextToggle');
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
        return this.getColorAttributes(this.color, this.currentSignatureGroup.textStyle);
    }

    getColorAttributes(color, textStyle) {
        if (textStyle === 'highlighted') {
            return {
                text: {
                    fill: signTextColor[color].fontColor
                },
                rect: {
                    fill: signTextColor[color].backgroundColor
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
        if (this.currentSignatureGroup) {
            return this.getSignatureGroupColor(this.currentSignatureGroup);
        }

        return null;
    }

    getSignatureGroupColor(SignatureGroup) {
        if (SignatureGroup.textStyle === 'highlighted') {
            const textBackground = SignatureGroup.findOne('Rect');
            return textBackground.getAttrs().fill;
        }

        const textNode = SignatureGroup.findOne('Text');
        return textNode.getAttrs().fill;
    }

    copyCurrentObject() {
        if (this.currentSignatureGroup) {
            const newSignatureGroup = this.currentSignatureGroup.clone();
            const newTextToggle = newSignatureGroup.findOne('.TextToggle');
            if (newTextToggle) newTextToggle.destroy();

            return newSignatureGroup.toObject();
        }

        return null;
    }

    pasteObject(json) {
        if (this.currentSignatureGroup) {
            this.deactivate();
        }

        this.deactivateAllTools(ToolNames.SignatureTool);

        const newSignatureGroup = Node.create(json);
        const newTextNode = newSignatureGroup.findOne('.TextNode');
        this.markUpLayer.add(newSignatureGroup);
        this.setSignatureGroupMetadata(newSignatureGroup);
        this.setClickHandler(newSignatureGroup);
        // this.setDoubleClickHandler(newSignatureGroup);

        if (newSignatureGroup.name() === 'SignatureGroup-Highlighted') {
            newSignatureGroup.textStyle = 'highlighted';
        } else {
            newSignatureGroup.textStyle = 'normal';
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

        this.currentSignatureGroup = newSignatureGroup;
        this.currentTextNode = newTextNode;
        this.SignatureGroups.push(newSignatureGroup);
        this.addTransformer(newSignatureGroup);
        this.markUpLayer.draw();

        this.onSave();
    }

    isObjectSelected() {
        return !!this.currentSignatureGroup;
    }

    isEditing() {
        return this.currentSignatureGroup && this.currentSignatureGroup.editingMode;
    }
}
<template>
  <div class="canvas-wrapper">
    <ToolBar v-if="!isCustomDomain" :isCanvasObjectSelected="isCanvasObjectSelected"></ToolBar>
    <CustomToolBar v-if="isCustomDomain" />
    <div class="markup-flex" id="markup-flex" v-bind:class="{ 'hidden-canvas': isLoading }">
      <div class="markup-scroll-wrapper" v-bind:class="{'markup-scroll-wrapper--multi': currentMarkUpPages.length > 1, 'ios-scroll': isCurrentMarkUpOwner && canEditCurrentMarkUp && scrollingNeeded, 'markup-scroll-wrapper--scroll': isCurrentMarkUpOwner && canEditCurrentMarkUp }" id="markup-scroll-wrapper">
        <div class="markup-scroll-wrapper-contents" id="markup-scroll-wrapper-contents">
          <UpperCanvas v-bind:canEditCurrentMarkUp="canEditCurrentMarkUp" v-bind:isCurrentMarkUpOwner="isCurrentMarkUpOwner"></UpperCanvas>
          <div id="konvas">
            <div id="konvas-content"></div>
            <ContextMenu @activeContextMenu="contextMenuAction"/>
          </div>
          <LowerCanvas v-bind:canEditCurrentMarkUp="canEditCurrentMarkUp" v-bind:currentMarkUpPages="currentMarkUpPages" v-bind:currentMarkUpPage="currentMarkUpPage" v-bind:isCurrentMarkUpOwner="isCurrentMarkUpOwner"></LowerCanvas>
          <div class="flex"></div>
          <PageNav v-bind:currentMarkUpPages="currentMarkUpPages" v-bind:currentMarkUpPageNumber="currentMarkUpPageNumber"></PageNav>
        </div>
      </div>
      <PageSidebar v-bind:currentMarkUpPages="currentMarkUpPages" v-bind:currentMarkUpPageNumber="currentMarkUpPageNumber" v-bind:currentMarkUpId="currentMarkUpId" v-bind:canEditCurrentMarkUp="canEditCurrentMarkUp"></PageSidebar>
    </div>
    <input id="attachment-input" accept="image/*" type="file" name="file-input" style="display: none;" v-on:change="handleAttachmentUpload" />
    <AddPage v-if="isAddPageOpen"></AddPage>
    <SignatureBox v-if="isSignatureBoxOpen" @sendSignature="setSignature"></SignatureBox>
    <StarterLimit v-if="markUpHidden && isMarkUpOwner"></StarterLimit>
  </div>
</template>

<script>
import { Stage, Layer, FastLayer, Image as KonvaImage, Node } from 'konva';

import PenTool from '../konvaComponents/penTool';
import TextTool from "../konvaComponents/textTool";
import ArrowTool from "../konvaComponents/arrowTool";
import LineTool from "../konvaComponents/lineTool";
import RectangleTool from "../konvaComponents/rectangleTool";
import EllipseTool from "../konvaComponents/ellipseTool";
import ImageTool from "../konvaComponents/imageTool";
import BlurTool from "../konvaComponents/blurTool";
import CropTool from "../konvaComponents/cropTool";
import SignatureTool from "../konvaComponents/signatureTool";
import EventBus from '../stores/eventBus';
import {Notifications} from "../constants";
import mobileExtension from "./Canvas/mobileExtension";
import ContextMenu from "@/components/Canvas/ContextMenu"

// Extensions
// eslint-disable-next-line no-unused-vars
import _ from "@/konvaComponents/extensions/pointerPosition";

import {
  getMarkUpAndAwaitUntilPresent, startUpdateQueueProcessor, stopUpdateQueueProcessor,
  updateMarkUpPage,
  createMarkUpPageAttachment,
  getMarkUpSharePath, getMarkUpById, signalMarkUpPageEditDone, applyBlurToMarkUpPage, waitUntilJobsCompleted
} from "../services/markUpService";

import {calculateScale, cleanChildrenForUndo, scrollToTop} from "../utils";

import Vue from 'vue';
import { ToolNames } from '../constants';
import {mapActions, mapMutations, mapState} from "vuex";
import getStore from '../stores/appStore';
import {
  trackMarkUpCreate,
  trackMarkUpView
} from "../services/analytics";
import ToolBar from "./ToolBar";
import StarterLimit from "./StarterLimit";
import navigationPresets from "../navigationPresets";
import HighlightTool from "../konvaComponents/highlightTool";
import manipulationNodeList from "../konvaComponents/manipulationNodeList";
import UpperCanvas from "./Canvas/UpperCanvas";
import PageNav from "./Canvas/PageNav";
import PageSidebar from "./Canvas/PageSidebar";
import LowerCanvas from "./Canvas/LowerCanvas";
import AddPage from "./Canvas/AddPage";
import SignatureBox from "./Canvas/SignatureBox";
import CustomToolBar from "@/components/Teams/CustomToolBar";

const KONVAS_CONTENT_DIV = 'konvas-content';
const MAX_UNDO_STACK = 10;

export default {
  name: 'Canvas',
  components: {LowerCanvas, PageSidebar, PageNav, UpperCanvas, ToolBar, StarterLimit, AddPage, CustomToolBar, ContextMenu, SignatureBox},
  beforeRouteEnter: async (to, _, next) => {
    await getStore().commit('setLoading', true);
    await getStore().dispatch('awaitUntilUserInitialized');
    await getStore().dispatch('loadUserCanvasSettings');
    await stopUpdateQueueProcessor();

    const markUpId = to.params.markUpId;
    const pageNumber = Number(to.params.pageNumber) || 1;
    const creatorKey = to.params.screenshotCreatorKey || to.params.slackCreatorKey;
    const isScreenshotMarkUp = !!to.params.screenshotCreatorKey;
    const isChromeExtension = to.query.chrome == '1';

    if (creatorKey) {
      trackMarkUpCreate(markUpId, isScreenshotMarkUp ? 'screenshot' : 'slack', isChromeExtension);
    }

    let markUp = null;

    try {
      if (creatorKey) {
        markUp = await getMarkUpAndAwaitUntilPresent(markUpId, creatorKey, isScreenshotMarkUp);
      }
      else {
        markUp = await getMarkUpById(markUpId);
      }
    } finally {
      if (!markUp) {
        await getStore().commit('setLoading', false);
        next(`/404`);
      }
    }

    try {
      await getStore().commit('setMarkUp', {
        markUp,
        pageNumber,
        ignoreMissingPages: true
      });
    } catch (err) {
      if (err === 'MARK_UP_PAGE_NOT_FOUND') {
        return next(getMarkUpSharePath({
          markUpId,
          isPrivate: markUp.isPrivate
        }));
      }
    }

    if (creatorKey) {
      next(getMarkUpSharePath({
        markUpId,
        isPrivate: markUp.isPrivate
      }));
    } else {
      next();
    }
  },
  props: {
  },
  data() {
    return {
      stage: null,
      markUpLayer: null,
      mutationUnsubscribe: null,
      canvasMutationUnsubscribe: null,
      lastSavedJson: null,
      initialized: false,
      canEditCurrentMarkUp: false,
      isCurrentMarkUpOwner: false,
      currentMarkUpId: null,
      currentMarkUpPageNumber: null,
      currentMarkUpImageIdentifier: null,
      currentMarkUp: null,
      currentMarkUpPage: null,
      currentMarkUpPages: [],
      currentUndoLayer: null,
      undoStack: [],
      redoStack: [],
      keyEventListener: null,
      scrollingNeeded: false,
      objectSelectedInterval: null,
      objectnonSelected: true
    };
  },
  computed: {
    isCustomDomain() {
      return this.teamBrand && this.teamBrand.isCustomDomain;
    },
    ...mapState([
      'markUpId',
      'markUp',
      'markUpPage',
      'markUpPageNumber',
      'markUpPages',
      'markUpImageUrl',
      'markUpImageIdentifier',
      'markUpKonvaData',
      'markUpPageAttachments',
      'markUpCreatedBy',
      'markUpCreatedOn',
      'markUpHidden',
      'markUpPrivate',
      'isAuthenticated',
      'isMarkUpOwner',
      'isMarkUpDuplicated',
      'canEditMarkUp',
      'currentSelectedTool',
      'currentLineThickness',
      'currentColor',
      'isLoading',
      'canUndo',
      'canRedo',
      'lastUsedTool',
      'isTouchDevice',
      'isCanvasObjectSelected',
      'isAddPageOpen',
      'teamBrand',
      'contextMenuStyle',
      'isMacOs',
      'isSignatureBoxOpen'
    ])
  },
  created() {
    this.setCanvasLive(true);
  },
  async beforeDestroy() {
    document.removeEventListener('keydown', this.keyEventListener);
    window.removeEventListener('paste', this.handlePasteEvent, false);
    window.removeEventListener('copy', this.handleCopyEvent, false);
    window.removeEventListener('beforeunload', this.handleUnloadEvent, false);
    EventBus.$off('addAttachment');
    EventBus.$off('deletePage');
    EventBus.$off('resizeCanvas');
    EventBus.$off('undo');
    EventBus.$off('redo');
    EventBus.$off('nextPage');
    EventBus.$off('prevPage');
    EventBus.$off('goToPage');
    EventBus.$off('applyBlur');
    EventBus.$off('objectSeleted');

    await stopUpdateQueueProcessor();

    if (this.canEditCurrentMarkUp && this.lastSavedJson !== null) {
      EventBus.$emit('refreshAllHistory');
      signalMarkUpPageEditDone(this.currentMarkUpId, this.currentMarkUpImageIdentifier);
    }

    await this.resetCanvas();
    this.resetTools();

    if (this.mutationUnsubscribe) {
      this.mutationUnsubscribe();
    }

    if (this.canvasMutationUnsubscribe) {
      this.canvasMutationUnsubscribe();
    }

    if (this.currentSelectedTool === ToolNames.ImageTool || this.currentSelectedTool === ToolNames.CropTool) {
      this.selectTool(this.lastUsedTool);
    }

    this.setCanvasLive(false);
  },
  async destroyed() {
    this.removeHtmlClasses();

    if (this.objectSelectedInterval) {
      clearInterval(this.objectSelectedInterval);
      this.objectSelectedInterval = null;
    }
  },
  async mounted() {
    if (window.screen.width < Number(process.env.VUE_APP_CHAT_SCREEN_SIZE)) EventBus.$emit('setChatVisibility', false);

    this.objectSelectedInterval = setInterval(() => {
      const objectSelected = this.evalCanvasObjectSelected();
      if (this.isCanvasObjectSelected !== objectSelected) this.setIsCanvasObjectSelected(objectSelected);
    }, 300);

    this.addHtmlClasses();

    this.mutationUnsubscribe = this.$store.subscribe(async (mutation) => {
      if (mutation.type === 'setMarkUp' && mutation.payload) {
        if (this.currentMarkUpId === this.markUpId && this.markUpPageNumber === 1 && this.currentMarkUpPageNumber !== 1) {
          this.goToPage(1);
          return;
        } else if (this.currentMarkUpId === this.markUpId) {
          this.setLoading(false);
          return;
        }

        await stopUpdateQueueProcessor();

        if (this.canEditCurrentMarkUp && this.lastSavedJson !== null) {
          EventBus.$emit('refreshAllHistory');
          signalMarkUpPageEditDone(this.currentMarkUpId, this.currentMarkUpImageIdentifier);
        }

        this.resetCanvas();
        await this.initializeKonvaStage();
      } else if (mutation.type === 'setMarkUpPage' && mutation.payload) {
        if (this.currentMarkUpPageNumber === mutation.payload) return;

        await stopUpdateQueueProcessor();

        if (this.canEditCurrentMarkUp) {
          this.deactivateAllTools();
          signalMarkUpPageEditDone(this.currentMarkUpId, this.currentMarkUpImageIdentifier);
        }

        try {
          await this.$router.push(getMarkUpSharePath({
            markUpId: this.markUpId,
            pageNumber: this.markUpPageNumber,
            isPrivate: this.markUpPrivate
          }));
          // eslint-disable-next-line no-empty
        } catch {}
        await this.initializeKonvaStage();
        scrollToTop();
      } else if (mutation.type === 'setMarkUpPages' && mutation.payload) {
        const deletedPageNumber = mutation.payload.deletedPageNumber;
        if (typeof deletedPageNumber === 'number' && this.currentMarkUpPageNumber >= deletedPageNumber) {
          await stopUpdateQueueProcessor();

          if (this.canEditCurrentMarkUp) {
            this.deactivateAllTools();
            signalMarkUpPageEditDone(this.currentMarkUpId, this.currentMarkUpImageIdentifier);
          }

          await this.initializeKonvaStage();
          scrollToTop();
        } else {
          this.currentMarkUpPageNumber = this.markUpPageNumber;
          this.currentMarkUpPages = this.markUpPages;
          this.currentMarkUpPage = this.markUpPage;
          this.fitStageIntoParentContainer();
        }
      }
    });

    await this.initializeKonvaStage();

    EventBus.$on('resizeCanvas', () => {
      this.fitStageIntoParentContainer();
    });

    EventBus.$on('undo', () => {
      // Other handlers might want to finish something before the main undo operation happens
      setTimeout(() => {
        this.commitUndo();
      }, 1);
    });

    EventBus.$on('redo', () => {
      // Other handlers might want to finish something before the main redo operation happens
      setTimeout(() => {
        this.commitRedo();
      }, 1);
    });

    EventBus.$on('addAttachment', () => {
      this.openAttachmentDialog();
    });

    EventBus.$on('nextPage', () => {
      this.nextPage();
    });

    EventBus.$on('prevPage', () => {
      this.prevPage();
    });

    EventBus.$on('goToPage', (page) => {
      this.goToPage(page);
    });

    EventBus.$on('deletePage', (page) => {
      this.deletePage(page);
    });

    EventBus.$on('applyBlur', () => {
      this.applyBlur();
    });

    EventBus.$on('markUpTitleChanged', () => {
      this.updatePageMetaAttributes();
    });

    EventBus.$on('objectSeleted', (evt) => {
      this.objectnonSelected = true;
      if(evt.target.isArrow || evt.target.isRectGroup || evt.target.isEllipseGroup || evt.target.isBlurGroup || evt.target.isLine || evt.target.parent.isTextGroup || evt.target.isImage || evt.target.parent.isSignatureGroup) this.objectnonSelected = false;
    });

    this.keyEventListener = async (e) => {
      console.log(e.keyCode)
      if (e.key === 'z' && (e.ctrlKey || e.metaKey) && (e.shiftKey)) {
        // Ctrl/Cmd + Shift + Z
        this.commitRedo();
      } else if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
        // Ctrl/Cmd + Z
        this.commitUndo();
      } else if (e.key === 'ArrowRight'){
        if( !e.ctrlKey  && !e.shiftKey && this.objectnonSelected) {
          if (!this.textTool || !(this.currentSelectedTool === ToolNames.TextTool && this.textTool.isEditing())) {
            this.nextPage();
          }
        }else if(!this.objectnonSelected){
          if(!e.shiftKey){
            EventBus.$emit('moveCanvasObjecttoLeft', 1);
          }
          else
            EventBus.$emit('moveCanvasObjecttoLeft', 5);
        }
      } else if (e.key === 'ArrowLeft'){
        if( !e.ctrlKey  && !e.shiftKey && this.objectnonSelected) {
          if (!this.textTool || !(this.currentSelectedTool === ToolNames.TextTool && this.textTool.isEditing())) {
            this.prevPage();
          }
        } else if(!this.objectnonSelected){
          if(!e.shiftKey) EventBus.$emit('moveCanvasObjecttoLeft', -1);
          else EventBus.$emit('moveCanvasObjecttoLeft', -5);
        }
      } else if (e.keyCode == 219 && (e.ctrlKey || e.metaKey) && e.shiftKey){
        if(this.isMacOs) e.preventDefault();
        EventBus.$emit('moveToBottomObject');
      }else if (e.keyCode == 221 && (e.ctrlKey || e.metaKey) && e.shiftKey){
        if(this.isMacOs) e.preventDefault();
        EventBus.$emit('moveToTopObject');
      }
       else if (e.key === 'ArrowDown'){
         if(!this.objectnonSelected)
         {
           if(!e.shiftKey){
            e.preventDefault();
            EventBus.$emit('moveCanvasObjecttoDown', 1);
           }
           else {
             if(e.ctrlKey || e.metaKey) EventBus.$emit('moveDownCurrentObject');
             else EventBus.$emit('moveCanvasObjecttoDown', 5);
           }
         }
      } else if (e.key === 'ArrowUp'){
        if(!this.objectnonSelected)
        {
          if(!e.shiftKey) {
            e.preventDefault();
            EventBus.$emit('moveCanvasObjecttoDown', -1);
          }
          else {
            if(e.ctrlKey || e.metaKey)  EventBus.$emit('moveUpCurrentObject');
            else EventBus.$emit('moveCanvasObjecttoDown', -5);
          }
        }
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        EventBus.$emit('deleteCanvasObject');
      } else if (e.key === 'Enter') {
        await this.applyBlur();
        EventBus.$emit('applyCrop');
      } else if (e.key === 'Escape') {
        EventBus.$emit('removeBlur');
        EventBus.$emit('removeCrop');
      }
    };

    document.addEventListener('keydown', this.keyEventListener);

    window.addEventListener('paste', this.handlePasteEvent, false);
    window.addEventListener('copy', this.handleCopyEvent, false);
    window.addEventListener('beforeunload', this.handleUnloadEvent, false);

    if (this.isTouchDevice) this.onMobileMounted();
  },
  watch: {
    '$route.params.markUpId': async (markUpId) => {
      if (!markUpId) return;

      await getStore().commit('setLoading', true);
      const markUp = await getMarkUpAndAwaitUntilPresent(markUpId);
      await getStore().commit('setMarkUp', {
        markUp
      });
    },
    '$route.params.pageNumber': async (pageNumber) => {
      await getStore().dispatch('changeCurrentMarkUpPage', {pageNumber: Number(pageNumber)});
    },
    '$route': () => {
      this.updatePageMetaAttributes();
    }
  },
  methods: {
    contextMenuAction(name){
      this[`${this.currentSelectedTool[0].toLowerCase()}${this.currentSelectedTool.slice(1)}`][name]()
    },
    setSignature(fontObj){
      this.selectTool(ToolNames.SignatureTool)
      EventBus.$emit('setSignature', fontObj)
    },
    async fitStageIntoParentContainer() {
      await Vue.nextTick();
      const parentContainer = document.querySelector('#konvas');
      let containerWidth = parentContainer.offsetWidth;

      const actualStageWidth = this.stage.width() / this.stage.scaleX();
      const actualStageHeight = this.stage.height() / this.stage.scaleY();

      const scaleCalc = calculateScale({
        parentWidth: containerWidth,
        stageWidth: actualStageWidth,
        stageHeight: actualStageHeight
      });

      this.stage.width(scaleCalc.newWidth);
      this.stage.height(scaleCalc.newHeight);
      this.stage.scale({x : scaleCalc.newScale, y: scaleCalc.newScale});
      this.stage.draw();
    },
    async redirectToDownload() {
      await this.$router.push('/download');
    },
    async initializeKonvaStage() {
      if (this.markUpHidden) {
        this.setLoading(false);

        if (this.isMarkUpOwner) {
          return;
        }

        return this.navigateTo404();
      }

      this.setLoading(true);
      KonvaImage.fromURL(this.markUpImageUrl, async (image) => {
        this.canvasWidth = image.width();
        this.canvasHeight = image.height();

        if (this.markUpKonvaData) {
          this.stage = Node.create(JSON.parse(this.markUpKonvaData), KONVAS_CONTENT_DIV);
          let layers = this.stage.getLayers();
          for (let layer of layers) {
            if (layer.attrs.id === 'markUp') {
              this.markUpLayer = layer;
            }
          }

          const imageLayer = this.stage.find('.image');
          if (imageLayer) {
            imageLayer.destroy();
          }

          const manipulationNodes = [];
          for (let nodeName of manipulationNodeList) {
            manipulationNodes.push(...this.stage.find(nodeName));
          }
          manipulationNodes.forEach(m => {
            m.destroy();
          });
        } else {
          this.stage = new Stage({
            container: KONVAS_CONTENT_DIV,
            width: this.canvasWidth,
            height: this.canvasHeight
          });

          this.markUpLayer = new Layer({
            id: 'markUp',
            name: 'markUp'
          });

          this.stage.add(this.markUpLayer);
        }

        let imageLayer = new FastLayer({
          id: 'image',
          name: 'image'
        });

        imageLayer.add(image);
        this.stage.add(imageLayer);
        imageLayer.moveToBottom();

        this.setMarkUpStage(this.stage);
        this.currentMarkUpId = this.markUpId;
        this.currentMarkUpPages = this.markUpPages;
        this.currentMarkUpPage = this.markUpPage;
        this.currentMarkUpPageNumber = this.markUpPageNumber;
        this.currentMarkUpImageIdentifier = this.markUpImageIdentifier;
        this.currentMarkUp = this.markUp;
        this.canEditCurrentMarkUp = this.canEditMarkUp;
        this.isCurrentMarkUpOwner = this.isMarkUpOwner;

        if (this.canEditMarkUp) {
          await this.initTools();

          if (this.isTouchDevice) this.onMobileCanvasInit();

          this.canvasMutationUnsubscribe = this.$store.subscribe(mutation => {
            if (mutation.type === 'selectTool') {
              this.onToolSelectedHandler(mutation.payload);
            } else if (mutation.type === 'setLineThickness') {
              this.onLineThicknessChangedHandler(mutation.payload);
            } else if (mutation.type === 'setCurrentColor') {
              this.onColorChangedHandler(mutation.payload);
            }
          });

          this.selectTool(this.currentSelectedTool);
          this.setLineThickness(this.currentLineThickness);
          this.setCurrentColor(this.currentColor);
          this.undoStack = [];
          this.redoStack = [];
          this.currentUndoLayer = null;
          this.pushToUndoStack(this.markUpLayer.toObject()); // Set initial undo layer
          startUpdateQueueProcessor();
        } else {
          const imageToolOptions = this.buildImageToolOptions();
          this.imageTool = new ImageTool(imageToolOptions);
          await this.imageTool.init();

          this.stage.listening(false);
          this.$store.dispatch('ensureUpdatedViewHistory', {
            markUpId: this.currentMarkUpId
          });
        }

        this.setScrollingNeeded();
        this.fitStageIntoParentContainer();

        this.disableContextMenu();

        this.setCanUndo(false);
        this.setCanRedo(false);
        this.initialized = true;
        trackMarkUpView(this.currentMarkUpId, this.canEditCurrentMarkUp);
        this.updatePageMetaAttributes();
        this.setLoading(false);
      });
    },
    buildToolOptions() {
      return {
        stage: this.stage,
        markUpLayer: this.markUpLayer,
        onSave: this.saveMarkUp,
        lineThickness: this.currentLineThickness,
        color: this.currentColor,
        isTouchDevice: this.isTouchDevice,
        deactivateAllTools: (except) => {
          this.selectTool(except);
        },
        setLineThickness: (lineThickness) => {
          this.setLineThickness(lineThickness);
        },
        ensureLineThicknessSet: () => {
          this.setPreviousLineThickness();
        },
        setColor: (color) => {
          this.setCurrentColor(color);
        },
        activateLastUsedTool: () => {
          this.selectTool(this.lastUsedTool);
        }
      };
    },
    buildImageToolOptions() {
      return {
        ...this.buildToolOptions(),
        attachments: this.markUpPageAttachments
      }
    },
    async initTools() {
      const toolOptions = this.buildToolOptions();
      const imageToolOptions = this.buildImageToolOptions();

      if (this.penTool) {
        this.deactivateAllTools();
      }

      this.penTool = new PenTool(toolOptions);
      this.highlightTool = new HighlightTool(toolOptions);
      this.textTool = new TextTool(toolOptions);
      this.arrowTool = new ArrowTool(toolOptions);
      this.lineTool = new LineTool(toolOptions);
      this.rectangleTool = new RectangleTool(toolOptions);
      this.blurTool = new BlurTool(toolOptions);
      this.cropTool = new CropTool(toolOptions);
      this.ellipseTool = new EllipseTool(toolOptions);
      this.imageTool = new ImageTool(imageToolOptions);
      this.signatureTool = new SignatureTool(toolOptions);

      await this.penTool.init();
      await this.highlightTool.init();
      await this.textTool.init();
      await this.arrowTool.init();
      await this.lineTool.init();
      await this.rectangleTool.init();
      await this.blurTool.init();
      await this.cropTool.init();
      await this.ellipseTool.init();
      await this.imageTool.init();
      await this.signatureTool.init();
    },
    async refindCanvasObjects() {
      if (!this.penTool) return;

      const imagesExist = this.imageTool.images.length > 0;
      if (imagesExist) this.setLoading(true);

      this.deactivateAllTools();

      this.penTool.setStage(this.stage, this.markUpLayer);
      this.highlightTool.setStage(this.stage, this.markUpLayer);
      this.textTool.setStage(this.stage, this.markUpLayer);
      this.arrowTool.setStage(this.stage, this.markUpLayer);
      this.lineTool.setStage(this.stage, this.markUpLayer);
      this.rectangleTool.setStage(this.stage, this.markUpLayer);
      this.blurTool.setStage(this.stage, this.markUpLayer);
      this.cropTool.setStage(this.stage, this.markUpLayer);
      this.ellipseTool.setStage(this.stage, this.markUpLayer);
      await this.imageTool.setStage(this.stage, this.markUpLayer);
      this.signatureTool.setStage(this.stage, this.markUpLayer);

      if (imagesExist) this.setLoading(false);
    },
    onToolSelectedHandler(toolName) {
      this.deactivateAllTools(toolName);

      switch (toolName) {
        case ToolNames.PenTool:
          if (this.penTool) this.penTool.activate();
          break;
        case ToolNames.ArrowTool:
          if (this.arrowTool) this.arrowTool.activate();
          break;
        case ToolNames.LineTool:
          if (this.lineTool) this.lineTool.activate();
          break;
        case ToolNames.RectangleTool:
          if (this.rectangleTool) this.rectangleTool.activate();
          break;
        case ToolNames.BlurTool:
          if (this.blurTool) this.blurTool.activate();
          break;
        case ToolNames.CropTool:
          if (this.cropTool) this.cropTool.activate();
          break;
        case ToolNames.EllipseTool:
          if (this.ellipseTool) this.ellipseTool.activate();
          break;
        case ToolNames.TextTool:
          if (this.textTool) this.textTool.activate();
          break;
        case ToolNames.HighlightTool:
          if (this.highlightTool) this.highlightTool.activate();
          break;
        case ToolNames.ImageTool:
          if (this.imageTool) this.imageTool.activate();
          break;
        case ToolNames.SignatureTool:
          if (this.signatureTool) this.signatureTool.activate();
          break;
      }
    },
    onLineThicknessChangedHandler(lineThickness) {
      if (this.canEditCurrentMarkUp) {
        this.arrowTool.setLineThickness(lineThickness);
        this.lineTool.setLineThickness(lineThickness);
        this.rectangleTool.setLineThickness(lineThickness);
        this.ellipseTool.setLineThickness(lineThickness);
        this.penTool.setLineThickness(lineThickness);
        this.textTool.setLineThickness(lineThickness);
        this.highlightTool.setLineThickness(lineThickness);
        this.signatureTool.setLineThickness(lineThickness);
      }
    },
    onColorChangedHandler(color) {
      if (this.canEditCurrentMarkUp) {
        this.arrowTool.setColor(color);
        this.lineTool.setColor(color);
        this.ellipseTool.setColor(color);
        this.penTool.setColor(color);
        this.rectangleTool.setColor(color);
        this.textTool.setColor(color);
        this.highlightTool.setColor(color);
        this.signatureTool.setColor(color);
      }
    },
    deactivateAllTools(except='') {
      if (except !== ToolNames.PenTool && this.penTool) this.penTool.deactivate();
      if (except !== ToolNames.TextTool && this.textTool) this.textTool.deactivate();
      if (except !== ToolNames.ArrowTool && this.arrowTool) this.arrowTool.deactivate();
      if (except !== ToolNames.LineTool && this.lineTool) this.lineTool.deactivate();
      if (except !== ToolNames.RectangleTool && this.rectangleTool) this.rectangleTool.deactivate();
      if (except !== ToolNames.BlurTool && this.blurTool) this.blurTool.deactivate();
      if (except !== ToolNames.CropTool && this.cropTool) this.cropTool.deactivate();
      if (except !== ToolNames.EllipseTool && this.ellipseTool) this.ellipseTool.deactivate();
      if (except !== ToolNames.HighlightTool && this.highlightTool) this.highlightTool.deactivate();
      if (except !== ToolNames.ImageTool && this.imageTool) this.imageTool.deactivate();
      if (except !== ToolNames.SignatureTool && this.signatureTool) this.signatureTool.deactivate();
    },
    pushToUndoStack(newLayer, forRedo=false) {
      cleanChildrenForUndo(newLayer.children);

      const processedNewLayerStr = JSON.stringify(newLayer);

      if (!forRedo) {
        this.redoStack = [];
        this.setCanRedo(false);
      }

      if (this.currentUndoLayer === null) {
        this.currentUndoLayer = processedNewLayerStr;
        this.setCanUndo(false);
      } else {
        if (processedNewLayerStr !== this.currentUndoLayer) {
          if (this.undoStack.length >= MAX_UNDO_STACK) {
            this.undoStack.splice(0, 1);
          }
          this.undoStack.push(this.currentUndoLayer);
          this.currentUndoLayer = processedNewLayerStr;
          this.setCanUndo(true);
        }
      }
    },
    pushToRedoStack() {
      this.redoStack.push(this.currentUndoLayer);
      this.setCanRedo(true);
    },
    async commitUndo() {
      if (!this.canEditCurrentMarkUp || !this.initialized || this.undoStack.length === 0) {
        return;
      }

      const newMarkUpLayerObj = JSON.parse(this.undoStack[this.undoStack.length - 1]);
      const newMarkUpLayer = Node.create(newMarkUpLayerObj);
      const currentMarkUpLayer = this.stage.find('.markUp');
      currentMarkUpLayer[0].destroy();
      this.stage.add(newMarkUpLayer);
      this.markUpLayer = newMarkUpLayer;

      await this.refindCanvasObjects();
      this.onToolSelectedHandler(this.currentSelectedTool);

      this.pushToRedoStack();
      this.currentUndoLayer = this.undoStack.splice(this.undoStack.length - 1, 1)[0];
      this.setCanUndo(this.undoStack.length > 0);
      this.saveMarkUp(true);
    },
    async commitRedo() {
      if (!this.canEditCurrentMarkUp || !this.initialized || this.redoStack.length === 0) {
        return;
      }

      const newMarkUpLayerStr = this.redoStack[this.redoStack.length - 1];
      const newMarkUpLayerObj = JSON.parse(newMarkUpLayerStr);
      const newMarkUpLayer = Node.create(newMarkUpLayerObj);
      const currentMarkUpLayer = this.stage.find('.markUp');
      currentMarkUpLayer[0].destroy();
      this.stage.add(newMarkUpLayer);
      this.markUpLayer = newMarkUpLayer;

      await this.refindCanvasObjects();
      this.onToolSelectedHandler(this.currentSelectedTool);

      this.pushToUndoStack(newMarkUpLayerObj, true);
      this.redoStack.splice(this.redoStack.length - 1, 1);
      this.setCanRedo(this.redoStack.length > 0);
      this.saveMarkUp(true);
    },
    prevPage() {
      if (this.currentMarkUpPageNumber === 1 || this.isLoading) return;

      this.goToPage(this.currentMarkUpPageNumber - 1);
    },
    nextPage() {
      if (this.currentMarkUpPageNumber === this.markUpPages.length || this.isLoading) return;

      this.goToPage(this.currentMarkUpPageNumber + 1);
    },
    goToPage(pageNumber) {
      if (this.currentSelectedTool === ToolNames.CropTool) this.selectTool(this.lastUsedTool);

      this.setMarkUpPage(pageNumber);
    },
    saveMarkUp(noUndo=false) {
      if (!this.canEditCurrentMarkUp || !this.initialized) {
        return;
      }

      const stageJsonStr = this.stage.toJSON();
      if (stageJsonStr === this.lastSavedJson) { // ensures we don't needlessly make patch calls to the server
        return;
      }

      if (!noUndo) {
        this.pushToUndoStack(this.markUpLayer.toObject());
      }

      this.lastSavedJson = stageJsonStr;

      const stageJson = JSON.parse(stageJsonStr);
      const scaleX = stageJson.attrs.scaleX || 1;
      stageJson.attrs.width = stageJson.attrs.width / scaleX;
      stageJson.attrs.height = stageJson.attrs.height / scaleX;
      stageJson.attrs.scaleX = 1;
      stageJson.attrs.scaleY = 1;

      let konvaDataStr = JSON.stringify(stageJson);
      this.setMarkUpKonvaData({
        markUpPage: this.currentMarkUpPage,
        konvaData: konvaDataStr
      });
      updateMarkUpPage(this.currentMarkUpId, this.currentMarkUpImageIdentifier, konvaDataStr);
    },
    disableContextMenu() {
      this.stage.on('contentContextmenu', (e) => {
        e.evt.preventDefault();
      });
    },
    async resetCanvas() {
      if (this.canEditCurrentMarkUp) {
        this.deactivateAllTools();
      }

      if (this.stage) {
        this.stage.destroy();
      }

      this.markUpLayer = null;
      this.stage = null;
      this.lastSavedJson = null;
      this.initialized = false;
      this.canEditCurrentMarkUp = false;
      this.isCurrentMarkUpOwner = false;
      this.currentMarkUp = null;
      this.currentMarkUpImageIdentifier = null;
      this.currentMarkUpId = null;
      this.currentMarkUpPageNumber = null;
      this.currentMarkUpPages = [];
      this.currentMarkUpPage = null;
    },
    resetTools() {
      if (this.cropTool) this.cropTool.deactivate();

      this.arrowTool = null;
      this.blurTool = null;
      this.ellipseTool = null;
      this.highlightTool = null;
      this.imageTool = null;
      this.lineTool = null;
      this.penTool = null;
      this.rectangleTool = null;
      this.textTool = null;
      this.cropTool = null;
      this.signatureTool = null;
    },
    async deletePage(page) {
      try {
        this.setLoading(true);
        const prevPage = this.currentMarkUpPageNumber;
        const success = await this.deleteMarkUpPage({page});
        if (!success) throw {};

        if (prevPage !== this.markUpPageNumber) {
          this.replacePage(this.markUpId, this.markUpPageNumber, this.markUpPrivate);
        }

        this.showMarkUpPageDeletedMsg();
      } catch {
        this.showErrorMsg();
      } finally {
        this.setLoading(false);
      }
    },
    async handlePasteEvent(e) {
      if (!this.canEditCurrentMarkUp || this.isAddPageOpen || this.isSignatureBoxOpen) return;

      const items = e.clipboardData.items;
      for (let item of items) {
        if (item.type && item.type.indexOf('image/') === 0) {
          const file = item.getAsFile();
          this.addImage(file);
          break;
        } else if (item.type && item.type.indexOf('application/markuphero') === 0) {
          item.getAsString(async (textData) => {
            const pastedObject = JSON.parse(textData);

            switch (pastedObject.toolName) {
              case ToolNames.RectangleTool:
                this.rectangleTool.pasteObject(pastedObject.data);
                break;
              case ToolNames.BlurTool:
                this.blurTool.pasteObject(pastedObject.data);
                break;
              case ToolNames.TextTool:
                if (!this.textTool.isEditing()) {
                  this.textTool.pasteObject(pastedObject.data);
                }
                break;
              case ToolNames.EllipseTool:
                this.ellipseTool.pasteObject(pastedObject.data);
                break;
              case ToolNames.ArrowTool:
                this.arrowTool.pasteObject(pastedObject.data);
                break;
              case ToolNames.LineTool:
                this.lineTool.pasteObject(pastedObject.data);
                break;
              case ToolNames.PenTool:
                this.penTool.pasteObject(pastedObject.data);
                break;
              case ToolNames.HighlightTool:
                this.highlightTool.pasteObject(pastedObject.data);
                break;
              case ToolNames.ImageTool:
                try {
                  this.setLoading(true);
                  await this.imageTool.pasteObject(pastedObject.data);
                } catch {
                  this.showErrorMsg();
                } finally {
                  this.setLoading(false);
                }
                break;
              case ToolNames.SignatureTool:
                this.signatureTool.pasteObject(pastedObject.data);
                break;
            }
          });
        }
      }
    },
    async openAttachmentDialog() {
      if (this.openingFileDialog) return;

      this.openingFileDialog = true;
      let attachmentInput = document.getElementById('attachment-input');
      attachmentInput.click();

      this.openingFileDialog = false;
    },
    async handleAttachmentUpload() {
      const fileInput = document.getElementById('attachment-input');
      const files = fileInput.files;
      if (files.length === 0) return;
      const file = files[0];
      this.addImage(file);
      fileInput.value = '';
    },
    async addImage(file) {
      this.setLoading(true);
      try {
        const attachment = await createMarkUpPageAttachment(this.markUpId, this.markUpImageIdentifier, file);
        await this.imageTool.addImage(attachment.attachmentId, file.type);
        this.addMarkUpPageAttachment(attachment);
        this.selectTool(ToolNames.ImageTool);
      } catch {
        this.showErrorMsg();
      } finally {
        this.setLoading(false);
      }
    },
    async handleCopyEvent(e) {
      if (!this.canEditCurrentMarkUp || this.isAddPageOpen || this.isSignatureBoxOpen) return;

      let copiedObject = null;

      switch (this.currentSelectedTool) {
        case ToolNames.RectangleTool:
          copiedObject = {
            toolName: ToolNames.RectangleTool,
            data: this.rectangleTool.copyCurrentObject()
          };
          break;
        case ToolNames.BlurTool:
          copiedObject = {
            toolName: ToolNames.BlurTool,
            data: this.blurTool.copyCurrentObject()
          };
          break;
        case ToolNames.TextTool:
          if (!this.textTool.isEditing()) {
            copiedObject = {
              toolName: ToolNames.TextTool,
              data: this.textTool.copyCurrentObject()
            };
          }
          break;
        case ToolNames.EllipseTool:
          copiedObject = {
            toolName: ToolNames.EllipseTool,
            data: this.ellipseTool.copyCurrentObject()
          };
          break;
        case ToolNames.ImageTool:
          copiedObject = {
            toolName: ToolNames.ImageTool,
            data: this.imageTool.copyCurrentObject()
          };
          break;
        case ToolNames.ArrowTool:
          copiedObject = {
            toolName: ToolNames.ArrowTool,
            data: this.arrowTool.copyCurrentObject()
          };
          break;
        case ToolNames.LineTool:
          copiedObject = {
            toolName: ToolNames.LineTool,
            data: this.lineTool.copyCurrentObject()
          };
          break;
        case ToolNames.PenTool:
          copiedObject = {
            toolName: ToolNames.PenTool,
            data: this.penTool.copyCurrentObject()
          };
          break;
        case ToolNames.HighlightTool:
          copiedObject = {
            toolName: ToolNames.HighlightTool,
            data: this.highlightTool.copyCurrentObject()
          };
          break;
        case ToolNames.SignatureTool:
          copiedObject = {
            toolName: ToolNames.SignatureTool,
            data: this.signatureTool.copyCurrentObject()
          };
          break;
      }

      if (copiedObject) {
        e.clipboardData.setData('application/markuphero', JSON.stringify(copiedObject));
        e.preventDefault();
      }
    },
    handleUnloadEvent() {
      if (this.canEditCurrentMarkUp && this.lastSavedJson != null) {
        signalMarkUpPageEditDone(this.currentMarkUpId, this.currentMarkUpImageIdentifier);
      }
    },
    getMarkUpSharePath(details) {
      return getMarkUpSharePath(details);
    },
    setScrollingNeeded() {
      const markUpContentsHeight = document.getElementById('markup-scroll-wrapper-contents').clientHeight;
      const markUpScrollHeight = document.getElementById('markup-scroll-wrapper').clientHeight;

      this.scrollingNeeded = markUpContentsHeight > markUpScrollHeight;
    },
    addHtmlClasses() {
      const htmlElement = document.getElementsByTagName('html')[0];
      const bodyElement = document.getElementsByTagName('body')[0];
      htmlElement.classList.add('full-size-html');
      bodyElement.classList.add('full-size-html');
    },
    removeHtmlClasses() {
      const htmlElement = document.getElementsByTagName('html')[0];
      const bodyElement = document.getElementsByTagName('body')[0];
      htmlElement.classList.remove('full-size-html');
      bodyElement.classList.remove('full-size-html');
    },
    evalCanvasObjectSelected() {
      if (!this.canEditCurrentMarkUp) return false;

      if (this.currentSelectedTool === ToolNames.ArrowTool && this.arrowTool.isObjectSelected()) return true;
      if (this.currentSelectedTool === ToolNames.EllipseTool && this.ellipseTool.isObjectSelected()) return true;
      if (this.currentSelectedTool === ToolNames.HighlightTool && this.highlightTool.isObjectSelected()) return true;
      if (this.currentSelectedTool === ToolNames.ImageTool && this.imageTool.isObjectSelected()) return true;
      if (this.currentSelectedTool === ToolNames.LineTool && this.lineTool.isObjectSelected()) return true;
      if (this.currentSelectedTool === ToolNames.PenTool && this.penTool.isObjectSelected()) return true;
      if (this.currentSelectedTool === ToolNames.RectangleTool && this.rectangleTool.isObjectSelected()) return true;
      if (this.currentSelectedTool === ToolNames.BlurTool && this.blurTool.isObjectSelected()) return true;
      if (this.currentSelectedTool === ToolNames.CropTool && this.cropTool.isObjectSelected()) return true;
      if (this.currentSelectedTool === ToolNames.TextTool && this.textTool.isObjectSelected()) return true;
      if (this.currentSelectedTool === ToolNames.SignatureTool && this.signatureTool.isObjectSelected()) return true;

      return false;
    },
    reloadCanvasImage() {
      return new Promise((resolve, reject) => {
        if (this.markUpImageUrl && this.stage) {
          const newImgUrl = `${this.markUpImageUrl}&time=${(new Date()).getTime()}`;
          KonvaImage.fromURL(newImgUrl, async (image) => {
            const imageLayer = this.stage.find('.image');
            if (imageLayer) {
              imageLayer.destroyChildren();
              imageLayer.add(image);
              imageLayer.draw();
              resolve();
            } else reject();
          });
        } else reject();
      });
    },
    async applyBlur() {
      if (this.canEditCurrentMarkUp && this.currentSelectedTool === ToolNames.BlurTool && this.blurTool.blurData) {
        this.setLoading({
          isLoading: true,
          loaderStyle: 'blur'
        });

        const jobIds = await applyBlurToMarkUpPage(this.currentMarkUpId, this.currentMarkUpImageIdentifier, this.blurTool.blurData);
        await waitUntilJobsCompleted(jobIds);
        await this.reloadCanvasImage();
        this.blurTool.removeBlur();
        signalMarkUpPageEditDone(this.currentMarkUpId, this.currentMarkUpImageIdentifier, true);
        this.setLoading(false);
      }
    },
    updatePageMetaAttributes() {
      if (this.markUp) {
        const markUpTitle = this.markUp.title || 'Markup';
        let brandSuffix = this.teamBrand && this.teamBrand.teamName ? this.teamBrand.teamName : 'Markup Hero';
        let pageSuffix = this.markUpPages.length > 1 ? ` (${this.markUpPageNumber} of ${this.markUpPages.length} pages) ` : '';
        const title = `View ${markUpTitle}${pageSuffix} - ${brandSuffix}`;
        document.title = title;

        let description = this.canEditCurrentMarkUp ? 'Annotate your markup.' : `View ${markUpTitle} created by ${this.markUp.createdByName}.`;
        document.querySelector('meta[property="og:title"]').setAttribute("content", title);
        document.querySelector('meta[name="description"]').setAttribute("content", description);
        document.querySelector('meta[property="og:description"]').setAttribute("content", description);
      }
    },
    ...navigationPresets,
    ...mobileExtension,
    ...mapMutations([
      'selectTool',
      'setLoading',
      'setMarkUpStage',
      'setMarkUpPage',
      'setMarkUpKonvaData',
      'addMarkUpPageAttachment',
      'setCanvasLive',
      'setMarkUp',
      'setLineThickness',
      'setPreviousLineThickness',
      'setCurrentColor',
      'setCanUndo',
      'setCanRedo',
      'setIsCanvasObjectSelected'
    ]),
    ...mapActions([
      'deleteMarkUpPage'
    ])
  },
  notifications: Notifications
}
</script>

<style scoped>
  @import '../styles/globalShared.css';

  div.canvas-wrapper {
    padding-top: 60px;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  div.markup-flex {
    display: flex;
  }

  div.markup-scroll-wrapper {
    position: fixed;
    top: 60px;
    bottom: 0;
    width: 100%;
    overflow-y: auto;
    overflow-x: hidden;
  }

  div.markup-scroll-wrapper-contents {
    display: flex;
    flex-direction: column;
    min-height: 100%;
  }

  div.markup-scroll-wrapper--multi {
    width: calc(100% - 200px);
  }

  div.markup-scroll-wrapper--scroll::-webkit-scrollbar {
    width: 10px;
  }

  div.markup-scroll-wrapper--scroll::-webkit-scrollbar-thumb {
    background: #5E656F;
    border-radius: 5px;
  }

  #konvas {
    margin: 0 40px;
    display: flex;
  }

  #konvas-content {
    margin: auto;
    background-color: #fff;
  }

  .hidden-canvas {
    display: none;
  }

  div.flex {
    flex-grow: 2;
  }

  @media screen and (max-width: 767px) {
    div.markup-scroll-wrapper--multi {
      width: 100%;
    }
  }

  @media screen and (max-width: 479px) {
    div.markup-scroll-wrapper--scroll::-webkit-scrollbar {
      width: 30px;
    }

    div.markup-scroll-wrapper--scroll::-webkit-scrollbar-thumb {
      border-radius: 15px;
    }

    div.ios-scroll {
      padding-right: 30px;
    }

    #konvas {
      margin: 0 5px;
    }
  }
</style>

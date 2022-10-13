import Vuex from "vuex";
import { Auth } from "aws-amplify";
import {getFormattedDate} from "../utils";
import {
  deleteMarkUpPage,
  getViewedMarkUpHistory,
  searchMarkUps
} from '../services/markUpService';
import {setAnonId, getDetails} from "../services/authService";
import {HISTORY_PAGE_SIZE, ToolNames, DEFAULT_LINE_THICKNESS} from "../constants";
import {getTeamBrand, getTeamDetails} from "@/services/teamService";
import axios from "axios";

let store = null;
const hamburgerOpenSettingPostfix = 'hamburger_open';
const defaultTool = ToolNames.PenTool;

export default function createAppStore() {
  if (!store) {
    store = new Vuex.Store({
      state: {
        currentSelectedTool: defaultTool,
        lastUsedPenTool: defaultTool,
        lastUsedShapeTool: ToolNames.RectangleTool,
        lastUsedLineTool: ToolNames.ArrowTool,
        lastUsedTool: defaultTool,
        currentLineThickness: DEFAULT_LINE_THICKNESS,
        previousLineThickness: null,
        currentColor: '#fcd117',
        markUp: null,
        markUpPage: null,
        markUpPageNumber: null,
        markUpPages: [],
        markUpPageAttachments: [],
        markUpImageIdentifier: null,
        markUpImageUrl: null,
        markUpKonvaData: null,
        markUpId: null,
        markUpStage: null,
        markUpCreatedBy: null,
        markUpCreatedOn: null,
        markUpHidden: false,
        markUpPrivate: false,
        isMarkUpOwner: false,
        isMarkUpDuplicated: null,
        canEditMarkUp: false,
        userInitialized: false,
        user: null,
        userDetails: null,
        userDetailsInitialized: false,
        userPlanType: "Sidekick",
        userId: null,
        userEmailSubscriber: null,
        isAuthenticated: false,
        isLoading: false,
        loaderStyle: null,
        isHamburgerOpen: false,
        history: [],
        historyPageSize: HISTORY_PAGE_SIZE,
        historyPageNumber: null,
        historyCompleted: false,
        viewHistory: [],
        viewHistoryPageSize: HISTORY_PAGE_SIZE,
        viewHistoryPageNumber: null,
        viewHistoryCompleted: false,
        isCanvasLive: false,
        userEmail: null,
        userFirstName: null,
        isAnonIdSet: false,
        canUndo: false,
        canRedo: false,
        userHamburgerOpen: null,
        isMacOs: navigator.platform.indexOf('Mac') === 0,
        canvasSettingsLoaded: false,
        signUpSource: null,
        cardDetails: {},
        subscriptionDetails: {},
        markUpStats: {},
        previousAuthRoute: null,
        isTouchDevice: false,
        historyTab: 'mine',
        markUpSearchTags: [],
        selectedCollection: null,
        markUpSearchTerm: '',
        isLoadingHistory: false,
        isCanvasObjectSelected: false,
        isAddPageOpen: false,
        isSignatureBoxOpen: false,
        isUpgradeModalOpen: false,
        upgradeModalType: '',
        fromStackCommerce: false,
        couponCode: '',
        googleAccessToken: null,
        teamDetails: null,
        teamMemberToRemove: null,
        teamBrand: null,
        isDraggingMarkUp: false,
        searchCancelToken: null,
        contextMenuStyle: '',
        contextMenuHeigth: null,
        contextMenuWidth: null
      },
      getters: {
      },
      mutations: {
        setContextMenuHeigth(state, payload){
          state.contextMenuHeigth = payload
        },
        setContextMenuWidth(state, payload){
          state.contextMenuWidth = payload
        },
        setContextItemActive(state, payload){
          state.contextMenuStyle = payload.style
        },
        selectTool(state, toolName) {
          this.state.currentSelectedTool = toolName;

          if (toolName === ToolNames.PenTool || toolName === ToolNames.HighlightTool) {
            this.state.lastUsedPenTool = toolName;
          } else if (toolName === ToolNames.ArrowTool || toolName === ToolNames.LineTool) {
            this.state.lastUsedLineTool = toolName;
          } else if (toolName === ToolNames.RectangleTool || toolName === ToolNames.EllipseTool || toolName === ToolNames.BlurTool) {
            this.state.lastUsedShapeTool = toolName;
          }

          if (toolName && toolName !== ToolNames.ImageTool && toolName !== ToolNames.CropTool) {
            this.state.lastUsedTool = toolName;
            localStorage.setItem('currentSelectedTool', toolName);
          }

          localStorage.setItem('lastUsedPenTool', this.state.lastUsedPenTool);
          localStorage.setItem('lastUsedLineTool', this.state.lastUsedLineTool);
          localStorage.setItem('lastUsedShapeTool', this.state.lastUsedShapeTool);
        },
        setMarkUp(state, payload) {
          const markUp = payload != null ? payload.markUp : null;
          const pageNumber = payload != null && payload.pageNumber ? payload.pageNumber : 1;

          this.state.markUp = markUp;
          this.state.markUpId = this.state.markUp ? this.state.markUp.id : null;
          this.state.markUpCreatedBy = this.state.markUp ? this.state.markUp.createdByName : null;
          this.state.markUpCreatedOn = this.state.markUp ? getFormattedDate(this.state.markUp.createdOn) : null;
          this.state.canEditMarkUp = this.state.markUp ? this.state.markUp.canEdit : false;
          this.state.isMarkUpDuplicated = this.state.markUp ? this.state.markUp.isDuplicate : false;
          this.state.markUpHidden = this.state.markUp ? this.state.markUp.isHidden : false;
          this.state.markUpPrivate = this.state.markUp ? this.state.markUp.isPrivate : false;
          this.state.isMarkUpOwner = this.state.markUp ? this.state.markUp.isOwner : false;

          if (this.state.markUp && this.state.markUpHidden) {
            this.state.markUpStats = this.state.markUp.stats;
          } else {
            this.state.markUpStats = {};
          }

          let markUpPage = null;
          if (this.state.markUp) {
            markUpPage = this.state.markUp.pages.find(p => p.order === pageNumber);
          }

          this.state.markUpImageIdentifier = this.state.markUp && markUpPage ? markUpPage.imageIdentifier : null;
          this.state.markUpImageUrl = this.state.markUp && markUpPage ? markUpPage.imageUrl : null;
          this.state.markUpKonvaData = this.state.markUp && markUpPage ? markUpPage.konvaData : null;
          this.state.markUpPageAttachments = this.state.markUp && markUpPage ? markUpPage.attachments : [];

          this.state.markUpPage = markUpPage;
          this.state.markUpPageNumber = markUpPage ? pageNumber : null;
          this.state.markUpPages = this.state.markUp ? this.state.markUp.pages : null;
        },
        setMarkUpStage(state, markUpStage) {
          this.state.markUpStage = markUpStage;
        },
        setMarkUpPages(state, payload) {
          const pages = payload.pages;
          const pageNumber = payload.pageNumber;
          if (this.state.markUp && pages) {
            this.state.markUp.pages = pages;
            this.state.markUpPages = pages;
            this.state.markUpPageNumber = pageNumber;
            this.state.markUpPage = pages[pageNumber - 1];

            this.state.markUpImageIdentifier = this.state.markUpPage.imageIdentifier;
            this.state.markUpImageUrl = this.state.markUpPage.imageUrl;
            this.state.markUpKonvaData = this.state.markUpPage.konvaData;
            this.state.markUpPageAttachments = this.state.markUpPage.attachments;
          }
        },
        setMarkUpPage(state, pageNumber) {
          if (this.state.markUp && this.state.markUpPages && this.state.markUpPageNumber !== pageNumber) {
            const markUpPage = this.state.markUpPages[pageNumber - 1];
            this.state.markUpImageIdentifier = markUpPage.imageIdentifier;
            this.state.markUpImageUrl = markUpPage.imageUrl;
            this.state.markUpKonvaData = markUpPage.konvaData;

            this.state.markUpPage = markUpPage;
            this.state.markUpPageNumber = pageNumber;
          }
        },
        setMarkUpPrivate(state, isPrivate) {
          if (this.state.markUp) {
            this.state.markUp.isPrivate = isPrivate;
            this.state.markUpPrivate = isPrivate;
          }
        },
        setMarkUpKonvaData(state, payload) {
          const markUpPage = payload.markUpPage;
          const konvaData = payload.konvaData;

          markUpPage.konvaData = konvaData;

          if (this.state.markUpPage && this.state.markUpPage.id && this.state.markUpPage.id === markUpPage.id) {
            this.state.markUpKonvaData = konvaData;
            this.state.markUpPage.konvaData = konvaData;
          }
        },
        addMarkUpPageAttachment(state, attachment) {
          if (this.state.markUp && this.state.markUpPage && this.state.markUpPageAttachments) {
            this.state.markUpPageAttachments.push(attachment);

            if (!this.state.markUpPage.attachments) {
              this.state.markUpPage.attachments = this.state.markUpPageAttachments;
            }
          }
        },
        setLoading(state, payload) {
          if (typeof payload === 'boolean') {
            this.state.isLoading = payload;
            this.state.loaderStyle = null;
          } else {
            this.state.isLoading = payload.isLoading;
            this.state.loaderStyle = payload.loaderStyle;
          }
        },
        setUser(state, user) {
          this.state.user = user;
          this.state.isAuthenticated = !!user;

          this.state.userFirstName = user ? user.attributes.given_name : null;
          this.state.userEmail = user ? user.attributes.email : null;
          this.state.userEmailSubscriber = user ? user.attributes['custom:email_subscriber'] === '1' : null;
          this.state.userId = user ? user.username : null;
          this.state.userInitialized = true;

          if (this.state.userId) {
            window.gist.identify(this.state.userId, {
              user_id: this.state.userId,
              email: this.state.userEmail,
              is_subscriber: this.state.userEmailSubscriber,
              name: this.state.userFirstName,
              user_type: this.state.userPlanType,
              tags: this.state.userPlanType
            });
          }
        },
        setUserDetails(state, userDetails) {
          this.state.userDetails = userDetails;
          this.state.userPlanType = userDetails ? userDetails.planType : "Sidekick";
          this.state.userDetailsInitialized = true;

          if (this.state.userId) {
            window.gist.identify(this.state.userId, {
              user_id: this.state.userId,
              email: this.state.userEmail,
              is_subscriber: this.state.userEmailSubscriber,
              name: this.state.userFirstName,
              user_type: this.state.userPlanType,
              tags: this.state.userPlanType
            });
          }
        },
        setTeamDetails(state, teamDetails) {
          this.state.teamDetails = teamDetails;
        },
        setTeamBrand(state, teamBrand) {
          this.state.teamBrand = teamBrand;
        },
        setTeamMemberToRemove(state, member) {
          this.state.teamMemberToRemove = member;
        },
        setHamburgerOpen(state, open) {
          this.state.isHamburgerOpen = open;
        },
        setHistory(state, history) {
          this.state.history = history;
        },
        setViewHistory(state, viewHistory) {
          this.state.viewHistory = viewHistory;
        },
        setCanvasLive(state, isCanvasLive) {
          this.state.isCanvasLive = isCanvasLive;
        },
        setLineThickness(state, lineThickness) {
          if (lineThickness === null && this.state.currentLineThickness === null) {
            return;
          }

          if (lineThickness) {
            this.state.previousLineThickness = lineThickness;
            this.state.currentLineThickness = lineThickness;

            localStorage.setItem('currentLineThickness', this.state.currentLineThickness);
          } else {
            this.state.previousLineThickness = this.state.currentLineThickness;
            this.state.currentLineThickness = null;
          }
        },
        setPreviousLineThickness() {
          if (this.state.currentLineThickness === null) {
            this.commit('setLineThickness', this.state.previousLineThickness);
          }
        },
        setCurrentColor(state, color) {
          this.state.currentColor = color;

          localStorage.setItem('currentColor', color);
        },
        setCanUndo(state, canUndo) {
          this.state.canUndo = canUndo;
        },
        setCanRedo(state, canRedo) {
          this.state.canRedo = canRedo;
        },
        setHistoryPageNumber(state, pageNumber) {
          this.state.historyPageNumber = pageNumber;
        },
        setHistoryPageSize(state, pageSize) {
          this.state.historyPageSize = pageSize;
        },
        setHistoryPageCompleted(state, completed) {
          this.state.historyCompleted = completed;
        },
        resetHistoryPage() {
          this.state.historyPageNumber = null;
          this.state.historyPageSize = HISTORY_PAGE_SIZE;
          this.state.historyCompleted = false;
          this.state.history = [];
        },
        setViewHistoryPageNumber(state, pageNumber) {
          this.state.viewHistoryPageNumber = pageNumber;
        },
        setViewHistoryPageSize(state, pageSize) {
          this.state.viewHistoryPageSize = pageSize;
        },
        setViewHistoryPageCompleted(state, completed) {
          this.state.viewHistoryCompleted = completed;
        },
        resetViewHistoryPage() {
          this.state.viewHistoryPageNumber = null;
          this.state.viewHistoryPageSize = HISTORY_PAGE_SIZE;
          this.state.viewHistoryCompleted = false;
          this.state.viewHistory = [];
        },
        setUserHamburgerOpen(state, open) {
          if (this.state.isAuthenticated && this.state.userId) {
            this.state.userHamburgerOpen = open;
            localStorage.setItem(`${this.state.userId}_${hamburgerOpenSettingPostfix}`, open ? 'true' : 'false');
          }
        },
        setSignUpSource(state, source) {
          this.state.signUpSource = source;
        },
        setCardDetails(state, cardDetails) {
          this.state.cardDetails = cardDetails;
        },
        clearCardDetails() {
          this.state.cardDetails = {};
        },
        setSubscriptionDetails(state, subscriptionDetails) {
          this.state.subscriptionDetails = subscriptionDetails;
        },
        setPreviousAuthRoute(state, authRoute) {
          this.state.previousAuthRoute = authRoute;
        },
        setMarkUpSearchTerm(state, searchTerm) {
          this.state.markUpSearchTerm = searchTerm;
        },
        setMarkUpSearchTags(state, tags) {
          this.state.markUpSearchTags = tags;
        },
        addMarkUpSearchTags(state, tags) {
          this.state.markUpSearchTags.push(...tags);
        },
        deleteMarkUpSearchTags(state, tags) {
          for (let deletedTag of tags) {
            const index = this.state.markUpSearchTags.indexOf(deletedTag);
            if (index > -1) {
              this.state.markUpSearchTags.splice(index, 1);
            }
          }
        },
        setSelectedCollection(state, collection) {
          this.state.selectedCollection = collection;
        },
        setHistoryTab(state, tab) {
          this.state.historyTab = tab;
        },
        setLoadingHistory(state, loadingHistory) {
          this.state.isLoadingHistory = loadingHistory;
        },
        setIsCanvasObjectSelected(state, selected) {
          this.state.isCanvasObjectSelected = selected;
        },
        setIsAddPageOpen(state, isOpen) {
          this.state.isAddPageOpen = isOpen;
        },
        setIsSignatureBoxOpen(state, isOpen) {
          this.state.isSignatureBoxOpen = isOpen;
        },
        openUpgradeModal(state, modalType) {
          this.state.isUpgradeModalOpen = true;
          this.state.upgradeModalType = modalType;
        },
        closeUpgradeModal() {
          this.state.isUpgradeModalOpen = false;
        },
        setFromStackCommerce(state, fromStackCommerce) {
          this.state.fromStackCommerce = fromStackCommerce;
        },
        setCouponCode(state, code) {
          this.state.couponCode = code;
        },
        setGoogleAccessToken(state, accessToken) {
          this.state.googleAccessToken = accessToken;
        },
        setIsDraggingMarkUp(state, isDraggingMarkUp) {
          this.state.isDraggingMarkUp = isDraggingMarkUp;
        }
      },
      actions: {
        async ensureUserInitialized(context) {
          if (!context.state.userInitialized) {
            try {
              const user = await Auth.currentAuthenticatedUser();
              await context.commit('setUser', user);
            } catch {
              await context.commit('setUser', null);
            } finally {
              await setAnonId();
            }
          }

          if (!context.state.userDetailsInitialized) {
            const userDetails = await getDetails();
            await context.commit('setUserDetails', userDetails);
          }
        },
        awaitUntilUserInitialized(context) {
          return new Promise((resolve) => {
            if (context.state.userInitialized) {
              return resolve();
            }

            const tid = setInterval(() => {
              if (context.state.userInitialized) {
                clearInterval(tid);
                return resolve();
              }
            }, 150);
          });
        },
        awaitUntilUserDetailsInitialized(context) {
          return new Promise((resolve) => {
            if (context.state.userDetailsInitialized) {
              return resolve();
            }

            const tid = setInterval(() => {
              if (context.state.userDetailsInitialized) {
                clearInterval(tid);
                return resolve();
              }
            }, 150);
          });
        },
        async retrieveHistory(context, payload) {
          if (payload.pageSize === undefined) {
            payload.pageSize = HISTORY_PAGE_SIZE;
          }

          let shouldRefresh = payload.refresh;
          if (payload.pageSize && payload.pageSize !== context.state.historyPageSize) {
            await context.commit('setHistoryPageSize', payload.pageSize);
            shouldRefresh = true;
          }

          let newPageNumber = context.state.historyPageNumber;
          let newHistory = [];
          if (shouldRefresh || !newPageNumber) {
            await context.commit('resetHistoryPage');
            newPageNumber = 1;
          } else if (context.state.historyCompleted) {
            return true;
          } else {
            newPageNumber++;
            newHistory = context.state.history;
          }

          if (context.state.searchCancelToken) context.state.searchCancelToken.cancel();

          const CancelToken = axios.CancelToken;
          context.state.searchCancelToken = CancelToken.source();

          const historyResponse = await searchMarkUps({
            tags: this.state.markUpSearchTags,
            searchTerm: this.state.markUpSearchTerm
          }, {
            size: payload.pageSize,
            page: newPageNumber
          }, context.state.searchCancelToken.token);
          historyResponse.forEach(h => {
            h.createdOn = getFormattedDate(h.createdOn);
          });
          newHistory.push(...historyResponse);

          const isCompleted = (historyResponse.length === 0 || historyResponse.length < payload.pageSize);

          await context.commit('setHistory', newHistory);
          await context.commit('setHistoryPageNumber', newPageNumber);
          await context.commit('setHistoryPageCompleted', isCompleted);

          context.state.searchCancelToken = null;

          return isCompleted;
        },
        async retrieveViewHistory(context, payload) {
          if (payload.pageSize === undefined) {
            payload.pageSize = HISTORY_PAGE_SIZE;
          }

          let shouldRefresh = payload.refresh;
          if (payload.pageSize && payload.pageSize !== context.state.viewHistoryPageSize) {
            await context.commit('setViewHistoryPageSize', payload.pageSize);
            shouldRefresh = true;
          }

          let newPageNumber = context.state.viewHistoryPageNumber;
          let newHistory = [];
          if (shouldRefresh || !newPageNumber) {
            await context.commit('resetViewHistoryPage');
            newPageNumber = 1;
          } else if (context.state.viewHistoryCompleted) {
            return true;
          } else {
            newPageNumber++;
            if (newPageNumber > 1) {
              newHistory = context.state.viewHistory;
            }
          }

          const viewHistoryResponse = await getViewedMarkUpHistory({
            size: payload.pageSize,
            page: newPageNumber
          });
          viewHistoryResponse.forEach(h => {
            h.createdOn = getFormattedDate(h.createdOn);
          });
          newHistory.push(...viewHistoryResponse);

          const isCompleted = (viewHistoryResponse.length === 0 || viewHistoryResponse.length < payload.pageSize);

          await context.commit('setViewHistory', newHistory);
          await context.commit('setViewHistoryPageNumber', newPageNumber);
          await context.commit('setViewHistoryPageCompleted', isCompleted);

          return isCompleted;
        },
        async ensureUpdatedViewHistory(context, payload) {
          let exists = false;
          for (let item of context.state.viewHistory) {
            if (item.markUpId === payload.markUpId) {
              exists = true;
              break;
            }
          }

          if (!exists) {
            await context.dispatch('retrieveViewHistory', {
              refresh: true
            });
          }
        },
        async loadUserCanvasSettings(context) {
          if (context.state.canvasSettingsLoaded) return;

          const currentSelectedTool = localStorage.getItem('currentSelectedTool');
          if (currentSelectedTool) {
            context.state.currentSelectedTool = currentSelectedTool;
          }

          const currentLineThickness = localStorage.getItem('currentLineThickness');
          if (currentLineThickness) {
            context.state.currentLineThickness = Number(currentLineThickness);
          }

          const currentColor = localStorage.getItem('currentColor');
          if (currentColor) {
            context.state.currentColor = currentColor;
          }

          const lastUsedPenTool = localStorage.getItem('lastUsedPenTool');
          if (lastUsedPenTool) {
            context.state.lastUsedPenTool = lastUsedPenTool;
          }

          const lastUsedLineTool = localStorage.getItem('lastUsedLineTool');
          if (lastUsedLineTool) {
            context.state.lastUsedLineTool = lastUsedLineTool;
          }

          const lastUsedShapeTool = localStorage.getItem('lastUsedShapeTool');
          if (lastUsedShapeTool) {
            context.state.lastUsedShapeTool = lastUsedShapeTool;
          }

          context.state.canvasSettingsLoaded = true;
        },
        async changeCurrentMarkUpPage(context, payload) {
          const pageNumber = payload.pageNumber || 1;

          if (context.state.markUp && context.state.markUpPages && pageNumber >= 1 && pageNumber <= context.state.markUpPages.length && context.state.markUpPageNumber !== pageNumber) {
            await context.commit('setMarkUpPage', pageNumber);
          }
        },
        async deleteMarkUpPage(context, payload) {
          const page = payload.page;
          const imageIdentifier = page.imageIdentifier;
          const markUp = await deleteMarkUpPage(context.state.markUpId, imageIdentifier);
          if (markUp) {
            const pageNumber = context.state.markUpPageNumber >= page.order ? 1 : context.state.markUpPageNumber;
            await context.commit('setMarkUpPages', {
              pages: markUp.pages,
              pageNumber,
              deletedPageNumber: page.order
            });
            return true;
          }

          return false;
        },
        determineIfTouchDevice(context) {
          context.state.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
        },
        async refreshUserDetails(context) {
          const userDetails = await getDetails();
          await context.commit('setUserDetails', userDetails);
        },
        async refreshTeamDetails(context) {
          const teamDetails = await getTeamDetails();
          await context.commit('setTeamDetails', teamDetails);
        },
        async refreshTeamBrand(context) {
          const teamBrand = await getTeamBrand();
          await context.commit('setTeamBrand', teamBrand);
        },
        async isGoogleUserAuthorized(context, payload) {
          const {userId, gAuth} = payload;
          await context.dispatch('awaitUntilGAuthInitialized', gAuth);

          if (!gAuth.isAuthorized || userId != gAuth.GoogleAuth.currentUser.get().getId()) return false;

          const accessToken = gAuth.GoogleAuth.currentUser.get().getAuthResponse();
          if (!accessToken || !accessToken.access_token) return false;

          context.commit('setGoogleAccessToken', accessToken.access_token);

          return true;
        },
        async ensureGoogleUserAuthorized(context, payload) {
          const {gAuth} = payload;
          await context.dispatch('awaitUntilGAuthInitialized', gAuth);

          try {
            if (!(await context.dispatch('isGoogleUserAuthorized', payload))) {
              await gAuth.signIn();
            }

            const accessToken = gAuth.GoogleAuth.currentUser.get().getAuthResponse();
            context.commit('setGoogleAccessToken', accessToken.access_token);

            return true;
          } catch (err) {
            console.err(err);
            return false;
          }
        },
        async reAuthorizeUser(context, gAuth) {
          await context.dispatch('awaitUntilGAuthInitialized', gAuth);

          try {
            await gAuth.signIn();

            const accessToken = gAuth.GoogleAuth.currentUser.get().getAuthResponse();
            context.commit('setGoogleAccessToken', accessToken.access_token);

            return true;
          } catch (err) {
            console.err(err);
            return false;
          }
        },
        awaitUntilGAuthInitialized(context, gAuth) {
          return new Promise((resolve) => {
            let checkInterval = setInterval(() => {
              if(gAuth.isInit) {
                clearInterval(checkInterval);
                resolve();
              }
            }, 50);
          });
        }
      }
    });
  }
  return store;
}
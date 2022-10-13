<template>
  <div class="my-markups">
    <h2 v-if="selectedCollection">{{selectedCollection}}</h2>
    <h2 v-if="!selectedCollection">My Markups</h2>
    <p v-if="!selectedCollection">All the markups you own. Drag markups to sort them into collections.</p>
    <p v-if="selectedCollection">Markups in this collection<span>|</span><a class="edit-collection" v-on:click.prevent="editCollection">Edit</a></p>
    <div class="default-tags">
      <div class="markup-search-container">
        <input type="search" placeholder="Search Markups" v-model="searchTerm" v-on:change="onSearchTermChange" @keyup.enter="onSearchTermChange" v-on:focus.passive="onSearchTermFocus" />
        <button class="clear-search" v-if="searchTerm" v-on:click.prevent="clearSearchTerm()">
          <span class="icon icon-close"></span>
        </button>
      </div>
      <button class="tag-bubble" v-bind:class="{'tag-bubble--active': DefaultTags.map(dt => dt.name).filter(dt => markUpSearchTags.indexOf(dt) > -1).length === 0 && markUpSearchTags.indexOf('starred') === -1}" v-on:click.passive="defaultTagSelected('All')">
        <span class="tag-bubble-name">All</span><span class="tag-bubble-count" v-if="!selectedCollection"> ({{userDetails.totalMarkUps}})</span>
      </button>
      <button class="tag-bubble" v-bind:class="{'tag-bubble--active': markUpSearchTags.indexOf('starred') > -1}" v-on:click.passive="defaultTagSelected('starred')" v-if="userDetails.tags && userDetails.tags.find(t => t.tag === 'starred')">
        <span class="tag-bubble-name">Starred</span><span class="tag-bubble-count" v-if="!selectedCollection"> ({{userDetails.tags && userDetails.tags.find(t => t.tag === 'starred') ? userDetails.tags.find(t => t.tag === 'starred').count : 0}})</span>
      </button>
      <button class="tag-bubble" v-for="tagUsage in userDetails.tags.filter(t => DefaultTags.map(dt => dt.name).indexOf(t.tag) > -1)" :key="tagUsage.tag" v-bind:class="{'tag-bubble--active': markUpSearchTags.indexOf(tagUsage.tag) > -1}" v-on:click.passive="defaultTagSelected(tagUsage.tag)">
        <span class="tag-bubble-name" v-if="tagUsage.tag !== 'starred'">{{DefaultTags.find(dt => dt.name === tagUsage.tag).displayName}}</span><span class="tag-bubble-count" v-if="!selectedCollection"> ({{tagUsage.count}})</span>
      </button>
    </div>
    <div class="history-section">
      <div v-if="!isLoadingHistory && (!history || history.length === 0)" class="no-markups">No Markups</div>
      <div class="markup-item" v-for="item in history" :key="item.markUpId" :id="item.markUpId">
        <a :href="getMarkUpSharePath({markUpId: item.markUpId, isPrivate: item.isPrivate})" v-on:click.prevent="navigateToMarkUp(item.markUpId, 1, item.isPrivate)"  class="history-image-wrapper">
          <div class="history-image" :id="item.markUpId">
            <img :src="item.thumbnailUrl" :alt="item.markUpId" @error="replaceThumbnailWithDefault">
          </div>
          <div class="multi-page-count" v-if="item.numberOfPages > 1">{{item.numberOfPages}}</div>
        </a>
        <button class="nav-btn nav-btn--small nav-btn--star" v-bind:class="{'nav-btn--star--active': item.tags.indexOf('starred') > -1}" v-on:click.prevent="starMarkUp(item)"><span class="icon icon-star"></span></button>
        <button class="nav-btn nav-btn--small nav-btn--open" v-on:click.prevent="navigateToMarkUpInNewTab(item.markUpId, item.isPrivate)"><span class="icon icon-open"></span></button>
        <div class="markup-title">
          <EditableField v-model="item.title" @onSave="onTitleSave(item)" :initialValue="item.title" maxCharacters="50" :onFocus="() => onMarkUpTitleFocus()" />
        </div>
        <div class="history-text--wrapper">
          <a :href="getMarkUpSharePath({markUpId: item.markUpId, isPrivate: item.isPrivate})" class="history-text" v-on:click.prevent="navigateToMarkUp(item.markUpId, 1, item.isPrivate)">
            <div class="last-modified"><img src="../../assets/pen.svg" alt="Edited"><span>{{item.timeLapsedDescription}}</span></div>
            <div class="creator"><span>{{item.isDuplicate ? 'Duplicated' : 'Created'}} {{item.createdOn}}</span></div>
          </a>
          <div class="dropdown" v-click-outside="hideMarkUpOptions">
            <button class="nav-btn nav-btn--small markup-controls" title="Options" v-on:click.prevent="showMarkUpOptions(item.markUpId)">
              <span class="icon icon-more"></span>
            </button>
            <div class="dropdown-menu" v-if="item.markUpId === markUpDropdown">
              <button class="dropdown-item" title="Copy link to clipboard" v-on:click.prevent="copyShareLink(item.markUpId, item.isPrivate)">
                <span class="icon icon-link"></span>
                <span class="nav-text">Copy link</span>
              </button>
              <button class="dropdown-item" title="Download markup as image" v-on:click.prevent="downloadMarkUp(item.markUpId)">
                <span class="icon icon-download"></span>
                <span class="nav-text">Download image</span>
              </button>
              <button class="dropdown-item" title="Export markup as PDF" v-on:click.prevent="exportAsPdf(item.markUpId)">
                <span class="icon icon-export"></span>
                <span class="nav-text">Export PDF</span>
              </button>
              <button v-if="userPlanType === 'SuperHero'" class="dropdown-item" title="Duplicate markup" v-on:click.prevent="duplicateMarkUp(item.markUpId)">
                <span class="icon icon-duplicate"></span>
                <span class="nav-text">Duplicate markup</span>
              </button>
              <hr>
              <button class="dropdown-item dropdown-item--red" title="Delete markup" v-on:click.prevent="deleteMarkUp(item.markUpId)">
                <span class="icon icon-delete"></span>
                <span class="nav-text nav-text--delete">Delete markup</span>
              </button>
            </div>
          </div>
        </div>
        <div class="markup-tags">
          <div class="markup-tag" v-for="tag in item.tags.filter(t => t !== 'starred' && !DefaultTags.find(dt => dt.name === t))" :key="tag">
            <button v-on:click.prevent="tagSelected(tag)" class="collection-go">{{tag}}</button><button class="collection-remove" v-on:click.prevent="removeMarkUpFromCollection(item.markUpId, tag)"><span class="collection-remove-icon"></span></button>
          </div>
        </div>
      </div>
      <infinite-loading @infinite="scrollHandler">
        <span slot="no-more"></span>
        <span slot="no-results"></span>
      </infinite-loading>
      <div v-if="userPlanType === 'Sidekick'" class="viewer-cta"><span><strong>Want to see more history?</strong> Create a free account</span><button v-on:click.prevent="navigateToSignUp('above_markup_button-viewer')">Sign Up</button></div>
      <div v-if="userPlanType === 'Hero'" class="viewer-cta"><span><strong>See your full history and add tags.</strong> Upgrade to Superhero</span><button v-on:click.prevent="navigateToUpgrade()">Upgrade</button></div>
    </div>
    <EditCollectionModal v-if="showEditCollection" :oldTag="initialRenameCollectionValue" :editMode="editCollectionMode" />
  </div>
</template>

<script>
  import {mapActions, mapMutations, mapState} from "vuex";
  import {
    addMarkUpTag,
    deleteMarkUpTag,
    getMarkUpDownloadUrl,
    getMarkUpSharePath,
    getMarkUpShareUrl,
    duplicateMarkUp, deleteMarkUp, exportMarkUpAsPdf, changeMarkUpTitle, deleteTag, waitUntilJobsCompleted, renameTag
  } from "../../services/markUpService";
  import DefaultThumbnail from "../../assets/default-thumbnail.svg";
  import navigationPresets from "../../navigationPresets";
  import {DefaultTags, HISTORY_PAGE_SIZE, Notifications} from "../../constants";
  import EventBus from "../../stores/eventBus";
  import {copyTextToClipboard} from "../../utils";
  import {
    trackMarkUpDelete,
    trackMarkUpDuplicate,
    trackMarkUpTagRemove,
    trackTrackPdfExport
  } from "../../services/analytics";
  import InfiniteLoading from 'vue-infinite-loading';
  import EditableField from '@/components/Shared/EditableField';
  import { Draggable } from '@shopify/draggable';
  import EditCollectionModal from "@/components/Shared/EditCollectionModal";

  export default {
    name: "MyMarkups",
    components: {EditCollectionModal, EditableField, InfiniteLoading},
    data() {
      return {
        DefaultTags: DefaultTags,
        markUpDropdown: '',
        historyInitialized: false,
        renderTagInput: true,
        currentDraggingMarkUpId: null,
        currentDroppingCollection: null,
        searchTerm: this.$store.state.markUpSearchTerm,
        showEditCollection: false,
        currentNewCollectionMarkUpId: null,
        editCollectionMode: false,
        initialRenameCollectionValue: ''
      };
    },
    computed: {
      ...mapState([
        'history',
        'historyTab',
        'userDetails',
        'userPlanType',
        'markUpSearchTags',
        'historyCompleted',
        'teamBrand',
        'markUpSearchTerm',
        'selectedCollection',
        'isDraggingMarkUp',
        'isTouchDevice',
        'isLoadingHistory'
      ])
    },
    async mounted() {
      await this.awaitUntilUserDetailsInitialized();
      await this.ensureHistoryState();

      this.setMarkUpSearchTerm(this.searchTerm);

      EventBus.$on('tagsChanged', (newTags) => this.onSearchTagsChanges(newTags));
      EventBus.$on('closeEditCollectionModal', () => {
        this.showEditCollection = false;
      });
      EventBus.$on('deleteCollection', () => {
        this.deleteCollection();
      });
      EventBus.$on('saveCollection', (tag) => {
        this.saveCollection(tag);
      });

      let draggableOptions = {
        draggable: '.history-image, .droppable-collection',
        mirror: {}
      };

      if (!this.isTouchDevice) {
        draggableOptions = {
          ...draggableOptions,
          mirror: {
            constrainDimensions: true,
            cursorOffsetX: 2,
            cursorOffsetY: 2
          },
          delay: 150
        }
      } else {
        draggableOptions = {
          ...draggableOptions,
          delay: 100
        }
      }

      const draggable = new Draggable(document.querySelectorAll('.history-wrapper'), draggableOptions);

      draggable.on('drag:start', (evt) => {
        if (evt.data.source.classList.contains('droppable-collection') || this.historyTab === 'viewed') evt.cancel();

        this.setIsDraggingMarkUp(true);
        this.currentDraggingMarkUpId = evt.data.source.id;
      });

      draggable.on('drag:over', (evt) => {
        if (evt.data.over.classList.contains('history-image')) return evt.cancel();

        this.currentDroppingCollection = evt.data.over.id;
      });

      draggable.on('drag:out', () => {
        this.currentDroppingCollection = null;
      });

      draggable.on('drag:stop', () => {
        this.setIsDraggingMarkUp(false);

        if (this.currentDroppingCollection) {
          if (this.currentDroppingCollection === 'new-markup-collection-z97s') {
            this.currentNewCollectionMarkUpId = this.currentDraggingMarkUpId;
            this.createCollection();
          } else {
            this.addMarkUpToCollection(this.currentDraggingMarkUpId, this.currentDroppingCollection);
          }
        }

        this.currentDroppingCollection = null;
        this.currentDraggingMarkUpId = null;
      });
    },
    destroyed() {
      EventBus.$off('tagsChanged');
      EventBus.$off('deleteCollection');
      EventBus.$off('saveCollection');
    },
    methods: {
      getMarkUpSharePath(details) {
        return getMarkUpSharePath(details);
      },
      replaceThumbnailWithDefault(e) {
        e.target.src = DefaultThumbnail;
      },
      async onSearchTagsChanges(changedTags) {
        this.addMarkUpSearchTags(changedTags.addedTags);
        this.deleteMarkUpSearchTags(changedTags.deletedTags);

        this.setLoadingHistory(true);
        await this.retrieveHistory({
          refresh: true,
          pageSize: HISTORY_PAGE_SIZE
        });
        this.setLoadingHistory(false);

        await this.refreshTagInput();
      },
      async defaultTagSelected(tag) {
        if (tag === 'All') {
          for (const defaultTag of DefaultTags) {
            if (this.markUpSearchTags.indexOf(defaultTag.name) !== -1)
              this.deleteMarkUpSearchTags([defaultTag.name]);
          }

          this.deleteMarkUpSearchTags(['starred']);
        } else if (tag === 'starred') {
          for (const defaultTag of DefaultTags) {
            if (this.markUpSearchTags.indexOf(defaultTag.name) !== -1)
              this.deleteMarkUpSearchTags([defaultTag.name]);
          }

          if (this.markUpSearchTags.indexOf('starred') === -1) this.addMarkUpSearchTags([tag]);
        } else {
          for (const defaultTag of DefaultTags) {
            if (defaultTag.name !== tag && this.markUpSearchTags.indexOf(defaultTag.name) !== -1)
              this.deleteMarkUpSearchTags([defaultTag.name]);
          }

          this.deleteMarkUpSearchTags(['starred']);

          if (this.markUpSearchTags.indexOf(tag) === -1) this.addMarkUpSearchTags([tag]);
          else return;
        }

        this.setLoadingHistory(true);
        await this.retrieveHistory({
          refresh: true,
          pageSize: HISTORY_PAGE_SIZE
        });
        this.setLoadingHistory(false);

        await this.refreshTagInput();
      },
      async ensureHistoryState() {
        if (this.history.length === 0) {
          this.setLoadingHistory(true);
          await this.retrieveHistory({
            refresh: true,
            pageSize: HISTORY_PAGE_SIZE
          });
          this.setLoadingHistory(false);
        }

        this.historyInitialized = true;
      },
      async starMarkUp(historyItem) {
        if (this.userPlanType !== 'SuperHero') return this.openUpgradeModal('star');

        this.setLoading(true);
        try {
          const starredIndex = historyItem.tags.indexOf('starred');
          if (starredIndex === -1) {
            await addMarkUpTag(historyItem.markUpId, 'starred');
            historyItem.tags.push('starred');
          } else {
            await deleteMarkUpTag(historyItem.markUpId, 'starred');
            historyItem.tags.splice(starredIndex, 1);
          }
        } catch (err) {
          this.showErrorMsg();
        } finally {
          this.setLoading(false);
        }
      },
      hideMarkUpOptions() {
        this.markUpDropdown = null;
      },
      showMarkUpOptions(markUpId) {
        if (this.markUpDropdown === markUpId) {
          this.markUpDropdown = '';
        } else {
          this.markUpDropdown = markUpId;
        }
      },
      async copyShareLink(markUpId, isPrivate) {
        this.hideMarkUpOptions();
        this.markUpDropdown = '';
        await copyTextToClipboard(getMarkUpShareUrl({
          markUpId,
          isPrivate,
          isTeamMember: this.teamBrand.isTeamMember,
          customDomain: this.teamBrand.customDomain
        }));
        this.showLinkCopiedMsg();
      },
      async downloadMarkUp(markUpId) {
        try {
          this.hideMarkUpOptions();
          this.markUpDropdown = '';
          this.setLoading(true);
          const url = await getMarkUpDownloadUrl(markUpId);
          window.location = url;
        } catch (err) {
          this.showErrorMsg();
        } finally {
          this.setLoading(false);
        }
      },
      async duplicateMarkUp(markUpId) {
        this.setLoading(true);
        try {
          const newMarkUp = await duplicateMarkUp(markUpId);
          this.showMarkUpDuplicatedMsg();
          trackMarkUpDuplicate(markUpId, this.canEditCurrentMarkUp);
          this.navigateToMarkUp(newMarkUp.id);
          setTimeout(async () => {
            EventBus.$emit('refreshAllHistory');
          }, 500);
        } catch {
          this.showErrorMsg();
        } finally {
          this.setLoading(false);
        }
      },
      async deleteMarkUp(markUpId) {
        try {
          this.setLoading(true);
          await deleteMarkUp(markUpId);
          trackMarkUpDelete();
          const itemIndex = this.history.indexOf(this.history.find(h => h.markUpId === markUpId));
          if (itemIndex > -1) this.history.splice(itemIndex, 1);
          this.markUpDropdown = '';
          this.setLoading(false);
          this.showMarkUpDeleteMsg();
        } catch (err) {
          this.showErrorMsg();
        }
      },
      async scrollHandler($state) {
        if (this.loadingHistory || !this.historyInitialized || this.historyCompleted) {
          return setTimeout(() => {
            $state.loaded();
          }, 1000);
        }

        this.setLoadingHistory(true);
        await this.retrieveHistory({
          refresh: false,
          pageSize: HISTORY_PAGE_SIZE
        });
        this.setLoadingHistory(false);

        $state.loaded();
      },
      async tagSelected(tag) {
        EventBus.$emit('selectCollection', tag);

        // this.setLoadingHistory(true);
        // this.setMarkUpSearchTags([tag]);
        // await this.retrieveHistory({
        //   refresh: true,
        //   pageSize: HISTORY_PAGE_SIZE
        // });
        // this.setLoadingHistory(false);
        //
        // await this.refreshTagInput();
      },
      async removeMarkUpFromCollection(markUpId, tag) {
        deleteMarkUpTag(markUpId, tag);

        const markUpItem = this.history.find(h => h.markUpId === markUpId);
        if (markUpItem && markUpItem.tags.find(t => t === tag)) {
          markUpItem.tags.splice(markUpItem.tags.indexOf(tag), 1);

          if (this.selectedCollection === tag) {
            this.history.splice(this.history.indexOf(markUpItem), 1);
          }
        }

        const existingTag = this.userDetails.tags.find(t => t.tag === tag);
        if (existingTag) {
          existingTag.count--;

          if (existingTag.count <= 0) {
            this.userDetails.tags.splice(this.userDetails.tags.indexOf(existingTag), 1);
            EventBus.$emit('selectCollection', null);
          }
        }

        trackMarkUpTagRemove(markUpId, tag);
      },
      async refreshTagInput() {
        this.renderTagInput = false;
        await this.$nextTick();
        this.renderTagInput = true;
      },
      async exportAsPdf(markUpId) {
        this.hideMarkUpOptions();
        this.markUpDropdown = '';

        if (this.userPlanType !== 'SuperHero') return this.openUpgradeModal('export');

        this.setLoading({
          isLoading: true,
          loaderStyle: 'exportPdf'
        });
        try {
          const downloadLink = await exportMarkUpAsPdf(markUpId);
          window.location.href = downloadLink;
          trackTrackPdfExport(markUpId);
        } catch {
          this.showErrorMsg();
        } finally {
          this.setLoading(false);
        }
      },
      async onTitleSave(markUp) {
        if (this.userPlanType !== 'SuperHero') return;

        try {
          await changeMarkUpTitle(markUp.markUpId, markUp.title);
        } catch {
          this.showErrorMsg();
        }
      },
      async addMarkUpToCollection(markUpId, tag) {
        if (this.userPlanType !== 'SuperHero') return this.openUpgradeModal('collections');

        try {
          const markUpItem = this.history.find(h => h.markUpId === markUpId);
          if (markUpItem && markUpItem.tags.find(t => t === tag)) {
            this.showMarkUpAlreadyInCollection();
            return;
          }

          const existingTag = this.userDetails.tags.find(t => t.tag === tag);
          if (existingTag) {
            existingTag.count++;
          }

          markUpItem.tags.push(tag);

          await addMarkUpTag(markUpId, tag);
        } catch (err) {
          this.showErrorMsg();
        }
      },
      onSearchTermFocus() {
        if (this.userPlanType !== 'SuperHero') {
          this.openUpgradeModal('search');
        }
      },
      async onSearchTermChange() {
        if (this.markUpSearchTerm === this.searchTerm) return;
        await this.setMarkUpSearchTerm(this.searchTerm);

        this.setLoadingHistory(true);
        await this.retrieveHistory({
          refresh: true,
          pageSize: HISTORY_PAGE_SIZE
        });
        await this.setLoadingHistory(false);
      },
      clearSearchTerm() {
        this.searchTerm = '';
        if (this.markUpSearchTerm !== '') this.onSearchTermChange();
      },
      onMarkUpTitleFocus() {
        if (this.userPlanType !== 'SuperHero') this.openUpgradeModal('title');
      },
      createCollection() {
        if (this.userPlanType !== 'SuperHero') return this.openUpgradeModal('collections');

        // Done to deal with v-click-outside race condition
        setTimeout(() => {
          this.editCollectionMode = false;
          this.showEditCollection = true;
          this.initialRenameCollectionValue = '';
        }, 5);
      },
      editCollection() {
        if (this.userPlanType !== 'SuperHero') return this.openUpgradeModal('collections');

        // Done to deal with v-click-outside race condition
        setTimeout(() => {
          this.editCollectionMode = true;
          this.showEditCollection = true;
          this.initialRenameCollectionValue = this.selectedCollection;
        }, 5);
      },
      async deleteCollection() {
        try {
          this.setLoading(true);

          const jobIds = await deleteTag(this.selectedCollection);
          await waitUntilJobsCompleted(jobIds);

          await this.refreshUserDetails();
          EventBus.$emit('selectCollection', null);

          this.showEditCollection = false;
        } catch (err) {
          this.showErrorMsg();
        } finally {
          this.setLoading(false);
        }
      },
      async saveCollection(tag) {
        try {
          this.setLoading(true);

          tag = tag.trim();

          if (this.editCollectionMode) {
            const jobIds = await renameTag(this.selectedCollection, tag);
            await waitUntilJobsCompleted(jobIds);

            await this.refreshUserDetails();
            EventBus.$emit('selectCollection', null);
          } else {
            if (this.userDetails.tags.find(t => t.tag.toLowerCase() === tag.toLowerCase())) return this.showCollectionAlreadyExists();

            await addMarkUpTag(this.currentNewCollectionMarkUpId, tag);

            const markUpItem = this.history.find(h => h.markUpId === this.currentNewCollectionMarkUpId);
            if (markUpItem && !markUpItem.tags.find(t => t === tag)) {
              markUpItem.tags.push(tag);
            }

            const existingTag = this.userDetails.tags.find(t => t.tag.toLowerCase() === tag.toLowerCase().trim());
            if (!existingTag) {
              this.userDetails.tags.push({
                tag,
                count: 1
              });
            }
          }

          this.showEditCollection = false;
        } catch (err) {
          if (err.response && err.response.status === 400) this.showInvalidTagMsg();
          else this.showErrorMsg();
        } finally {
          this.setLoading(false);
        }
      },
      ...navigationPresets,
      ...mapActions([
        'retrieveHistory',
        'refreshUserDetails',
        'awaitUntilUserDetailsInitialized'
      ]),
      ...mapMutations([
        'setLoading',
        'setLoadingHistory',
        'setMarkUpSearchTerm',
        'setMarkUpSearchTags',
        'addMarkUpSearchTags',
        'deleteMarkUpSearchTags',
        'openUpgradeModal',
        'setUserDetails',
        'setIsDraggingMarkUp'
      ])
    },
    notifications: Notifications
  }
</script>

<style scoped>
  @import '../../styles/globalShared.css';

  div.my-markups {
    display: flex;
    flex-direction: column;
  }

  h2 {
    font-size: 20px;
    line-height: 20px;
    color: #fff;
    margin-bottom: 10px;
  }

  p {
    font-size: 16px;
    line-height: 20px;
    margin-bottom: 20px;
  }

  a {
    display: block;
    text-decoration: none;
    color: #9ca5b4;
  }

  p span {
    margin: 0 5px;
    color: #5E656F;
  }

  div.markup-search-container {
    width: 100%;
    margin-bottom: 20px;
    position: relative;
  }

  div.markup-search-container input {
    height: 40px;
    width: 100%;
    font-size: 16px;
    padding: 0 40px 0 16px;
    background-color: transparent;
    border: 1px solid #5E656F;
    border-radius: 2px;
    outline: none;
    color: #fff;
  }

  div.markup-search-container input::placeholder {
    color: #5E656F;
    opacity: 1;
  }

  button.clear-search {
    position: absolute;
    top: 0;
    right: 0;
    height: 40px;
    width: 40px;
    border-top-right-radius: 2px;
    border-bottom-right-radius: 2px;
  }

  @media (hover: hover) {
    button.clear-search:hover {
      background-color: #FF7A59;
    }
  }

  a.edit-collection {
    display: inline;
    text-decoration: underline;
    color: #5E656F;
    cursor: pointer;
    font-weight: 700;
  }

  @media (hover: hover) {
    a.edit-collection:hover {
      color: #9CA5B4;
    }
  }

  div.history-section {
    min-height: 60px;
    display: flex;
    flex-wrap: wrap;
    margin: 0 -15px 40px -15px;
  }

  div.no-markups {
    width: 100%;
    font-size: 16px;
    line-height: 20px;
    text-align: center;
    margin: 20px 0;
    color: #5E656F;
    height: 100%;
  }

  div.markup-item {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: left;
    width: calc((100%)/4);
    margin: 30px 0 20px 0;
    padding: 0 15px;
    position: relative;
  }

  a.history-image-wrapper {
    position: relative;
    width: 100%;
    margin-bottom: 20px;
  }

  div.history-image {
    position: relative;
    padding-top: 100%;
    width: 100%;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 2px;
    overflow: hidden;
    background-color: #2f333d;
    border: 1px solid #5E656F;
  }

  div.history-image:focus {
    outline: none;
  }

  div.history-image img {
    max-width: 100%;
    max-height: 100%;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: auto;
    position: absolute;
    display: block;
  }

  .draggable-mirror {
    width: 300px !important;
    padding-top: 300px !important;
    z-index: 9999 !important;
  }

  button.nav-btn--star {
    position: absolute;
    top: 0;
    left: 15px;
    margin: 0;
    background-color: transparent;
  }

  button.nav-btn--open {
    position: absolute;
    top: 0;
    right: 15px;
    margin: 0;
    background-color: transparent;
  }

  div.multi-page-count {
    width: 40px;
    height: 40px;
    border-top-left-radius: 2px;
    border-bottom-right-radius: 2px;
    font-size: 13px;
    line-height: 40px;
    text-align: center;
    font-weight: 700;
    color: #fff;
    background-color: #0071df;
    position: absolute;
    bottom: 0;
    right: 0;
  }

  div.markup-title {
    margin-bottom: 20px;
  }

  div.markup-tags {
    font-size: 16px;
    line-height: 20px;
    font-weight: 700;
    margin-bottom: 4px;
  }

  div.markup-tag {
    display: inline-flex;
    margin: 0 6px 6px 0;
  }

  button.collection-go {
    padding: 6px 0px 6px 16px;
    font-size: 13px;
    line-height: 20px;
    font-weight: 700;
    color: #9CA5B4;
    background-color: #21252b;
    border-top-left-radius: 2px;
    border-bottom-left-radius: 2px;
    display: inline-block;
    text-decoration: none;
  }

  button.collection-remove {
    height: 32px;
    width: 32px;
    border-top-right-radius: 2px;
    border-bottom-right-radius: 2px;
    background-color: #21252b;
  }

  button.collection-remove span.collection-remove-icon {
    height: 32px;
    width: 32px;
    mask: url('../../assets/close.svg') no-repeat center center;
    mask-size: 25%;
    background-color: #9CA5B4;
  }

  @media (hover: hover) {
    div.markup-tag:hover button {
      color: #fff;
      background-color: #0071df;
    }
    div.markup-tag:hover button.collection-remove span.collection-remove-icon {
      background-color: #fff;
      opacity: 0.5;
    }
    div.markup-tag:hover button.collection-remove:hover span.collection-remove-icon {
      opacity: 1;
    }
  }

  div.history-text--wrapper {
    display: flex;
    width: 100%;
    margin-bottom: 10px;
    align-items: center;
    justify-content: space-between;
  }

  a.history-text, div.last-modified, div.creator {
    flex-grow: 1;
    display: block;
    font-size: 13px;
    line-height: 20px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-decoration: none;
    color: #9ca5b4;
  }

  div.last-modified {
    font-weight: 700;
  }

  div.last-modified img {
    max-width: 13px;
    max-height: 13px;
    margin-right: 7px;
  }

  button.markup-controls {
    background-color: inherit;
    margin: 0 0 0 10px;
  }

  div.default-tags {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 20px;
  }

  button.tag-bubble {
    height: 32px;
    margin-right: 8px;
    margin-bottom: 10px;
    padding: 0 16px;
    border-radius: 16px;
    font-size: 13px;
    line-height: 20px;
    color: #9CA5B4;
    background-color: #21252b;
  }

  span.tag-bubble-name {
    font-weight: 700;
  }

  span.tag-bubble-count {
    margin-left: 5px;
  }

  @media (hover: hover) {
    button.tag-bubble:hover {
      color: #fff;
      background-color: #0071df;
    }
  }

  button.tag-bubble--active {
    color: #fff;
    background-color: #0071df;
  }

  div.viewer-cta {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    margin: 30px auto;
    max-width: calc(100% - 30px);
  }

  div.viewer-cta span {
    font-size: 16px;
    line-height: 20px;
    color: #fff;
  }

  div.viewer-cta button {
    margin: 0 0 0 12px;
    padding: 0 20px;
    border: 0;
    outline: 0;
    background-image: linear-gradient(to bottom right,#FCD117,#FF377C 67%);
    background-color: #ff7a59;
    cursor: pointer;
    flex-shrink: 0;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    height: 32px;
    border-radius: 16px;
    font-size: 13px;
    line-height: 15px;
    font-weight: 700;
    color: #fff;
  }

  @media (hover: hover) {
    div.viewer-cta button:hover {
      background-image: linear-gradient(to bottom right,#0071DF,#FF377C 67%);
      background-color: #0071DF;
    }
  }

  @media screen and (max-width: 1699px) {
    div.markup-item {
      width: calc((100%)/3);
    }
  }

  @media screen and (max-width: 1300px) {
    .draggable-mirror {
      width: calc((100% - 400px)/3) !important;
      padding-top: calc((100% - 400px)/3) !important;
    }
  }

  @media screen and (max-width: 960px) {
    div.markup-item {
      width: calc((100%)/2);
    }
    button.collection-go {
      padding: 6px 0px 6px 6px;
      font-size: 11px;
    }
    button.collection-remove {
      height: 32px;
      width: 24px;
    }
    button.collection-remove span.collection-remove-icon {
      height: 32px;
      width: 24px;
      mask-size: 31%;
    }
    .draggable-mirror {
      width: calc((100% - 310px)/2) !important;
      padding-top: calc((100% - 310px)/2) !important;
    }
  }

  @media screen and (max-width: 620px) {
    div.history-section {
      margin: 0 -10px 110px -10px;
    }
    div.viewer-cta {
      max-width: calc(100% - 20px);
    }
    div.markup-item {
      width: calc((100%)/2);
      margin: 30px 0;
      padding: 0 10px;
    }
    button.nav-btn--star {
      left: 10px;
    }
    button.nav-btn--open {
      right: 10px;
    }
    .draggable-mirror {
      width: calc((100% - 60px)/2) !important;
      padding-top: calc((100% - 60px)/2) !important;
    }
  }

  .draggable--is-dragging button:hover {
    cursor: not-allowed;
  }
  .draggable--is-dragging button.tag-bubble {
    cursor: not-allowed;
    background-color: #21252b;
    color: #9CA5B4;
  }
  .draggable--is-dragging div.markup-tag:hover button {
    cursor: not-allowed;
    color: #9CA5B4;
    background-color: #21252b;
  }
  .draggable--is-dragging div.markup-tag:hover button.collection-remove span.collection-remove-icon {
    background-color: #5E656F;
    opacity: 1;
  }
</style>
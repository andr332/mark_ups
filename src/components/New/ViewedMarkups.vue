<template>
  <div>
    <h2>Viewed By Me</h2>
    <p>All the markups shared with you that you've viewed.</p>
    <div class="history-section">
      <div class="markup-item" v-for="item in viewHistory" :key="item.markUpId">
        <a :href="getMarkUpSharePath({markUpId: item.markUpId})" v-on:click.prevent="navigateToMarkUp(item.markUpId)" class="history-image-wrapper">
          <div class="history-image">
            <img :src="item.thumbnailUrl" :alt="item.markUpId" @error="replaceThumbnailWithDefault">
          </div>
        </a>
        <div class="history-text--wrapper">
          <a :href="getMarkUpSharePath({markUpId: item.markUpId})" class="history-text" v-on:click.prevent="goToMarkUp(item.markUpId)">
            <div class="last-modified"><img src="../../assets/visible.svg" alt="Viewed"><span>{{item.timeLapsedDescription}}</span></div>
            <div class="creator"><span>{{item.isDuplicate ? 'Duplicated' : 'Created'}} {{item.createdOn}}</span><span> by {{item.createdByName}}</span></div>
          </a>
          <div class="dropdown" v-click-outside="hideMarkUpOptions">
            <button class="nav-btn nav-btn--small markup-controls" title="Options" v-on:click.prevent="showMarkUpOptions(item.markUpId)">
              <span class="icon icon-more"></span>
            </button>
            <div class="dropdown-menu" v-if="item.markUpId === markUpDropdown">
              <button class="dropdown-item" title="Copy link to clipboard" v-on:click.prevent="copyShareLink(item.markUpId)">
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
            </div>
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
  </div>
</template>

<script>
import {
  duplicateMarkUp, exportMarkUpAsPdf,
  getMarkUpDownloadUrl,
  getMarkUpSharePath,
  getMarkUpShareUrl
} from "../../services/markUpService";
  import {mapActions, mapMutations, mapState} from "vuex";
  import InfiniteLoading from "vue-infinite-loading";
  import {DefaultTags, HISTORY_PAGE_SIZE, Notifications} from "../../constants";
  import {copyTextToClipboard} from "../../utils";
import {trackMarkUpDuplicate, trackTrackPdfExport} from "../../services/analytics";
  import EventBus from "../../stores/eventBus";
  import DefaultThumbnail from "../../assets/default-thumbnail.svg";
  import navigationPresets from "../../navigationPresets";

  export default {
    name: "ViewedMarkups",
    components: {InfiniteLoading},
    data() {
      return {
        DefaultTags: DefaultTags,
        markUpDropdown: '',
        historyInitialized: false
      };
    },
    computed: {
      ...mapState([
        'viewHistory',
        'userDetails',
        'userPlanType',
        'viewHistoryCompleted'
      ])
    },
    async mounted() {
      await this.awaitUntilUserDetailsInitialized();
      await this.ensureHistoryState();
    },
    methods: {
      ...mapMutations([
        'setLoadingHistory',
        'setLoading'
      ]),
      ...mapActions([
        'retrieveViewHistory',
        'awaitUntilUserDetailsInitialized'
      ]),
      ...navigationPresets,
      replaceThumbnailWithDefault(e) {
        e.target.src = DefaultThumbnail;
      },
      getMarkUpSharePath(details) {
        return getMarkUpSharePath(details);
      },
      async ensureHistoryState() {
        if (this.viewHistory.length === 0) {
          this.setLoadingHistory(true);
          await this.retrieveViewHistory({
            refresh: true,
            pageSize: HISTORY_PAGE_SIZE
          });
          this.setLoadingHistory(false);
        }

        this.historyInitialized = true;
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
          isPrivate
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
      async scrollHandler($state) {
        if (!this.historyInitialized || this.viewHistoryCompleted) {
          return setTimeout(() => {
            $state.loaded();
          }, 1000);
        }

        this.setLoadingHistory(true);
        await this.retrieveViewHistory({
          refresh: false,
          pageSize: HISTORY_PAGE_SIZE
        });
        this.setLoadingHistory(false);

        $state.loaded();
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
    },
    notifications: Notifications
  }
</script>

<style scoped>
  @import '../../styles/globalShared.css';

  a {
    display: block;
    text-decoration: none;
    color: #9ca5b4;
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
    margin-bottom: 10px;
  }

  div.history-section {
    min-height: 60px;
    display: flex;
    flex-wrap: wrap;
    margin: 0 -15px 110px -15px;
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

  @media screen and (max-width: 960px) {
    div.markup-item {
      width: calc((100%)/2);
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
  }
</style>
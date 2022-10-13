<template>
  <div class="nav">
    <div class="container open-menu-container">
      <div class="logo-container">
        <Logo />
      </div>
      <div class="team-name">{{teamBrand.teamName}}</div>
    </div>
    <div class="container">
      <div class="dropdown" v-click-outside="hideShareDropdown">
        <div class="tooltip-wrapper">
          <button class="nav-btn nav-btn--large nav-btn--blue" v-on:click.prevent="toggleShareDropdown()"><span class="icon icon-share"></span><span class="icon icon-dropdown"></span></button>
          <span class="tooltip">Sharing Options</span>
        </div>
        <div class="dropdown-menu" v-if="showShareDropdown">
          <button class="dropdown-item" title="Copy share link to clipboard" v-on:click="copyShareLink()"><span class="icon icon-link"></span><span class="nav-text">Share link</span></button>
          <button class="dropdown-item" title="Copy markup to clipboard as image" v-if="isCopyImageSupported" v-on:click="copyImageToClipboard()"><span class="icon icon-copy"></span><span class="nav-text">Copy image</span></button>
          <button class="dropdown-item" title="Download markup as image" v-on:click="downloadImage()"><span class="icon icon-download"></span><span class="nav-text">Download image</span></button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import navigationPresets from "../../navigationPresets";
import Logo from "@/components/Shared/Logo";
import {mapMutations, mapState} from "vuex";
import {MARKUP_EXPORT_PIXEL_RATIO, Notifications} from "@/constants";
import {copyPngToClipboard, copyTextToClipboard, downloadDataUrl} from "@/utils";
import {getMarkUpShareUrl} from "@/services/markUpService";
import {trackMarkUpCopy, trackMarkUpDownload, trackMarkUpShare} from "@/services/analytics";

export default {
  name: "CustomToolBar",
  components: {Logo},
  data() {
    return {
      showShareDropdown: false,
      isCopyImageSupported: !!navigator.clipboard.write,
    };
  },
  computed: {
    ...mapState([
      'teamBrand',
      'userId',
      'userDetails',
      'markUp',
      'markUpId',
      'markUpPageNumber',
      'isCanvasLive',
      'markUpStage'
    ])
  },
  methods: {
    async copyShareLink() {
      await copyTextToClipboard(getMarkUpShareUrl({
        markUpId: this.markUpId,
        pageNumber: this.markUpPageNumber,
        isTeamMember: this.teamBrand.isTeamMember,
        customDomain: this.teamBrand.customDomain
      }));
      this.showLinkCopiedMsg();
      this.showShareDropdown = false;
      trackMarkUpShare(this.markUpId, this.canEditMarkUp);
    },
    hideShareDropdown() {
      if (this.showShareDropdown !== false) {
        this.showShareDropdown = false;
      }
    },
    async copyImageToClipboard() {
      if (this.markUpStage) {
        const dataUrl = this.markUpStage.toDataURL({
          pixelRatio: MARKUP_EXPORT_PIXEL_RATIO
        });
        await copyPngToClipboard(dataUrl);
        this.showMarkupCopiedMsg();
        trackMarkUpCopy(this.markUpId, this.canEditMarkUp);
      }
      this.showShareDropdown = false;
    },
    async downloadImage() {
      try {
        this.setLoading(true);
        this.showShareDropdown = false;
        const dataUrl = this.markUpStage.toDataURL({
          pixelRatio: MARKUP_EXPORT_PIXEL_RATIO
        });
        downloadDataUrl(dataUrl, `markuphero-${this.markUpId}-${this.markUpPageNumber}.png`);
        this.setLoading(false);
        trackMarkUpDownload(this.markUpId, this.canEditMarkUp);
      } catch (err) {
        console.error(err);
        this.showErrorMsg();
      } finally {
        this.setLoading(false);
      }
    },
    toggleShareDropdown() {
      this.showShareDropdown = !this.showShareDropdown;
    },
    ...navigationPresets,
    ...mapMutations([
      'setLoading'
    ])
  },
  notifications: Notifications
}
</script>

<style scoped>
  @import '../../styles/globalShared.css';

  div.nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: 60px;
    background: #21252B;
    z-index: 25;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  div.container {
    display: flex;
    align-items: center;
    margin: 0 5px;
    position: relative;
  }

  div.open-menu-container {
    margin: 0 5px 0 0;
    position: static;
  }

  button:disabled {
    cursor: not-allowed;
    background-color: #282C34;
  }

  button:disabled span.icon, button:disabled span.color-null {
    background-color: #5E656F;
  }

  button:disabled span.nav-text {
    color: #5E656F;
  }

  div.logo-container {
    height: 40px;
  }

  div.team-name {
    font-size: 16px;
    color: #fff;
    max-width: 440px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  @media screen and (max-width: 767px) {
    div.team-name {
      max-width: 176px;
    }
  }
</style>
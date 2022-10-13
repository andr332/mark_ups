<template>
  <div v-if="!isLoading">
    <div class="creator-note">{{isMarkUpDuplicated ? 'Duplicated' : 'Created'}} {{markUpCreatedOn}} by <strong>{{markUpCreatedBy}}</strong></div>
    <div class="center-paging-btns" v-if="isCurrentMarkUpOwner">
      <div class="tooltip-wrapper">
        <button class="nav-btn nav-btn--large nav-btn--dark" v-bind:class="{'nav-btn--star--active': markUp.tags.indexOf('starred') > -1}" v-on:click.prevent="starMarkUp()"><span class="icon icon-star"></span></button>
        <span class="tooltip tooltip--above">Star Markup</span>
      </div>
      <div class="dropdown" v-click-outside="hidePrivacyDropdown">
        <div class="tooltip-wrapper">
          <button class="nav-btn nav-btn--large nav-btn--dark" v-on:click.prevent="togglePrivacyDropdown()"><span class="icon" :class="privacyIcon"></span><span class="nav-text">{{this.markUpPrivate ? 'Private' : 'Public'}}</span><span class="icon icon-dropdown"></span></button>
          <span class="tooltip tooltip--above">Privacy Setting</span>
        </div>
        <div class="dropdown-menu dropdown-menu--left dropdown-menu--up" v-if="showPrivacyDropdown">
          <button class="dropdown-item" v-bind:class="{ 'nav-btn--active': !this.markUpPrivate }" v-on:click.prevent="changeMarkUpVisibility('Public')"><span class="icon icon-unlocked"></span><span class="nav-text">Public<span class="nav-text--light"> (Anyone with share link)</span></span></button>
          <button class="dropdown-item" v-bind:class="{ 'nav-btn--active': this.markUpPrivate }" v-on:click.prevent="changeMarkUpVisibility('Private')"><span class="icon icon-locked"></span><span class="nav-text">Private<span class="nav-text--light"> (Only you)</span></span></button>
          <button class="dropdown-item" v-on:click="() => {this.showPrivacyDropdown = false; navigateToWhatIsThisPrivacySetting();}"><span class="icon icon-question"></span><span class="nav-text">What's this</span></button>
        </div>
      </div>
      <div class="tooltip-wrapper hide-small" v-if="canEditCurrentMarkUp">
        <button class="nav-btn nav-btn--large nav-btn--dark" v-on:click.prevent="openAddPage()"><span class="icon icon-add"></span><span class="nav-text">Add Pages</span></button>
        <span class="tooltip tooltip--above">Add Pages</span>
      </div>
      <div class="dropdown" v-click-outside="hideOptionsDropdown">
        <div class="tooltip-wrapper">
          <button class="nav-btn nav-btn--large nav-btn--dark" v-on:click.prevent="toggleOptionsDropdown()"><span class="icon icon-more"></span></button>
          <span class="tooltip tooltip--above">More Options</span>
        </div>
        <div class="dropdown-menu dropdown-menu--left dropdown-menu--up" v-if="showOptionsDropdown">
          <button class="dropdown-item" v-if="canEditCurrentMarkUp" v-on:click.prevent="openAddPage()"><span class="icon icon-add"></span><span class="nav-text">Add pages</span></button>
          <button v-if="canEditCurrentMarkUp && currentMarkUpPages && currentMarkUpPages.length > 1" class="dropdown-item show-small" v-on:click.prevent="deletePage()"><span class="icon icon-delete"></span><span class="nav-text">Delete page</span></button>
          <hr>
          <button class="dropdown-item dropdown-item--red" title="Delete markup" v-on:click.prevent="deleteMarkUp()"><span class="icon icon-delete"></span><span class="nav-text nav-text--delete">Delete markup</span></button>
        </div>
      </div>
      <div class="canvas-tags" v-if="isCurrentMarkUpOwner">
        <TagInput mode="input" @focus="onTagInputFocus" :tags="markUp.tags.filter(t => t !== 'starred' && !DefaultTags.find(dt => dt.name === t))" :allTags="userDetails.tags.map(t => t.tag).filter(t => t !== 'starred' && !DefaultTags.find(dt => dt.name === t))"></TagInput>
      </div>
    </div>
  </div>
</template>

<script>
  import {mapActions, mapMutations, mapState} from "vuex";
  import EventBus from "../../stores/eventBus";
  import {DefaultTags, Notifications} from "../../constants";
  import navigationPresets from "../../navigationPresets";
  import TagInput from "../Shared/TagInput";
  import {addMarkUpTag, changeMarkUpVisibility, deleteMarkUp, deleteMarkUpTag} from "../../services/markUpService";
  import {trackMarkUpAddPage, trackMarkUpDelete, trackMarkUpTagRemove} from "../../services/analytics";
  import {trackMarkUpTagAdd} from "@/services/analytics";

  export default {
    name: "LowerCanvas",
    props: ['canEditCurrentMarkUp', 'currentMarkUpPages', 'currentMarkUpPage', 'isCurrentMarkUpOwner'],
    components: {TagInput},
    data() {
      return {
        showPrivacyDropdown: false,
        showOptionsDropdown: false,
        DefaultTags: DefaultTags
      };
    },
    computed: {
      privacyIcon() {
        const iconName = this.markUpPrivate ? 'private' : 'public';
        return `icon-${iconName}`;
      },
      isCustomDomain() {
        return this.teamBrand && this.teamBrand.isCustomDomain;
      },
      ...mapState([
        'isLoading',
        'isMarkUpDuplicated',
        'userPlanType',
        'markUpCreatedOn',
        'markUpCreatedBy',
        'markUpId',
        'markUpPrivate',
        'userDetails',
        'markUpSearchFilters',
        'markUp',
        'isMarkUpOwner',
        'teamBrand'
      ]),
    },
    mounted() {
      EventBus.$on('tagsChanged', (newTags) => this.onTagsChanged(newTags));
    },
    destroyed() {
      EventBus.$off('tagsChanged');
    },
    methods: {
      togglePrivacyDropdown() {
        this.showOptionsDropdown = false;
        this.showPrivacyDropdown = !this.showPrivacyDropdown;
      },
      toggleOptionsDropdown() {
        this.showPrivacyDropdown = false;
        this.showOptionsDropdown = !this.showOptionsDropdown;
      },
      hidePrivacyDropdown() {
        if (this.showPrivacyDropdown !== false) {
          this.showPrivacyDropdown = false;
        }
      },
      hideOptionsDropdown() {
        if (this.showOptionsDropdown !== false) {
          this.showOptionsDropdown = false;
        }
      },
      deletePage() {
        this.showOptionsDropdown = false;
        EventBus.$emit('deletePage', this.currentMarkUpPage);
      },
      async changeMarkUpVisibility(visibility) {
        this.showPrivacyDropdown = false;

        if (this.userPlanType !== 'SuperHero') return this.openUpgradeModal('private')

        const currentMarkUpVisibility = this.markUpPrivate ? 'Private' : 'Public';
        if (currentMarkUpVisibility === visibility) return;

        this.setLoading(true);
        try {
          await changeMarkUpVisibility(this.markUpId, visibility);
          this.setMarkUpPrivate(visibility === 'Private');
          this.replacePage(this.markUpId, this.currentMarkUpPage.order, visibility === 'Private');
          this.showMarkUpPrivacySettingUpdatedMsg();
        } catch {
          this.showErrorMsg();
        } finally {
          this.setLoading(false);
        }
      },
      async onTagsChanged(tags) {
        try {
          if (tags.addedTags.length > 0) {
            this.setLoading(true);
            const newTag = await addMarkUpTag(this.markUpId, tags.addedTags[0]);
            if (!newTag.tag) {
              throw {reason: 'default_tag'};
            }
            this.markUp.tags.push(newTag.tag);
            trackMarkUpTagAdd(this.markUpId, this.markUp.tags);
          } else if (tags.deletedTags.length > 0) {
            this.setLoading(true);
            await deleteMarkUpTag(this.markUpId, tags.deletedTags[0]);
            this.markUp.tags.splice(this.markUp.tags.indexOf(tags.deletedTags[0]), 1);
            trackMarkUpTagRemove(this.markUpId, this.markUp.tags);
          }

          setTimeout(async () => {
            await this.refreshUserDetails();
            EventBus.$emit('refreshAllHistory');
          }, 2000);
        } catch (err) {
          if (err.response && err.response.status === 400) this.showInvalidTagMsg();
          else if (err.reason === 'default_tag') this.showSystemTagMsg();
          else this.showErrorMsg();
        } finally {
          this.setLoading(false);
        }
      },
      async deleteMarkUp() {
        try {
          this.setLoading(true);
          await deleteMarkUp(this.markUpId);
          trackMarkUpDelete();
          EventBus.$emit('refreshAllHistory');
          this.setLoading(false);
          this.showMarkUpDeleteMsg();
          this.navigateToNew();
        } catch (err) {
          this.showErrorMsg();
        }
      },
      async starMarkUp() {
        if (this.userPlanType !== 'SuperHero') return this.openUpgradeModal('star');

        this.setLoading(true);
        try {
          const starredIndex = this.markUp.tags.indexOf('starred');
          if (starredIndex === -1) {
            await addMarkUpTag(this.markUpId, 'starred');
            this.markUp.tags.push('starred');
          } else {
            await deleteMarkUpTag(this.markUpId, 'starred');
            this.markUp.tags.splice(starredIndex, 1);
          }

          setTimeout(async () => {
            EventBus.$emit('refreshAllHistory');
            await this.refreshUserDetails();
          }, 2000);
        } catch (err) {
          this.showErrorMsg();
        } finally {
          this.setLoading(false);
        }
      },
      openAddPage() {
        trackMarkUpAddPage(this.markUpId, this.userPlanType);

        if (this.userPlanType !== 'SuperHero') return this.openUpgradeModal('add-page');

        this.setIsAddPageOpen(true);
        this.showOptionsDropdown = false;
      },
      onTagInputFocus() {
        if (this.userPlanType !== 'SuperHero') this.openUpgradeModal('collections');
      },
      ...navigationPresets,
      ...mapMutations([
        'setLoading',
        'setMarkUpPrivate',
        'setIsAddPageOpen',
        'openUpgradeModal'
      ]),
      ...mapActions([
        'refreshUserDetails'
      ])
    },
    notifications: Notifications
  }
</script>

<style scoped>
  div.creator-note {
    margin: 20px;
    font-size: 13px;
    line-height: 20px;
    text-align: center;
  }

  div.center-paging-btns {
    display: flex;
    flex-direction: row;
    justify-content: center;
    flex-wrap: wrap;
    margin: 0 auto 20px auto;
    padding: 0 15px;
  }

  div.center-paging-btns div.dropdown {
    margin-bottom: 20px;
  }

  span.nav-text--light {
    font-weight: 400;
  }

  div.canvas-tags {
    min-width: 162px;
    margin: 0 5px 20px 5px;
  }

  button:disabled {
    cursor: not-allowed;
    background-color: transparent;
  }

  button:disabled span.icon, button:disabled span.color-null {
    background-color: #5E656F;
  }

  button:disabled span.nav-text {
    color: #5E656F;
  }

  @media screen and (max-width: 767px) {
    div.hide-small {
      display: none;
    }
  }

  @media screen and (max-width: 410px) {
    div.dropdown-menu--left {
      left: -40px;
    }
  }
</style>
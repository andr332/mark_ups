<template>
  <div>
    <div v-if="!isLoading && !canEditCurrentMarkUp && !isCurrentMarkUpOwner && !isCustomDomain && userPlanType === 'Sidekick'" class="viewer-cta"><span><strong>Is this useful?</strong> Create your own for free</span><button v-on:click.prevent="navigateToSignUp('above_markup_button-viewer')">Sign Up</button></div>
    <div v-if="!isLoading && !canEditCurrentMarkUp && isCurrentMarkUpOwner && !isCustomDomain && userPlanType === 'Sidekick'" class="viewer-cta"><span><strong>Want to edit this?</strong> Sign up to edit</span><button v-on:click.prevent="navigateToSignUp('above_markup_button-owner')">Sign Up</button></div>

    <div v-if="!isLoading && !canEditCurrentMarkUp && isCurrentMarkUpOwner && !isCustomDomain && userPlanType === 'Hero'" class="viewer-cta"><span><strong>Want to edit this?</strong> Upgrade to edit</span><button v-on:click.prevent="navigateToUpgrade()">Upgrade</button></div>
    <div v-if="!isLoading && !canEditCurrentMarkUp && !isCurrentMarkUpOwner && !isCustomDomain && userPlanType === 'Hero'" class="viewer-cta"><span><strong>Want to edit this?</strong> Duplicate to edit</span><button v-on:click="duplicateMarkUp()">Duplicate</button></div>

    <div v-if="!isLoading && !canEditCurrentMarkUp && !isCurrentMarkUpOwner && !isCustomDomain && userPlanType === 'SuperHero'" class="viewer-cta"><span><strong>Want to edit this?</strong> Duplicate to edit</span><button v-on:click="duplicateMarkUp()">Duplicate</button></div>

<!--    <div v-if="isLoading || canEditCurrentMarkUp || isCustomDomain" class="no-viewer-cta"></div>-->

    <div v-if="!isLoading" class="markup-title-canvas">
      <EditableField v-model="markUp.title" :readonly="!canEditMarkUp" @onSave="onTitleSave(item)" :initialValue="markUp.title" maxCharacters="50" v-if="(!canEditMarkUp && markUp.title) || canEditMarkUp" :onFocus="() => onMarkUpTitleFocus()"></EditableField>
    </div>

    <div v-if="canEditCurrentMarkUp && showBlurPrompt" class="confirm-blur" v-bind:class="{'markup-scroll-wrapper--multi': markUpPages.length > 1 }">
      <button class="apply-blur" v-on:click="applyBlur()">Apply Blur</button>
      <button class="cancel-blur" v-on:click="removeBlur()">Cancel</button>
    </div>

    <div v-if="canEditCurrentMarkUp && showCropPrompt" class="confirm-blur" v-bind:class="{'markup-scroll-wrapper--multi': markUpPages.length > 1 }">
      <button class="apply-blur" v-on:click="applyCrop()">Apply Crop</button>
      <button class="cancel-blur" v-on:click="removeCrop()">Cancel</button>
    </div>
  </div>
</template>

<script>
  import {mapMutations, mapState} from "vuex";
  import navigationPresets from "../../navigationPresets";
  import {changeMarkUpTitle, duplicateMarkUp} from "../../services/markUpService";
  import {trackMarkUpDuplicate} from "../../services/analytics";
  import EventBus from "../../stores/eventBus";
  import {Notifications} from "../../constants";
  import EditableField from "../Shared/EditableField";

  export default {
    name: "UpperCanvas",
    components: {EditableField},
    props: ['canEditCurrentMarkUp', 'isCurrentMarkUpOwner'],
    data: () => {
      return {
        showBlurPrompt: false,
        showCropPrompt: false,
        titleChanged: false
      };
    },
    computed: {
      isCustomDomain() {
        return this.teamBrand && this.teamBrand.isCustomDomain;
      },
      ...mapState([
      'isLoading',
      'isAuthenticated',
      'userPlanType',
      'canEditMarkUp',
      'markUpPages',
      'markUpId',
      'teamBrand',
      'markUp'
    ])},
    mounted() {
      EventBus.$on('showBlurPrompt', (show) => {
        this.showBlurPrompt = show;
      });

      EventBus.$on('showCropPrompt', (show) => {
        this.showCropPrompt = show;
      })
    },
    beforeDestroy() {
      if (this.titleChanged) {
        EventBus.$emit('refreshAllHistory');
      }
    },
    methods: {
      async duplicateMarkUp() {
        this.setLoading(true);
        try {
          const newMarkUp = await duplicateMarkUp(this.markUpId);
          this.showMarkUpDuplicatedMsg();
          trackMarkUpDuplicate(this.markUpId, this.canEditCurrentMarkUp);
          this.navigateToMarkUp(newMarkUp.id);
          setTimeout(async () => {
            EventBus.$emit('refreshAllHistory');
          }, 350);
        } catch {
          this.showErrorMsg();
        } finally {
          this.setLoading(false);
        }
      },
      applyBlur() {
        EventBus.$emit('applyBlur');
      },
      removeBlur() {
        EventBus.$emit('removeBlur');
      },
      applyCrop() {
        EventBus.$emit('applyCrop');
      },
      removeCrop() {
        EventBus.$emit('removeCrop');
      },
      async onTitleSave() {
        try {
          await changeMarkUpTitle(this.markUpId, this.markUp.title);
          this.titleChanged = true;
          EventBus.$emit('markUpTitleChanged');
        } catch {
          this.showErrorMsg();
        }
      },
      onMarkUpTitleFocus() {
        if (this.userPlanType !== 'SuperHero') this.openUpgradeModal('title');
      },
      ...mapMutations([
        'setLoading',
        'openUpgradeModal'
      ]),
      ...navigationPresets
    },
    notifications: Notifications
  }
</script>

<style scoped>
  div.viewer-cta {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    margin: 20px auto;
    max-width: calc(100% - 40px);
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

  div.no-viewer-cta {
    width: 100%;
    height: 60px;
  }

  div.markup-title-canvas {
    padding: 10px 50px;
    margin: 10px auto;
    max-width: 440px;
  }

  @media screen and (max-width: 479px) {
    div.markup-title-canvas {
      padding: 10px 15px;
    }
  }

  @media (hover: hover) {
    div.viewer-cta button:hover {
      background-image: linear-gradient(to bottom right,#0071DF,#FF377C 67%);
      background-color: #0071DF;
    }
  }

  div.confirm-blur {
    width: 100%;
    height: 40px;
    position: fixed;
    align-items: center;
    justify-content: center;
    top: 60px;
    z-index: 25;
    display: flex;
    background-color: #0071df;
  }

  button.apply-blur, button.cancel-blur {
    width: 120px;
    height: 32px;
    border-radius: 2px;
    color: #fff;
    font-size: 13px;
    line-height: 15px;
    font-weight: 700;
    border: 1px solid #fff;
    margin: 0 5px;
  }

  button.cancel-blur {
    opacity: 0.5;
  }

  @media (hover: hover) {
    button.apply-blur:hover {
      background-color: #03a87c;
      border: 1px solid #03a87c;
    }
    button.cancel-blur:hover {
      background-color: #FF7A59;
      border: 1px solid #FF7A59;
      opacity: 1;
    }
  }

  div.markup-scroll-wrapper--multi {
    width: calc(100% - 200px);
  }

  @media screen and (max-width: 767px) {
    div.markup-scroll-wrapper--multi {
      width: 100%;
    }
  }
</style>
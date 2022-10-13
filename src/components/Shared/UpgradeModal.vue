<template>
  <div class="wrapper">
    <div class="modal-card">
      <label class="banner">Locked Feature</label>
      <button title="Close" class="close" v-on:click.prevent="closeUpgradeModal"><span class="icon icon-close"></span></button>
      <h4>Superhero Only</h4>
      <p v-if="upgradeModalType === 'tags'">Upgrade to Superhero to use collections & organize your history.</p>
      <p v-if="upgradeModalType === 'search'">Upgrade to Superhero to search through your history and organize using collections.</p>
      <p v-if="upgradeModalType === 'title'">Upgrade to Superhero to organize your markups using titles & collections.</p>
      <p v-if="upgradeModalType === 'star'">Upgrade to Superhero to star markups & organize your history.</p>
      <p v-if="upgradeModalType === 'collections'">Upgrade to Superhero to use collections & organize your history.</p>
      <p v-if="upgradeModalType === 'private'">Upgrade to Superhero to make markups private & set your privacy settings.</p>
      <p v-if="upgradeModalType === 'edit'">Upgrade to Superhero to make edits at any point.</p>
      <p v-if="upgradeModalType === 'blur'">Upgrade to Superhero to blur markups with secure obfuscation.</p>
      <p v-if="upgradeModalType === 'crop'">Upgrade to Superhero to crop markups.</p>
      <p v-if="upgradeModalType === 'export'">Upgrade to Superhero to export markups as PDFs.</p>
      <p v-if="upgradeModalType === 'add-page'">Upgrade to Superhero to add pages to your markups.</p>
      <p v-if="upgradeModalType === 'insert-image'">Upgrade to Superhero to insert images into your markups.</p>
      <div>
        <div class="flex-row">
          <div class="yes" title="Yes"></div>
          <p class="yes-text">Unlimited markups, pages, history & edits</p>
        </div>
        <div class="flex-row">
          <div class="yes" title="Yes"></div>
          <p class="yes-text">Advanced sharing & privacy settings</p>
        </div>
        <div class="flex-row">
          <div class="yes" title="Yes"></div>
          <p class="yes-text">Includes all our features like search, titles, blur, crop & more</p>
        </div>
      </div>
      <button class="card-button" v-on:click.prevent="upgrade()">Try 1 Month Free</button>
      <button class="card-button card-button--grey" v-on:click.prevent="closeUpgradeModal">No Thanks</button>
    </div>
  </div>
</template>

<script>
  import {mapMutations, mapState} from "vuex";
  import navigationPresets from "../../navigationPresets";

  export default {
    name: "UpgradeModal",
    computed: {
      ...mapState([
        'upgradeModalType'
      ])
    },
    methods: {
      upgrade() {
        this.closeUpgradeModal();
        this.navigateToUpgradePromo();
      },
      ...navigationPresets,
      ...mapMutations([
        'closeUpgradeModal'
      ])
    }
  }
</script>

<style scoped>
  div.wrapper {
    margin: 0;
    padding: 100px 40px;
    border-radius: 2px;
    background-color: rgba(40,44,52,0.84);
    backdrop-filter: blur(2px);
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 100;
    overflow-x: hidden;
    overflow-y: scroll;
  }

  div.modal-card {
    position: relative;
    margin: 0 auto;
    padding:  40px 40px 20px 40px;
    width: 100%;
    max-width: 360px;
    background-color: #181A1F;
    border-radius: 2px;
    text-align: center;
  }

  label.banner {
    display: block;
    position: absolute;
    top: -15px;
    left: calc(50% - 60px);
    height: 30px;
    width: 120px;
    border-radius: 2px;
    font-size: 13px;
    line-height: 30px;
    text-align: center;
    font-weight: 700;
    color: #fff;
    background-image: linear-gradient(to bottom right,#FCD117,#FF377C 67%);
    background-color: #FF377C;
  }

  button.close {
    position: absolute;
    top: 0;
    right: 0;
    background-color: #2f333d;
    border-radius: 2px;
  }

  @media (hover: hover) {
    button.close:hover {
      background-color: #FF7A59;
    }
  }

  div.modal-card h4 {
    margin: 20px 0 10px 0;
    font-size: 32px;
    line-height: 40px;
    color: #fff;
  }

  div.modal-card p {
    margin: 0 0 40px 0;
    font-size: 16px;
    line-height: 20px;
    text-align: center;
    color: #9CA5B4;
  }

  div.flex-row {
    display: flex;
  }

  div.yes {
    height: 20px;
    width: 20px;
    margin-right: 12px;
    flex-shrink: 0;
    background-image: url('../../assets/yes.svg');
  }

  div.modal-card p.yes-text {
    margin-bottom: 20px;
    color: #fff;
    text-align: left;
  }

  button.card-button {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 50px;
    font-size: 16px;
    line-height: 20px;
    text-align: center;
    font-weight: 700;
    background-image: linear-gradient(to bottom right,#FCD117,#FF377C 67%);
    background-color: #FF377C;
    color: #fff;
    text-decoration: none;
    border-radius: 2px;
    margin: 20px 0;
  }

  button.card-button--grey {
    background-image: none;
    background-color: #2f333d;
    color: #9CA5B4;
  }

  @media (hover: hover) {
    button.card-button:hover {
      background-image: linear-gradient(to bottom right,#0071df,#FF377C 67%);
      background-color: #0071df;
    }
    button.card-button--grey:hover {
      background-image: none;
      background-color: #FF7A59;
      color: #fff;
    }
  }

  @media screen and (max-width: 479px) {
    div.wrapper {
      padding: 80px 20px;
    }
    div.modal-card {
      padding:  40px 20px 20px 20px;
    }
  }

</style>
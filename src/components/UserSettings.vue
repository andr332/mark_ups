<template>
  <div>
    <Nav></Nav>
    <div class="outer-container">
      <form class="inner-container">
        <div class="title-container">
          <h3 class="title">My Settings</h3>
          <div class="title-link"><a class="account-link" href="/account" v-on:click.prevent="navigateToAccount()">View my account</a></div>
        </div>
        <div class="setting-label">Default Markup Privacy Setting<a class="question-info" href="https://help.markuphero.com/article/8" rel="noopener" target="_blank"><div class="small-icon"><span class="icon icon-question"></span></div>What's This</a></div>
        <div class="link-options-containers">
          <div class="field-value-block">
            <label class="radio-label" title="Public">
              <input type="radio" name="privacy-default" v-model="defaultMarkUpVisibility" value="Public" v-on:change="defaultMarkUpVisibilityChanged"><span class="radio-circle"></span>
              <div class="flex-label">
                <div class="small-icon"><span class="icon icon-unlocked"></span></div><span class="radio-text"><strong>Public</strong> (Anyone with share link can access)</span>
              </div>
            </label>
          </div>
          <div class="field-value-block">
            <label class="radio-label" title="Private">
              <input type="radio" name="privacy-default" v-model="defaultMarkUpVisibility" value="Private" v-on:change="defaultMarkUpVisibilityChanged" :disabled="userPlanType !== 'SuperHero'"><span class="radio-circle"></span>
              <div class="flex-label">
                <div class="small-icon"><span class="icon icon-locked"></span></div><span class="radio-text"><strong>Private</strong> (Only you can access)</span>
              </div>
            </label>
            <a v-if="userPlanType !== 'SuperHero'" class="change-link change-link--gradient" href="/upgrade" v-on:click.prevent="navigateToUpgrade()">Upgrade</a>
          </div>
        </div>
        <div class="field-value-block">
          <button class="text-button" :disabled="userPlanType !== 'SuperHero'" v-on:click.prevent="privatizeAllMarkUps()">Set all your markups to private</button>
          <a v-if="userPlanType !== 'SuperHero'" class="change-link change-link--gradient" href="/upgrade" v-on:click.prevent="navigateToUpgrade()">Upgrade</a>
        </div>
      </form>
    </div>
    <Footer></Footer>
  </div>
</template>

<script>
  import {getDetails, updateSettings} from "../services/authService";
  import {mapMutations, mapState} from "vuex";
  import authorizedRouteGuard from "../guards/authorizedGuard";
  import {Notifications} from "../constants";
  import Nav from "./Nav";
  import Footer from "./Footer";
  import multiguard from "vue-router-multiguard";
  import getStore from "../stores/appStore";
  import navigationPresets from "../navigationPresets";
  import {changeAllMarkUpsVisibility} from "../services/markUpService";

  export default {
    name: "UserSettings",
    components: {Nav, Footer},
    beforeRouteEnter: multiguard([authorizedRouteGuard,
      async (to, from, next) => {
        await getStore().dispatch('awaitUntilUserDetailsInitialized');

        next();
      }
    ]),
    data() {
      return {
        defaultMarkUpVisibility: this.$store.state.userDetails.userSettings.defaultMarkUpVisibility
      };
    },
    computed: mapState([
      'userDetails',
      'userPlanType'
    ]),
    methods: {
      async defaultMarkUpVisibilityChanged() {
        this.setLoading(true);

        try {
          await updateSettings({
            defaultMarkUpVisibility: this.defaultMarkUpVisibility
          });

          const userDetails = await getDetails();
          this.setUserDetails(userDetails);

          this.showSettingsUpdatedMsg();
        } catch {
          this.showErrorMsg();
        } finally {
          this.setLoading(false);
        }
      },
      async privatizeAllMarkUps() {
        this.setLoading(true);

        try {
          await changeAllMarkUpsVisibility('Private');
          this.showMarkUpsSetToPrivateMsg();
        } catch {
          this.showErrorMsg();
        } finally {
          this.setLoading(false);
        }
      },
      ...mapMutations([
        'setLoading',
        'setUserDetails'
      ]),
      ...navigationPresets
    },
    notifications: Notifications
  }
</script>

<style scoped>
  @import '../styles/globalShared.css';

  div, label, input, button, form {
    box-sizing : border-box !important;
  }

  div.outer-container {
  }

  form.inner-container {
    display: block;
    margin: 120px auto;
    max-width: 440px;
    padding: 40px;
    background-color: #21252b;
    color: #9ca5b4;
    border-radius: 2px;
  }

  div.title-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin: 20px 0 40px 0;
  }

  h3.title {
    color: #fff;
    font-size: 23px;
    font-weight: 700;
    line-height: 25px;
    margin: 0;
  }

  div.title-link {
    color: #9ca5b4;
    font-size: 13px;
    line-height: 25px;
  }

  a.account-link {
    color: #0071df;
    font-weight: 700;
  }

  div.setting-label {
    display: flex;
    color: #9ca5b4;
    font-size: 13px;
    line-height: 20px;
    margin: 20px 0 10px 0;
  }

  a.question-info {
    display: flex;
    margin-left: 15px;
    color: #5E656F;
    font-size: 13px;
    line-height: 20px;
    font-weight: 700;

  }

  div.small-icon {
    width: 20px;
    height: 20px;
    display: flex;
    margin-right: 5px;
  }

  div.small-icon span.icon {
    width: 20px;
    height: 20px;
  }

  span.icon-question {
    background-color: #5E656F;
  }

  div.link-options-containers {
    padding: 0;
    margin: 20px 0 40px 0;
    display: block;
  }

  div.flex-label {
    display: flex;
  }

  label.radio-label {
    display: block;
    position: relative;
    padding-left: 30px;
    cursor: pointer;
    font-size: 13px;
    line-height: 20px;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    color: #9CA5B4;
  }

  label.radio-label input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
    cursor: pointer;
  }

  span.radio-circle {
    position: absolute;
    top: 0;
    left: 0;
    height: 20px;
    width: 20px;
    border-radius: 50%;
    border: 1px solid #5E656F;
  }

  @media (hover: hover) {
    label.radio-label:hover input ~ .radio-circle {
      border: 1px solid #9CA5B4;
    }

    label.radio-label:hover input ~ div.flex-label span.radio-text {
      color: #fff;
    }
    label.radio-label:hover input ~ div.flex-label div.small-icon span.icon {
      background-color: #fff;
    }
  }

  label.radio-label input:checked ~ .radio-circle {
    background-color: #0071DF;
    border: 1px solid #0071DF;
  }

  label.radio-label input:checked ~ div.flex-label span.radio-text {
    color: #fff;
  }

  label.radio-label input:checked ~ div.flex-label div.small-icon span.icon {
    background-color: #fff;
  }

  span.radio-circle:after {
    content: "";
    position: absolute;
    display: none;
  }

  label.radio-label input:checked ~ .radio-circle:after {
    display: block;
  }

  label.radio-label .radio-circle:after {
    top: 5px;
    left: 5px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #fff;
  }

  div.field-value-block {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
  }

  button.text-button {
    display: block;
    font-size: 13px;
    line-height: 20px;
    color: #9CA5B4;
    text-decoration: underline;
  }

  @media (hover: hover) {
    button.text-button:hover {
      background-color: transparent;
      color: #fff;
    }
  }

  label.radio-label input:disabled  ~ .radio-circle {
    cursor: not-allowed;
    border: 1px solid #5E656F;
  }

  label.radio-label input:disabled  ~ div.flex-label span.radio-text {
    cursor: not-allowed;
    color: #5E656F;
  }

  label.radio-label input:disabled  ~ div.flex-label div.small-icon span.icon {
    cursor: not-allowed;
    background-color: #5E656F;
  }

  button.text-button:disabled {
    cursor: not-allowed;
    cursor: not-allowed;
    color: #5E656F;
  }

  a.change-link {
    display: block;
    font-size: 16px;
    line-height: 20px;
    color: #0071df;
    font-weight: 700;
    text-decoration: none;
  }

  a.change-link--gradient {
    background-image: linear-gradient(to bottom right,#FCD117,#FF377C 67%);
    background-color: #FF377C;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  @media screen and (max-width: 479px) {
    form.inner-container {
      max-width: 479px;
      padding: 40px 20px;
      border-radius: 0;
    }
  }
</style>
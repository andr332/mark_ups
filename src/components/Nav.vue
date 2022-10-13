<template>
  <div>
    <div class="nav">
      <div class="container">
        <div class="logo-container">
          <Logo />
        </div>
        <div class="tooltip-wrapper">
          <button class="nav-btn nav-btn--large" v-on:click="navigateToNew()"><span class="icon icon-stack"></span><span class="nav-text hide-markups-text">Markups</span></button>
          <span class="tooltip">New Markup & History</span>
        </div>
      </div>
      <div class="container">
        <a v-if="!isAuthenticated" class="nav-link hide-two" href="/" v-on:click.prevent="navigateToRoot()">Home</a>
        <a v-if="isAuthenticated" class="nav-link hide-two" href="https://roadmap.markuphero.com/changelog/" rel="noopener" target="_blank">What's New</a>
        <a class="nav-link hide-two" href="/download" v-on:click.prevent="navigateToDownload()">Download</a>
        <a class="nav-link hide-two" href="/pricing" v-on:click.prevent="navigateToPricing()">Pricing</a>
        <div class="dropdown hide-two" v-click-outside="hideIntegrationsDropdown">
          <button class="nav-link" v-on:click.prevent="toggleIntegrationsDropdown()">Integrations</button>
          <div class="dropdown-menu dropdown-menu--left-twelve" v-if="showIntegrationsDropdown">
            <a class="dropdown-item--text" href="/integrations/chrome-extension.html" rel="noopener">Chrome Extension</a>
            <a class="dropdown-item--text" href="/integrations/google-drive-app.html" rel="noopener">Google Drive App</a>
            <a class="dropdown-item--text" href="/integrations/slack-app.html" rel="noopener">Slack App</a>
            <a class="dropdown-item--text" href="/integrations/annotation-api.html" rel="noopener">Annotation API</a>
          </div>
        </div>
        <a class="nav-link hide-two" href="/blog/" rel="noopener" target="_blank">Blog</a>
        <a v-if="!isAuthenticated" class="nav-link" href="/logIn" v-on:click.prevent="navigateToLogin()">Log In</a>
        <button v-if="!isAuthenticated" class="nav-btn nav-btn--large nav-btn--green" title="Sign Up" v-on:click="navigateToSignUp('top_nav')"><span class="nav-text nav-text--even">Sign Up</span></button>
        <div v-if="isAuthenticated" class="dropdown" v-click-outside="hideAccountDropdown">
          <button class="nav-btn nav-btn--small nav-btn--account" title="My account" v-on:click.prevent="toggleAccountDropdown()"><span class="nav-text">{{userFirstLetter}}</span></button>
          <span class="notification-gradient" v-if="userPlanType !== 'SuperHero'"></span>
          <div class="dropdown-menu" v-if="showAccountDropdown">
            <button class="dropdown-item" v-on:click="navigateToNew()"><span class="icon icon-stack"></span><span class="nav-text">My markups</span></button>
            <button class="dropdown-item" v-on:click="navigateToAccount()"><span class="icon icon-account"></span><span class="nav-text">My account</span></button>
            <button class="dropdown-item" v-on:click="navigateToSettings()"><span class="icon icon-settings"></span><span class="nav-text">My settings</span></button>
            <button class="dropdown-item" v-on:click="navigateToTeam()" v-if="userDetails.isTeamOwner"><span class="icon icon-team"></span><span class="nav-text">My team</span></button>
            <button class="dropdown-item" v-on:click="navigateToWhatIsNew()"><span class="icon icon-star"></span><span class="nav-text">What's new</span></button>
            <button class="dropdown-item" v-if="userPlanType !== 'SuperHero'" v-on:click="navigateToUpgrade"><span class="icon icon-arrow color-gradient"></span><span class="nav-text nav-text--gradient">Upgrade</span></button>
            <button class="dropdown-item" v-on:click="signOut()"><span class="icon icon-log-out"></span><span class="nav-text">Log out</span></button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import navigationPresets from "../navigationPresets";
  import {mapMutations, mapState} from "vuex";
  import {Notifications} from "../constants";
  import {getDetails, signOut} from "../services/authService";
  import Logo from "@/components/Shared/Logo";

  export default {
    name: "Nav",
    components: {Logo},
    data() {
      return {
        showAccountDropdown: false,
        showIntegrationsDropdown: false
      };
    },
    computed: {
      userFirstLetter() {
        if (!this.isAuthenticated) {
          return '';
        }

        if (this.userFirstName) {
          return this.userFirstName.substring(0, 1).toUpperCase();
        }

        return this.userEmail.substring(0, 1).toUpperCase();
      },
      ...mapState([
        'isAuthenticated',
        'userFirstName',
        'userEmail',
        'userDetails',
        'userPlanType',
        'teamBrand'
      ])
    },
    methods: {
      toggleIntegrationsDropdown() {
        this.showAccountDropdown = false;
        this.showIntegrationsDropdown = !this.showIntegrationsDropdown;
      },
      hideIntegrationsDropdown: (self) => {
        if (self.showIntegrationsDropdown !== false) {
          self.showIntegrationsDropdown = false;
        }
      },
      toggleAccountDropdown() {
        this.showIntegrationsDropdown = false;
        this.showAccountDropdown = !this.showAccountDropdown;
      },
      hideAccountDropdown: (self) => {
        if (self.showAccountDropdown !== false) {
          self.showAccountDropdown = false;
        }
      },
      async signOut() {
        this.setLoading(true);
        await signOut();
        this.setUser(null);

        const userDetails = await getDetails();
        this.setUserDetails(userDetails);

        this.setLoading(false);
        this.navigateToRoot();
      },
      ...navigationPresets,
      ...mapMutations([
        'setUser',
        'setLoading',
        'setUserDetails'
      ])
    },
    notifications: Notifications,
  }
</script>

<style scoped>
  @import '../styles/globalShared.css';

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
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  div.container {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin: 0 5px;
  }

  a.nav-link {
    font-size: 13px;
    line-height: 15px;
    font-weight: 700;
    text-align: right;
    margin-left: 5px;
    margin-right: 22px;
    color: #9ca5b4;
    text-decoration: none;
    white-space: nowrap;
  }

  button.nav-link {
    font-size: 13px;
    line-height: 15px;
    font-weight: 700;
    text-align: right;
    margin: 0 22px 0 5px;
    color: #9ca5b4;
    text-decoration: none;
    white-space: nowrap;
  }

  @media (hover: hover) {
    a.nav-link:hover {
      color: #fff;
    }
    button.nav-link:hover {
      color: #fff;
      background-color: transparent;
    }
  }

  button.nav-btn--green, button.nav-btn--account {
    margin-left: 0;
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

  @media screen and (max-width: 729px) {
    a.hide-two, div.hide-two {
      display: none;
    }
  }

  @media screen and (max-width: 520px) {
    div.container {
      margin: 0;
    }
    div.tooltip-wrapper {
      margin: 0 5px;
    }
    button.nav-btn {
      margin: 0 5px 0 0;
    }
    button.nav-btn--small {
      width: 30px;
    }
    span.icon {
      width: 30px;
    }
    button.nav-btn--account, div.dropdown-menu span.icon {
      width: 40px;
    }
  }

  div.logo-container {
    height: 40px;
  }

  @media screen and (max-width: 359px) {
    div.logo-container {
      display: none;
    }
  }
</style>
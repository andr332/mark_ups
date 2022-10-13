<template>
  <div class="wrapper">
    <div class="container">
      <div v-if="userPlanType === 'Sidekick'" class="limit-text">
        <div class="limit-blob limit-blob--right">
          <img src="../assets/green-blob.svg" alt="Highlight">
        </div>
        <div class="limit-text-wrapper">
          <h1>Create a free <br>account to continue!</h1>
          <p>You’ve reached the limit <strong>({{markUpStats.createdMarkUps}}/{{markUpStats.allowedMarkUps}})</strong> for the Sidekick plan this month. Create a free Hero account to unlock more uploads and continue using Markup Hero.</p>
          <a href="/signUp" v-on:click.prevent="navigateToSignUp('markup_limit')" class="limit-link">Sign Up</a>
          <a class="why-link" href="https://help.markuphero.com/article/11" rel="noopener" target="_blank">Why am I being asked to create a free account?</a>
        </div>
      </div>
      <div v-if="userPlanType === 'Hero'" class="limit-text">
        <div class="limit-blob limit-blob--left">
          <img src="../assets/green-blob.svg" alt="Highlight">
        </div>
        <div class="limit-text-wrapper">
          <h1>{{markUpStats.createdMarkUps}}/{{markUpStats.allowedMarkUps}} uploads <br> upgrade to continue!</h1>
          <p>You’ve reached the limit <strong>({{markUpStats.createdMarkUps}}/{{markUpStats.allowedMarkUps}})</strong> for the free Hero plan this month. Upgrade to Superhero to get unlimited uploads and advanced Markup Hero features.</p>
          <a href="/upgrade?code=1MONTHFREE" v-on:click.prevent="navigateToUpgradePromo()" class="limit-link limit-link--gradient">Try 1 Month Free</a>
          <a class="why-link" href="https://help.markuphero.com/article/11" rel="noopener" target="_blank">Why am I being asked to upgrade?</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import navigationPresets from "../navigationPresets";
  import {mapState} from "vuex";
  import {trackMarkUpLimit} from "../services/analytics";
  import {heroCapReached} from "../services/authService";

  export default {
    name: "StarterLimit",
    computed: {
      ...mapState([
        'isAuthenticated',
        'markUpStats',
        'userDetails',
        'userPlanType',
        'markUpId'
      ])
    },
    async mounted() {
      trackMarkUpLimit(this.markUpId, this.userPlanType);

      if (this.userPlanType === 'Hero') await heroCapReached();
    },
    methods: navigationPresets
  }
</script>

<style scoped>
  div.wrapper {
    margin: 60px 0 0 0;
    padding: 40px;
    border-radius: 2px;
    background-color: #282C34;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    min-height: 560px;
  }

  div.container {
    margin: auto;
    max-width: 960px;
  }

  div.limit-text {
    margin: 60px auto 40px auto;
    max-width: 640px;
    position: relative;
  }

  div.limit-text-wrapper {
    position: relative;
  }

  div.limit-blob {
    position: absolute;
    top: -1px;
  }

  div.limit-blob--right {
    right: 155px;
  }

  div.limit-blob--left {
    left: 160px;
  }

  div.limit-blob img {
    display: block;
    width: auto;
    max-width: 100%;
    max-height: 64px;
  }

  h1 {
    margin: 0 0 20px 0;
    font-size: 52px;
    line-height: 60px;
    text-align: center;
    color: #fff;
  }

  p {
    margin: 0 0 30px 0;
    font-size: 20px;
    line-height: 30px;
    text-align: center;
    color: #9CA5B4;
  }

  a.limit-link {
    display: block;
    margin: auto;
    width: 160px;
    height: 50px;
    font-size: 16px;
    line-height: 50px;
    text-align: center;
    font-weight: 700;
    background-color: #03a87c;
    color: #fff;
    text-decoration: none;
    border-radius: 2px;
  }

  a.limit-link--gradient {
    background-image: linear-gradient(to bottom right,#FCD117,#FF377C 67%);
    background-color: #FF377C;
  }

  @media (hover: hover) {
    a.limit-link:hover {
      background-color: #0071DF;
    }
    a.limit-link--gradient:hover {
      background-image: linear-gradient(to bottom right,#0071DF,#FF377C 67%);
      background-color: #0071DF;
    }
  }

  a.why-link {
    display: block;
    margin: 60px auto 0 auto;
    font-size: 13px;
    line-height: 20px;
    text-align: center;
    color: #5E656F;
  }

  @media screen and (max-width: 767px) {
    div.limit-blob--right {
      right: 0;
      left: 58%;
    }
    div.limit-blob--left {
      left: 20%;
    }
    div.limit-blob img {
      max-height: 50px;
    }
    h1 {
      font-size: 42px;
      line-height: 50px;
    }
  }

  @media screen and (max-width: 479px) {
    div.wrapper{
      padding: 20px;
    }
    div.limit-text {
      margin: 40px auto;
    }
    div.limit-blob img {
      max-height: 40px;
    }
    h1 {
      font-size: 32px;
      line-height: 40px;
    }
  }
</style>
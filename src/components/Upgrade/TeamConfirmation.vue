<template>
  <div>
    <Nav></Nav>
    <section class="hero-section">
      <div class="container">
        <div class="hero-text">
          <div class="hero-text-wrapper">
            <h1>Welcome to Teams</h1>
            <p>You now have access to all our advanced features as well as unlimited uploads, edits, and history.
              <span v-if="!$route.query.isOwner">You are now part of a team.</span>
              <span v-if="$route.query.isOwner">As a team owner you can <a href="/team" v-on:click.prevent="navigateToTeam()">manage your team</a>, as well as unlock more members and custom features by <a href="/team/upgrade" v-on:click.prevent="navigateToTeamUpgrade()">stacking AppSumo codes</a>.</span></p>
            <a class="use-link" href="/new" v-on:click.prevent="navigateToNew()">Start Creating</a>
          </div>
        </div>
      </div>
    </section>
    <Footer></Footer>
  </div>
</template>

<script>
  import navigationPresets from "../../navigationPresets";
  import Nav from "../Nav";
  import Footer from "../Footer";
  import {mapState} from "vuex";
  import {trackSubscriptionCreate} from "../../services/analytics";

  export default {
    name: "TeamConfirmation",
    components: {Nav, Footer},
    computed: mapState([
      'userEmail'
    ]),
    mounted() {
      if (this.$route.query.isOwner) trackSubscriptionCreate();
    },
    methods: navigationPresets
  }
</script>

<style scoped>
  div, label, input, button, form, select {
    box-sizing : border-box !important;
  }

  section {
    padding: 60px 40px;
    color: #fff;
  }

  div.container {
    margin: auto;
    max-width: 520px;
  }

  div.hero-text {
    margin: 60px auto 40px auto;
    max-width: 960px;
    position: relative;
  }

  div.hero-text-wrapper {
    position: relative;
  }

  h1 {
    margin: 0 0 20px 0;
    font-size: 52px;
    line-height: 60px;
    text-align: center;
  }

  p {
    margin: 0 0 30px 0;
    font-size: 20px;
    line-height: 30px;
    text-align: center;
    color: #9CA5B4;
  }

  p a {
    color: #03a87c;
  }

  a.use-link {
    display: block;
    margin: auto;
    margin-bottom: 60px;
    width: 160px;
    height: 50px;
    font-size: 16px;
    line-height: 50px;
    text-align: center;
    font-weight: 700;
    background-image: linear-gradient(to bottom right,#FCD117,#FF377C 67%);
    background-color: #FF377C;
    color: #fff;
    text-decoration: none;
    border-radius: 2px;
  }
</style>
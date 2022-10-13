<template>
  <div>
    <Nav></Nav>
    <section class="hero-section">
      <div class="container">
        <div class="hero-text">
          <div class="hero-text-wrapper">
            <h1>You’re a Superhero</h1>
            <p>We’re sending a confirmation email to <strong>{{userEmail}}</strong> with your receipt. You now have access to all our advanced features as well as unlimited uploads, edits, and history.</p>
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
  import superheroGuard from "../../guards/superheroGuard";
  import authorizedGuard from "../../guards/authorizedGuard";
  import multiguard from 'vue-router-multiguard';
  import {mapState} from "vuex";
  import {trackSubscriptionCreate} from "../../services/analytics";

  export default {
    name: "SuperheroConfirmation",
    components: {Nav, Footer},
    beforeRouteEnter: multiguard([authorizedGuard, superheroGuard]),
    computed: mapState([
      'userEmail'
    ]),
    mounted() {
      trackSubscriptionCreate();
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
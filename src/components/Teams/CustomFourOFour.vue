<template>
  <div>
    <div class="logo-container">
      <Logo />
    </div>
    <section>
      <div class="container">
        <div class="hero-text">
          <h1>¯\_(ツ)_/¯</h1>
          <p>We can’t find this page. This domain is used for sharing markups from Markup Hero. If you're looking for a markup, it may have been deleted.</p>
          <div class="helpful-links">
            <p>Here are a few links that may be helpful:</p>
            <p><a href="https://markuphero.com/">Markup Hero Home</a></p>
            <p><a href="https://markuphero.com/logIn">Markup Hero Log In</a></p>
            <p><a href="https://help.markuphero.com/" rel="noopener" target="_blank">Markup Hero Help & Support</a></p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
  import navigationPresets from "@/navigationPresets";
  import Logo from "@/components/Shared/Logo";

  export default {
    name: "CustomFourOFour",
    components: {Logo},
    methods: navigationPresets
  }
</script>

<style scoped>

  div.logo-container {
    width: 60px;
    margin: 10px auto;
  }

  section {
    padding: 60px 40px;
  }

  div.container {
    margin: auto;
    max-width: 960px;
  }

  div.hero-text {
    margin: 60px auto 40px auto;
    max-width: 960px;
    position: relative;
  }

  h1 {
    margin: 0;
    font-size: 52px;
    line-height: 60px;
    text-align: center;
    color: #fff;
  }

  p {
    margin: 40px 0 60px 0;
    font-size: 20px;
    line-height: 30px;
    text-align: center;
    color: #fff;
  }

  div.helpful-links p {
    margin: 20px 0;
    font-size: 16px;
    line-height: 20px;
    color: #9CA5B4;
  }

  div.helpful-links p a {
    margin: 20px 0;
    font-size: 16px;
    line-height: 20px;
    color: #0071df;
  }
</style>
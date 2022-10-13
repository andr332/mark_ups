<template>
  <div>
    <footer>
      <div class="container">
        <div class="footer-row">
          <div class="footer-content">
            <h5>Product</h5>
            <ul>
              <li><a v-if="!isAuthenticated" class="footer-link" href="/signUp" v-on:click.prevent="navigateToSignUp('footer')">Sign Up</a></li>
              <li><a v-if="!isAuthenticated" class="footer-link" href="/logIn" v-on:click.prevent="navigateToLogin()">Log In</a></li>
              <li><a class="footer-link" href="/new" v-on:click.prevent="navigateToNew()">New Markup</a></li>
              <li><a class="footer-link" href="/download" v-on:click.prevent="navigateToDownload()">Download</a></li>
              <li><a class="footer-link" href="/pricing" v-on:click.prevent="navigateToPricing()">Pricing</a></li>
              <li><a class="footer-link" href="/integrations/chrome-extension.html" rel="noopener">Chrome Extension</a></li>
              <li><a class="footer-link" href="/integrations/google-drive-app.html" rel="noopener">Google Drive App</a></li>
              <li><a class="footer-link" href="/integrations/slack-app.html" rel="noopener">Slack App</a></li>
              <li><a class="footer-link" href="/integrations/annotation-api.html" rel="noopener">Annotation API</a></li>
              <li><a v-if="isAuthenticated" class="footer-link" href="/account" v-on:click.prevent="navigateToAccount()">My Account</a></li>
              <li><a v-if="isAuthenticated" class="footer-link" href="/settings" v-on:click.prevent="navigateToSettings()">My Settings</a></li>
            </ul>
          </div>
          <div class="footer-content">
            <h5>Resources</h5>
            <ul>
              <li><a class="footer-link" href="/blog/" rel="noopener" target="_blank">Blog</a></li>
              <li><a class="footer-link" href="https://roadmap.markuphero.com/changelog" rel="noopener" target="_blank">What's New</a></li>
              <li><a class="footer-link" href="https://roadmap.markuphero.com/" rel="noopener" target="_blank">Public Roadmap</a></li>
              <li><a class="footer-link" href="https://help.markuphero.com/" rel="noopener" target="_blank">Documentation</a></li>
              <li><a class="footer-link" href="https://help.markuphero.com/" rel="noopener" target="_blank">Help & Support</a></li>
              <li><a class="footer-link" href="/try/affiliate-program.html">Affiliate Program</a></li>
              <li><a class="footer-link" href="/blog/articles/markup-hero-guest-post-guidelines/" rel="noopener" target="_blank">Write For Us</a></li>
              <li><a class="footer-link" href="mailto:support@markuphero.com" rel="noopener" target="_blank">Contact</a></li>
            </ul>
          </div>
          <div class="footer-content">
            <h5>Uses</h5>
            <ul>
              <li><a class="footer-link" href="/try/teacher-tool.html" rel="noopener">For Teachers</a></li>
              <li><a class="footer-link" href="/try/screenshot.html" rel="noopener">Screenshot</a></li>
              <li><a class="footer-link" href="/try/annotate.html" rel="noopener">Annotate</a></li>
              <li><a class="footer-link" href="/try/annotate-pdf.html" rel="noopener">Annotate PDFs</a></li>
            </ul>
          </div>
          <div class="footer-content">
            <h5>Legal</h5>
            <ul>
              <li><a class="footer-link" href="/terms" v-on:click.prevent="navigateToTerms()">Terms</a></li>
              <li><a class="footer-link" href="/privacy" v-on:click.prevent="navigateToPrivacy()">Privacy</a></li>
              <li><a class="footer-link" href="/copyright" v-on:click.prevent="navigateToCopyright()">Copyright</a></li>
            </ul>
          </div>
          <div class="footer-content footer-content--first">
            <a class="footer-logo" href="/" v-on:click.prevent="navigateToRoot()">
              <img src="../assets/markupherologo.svg" alt="Markup Hero">
            </a>
            <p>© 2021 HERO, INC. All Rights Reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
  import navigationPresets from "../navigationPresets";
  import {mapState} from "vuex";

  export default {
    name: "Footer",
    computed: mapState([
      'isAuthenticated'
    ]),
    methods: navigationPresets
  }
</script>

<style scoped>
  .container {
    margin: auto;
    max-width: 960px;
  }

  img {
    width: 100%;
    display: block;
  }

  footer {
    padding: 120px 40px 60px 40px;
    background-color: #21252b;
  }

  .footer-row {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
  }

  .footer-content {
    min-width: 100px;
    margin-bottom: 60px;
    order: 2;
  }

  .footer-content--first {
    order: 1;
  }

  .footer-logo img {
    width: auto;
    height: 40px;
    margin: 0 0 20px 0;
  }

  .footer-content p {
    font-size: 13px;
    line-height: 20px;
    text-align: left;
  }

  h5 {
    margin: 0 0 10px 0;
    font-size: 16px;
    line-height: 20px;
    color: #5E656F;
    font-weight: 400;
  }

  ul {
    list-style-type: none;
    margin: 0;
    padding: 0;
  }

  li {
    margin-bottom: 10px;
  }

  .footer-link {
    display: block;
    font-size: 13px;
    line-height: 20px;
    color: #9CA5B4;
    text-decoration: none;
    font-weight: 700;
  }

  @media (hover: hover) {
    .footer-link:hover {
      color: #fff;
    }
  }

  @media screen and (max-width: 767px) {
    .footer-row {
      display: block;
    }
    .footer-content {
      width: 100%;
    }
    .footer-logo img {
      margin: 0 auto 20px auto;
    }
    .footer-content p {
      text-align: center;
    }
    h5 {
      text-align: center;
    }
    .footer-link {
      text-align: center;
    }
  }
</style>
<template>
  <div>
    <Nav></Nav>
    <div class="download-page">
      <section class="download-section">
        <div class="container">
          <div class="hero-text">
            <div class="hero-text-wrapper">
              <h1>Download</h1>
              <p>Speed up your workflow with the Markup Hero screenshot app for Mac, Windows, Linux and Chrome. Take scrolling screenshots using our Chrome Extension. It's all free, and no sign up is required.</p>
            </div>
            <div class="download-row">
              <div class="download-os">
                <div class="download-image">
                  <img src="../assets/mac-app.jpg" alt="Markup Hero Screenshot Tool - Mac Desktop App">
                </div>
                <label class="download-tip">Default Mac Screenshot Shortcut: <span>⌘ + shift + 1</span></label>
                <a href="https://storage.googleapis.com/markuphero-dist/MarkupHero-1.1.3.dmg" target="_blank" class="download-button" v-on:click.passive="trackMacDownload()">
                  <img src="../assets/mac-logo.svg" alt="Mac Icon">
                  <span>Mac Download</span>
                </a>
              </div>
              <div class="download-os">
                <div class="download-image">
                  <img src="../assets/windows-app.jpg" alt="Markup Hero Screenshot Tool - Windows Desktop App">
                </div>
                <label class="download-tip">Default Windows Screenshot Shortcut: <span>ctrl + shift + 1</span></label>
                <a href="https://storage.googleapis.com/markuphero-dist/MarkupHero-1.1.3.exe" target="_blank" class="download-button" v-on:click.passive="trackWindowsDownload()">
                  <img src="../assets/windows-logo.svg" alt="Windows Icon">
                  <span>Windows Download</span>
                </a>
              </div>
              <div class="download-os">
                <div class="dropdown" v-click-outside="hideLinuxDropdown">
                  <button class="download-button" v-on:click.prevent="toggleLinuxDropdown()">
                    <img src="../assets/linux-logo.svg" alt="Linux Icon">
                    <span>Linux Download (Beta)</span>
                  </button>
                  <div class="dropdown-menu dropdown-menu--linux" v-if="showLinuxDropdown">
                    <a class="dropdown-item--text" href="https://storage.googleapis.com/markuphero-dist/MarkupHero-1.1.1.deb" target="_blank" v-on:click.passive="trackLinuxDownload('deb')">deb</a>
                    <a class="dropdown-item--text" href="https://storage.googleapis.com/markuphero-dist/MarkupHero-1.1.1.snap" target="_blank" v-on:click.passive="trackLinuxDownload('snap')">snap</a>
                    <a class="dropdown-item--text" href="https://storage.googleapis.com/markuphero-dist/MarkupHero-1.1.1.rpm" target="_blank" v-on:click.passive="trackLinuxDownload('rpm')">rpm</a>
                  </div>
                </div>
              </div>
              <div class="download-os">
                <a href="https://chrome.google.com/webstore/detail/markup-hero/bnlghmkgojdehkigfkkblmmeldkmoccb" target="_blank" class="download-button">
                  <img src="../assets/chrome-logo.svg" alt="Chrome Icon">
                  <span>Chrome Extension</span>
                </a>
              </div>
            </div>
            <div class="download-help">
              <p><a href="https://help.markuphero.com/article/2" rel="noopener" target="_blank">Click here for installation help and tips</a></p>
            </div>
          </div>
        </div>
      </section>
      <Footer></Footer>
    </div>
  </div>
</template>

<script>
  import Nav from "./Nav";
  import Footer from "./Footer";
  import {trackMacDownload, trackWindowsDownload} from "../services/analytics";
  import {trackLinuxDownload} from "@/services/analytics";

  export default {
    name: "Download",
    components: {Nav, Footer},
    data() {
      return {
        showLinuxDropdown: false
      };
    },
    methods: {
      toggleLinuxDropdown() {
        this.showLinuxDropdown = !this.showLinuxDropdown;
      },
      hideLinuxDropdown: (self) => {
        if (self.showLinuxDropdown !== false) {
          self.showLinuxDropdown = false;
        }
      },
      trackMacDownload() {
        trackMacDownload();
      },
      trackWindowsDownload() {
        trackWindowsDownload();
      },
      trackLinuxDownload(type) {
        trackLinuxDownload(type);
      }
    }
  }
</script>

<style scoped>
  @import '../styles/globalShared.css';

  .download-page {
    margin-top: 60px;
  }

  .download-section {
    padding: 60px 40px;
    color: #fff;
  }

  .container {
    margin: auto;
    max-width: 960px;
  }

  .hero-text {
    margin: 60px auto 40px auto;
    max-width: 960px;
    position: relative;
  }

  .hero-text-wrapper {
    position: relative;
    max-width: 640px;
    margin: auto;
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

  .download-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
  }

  .download-os {
    margin-bottom: 20px;
    width: calc(50% - 30px);
  }

  .download-button {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    height: 50px;
    font-size: 16px;
    line-height: 50px;
    text-align: center;
    font-weight: 700;
    background-color: #181A1F;
    color: #fff;
    text-decoration: none;
    border-radius: 2px;
    margin: 30px 0;
  }

  button.download-button {
    width: 100%;
  }

  div.dropdown-menu--linux {
    width: 100%;
    margin: 0;
    top: 50px;
    left: 50%;
    transform: translate(-50%, 0);
  }

  .download-button img {
    width: 16px;
    object-fit: contain;
    margin-right: 12px;
  }

  .download-image {
    border-radius: 2px;
    overflow: hidden;
    margin: 20px 0 20px 0;
  }

  img {
    width: 100%;
    display: block;
  }

  .download-tip {
    display: block;
    color: #5E656F;
    font-size: 13px;
    line-height: 23px;
    text-align: center;
  }

  .download-tip span {
    color: #9ca5b4;
    font-weight: 700;
    background-color: #2f333d;
    display: inline-block;
    padding: 0 5px;
    border-radius: 2px;
    border: 1px solid #5E656F;
  }

  .download-help a {
    color: #0071DF;
  }

  @media screen and (max-width: 767px) {
    .download-row {
      display: block;
    }
    .download-os {
      width: 100%;
    }
  }

  @media screen and (max-width: 479px) {
    .download-section {
      padding: 60px 20px;
    }
    h1 {
      font-size: 32px;
      line-height: 40px;
    }
    .download-image {
      margin: 40px 0 20px 0;
    }
  }
</style>
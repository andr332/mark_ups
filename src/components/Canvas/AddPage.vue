<template>
  <div class="wrapper">
    <div class="container">
      <div class="outer-container" v-cloak @drop.prevent="addFile" @dragover.prevent>
        <input id="file-input" accept="image/* application/pdf" type="file" name="file-input" style="display: none;" v-on:change="handleFileUpload" multiple />
        <button title="Cancel add page" class="cancel-add-page" v-on:click.prevent="closeAddPage()"><span class="icon icon-close"></span></button>
        <div class="inner-container">
          <h1 class="new-markup">Add Pages</h1>
          <p class="description">Upload images, a PDF or paste a link.</p>
          <button class="upload" v-on:click="openFileDialog()">
            <span class="icon icon-upload"></span>
            <span class="text-upload">Upload Image(s) or PDF</span>
            <span class="btn-empty-placeholder"></span>
          </button>
          <div class="link-text-container">
            <span class="icon icon-link"></span>
            <input class="link" type="text" placeholder="Paste a link" v-on:keyup="handleLinkInputKeyPress" v-model="websiteUrl">
            <button class="link" v-on:click="submitUrl()">
              <span class="icon icon-submit"></span>
            </button>
          </div>
          <div class="link-options-containers">
            <label class="radio-label" title="Desktop View">
              <input v-model="isMobile" v-bind:value="false" type="radio" name="link-option"><span class="radio-circle"></span><span class="radio-text">Desktop</span>
            </label>
            <label class="radio-label" title="Mobile View">
              <input v-model="isMobile" v-bind:value="true" type="radio" name="link-option" checked><span class="radio-circle"></span><span class="radio-text">Mobile</span>
            </label>
            <a class="support-info" href="https://help.markuphero.com/" rel="noopener" target="_blank">Help & Support</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import {
    addMarkUpPageFromImages, addMarkUpPageFromPdf, addMarkUpPageFromUrl,
    getMarkUpById, waitUntilJobsCompleted
  } from "../../services/markUpService";
  import {Notifications} from "../../constants";
  import {mapMutations, mapState} from "vuex";

  export default {
    name: "AddPage",
    data() {
      return {
        file: null,
        files: [],
        isMobile: false,
        websiteUrl: ''
      }
    },
    mounted() {
      window.addEventListener('paste', this.handlePasteEvent, false);
    },
    beforeDestroy() {
      window.removeEventListener('paste', this.handlePasteEvent, false);
    },
    computed: {
      ...mapState([
        'markUpId',
        'markUpPageNumber',
        'userPlanType'
      ])
    },
    methods: {
      handlePasteEvent(e) {
        const items = e.clipboardData.items;

        for (let item of items) {
          if (item.type && (item.type.indexOf('image/') === 0 || item.type.indexOf('application/pdf') === 0)) {
            e.preventDefault();
            this.files.push(item.getAsFile());
            this.uploadFiles();
            break;
          }
        }
      },
      addFile(e) {
        let droppedFiles = e.dataTransfer.files;
        if(!droppedFiles) return;

        this.files.push(...droppedFiles);
        this.uploadFiles();
      },
      openFileDialog() {
        let fileInput = document.getElementById('file-input');
        fileInput.click();
      },
      handleFileUpload() {
        let fileInput = document.getElementById('file-input');
        this.files.push(...fileInput.files);
        this.uploadFiles();
      },
      handleLinkInputKeyPress(e) {
        if (e.key === 'Enter') {
          this.submitUrl();
          e.preventDefault();
        }
      },
      async uploadFiles() {
        if (this.files.length === 0) return;

        const pdfFile = this.files.find(f => f.type === 'application/pdf');

        let loaderStyle = null;
        if (pdfFile) loaderStyle = 'pdf';
        else if (this.files.length > 1) loaderStyle = 'multi-image';
        else loaderStyle = 'image';

        this.setLoading({
          isLoading: true,
          loaderStyle
        });
        try {
          let jobIds = null;
          if (pdfFile) {
            jobIds = await addMarkUpPageFromPdf(this.markUpId, pdfFile, this.userPlanType === 'SuperHero');
          } else {
            jobIds = await addMarkUpPageFromImages(this.markUpId, this.files, this.userPlanType === 'SuperHero');
          }

          await waitUntilJobsCompleted(jobIds);

          const updatedMarkUp = await getMarkUpById(this.markUpId);
          this.setMarkUpPages({
            pages: updatedMarkUp.pages,
            pageNumber: this.markUpPageNumber
          });
          this.showPagesAddedMsg();
          this.closeAddPage();
        } catch (err) {
          if (err.code === 'FileSizeExceededLimit') {
            if (this.userPlanType === 'SuperHero') this.showSuperHeroFileSizeExceededLimitMsg();
            else this.showFileSizeExceededLimitMsg();
          } else {
            this.showErrorMsg();
          }
        } finally {
          this.setLoading(false);
          this.files = [];
        }
      },
      async submitUrl() {
        if (!this.isWebsiteUrlValid()) {
          return;
        }

        this.setLoading(true);
        try {
          const jobIds = await addMarkUpPageFromUrl(this.markUpId, this.websiteUrl, this.isMobile);
          await waitUntilJobsCompleted(jobIds);

          const updatedMarkUp = await getMarkUpById(this.markUpId);
          this.setMarkUpPages({
            pages: updatedMarkUp.pages,
            pageNumber: this.markUpPageNumber
          });

          this.showPagesAddedMsg();
          this.closeAddPage();
        } catch {
          this.showErrorMsg();
        } finally {
          this.setLoading(false);
          this.websiteUrl = '';
        }
      },
      isWebsiteUrlValid() {
        if (!this.websiteUrl) {
          this.showInvalidUrlMsg();
          return false;
        }

        return true;
      },
      closeAddPage() {
        this.setIsAddPageOpen(false);
      },
      ...mapMutations([
        'setLoading',
        'setIsAddPageOpen',
        'setMarkUpPages'
      ])
    },
    notifications: Notifications
  }
</script>

<style scoped>
  div, label, input, button, form {
    box-sizing : border-box !important;
  }

  button {
    margin: 0;
    padding: 0;
    border: 0;
    outline: 0;
    background-color: transparent;
    cursor: pointer;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }

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
    z-index: 50;
    overflow-x: hidden;
    overflow-y: scroll;
  }

  div.container {
    margin: auto;
    width: 100%;
    max-width: 960px;
  }

  div.outer-container {
    padding: 60px 40px;
    border-radius: 2px;
    border: dashed 1px #5e656f;
    background-color: #21252b;
    display: flex;
    flex-direction: column;
    justify-content: center;
    position: relative;
  }

  button.cancel-add-page {
    position: absolute;
    top: 0;
    right: 0;
    background-color: #2f333d;
    border-radius: 2px;
  }

  @media (hover: hover) {
    button.cancel-add-page:hover {
      background-color: #FF7A59;
    }
  }

  div.inner-container {
    align-self: center;
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 360px;
    min-width: 270px;
  }

  h1.new-markup {
    margin-top: 20px;
    font-size: 32px;
    line-height: 40px;
    font-weight: 700;
    text-align: center;
    color: #9ca5b4;
  }

  p.description {
    margin: 10px 0;
    font-size: 16px;
    line-height: 20px;
    text-align: center;
    color: #9ca5b4;
  }

  button.upload {
    height: 50px;
    border-radius: 2px;
    background-color: #0071df;
    margin-top: 30px;
  }

  span.icon {
    height: 40px;
    width: 40px;
    min-width: 40px;
    background-color: #9ca5b4;
  }

  span.icon-upload {
    mask: url('../../assets/upload.svg') no-repeat center center;
    background-color: #fff;
  }

  span.icon-link {
    mask: url('../../assets/link.svg') no-repeat center center;
    margin: auto;
    background-color: #5E656F;
  }

  span.icon-submit {
    mask: url('../../assets/submit.svg') no-repeat center center;
    background-color: #fff;
  }

  span.text-upload {
    font-size: 16px;
    font-weight: bold;
    line-height: 20px;
    text-align: center;
    color: #ffffff;
    flex-grow: 2;
    margin: auto;
  }

  input.link {
    font-size: 16px;
    line-height: 20px;
    color: #fff;
    flex-grow: 2;
    margin: auto 5px auto auto;
    text-align: left;
    background-color: #21252b;
    border-radius: 2px;
    border: none;
    outline: none;
  }

  input.link::placeholder {
    color: #5E656F;
    opacity: 1;
  }

  button.link {
    width: 40px;
    height: 40px;
    border-radius: 2px;
    background-color: #0071df;
    margin: auto 5px auto auto;
  }

  span.btn-empty-placeholder {
    height: 40px;
    width: 40px;
  }

  div.link-text-container {
    border-radius: 2px;
    border: solid 1px #5E656F;
    padding: 0;
    height: 50px;
    margin-top: 40px;
    display: flex;
    align-items: flex-start;
    flex-direction: row;
  }

  div.link-options-containers {
    padding: 0;
    margin: 20px 0;
    display: flex;
    align-items: flex-start;
    flex-direction: row;
  }

  label.radio-label {
    display: inline-block;
    position: relative;
    padding-left: 30px;
    margin-right: 20px;
    cursor: pointer;
    font-weight: bold;
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

    label.radio-label:hover input ~ .radio-text {
      color: #fff;
    }
  }

  label.radio-label input:checked ~ .radio-circle {
    background-color: #0071DF;
    border: 1px solid #0071DF;
  }

  label.radio-label input:checked ~ .radio-text {
    color: #fff;
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

  a.support-info {
    opacity: 0.5;
    font-size: 13px;
    font-weight: normal;
    font-stretch: normal;
    font-style: normal;
    line-height: 1.54;
    letter-spacing: normal;
    text-align: right;
    color: #9ca5b4;
    flex-grow: 2;
    text-decoration: none;
  }

  @media (hover: hover) {
    a.support-info:hover {
      text-decoration: underline;
    }
  }

  @media screen and (max-width: 520px) {
    div.wrapper {
      padding: 65px 5px;
    }
    div.outer-container {
      padding: 35px 15px;
    }
  }
</style>
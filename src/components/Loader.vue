<template>
  <div>
    <div class="invisible" v-bind:class="{ 'loading': this.isLoading}">
      <div class="invisible-card" v-bind:class="{ 'invisible-card--auth': loaderStyle === 'google-auth'}">
        <tile></tile>
        <label v-if="!loaderStyle"><strong>Loading...</strong></label>
        <label v-if="loaderStyle === 'image'"><strong>Loading Image...</strong></label>
        <label v-if="loaderStyle === 'multi-image'"><strong>Loading Images...</strong><br><span><strong>Note:</strong> This may take a minute.</span></label>
        <label v-if="loaderStyle === 'pdf'"><strong>Loading PDF...</strong><br><span><strong>Note:</strong> This may take a minute.</span></label>
        <label v-if="loaderStyle === 'gdrive'"><strong>Loading G Drive File...</strong><br><span><strong>Note:</strong> Please enable 3rd party cookies.</span></label>
        <label v-if="loaderStyle === 'blur'"><strong>Permanently Blurring markup...</strong></label>
        <label v-if="loaderStyle === 'exportPdf'"><strong>Exporting as PDF...</strong><br><span><strong>Note:</strong> This may take a minute.</span></label>
        <label v-if="loaderStyle === 'google-auth'"><strong>Logging into Google...</strong></label>
      </div>
    </div>
  </div>
</template>

<script>
  import {mapState} from "vuex";

  export default {
    name: "Loader",
    computed: mapState([
      'loaderStyle',
      'isLoading'
    ]),
    methods: {
    }
  }
</script>

<style scoped>
  .invisible {
    display: none;
    z-index: 0;
  }

  .invisible-card {
    width: calc(100% - 40px);
    max-width: 260px;
    padding: 40px 20px;
    background-color: #2f333d;
    display: flex;
    flex-direction: column;
    align-items: center;
    border-radius: 2px;
    box-shadow: 0 4px 8px rgba(0,0,0,.33);
  }

  div.invisible-card--auth .spinner > div {
    background-color: #FF7A59 !important;
  }

  .invisible-card label {
    font-size: 13px;
    line-height: 25px;
    text-align: center;
    color: #9CA5B4;
  }

  .invisible-card label strong {
    text-transform: uppercase;
    letter-spacing: 2px;
  }

  .invisible-card label span {
    color: #5E656F;
  }

  .invisible-card label.auth-notice, .invisible-card label.auth-notice span {
    color: #fff;
  }

  .loading {
    content: '';
    display: flex !important;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(24,26,31,.42);
    z-index: 999;
  }
</style>
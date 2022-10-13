<template>
  <div class="dropdown" v-click-outside="hideMarkUpOptions">
    <button class="nav-btn nav-btn--small markup-controls" title="Options"
            v-on:click.prevent="showMarkUpOptions(item.markUpId)"><span class="icon icon-more"></span>
    </button>
    <div class="dropdown-menu" v-if="showDropdown">

      <button class="dropdown-item" title="Copy link to clipboard"
              v-on:click.prevent="copyShareLink(item.markUpId, item.isPrivate)"><span class="icon icon-link"></span><span
          class="nav-text">Copy link</span></button>
      <button class="dropdown-item" title="Download markup" v-on:click.prevent="downloadMarkUp(item.markUpId)">
        <span class="icon icon-download"></span><span
          class="nav-text">Download markup</span></button>
      <button v-if="userPlanType === 'SuperHero'" class="dropdown-item" title="Duplicate markup" v-on:click.prevent="duplicateMarkUp(item.markUpId)">
        <span class="icon icon-duplicate"></span><span
          class="nav-text">Duplicate markup</span></button>
      <hr>
      <button class="dropdown-item" title="Delete markup" v-on:click.prevent="deleteMarkUp(item.markUpId)">
        <span class="icon icon-delete"></span><span
          class="nav-text nav-text--delete">Delete markup</span></button>
    </div>
  </div>
</template>

<script>
  export default {
    name: "Dropdown",
    data() {
      return {
        showDropdown: false
      };
    },
    methods: {
      hideDropdown() {
        this.showDropdown = false;
      },
      showDropdown() {
        this.showDropdown = true;
      }
    }
  }
</script>

<style scoped>

</style>
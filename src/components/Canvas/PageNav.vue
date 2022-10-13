<template>
  <div v-if="currentMarkUpPages && currentMarkUpPages.length > 1" class="nav-multi-page">
    <div class="tooltip-wrapper">
      <button :disabled="currentMarkUpPageNumber === 1" v-on:click.prevent="prevPage()"><span class="icon-previous"></span></button>
      <span class="tooltip tooltip--above"><span class="shortcut">(←)</span> Previous page</span>
    </div>
    <span class="page-number">Page {{currentMarkUpPageNumber}} / {{currentMarkUpPages.length}}</span>
    <div class="tooltip-wrapper">
      <button :disabled="currentMarkUpPageNumber === currentMarkUpPages.length" v-on:click.prevent="nextPage()"><span class="icon icon-next"></span></button>
      <span class="tooltip tooltip--above">Next page <span class="shortcut">(→)</span></span>
    </div>
  </div>
</template>

<script>
  import EventBus from "../../stores/eventBus";

  export default {
    name: "PageNav",
    props: ['currentMarkUpPages', 'currentMarkUpPageNumber'],
    methods: {
      prevPage() {
        EventBus.$emit('prevPage');
      },
      nextPage() {
        EventBus.$emit('nextPage');
      }
    }
  }
</script>

<style scoped>

  div.nav-multi-page {
    position: sticky;
    bottom: 0;
    margin: 0 auto;
    width: 280px;
    height: 60px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    background-color: #181A1F;
    border-top-left-radius: 2px;
    border-top-right-radius: 2px;
  }

  div.nav-multi-page span.page-number {
    font-weight: 700;
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: #fff;
  }

  div.nav-multi-page button {
    border-radius: 2px;
  }

  div.nav-multi-page button:disabled {
    cursor: not-allowed;
    background-color: #181A1F;
  }

  div.nav-multi-page button:disabled span.icon-previous, div.nav-multi-page button:disabled span.icon-next {
    background-color: #5E656F;
  }
</style>
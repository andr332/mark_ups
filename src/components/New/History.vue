<template>
  <div class="history-wrapper">
    <div class="collection-wrapper">
      <Collections></Collections>
    </div>
    <div class="history">
      <MyMarkups v-if="historyTab === 'mine'"></MyMarkups>
      <ViewedMarkups v-if="historyTab === 'viewed'"></ViewedMarkups>
      <div v-if="isLoadingHistory" class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
    </div>
  </div>
</template>

<script>
  import {mapMutations, mapState} from "vuex";
  import MyMarkups from "./MyMarkups";
  import ViewedMarkups from "./ViewedMarkups";
  import Collections from "./Collections";

  export default {
    name: "History.vue",
    components: {Collections, ViewedMarkups, MyMarkups},
    computed: {
      ...mapState([
        'historyTab',
        'history',
        'viewHistory',
        'isAuthenticated',
        'isLoadingHistory'
      ])
    },
    methods: {
      ...mapMutations([
        'setHistoryTab'
      ])
    }
  }
</script>

<style scoped>
  div.history-wrapper {
    display: flex;
    position: relative;
    margin: 0 20px;
  }

  div.history-wrapper:focus {
    outline: none;
  }

  div.collection-wrapper {
    padding: 40px 20px;
    position: sticky;
    top: 60px;
    width: 260px;
    flex-shrink: 0;
    height: calc(100vh - 60px);
    z-index: 2;
    overflow-y: scroll;
  }

  div.collection-wrapper::-webkit-scrollbar {
    display: none;
  }

  @media screen and (max-width: 960px) {
    div.collection-wrapper {
      width: 200px;
      padding-right: 10px;
    }
  }

  @media screen and (max-width: 620px) {
    div.history-wrapper {
      margin: 0;
      flex-direction: column;
    }
    div.collection-wrapper {
      width: 100%;
      height: auto;
      padding: 35px 20px 0 20px;
      overflow-y: auto;
      top: -10px;
      background-color: #282C34;
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    div.collection-wrapper::-webkit-scrollbar {
      display: none;
    }
  }

  div.history {
    width: 100%;
    max-width: 1330px;
    padding: 40px 20px;
    margin: auto;
    display: flex;
    flex-grow: 1;
    min-height: calc(100vh - 60px);
    flex-direction: column;
  }

  @media screen and (max-width: 1699px) {
    div.history {
      max-width: 1000px;
    }
  }

  @media screen and (max-width: 520px) {
    div.history {
      padding: 20px;
    }
  }

  /* LOADING SPINNER */
  .lds-ellipsis {
    display: block;
    position: relative;
    width: 40px;
    height: 40px;
    margin: 0 auto;
  }
  .lds-ellipsis div {
    position: absolute;
    top: 16px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #5E656F;
    animation-timing-function: cubic-bezier(0, 1, 1, 0);
  }
  .lds-ellipsis div:nth-child(1) {
    left: 8px;
    left: 0px;
    animation: lds-ellipsis1 0.6s infinite;
  }
  .lds-ellipsis div:nth-child(2) {
    left: 8px;
    left: 0px;
    animation: lds-ellipsis2 0.6s infinite;
  }
  .lds-ellipsis div:nth-child(3) {
    left: 16px;
    animation: lds-ellipsis2 0.6s infinite;
  }
  .lds-ellipsis div:nth-child(4) {
    left: 32px;
    animation: lds-ellipsis3 0.6s infinite;
  }
  @keyframes lds-ellipsis1 {
    0% {
      transform: scale(0);
    }
    100% {
      transform: scale(1);
    }
  }
  @keyframes lds-ellipsis3 {
    0% {
      transform: scale(1);
    }
    100% {
      transform: scale(0);
    }
  }
  @keyframes lds-ellipsis2 {
    0% {
      transform: translate(0, 0);
    }
    100% {
      transform: translate(16px, 0);
    }
  }
  /* LOADING SPINNER */
</style>
<template>
  <div class="multi-page" v-if="currentMarkUpPages && currentMarkUpPages.length > 1" id="page-nav">
    <div class="page-wrapper">
      <div class="page" v-for="page in currentMarkUpPages" :key="page.imageIdentifier" v-bind:class="{ 'page--active': page.order === currentMarkUpPageNumber }">
        <a :href="getMarkUpSharePath({markUpId: currentMarkUpId, pageNumber: page.order, isPrivate: markUpPrivate})" v-on:click.prevent="goToPage(page.order)" class="page-image-wrapper">
          <div class="page-image">
            <img :src="page.thumbnailUrl" @error="replaceThumbnailWithDefault" :alt="`Page ${page.order}`">
          </div>
        </a>
        <div class="page-text">
          <a :href="getMarkUpSharePath({markUpId: currentMarkUpId, pageNumber: page.order, isPrivate: markUpPrivate})" v-on:click.prevent="goToPage(page.order)" class="page-number">Page {{page.order}}</a>
          <button v-if="canEditCurrentMarkUp" title="Delete page" v-on:click.prevent="deletePage(page)"><span class="icon icon-delete"></span></button>
        </div>
      </div>
      <button class="nav-btn nav-btn--large nav-btn--blue" v-if="canEditCurrentMarkUp" v-on:click.prevent="openAddPage()"><span class="icon icon-add"></span><span class="nav-text">Add Pages</span></button>
    </div>
  </div>
</template>

<script>
  import EventBus from "../../stores/eventBus";
  import {getMarkUpSharePath} from "../../services/markUpService";
  import {mapMutations, mapState} from "vuex";
  import DefaultThumbnail from "../../assets/default-thumbnail.svg";
  import {trackMarkUpAddPage} from "@/services/analytics";

  export default {
    name: "PageSidebar",
    props: ['currentMarkUpPages', 'currentMarkUpPageNumber', 'currentMarkUpId', 'canEditCurrentMarkUp'],
    computed: mapState([
      'markUpPrivate',
      'userPlanType',
      'markUpId'
    ]),
    methods: {
      goToPage(page) {
        EventBus.$emit('goToPage', page);
      },
      deletePage(page) {
        EventBus.$emit('deletePage', page);
      },
      getMarkUpSharePath(details) {
        return getMarkUpSharePath(details);
      },
      replaceThumbnailWithDefault(e) {
        e.target.src = DefaultThumbnail;
      },
      openAddPage() {
        trackMarkUpAddPage(this.markUpId, this.userPlanType);

        if (this.userPlanType !== 'SuperHero') return this.openUpgradeModal('add-page');

        this.setIsAddPageOpen(true);
      },
      ...mapMutations([
        'setIsAddPageOpen',
        'openUpgradeModal'
      ])
    }
  }
</script>

<style scoped>
  div.multi-page {
    flex-shrink: 0;
    width: 200px;
    height: 100%;
  }

  div.page-wrapper {
    width: inherit;
    height: calc(100% - 60px);
    position: fixed;
    top: 60;
    right: 0;
    bottom: 0;
    overflow-y: auto;
    overflow-x: hidden;
    background-color: #21252b;
    padding: 20px 20px 80px 20px;
    display: flex;
    flex-direction: column;
  }

  div.page-wrapper::-webkit-scrollbar {
    width: 10px;
  }

  div.page-wrapper::-webkit-scrollbar-thumb {
    background: #5E656F;
    border-radius: 5px;
  }


  div.page {
    width: 160px;
    background-color: #282C34;
    border: 1px solid #2f333d;
    border-radius: 2px;
    overflow: hidden;
    margin-bottom: 20px;
    flex-shrink: 0;
  }

  a.page-image-wrapper {
    display: block;
    text-decoration: none;
  }

  div.page-image {
    width: 100%;
    height: 100px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  div.page-image img {
    max-width: 100%;
    max-height: 100%;
    display: block;
  }

  div.page-text {
    width: 100%;
    height: 40px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    background-color: #2f333d;
  }

  div.page--active {
    border: 1px solid #0071df;
  }

  div.page--active a.page-number {
    color: #fff;
    background-color: #0071df;
  }

  div.page--active button {
    background-color: #0071df;
  }

  div.page--active span.icon-delete {
    background-color: rgba(255,255,255,0.5);
  }

  button.nav-btn--large {
    margin: 20px 0;
    width: 100%;
  }

  @media (hover: hover) {
    div.page:hover {
      border: 1px solid #0071df;
    }
    div.page:hover a.page-number {
      color: #fff;
      background-color: #0071df;
    }
    div.page:hover button {
      background-color: #0071df;
    }
    div.page:hover span.icon-delete {
      background-color: rgba(255,255,255,0.5);
    }
    div.page button:hover {
      background-color: #FF7A59;
    }
    div.page button:hover span.icon-delete {
      background-color: #fff;
    }
  }

  @media screen and (max-width: 767px) {
    div.multi-page {
      display: none;
    }
  }
</style>
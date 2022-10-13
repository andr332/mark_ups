<template>
  <div class="collection-container">
    <div class="group">
      <h2>My History</h2>
      <div class="group-btn">
        <button class="nav-btn nav-btn--mid-dark nav-btn--collection" v-bind:class="{'nav-btn--active': historyTab === 'mine' && this.selectedCollection === null}" v-on:click.prevent="selectCollection(null)">
          <span class="icon icon-stack"></span>
          <span class="nav-text">My Markups<span class="count"> ({{userDetails.totalMarkUps}})</span></span>
        </button>
        <button class="nav-btn nav-btn--mid-dark nav-btn--collection" v-on:click.prevent="showViewedMarkUps" v-bind:class="{'nav-btn--active': historyTab === 'viewed'}">
          <span class="icon icon-view"></span>
          <span class="nav-text">Viewed By Me</span>
        </button>
      </div>
    </div>
    <div class="group">
      <h2>My Collections</h2>
      <div class="group-btn">
        <button v-for="tag in allTags" class="nav-btn nav-btn--mid-dark nav-btn--collection droppable-collection" :key="tag.tag" :id="tag.tag" v-bind:class="{'nav-btn--active': selectedCollection === tag.tag}" v-on:click.prevent="selectCollection(tag.tag)">
          <span class="icon icon-collection"></span><span class="nav-text">{{tag.tag}}<span class="count"> ({{ tag.count }})</span></span>
        </button>
        <button :disabled="!isDraggingMarkUp" class="nav-btn nav-btn--mid-dark nav-btn--collection nav-btn--new-collection droppable-collection" id="new-markup-collection-z97s">
          <span class="icon icon-new"></span>
          <span class="nav-text">Drag Here For New Collection</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import {mapActions, mapMutations, mapState} from "vuex";
import {DefaultTags, HISTORY_PAGE_SIZE} from "@/constants";
import EventBus from "@/stores/eventBus";

  export default {
    name: "Collections",
    data() {
      return {
      };
    },
    mounted() {
      EventBus.$on('selectCollection', (collection) => {
        this.selectCollection(collection);
      });
    },
    beforeDestroy() {
      EventBus.$off('selectCollection');
    },
    computed: {
      allTags() {
        if (!this.userDetails || !this.userDetails.tags) return [];

        return this.userDetails.tags.filter(t => t.tag !== 'starred' && !DefaultTags.find(dt => dt.name === t.tag));
      },
      ...mapState([
          'markUpSearchTags',
          'userDetails',
          'historyTab',
          'selectedCollection',
          'isDraggingMarkUp'
      ])
    },
    methods: {
      async selectCollection(collection) {
        this.setHistoryTab('mine');

        const prevCollection = this.selectedCollection;
        this.setSelectedCollection(collection);

        if (prevCollection === this.selectedCollection) return;

        if (collection !== null) {
          if (prevCollection) this.deleteMarkUpSearchTags([prevCollection]);
          this.addMarkUpSearchTags([collection]);
        } else {
          this.setMarkUpSearchTags([]);
        }

        this.setLoadingHistory(true);
        await this.retrieveHistory({
          refresh: true,
          pageSize: HISTORY_PAGE_SIZE
        });
        this.setLoadingHistory(false);
      },
      showViewedMarkUps() {
        this.setSelectedCollection(null);
        this.setHistoryTab('viewed');
      },
      ...mapMutations([
          'addMarkUpSearchTags',
          'deleteMarkUpSearchTags',
          'setMarkUpSearchTags',
          'setLoadingHistory',
          'setHistoryTab',
          'setSelectedCollection'
      ]),
      ...mapActions([
        'retrieveHistory'
      ]),
    }
  }
</script>

<style scoped>
  @import '../../styles/globalShared.css';

  div.collection-container {

  }

  div.group {
    margin-bottom: 40px;
  }

  h2 {
    font-size: 20px;
    line-height: 20px;
    color: #fff;
  }

  button.nav-btn--collection {
    width: 100%;
    margin: 20px 0;
    justify-content: left;
  }

  span.icon-view {
    mask-size: 16px;
  }

  span.nav-text {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  button.nav-btn--new-collection {
    border: dashed 1px #5e656f;
    background-color: transparent;
    cursor: not-allowed;
  }

  button.nav-btn--new-collection span.icon-new {
    margin-left: -1px;
    background-color: #9CA5B4;
  }

  button.nav-btn--new-collection span.nav-text {
    color: #9CA5B4;
  }

  @media (hover: hover) {
    button.nav-btn--collection:hover {
      position: relative;
      width: auto;
      max-width: calc(100% + 20px);
      min-width: 100%;
    }
  }

  span.count{
    font-weight: 400;
  }

  @media screen and (max-width: 620px) {
    div.collection-container {
      display: flex;
    }
    h2 {
      position: sticky;
      left: 0;
      margin-right: 10px;
      display: inline-block;
    }
    div.group {
      width: fit-content;
      padding-right: 10px;
      margin-bottom: 0;
    }
    div.group-btn {
      display: flex;
    }
    button.nav-btn--collection {
      width: auto;
      margin-right: 10px;
      margin-bottom: 10px;
    }
    button.nav-btn--collection:hover {
      width: auto;
      max-width: auto;
      min-width: auto;
    }
  }

  .draggable--is-dragging button.nav-btn--collection {
    cursor: not-allowed;
    background-color: #21252b;
    color: #9CA5B4;
  }

  .draggable--is-dragging button.nav-btn--collection span.icon {
    background-color: #9CA5B4;
  }

  .draggable--is-dragging button.nav-btn--collection span.nav-text {
    color: #9CA5B4;
  }

  .draggable--is-dragging button.droppable-collection {
    cursor: pointer;
    border: dashed 1px #fff;
  }

  .draggable--is-dragging button.droppable-collection span.icon {
    margin-left: -1px;
    background-color: #fff;
  }

  .draggable--is-dragging button.droppable-collection span.nav-text {
    color: #fff;
  }

  .draggable--is-dragging button.droppable-collection:hover {
    background-color: #03a87c;
  }

</style>
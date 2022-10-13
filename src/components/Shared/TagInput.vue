<template>
  <vue-tags-input
      v-model="currentTag"
      :tags="formattedTags"
      :autocomplete-items="formattedAllTags"
      @tags-changed="tagsChanged"
      :add-only-from-autocomplete="this.mode === 'search'"
      :placeholder="this.mode === 'search' ? 'Search Collections' : 'Add Collection'"
      :delete-on-backspace="this.mode === 'search'"
      :maxlength="100"
      :autocomplete-min-length="0"
      v-on:focus.passive="onFocus"
  />
</template>

<script>
  import VueTagsInput from '@johmun/vue-tags-input';
  import EventBus from "../../stores/eventBus";
  import {mapMutations, mapState} from "vuex";

  export default {
    name: "TagInput",
    components: {VueTagsInput},
    props: ['mode', 'allTags', 'tags'],
    data() {
      return {
        currentTag: '',
        formattedTags: this.tags.map(text => Object.assign({}, {text}))
      };
    },
    computed: {
      formattedAllTags() {
        if (!this.currentTag.trim()) {
          return this.allTags.map(text => Object.assign({}, {text}));
        } else {
          return this.allTags.filter(t => t.toLowerCase().indexOf(this.currentTag.toLowerCase()) > -1).map(text => Object.assign({}, {text}));
        }
      },
      ...mapState([
        'userPlanType'
      ])
    },
    methods: {
      tagsChanged(newTags) {
        const changedTags = this.getChangedTags(newTags);
        EventBus.$emit('tagsChanged', {
          addedTags: changedTags.addedTags.map(at => at.text),
          deletedTags: changedTags.deletedTags.map(dt => dt.text)
        });

        for (let newTag of changedTags.addedTags) {
          this.formattedTags.push(newTag);
        }

        for (let deletedTag of changedTags.deletedTags) {
          let deleteIndex = this.formattedTags.map(t => t.text).indexOf(deletedTag.text);
          if (deleteIndex > -1) this.formattedTags.splice(deleteIndex, 1);
        }
      },
      getChangedTags(newTags) {
        const addedTags = [];

        for (const newTag of newTags) {
          if (!this.formattedTags.find(ft => ft.text.toLowerCase() === newTag.text.toLowerCase())) addedTags.push(newTag);
        }

        const deletedTags = [];
        for (const existingTag of this.formattedTags) {
          if (!newTags.find(nt => nt.text.toLowerCase() === existingTag.text.toLowerCase())) deletedTags.push(existingTag);
        }

        return {
          addedTags,
          deletedTags
        };
      },
      onFocus() {
        if (this.userPlanType !== 'SuperHero') this.openUpgradeModal('tags');
      },
      ...mapMutations([
        'openUpgradeModal'
      ])
    }
  }
</script>

<style scoped>
  div.vue-tags-input {
    background-color: #21252b;
    width: 100%;
  }
</style>
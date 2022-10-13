<template>
  <div class="wrapper">
    <div class="modal-card" v-click-outside="closeModal">
      <button title="Close" class="close" v-on:click.prevent="closeModal"><span class="icon icon-close"></span></button>
      <h4>Collection</h4>
      <p>This is a private collection for organizing your markups.</p>
      <form class="inner-container" v-on:submit.prevent="save">
        <label class="field-label">Collection Name</label>
        <input class="input-field" type="text" v-model="newTagName">
      </form>
      <button :disabled="newTagName.length < 3" class="card-button" v-on:click.prevent="save">{{editMode ? 'Save' : 'Create'}}</button>
      <button v-if="editMode" v-on:click.prevent="deleteCollection" class="card-button card-button--grey">Delete Collection</button>
      <div class="note">Deleting a collection will not delete your markups.</div>
    </div>
  </div>
</template>

<script>

  import EventBus from "@/stores/eventBus";
  import {mapState} from "vuex";

  export default {
    name: "EditCollectionModal",
    props: ['editMode', 'oldTag'],
    data() {
      return {
        newTagName: this.oldTag || ''
      }
    },
    computed: {
      ...mapState([
        'selectedCollection'
      ])
    },
    methods: {
      closeModal() {
        EventBus.$emit('closeEditCollectionModal');
      },
      deleteCollection() {
        EventBus.$emit('deleteCollection');
      },
      save() {
        EventBus.$emit('saveCollection', this.newTagName);
      }
    }
  }
</script>

<style scoped>
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
    z-index: 100;
    overflow-x: hidden;
    overflow-y: scroll;
  }

  div.modal-card {
    position: relative;
    margin: 0 auto;
    padding:  40px 40px 20px 40px;
    width: 100%;
    max-width: 360px;
    background-color: #181A1F;
    border-radius: 2px;
  }

  button.close {
    position: absolute;
    top: 0;
    right: 0;
    background-color: #2f333d;
    border-radius: 2px;
  }

  @media (hover: hover) {
    button.close:hover {
      background-color: #0071df;
    }
  }

  div.modal-card h4 {
    margin: 0 0 10px 0;
    font-size: 23px;
    line-height: 25px;
    color: #fff;
  }

  div.modal-card p {
    margin: 0 0 20px 0;
    font-size: 16px;
    line-height: 20px;
    color: #9CA5B4;
  }

  form.inner-container {
    margin: 40px 0;
  }

  label.field-label {
    display: block;
    color: #9ca5b4;
    font-size: 13px;
    line-height: 20px;
    margin: 20px 0 10px 0;
  }

  input.input-field {
    width: 100%;
    display: block;
    border-radius: 2px;
    border: solid 1px #5e656f;
    height: 48px;
    background-color: transparent;
    color: #fff;
    font-size: 16px;
    padding-left: 15px;
    padding-right: 15px;
  }

  button.card-button {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 50px;
    font-size: 16px;
    line-height: 20px;
    text-align: center;
    font-weight: 700;
    background-color: #0071df;
    color: #fff;
    text-decoration: none;
    border-radius: 2px;
    margin: 20px 0;
  }

  button.card-button--grey {
    background-color: transparent;
    color: #5E656F;
  }

  div.note {
    color: #5E656F;
    font-size: 13px;
    line-height: 15px;
    margin: -10px 0 20px 0;
    text-align: center;
  }

  @media (hover: hover) {
    button.card-button:hover {
      background-color: #03a87c;
    }
    button.card-button--grey:hover {
      background-color: #FF7A59;
      color: #fff;
    }
  }

  @media screen and (max-width: 479px) {
    div.wrapper {
      padding: 80px 20px;
    }
    div.modal-card {
      padding:  40px 20px 20px 20px;
    }
  }

</style>
<template>
  <div
      class="context-menu" 
      :style="{...contextMenuStyle, visibility}"
    >
    <div>
      <button @click="contextClickMoveToBack" class="dropdown-item"><span class="icon icon-back"></span><span class="nav-text">Move to back</span><span v-if="isMacOs" class="shortcut">⌘+Shift+[</span><span v-if="!isMacOs" class="shortcut">Ctrl+Shift+[</span></button>
      <button @click="contextClickMoveBackward" class="dropdown-item"><span class="icon icon-backward"></span><span class="nav-text">Move backward</span><span v-if="isMacOs" class="shortcut">⌘+Shift+↓</span><span v-if="!isMacOs" class="shortcut">Ctrl+Shift+↓</span></button>
      <button @click="contextClickMoveForward" class="dropdown-item"><span class="icon icon-forward"></span><span class="nav-text">Move forward</span><span v-if="isMacOs" class="shortcut">⌘+Shift+↑</span><span v-if="!isMacOs" class="shortcut">Ctrl+Shift+↑</span></button>
      <button @click="contextClickMoveToFront" class="dropdown-item"><span class="icon icon-front"></span><span class="nav-text">Move to front</span><span v-if="isMacOs" class="shortcut">⌘+Shift+]</span><span v-if="!isMacOs" class="shortcut">Ctrl+Shift+]</span></button>
    </div>
  </div>
</template>

<script>
  import { mapState, mapMutations } from "vuex";
  import EventBus from '@/stores/eventBus';

  export default {
    data(){
      return {
        visibility: 'hidden',
        stage: null,
        markUpLayer: null,
        currentMarkUpId: null,
        currentMarkUpPageNumber: null,
        currentMarkUpImageIdentifier: null,
        currentMarkUp: null,
        currentMarkUpPage: null,
        currentMarkUpPages: [],
      }
    },
    methods: {
      ...mapMutations([
        'setContextMenuHeigth',
        'setContextMenuWidth'
      ]),
      showContextmenu(){
        this.visibility = 'visible' // show contextmenu
      },
      hideContextmenu(e){
        if(e.target.nodeName === 'CANVAS') this.visibility = 'hidden' // hide contextmenu,
        e.preventDefault();
      },
      emitterName(name){
        this.$emit('activeContextMenu', name)
        this.hideContextmenu({ target: { nodeName: 'CANVAS' } })
      },
      contextClickMoveToBack(){
        this.emitterName('moveToBottom')
      },
      contextClickMoveBackward(){
        this.emitterName('moveDown')
      },
      contextClickMoveForward(){
        this.emitterName('moveUp')
      },
      contextClickMoveToFront(){
        this.emitterName('moveToTop')
      },
    },
    computed: {
      ...mapState([
        'contextMenuStyle',
        'isMacOs'
      ])
    },
    mounted() {
      EventBus.$on('setContextmenu', this.showContextmenu);
      window.addEventListener('mousedown', this.hideContextmenu, false);
      window.addEventListener('touchstart', this.hideContextmenu, false);

      const menuNode = document.querySelector('.context-menu')
      this.setContextMenuHeigth(menuNode.clientHeight)
      this.setContextMenuWidth(menuNode.offsetWidth)
    },
    beforeDestroy() {
      EventBus.$off('setContextmenu');
      window.removeEventListener('mousedown', this.hideContextmenu, false);
      window.removeEventListener('touchstart', this.hideContextmenu, false);
    }
  }
</script>

<style scoped>
  .context-menu {
    position: fixed;
    background-color: #181A1F;
    box-shadow: 0 4px 8px rgba(0,0,0,.33);
    border-radius: 2px;
    display: flex;
    flex-direction: column;
    list-style: none;
    width: max-content;
    overflow: hidden;
    z-index: 500;

    visibility: hidden;
  }

  .context-menu button {
    width: 100%;
  }

  .context-menu span.shortcut {
    color: #5E656F;
    margin-left: -6px;
    margin-right: 12px;
  }

  @media (hover: hover) {
    .context-menu button:hover span.shortcut {
      color: rgba(255,255,255,0.5);
    }
  }
</style>
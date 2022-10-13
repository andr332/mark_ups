<template>
  <div>
    <textarea placeholder="Untitled Markup"
              cols="100%"
              v-on:input='updateHeight'
              v-model="inputValue"
              :disabled="readonly"
              ref="textarea"
              v-click-outside="save"
              @focus="focus"
              @keydown="onKeyDown"></textarea>
  </div>
</template>

<script>
export default {
  name: "EditableField.vue",
  props: ['value', 'readonly', 'maxCharacters', 'initialValue', 'onFocus'],
  data() {
    return {
      initValue: this.initialValue
    };
  },
  mounted() {
    this.updateHeight();
  },
  computed: {
    inputValue: {
      get() {
        return this.value;
      },
      set (val) {
        this.$emit('input', val);
      }
    }
  },
  methods: {
    updateHeight() {
      this.$refs.textarea.style.height = '';
      this.$refs.textarea.style.height = this.$refs.textarea.scrollHeight - 20 + 'px';
    },
    onKeyDown(evt) {
      if (evt.keyCode === 27) {
        this.resetToInit();
        evt.preventDefault();
        evt.target.blur();
        return;
      }

      if (evt.keyCode === 13) {
        evt.preventDefault();
        evt.target.blur();
        this.save();
        return;
      }

      if (evt.keyCode === 8) return;

      const maxCharacters = this.maxCharacters || 100;
      if (this.value && this.value.length >= maxCharacters) return evt.preventDefault();
    },
    resetToInit() {
      this.inputValue = this.initValue;
    },
    save() {
      if (this.value === this.initValue) return;

      this.$emit('onSave');

      this.initValue = this.value;
    },
    focus() {
      if (this.onFocus) this.onFocus();
    }
  }
}
</script>

<style scoped>

  div, label, input, button, form {
    box-sizing : border-box !important;
  }

  div {
    width: 100%;
    position: relative;
  }

  textarea {
    display: block;
    width: 100%;
    height: 20px;
    border-radius: 2px;
    border: none;
    background-color: transparent;
    color: #fff;
    font-weight: 700;
    font-size: 16px;
    line-height: 20px;
    margin: -10px;
    padding: 10px;
    resize: none;
    overflow-wrap: break-word;
    text-align: left;
  }

  .markup-title-canvas textarea {
    text-align: center;
  }

  @media (hover: hover) {
    textarea:hover {
      opacity: 0.74;
    }
  }

  textarea:disabled {
    opacity: 1;
  }

  textarea:focus {
    opacity: 1;
    outline: none;
    border: 1px solid #5E656F;
    margin: -11px;
  }

  ::placeholder {
    color: #9CA5B4;
    font-weight: 700;
    font-family: 'Source Sans Pro', sans-serif;
    opacity: 1;
  }

  :-ms-input-placeholder {
    color: #9CA5B4;
    font-weight: 700;
    font-family: 'Source Sans Pro', sans-serif;
    opacity: 1;
  }

  ::-ms-input-placeholder {
    color: #9CA5B4;
    font-weight: 700;
    font-family: 'Source Sans Pro', sans-serif;
    opacity: 1;
  }
</style>
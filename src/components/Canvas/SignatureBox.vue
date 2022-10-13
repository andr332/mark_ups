<template>
  <div class="wrapper" @click.prevent.stop="focusInput(false)">
    <div class="container">
      <div class="outer-container">
        <button title="Cancel add page" class="cancel-add-page" v-on:click.prevent="closeSignatureBox()"><span class="icon icon-close"></span></button>
        <div class="inner-container">
          <div class="name-wrap">
            <label class="field-label" for="name">Name</label>
            <input 
              v-model="name"
              type="text" 
              placeholder="Enter name"
              class="input-field" 
              id="name"
              @click.prevent.stop="focusInput(true)"
              @input="checkIsEmptyName"
              ref="nameInput"
            />
          </div>
          <label class="field-label">Select Signature</label>
          <div class="link-options-containers">
            <label 
              v-for="(item, index) in fonts"
              :key="index"
              class="radio-label" 
              :title="item.name" 
              :class="{ grey: isActive, 'active-signature': signatureFont ? item.name == signatureFont.name : false }"
              @click="selectSignature(item, true)"
            >
              <span 
                class="radio-text"
                :class="`${item.value}-font`"
              >
                {{ name.length ? name : 'Enter name' }}
              </span>
            </label>
          </div>
          <label class="field-label">Quick Select Last Used</label>
          <div class="link-options-containers">
            <label 
              v-for="(item, index) in quickFonts"
              :key="index"
              class="radio-label" 
              :title="item.name"
              :class="{ 'active-signature':  signatureFont ? item.name == signatureFont.name : false  }"
              @click="selectSignature(item)"
            >
              <span 
                class="radio-text"
                :class="`${item.value}-font`"
              >
                {{ name.length ? name : 'Enter name' }}
              </span>
            </label>
          </div>
          <!-- <button class="upload" @click="sendSignature" :disabled="!signatureFont" :class="{ grey: !signatureFont }">
            <span class="text-upload">Add Signature</span>
          </button> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapMutations } from "vuex";

  export default {
    name: "SignatureBox",
    data() {
      return {
        signatureFont: null,
        name: '',
        fonts: [
          { name: 'Rhesmanisa', value: 'Rhesmanisa', type: 'regular' },
          { name: 'Bristol', value: 'Bristol', type: 'regular' },
          { name: 'Mayqueen', value: 'Mayqueen', type: 'regular' },
          { name: 'Artysignature', value: 'Artysignature', type: 'regular' }
        ],
        quickFonts: [
          { name: 'Rhesmanisa1', value: 'Rhesmanisa', type: 'quick' },
          { name: 'Bristol1', value: 'Bristol', type: 'quick' },
          { name: 'Mayqueen1', value: 'Mayqueen', type: 'quick' },
          { name: 'Artysignature1', value: 'Artysignature', type: 'quick' }
        ]
      }
    },
    methods: {
      selectSignature(item, checkName){
        if(checkName) {
          if(!this.isActive) this.signatureFont = item
        } 
        else this.signatureFont = item

        if(item.type == 'quick') this.name = 'Quick name'

        this.sendSignature()
      },
      closeSignatureBox() {
        this.setIsSignatureBoxOpen(false);
      },
      sendSignature(){
        this.$emit('sendSignature', { font: this.signatureFont.value, text: this.name })
        this.closeSignatureBox()
      },
      ...mapMutations([
        'setIsSignatureBoxOpen',
      ]),
      focusInput(arg){
        if(arg) this.$refs.nameInput.focus();
        else this.$refs.nameInput.blur();
      },
      checkIsEmptyName(event){
        if(this.signatureFont && this.signatureFont.type == 'regular' && event.target.value.length == 0) this.signatureFont = null
      }
    },
    computed: {
      isActive(){
        return this.name.length == 0
      }
    }
  }
</script>

<style scoped>
  div, label, input, button, form {
    box-sizing : border-box !important;
  }

  label.field-label {
    display: block;
    color: #9ca5b4;
    font-size: 13px;
    line-height: 20px;
    margin: 20px 0 10px 0;
  }

  .name-wrap{
    margin-bottom: 20px;
  }

  input.input-field {
    width: 100%;
    display: block;
    border-radius: 2px;
    border: solid 1px #5e656f;
    height: 48px;
    background-color: #21252b;
    color: #fff;
    font-size: 16px;
    padding-left: 15px;
    padding-right: 15px;
  }

  button {
    margin: 0;
    padding: 0;
    border: 0;
    outline: 0;
    background-color: transparent;
    cursor: pointer;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }

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
    z-index: 50;
    overflow-x: hidden;
    overflow-y: scroll;
  }

  div.container {
    margin: auto;
    width: 100%;
    max-width: 660px;
  }

  div.outer-container {
    padding: 40px 20px;
    border-radius: 2px;
    border: dashed 1px #5e656f;
    background-color: #21252b;
    display: flex;
    flex-direction: column;
    justify-content: center;
    position: relative;
  }

  button.cancel-add-page {
    position: absolute;
    top: 0;
    right: 0;
    background-color: #2f333d;
    border-radius: 2px;
  }

  @media (hover: hover) {
    button.cancel-add-page:hover {
      background-color: #FF7A59;
    }
  }

  div.inner-container {
    align-self: center;
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  h1.new-markup {
    margin-top: 0;
    font-size: 32px;
    line-height: 40px;
    font-weight: 700;
    text-align: center;
    color: #9ca5b4;
  }

  p.description {
    margin: 10px 0;
    font-size: 16px;
    line-height: 20px;
    text-align: center;
    color: #9ca5b4;
  }

  button.upload {
    height: 50px;
    border-radius: 2px;
    background-color: #0071df;
    margin-top: 30px;
  }

  span.icon {
    height: 40px;
    width: 40px;
    min-width: 40px;
    background-color: #9ca5b4;
  }

  span.icon-upload {
    mask: url('../../assets/upload.svg') no-repeat center center;
    background-color: #fff;
  }

  span.icon-link {
    mask: url('../../assets/link.svg') no-repeat center center;
    margin: auto;
    background-color: #5E656F;
  }

  span.icon-submit {
    mask: url('../../assets/submit.svg') no-repeat center center;
    background-color: #fff;
  }

  span.text-upload {
    font-size: 16px;
    font-weight: bold;
    line-height: 20px;
    text-align: center;
    color: #ffffff;
    flex-grow: 2;
    margin: auto;
  }

  input.link {
    font-size: 16px;
    line-height: 20px;
    color: #fff;
    flex-grow: 2;
    margin: auto 5px auto auto;
    text-align: left;
    background-color: #21252b;
    border-radius: 2px;
    border: none;
    outline: none;
  }

  input.link::placeholder {
    color: #5E656F;
    opacity: 1;
  }

  button.link {
    width: 40px;
    height: 40px;
    border-radius: 2px;
    background-color: #0071df;
    margin: auto 5px auto auto;
  }

  span.btn-empty-placeholder {
    height: 40px;
    width: 40px;
  }

  div.link-text-container {
    border-radius: 2px;
    border: solid 1px #5E656F;
    padding: 0;
    height: 50px;
    margin-top: 40px;
    display: flex;
    align-items: flex-start;
    flex-direction: row;
  }

  div.link-options-containers {
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: space-between;
    flex-direction: row;
  }

  label.radio-label {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    cursor: pointer;
    font-weight: bold;
    font-size: 30px;
    height: 50px;
    width: 300px;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    color: #000;
    background-color: #fff;
    margin-bottom: 20px;
  }

  .grey{
    background-color: #282C34!important;
    color: #5E656F!important;
  }

  .active-signature{
    background-color: #0071DF!important;
    color: #fff!important;
  }

  label.radio-label input {
    position: absolute;
    opacity: 0;
    width: 100%;
    height: 100%;
    cursor: pointer;
  }

  span.radio-circle {
    position: absolute;
    top: 0;
    left: 0;
    height: 20px;
    width: 20px;
    border-radius: 50%;
    border: 1px solid #5E656F;
  }

  @media (hover: hover) {
    label.radio-label:hover input ~ .radio-circle {
      border: 1px solid #9CA5B4;
    }

    label.radio-label:hover input ~ .radio-text {
      /* color: #fff; */
    }
  }

  label.radio-label input:checked ~ .radio-circle {
    background-color: #0071DF;
    border: 1px solid #0071DF;
  }

  label.radio-label input:checked ~ .radio-text {
    /* color: #fff; */
  }

  span.radio-circle:after {
    content: "";
    position: absolute;
    display: none;
  }

  label.radio-label input:checked ~ .radio-circle:after {
    display: block;
  }

  label.radio-label .radio-circle:after {
    top: 5px;
    left: 5px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #fff;
  }

  a.support-info {
    opacity: 0.5;
    font-size: 13px;
    font-weight: normal;
    font-stretch: normal;
    font-style: normal;
    line-height: 1.54;
    letter-spacing: normal;
    text-align: right;
    color: #9ca5b4;
    flex-grow: 2;
    text-decoration: none;
  }


  @media (hover: hover) {
    a.support-info:hover {
      text-decoration: underline;
    }
  }

  @media screen and (max-width: 520px) {
    div.wrapper {
      padding: 65px 5px;
    }
    div.outer-container {
      padding: 35px 15px;
    }
  }
</style>
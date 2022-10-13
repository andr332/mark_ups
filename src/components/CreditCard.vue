<template>
  <div>
    <label class="field-label">Credit Card Number <label class="field-label-required">*</label></label>
    <input class="input-field" type="tel" inputmode="numeric" pattern="[0-9\s]{13,19}" autocomplete="cc-number" maxlength="19" v-model="cardNumber" v-on:change="updateCardDetails()">
    <div class="input-row">
      <div class="input-half">
        <label class="field-label">Expiration Date <label class="field-label-required">*</label></label>
        <input class="input-field" type="tel" v-mask="'##/####'" autocomplete="cc-exp" v-model="cardExpiry" v-on:change="updateCardDetails()" placeholder="MM/YYYY">
      </div>
      <div class="input-half">
        <label class="field-label">Security Code <label class="field-label-required">*</label></label>
        <input class="input-field" autocomplete="cc-csc" v-model="cardCvv" v-on:change="updateCardDetails()">
      </div>
    </div>
  </div>
</template>

<script>
  import {mapMutations} from "vuex";

  export default {
    name: "CreditCard",
    data() {
      return {
        cardNumber: '',
        cardExpiry: '',
        cardCvv: ''
      }
    },
    methods: {
      updateCardDetails() {
        let cardExpiryMonth = 0;
        let cardExpiryYear = 0;
        if (this.cardExpiry.indexOf('/') > 0) {
          const expirySplit = this.cardExpiry.split('/');
          cardExpiryMonth = Number(expirySplit[0]);
          cardExpiryYear = Number(expirySplit[1]);
        }

        this.setCardDetails({
          cardNumber: this.cardNumber,
          cardCvv: this.cardCvv,
          cardExpiryMonth,
          cardExpiryYear
        });
      },
      ...mapMutations([
        'setCardDetails'
      ])
    }
  }
</script>

<style scoped>
  div, label, input, button, form, select {
    box-sizing : border-box !important;
  }

  div.input-row {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    flex-wrap: wrap;
  }

  div.input-half {
    width: calc((100% - 20px)/2);
  }

  label.field-label {
    display: block;
    color: #9ca5b4;
    font-size: 13px;
    line-height: 20px;
    margin: 20px 0 10px 0;
  }

  label.field-label-required {
    color: #ff7a59;
    font-size: 13px;
    line-height: 20px;
    font-weight: 700;
  }

  input.input-field {
    width: 100%;
    display: block;
    border-radius: 2px;
    border: solid 1px #5e656f;
    height: 50px;
    background-color: #21252b;
    color: #fff;
    font-size: 16px;
    padding-left: 15px;
    padding-right: 15px;
  }

  input.input-field::placeholder {
    color: #5E656F;
    opacity: 1;
  }
</style>
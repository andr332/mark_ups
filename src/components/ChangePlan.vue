<template>
  <div>
    <Nav></Nav>
    <div class="outer-container">
      <form class="inner-container">
        <div class="title-container">
          <h3 class="title">Cancel Plan</h3>
          <div class="title-link"><a class="account-link" href="/account" v-on:click.prevent="navigateToAccount()">Back to my account</a></div>
        </div>
        <p class="title-note">When you cancel your paid Superhero plan we will no longer charge you, and upon expiration your account will be downgraded to a free Hero plan.</p>
        <button class="btn-submit" v-on:click.prevent="cancelPlan()">Cancel Plan</button>
      </form>
    </div>
    <Footer></Footer>
  </div>
</template>

<script>
  import Nav from "./Nav";
  import Footer from "./Footer";
  import navigationPresets from "../navigationPresets";
  import authorizedRouteGuard from "../guards/authorizedGuard";
  import superheroGuard from "../guards/superheroGuard";
  import multiguard from 'vue-router-multiguard';
  import {Notifications} from "../constants";
  import {cancelSubscription} from "../services/subscriptionService";
  import {mapMutations} from "vuex";

  export default {
    name: "ChangePlan",
    components: {Nav, Footer},
    beforeRouteEnter: multiguard([authorizedRouteGuard, superheroGuard]),
    methods: {
      async cancelPlan() {
        this.setLoading(true);

        try {
          await cancelSubscription();
          this.showSubscriptionCanceledMsg();
          this.navigateToAccount();
        } catch (err) {
          this.showErrorMsg();
        } finally {
          this.setLoading(false);
        }
      },
      ...mapMutations([
        'setLoading'
      ]),
      ...navigationPresets
    },
    notifications: Notifications
  }
</script>

<style scoped>
  div, label, input, button, form {
    box-sizing : border-box !important;
  }

  div.outer-container {
  }

  form.inner-container {
    display: block;
    margin: 120px auto;
    max-width: 440px;
    padding: 40px;
    background-color: #21252b;
    color: #9ca5b4;
    border-radius: 2px;
  }

  div.title-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin: 20px 0 40px 0;
  }

  h3.title {
    color: #fff;
    font-size: 23px;
    font-weight: 700;
    line-height: 25px;
    margin: 0;
  }

  div.title-link {
    color: #9ca5b4;
    font-size: 13px;
    line-height: 25px;
  }

  a.account-link {
    color: #0071df;
    font-weight: 700;
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
    background-color: #21252b;
    color: #fff;
    font-size: 16px;
    padding-left: 15px;
    padding-right: 15px;
  }

  p.title-note {
    margin: 20px 0;
    font-size: 16px;
    line-height: 25px;
  }

  button.btn-submit {
    width: 100%;
    height: 50px;
    margin-top: 40px;
    border-radius: 2px;
    border: 0;
    cursor: pointer;
    padding: 0;
    background-color: #ff7a59;
    outline: none;
    text-align: center;
    font-size: 16px;
    line-height: 50px;
    font-weight: 700;
    color: #fff;
  }

  @media screen and (max-width: 479px) {
    form.inner-container {
      max-width: 479px;
      padding: 40px 20px;
      border-radius: 0;
    }
  }
</style>
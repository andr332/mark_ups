<template>
  <div>
    <Nav></Nav>
    <div class="outer-container">
      <form class="inner-container" v-on:submit.prevent="submit()">
        <div class="title-container">
          <h3 class="title">Change Name</h3>
          <div class="title-link"><a class="account-link" href="/account" v-on:click.prevent="redirectToAccount()">Back to my account</a></div>
        </div>
        <label class="field-label">Name</label>
        <input class="input-field" type="text" v-model="firstName">
        <button class="btn-submit" v-on:click.prevent="submit()">Change Name</button>
      </form>
    </div>
    <Footer></Footer>
  </div>
</template>

<script>
  import {changeFirstName, clearUserCache} from "../services/authService";
  import {mapMutations, mapState} from "vuex";
  import authorizedRouteGuard from "../guards/authorizedGuard";
  import {Notifications} from "../constants";
  import Nav from "./Nav";
  import Footer from "./Footer";

  export default {
    name: "ChangeName",
    components: {Nav, Footer},
    beforeRouteEnter: authorizedRouteGuard,
    data() {
      return {
        firstName: this.$store.state.userFirstName
      };
    },
    computed: mapState([
      'user',
      'userFirstName'
    ]),
    methods: {
      async submit() {
        if (!this.validateForm()) {
          return;
        }

        this.setLoading(true);

        try {
          await changeFirstName(this.firstName);
          await clearUserCache();
          this.showNameChangedMsg();
          this.redirectToAccount();
        } catch {
          this.showErrorMsg();
        } finally {
          this.setLoading(false);
        }
      },
      redirectToAccount() {
        this.$router.push('/account');
      },
      validateForm() {
        if (!this.firstName) {
          return false;
        }

        return true;
      },
      ...mapMutations([
        'setLoading'
      ])
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

  button.btn-submit {
    width: 100%;
    height: 50px;
    margin-top: 40px;
    border-radius: 2px;
    border: 0;
    cursor: pointer;
    padding: 0;
    background-color: #0071DF;
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
<template>
  <div>
    <Nav></Nav>
    <div class="outer-container">
      <form class="inner-container" v-on:submit.prevent="submit()">
        <div class="title-container">
          <h3 class="title">Log In</h3>
          <div class="title-link">Don't have an account? <a class="sign-up-link" href="/signUp" v-on:click.prevent="redirectToSignup()">Sign Up</a></div>
        </div>
        <label class="field-label">Email <label class="field-label-required">*</label></label>
        <input class="input-field" type="email" v-model="email">
        <label class="field-label">Password <label class="field-label-required">*</label></label>
        <input class="input-field" type="password" v-model="password">
        <div class="forgot-password-block">
          <a class="forgot-password-link" href="/forgotPassword" v-on:click.prevent="redirectToForgotPassword()">Forgot your password?</a>
        </div>
        <button class="btn-login" v-on:click.prevent="submit()">Log In</button>
        <div class="title-link title-link--larger">Don't have an account? <a class="sign-up-link" href="/signUp" v-on:click.prevent="redirectToSignup()">Sign Up</a></div>
      </form>
    </div>
    <Footer></Footer>
  </div>
</template>

<script>
  import {getDetails, signIn} from "../services/authService";
  import {mapMutations, mapState} from "vuex";
  import getStore from '../stores/appStore';
  import {Notifications} from "../constants";
  import Nav from "./Nav";
  import Footer from "./Footer";
  import EventBus from "../stores/eventBus";
  import navigationPresets from "../navigationPresets";

  export default {
    name: "LogIn",
    components: {Nav, Footer},
    beforeRouteEnter: async (to, from, next) => {
      await getStore().dispatch('awaitUntilUserInitialized');
      if (getStore().state.isAuthenticated) {
        next('/new');
      } else {
        next();
      }
    },
    data() {
      return {
        email: '',
        password: ''
      };
    },
    computed: mapState([
      'user',
      'isAuthenticated',
      'previousAuthRoute'
    ]),
    methods: {
      async submit() {
        try {
          this.setLoading(true);
          const user = await signIn(this.email, this.password);
          this.setUser(user);
          const userDetails = await getDetails();
          this.setUserDetails(userDetails);
          EventBus.$emit('signInCompleted');

          if (this.previousAuthRoute && this.previousAuthRoute.fullPath) {
            this.$router.push(this.previousAuthRoute.fullPath);
            this.setPreviousAuthRoute(null);
          } else {
            this.navigateToNew();
          }
        } catch(err) {
          if (err.code === 'NotAuthorizedException' && err.message && err.message.indexOf('Incorrect username or password') > -1) {
            this.showWrongUserNameOrPasswordMsg();
          } else if (err.code === 'NotAuthorizedException' && err.message && err.message.indexOf('Password attempts exceeded') > -1) {
            this.showLoginLimitExceededErrorMsg();
          } else if (err.code === 'UserNotFoundException') {
            this.showUserNotFoundMsg();
          } else {
            this.showErrorMsg();
          }
        } finally {
          this.setLoading(false);
        }
      },
      redirectToSignup() {
        this.$router.push(`/signUp`);
      },
      redirectToForgotPassword() {
        this.$router.push('/forgotPassword');
      },
      ...navigationPresets,
      ...mapMutations([
        'setUser',
        'setUserDetails',
        'setLoading',
        'setPreviousAuthRoute'
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

  a.sign-up-link {
    color: #03a87c;
    font-weight: 700;
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
    height: 48px;
    background-color: #21252b;
    color: #fff;
    font-size: 16px;
    padding-left: 15px;
    padding-right: 15px;
  }

  div.forgot-password-block {
    margin: 20px 0 40px 0;
    display: block;
  }

  a.forgot-password-link {
    font-size: 13px;
    font-weight: 700;
    line-height: 20px;
    text-align: right;
    display: block;
    color: #9fa0a0;
  }

  button.btn-login {
    width: 100%;
    height: 50px;
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

  div.title-link--larger {
    font-size: 16px;
    text-align: center;
    margin-top: 40px;
  }

  @media screen and (max-width: 479px) {
    form.inner-container {
      max-width: 479px;
      padding: 40px 20px;
      border-radius: 0;
    }
  }
</style>
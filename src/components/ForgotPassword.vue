<template>
  <div>
    <Nav></Nav>
    <div class="outer-container">
      <form class="inner-container" v-on:submit.prevent="submit()">
        <div class="title-container">
          <h3 class="title">Forgot Password</h3>
          <div class="title-link"><a class="log-in-link" href="/logIn" v-on:click.prevent="redirectToLogin()">Back to Log In</a></div>
        </div>
        <label v-if="!submitted" class="field-label">Email <label class="field-label-required">*</label></label>
        <input v-if="!submitted" class="input-field" type="email" v-model="email">
        <button v-if="!submitted" class="btn-send" v-on:click.prevent="submit()">
          <span class="btn-text-send">Send Link</span>
        </button>
        <div v-if="submitted" class="submitted-msg-block">
          <p class="submitted-msg">Please check <b><i>{{email}}</i></b> for a confirmation link. If you do not receive an email, please contact support.</p>
        </div>
      </form>
    </div>
    <Footer></Footer>
  </div>
</template>

<script>
  import {forgotPassword} from "../services/authService";
  import {Notifications} from "../constants";
  import {mapMutations} from "vuex";
  import {isValidEmail} from "../utils";
  import Nav from "./Nav";
  import Footer from "./Footer";

  export default {
    name: "ForgotPassword",
    components: {Nav, Footer},
    data() {
      return {
        submitted: false,
        email: ''
      };
    },
    methods: {
      async submit() {
        try {
          this.validateForm();
          this.setLoading(true);
          await forgotPassword(this.email);
          this.submitted = true;
        } catch (err) {
          if (err.code === 'InvalidEmailException') {
            this.showInvalidEmailMsg();
          } else {
            this.showErrorMsg();
          }
        } finally {
          this.setLoading(false);
        }
      },
      validateForm() {
        if (!this.email) {
          throw {
            err: 'InvalidEmailException'
          };
        }

        if (!isValidEmail(this.email)) {
          throw {
            err: 'InvalidEmailException'
          };
        }

        return true;
      },
      redirectToLogin() {
        this.$router.push('/logIn');
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

  a.log-in-link {
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

  button.btn-send {
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

  div.submitted-msg-block {
    margin-top: 40px;
    display: block;
  }

  p.submitted-msg {
    font-size: 16px;
    line-height: 25px;
    margin: 0;
    color: #9ca5b4;
  }

  @media screen and (max-width: 479px) {
    form.inner-container {
      max-width: 479px;
      padding: 40px 20px;
      border-radius: 0;
    }
  }
</style>
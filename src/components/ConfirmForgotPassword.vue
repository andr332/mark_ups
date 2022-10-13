<template>
  <div>
    <Nav></Nav>
    <div class="outer-container">
      <form class="inner-container" v-on:submit.prevent="submit()">
        <div class="title-container">
          <h3 class="title">Change Password</h3>
        </div>
        <label class="field-label">New Password <label class="field-label-required">*</label></label>
        <input class="input-field" type="password" v-model="password">
        <label class="password-hint">Use 8 or more characters.</label>
        <button class="btn-submit" v-on:click.prevent="submit()">Change Password</button>
      </form>
    </div>
    <Footer></Footer>
  </div>
</template>

<script>
  import {confirmForgotPassword} from "../services/authService";
  import {Notifications} from "../constants";
  import Nav from "./Nav";
  import Footer from "./Footer";

  export default {
    name: "ConfirmForgotPassword",
    components: {Nav, Footer},
    data() {
      return {
        submitted: false,
        password: '',
        email: this.$route.params.email,
        code: this.$route.params.code
      };
    },
    methods: {
      async submit() {
        if (!this.validateForm()) {
          return;
        }

        try {
          await confirmForgotPassword({
            username: this.email,
            code: this.code,
            newPassword: this.password
          });
          this.showPasswordChangedMsg();
          this.redirectToLogin();
        } catch (err) {
          if (err.code === 'InvalidPasswordException') {
            this.showPasswordPolicyMsg();
          } else if (err.code === 'LimitExceededException') {
            this.showLimitExceededErrorMsg();
          } else {
            this.showErrorMsg();
          }
        }
      },
      redirectToLogin() {
        this.$router.push('/logIn')
      },
      validateForm() {
        if (!this.password) {
          return false;
        }

        return true;
      }
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

  label.password-hint {
    display: block;
    font-size: 13px;
    margin-top: 10px;
    line-height: 15px;
    color: #5e656f;
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
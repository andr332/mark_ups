<template>
  <div>
    <Nav></Nav>
    <div class="outer-container">
      <form class="inner-container" v-on:submit.prevent="submit()">
        <div class="title-container" v-if="!fromStackCommerce">
          <h3 class="title">Sign Up</h3>
          <div class="title-link">Already have an account? <a class="log-in-link" href="/logIn" v-on:click.prevent="navigateToLogin()">Log In</a></div>
        </div>
        <img class="stackcommerce-logo" src="../assets/stackcommerce-logo.svg" alt="StackCommerce Logo" v-if="fromStackCommerce">
        <p class="title-note" v-if="fromStackCommerce"><strong>Welcome to Markup Hero!</strong> We are happy you are joining us with access to our Superhero plan. Please enter your StackCommerce code, name, email, and create a password. If you already have an account, log in and enter your StackCommerce code on the upgrade page. Happy annotating!</p>
        <div v-if="fromStackCommerce">
          <label class="field-label">StackCommerce Code <label class="field-label-required">*</label></label>
          <input class="input-field" type="text" v-model="stackCommerceCouponCode">
        </div>
        <label class="field-label">Name</label>
        <input class="input-field" type="text" v-model="firstName">
        <label class="field-label">Email <label class="field-label-required">*</label></label>
        <input class="input-field" type="email" v-model="email" :disabled="emailReadOnly">
        <label class="field-label">Password <label class="field-label-required">*</label></label>
        <input class="input-field" type="password" v-model="password">
        <label class="password-hint">Use 8 or more characters.</label>
        <div class="checkmark-group">
          <label class="checkmark-block">
            <input class="checkbox" type="checkbox" v-model="termsPrivacyAccepted" id="termsPrivacyCheckbox">
            <span class="checkmark"></span>
            <label class="checkbox-text" for="termsPrivacyCheckbox">I agree to the <a href="/terms" target="_blank" class="term-link">Terms</a> and <a href="/privacy" target="_blank" class="term-link">Privacy Policy</a>. <label class="field-label-required">*</label></label>
          </label>
          <label class="checkmark-block">
            <input class="checkbox" type="checkbox" v-model="emailSubscriber" id="emailSubscriberCheckbox">
            <span class="checkmark"></span>
            <label class="checkbox-text" for="emailSubscriberCheckbox">Join our alpha community for select product updates.</label>
          </label>
        </div>
        <button class="btn-signup" v-on:click.prevent="submit()">Sign Up</button>
        <div class="title-link title-link--larger">Already have an account? <a class="log-in-link" href="/logIn" v-on:click.prevent="navigateToLogin()">Log In</a></div>
      </form>
    </div>
    <Footer></Footer>
  </div>
</template>

<script>
  import {getDetails, signUp} from "../services/authService";
  import {mapMutations, mapState} from "vuex";
  import getStore from '../stores/appStore';
  import {Notifications} from "../constants";
  import {isValidEmail} from "../utils";
  import Nav from "./Nav";
  import Footer from "./Footer";
  import {trackSignUp} from "../services/analytics";
  import EventBus from "../stores/eventBus";
  import navigationPresets from "../navigationPresets";
  import {
    createSubscription,
    validateCouponCode
  } from "../services/subscriptionService";

  export default {
    name: "SignUp",
    components: {Nav, Footer},
    beforeRouteEnter: async (to, from, next) => {
      const fromStackCommerce = to.path.toLowerCase().indexOf('/stackcommerce') === 0;
      await getStore().commit('setFromStackCommerce', fromStackCommerce);
      await getStore().commit('setCouponCode', to.query.coupounCode);

      await getStore().dispatch('awaitUntilUserInitialized');
      if (getStore().state.isAuthenticated) {
        if (fromStackCommerce) next(`/upgrade?code=${to.query.couponCode}`);
        else next('/new');
      } else {
        next();
      }
    },
    data() {
      return {
        firstName: '',
        email: this.$route.query.email || '',
        emailReadOnly: !!this.$route.query.email,
        password: '',
        termsPrivacyAccepted: true,
        emailSubscriber: true,
        stackCommerceCouponCode: this.$store.state.couponCode
      }
    },
    computed: mapState([
      'user',
      'isAuthenticated',
      'signUpSource',
      'fromStackCommerce',
      'couponCode',
      'previousAuthRoute'
    ]),
    methods: {
      async submit() {
        try {
          this.setLoading(true);

          await this.validateForm();

          const user = await signUp({
            firstName: this.firstName,
            email: this.email,
            password: this.password,
            emailSubscriber: this.emailSubscriber,
            fromStackCommerce: this.fromStackCommerce
          });
          EventBus.$emit('signUpCompleted');
          const signUpSource = this.signUpSource ?? document.referrer;
          trackSignUp(signUpSource);
          this.setSignUpSource(null);
          this.setUser(user);

          if (this.fromStackCommerce) await this.createStackCommerceSubscription();

          const userDetails = await getDetails();
          this.setUserDetails(userDetails);

          if (this.fromStackCommerce) this.navigateToSuperheroConfirmation();
          else {
            if (this.previousAuthRoute && this.previousAuthRoute.fullPath) {
              this.$router.push(this.previousAuthRoute.fullPath);
              this.setPreviousAuthRoute(null);
            } else {
              this.navigateToChoosePlan();
            }
          }
        } catch(err) {
          if (err.code === 'NotAcceptedTermPrivacyAgreement') {
            this.showTermPrivacyAgreementMsg();
          } else if (err.code === 'UsernameExistsException') {
            this.showEmailAlreadyExistsMsg();
          } else if (err.code === 'InvalidPasswordException' || (err.code === 'InvalidParameterException' && err.message.indexOf('password'))) {
            this.showPasswordPolicyMsg();
          } else if (err.code === 'InvalidParameterException' && (err.message.indexOf('email') > -1 || err.message.indexOf('username') > -1)) {
            this.showInvalidEmailMsg();
          } else if (err.code === 'InvalidEmailException')  {
            this.showInvalidEmailMsg();
          } else if (err.code === 'StackCommerceCodeMissing') {
            this.showStackCommerceCodeMissing();
          } else if (err.code === 'StackCommerceCodeInvalid') {
            this.showStackCommerceCodeInvalid();
          } else {
            this.showErrorMsg();
          }
        } finally {
          this.setLoading(false);
        }
      },
      async createStackCommerceSubscription() {
        const createSubscriptionRequest = {
          planId: 'superhero-monthly',
          couponCode: this.stackCommerceCouponCode
        };

        this.setLoading(true);

        await createSubscription(createSubscriptionRequest);
      },
      async validateForm() {
        if (!this.termsPrivacyAccepted) {
          throw {
            code: 'NotAcceptedTermPrivacyAgreement'
          };
        }

        if (!this.password) {
          throw {
            code: 'InvalidPasswordException'
          };
        }

        if (!isValidEmail(this.email)) {
          throw {
            code: 'InvalidEmailException'
          };
        }

        if (this.fromStackCommerce) {
          if (!this.stackCommerceCouponCode) {
            throw {
              code: 'StackCommerceCodeMissing'
            };
          }

          const couponValidation = await validateCouponCode(this.stackCommerceCouponCode);
          if (!couponValidation.isValid) {
            throw {
              code: 'StackCommerceCodeInvalid'
            };
          }
        }

        return true;
      },
      ...mapMutations([
        'setUser',
        'setUserDetails',
        'setLoading',
        'setSignUpSource',
        'setPreviousAuthRoute'
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

  img.stackcommerce-logo {
    display: block;
    height: 25px;
    max-width: 100%;
    margin: 20px auto;
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

  p.title-note {
    margin: 40px 0;
    font-size: 16px;
    line-height: 25px;
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

  input.input-field:disabled {
    cursor: not-allowed !important;
    color: #5E656F !important;
    border: solid 1px #5e656f !important;
    background-color: transparent !important;
  }

  label.password-hint {
    display: block;
    font-size: 13px;
    margin-top: 10px;
    line-height: 15px;
    color: #5e656f;
  }

  div.checkmark-group {
    margin: 40px 0;
  }

  label.checkmark-block {
    display: block;
    position: relative;
    padding-left: 30px;
    margin: 20px 0;
    cursor: pointer;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  label.checkmark-block input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
  }

  .checkmark {
    position: absolute;
    top: 0;
    left: 0;
    height: 20px;
    width: 20px;
    border-radius: 2px;
    border: 1px solid #5E656F;
  }

  label.checkmark-block input:checked ~ .checkmark {
    background-color: #03a87c;
    border: 1px solid #03a87c;
  }

  .checkmark:after {
    content: "";
    position: absolute;
    display: none;
  }

  label.checkmark-block input:checked ~ .checkmark:after {
    display: block;
  }

  label.checkmark-block .checkmark:after {
    left: 6px;
    top: 2px;
    width: 4px;
    height: 10px;
    border: solid #fff;
    border-width: 0 2px 2px 0;
    -webkit-transform: rotate(45deg);
    -ms-transform: rotate(45deg);
    transform: rotate(45deg);
  }

  label.checkbox-text {
    color: #9ca5b4;
    display: block;
    font-size: 13px;
    line-height: 20px;
  }

  a.term-link {
    color: #9ca5b4;
    text-decoration: underline;
    font-weight: 700;
  }

  button.btn-signup {
    width: 100%;
    height: 50px;
    border-radius: 2px;
    border: 0;
    cursor: pointer;
    padding: 0;
    background-color: #03a87c;
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
<template>
  <div>
    <Nav></Nav>
    <section class="hero-section">
      <div class="hero-text">
        <div class="hero-text-wrapper">
          <h1>Upgrade to Superhero</h1>
          <p>Get access to all our tools and features with unlimited usage. Save 20% when you choose to pay annually.</p>
        </div>
      </div>
      <div class="container">
        <form class="input-row" v-on:submit.prevent="applyCouponCode()">
          <div class="promo-code">
            <label class="field-label">Promo Code</label>
            <input class="input-field" v-model="currentCouponCode">
          </div>
          <div>
            <button class="submit-code" v-on:click.prevent="applyCouponCode()">
              <span class="icon icon-submit"></span>
            </button>
          </div>
        </form>
        <div class="input-row promo-applied" v-if="appliedCouponCode">
          <div>
            <span>Applied: <strong>{{appliedCouponCode}} - {{selectedPlan.formattedDiscountPercentage}}% OFF</strong></span>
          </div>
          <div>
            <button class="remove-promo" v-on:click.prevent="resetForm()">
              <span class="icon icon-close"></span>
            </button>
          </div>
        </div>
        <form class="inner-container" v-on:submit.prevent="submit()">
          <div class="input-row">
            <div class="input-half" v-for="plan in plans" :key="plan.id">
              <label class="radio-block" v-on:click.prevent="selectPlan(plan)">
                <input class="radio" type="radio" :checked="plan.id === selectedPlan.id">
                <span class="radio"></span>
                <label class="radio-text">${{plan.formattedPriceMonthly}} / month</label>
                <label class="radio-text--time">pay {{getPeriodUnitWord(plan.periodUnit)}}</label>
                <label class="radio-text--promo" v-if="plan.futurePaymentSchedule">then {{plan.futurePaymentSchedule}}</label>
                <label class="radio-text--save" v-if="!!plan.description && !plan.discountPercentage">{{plan.description}}</label>
              </label>
            </div>
          </div>
          <div class="title-container">
            <h3 class="title">Payment Due:</h3>
            <h3 class="title">${{selectedPlan.formattedPriceTotal || "0.00"}}</h3>
          </div>
          <CreditCard v-if="!(selectedPlan.price === 0 && selectedPlan.periodUnit === 'Year')"></CreditCard>
          <button class="btn-upgrade" v-on:click.prevent="createSubscription()">Upgrade Now</button>
        </form>
      </div>
    </section>
    <Footer></Footer>
  </div>
</template>

<script>
  import multiguard from 'vue-router-multiguard';
  import navigationPresets from "../../navigationPresets";
  import Nav from "../Nav";
  import Footer from "../Footer";
  import CreditCard from "../CreditCard";
  import authorizedRouteGuard from "../../guards/authorizedGuard";
  import {mapMutations, mapState} from "vuex";
  import {createSubscription, getPlans, validateCouponCode} from "../../services/subscriptionService";
  import notSuperheroGuard from "../../guards/notSuperheroGuard";
  import {Notifications} from "../../constants";
  import {getDetails} from "../../services/authService";
  import {trackUpgradeView} from "../../services/analytics";
  import getStore from '../../stores/appStore';

  export default {
    name: "Upgrade",
    components: {CreditCard, Nav, Footer},
    beforeRouteEnter: multiguard([authorizedRouteGuard,
      notSuperheroGuard,
      async (to, from, next) => {
        const couponCode = to.query.code;
        if (couponCode) {
          getStore().commit('setCouponCode', couponCode);
        }

        next();
      }
      ]),
    data() {
      return {
        plans: [],
        selectedPlan: {},
        currentCouponCode: '',
        appliedCouponCode: null
      };
    },
    computed: mapState([
      'cardDetails',
      'couponCode',
      'userDetails'
    ]),
    async mounted() {
      trackUpgradeView();
      await this.resetForm();

      if (this.couponCode) {
        this.currentCouponCode = this.couponCode;
        await this.applyCouponCode();
      }
    },
    methods: {
      async resetForm() {
        this.setLoading(true);
        this.plans = await getPlans();
        if (this.plans.length > 0) this.selectedPlan = this.plans[0];
        this.currentCouponCode = null;
        this.appliedCouponCode = null;
        this.setLoading(false);
      },
      getPeriodUnitWord(periodUnit) {
        if (periodUnit === 'Month') {
          return 'monthly';
        } else {
          return 'annually';
        }
      },
      selectPlan(plan) {
        this.selectedPlan = plan;
      },
      async applyCouponCode() {
        if (!this.currentCouponCode) return;

        try {
          this.setLoading(true);
          const couponValidation = await validateCouponCode(this.currentCouponCode);
          if (couponValidation.isValid) {
            this.plans = couponValidation.plans;
            if (this.plans.length > 0) this.selectedPlan = this.plans[0];

            this.appliedCouponCode = this.currentCouponCode;
            this.currentCouponCode = null;

            this.showPromoCodeAppliedMsg();
          } else {
            this.showInvalidPromoCodeMsg();
          }
        } catch (err) {
          this.showErrorMsg();
        } finally {
          this.setLoading(false);
        }
      },
      async createSubscription() {
        if (!this.selectedPlan.id) return;

        let cardDetails = null;
        if (this.selectedPlan.price > 0 || (this.selectedPlan.price === 0 && this.selectedPlan.periodUnit !== 'Year')) {
          if (!this.cardDetails.cardNumber || !this.cardDetails.cardCvv) return this.showCcNotFilledOutMsg();
          if (this.cardDetails.cardExpiryMonth === 0 || this.cardDetails.cardExpiryYear === 0) return this.showNotValidCardExpiryMsg();
          cardDetails = this.cardDetails;
        }

        try {
          const createSubscriptionRequest = {
            planId: this.selectedPlan.id,
            couponCode: this.appliedCouponCode,
            card: cardDetails
          };

          this.setLoading(true);

          // eslint-disable-next-line no-undef
          $FPROM.trackSignup({
            email: this.userDetails.email
          });

          await createSubscription(createSubscriptionRequest);
          this.clearCardDetails();

          const userDetails = await getDetails();
          this.setUserDetails(userDetails);
          this.navigateToSuperheroConfirmation();
        } catch (err) {
          if (err.detail) {
            switch (err.detail) {
              case "INVALID_COUPON_CODE":
              case "INVALID_COUPON_CODE_FOR_PLAN":
                this.showInvalidPromoCodeMsg();
                break;
              case "CARD_IS_REQUIRED":
              case "CARD_VERIFICATION_FAILED":
                this.showCardVerificationFailedMsg();
                break;
              case "SUBSCRIPTION_ALREADY_EXISTS":
                this.showSubscriptionAlreadyExistsMsg();
                break;
            }
          } else {
            this.showErrorMsg();
          }
        } finally {
          this.setLoading(false);
        }
      },
      ...mapMutations([
        'setLoading',
        'setUserDetails',
        'clearCardDetails'
      ]),
      ...navigationPresets,
    },
    notifications: Notifications
  }
</script>

<style scoped>
  div, label, input, button, form, select {
    box-sizing : border-box !important;
  }

  section {
    padding: 60px 40px;
    color: #fff;
  }

  div.container {
    margin: auto;
    max-width: 440px;
  }

  div.hero-text {
    margin: 60px auto 20px auto;
    max-width: 520px;
    position: relative;
  }

  div.hero-text-wrapper {
    position: relative;
  }

  h1 {
    margin: 0 0 20px 0;
    font-size: 52px;
    line-height: 60px;
    text-align: center;
  }

  p {
    margin: 0 0 30px 0;
    font-size: 20px;
    line-height: 30px;
    text-align: center;
    color: #9CA5B4;
  }

  form.inner-container {
    display: block;
    margin: 40px auto 120px auto;
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

  div.input-row, form.input-row {
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


  label.radio-block {
    display: block;
    position: relative;
    margin: 20px 0;
    padding-left: 30px;
    border-radius: 2px;
    cursor: pointer;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  label.radio-block input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
  }

  .radio {
    position: absolute;
    top: 0;
    left: 0;
    height: 20px;
    width: 20px;
    border-radius: 10px;
    border: 1px solid #5E656F;
  }

  label.radio-block input:checked ~ .radio {
    background-color: #03a87c;
    border: 1px solid #03a87c;
  }

  .radio:after {
    content: "";
    position: absolute;
    display: none;
  }

  label.radio-block input:checked ~ .radio:after {
    display: block;
  }

  label.radio-block .radio:after {
    left: 5px;
    top: 5px;
    width: 8px;
    height: 8px;
    border-radius: 4px;
    background-color: #fff;
  }

  label.radio-text {
    color: #9ca5b4;
    display: block;
    font-size: 20px;
    line-height: 20px;
    font-weight: 700;
    margin-bottom: 5px;
  }

  label.radio-block input:checked ~ label.radio-text {
    color: #fff;
  }

  label.radio-text--time {
    color: #9ca5b4;
    display: block;
    font-size: 13px;
    line-height: 20px;
  }

  label.radio-text--promo {
    color: #9ca5b4;
    display: block;
    font-size: 13px;
    line-height: 20px;
    font-weight: 700;
    margin: 5px 0;
  }

  label.radio-block input:checked ~ label.radio-text--promo {
    color: #fff;
  }

  label.radio-text--save {
    color: #03a87c;
    display: block;
    font-size: 13px;
    line-height: 20px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 2px;
  }

  button.btn-upgrade {
    width: 100%;
    height: 50px;
    margin-top: 40px;
    border-radius: 2px;
    border: 0;
    cursor: pointer;
    padding: 0;
    background-image: linear-gradient(to bottom right,#FCD117,#FF377C 67%);
    background-color: #FF377C;
    outline: none;
    text-align: center;
    font-size: 16px;
    line-height: 50px;
    font-weight: 700;
    color: #fff;
  }

  div.promo-code {
    width: calc(100% - 70px);
  }

  button.submit-code {
    margin-top: 50px;
    height: 50px;
    width: 50px;
    background-color: #03a87c;
    border-radius: 2px;
  }

  span.icon {
    height: 50px;
    width: 50px;
    min-width: 50px;
    background-color: #fff;
  }

  span.icon-submit {
    mask: url('../../assets/submit.svg') no-repeat center center;
    background-color: #fff;
  }

  span.icon-close {
    height: 30px;
    width: 30px;
    min-width: 30px;
    mask: url('../../assets/close.svg') no-repeat center center;
    background-color: #fff;
  }

  div.promo-applied {
    align-items: center;
    margin-top: 20px;
    padding: 0 15px;
    height: 50px;
    border-radius: 25px;
    border: 1px solid #03a87c;
  }

  div.promo-applied span {
    display: block;
    font-size: 13px;
    line-height: 20px;
  }

  @media screen and (max-width: 767px) {
    h1 {
      font-size: 42px;
      line-height: 50px;
    }
  }

  @media screen and (max-width: 479px) {
    section {
      padding: 60px 20px;
    }
    section.hero-section {
      margin-top: 0;
      padding: 60px 20px;
    }
    h1, h2, h3 {
      font-size: 32px;
      line-height: 40px;
    }
    form.inner-container {
      max-width: 479px;
      margin: 40px -20px;
      padding: 40px 20px;
      border-radius: 0;
    }
  }
</style>
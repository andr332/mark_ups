<template>
  <div>
    <Nav></Nav>
    <section class="hero-section">
      <div class="hero-text">
        <div class="hero-text-wrapper">
          <h1>Teams Upgrade</h1>
          <p>Upgrade your Superhero Teams plan by adding and/or stacking your additional AppSumo codes here.</p>
        </div>
      </div>
      <div class="container">
        <form class="input-row" v-on:submit.prevent="upgradeSubscription()">
          <label class="field-label">AppSumo Code</label>
          <input class="input-field" v-model="currentCouponCode">
        </form>
        <button class="btn-upgrade" v-on:click.prevent="upgradeSubscription()">Upgrade Now</button>
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
import authorizedRouteGuard from "../../guards/authorizedGuard";
import {mapActions, mapMutations, mapState} from "vuex";
import {
  upgradeAppSumoSubscription, validateAppSumoCouponCode
} from "@/services/subscriptionService";
import {Notifications} from "@/constants";
import getStore from '@/stores/appStore';

export default {
  name: "TeamUpgrade",
  components: {Nav, Footer},
  beforeRouteEnter: multiguard([authorizedRouteGuard,
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
      currentCouponCode: ''
    };
  },
  computed: mapState([
    'cardDetails',
    'couponCode'
  ]),
  async mounted() {
  },
  methods: {
    async upgradeSubscription() {
      if (!this.currentCouponCode) return;

      try {
        this.setLoading(true);
        const couponValidation = await validateAppSumoCouponCode(this.currentCouponCode);
        if (!couponValidation.isValid) {
          this.showInvalidPromoCodeMsg();
          return;
        }

        await upgradeAppSumoSubscription({
          couponCode: this.currentCouponCode
        });

        await this.refreshUserDetails();
        this.showTeamUpgraded();
        this.navigateToAccount();
      } catch (err) {
        this.showErrorMsg();
      } finally {
        this.setLoading(false);
      }
    },
    ...mapMutations([
      'setLoading',
      'setUserDetails',
      'clearCardDetails'
    ]),
    ...mapActions([
       'refreshUserDetails'
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
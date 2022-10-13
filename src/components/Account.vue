<template>
  <div>
    <Nav></Nav>
    <div class="outer-container">
      <div class="inner-container">
        <div class="title-container">
          <h3 class="title">My Account</h3>
          <div class="title-link"><a class="account-link" href="/settings" v-on:click.prevent="navigateToSettings()">View my settings</a></div>
        </div>
        <label class="field-label">Name</label>
        <div class="field-value-block">
          <label class="field-label-value">{{userFirstName}}</label>
          <a class="change-link" href="/account/changeName" v-on:click.prevent="redirectToChangeName()">Change</a>
        </div>
        <label class="field-label">Email</label>
        <div class="field-value-block">
          <label class="field-label-value">{{userEmail}}</label>
          <a class="change-link" href="/account/changeEmail" v-on:click.prevent="redirectToChangeEmail()">Change</a>
        </div>
        <label class="field-label">Password</label>
        <div class="field-value-block">
          <label class="field-label-value">••••••••••••••</label>
          <a class="change-link" href="/account/changePassword" v-on:click.prevent="redirectToChangePassword()">Change</a>
        </div>
        <label class="field-label">Plan</label>
        <div class="field-value-block">
          <label v-if="subscriptionDetails.customPlanName" class="field-label-value">{{subscriptionDetails.customPlanName}}</label>
          <label v-if="!subscriptionDetails.customPlanName" class="field-label-value">{{formattedPlanType}} ({{formattedPlanPeriod}} Plan)</label>
          <a class="change-link change-link--gradient" href="/upgrade" v-on:click.prevent="upgrade()" v-if="subscriptionDetails.status !== 'Active' || (userDetails.isTeamOwner && subscriptionDetails.canUpgrade) || (subscriptionDetails.planId === 'superhero-annual' && user.attributes['custom:from_appsumo'] === '1')">Upgrade</a>
          <a class="change-link" href="/account/changePlan" v-on:click.prevent="navigateToChangePlan()" v-if="subscriptionDetails.status === 'Active' && !subscriptionDetails.isLifeTime">Change</a>
        </div>
        <div v-if="userPlanType === 'SuperHero' && !subscriptionDetails.isLifeTime">
          <label class="field-label">Plan Date</label>
          <div class="field-value-block">
            <label class="field-label-value">{{subscriptionDetails.status === 'Active' ? 'Renewing' : 'Expiring'}} on {{subscriptionDetails.status === 'Active' ? subscriptionDetails.nextRenewalDate : subscriptionDetails.endOfTerm}} {{formattedDiscount}}</label>
          </div>
        </div>
        <div v-if="subscriptionDetails.status === 'Active' && !subscriptionDetails.isLifeTime">
          <label class="field-label">Credit Card</label>
          <div class="field-value-block">
            <label class="field-label-value field-label-value--credit-card" v-if="subscriptionDetails.cardLast4">
              <div class="cc-logo">
                <img :src="creditCardIcon">
              </div>
              <span>{{subscriptionDetails.cardLast4}} | {{subscriptionDetails.cardExpiration}}</span>
            </label>
            <label class="field-label-value" v-if="!subscriptionDetails.cardLast4">No Card</label>
            <a class="change-link" href="/account/changeCard" v-on:click.prevent="navigateToChangeCard()">{{subscriptionDetails.cardLast4 ? 'Change' : 'Add'}}</a>
          </div>
        </div>
        <div class="checkmark-group">
          <label class="checkmark-block">
            <input class="checkbox" type="checkbox" v-model="emailSubscriber" @change="emailSubscriberChange()" id="emailSubscriberCheckbox">
            <span class="checkmark"></span>
            <label class="checkbox-text" for="emailSubscriberCheckbox">Join our alpha community for select product updates.</label>
          </label>
        </div>
        <button class="btn-logout" v-on:click="signOut()">Log Out</button>
      </div>
    </div>
    <Footer></Footer>
  </div>
</template>

<script>
  import multiguard from 'vue-router-multiguard';
  import {mapMutations, mapState} from "vuex";
  import {changeEmailSubscriberField, clearUserCache, signOut} from "../services/authService";
  import authorizedRouteGuard from "../guards/authorizedGuard";
  import {Notifications} from "../constants";
  import Nav from "./Nav";
  import Footer from "./Footer";
  import getStore from "../stores/appStore";
  import {getSubscriptionDetails} from "../services/subscriptionService";
  import navigationPresets from "../navigationPresets";

  import VisaIcon from '../assets/cc-visa.svg';
  import AmexIcon from '../assets/cc-amex.svg';
  import CardIcon from '../assets/cc-card.svg';
  import DinersclubIcon from '../assets/cc-dinersclub.svg';
  import DiscoverIcon from '../assets/cc-discover.svg';
  import JcbIcon from '../assets/cc-jcb.svg';
  import MastercardIcon from '../assets/cc-mastercard.svg';

  export default {
    name: "Account",
    components: {Nav, Footer},
    beforeRouteEnter: multiguard([authorizedRouteGuard,
      async (to, from, next) => {
        await getStore().dispatch('awaitUntilUserDetailsInitialized');
        const userDetails = getStore().state.userDetails;
        if (userDetails.planType === 'SuperHero') {
          await getStore().commit('setLoading', true);

          const subscriptionDetails = await getSubscriptionDetails();
          getStore().commit('setSubscriptionDetails', subscriptionDetails);

          await getStore().commit('setLoading', false);
        } else {
          getStore().commit('setSubscriptionDetails', {});
        }

        next();
      }
    ]),
    data() {
      return {
        emailSubscriber: this.$store.state.userEmailSubscriber
      }
    },
    computed: {
      formattedPlanType() {
        if (this.userDetails.planType) {
          return this.userDetails.planType.charAt(0).toUpperCase() + this.userDetails.planType.slice(1).toLowerCase();
        }

        return '';
      },
      formattedPlanPeriod() {
        if (this.subscriptionDetails.isLifeTime)
          return 'Lifetime';

        if (this.subscriptionDetails.periodUnit) {
          switch (this.subscriptionDetails.periodUnit) {
            case 'Month':
              return 'Monthly';
            case 'Year':
              return 'Annual';
          }
        }

        return 'Free';
      },
      formattedDiscount() {
        if (this.subscriptionDetails.coupons && this.subscriptionDetails.coupons.length > 0) {
          const coupon = this.subscriptionDetails.coupons[0];
          return `(${parseInt(coupon.discountPercentage, 10)}% off till ${coupon.effectiveTill})`
        }

        return '';
      },
      creditCardIcon() {
        if (this.subscriptionDetails.cardType) {
          switch (this.subscriptionDetails.cardType) {
            case 'Discover':
              return DiscoverIcon;
            case 'Jcb':
              return JcbIcon;
            case 'Mastercard':
              return MastercardIcon;
            case 'Visa':
              return VisaIcon;
            case 'AmericanExpress':
              return AmexIcon;
            case 'DinersClub':
              return DinersclubIcon;
            default:
              return CardIcon;
          }
        }

        return null;
      },
      ...mapState([
        'user',
        'userFirstName',
        'userEmail',
        'userDetails',
        'userPlanType',
        'subscriptionDetails'
      ])
    },
    methods: {
      redirectToChangeName() {
        this.$router.push('/account/changeName');
      },
      redirectToChangeEmail() {
        this.$router.push('/account/changeEmail');
      },
      redirectToChangePassword() {
        this.$router.push('/account/changePassword');
      },
      async signOut() {
        this.setLoading(true);
        await signOut();
        this.setUser(null);
        this.setLoading(false);
        this.redirectToRoot();
      },
      redirectToRoot() {
        this.$router.push('/');
      },
      async emailSubscriberChange() {
        try {
          this.setLoading(true);
          await changeEmailSubscriberField(this.emailSubscriber);
          await clearUserCache();
        } catch (err) {
          this.showErrorMsg();
        } finally {
          this.setLoading(false);
        }
      },
      upgrade() {
        if (this.userDetails.isTeamOwner || this.user.attributes['custom:from_appsumo'] === '1') this.navigateToTeamUpgrade();
        else this.navigateToUpgrade();
      },
      ...mapMutations([
        'setUser',
        'setLoading'
      ]),
      ...navigationPresets
    },
    notifications: Notifications
  }
</script>

<style scoped>
  div, label, input, button {
    box-sizing : border-box !important;
  }

  div.outer-container {
  }

  div.inner-container {
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
    color: #9CA5B4;
    font-weight: 700;
  }

  label.field-label {
    display: block;
    color: #9ca5b4;
    font-size: 13px;
    line-height: 20px;
    margin: 20px 0 10px 0;
  }

  div.field-value-block {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin: 10px 0 40px 0;
  }

  label.field-label-value {
    display: block;
    font-size: 16px;
    line-height: 20px;
    color: #fff;
  }

  a.change-link {
    display: block;
    font-size: 16px;
    line-height: 20px;
    color: #0071df;
    font-weight: 700;
    text-decoration: none;
  }

  a.change-link--gradient {
    background-image: linear-gradient(to bottom right,#FCD117,#FF377C 67%);
    background-color: #FF377C;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
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
    border-radius: 2px;
  }

  label.checkmark-block input:checked ~ .checkmark {
    background-color: #0071DF;
    border: 1px solid #0071DF;
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

  button.btn-logout {
    width: 100%;
    height: 50px;
    border-radius: 2px;
    border: 0;
    cursor: pointer;
    padding: 0;
    background-color: #2f333d;
    outline: none;
    text-align: center;
    font-size: 16px;
    line-height: 50px;
    font-weight: 700;
    color: #fff;
  }

  label.field-label-value--credit-card {
    display: flex;
  }

  div.cc-logo {
    height: 20px;
    margin-right: 10px;
  }

  div.cc-logo img {
    display: block;
    height: 20px;
    width: auto;
  }

  @media screen and (max-width: 479px) {
    div.inner-container {
      max-width: 479px;
      padding: 40px 20px;
      border-radius: 0;
    }
  }
</style>
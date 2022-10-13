import Vue from 'vue';
import VueRouter from 'vue-router';
import Vuex from 'vuex';
import Konva from 'konva';
import VueTheMask from 'vue-the-mask'
import InfiniteLoading from 'vue-infinite-loading';
import App from './App.vue';
import AppStore from './stores/appStore';
import miniToastr from "mini-toastr";
import VueNotifications from "vue-notifications";
import GAuth from 'vue-google-oauth2'
import VueSpinners from "vue-spinners";
import VueGtag from "vue-gtag";
import Amplify, * as AmplifyModules from 'aws-amplify';
import { AmplifyPlugin } from 'aws-amplify-vue'
import awsconfig from './aws-exports';
import ClickOutsideDirective from './directives/ClickOutsideDirective';
import {isCustomDomain, redirectFromWww} from "./utils";

Vue.config.productionTip = false;

redirectFromWww();

Vue.use(Vuex);
Vue.use(VueRouter);
Vue.use(VueTheMask);
Vue.use(InfiniteLoading, {
  props: {
    spinner: null
  },
});

miniToastr.init();

const toast = ({title, message, type, timeout, cb}) => {
  return miniToastr[type](message, title, timeout, cb);
};

const miniToastrOptions = {
  success: toast,
  error: toast,
  info: toast,
  warn: toast
};
Vue.use(VueNotifications, miniToastrOptions);
Vue.use(VueSpinners);

if (process.env.VUE_APP_GTAG_UA) {
  Vue.use(VueGtag, {
    config: { id: process.env.VUE_APP_GTAG_UA }
  }, App.router);
}

if (process.env.VUE_APP_GOOGLE_CLIENT_ID && !isCustomDomain()) {
  const gauthOption = {
    clientId: `${process.env.VUE_APP_GOOGLE_CLIENT_ID}.apps.googleusercontent.com`,
    scope: process.env.VUE_APP_GOOGLE_SCOPE,
    prompt: 'select_account'
  };
  Vue.use(GAuth, gauthOption);
}

Vue.config.errorHandler = (err, vm, info) => {
  if (window.ga) {
    window.ga('send', 'exception', {
      error: err,
      component: vm,
      info
    });
  }
};

window.onerror = (message, source, lineno, colno, error) => {
  if (window.ga) {
    window.ga('send', 'exception', {
      message,
      source,
      lineno,
      colno,
      error
    });
  }
};

awsconfig.storage = window.localStorage;

Amplify.configure(awsconfig);
Vue.use(AmplifyPlugin, AmplifyModules);

// Directives
ClickOutsideDirective();

Konva.showWarnings = false;

new Vue({
  render: h => h(App),
  store: AppStore,
  async created() {
    await this.$store.dispatch('ensureUserInitialized');
    await this.$store.dispatch('determineIfTouchDevice');
    await this.$store.dispatch('refreshTeamBrand');
  }
}).$mount('#app');
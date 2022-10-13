<template>
  <div id="app">
    <Loader />
    <router-view></router-view>
    <UpgradeModal v-if="isUpgradeModalOpen"></UpgradeModal>
  </div>
</template>

<script>
  import Loader from './components/Loader';
  import Home from './components/Home';
  import NewMarkup from './components/New/NewMarkup';
  import SignUp from './components/SignUp';
  import LogIn from './components/LogIn';
  import ForgotPassword from './components/ForgotPassword';
  import ConfirmForgotPassword from './components/ConfirmForgotPassword';
  import Account from './components/Account';
  import ChangeName from './components/ChangeName';
  import Canvas from './components/Canvas.vue';
  import ToolBar from './components/ToolBar';
  import Nav from "./components/Nav";
  import Download from "./components/Download";
  import Pricing from "./components/Pricing";
  import VueRouter from 'vue-router';
  import {mapActions, mapMutations, mapState} from "vuex";
  import ChangeEmail from "./components/ChangeEmail";
  import ConfirmEmailChange from "./components/ConfirmEmailChange";
  import ChangePassword from "./components/ChangePassword";
  import FourOFour from "./components/FourOFour";
  import Terms from "./components/Terms";
  import Privacy from "./components/Privacy";
  import Copyright from "./components/Copyright";
  import ChooseYourPlan from "./components/Upgrade/ChooseYourPlan";
  import Upgrade from "./components/Upgrade/Upgrade";
  import SuperheroConfirmation from "./components/Upgrade/SuperheroConfirmation";
  import ChangePlan from "./components/ChangePlan";
  import ChangeCreditCard from "./components/ChangeCreditCard";
  import UserSettings from "./components/UserSettings";
  import Team from "./components/Teams/Team";
  import TeamInvite from "./components/Teams/TeamInvite";
  import TeamRemoveUser from "./components/Teams/TeamRemoveUser";
  import EventBus from "./stores/eventBus";
  import UpgradeModal from "./components/Shared/UpgradeModal";
  import GDrive from "@/components/GDrive";
  import TeamUpgrade from "@/components/Upgrade/TeamUpgrade";
  import TeamConfirmation from "./components/Upgrade/TeamConfirmation";
  import AcceptInvite from "@/components/Teams/AcceptInvite";
  import {isCustomDomain, setFavicon} from "@/utils";
  import CustomFourOFour from "@/components/Teams/CustomFourOFour";
  //import EventBus from './stores/eventBus';

  const routes = [
    {
      path: '/share/:markUpId/slack/:slackCreatorKey',
      component: Canvas,
      meta: {
        title: 'View File & Annotate - Markup Hero',
        description: 'View, annotate, and edit this markup. Save, share, copy, and download it for free.'
      }
    },
    {
      path: '/share/:markUpId/screenshot/:screenshotCreatorKey',
      component: Canvas,
      meta: {
        title: 'View File & Annotate - Markup Hero',
        description: 'View, annotate, and edit this markup. Save, share, copy, and download it for free.'
      }
    },
    {
      path: '/share/:markUpId/:pageNumber',
      component: Canvas,
      meta: {
        title: 'View File & Annotate - Markup Hero',
        description: 'View, annotate, and edit this markup. Save, share, copy, and download it for free.'
      }
    },
    {
      path: '/private/:markUpId/:pageNumber',
      component: Canvas,
      meta: {
        title: 'View File & Annotate - Markup Hero',
        description: 'View, annotate, and edit this markup. Save, share, copy, and download it for free.'
      }
    },
    {
      path: '/share/:markUpId',
      component: Canvas,
      meta: {
        title: 'View File & Annotate - Markup Hero',
        description: 'View, annotate, and edit this markup. Save, share, copy, and download it for free.'
      }
    },
    {
      path: '/private/:markUpId',
      component: Canvas,
      meta: {
        title: 'View File & Annotate - Markup Hero',
        description: 'View, annotate, and edit this markup. Save, share, copy, and download it for free.'
      }
    },
    {
      path: '/new',
      component: NewMarkup,
      meta: {
        title: 'New Markup & History - Markup Hero',
        description: 'Upload images, PDFs or paste a website link to create a new markup.'
      }
    },
    {
      path: '/signUp',
      component: SignUp,
      meta: {
        title: 'Sign Up - Markup Hero',
        description: 'Sign up for a free account on Markup Hero to view and edit past markups.'
      }
    },
    {
      path: '/stackCommerce',
      component: SignUp,
      meta: {
        title: 'StackCommerce Sign Up & Redemption - Markup Hero',
        description: 'Redeem your Markup Hero Superhero plan using your StackCommerce code.'
      }
    },
    {
      path: '/StackCommerce',
      component: SignUp,
      meta: {
        title: 'StackCommerce Sign Up & Redemption - Markup Hero',
        description: 'Redeem your Markup Hero Superhero plan using your StackCommerce code.'
      }
    },
    {
      path: '/stackcommerce',
      component: SignUp,
      meta: {
        title: 'StackCommerce Sign Up & Redemption - Markup Hero',
        description: 'Redeem your Markup Hero Superhero plan using your StackCommerce code.'
      }
    },
    {
      path: '/logIn',
      component: LogIn,
      meta: {
        title: 'Log In - Markup Hero',
        description: 'Log in to your Markup Hero account to view and edit past markups.'
      }
    },
    {
      path: '/forgotPassword',
      component: ForgotPassword,
      meta: {
        title: 'Forgot Password - Markup Hero',
        description: 'Forgot your Markup Hero password? Reset it here.'
      }
    },
    {
      path: '/confirmForgotPassword/:email/:code',
      component: ConfirmForgotPassword,
      meta: {
        title: 'Confirm Password - Markup Hero',
        description: 'Confirm your Markup Hero password.'
      }
    },
    {
      path: '/account',
      component: Account,
      meta: {
        title: 'My Account - Markup Hero',
        description: 'Your account on Markup Hero.'
      }
    },
    {
      path: '/account/changeName',
      component: ChangeName,
      meta: {
        title: 'Change Name - Markup Hero',
        description: 'Change your name on Markup Hero.'
      }
    },
    {
      path: '/account/changeEmail',
      component: ChangeEmail,
      meta: {
        title: 'Change Email - Markup Hero',
        description: 'Change your email on Markup Hero.'
      }
    },
    {
      path: '/account/confirmEmailChange/:code',
      component: ConfirmEmailChange,
      meta: {
        title: 'Confirm New Email - Markup Hero',
        description: 'Please confirm your new email on Markup Hero.'
      }
    },
    {
      path: '/account/changePassword',
      component: ChangePassword,
      meta: {
        title: 'Change Password - Markup Hero',
        description: 'Change your password on Markup Hero.'
      }
    },
    {
      path: '/account/changePlan',
      component: ChangePlan,
      meta: {
        title: 'Change Plan - Markup Hero',
        description: 'Change your plan on Markup Hero.'
      }
    },
    {
      path: '/account/changeCard',
      component: ChangeCreditCard,
      meta: {
        title: 'Change Credit Card - Markup Hero',
        description: 'Change your credit card on Markup Hero.'
      }
    },
    {
      path: '/settings',
      component: UserSettings,
      meta: {
        title: 'My Settings - Markup Hero',
        description: 'Your settings on Markup Hero.'
      }
    },
    {
      path: '/team',
      component: Team,
      meta: {
        title: 'My Team - Markup Hero',
        description: 'Manage your team on Markup Hero.'
      }
    },
    {
      path: '/team/invite',
      component: TeamInvite,
      meta: {
        title: 'Invite Members - Markup Hero',
        description: 'Invite members to your team on Markup Hero.'
      }
    },
    {
      path: '/team/acceptInvite/:teamId/:invitationId',
      component: AcceptInvite,
      meta: {
        title: 'Accept Invite - Markup Hero',
        description: ''
      }
    },
    {
      path: '/team/remove',
      component: TeamRemoveUser,
      meta: {
        title: 'Remove Member - Markup Hero',
        description: 'Remove a member from your team on Markup Hero.'
      }
    },
    {
      path: '/team/upgrade',
      component: TeamUpgrade,
      meta: {
        title: 'Upgrade Team Plan - Markup Hero',
        description: 'Upgrade Team Plan!'
      }
    },
    {
      path: '/team/confirmation',
      component: TeamConfirmation,
      meta: {
        title: 'Welcome To Teams - Markup Hero',
        description: 'Welcome To Teams!'
      }
    },
    {
      path: '/download',
      component: Download,
      meta: {
        title: 'Download - Markup Hero',
        description: 'Download the Markup Hero screenshot app for Mac and Windows to speed up your workflow.'
      }
    },
    {
      path: '/pricing',
      component: Pricing,
      meta: {
        title: 'Pricing - Markup Hero',
        description: 'Markup Hero&#39;s alpha is free. No credit card required.'
      }
    },
    {
      path: '/choosePlan',
      component: ChooseYourPlan,
      meta: {
        title: 'Choose Your Plan - Markup Hero',
        description: 'Choose your plan!'
      }
    },
    {
      path: '/upgrade',
      component: Upgrade,
      meta: {
        title: 'Upgrade - Markup Hero',
        description: 'Upgrade!'
      }
    },
    {
      path: '/subscribed',
      component: SuperheroConfirmation,
      meta: {
        title: 'Subscribed - Markup Hero',
        description: 'Welcome!'
      }
    },
    {
      path: '/gdrive',
      component: GDrive,
      meta: {
        title: 'Google Drive - Markup Hero',
        description: 'Import Google Docs into Markup Hero'
      }
    },
    {
      path: '/terms',
      component: Terms,
      meta: {
        title: 'Terms - Markup Hero',
        description: 'Markup Hero&#39;s Terms of Service.'
      }
    },
    {
      path: '/privacy',
      component: Privacy,
      meta: {
        title: 'Privacy - Markup Hero',
        description: 'Markup Hero&#39;s Privacy Policy.'
      }
    },
    {
      path: '/copyright',
      component: Copyright,
      meta: {
        title: 'Copyright - Markup Hero',
        description: 'Markup Hero&#39;s Copyright Policy.'
      }
    },
    {
      path: '/',
      component: Home,
      meta: {
        title: 'Markup Hero - Free Screenshot & Annotation Tool',
        description: 'Markup Hero helps you capture ideas, communicate clearly, save time and stay organized. Made for Mac, Windows, Linux and Chrome.'
      }
    },
    {
      path: '/404teams',
      component: CustomFourOFour,
      meta: {
        title: '404 - Markup Hero',
        description: 'We can’t find this page. If you&#39;re looking for a markup, it may have been deleted.'
      }
    },
    {
      path: '/404',
      component: FourOFour,
      meta: {
        title: '404 - Markup Hero',
        description: 'We can’t find this page. If you&#39;re looking for a markup, it may have been deleted.'
      }
    },
    {
      path: '*',
      redirect: '/404'
    }
  ];

  const router = new VueRouter({
    mode: 'history',
    routes
  });

  router.beforeResolve((to, from, next) => {
    if (isCustomDomain()) {
      if (to.path !== '/404teams' && to.path.indexOf('/share/') === -1) {
        return next('/404teams');
      }
    }

    return next();
  });

  export default {
    name: 'App',
    components: {
      UpgradeModal,
      // Home,
      // eslint-disable-next-line vue/no-unused-components
      Canvas,
      // eslint-disable-next-line vue/no-unused-components
      ToolBar,
      // eslint-disable-next-line vue/no-unused-components
      Nav,
      // eslint-disable-next-line vue/no-unused-components
      NewMarkup,
      // eslint-disable-next-line vue/no-unused-components
      SignUp,
      // eslint-disable-next-line vue/no-unused-components
      LogIn,
      Loader
    },
    router: router,
    computed: mapState([
      'isLoading',
      'loaderStyle',
      'isUpgradeModalOpen',
      'teamBrand'
    ]),
    methods: {
      setPageTitleData(to) {
        setTimeout(() => {
          if (document.querySelector('meta[property="og:image"]')) document.querySelector('meta[property="og:image"]').remove();
          if (document.querySelector('meta[property="og:image:secure_url"]')) document.querySelector('meta[property="og:image:secure_url"]').remove();
          if (document.querySelector('meta[property="og:image:width"]')) document.querySelector('meta[property="og:image:width"]').remove();
          if (document.querySelector('meta[property="og:image:height"]')) document.querySelector('meta[property="og:image:height"]').remove();

          if (to.path.indexOf('/share/') === 0 || to.path.indexOf('/private/') === 0) return;

          let newTitle = to.meta.title || '';
          let brandSuffix = this.teamBrand && this.teamBrand.teamName ? this.teamBrand.teamName : 'Markup Hero';
          newTitle = newTitle.replace(' - Markup Hero', ` - ${brandSuffix}`);
          newTitle = newTitle.replace('Markup Hero - ', `${brandSuffix} - `);
          document.title = newTitle;

          document.querySelector('meta[property="og:title"]').setAttribute("content", newTitle);
        }, 50);
      },
      ...mapMutations([
        'setUser',
        'setLoadingHistory'
      ]),
      ...mapActions([
        'retrieveHistory',
        'retrieveViewHistory',
        'refreshUserDetails',
        'refreshTeamBrand'
      ])
    },
    mounted() {
      EventBus.$on(['signInCompleted', 'signUpCompleted', 'signOutCompleted', 'refreshAllHistory'], async () => {
        await this.refreshUserDetails();
        await this.refreshTeamBrand();

        this.setLoadingHistory(true);
        await this.retrieveHistory({
          refresh: true
        });
        await this.retrieveViewHistory({
          refresh: true
        });
        this.setLoadingHistory(false);
      });

      EventBus.$on('setChatVisibility', (visible) => {
        const gistApp = document.getElementById('gist-app');
        if (gistApp) {
          gistApp.style.display = visible ? 'block' : 'none';
        }
      });

      this.$store.subscribe(async (mutation) => {
        if (mutation.type === 'setTeamBrand') {
          if (mutation.payload.isCustomDomain) {
            EventBus.$emit('setChatVisibility', false);
          }

          if (mutation.payload.isCustomDomain || (mutation.payload.isTeamMember && mutation.payload.logoUrl))
            setFavicon('/generic-favicon.ico');
          else
            setFavicon('/favicon.ico');
        }
      });
    },
    watch: {
      '$route': {
        async handler(to) {
          this.setPageTitleData(to);
        },
        immediate: true
      }
    },
  }
</script>

<style>
  @import url('https://fonts.googleapis.com/css?family=Source+Sans+Pro:400,700&display=swap');

  @font-face {
    font-family: 'Rhesmanisa';
    src: local('Rhesmanisa'),
        url('./assets/fonts/Rhesmanisa/Rhesmanisa.otf') format("opentype"),
        url('./assets/fonts/Rhesmanisa/Rhesmanisa.ttf') format("opentype"),
        url('./assets/fonts/Rhesmanisa/Rhesmanisa.woff') format("woff");
  }
  @font-face {
    font-family: 'Bristol';
    src: local('Bristol'),
        url('./assets/fonts/Bristol/Bristol.otf') format("opentype"),
        url('./assets/fonts/Bristol/Bristol.ttf') format("opentype"),
        url('./assets/fonts/Bristol/Bristol.woff') format("woff");
  }
  @font-face {
    font-family: 'Mayqueen';
    src: local('Mayqueen'),
        url('./assets/fonts/Mayqueen/mayqueen.otf') format("opentype"),
        url('./assets/fonts/Mayqueen/mayqueen.ttf') format("opentype"),
        url('./assets/fonts/Mayqueen/mayqueen.woff') format("woff");
  }
  @font-face {
    font-family: 'Artysignature';
    src: local('Artysignature'),
        url('./assets/fonts/Artysignature/Artysignature.otf') format("opentype"),
        url('./assets/fonts/Artysignature/Artysignature.ttf') format("opentype"),
        url('./assets/fonts/Artysignature/Artysignature.woff') format("woff");
  }

  html, body, div, span, applet, object, iframe,
  h1, h2, h3, h4, h5, h6, p, blockquote, pre,
  a, abbr, acronym, address, big, cite, code,
  del, dfn, em, img, ins, kbd, q, s, samp,
  small, strike, strong, sub, sup, tt, var,
  b, u, i, center,
  dl, dt, dd, ol, ul, li,
  fieldset, form, label, legend,
  table, caption, tbody, tfoot, thead, tr, th, td,
  article, aside, canvas, details, embed,
  figure, figcaption, footer, header, hgroup,
  menu, nav, output, ruby, section, summary,
  time, mark, audio, video {
    margin: 0;
    padding: 0;
    border: 0;
    font-family: 'Source Sans Pro', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    vertical-align: baseline;
    box-sizing: border-box;
  }

  button {
    margin: 0;
    padding: 0;
    border: 0;
    outline: 0;
    background-color: transparent;
    cursor: pointer;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }

  body {
    color: #9CA5B4;
    background-color: #282C34;
  }

  * {
    font-family: 'Source Sans Pro', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  #app {
    display: flex;
    flex-direction: column;
    touch-action: manipulation;
    font-family: 'Source Sans Pro', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  .spinner {
    margin: 20px auto !important;
    width: 64px !important;
    height: 20px !important;
    font-size: 24px !important;
  }

  .spinner > div {
    background-color: #9CA5B4 !important;
    border-radius: 50% !important;
    width: 8px !important;
  }

  .mini-toastr {
    right: 0 !important;
    top: 60px !important;
    left: 0;
  }

  .mini-toastr__notification {
    padding: 0 12px !important;
    margin: 0 !important;
    background-color: #2f333d !important;
    opacity: 1 !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    width: inherit !important;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .mini-toastr__notification.-success {
    background-color: #03A87C !important;
  }

  .mini-toastr__notification.-error {
    background-color: #FF7A59 !important;
  }

  .mini-toastr-notification__title {
    font-weight: bold !important;
    font-size: 13px;
    line-height: 15px;
    text-align: center;
  }

  .mini-toastr-notification__message {
    width: auto !important;
    padding: 0 0 0 12px !important;
    font-size: 13px;
    line-height: 15px;
    text-align: center;
    opacity: 0.74;
  }
  .Rhesmanisa-font{
    font-family: 'Rhesmanisa';
  }
  .Bristol-font{
    font-family: 'Bristol';
  }
  .Mayqueen-font{
    font-family: 'Mayqueen';
  }
  .Artysignature-font{
    font-family: 'Artysignature';
  }
</style>

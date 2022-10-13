<template>
  <div></div>
</template>

<script>
  import authorizedRouteGuard from "../guards/authorizedGuard";
  import {clearUserCache, confirmEmailChange} from "../services/authService";
  import VueNotifications from "vue-notifications";

  export default {
    name: "ConfirmEmailChange",
    beforeRouteEnter: authorizedRouteGuard,
    data() {
      return {
        code: this.$route.params.code
      };
    },
    async created() {
      try {
        await confirmEmailChange(this.code);
        clearUserCache();
        this.showEmailChangedSuccessMsg();
      } catch {
        this.showErrorMsg();
      } finally {
        await this.$router.push('/account');
      }
    },
    notifications: {
      showErrorMsg: {
        type: VueNotifications.types.error,
        title: '',
        message: 'Unknown error has occurred. Please try again.'
      },
      showEmailChangedSuccessMsg: {
        type: VueNotifications.types.success,
        title: '',
        message: 'Your email has been changed'
      }
    }
  }
</script>

<style scoped>

</style>
import {getMarkUpSharePath} from "./services/markUpService";
import {scrollToTop} from "./utils";

export default {
  navigateToSignUp(source=null) {
    if (source) this.$store.commit('setSignUpSource', source);
    this.$router.push('/signUp').catch(() => {});
    scrollToTop();
  },
  navigateToAccount() {
    this.$router.push('/account').catch(() => {});
    scrollToTop();
  },
  navigateToLogin() {
    this.$router.push('/logIn').catch(() => {});
    scrollToTop();
  },
  navigateToDownload() {
    this.$router.push('/download').catch(() => {});
    scrollToTop();
  },
  navigateToPricing() {
    this.$router.push('/pricing').catch(() => {});
    scrollToTop();
  },
  navigateToNew() {
    this.$router.push('/new').catch(() => {});
    scrollToTop();
  },
  navigateToUpgrade() {
    this.$router.push('/upgrade').catch(() => {});
    scrollToTop();
  },
  navigateToUpgradePromo() {
    this.$router.push('/upgrade?code=1MONTHFREE').catch(() => {});
    scrollToTop();
  },
  navigateToTeamUpgrade() {
    this.$router.push('/team/upgrade').catch(() => {});
    scrollToTop();
  },
  navigateToTeamConfirmation() {
    this.$router.push('/team/confirmation').catch(() => {});
    scrollToTop();
  },
  navigateToTeamConfirmationForOwner() {
    this.$router.push('/team/confirmation?isOwner=1').catch(() => {});
    scrollToTop();
  },
  navigateToChangePlan() {
    this.$router.push('/account/changePlan').catch(() => {});
    scrollToTop();
  },
  navigateToChangeCard() {
    this.$router.push('/account/changeCard').catch(() => {});
    scrollToTop();
  },
  navigateToSettings() {
    this.$router.push('/settings').catch(() => {});
    scrollToTop();
  },
  navigateToTeam() {
    this.$router.push('/team').catch(() => {});
    scrollToTop();
  },
  navigateToTeamInvite() {
    this.$router.push('/team/invite').catch(() => {});
    scrollToTop();
  },
  navigateToTeamRemove() {
    this.$router.push('/team/remove').catch(() => {});
    scrollToTop();
  },
  navigateToSuperheroConfirmation() {
    this.$router.push('/subscribed').catch(() => {});
    scrollToTop();
  },
  navigateToWhatIsNew() {
    window.open("https://roadmap.markuphero.com/changelog/", "_blank");
  },
  navigateToWhatIsThisPrivacySetting() {
    window.open("https://help.markuphero.com/article/8", "_blank");
  },
  navigateToTerms() {
    this.$router.push('/terms').catch(() => {});
    scrollToTop();
  },
  navigateToPrivacy() {
    this.$router.push('/privacy').catch(() => {});
    scrollToTop();
  },
  navigateToCopyright() {
    this.$router.push('/copyright').catch(() => {});
    scrollToTop();
  },
  navigateToRoot() {
    this.$router.push('/').catch(() => {});
    scrollToTop();
  },
  navigateToMarkUp(markUpId, pageNumber=1, isPrivate=false) {
    this.$router.push(getMarkUpSharePath({markUpId, pageNumber, isPrivate})).catch(() => {});
    scrollToTop();
  },
  navigateToMarkUpInNewTab(markUpId, isPrivate) {
    window.open(getMarkUpSharePath({markUpId, pageNumber: 1, isPrivate}));
  },
  navigateToChoosePlan() {
    this.$router.push('/choosePlan').catch(() => {});
    scrollToTop();
  },
  navigateTo404() {
    this.$router.push(`/404`).catch(() => {});
    scrollToTop();
  },
  replacePage(markUpId, pageNumber, isPrivate) {
    this.$router.replace(getMarkUpSharePath({markUpId, pageNumber, isPrivate})).catch(() => {});
    scrollToTop();
  },
  navigateToFailedGdrive() {
    window.location.href = '/integrations/google-drive-app-failed.html';
  },
  navigateToSuccessGdrive() {
    window.location.href = '/integrations/google-drive-app-installed.html';
  }
};
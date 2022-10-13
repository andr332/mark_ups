import VueNotifications from "vue-notifications";

const TOUCH_MIN_LINE_THICKNESS = 0;
const DEFAULT_LINE_THICKNESS = 4;
const TOUCH_ANCHOR_SIZE = 12;
const DESKTOP_ANCHOR_SIZE = 8.5;
const HISTORY_PAGE_SIZE = 12;
const MARKUP_EXPORT_PIXEL_RATIO = 1;

const ToolNames = {
  ArrowTool: 'ArrowTool',
  LineTool: 'LineTool',
  PenTool: 'PenTool',
  TextTool: 'TextTool',
  RectangleTool: 'RectangleTool',
  EllipseTool: 'EllipseTool',
  HighlightTool: 'HighlightTool',
  ImageTool: 'ImageTool',
  BlurTool: 'BlurTool',
  CropTool: 'CropTool',
  SignatureTool: 'SignatureTool'
};

const Notifications = {
  showEmailAlreadyExistsMsg: {
    type: VueNotifications.types.error,
    title: '',
    message: 'An account with the given email address already exists'
  },
  showErrorMsg: {
    type: VueNotifications.types.error,
    title: '',
    message: 'Something went wrong. Please try again.'
  },
  showTermPrivacyAgreementMsg: {
    type: VueNotifications.types.error,
    title: '',
    message: 'You must agree to the Terms and Privacy Policy to sign up'
  },
  showPasswordPolicyMsg: {
    type: VueNotifications.types.error,
    title: '',
    message: 'Use 8 or more characters.'
  },
  showInvalidEmailMsg: {
    type: VueNotifications.types.error,
    title: '',
    message: 'Invalid email address provided'
  },
  showWrongPasswordMsg: {
    type: VueNotifications.types.error,
    title: '',
    message: 'Wrong password was provided'
  },
  showUserNotFoundMsg: {
    type: VueNotifications.types.error,
    title: '',
    message: 'Account with provided email address was not found'
  },
  showEmailConfirmationMsg: {
    type: VueNotifications.types.success,
    title: '',
    message: 'Please check your email for a confirmation link'
  },
  showEmailAlreadyInUseMsg: {
    type: VueNotifications.types.error,
    title: '',
    message: 'Email already in use'
  },
  showNameChangedMsg: {
    type: VueNotifications.types.success,
    title: '',
    message: 'Your first name has been changed'
  },
  showPasswordChangedMsg: {
    type: VueNotifications.types.success,
    title: '',
    message: 'Password successfully changed'
  },
  showLimitExceededErrorMsg: {
    type: VueNotifications.types.error,
    title: '',
    message: 'Number of password change attempts exceeded. Please try again later'
  },
  showLoginLimitExceededErrorMsg: {
    type: VueNotifications.types.error,
    title: '',
    message: 'Number of login attempts exceeded. Please try again later'
  },
  showInvalidUrlMsg: {
    type: VueNotifications.types.error,
    title: 'Error',
    message: 'The link you provided is invalid'
  },
  showLinkCopiedMsg: {
    type: VueNotifications.types.success,
    title: '',
    message: 'Link copied to clipboard'
  },
  showMarkupCopiedMsg: {
    type: VueNotifications.types.success,
    title: '',
    message: 'Markup copied to clipboard'
  },
  showWrongUserNameOrPasswordMsg: {
    type: VueNotifications.types.error,
    title: '',
    message: 'Wrong username or password'
  },
  showCurrentEmailProvidedMsg: {
    type: VueNotifications.types.error,
    title: '',
    message: 'Current email provided'
  },
  showFileSizeExceededLimitMsg: {
    type: VueNotifications.types.error,
    title: '8MB Limit',
    message: 'You have exceeded the 8MB limit. Upgrade to SuperHero to increase it'
  },
  showSuperHeroFileSizeExceededLimitMsg: {
    type: VueNotifications.types.error,
    title: '50MB Limit',
    message: 'This file(s) exceeds the 50MB size limit'
  },
  showMarkUpDuplicatedMsg: {
    type: VueNotifications.types.success,
    title: '',
    message: 'Markup duplicated'
  },
  showMarkUpDeleteMsg: {
    type: VueNotifications.types.success,
    title: '',
    message: 'Your markup has been deleted'
  },
  showMarkUpPageDeletedMsg: {
    type: VueNotifications.types.success,
    title: '',
    message: 'Markup page has been deleted'
  },
  showInvalidPromoCodeMsg: {
    type: VueNotifications.types.error,
    title: '',
    message: 'This is not a valid promo code'
  },
  showPromoCodeAppliedMsg: {
    type: VueNotifications.types.success,
    title: '',
    message: 'Promo code applied'
  },
  showCcNotFilledOutMsg: {
    type: VueNotifications.types.error,
    title: '',
    message: 'Please fill out all Credit Card fields'
  },
  showNotValidCardExpiryMsg: {
    type: VueNotifications.types.error,
    title: '',
    message: 'Please fill out Card Expiration Date in MM/YYYY format'
  },
  showCardVerificationFailedMsg: {
    type: VueNotifications.types.error,
    title: '',
    message: 'Failed to verify Credit Card. Please double check your Credit Card details'
  },
  showSubscriptionAlreadyExistsMsg: {
    type: VueNotifications.types.error,
    title: '',
    message: 'You already have an active subscription'
  },
  showSubscriptionCanceledMsg: {
    type: VueNotifications.types.success,
    title: '',
    message: 'Your subscription has been canceled'
  },
  showCreditCardChangedMsg: {
    type: VueNotifications.types.success,
    title: '',
    message: 'Your credit card has been updated'
  },
  showSettingsUpdatedMsg: {
    type: VueNotifications.types.success,
    title: '',
    message: 'Your settings have been updated'
  },
  showMarkUpsSetToPrivateMsg: {
    type: VueNotifications.types.success,
    title: '',
    message: 'All your markups have been set to private'
  },
  showMarkUpPrivacySettingUpdatedMsg: {
    type: VueNotifications.types.success,
    title: '',
    message: 'Your markup privacy setting has been updated'
  },
  showInvalidTagMsg: {
    type: VueNotifications.types.error,
    title: '',
    message: 'Collection names must be between 3-100 characters & cannot include special characters'
  },
  showSystemTagMsg: {
    type: VueNotifications.types.error,
    title: '',
    message: 'Use of system tags not allowed: Screenshot, Image, PDF, URL, Duplicate & Starred'
  },
  showPagesAddedMsg: {
    type: VueNotifications.types.success,
    title: '',
    message: 'New page(s) added'
  },
  showStackCommerceCodeMissing: {
    type: VueNotifications.types.error,
    title: '',
    message: 'Please enter your StackCommerce code'
  },
  showStackCommerceCodeInvalid: {
    type: VueNotifications.types.error,
    title: '',
    message: 'The StackCommerce code you entered is not valid. Please try again'
  },
  showTeamMemberInvited: {
    type: VueNotifications.types.success,
    title: '',
    message: 'Team member invited'
  },
  showTeamMemberReinvited: {
    type: VueNotifications.types.success,
    title: '',
    message: 'Invitation resent'
  },
  showInviteRemoved: {
    type: VueNotifications.types.success,
    title: '',
    message: 'Invitation removed'
  },
  showInvalidAcceptInviteEmail: {
    type: VueNotifications.types.error,
    title: '',
    message: 'Your email does not match the email on the invitation'
  },
  showTeamMemberRemoved: {
    type: VueNotifications.types.success,
    title: '',
    message: 'Team member removed'
  },
  showLogoUpdated: {
    type: VueNotifications.types.success,
    title: '',
    message: 'Team logo has been updated'
  },
  showLogoRemoved: {
    type: VueNotifications.types.success,
    title: '',
    message: 'Team logo has been removed'
  },
  showTeamDetailsUpdated: {
    type: VueNotifications.types.success,
    title: '',
    message: 'Team details have been updated'
  },
  showTeamUpgraded: {
    type: VueNotifications.types.success,
    title: '',
    message: 'Your team has been upgraded'
  },
  showInvalidInvitation: {
    type: VueNotifications.types.error,
    title: '',
    message: 'Invalid invitation link'
  },
  showMarkUpAlreadyInCollection: {
    type: VueNotifications.types.error,
    title: '',
    message: 'Markup is already in collection'
  },
  showCollectionAlreadyExists: {
    type: VueNotifications.types.error,
    title: '',
    message: 'Provided collection name already exists'
  }
};

const Colors = {
  '#000000': {
    color: '#000000',
    name: 'Black'
  },
  '#545454': {
    color: '#545454',
    name: 'Gray'
  },
  '#ababab': {
    color: '#ababab',
    name: 'Light Gray'
  }
};

const DefaultTags = [
  {
    name: 'screenshot',
    displayName: 'Screenshot'
  }, {
    name: 'image',
    displayName: 'Image'
  }, {
    name: 'pdf',
    displayName: 'PDF'
  }, {
    name: 'url',
    displayName: 'URL'
  }, {
    name: 'duplicate',
    displayName: 'Duplicate'
  }
];

export {
  ToolNames,
  Notifications,
  Colors,
  DefaultTags,
  TOUCH_MIN_LINE_THICKNESS,
  DEFAULT_LINE_THICKNESS,
  TOUCH_ANCHOR_SIZE,
  DESKTOP_ANCHOR_SIZE,
  HISTORY_PAGE_SIZE,
  MARKUP_EXPORT_PIXEL_RATIO
};
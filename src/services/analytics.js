import axios from "axios";
import {getAnonId} from "./authService";
import getStore from '../stores/appStore';
import {DefaultTags} from "@/constants";

// Checks to see whether the analytics API url is set
const shouldTrackInternally = !!process.env.VUE_APP_ANALYTICS_API_URL;

const trackEventInternally = async (event) => {
  try {
    event.fullUrl = location.href;
    event.pageRefUrl = document.referrer;
    event.anonId = getAnonId();
    event.userId = getStore().state.userId;
    await axios.post(`${process.env.VUE_APP_ANALYTICS_API_URL}/Event`, event);
  } catch (err) {
    console.error(err);
  }
};

/*eslint-disable no-undef*/
const trackMacDownload = () => {
  if (window.gtag) {
    gtag('event', 'app_download', {
      'event_category': 'engagement',
      'event_label': 'mac',
      'value': 1
    });
  }

  if (shouldTrackInternally) {
    trackEventInternally({
      name: 'app_download',
      value1: 'mac'
    });
  }
};

const trackWindowsDownload = () => {
  if (window.gtag) {
    gtag('event', 'app_download', {
      'event_category': 'engagement',
      'event_label': 'win',
      'value': 1
    });
  }

  if (shouldTrackInternally) {
    trackEventInternally({
      name: 'app_download',
      value1: 'win'
    });
  }
};

const trackLinuxDownload = (type) => {
  if (window.gtag) {
    gtag('event', 'app_download', {
      'event_category': 'engagement',
      'event_label': 'linux',
      'value': 1
    });
  }

  if (shouldTrackInternally) {
    trackEventInternally({
      name: 'app_download',
      value1: 'linux',
      value2: type
    });
  }
};

const trackMarkUpView = (markUpId, isOwner) => {
  if (window.gtag) {
    gtag('event', 'markup_view', {
      'event_category': 'engagement',
      'event_label': isOwner ? 'owner' : 'viewer',
      'value': 1
    });
  }

  if (shouldTrackInternally) {
    trackEventInternally({
      name: 'markup_view',
      value1: markUpId,
      value2: isOwner ? 'owner' : 'viewer'
    });
  }
};

const trackMarkUpCreate = (markUpId, type, isChromeApp) => {
  if (window.gtag) {
    gtag('event', 'markup_create', {
      'event_category': 'engagement',
      'event_label': type,
      'value': 1
    });
  }

  if (shouldTrackInternally) {
    trackEventInternally({
      name: 'markup_create',
      value1: markUpId,
      value2: type,
      value3: isChromeApp ? 'chrome' : null
    });
  }
};

const trackMarkUpCopy = (markUpId, isOwner) => {
  if (window.gtag) {
    gtag('event', 'markup_copy', {
      'event_category': 'sharing',
      'event_label': isOwner ? 'owner' : 'viewer',
      'value': 1
    });
  }

  if (shouldTrackInternally) {
    trackEventInternally({
      name: 'markup_copy',
      value1: markUpId,
      value2: isOwner ? 'owner' : 'viewer'
    });
  }
};

const trackMarkUpShare = (markUpId, isOwner) => {
  if (window.gtag) {
    gtag('event', 'markup_share_link', {
      'event_category': 'sharing',
      'event_label': isOwner ? 'owner' : 'viewer',
      'value': 1
    });
  }

  if (shouldTrackInternally) {
    trackEventInternally({
      name: 'markup_share_link',
      value1: markUpId,
      value2: isOwner ? 'owner' : 'viewer'
    });
  }
};

const trackMarkUpDownload = (markUpId, isOwner) => {
  if (window.gtag) {
    gtag('event', 'markup_download', {
      'event_category': 'sharing',
      'event_label': isOwner ? 'owner' : 'viewer',
      'value': 1
    });
  }

  if (shouldTrackInternally) {
    trackEventInternally({
      name: 'markup_download',
      value1: markUpId,
      value2: isOwner ? 'owner' : 'viewer'
    });
  }
};

const trackMarkUpDuplicate = (markUpId, isOwner) => {
  if (window.gtag) {
    gtag('event', 'markup_duplicate', {
      'event_category': 'engagement',
      'event_label': isOwner ? 'owner' : 'viewer',
      'value': 1
    });
  }

  if (shouldTrackInternally) {
    trackEventInternally({
      name: 'markup_duplicate',
      value1: markUpId,
      value2: isOwner ? 'owner' : 'viewer'
    });
  }
};

const trackSignUp = (source) => {
  if (window.gtag) {
    gtag('event', 'sign_up', {
      'event_category': 'engagement',
      'event_label': 'owner',
      'value': 1
    });
  }

  if (shouldTrackInternally) {
    trackEventInternally({
      name: 'sign_up',
      value1: source
    });
  }
};

const trackHistoryClick = (markupId) => {
  if (shouldTrackInternally) {
    trackEventInternally({
      name: 'markup_history',
      value1: markupId
    });
  }
};

const trackViewHistoryClick = (markupId) => {
  if (shouldTrackInternally) {
    trackEventInternally({
      name: 'markup_view_history',
      value1: markupId
    });
  }
};

const trackMarkUpLimit = (markUpId, userPlanType) => {
  if (shouldTrackInternally) {
    trackEventInternally({
      name: 'markup_limit',
      value1: markUpId,
      value2: userPlanType
    });
  }
}

const trackMarkUpDelete = () => {
  if (shouldTrackInternally) {
    trackEventInternally({
      name: 'markup_delete'
    });
  }
}

const trackInsertImage = (markUpId, userType) => {
  if (shouldTrackInternally) {
    trackEventInternally({
      name: 'markup_insert_image',
      value1: markUpId,
      value2: userType
    });
  }
}

const trackCrop = (markUpId, userType) => {
  if (shouldTrackInternally) {
    trackEventInternally({
      name: 'markup_crop',
      value1: markUpId,
      value2: userType
    });
  }
}

const trackBlur = (markUpId, userType) => {
  if (shouldTrackInternally) {
    trackEventInternally({
      name: 'markup_blur',
      value1: markUpId,
      value2: userType
    });
  }
}

const trackUpgradeView = () => {
  if (shouldTrackInternally) {
    trackEventInternally({
      name: 'upgrade_view'
    });
  }
}

const trackSubscriptionCreate = () => {
  if (shouldTrackInternally) {
    trackEventInternally({
      name: 'subscription_created'
    });
  }
}

const trackMarkUpAddPage = (markUpId, userType) => {
  if (shouldTrackInternally) {
    trackEventInternally({
      name: 'markup_add_page',
      value1: markUpId,
      value2: userType
    });
  }
};

const trackMarkUpTagAdd = (markUpId, tags) => {
  if (shouldTrackInternally) {
    const filteredTags = tags.filter(t => !DefaultTags.find(d => d.name === t) && t !== 'starred');

    trackEventInternally({
      name: 'markup_add_tag',
      value1: markUpId,
      value2: filteredTags.length
    });
  }
};

const trackMarkUpTagRemove = (markUpId, tags) => {
  if (shouldTrackInternally) {
    const filteredTags = tags.filter(t => !DefaultTags.find(d => d.name === t) && t !== 'starred');

    trackEventInternally({
      name: 'markup_add_delete',
      value1: markUpId,
      value2: filteredTags.length
    });
  }
};

const trackTrackPdfExport = (markUpId) => {
  if (shouldTrackInternally) {
    trackEventInternally({
      name: 'markup_pdf_export',
      value1: markUpId
    });
  }
}

const trackAcceptInvite = (teamName) => {
  if (shouldTrackInternally) {
    trackEventInternally({
      name: 'team_accept_invite',
      value1: teamName
    });
  }
}

/*eslint-enable no-undef*/

export {
  trackMacDownload,
  trackWindowsDownload,
  trackLinuxDownload,
  trackMarkUpView,
  trackMarkUpCreate,
  trackMarkUpAddPage,
  trackMarkUpCopy,
  trackMarkUpShare,
  trackMarkUpDownload,
  trackMarkUpDuplicate,
  trackMarkUpDelete,
  trackInsertImage,
  trackCrop,
  trackBlur,
  trackSignUp,
  trackHistoryClick,
  trackViewHistoryClick,
  trackMarkUpLimit,
  trackUpgradeView,
  trackSubscriptionCreate,
  trackMarkUpTagAdd,
  trackMarkUpTagRemove,
  trackTrackPdfExport,
  trackAcceptInvite
};
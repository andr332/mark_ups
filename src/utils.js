import moment from 'moment';
import getStore from "./stores/appStore";
import {refreshUserCredentials} from "./services/authService";

const calculateScale = (options) => {
  let scale = options.parentWidth / options.stageWidth;
  scale = scale > 1 ? 1 : scale;
  return {
    newScale: scale,
    newWidth: options.stageWidth * scale,
    newHeight: options.stageHeight * scale
  };
};

const getScaledCoordinate = (options) => {
  return {
    x: options.x / options.scale,
    y: options.y / options.scale
  };
};

const dataUrlToBlob = (dataUrl) => {
  let arr = dataUrl.split(','), mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], {type: mime});
};

const copyPngToClipboard = async (dataUrl) => {
  const blob = dataUrlToBlob(dataUrl);
  await navigator.clipboard.write([
    // eslint-disable-next-line no-undef
    new ClipboardItem({
      ['image/png']: blob
    })
  ]);
};

const downloadDataUrl = (dataUrl, fileName) => {
  const a = document.createElement("a");
  a.style.display = 'none';
  a.href = dataUrl;
  a.setAttribute("download", fileName);
  a.click();
  a.remove();
};

const copyTextToClipboard = async (text) => {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    await navigator.clipboard.writeText(text);
  } else {
    const el = document.createElement('textarea');
    el.value = text;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  }
};

const isValidEmail = (email) => {
  const reg = new RegExp('[a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?');
  return reg.test(String(email).toLowerCase());
};

const getFormattedDate = (date) => {
  return moment(date).local().format('M/DD/YY');
};

const getUserFirstLetter = (firstName, email) => {
  if (firstName) {
    return firstName.substring(0, 1).toUpperCase();
  }

  return email.substring(0, 1).toUpperCase();
};

const redirectFromWww = () => {
  if (window.location.hostname.indexOf('www.') === 0) {
    const newUrl = window.location.href.replace('www.', '');
    window.location.replace(newUrl);
  }
};

const cleanChildrenForUndo = (children) => {
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (child.className === 'Transformer' || child.attrs !== undefined && (child.attrs.name === 'manipulation')) {
      children.splice(i, 1);
      i--;
      continue;
    }

    if ((child.attrs !== undefined && child.attrs.name && child.attrs.name.indexOf('RectGroup') === 0)) {
      for (let j = 0; j < child.children.length; j++) {
        const textBoxChild = child.children[j];
        if (textBoxChild !== undefined && textBoxChild.attrs.name === 'RectToggle') {
          child.children.splice(j, 1);
          j--;
        }
      }
    }
    else if ((child.attrs !== undefined && child.attrs.name && child.attrs.name.indexOf('EllipseGroup') === 0)) {
      for (let j = 0; j < child.children.length; j++) {
        const textBoxChild = child.children[j];
        if (textBoxChild !== undefined && textBoxChild.attrs.name === 'EllipseToggle') {
          child.children.splice(j, 1);
          j--;
        }
      }
    }
    else if ((child.attrs !== undefined && child.attrs.name && child.attrs.name.indexOf('TextGroup') === 0)) {
      for (let j = 0; j < child.children.length; j++) {
        const textBoxChild = child.children[j];
        if (textBoxChild !== undefined && textBoxChild.attrs.name === 'TextToggle') {
          child.children.splice(j, 1);
          j--;
        }
      }
    }

    if (child.attrs !== undefined && child.attrs.visible === false) {
      child.attrs.visible = true;
    }
  }
};

const scrollToTop = () => {
  window.scrollTo(0, 0);
};

const calculateNewObjectSize = (canvasSize, objectSize, maxCanvasPercent=0.99) => {
  const objectRatio = objectSize.width / objectSize.height;
  let newImageSize = JSON.parse(JSON.stringify(objectSize));
  if (canvasSize.width * maxCanvasPercent < newImageSize.width) {
    newImageSize.width = canvasSize.width * maxCanvasPercent;
    newImageSize.height = newImageSize.width / objectRatio;
  }

  if (canvasSize.height * maxCanvasPercent < newImageSize.height) {
    newImageSize.height = canvasSize.height * maxCanvasPercent;
    newImageSize.width = objectRatio * newImageSize.height;
  }

  return newImageSize;
};

const calculateCenterCoordinate = (canvasDetails, objectSize, scale) => {
  const centerX = canvasDetails.width / scale / 2  - (objectSize.width / 2) + canvasDetails.offsetX;
  const centerY = canvasDetails.height / scale / 2 - (objectSize.height / 2) + canvasDetails.offsetY;

  return {
    x: centerX,
    y: centerY
  };
};

const getAccessTokenHeader = async () => {
  let user = getStore().state.user;
  if (user) {
    if (user.signInUserSession.accessToken.payload.exp <= moment().unix()) {
      user = await refreshUserCredentials();
    }

    return {
      'Authorization': `Bearer ${user.signInUserSession.accessToken.jwtToken}`
    };
  }
  return {};
};

const awaitFor = (ms) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
};

const setFavicon = (faviconPath) => {
  const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
  link.type = 'image/x-icon';
  link.rel = 'shortcut icon';
  link.href = faviconPath;
  document.getElementsByTagName('head')[0].appendChild(link);
};

const isCustomDomain = () => {
  return window.location.hostname !== 'markuphero.com'
      && window.location.hostname !== 'dev.markuphero.com'
      && window.location.hostname !== 'www.markuphero.com'
      && window.location.hostname !== 'localhost';
};

const getCurrentDomain = () => {
  return window.location.hostname;
};

const comparePoints = (point1, point2) => {
  let diffX = 0;
  let diffY = 0;

  diffX = point1.x - point2.x;
  diffY = point1.y - point2.y;

  return {
    diffX,
    diffY
  };
};

export {
  copyTextToClipboard,
  calculateScale,
  getScaledCoordinate,
  copyPngToClipboard,
  isValidEmail,
  getFormattedDate,
  getUserFirstLetter,
  redirectFromWww,
  cleanChildrenForUndo,
  scrollToTop,
  calculateNewObjectSize,
  calculateCenterCoordinate,
  getAccessTokenHeader,
  downloadDataUrl,
  awaitFor,
  setFavicon,
  isCustomDomain,
  getCurrentDomain,
  comparePoints
};
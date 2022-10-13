import {DESKTOP_ANCHOR_SIZE, TOUCH_ANCHOR_SIZE} from "../../constants";

export default (isTouchDevice) => {
  return {
    anchorStroke: '#0071df',
    borderStroke: '#0071df',
    anchorSize: isTouchDevice ? TOUCH_ANCHOR_SIZE * 2 : DESKTOP_ANCHOR_SIZE * 2,
    anchorCornerRadius: 2
  };
};
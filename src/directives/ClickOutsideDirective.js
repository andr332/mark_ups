import Vue from "vue";

const addDirective = () => {
  Vue.directive('click-outside', {
    priority: 700,
    bind(el, binding, vnode) {
      el.stopProp = (event) => {
        event.stopPropagation();
      };

      el.eventEmit = () => {
        binding.value(vnode.context);
      };
      el.addEventListener('click', el.stopProp);
      document.body.addEventListener('click', el.eventEmit);
    },
    unbind(el) {
      el.removeEventListener('click', el.stopProp);
      document.body.removeEventListener('click', el.eventEmit);
    },
    stopProp(event) {
      event.stopPropagation();
    }
  })
};

export default addDirective;
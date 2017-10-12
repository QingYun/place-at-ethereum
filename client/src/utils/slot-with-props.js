import { merge, omit, propOr } from 'ramda';

export default {
  render(createElement) {
    const [slot] = this.$slots.default;
    const props = merge(
      propOr({}, 'propsData', slot.componentOptions),
      omit(this.$attrs, ['node', 'id']));
    return createElement(slot.tag, props, slot.children);
  },
};

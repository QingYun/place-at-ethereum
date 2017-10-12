import { merge, omit, propOr } from 'ramda';

export default {
  render() {
    const [slot] = this.$slots.default;
    const props = merge(
      propOr({}, 'propsData', slot.componentOptions),
      omit(['node', 'id'], this.$attrs));
    slot.componentOptions.propsData = props;
    return slot;
  },
};

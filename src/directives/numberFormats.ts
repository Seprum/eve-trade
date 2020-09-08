import Vue, { DirectiveOptions } from 'vue';
import Autonumeric from 'autonumeric';

import { MAX_CARGO_CAPACITY } from '@/constants';

const createNumberFormatConfig = (
  options: Autonumeric.Options
): DirectiveOptions => ({
  inserted: (_, __, vnode) => {
    const input = vnode.componentInstance?.$refs.input as HTMLInputElement;

    new Autonumeric(input, null, {
      decimalCharacterAlternative: '.',
      minimumValue: '0',
      ...options
    });
    input.dispatchEvent(new CustomEvent('input'));
  }
});

Vue.directive('currency', createNumberFormatConfig({ decimalPlaces: 2 }));
Vue.directive(
  'volume',
  createNumberFormatConfig({
    decimalPlaces: 1,
    maximumValue: MAX_CARGO_CAPACITY.toString()
  })
);
Vue.directive(
  'quantity',
  createNumberFormatConfig({ decimalPlaces: 0, digitGroupSeparator: ' ' })
);

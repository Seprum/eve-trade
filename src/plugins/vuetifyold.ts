import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/dist/vuetify.min.css';

import Vue from 'vue';
import Vuetify, { UserVuetifyPreset } from 'vuetify';
import colors from 'vuetify/lib/util/colors'

Vue.use(Vuetify);

const opts: Partial<UserVuetifyPreset> = {
  theme: {
    dark: true,
    themes: {
      dark: {
        primary: colors.grey.lighten1,
      },
    },
  },
  icons: {
    iconfont: 'mdi',
  },
};

export default new Vuetify(opts);

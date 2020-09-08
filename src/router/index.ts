import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';
import SetupView from '@/views/SetupView';
import ResultsView from '@/views/ResultsView';
import store from '@/store';

Vue.use(VueRouter);

const mainTitle = 'EVE Trade';
export const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'Setup',
    icon: 'mdi-cog',
    component: SetupView
  },
  {
    path: '/results',
    name: 'Results',
    icon: 'mdi-clipboard-text',
    component: ResultsView
  }
].map(route => ({
  ...route,
  meta: { title: `${route.name} - ${mainTitle}` }
}));

const router = new VueRouter({
  routes
});

router.beforeEach(async (to, from, next) => {
  document.title = to.meta.title;

  if (to.path === '/' || store.state.isStaticDataLoaded) {
    next();
  } else {
    next('/');
  }
});

export default router;

import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';
import TradeSetup from '@/views/TradeSetup';
import TradeLists from '@/views/TradeLists';
import store from '@/store';

Vue.use(VueRouter);

const mainTitle = 'EVE Trade';
const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'Setup',
    component: TradeSetup
  },
  {
    path: '/result',
    name: 'Result',
    component: TradeLists,
    meta: { requiresStaticData: true }
  }
].map(route => ({
  ...route,
  meta: { ...(route.meta || {}), title: `${route.name} - ${mainTitle}` }
}));

const router = new VueRouter({
  routes
});

router.beforeEach((to, from, next) => {
  if (to.meta.requiresStaticData && !store.state.isStaticDataLoaded) {
    next('/');
  } else {
    document.title = to.meta.title;
    next();
  }
});

export default router;

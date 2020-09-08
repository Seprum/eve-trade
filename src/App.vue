<template>
  <v-app id="app">
    <v-tabs centered class="flex-grow-0">
      <v-tab
        v-for="(route, index) in routes"
        :key="index"
        :to="route.path"
        :disabled="route.path !== '/' && !isStaticDataLoaded"
        class="flex-column"
      >
        <v-icon size="large">{{ route.icon }}</v-icon>
        {{ route.name }}
      </v-tab>
      <v-spacer />
      <notify-dialog />
    </v-tabs>
    <router-view></router-view>
  </v-app>
</template>

<script lang="ts" src="./App"></script>
<style lang="scss" src="./App.scss"></style>

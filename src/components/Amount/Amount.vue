<template>
  <v-tooltip bottom>
    <template v-slot:activator="{ on }">
      <span class="d-flex align-center ml-4 mb-4 mb-lg-0" v-on="on"
        ><v-icon size="large" class="mr-1">{{ icon }}</v-icon>
        <span class="body-2">
          <slot />
        </span>
      </span>
    </template>
    <span>{{ title }}</span>
  </v-tooltip>
</template>

<script lang="ts" src="./Amount.ts"></script>

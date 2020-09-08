<template>
  <v-dialog v-model="isOpened" persistent max-width="400">
    <template v-slot:activator="{ on }">
      <v-btn icon class="my-auto mx-4" v-on="on">
        <v-icon click>mdi-bell</v-icon>
      </v-btn>
    </template>
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        <span class="headline">Profit notifications</span>
        <v-switch
          v-model="isEnabled"
          :label="isEnabled ? 'Enabled' : 'Disabled'"
        />
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12" md="4" class="d-flex align-end">
              Check every
            </v-col>
            <v-col cols="12" md="8">
              <v-text-field
                label="Interval"
                suffix="secs."
                hide-details
                v-model="interval"
              />
            </v-col>
            <v-col cols="12" md="4" class="d-flex align-end">
              Notify when
            </v-col>
            <v-col cols="12" md="8">
              <v-text-field
                label="Profit"
                suffix="ISK"
                hide-details
                v-model="minProfit"
              />
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="close">Cancel</v-btn>
        <v-btn @click="save">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" src="./NotifyDialog.ts"></script>

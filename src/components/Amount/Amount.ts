import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component({ name: 'amount' })
export default class Amount extends Vue {
  @Prop(String) readonly title: string;
  @Prop(String) readonly icon: string;
}

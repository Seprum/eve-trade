import { Planet } from './Planet';

export type System = {
  constellation_id: number;
  name: string;
  planets?: Planet[];
  position: {
    x: number;
    y: number;
    z: number;
  };
  security_class?: string;
  security_status: number;
  star_id?: number;
  stargates?: number[];
  stations?: number[];
  system_id: number;
};

import numeral from 'numeral';

export const currency = (value: number) => numeral(value).format('0,0.00');
export const volume = (value: number) => numeral(value).format('0,0.0');
export const integer = (value: number) =>
  numeral(value)
    .format('0,0')
    .replace(/,/g, ' ');

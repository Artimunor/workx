export enum IndicatorCategory {
  SKILL = 'SKILL',
  CHARACTERISTIC = 'CHARACTERISTIC',
  PREFERENCE = 'PREFERENCE',
}

export interface Indicator {
  // Name of the indicator
  name: string;

  // Minlabel of the indicator name
  minLabel?: string;

  // Maxlabel of the indicator name
  maxLabel?: string;

  // Type of the indicator
  type: string;

  // Category of the category
  category: IndicatorCategory;
}

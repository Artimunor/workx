import { Indicator } from './indicator.interface';

export interface Measurement {
  // Name of the section of the assessment this measurement is about
  name: string;

  // Value of the Measurement if the measurement was numeric
  numberValue?: number;

  // Value of the Measurement if the measurement was text-based
  textValue?: string;

  // Scale of the value of the measurement
  scale?: string;

  // Type of the measurement
  type: string;

  // Indicators affected by this measurement
  indicator?: Indicator[];
}

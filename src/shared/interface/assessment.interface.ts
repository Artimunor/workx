import { Measurement } from './measurement.interface';

export interface Assessment {
  // Name of the assessment
  name: string;

  // Person or Company that provided the assessment
  providerName: string;

  // Date when the Assessment was completed
  completedDate: Date;

  // Type of the assessment
  type: string;

  // Measurements on the assessment
  measurements: Measurement[];
}

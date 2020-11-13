interface assessment {
  name: string; //sourceUnit
  providerName: string; //sourceUnit or assessmentCompany
  completedDate: Date; //measuredOn

  value: number; //
  //standardizedValue

  scale: string; //Scale

  //measurementCategory?
  // ASSESSMENT = 'ASSESSMENT',
  // ENDORSEMENT = 'ENDORSEMENT',
  // SELFASSIGNED = 'SELFASSIGNED',
  //measurementType?

  //measuredValue
}

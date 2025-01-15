export interface AddAudioRequest {
  courthouse: string;
  courtroom: string;
  case_numbers: string;
  date: string;
  startTime: string;
  endTime: string;
  audioFile: string;
}

export interface AddCaseDataTable {
  courthouse: string;
  case_number: string;
  defendants: string;
  judges: string;
  prosecutors: string;
  defenders: string;
}

export interface GetCasesDataTable {
  courthouse: string;
  courtroom: string;
  date: string;
}

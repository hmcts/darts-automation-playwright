import { type HearingWithAudio } from '../data/audio';
import { type CasePage } from '../pages/case.page';
import { type HearingPage } from '../pages/hearing.page';
import {
  type TranscriptRequestPage,
  type TranscriptRequestType,
} from '../pages/transcript-request.page';
import { createLogger } from '../support/logger';

const log = createLogger('transcript-request');

interface TranscriptRequestOptions {
  type: TranscriptRequestType;
  urgency: string;
}

interface SubmittedRequest {
  caseId: number;
  hearingId: number;
  transcriptionId: number;
}

export class TranscriptRequestFlow {
  private readonly requests: SubmittedRequest[] = [];

  constructor(
    private readonly casePage: CasePage,
    private readonly hearingPage: HearingPage,
    private readonly transcriptRequest: TranscriptRequestPage,
  ) {}

  get submittedRequests(): readonly SubmittedRequest[] {
    return this.requests;
  }

  async submit(hearing: HearingWithAudio, options: TranscriptRequestOptions): Promise<void> {
    const { courtCase, hearingId, startTime, endTime } = hearing;
    log.debug(`Starting ${options.type} request for hearing ${hearingId}`);
    await this.casePage.open(courtCase.id);
    await this.casePage.openHearing(courtCase.courtroom);
    await this.hearingPage.expectHearing(courtCase.id, hearingId);
    await this.hearingPage.openTranscripts();
    await this.hearingPage.requestTranscript();

    await this.transcriptRequest.expectAudioInterval(startTime, endTime);
    await this.transcriptRequest.selectRequest(options.type, options.urgency);
    if (options.type === 'Court Log') {
      await this.transcriptRequest.selectInterval(startTime, endTime);
    } else if (options.type === 'Specified Times') {
      await this.transcriptRequest.selectIntervalFromEvents(startTime, endTime);
    }
    await this.transcriptRequest.expectDetails({
      caseNumber: courtCase.number,
      ...options,
      ...(options.type === 'Sentencing remarks' ? {} : { interval: { startTime, endTime } }),
    });

    const requestId = await this.transcriptRequest.submit();
    this.requests.push({ caseId: courtCase.id, hearingId, transcriptionId: requestId });
    log.info(`Transcript request ${requestId} submitted for hearing ${hearingId}`);
    await this.transcriptRequest.expectSubmitted(requestId);
    await this.transcriptRequest.returnToHearing();
    await this.hearingPage.expectHearing(courtCase.id, hearingId);
    log.debug('Transcript-request flow completed; returned to hearing');
  }
}

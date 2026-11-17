import { test } from '../fixtures';

// Allow for the real blob upload as well as API setup and UI submission.
test.describe.configure({ timeout: 120_000 });

test('a user can request a transcript for a hearing with audio', async ({
  casePage,
  hearingPage,
  transcriptRequest,
  hearingWithAudio,
}, testInfo) => {
  /*
   * Existing coverage: features/portal/DARTS_Request_Transcript.feature
   * Scenario: "Request Transcription, Court Log by Manually Entering Time".
   * This example covers submission; the existing scenario uses a requester and
   * continues through approval, allocation and transcript delivery.
   *
   * GIVEN a signed-in user and a Crown Court hearing with audio
   * WHEN the user submits a transcript request for that hearing
   * THEN the request is confirmed and listed against the correct hearing.
   */

  // Preparation (hearingWithAudio):
  // - API: create a unique case, courtroom and actual hearing, then register the audio metadata.
  // - Storage: upload a fresh copy of sample1.mp2 under a unique blob ID, linked to that hearing.
  // Browser login is handled by the authentication setup. The transcript request
  // itself is created through the UI in the steps below.
  const { courtCase, hearingId, startTime, endTime } = hearingWithAudio;
  const request = {
    caseNumber: courtCase.number,
    type: 'Court Log',
    urgency: 'Overnight',
    startTime,
    endTime,
  };

  await test.step('Open the hearing and start a new transcript request', async () => {
    // Case search has its own test. Start here at the independently created case.
    await casePage.open(courtCase.id);
    await casePage.openHearing(courtCase.courtroom);
    await hearingPage.expectHearing(courtCase.id, hearingId);
    await hearingPage.openTranscripts();
    await hearingPage.requestTranscript();
  });

  await test.step('Select the request type, urgency and audio interval', async () => {
    await transcriptRequest.expectAudioInterval(startTime, endTime);
    await transcriptRequest.selectRequest(request.type, request.urgency);
    await transcriptRequest.selectInterval(startTime, endTime);
  });

  await test.step('Check the request details and submit', async () => {
    await transcriptRequest.expectDetails(request);
    const requestId = await transcriptRequest.submit(
      `PW transcript request for ${courtCase.number}`,
    );
    // Retain identifiers for review and the future scoped cleanup implementation.
    await testInfo.attach('created-transcript-request', {
      body: JSON.stringify({ caseId: courtCase.id, hearingId, transcriptionId: requestId }),
      contentType: 'application/json',
    });
    await transcriptRequest.expectSubmitted(requestId);
  });

  await test.step('Verify the submitted request is listed against the hearing', async () => {
    await transcriptRequest.returnToHearing();
    await hearingPage.expectHearing(courtCase.id, hearingId);
    await hearingPage.expectTranscriptRequest(request.type, 'Awaiting Authorisation');
  });
});

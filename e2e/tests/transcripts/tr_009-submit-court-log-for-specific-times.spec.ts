import { test } from '../../fixtures/test';
import { AuthUser } from '../../setup/users';

test.use({ authUser: AuthUser.AUTOMATION });

test('TR_009: The Requester can request a Court Log for manually entered times', async ({
  hearingPage,
  transcriptRequestFlow,
  hearingWithAudio,
}) => {
  /**
   * Scenario: TR_009: The Requester can request a Court Log for manually entered times.
   *
   * Background
   * - The Requester is signed in and has access to the courthouse.
   *
   * Given
   * - A hearing with audio is available to the Requester.
   * - The start and end times of the required transcript are known.
   *
   * When
   * - The Requester opens the hearing and starts a transcript request.
   * - The Requester selects Court Log and Overnight urgency.
   * - The Requester enters the transcript start and end times.
   * - The Requester checks the summary, confirms the judge's authorisation and submits.
   *
   * Then
   * - The summary contains the requested type, urgency and time interval.
   * - The Requester sees confirmation with a request reference.
   * - The same hearing lists the Court Log request as Awaiting Authorisation.
   *
   * Route
   *   Case details
   *   -> Hearing details
   *   -> Transcripts
   *   -> Request a new transcript
   *   -> Events, audio and specific times
   *   -> Check and confirm
   *   -> Submitted
   *   -> Hearing transcripts
   */

  // Arrange
  const request = { type: 'Court Log', urgency: 'Overnight' } as const;

  // Act
  await transcriptRequestFlow.submit(hearingWithAudio, request);

  // Assert
  await hearingPage.expectTranscriptRequest(request.type, 'Awaiting Authorisation');
});

import { test } from '../../fixtures/test';
import { AuthUser } from '../../setup/users';

test.use({ authUser: AuthUser.AUTOMATION });

test('TR_010: The Requester can request a transcript for selected hearing events', async ({
  hearingPage,
  transcriptRequestFlow,
  hearingWithAudioEvents,
}) => {
  /**
   * Scenario: TR_010: The Requester can request a transcript for selected hearing events.
   *
   * Background
   * - The Requester is signed in and has access to the courthouse.
   *
   * Given
   * - A hearing with audio is available to the Requester.
   * - Hearing started and Hearing ended events mark the required audio interval.
   *
   * When
   * - The Requester starts a transcript request with Specified Times and Overnight urgency.
   * - The Requester selects the Hearing started and Hearing ended events.
   * - The Requester checks the summary, confirms the judge's authorisation and submits.
   *
   * Then
   * - The transcript start and end times match the selected events.
   * - The summary contains the requested type, urgency and time interval.
   * - The Requester sees confirmation with a request reference.
   * - The same hearing lists the Specified Times request as Awaiting Authorisation.
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
  const request = { type: 'Specified Times', urgency: 'Overnight' } as const;

  // Act
  await transcriptRequestFlow.submit(hearingWithAudioEvents, request);

  // Assert
  await hearingPage.expectTranscriptRequest(request.type, 'Awaiting Authorisation');
});

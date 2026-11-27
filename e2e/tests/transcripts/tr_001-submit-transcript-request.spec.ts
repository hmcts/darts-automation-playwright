import { test } from '../../fixtures/test';
import { AuthUser } from '../../setup/users';

test.use({ authUser: AuthUser.AUTOMATION });

// Timeout for the transcript-request journey.
test.describe.configure({ timeout: 120_000 });

test('TR_001: The Requester can submit a Sentencing Remarks transcript request', async ({
  hearingPage,
  transcriptRequestFlow,
  hearingWithAudio,
}) => {
  /**
   * Scenario: TR_001: The Requester can submit a Sentencing Remarks transcript request.
   *
   * Background
   * - The Requester is signed in and has access to the courthouse.
   *
   * Given
   * - A hearing with audio is available to the Requester.
   *
   * When
   * - The Requester opens the hearing and starts a transcript request.
   * - The Requester selects Sentencing Remarks and Overnight urgency.
   * - The Requester checks the summary, confirms the judge's authorisation and submits.
   *
   * Then
   * - The Requester sees confirmation with a request reference.
   * - The same hearing lists the Sentencing Remarks request as Awaiting Authorisation.
   *
   * Route
   *   Case details
   *   -> Hearing details
   *   -> Transcripts
   *   -> Request a new transcript
   *   -> Request options
   *   -> Check and confirm
   *   -> Submitted
   *   -> Hearing transcripts
   */

  // Arrange
  const request = {
    type: 'Sentencing remarks',
    urgency: 'Overnight',
  } as const;

  // Act
  await transcriptRequestFlow.submit(hearingWithAudio, request);

  // Assert
  await hearingPage.expectTranscriptRequest(request.type, 'Awaiting Authorisation');
});

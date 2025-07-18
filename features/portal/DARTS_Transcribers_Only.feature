@request-audio-for-transcribers
Feature: Request Audio for transcribers

  @DMP-696 @DMP-1198 @DMP-1203 @DMP-1234 @DMP-1243 @DMP-1255 @DMP-1326 @DMP-1331 @DMP-1351 @regression @fix @sequential
  Scenario: Request Transcription only data creation
    Given I create a case
      | courthouse         | courtroom  | case_number | defendants      | judges            | prosecutors             | defenders             |
      | HARROW CROWN COURT | {{seq}}-17 | F{{seq}}001 | DefF {{seq}}-17 | JudgeF {{seq}}-17 | testprosecutorseventeen | testdefenderseventeen |

    Given I authenticate from the "CPP" source system
    Given I create an event
      | message_id | type | sub_type | event_id   | courthouse         | courtroom  | case_numbers | event_text    | date_time              | case_retention_fixed_policy | case_total_sentence |
      | {{seq}}001 | 1100 |          | {{seq}}026 | HARROW CROWN COURT | {{seq}}-17 | F{{seq}}001  | {{seq}}ABC-17 | {{timestamp-10:30:00}} |                             |                     |
      | {{seq}}001 | 1200 |          | {{seq}}027 | HARROW CROWN COURT | {{seq}}-17 | F{{seq}}001  | {{seq}}DEF-17 | {{timestamp-10:31:00}} |                             |                     |

    When I load an audio file
      | courthouse         | courtroom  | case_numbers | date       | startTime | endTime  | audioFile   |
      | HARROW CROWN COURT | {{seq}}-17 | F{{seq}}001  | {{date+0}} | 10:30:00  | 10:31:00 | sample1.mp2 |

  @DMP-696 @DMP-1198 @DMP-1203 @DMP-1234 @DMP-1243 @DMP-1326 @DMP-1331 @DMP-1351 @regression @fix @MissingData @sequential
  Scenario: Transcriber behaviour, including audio request handling
    Given I am logged on to DARTS as a "REQUESTER" user
    And I click on the "Search" link
    And I see "Search for a case" on the page
    And I set "Case ID" to "F{{seq}}001"
    And I press the "Search" button
    When I click on "F{{seq}}001" in the same row as "Harrow Crown Court"
    And I click on the "{{displaydate}}" link
    And I click on the "Transcripts" link
    And I press the "Request a new transcript" button
    Then I see "Audio list" on the page
    And I see "F{{seq}}001" on the page
    And I see "Harrow Crown Court" on the page
    And I see "DefF {{seq}}-17" on the page
    And I see "{{displaydate}}" on the page

    When I select "Court Log" from the "Request Type" dropdown
    And I select "Overnight" from the "Urgency" dropdown
    And I press the "Continue" button
    Then I see "Events, audio and specific times requests" on the page

    When I set the time fields below "Start time" to "10:30:00"
    And I set the time fields below "End time" to "10:31:00"
    And I press the "Continue" button
    Then I see "Check and confirm your transcript request" on the page
    And I see "F{{seq}}001" in summary row for "Case ID"
    And I see "Harrow Crown Court" in summary row for "Courthouse"
    And I see "DefF {{seq}}-17" in summary row for "Defendant(s)"
    And I see "{{displaydate}}" in summary row for "Hearing date"
    And I see "Court Log" in summary row for "Request type"
    And I see "Overnight" in summary row for "Urgency"
    And I see "Provide any further instructions or comments for the transcriber." on the page

    When I set "Comments to the Transcriber (optional)" to "Requesting transcript Court Log for one minute of audio, please request audio if needed."
    And I check the "I confirm I have received authorisation from the judge." checkbox
    And I press the "Submit request" button
    Then I see "Transcript request submitted" on the page
    And I use transcript request ID
    And I see "What happens next?" on the page
    And I see "We’ll review it and notify you of our decision to approve or reject your request by email and through the DARTS portal." on the page

    When I click on the "Return to hearing date" link
    Then I see "Transcripts for this hearing" on the page
    And I see "Court Log" in the same row as "Awaiting Authorisation"

    When I click on the "Your transcripts" link
    Then I see "F{{seq}}001" in the same row as "Awaiting Authorisation"

    When I Sign out
    And I see "Sign in to the DARTS Portal" on the page
    And I am logged on to DARTS as an "APPROVER" user
    And I click on the "Your transcripts" link
    And I click on the "Transcript requests to authorise" link
    And I click on "View" in the same row as "F{{seq}}001"
    Then I see "Approve transcript request" on the page
    And I see "F{{seq}}001" in summary row for "Case ID"
    And I see "Harrow Crown Court" in summary row for "Courthouse"
    And I see "{{upper-case-JudgeF {{seq}}-17}}" in summary row for "Judge(s)"
    And I see "DefF {{seq}}-17" in summary row for "Defendant(s)"
    And I see "{{displaydate}}" in summary row for "Hearing date"
    And I see "Court Log" in summary row for "Request type"
    And I see "Overnight" in summary row for "Urgency"
    And I see "Requesting transcript Court Log for one minute of audio, please request audio if needed." in summary row for "Instructions"
    And I see "Yes" in summary row for "Judge approval"

    When I select the "Yes" radio button
    And I press the "Submit" button
    #    And I see "Select to apply actions" on the page
    #    And I click on the "Transcript requests to review" link
    Then I see "Requests to approve or reject" on the page
    And I do not see "F{{seq}}001" on the page

    When I Sign out
    And I see "Sign in to the DARTS Portal" on the page
    And I am logged on to DARTS as a "TRANSCRIBER" user
    # And I click on the "Transcript requests" link
    #DMP-1198-AC1, AC3 and DMP-1203-AC4 Transcript request screen and column names/sortable columns to do
    # TODO (DT): transcript requests is now ordered by case ID by default and only shows 500 results
    # so this request will never show for this use, navigate directly instead
    # And I see "Manual" in the same row as "F{{seq}}001"
    #DMP-1198-AC2, DMP-1234 and DMP-1255-AC3 View transcript request order
    # And I click on "View" in the same row as "F{{seq}}001"
    And I navigate to the url "/transcription-requests/{{tra_id}}"

    Then I see "Transcript request" on the page
    And I see "F{{seq}}001" in summary row for "Case ID"
    And I see "Harrow Crown Court" in summary row for "Courthouse"
    And I see "{{upper-case-JudgeF {{seq}}-17}}" in summary row for "Judge(s)"
    And I see "DefF {{seq}}-17" in summary row for "Defendant(s)"
    And I see "{{displaydate}}" in summary row for "Hearing date"
    And I see "Court Log" in summary row for "Request type"
    And I see "Overnight" in summary row for "Urgency"
    And I see "Requesting transcript Court Log for one minute of audio, please request audio if needed." in summary row for "Instructions"
    And I see "Yes" in summary row for "Judge approval"

    #DMP-1243-AC5 Cancel link

    When I click on the "Cancel" link
    # And I see "Manual" in the same row as "F{{seq}}001"
    # And I click on "View" in the same row as "F{{seq}}001"
    And I navigate to the url "/transcription-requests/{{tra_id}}"
    #DMP-1243-AC6 Error for no selection
    And I press the "Continue" button
    Then I see an error message "Select an action to progress this request."

    When I select the "Assign to me" radio button
    And I press the "Continue" button
    Then I see "Your work" on the page

    #DMP-1331-AC1 Get audio for this request button

    When I click on "View" in the same row as "F{{seq}}001"
    And I press the "Get audio for this request" button
    Then I see "Events and audio recordings" on the page

    #DMP-696 and DMP-1326-AC1 Transcriber requests download audio

    When I select the "Download" radio button
    And I press the "Get Audio" button
    Then I see "Confirm your Order" on the page
    And I see "F{{seq}}001" on the page

    When I press the "Confirm" button
    Then I see "Your order is complete" on the page

    When I click on the "Return to hearing date" link
    Then I see "Events and audio recordings" on the page

    #DMP-1203-AC3 Your audio

    When I click on the "Your audio" link
    #    And I click on "Request ID" in the "Ready" table header
    #    And I wait for text "READY" on the same row as the link "F{{seq}}001"
    And I wait for the requested audio file to be ready
      | user        | courthouse         | case_number | hearing_date |
      | TRANSCRIBER | HARROW CROWN COURT | F{{seq}}001 | {{date+0}}   |
    And I click on the "Search" link
    And I click on the "Your audio" link
    # And I click on "Request ID" in the "readyTable" table header
    And I click on "View" in the same row as "F{{seq}}001"
    And I see "Download audio file" on the page
    And I see ".zip" on the page
    #TODO verify that the 2 lines above correctly replace
    #    Then I see "Play all audio" on the page
    #    And I see "mp3" on the page

    #DMP-1203-AC2 Your work and DMP-1351-AC1 Completed today

    When I click on the "Your work" link
    And I click on the "Completed today" link
    Then I do not see "F{{seq}}001" on the page

    #DMP-1203-AC1 Search

    # TODO (DT): removed as not necessary
    # When I click on the "Search" link
    # Then I see "Search for a case" on the page

    # TODO (DT): not sure if these next 5 steps are useful...
    When I Sign out
    And I see "Sign in to the DARTS Portal" on the page
    And I am logged on to DARTS as a "REQUESTER" user
    And I click on the "Your transcripts" link
    Then I see "F{{seq}}001" in the same row as "With Transcriber"

    When I Sign out
    And I see "Sign in to the DARTS Portal" on the page
    And I am logged on to DARTS as a "TRANSCRIBER" user
    And I click on the "Your work" link
    And I click on "View" in the same row as "F{{seq}}001"
    Then I see "Requesting transcript Court Log for one minute of audio, please request audio if needed." in summary row for "Instructions"

    #DMP-1326-AC4 and DMP-1331-AC3 Cancel link
    When I click on the "Cancel" link
    And I see "To do" on the page
    And I click on "View" in the same row as "F{{seq}}001"
    #DMP-1326-AC2 and AC3 Upload transcript file and complete
    And I upload the file "file-sample_1MB.doc" at "Upload transcript file"
    And I press the "Attach file and complete" button
    Then I see "Transcript request complete" on the page

    #DMP-1331-AC2 Complete transcript request and checks

    When I click on the "Go to your work" link
    And I click on the "To do" link
    And I do not see "F{{seq}}001" on the page
    And I click on the "Completed today" link
    Then I see "F{{seq}}001" on the page

    #DMP-1351-AC3 View link on completed today screen

    When I click on "View" in the same row as "F{{seq}}001"
    Then I see "F{{seq}}001" in summary row for "Case ID"
    And I see "Court Log" in summary row for "Request type"
    And I see "Overnight" in summary row for "Urgency"
    And I see "Requesting transcript Court Log for one minute of audio, please request audio if needed." in summary row for "Instructions"
    And I see "Yes" in summary row for "Judge approval"

  #Continues from line 548 in other script

  @DMP-1198 @DMP-1255 @DMP-1351 @DMP-4129 @DMP-4318 @regression @sequential
  Scenario: Transcriber - Sortable Columns

    Given I am logged on to DARTS as a "TRANSCRIBER" user

    #DMP-1198-AC3 Sortable columns for Transcript Requests

    When I click on the "Transcript requests" link
    And I click on "Case ID" in the table header
    And "Case ID" has sort "ascending" icon
    And I click on "Courthouse" in the table header
    And "Courthouse" has sort "ascending" icon
    And I click on "Hearing date" in the table header
    And "Hearing date" has sort "descending" icon
    And I click on "Type" in the table header
    And "Type" has sort "ascending" icon
    And I click on "Requested on" in the table header
    And "Requested on" has sort "descending" icon
    And I click on "Approved on" in the table header
    #And "Approved on" has sort "descending" icon
    And I click on "Method" in the table header
    And "Method" has sort "ascending" icon
    And I click on "Urgency" in the table header
    And "Urgency" has sort "ascending" icon
    And I click on "Urgency" in the table header
    Then "Urgency" has sort "descending" icon

    #DMP-1351-AC2 Sortable columns for Completed today

    When I click on the "Your work" link
    And I click on the "Completed today" link
    And I click on "Case ID" in the table header
    And "Case ID" has sort "ascending" icon
    And I click on "Courthouse" in the table header
    And "Courthouse" has sort "ascending" icon
    And I click on "Hearing date" in the table header
    And "Hearing date" has sort "descending" icon
    And I click on "Type" in the table header
    And "Type" has sort "ascending" icon
    And I click on "Requested on" in the table header
    And "Requested on" has sort "descending" icon
    And I click on "Approved on" in the table header
    #And "Approved on" has sort "descending" icon
    And I click on "Urgency" in the table header
    Then "Urgency" has sort "ascending" icon

    #DMP-1255-AC2 Sortable columns for To do

    When I click on the "To do" link
    And I click on "Case ID" in the table header
    And "Case ID" has sort "ascending" icon
    And I click on "Courthouse" in the table header
    And "Courthouse" has sort "ascending" icon
    And I click on "Hearing date" in the table header
    And "Hearing date" has sort "descending" icon
    And I click on "Approved on" in the table header
    #And "Approved on" has sort "descending" icon
    And I click on "Type" in the table header
    And "Type" has sort "ascending" icon
    And I click on "Requested on" in the table header
    And "Requested on" has sort "descending" icon
    And I click on "Urgency" in the table header
    Then "Urgency" has sort "ascending" icon

  @DMP-1255-AC1 @later @sequential
  Scenario: Transcriber's Your Work - List all to do items

    Given I am logged on to DARTS as a "TRANSCRIBER" user
    When I click on the "Your work" link
    And I see "Your work" on the page
    Then I verify the HTML table contains the following values
      | Case ID       | Court          | Hearing date | Type        | Requested on      | Urgency  |
      | DMP1600-case1 | London_DMP1600 | 01 Dec 2023  | Antecedents | 06 Dec 2023 14:48 | *IGNORE* |
      | *IGNORE*      | *IGNORE*       | *IGNORE*     | *IGNORE*    | *IGNORE*          | *IGNORE* |
      | *IGNORE*      | *IGNORE*       | *IGNORE*     | *IGNORE*    | *IGNORE*          | *IGNORE* |
      | *IGNORE*      | *IGNORE*       | *IGNORE*     | *IGNORE*    | *IGNORE*          | *IGNORE* |
      | *IGNORE*      | *IGNORE*       | *IGNORE*     | *IGNORE*    | *IGNORE*          | *IGNORE* |

  @DMP-1255-AC4 @later @sequential
  Scenario Outline: Transcriber's Your Work -  View Link on automatic requests takes to Manual Transcript request
    Given I am logged on to DARTS as a "TRANSCRIBER" user
    When I click on the "Your work" link
    And I see "Your work" on the page
    Then I click on "View" in the same row as "<RequestedOn>"
    And I see "Case details" on the page
    And I see "<CaseID>" on the page
    And I see "<Courthouse>" on the page
    And I see "Request details" on the page
    And I see "<HearingDate>" on the page
    And I see "<RequestType>" on the page
    And I see "<RequestMethod>" on the page
    And I see "<RequestID>" on the page
    And I see "<urgency>" on the page
    And I see "<JudgeApproval>" on the page

    Examples:
      | CaseID        | Courthouse     | RequestType                    | urgency               | RequestMethod | RequestID | HearingDate | JudgeApproval | RequestedOn       |
      | DMP1600-case1 | London_DMP1600 | Summing up (including verdict) | Up to 12 working days | Automated     | 4013      | 11 Oct 2023 | Yes           | 05 Dec 2023 10:44 |

  @DMP-1353 @later @sequential
  Scenario: Check to ensure transcript request cannot be assigned to two different users

    Given I am logged on to DARTS as a "TRANSCRIBER" user
    When I click on the "Transcript requests" link
    And I click on "View" in the same row as "PerfCase_spqjobwugk"
    And I select the "Assign to me" radio button with label "Assign to me"
    And I press the "Continue" button
    Then I see "Your work" on the page
    And I see "PerfCase_spqjobwugk" on the page

    When I am logged on to DARTS as an "external" user
    And I click on the "Transcript requests" link
    Then I do not see "PerfCase_spqjobwugk" on the page

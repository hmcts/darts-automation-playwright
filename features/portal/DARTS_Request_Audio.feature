# TODO (DT): the tests in here could be combined to reduce the time significantly, avoiding authentication which is costly in time.
@portal @portal_request_audio
Feature: Request Audio

  @DMP-685 @DMP-651 @DMP-658 @DMP-696 @DMP-695 @DMP-686 @DMP-694 @DMP-1048 @DMP-2121 @DMP-2562 @DMP-4035 @regression
  Scenario: Request Audio data creation

    Given I create a case
      | courthouse         | courtroom  | case_number | defendants     | judges           | prosecutors         | defenders         |
      | HARROW CROWN COURT | B{{seq}}-6 | B{{seq}}006 | Def B{{seq}}-6 | Judge B{{seq}}-6 | testprosecutorsix   | testdefendersix   |
      | HARROW CROWN COURT | B{{seq}}-7 | B{{seq}}007 | Def B{{seq}}-7 | Judge B{{seq}}-7 | testprosecutorseven | testdefenderseven |
      | HARROW CROWN COURT | B{{seq}}-8 | B{{seq}}008 | Def B{{seq}}-8 | Judge B{{seq}}-8 | testprosecutoreight | testdefendereight |
      | HARROW CROWN COURT | B{{seq}}-9 | B{{seq}}009 | Def B{{seq}}-9 | Judge B{{seq}}-9 | testprosecutornine  | testdefendernine  |

    Given I authenticate from the "CPP" source system
    Given I create an event
      | message_id | type | sub_type | event_id   | courthouse         | courtroom  | case_numbers | event_text    | date_time              | case_retention_fixed_policy | case_total_sentence |
      | {{seq}}006 | 1100 |          | {{seq}}006 | HARROW CROWN COURT | B{{seq}}-6 | B{{seq}}006  | B{{seq}}ABC-6 | {{timestamp-10:00:00}} |                             |                     |
      | {{seq}}007 | 1100 |          | {{seq}}007 | HARROW CROWN COURT | B{{seq}}-7 | B{{seq}}007  | B{{seq}}ABC-7 | {{timestamp-10:00:00}} |                             |                     |
      | {{seq}}008 | 1100 |          | {{seq}}008 | HARROW CROWN COURT | B{{seq}}-8 | B{{seq}}008  | B{{seq}}ABC-8 | {{timestamp-10:00:00}} |                             |                     |
      | {{seq}}009 | 1100 |          | {{seq}}009 | HARROW CROWN COURT | B{{seq}}-9 | B{{seq}}009  | B{{seq}}ABC-9 | {{timestamp-10:00:00}} |                             |                     |

    When I load an audio file
      | courthouse         | courtroom  | case_numbers | date       | startTime | endTime  | audioFile   |
      | HARROW CROWN COURT | B{{seq}}-6 | B{{seq}}006  | {{date+0}} | 10:01:00  | 10:02:00 | sample1.mp2 |
      | HARROW CROWN COURT | B{{seq}}-7 | B{{seq}}007  | {{date+0}} | 10:01:00  | 10:02:00 | sample1.mp2 |
      | HARROW CROWN COURT | B{{seq}}-8 | B{{seq}}008  | {{date+0}} | 10:01:00  | 10:02:00 | sample1.mp2 |
      | HARROW CROWN COURT | B{{seq}}-9 | B{{seq}}009  | {{date+0}} | 10:01:00  | 10:02:00 | sample1.mp2 |

  @DMP-2300 @regression
  Scenario: Audio is not available to preview message.

    #NOTE: DMP-2300 NEEDS TO RUN STRAIGHT AFTER THE DATA CREATION TO GET THE PREVIEW MESSAGE
    Given I am logged on to DARTS as a "transcriber" user
    When I click on the "Search" link
    And I set "Case ID" to "B{{seq}}009"
    And I press the "Search" button
    # TODO (DT): remove redundant check for text in the same row, this case ID is unique
    # And I click on "B{{seq}}009" in the same row as "Harrow Crown Court"
    And I click on the "B{{seq}}009" link
    # And I click on "{{displaydate}}" in the same row as "{{seq}}-9"
    And I click on the "{{displaydate}}" link
    Then I see "{{seq}}ABC-9" on the page
    And I select the "Audio preview and events" radio button
    And I check the checkbox in the same row as "10:01:00 - 10:02:00" "Audio recording"
    Then I see "This audio is not currently available in DARTS, please try again later." on the page

  @DMP-685 @DMP-651 @DMP-658 @DMP-696 @DMP-695 @DMP-686 @DMP-1048 @regression
  Scenario: Request Audio with Request Type Playback Only

    Given I am logged on to DARTS as a "transcriber" user
    When I click on the "Search" link
    And I see "Search for a case" on the page
    And I set "Case ID" to "B{{seq}}006"
    And I press the "Search" button
    Then I verify the HTML table contains the following values
      | Case ID     | Courthouse         | Courtroom  | Judge(s)         | Defendant(s)   |
      | B{{seq}}006 | Harrow Crown Court | B{{seq}}-6 | JUDGE B{{seq}}-6 | Def B{{seq}}-6 |

    #Case Details
    # TODO (DT): remove redundant check for text in the same row, this case ID is unique
    When I click on the "B{{seq}}006" link
    # When I click on "B{{seq}}006" in the same row as "Harrow Crown Court"

    #Hearing Details
    And I click on the "{{displaydate}}" link
    # And I click on "{{displaydate}}" in the same row as "B{{seq}}-6"
    Then I see "Events and audio recordings" on the page
    And I see "B{{seq}}ABC-6" on the page

    When I check the checkbox in the same row as "10:01:00 - 10:02:00" "Audio recording"
    And I select the "Playback Only" radio button
    And I press the "Get Audio" button

    #Confirm your Order

    Then I see "Confirm your Order" on the page
    #And I see "<Restriction>" on the page
    And I see "Case details" on the page
    And I see "B{{seq}}006" on the page
    And I see "Harrow Crown Court" on the page
    And I see "Def B{{seq}}-6" on the page
    And I see "Audio details" on the page
    And I see "{{displaydate}}" on the page
    And I see "10:01:00" on the page
    And I see "10:02:00" on the page

    #Order Confirmation

    When I press the "Confirm" button
    Then I see "Your order is complete" on the page
    #And I see "<Restriction>" on the page
    And I see "B{{seq}}006" on the page
    And I see "Harrow Crown Court" on the page
    And I see "Def B{{seq}}-6" on the page
    And I see "{{displaydate}}" on the page
    And I see "10:01:00" on the page
    And I see "10:02:00" on the page
    And I see "We are preparing your audio." on the page
    And I see "When it is ready we will send an email to Transcriber and notify you in the DARTS application." on the page

  @DMP-685 @DMP-651 @DMP-658 @DMP-696 @DMP-695 @DMP-686 @DMP-1048 @regression
  Scenario: Request Audio with Request Type Download

    Given I am logged on to DARTS as a "transcriber" user
    When I click on the "Search" link
    And I see "Search for a case" on the page
    And I set "Case ID" to "B{{seq}}006"
    And I press the "Search" button
    Then I verify the HTML table contains the following values
      | Case ID     | Courthouse         | Courtroom  | Judge(s)         | Defendant(s)   |
      | B{{seq}}006 | Harrow Crown Court | B{{seq}}-6 | JUDGE B{{seq}}-6 | Def B{{seq}}-6 |

    #Case Details

    # TODO (DT): remove redundant check for text in the same row, this case ID is unique
    When I click on the "B{{seq}}006" link
    # When I click on "B{{seq}}006" in the same row as "Harrow Crown Court"

    #Hearing Details
    # And I click on "{{displaydate}}" in the same row as "B{{seq}}-6"
    And I click on the "{{displaydate}}" link
    Then I see "Events and audio recordings" on the page
    And I see "B{{seq}}ABC-6" on the page

    When I check the checkbox in the same row as "10:01:00 - 10:02:00" "Audio recording"
    And I select the "Download" radio button
    And I press the "Get Audio" button

    #Confirm your Order

    Then I see "Confirm your Order" on the page
    #And I see "<Restriction>" on the page
    And I see "Case details" on the page
    And I see "B{{seq}}006" on the page
    And I see "Harrow Crown Court" on the page
    And I see "Def B{{seq}}-6" on the page
    And I see "Audio details" on the page
    And I see "{{displaydate}}" on the page
    And I see "10:01:00" on the page
    And I see "10:02:00" on the page

    #Order Confirmation

    When I press the "Confirm" button
    Then I see "Your order is complete" on the page
    #And I see "<Restriction>" on the page
    And I see "B{{seq}}006" on the page
    And I see "Harrow Crown Court" on the page
    And I see "Def B{{seq}}-6" on the page
    And I see "{{displaydate}}" on the page
    And I see "10:01:00" on the page
    And I see "10:02:00" on the page
    And I see "We are preparing your audio." on the page
    And I see "When it is ready we will send an email to Transcriber and notify you in the DARTS application." on the page

  @DMP-685 @regression
  Scenario: Request Audio Confirm your Order Cancel link
    Given I am logged on to DARTS as a "transcriber" user
    When I click on the "Search" link
    And I set "Case ID" to "B{{seq}}006"
    And I press the "Search" button
    # TODO (DT): remove redundant check for text in the same row, this case ID is unique
    When I click on the "B{{seq}}006" link
    And I click on the "{{displaydate}}" link
    # And I click on "B{{seq}}006" in the same row as "Harrow Crown Court"
    # And I click on "{{displaydate}}" in the same row as "B{{seq}}-6"
    Then I see "B{{seq}}ABC-6" on the page

    When I select the "Audio preview and events" radio button
    And I check the checkbox in the same row as "10:01:00 - 10:02:00" "Audio recording"
    And I select the "Download" radio button
    And I press the "Get Audio" button
    And I see "Confirm your Order" on the page
    And I click on the "Cancel" link
    Then I see "B{{seq}}ABC-6" on the page

  @DMP-685 @regression
  Scenario: Request Audio Confirm Order Back link
    Given I am logged on to DARTS as a "transcriber" user
    When I click on the "Search" link
    And I set "Case ID" to "B{{seq}}006"
    And I press the "Search" button
    # TODO (DT): remove redundant check for text in the same row, this case ID is unique
    When I click on the "B{{seq}}006" link
    And I click on the "{{displaydate}}" link
    # And I click on "B{{seq}}006" in the same row as "Harrow Crown Court"
    # And I click on "{{displaydate}}" in the same row as "B{{seq}}-6"
    Then I see "B{{seq}}ABC-6" on the page

    When I select the "Audio preview and events" radio button
    And I check the checkbox in the same row as "10:01:00 - 10:02:00" "Audio recording"
    And I select the "Download" radio button
    And I press the "Get Audio" button
    And I see "Confirm your Order" on the page
    And I click on the "Back" link
    Then I see "B{{seq}}ABC-6" on the page

  @DMP-694 @regression
  Scenario: Request Audio Error Messages
    Given I am logged on to DARTS as a "transcriber" user
    When I click on the "Search" link
    And I set "Case ID" to "B{{seq}}006"
    And I press the "Search" button
    # TODO (DT): remove redundant check for text in the same row, this case ID is unique
    When I click on the "B{{seq}}006" link
    And I click on the "{{displaydate}}" link
    # And I click on "B{{seq}}006" in the same row as "Harrow Crown Court"
    # And I click on "{{displaydate}}" in the same row as "B{{seq}}-6"
    Then I see "B{{seq}}ABC-6" on the page

    When I press the "Get Audio" button
    Then I see "You must include a start time for your audio recording" on the page
    And I see "You must include an end time for your audio recording" on the page
    And I see "You must select a request type" on the page

  @DMP-694 @regression
  Scenario: Request Audio request type error message
    Given I am logged on to DARTS as a "transcriber" user
    When I click on the "Search" link
    And I set "Case ID" to "B{{seq}}006"
    And I press the "Search" button
    # TODO (DT): remove redundant check for text in the same row, this case ID is unique
    When I click on the "B{{seq}}006" link
    And I click on the "{{displaydate}}" link
    # And I click on "B{{seq}}006" in the same row as "Harrow Crown Court"
    # And I click on "{{displaydate}}" in the same row as "B{{seq}}-6"
    Then I see "B{{seq}}ABC-6" on the page

    When I select the "Audio preview and events" radio button
    And I check the checkbox in the same row as "10:01:00 - 10:02:00" "Audio recording"
    And I press the "Get Audio" button
    Then I see "You must select a request type" on the page

  @DMP-686 @regression
  Scenario: Order Confirmation - Return to hearing date link
    Given I am logged on to DARTS as a "transcriber" user
    When I click on the "Search" link
    And I set "Case ID" to "B{{seq}}008"
    And I press the "Search" button
    # TODO (DT): remove redundant check for text in the same row, this case ID is unique
    When I click on the "B{{seq}}008" link
    And I click on the "{{displaydate}}" link
    # And I click on "B{{seq}}008" in the same row as "Harrow Crown Court"
    # And I click on "{{displaydate}}" in the same row as "B{{seq}}-8"
    Then I see "B{{seq}}ABC-8" on the page

    When I select the "Audio preview and events" radio button
    And I check the checkbox in the same row as "10:01:00 - 10:02:00" "Audio recording"
    And I select the "Download" radio button
    And I press the "Get Audio" button
    Then I see "Confirm your Order" on the page

    When I press the "Confirm" button
    Then I see "Your order is complete" on the page
    And I click on the "Return to hearing date" link
    And I see "B{{seq}}ABC-8" on the page

  @DMP-686 @regression
  Scenario: Order Confirmation - Back to search results link
    Given I am logged on to DARTS as a "transcriber" user
    When I click on the "Search" link
    And I set "Case ID" to "B{{seq}}007"
    And I press the "Search" button
    # TODO (DT): remove redundant check for text in the same row, this case ID is unique
    When I click on the "B{{seq}}007" link
    And I click on the "{{displaydate}}" link
    # And I click on "B{{seq}}007" in the same row as "Harrow Crown Court"
    # And I click on "{{displaydate}}" in the same row as "B{{seq}}-7"
    Then I see "B{{seq}}ABC-7" on the page

    When I select the "Audio preview and events" radio button
    And I check the checkbox in the same row as "10:01:00 - 10:02:00" "Audio recording"
    And I select the "Download" radio button
    And I press the "Get Audio" button
    Then I see "Confirm your Order" on the page

    When I press the "Confirm" button
    And I see "Your order is complete" on the page
    And I click on the "Back to search results" link
    Then I see "Search for a case" on the page

  @DMP-695 @regression
  Scenario: Request Audio by setting Start Time and End Time

    #Manually enter in Start Time and End Time

    Given I am logged on to DARTS as a "transcriber" user
    When I click on the "Search" link
    And I set "Case ID" to "B{{seq}}009"
    And I press the "Search" button
    # TODO (DT): remove redundant check for text in the same row, this case ID is unique
    When I click on the "B{{seq}}009" link
    And I click on the "{{displaydate}}" link
    # And I click on "B{{seq}}009" in the same row as "Harrow Crown Court"
    # And I click on "{{displaydate}}" in the same row as "B{{seq}}-9"
    Then I see "B{{seq}}ABC-9" on the page

    When I select the "Audio preview and events" radio button
    And I set the time fields of "Start Time" to "10:01:00"
    And I set the time fields of "End Time" to "10:02:00"
    And I select the "Playback Only" radio button
    And I press the "Get Audio" button

    #Confirm your Order

    Then I see "Confirm your Order" on the page
    And I see "Case details" on the page
    And I see "B{{seq}}009" on the page
    And I see "Harrow Crown Court" on the page
    And I see "Def B{{seq}}-9" on the page
    And I see "Audio details" on the page
    And I see "{{displaydate}}" on the page
    And I see "10:01:00" on the page
    And I see "10:02:00" on the page

    #Order Confirmation

    When I press the "Confirm" button
    Then I see "Your order is complete" on the page
    And I see "B{{seq}}009" on the page
    And I see "Harrow Crown Court" on the page
    And I see "Def B{{seq}}-9" on the page
    And I see "{{displaydate}}" on the page
    And I see "10:01:00" on the page
    And I see "10:02:00" on the page
    And I see "We are preparing your audio." on the page
    And I see "When it is ready we will send an email to Transcriber and notify you in the DARTS application." on the page

  @DMP-658 @regression
  Scenario Outline: Request Audio Events only available for hearing
    Given I am logged on to DARTS as an "external" user
    And I click on the "Search" link
    And I see "Search for a case" on the page
    And I set "Case ID" to "Case1010"
    And I press the "Search" button
    Then I verify the HTML table contains the following values
      | Case ID  | Courthouse | Courtroom | Judge(s) | Defendant(s) |
      | CASE1010 | Swansea    | ROOM_A    | Mr Judge | Jow Bloggs   |

    #Case Details

    When I click on "CASE1010" in the same row as "Swansea"

    #Hearing Details

    Then I click on "16 Aug 2023" in the same row as "ROOM_A"
    And I see "Swansea" on the page
    And I see "ROOM_A" on the page

    When I select the "Events only" radio button
    And I check the checkbox in the same row as "<StartTime>" "Interpreter sworn-in"
    And I set the time fields below "End Time" to "<EndTime>"
    And I select the "Playback Only" radio button
    And I press the "Get Audio" button

    #Confirm your Order

    Then I see "Confirm your Order" on the page
    # And I see "<Restriction>" on the page
    And I see "Case details" on the page
    And I see "<CaseID>" on the page
    And I see "<Courthouse>" on the page
    And I see "<Defendants>" on the page
    And I see "Audio details" on the page
    And I see "<HearingDate>" on the page
    And I see "<StartTime>" on the page
    And I see "<EndTime>" on the page
    And I press the "Confirm" button

    #Order Confirmation

    Then I see "Your order is complete" on the page
    # And I see "<Restriction>" on the page
    And I see "<CaseID>" on the page
    And I see "<Courthouse>" on the page
    And I see "<Defendants>" on the page
    And I see "<HearingDate>" on the page
    And I see "<StartTime>" on the page
    And I see "<EndTime>" on the page
    And I see "We are preparing your audio." on the page
    And I see "When it is ready we will send an email to" on the page
    Examples:
      | CaseID   | Courthouse | Defendants | HearingDate | StartTime | EndTime  |
      | CASE1010 | Swansea    | Jow Bloggs | 16 Aug 2023 | 11:44:01  | 11:45:01 |

  @DMP-692 @regression
  Scenario Outline: Preview Audio Player Loading
    Given I am logged on to DARTS as an "external" user
    And I click on the "Search" link
    And I see "Search for a case" on the page
    And I set "Case ID" to "Case1010"
    And I press the "Search" button
    Then I verify the HTML table contains the following values
      | Case ID  | Courthouse | Courtroom | Judge(s) | Defendant(s) |
      | CASE1010 | Swansea    | ROOM_A    | Mr Judge | Jow Bloggs   |

    #Case Details

    When I click on "CASE1010" in the same row as "Swansea"

    #Hearing Details

    Then I click on "16 Aug 2023" in the same row as "ROOM_A"
    And I see "Swansea" on the page
    And I see "ROOM_A" on the page

    When I select the "Audio preview and events" radio button
    And I click on "Play preview" in the same row as "<StartTime> - <EndTime>"
    Then I see "<Text>" in the same row as "<StartTime> - <EndTime>"
    Examples:
      | StartTime | EndTime  | Text            |
      #    | 11:00:00  | 12:14:05 | Loading preview |
      | 15:00:00  | 15:01:00 | Loading preview |

  @DMP-966 @regression
  Scenario: Hearing table sorted with time
    Given I am logged on to DARTS as an "external" user
    And I click on the "Search" link
    And I see "Search for a case" on the page
    And I set "Case ID" to "Case1010"
    And I press the "Search" button
    Then I verify the HTML table contains the following values
      | Case ID  | Courthouse | Courtroom | Judge(s) | Defendant(s) |
      | CASE1010 | Swansea    | ROOM_A    | Mr Judge | Jow Bloggs   |

    #Case Details

    When I click on "CASE1010" in the same row as "Swansea"

    #Hearing Details

    And I click on "16 Aug 2023" in the same row as "ROOM_A"
    And I see "Swansea" on the page
    And I see "ROOM_A" on the page
    # TODO (DT): changed "Play preview" to "No audio found. Preview not available." for 0 second audio
    Then I verify the HTML table contains the following values
      | *NO-CHECK* | Time                | Event                | Text                                   |
      | *NO-CHECK* | 11:00:00 - 12:14:05 | Audio recording      | Play preview                           |
      | *NO-CHECK* | 11:33:23 - 11:33:23 | Audio recording      | No audio found. Preview not available. |
      | *NO-CHECK* | 11:44:01            | Interpreter sworn-in | Some event                             |
      | *NO-CHECK* | 14:00:00 - 14:01:00 | Audio recording      | Play preview                           |
      | *NO-CHECK* | 15:00:00 - 15:01:00 | Audio recording      | Play preview                           |

    When I click on "Time" in the table header
    Then I verify the HTML table contains the following values
      | *NO-CHECK* | Time                | Event                | Text                                   |
      | *NO-CHECK* | 15:00:00 - 15:01:00 | Audio recording      | Play preview                           |
      | *NO-CHECK* | 14:00:00 - 14:01:00 | Audio recording      | Play preview                           |
      | *NO-CHECK* | 11:44:01            | Interpreter sworn-in |                                        |
      | *NO-CHECK* | 11:33:23 - 11:33:23 | Audio recording      | No audio found. Preview not available. |
      | *NO-CHECK* | 11:00:00 - 12:14:05 | Audio recording      | Play preview                           |

  @DMP-2121
  Scenario: Update preview button on hearing screen
    Given I am logged on to DARTS as a "requester" user
    When I click on the "Search" link
    And I set "Case ID" to "B{{seq}}006"
    And I press the "Search" button
    And I click on "B{{seq}}006" in the same row as "Harrow Crown Court"
    And I click on "{{displaydate}}" in the same row as "{{seq}}-6"
    And I see "{{seq}}ABC-6" on the page
    Then I see "Play preview" on the page

Feature: Annotation

  @DMP-1614 @DMP-1616 @DMP-1612 @DMP-1508 @DMP-1508-AC7-AC8 @DMP-1508-AC8-Approver @DMP-1623 @DMP-1552-AC1-AC4-AC7 @DMP-1552-AC9 @DMP-2246 @DMP-2639-AC1 @regression @sequential
  Scenario: Annotation data creation
    Given I create a case
      | courthouse         | case_number | defendants     | judges           | prosecutors            | defenders            |
      | HARROW CROWN COURT | K{{seq}}002 | Def {{seq}}-29 | Judge {{seq}}-29 | testprosecutorsix      | testdefendersix      |
      | HARROW CROWN COURT | K{{seq}}003 | Def {{seq}}-30 | Judge {{seq}}-30 | testprosecutorsevem    | testdefenderseven    |
      | HARROW CROWN COURT | K{{seq}}004 | Def {{seq}}-31 | Judge {{seq}}-31 | testprosecutoreight    | testdefendereight    |
      | HARROW CROWN COURT | K{{seq}}005 | Def {{seq}}-32 | Judge {{seq}}-32 | testprosecutornine     | testdefendernine     |
      | HARROW CROWN COURT | K{{seq}}006 | Def {{seq}}-33 | Judge {{seq}}-33 | testprosecutorten      | testdefenderten      |
      | HARROW CROWN COURT | K{{seq}}007 | Def {{seq}}-34 | Judge {{seq}}-34 | testprosecutoreleven   | testdefendereleven   |
      | HARROW CROWN COURT | K{{seq}}008 | Def {{seq}}-35 | Judge {{seq}}-35 | testprosecutortwelve   | testdefendertwelve   |
      | HARROW CROWN COURT | K{{seq}}009 | Def {{seq}}-36 | Judge {{seq}}-36 | testprosecutorthirteen | testdefenderthirteen |
      | HARROW CROWN COURT | K{{seq}}010 | Def {{seq}}-37 | Judge {{seq}}-37 | testprosecutorfourteen | testdefenderfourteen |
      | HARROW CROWN COURT | K{{seq}}011 | Def {{seq}}-38 | Judge {{seq}}-38 | testprosecutorfifteen  | testdefenderfifteen  |
      | HARROW CROWN COURT | K{{seq}}012 | Def {{seq}}-39 | Judge {{seq}}-39 | testprosecutorsixteen  | testdefendersixteen  |

    Given I authenticate from the "CPP" source system
    Given I create an event
      | message_id | type | sub_type | event_id   | courthouse         | courtroom  | case_numbers | event_text | date_time              | case_retention_fixed_policy | case_total_sentence |
      | {{seq}}001 | 1100 |          | {{seq}}167 | HARROW CROWN COURT | {{seq}}-29 | K{{seq}}002  | {{seq}}KH1 | {{timestamp-10:00:00}} |                             |                     |
      | {{seq}}001 | 1100 |          | {{seq}}167 | HARROW CROWN COURT | {{seq}}-30 | K{{seq}}003  | {{seq}}KH1 | {{timestamp-10:00:00}} |                             |                     |
      | {{seq}}001 | 1100 |          | {{seq}}167 | HARROW CROWN COURT | {{seq}}-31 | K{{seq}}004  | {{seq}}KH1 | {{timestamp-10:00:00}} |                             |                     |
      | {{seq}}001 | 1100 |          | {{seq}}167 | HARROW CROWN COURT | {{seq}}-32 | K{{seq}}005  | {{seq}}KH1 | {{timestamp-10:00:00}} |                             |                     |
      | {{seq}}001 | 1100 |          | {{seq}}167 | HARROW CROWN COURT | {{seq}}-33 | K{{seq}}006  | {{seq}}KH1 | {{timestamp-10:00:00}} |                             |                     |
      | {{seq}}001 | 1100 |          | {{seq}}167 | HARROW CROWN COURT | {{seq}}-34 | K{{seq}}007  | {{seq}}KH1 | {{timestamp-10:00:00}} |                             |                     |
      | {{seq}}001 | 1100 |          | {{seq}}167 | HARROW CROWN COURT | {{seq}}-35 | K{{seq}}008  | {{seq}}KH1 | {{timestamp-10:00:00}} |                             |                     |
      | {{seq}}001 | 1100 |          | {{seq}}167 | HARROW CROWN COURT | {{seq}}-36 | K{{seq}}009  | {{seq}}KH1 | {{timestamp-10:00:00}} |                             |                     |
      | {{seq}}001 | 1100 |          | {{seq}}167 | HARROW CROWN COURT | {{seq}}-37 | K{{seq}}010  | {{seq}}KH1 | {{timestamp-10:00:00}} |                             |                     |
      | {{seq}}001 | 1100 |          | {{seq}}167 | HARROW CROWN COURT | {{seq}}-38 | K{{seq}}011  | {{seq}}KH1 | {{timestamp-10:00:00}} |                             |                     |
      | {{seq}}001 | 1100 |          | {{seq}}167 | HARROW CROWN COURT | {{seq}}-39 | K{{seq}}012  | {{seq}}KH1 | {{timestamp-10:00:00}} |                             |                     |

  @DMP-1614 @regression @sequential
  Scenario: Annotation template

    Given I am logged on to DARTS as a "JUDGE" user
    When I click on the "Search" link
    And I see "Search for a case" on the page
    And I set "Case ID" to "K{{seq}}002"
    And I press the "Search" button
    And I click on the "K{{seq}}002" link
    And I click on the "{{displaydate}}" link
    And I click on the "Annotations" link
    And I press the "Download annotation template" button

  @DMP-1616 @regression @sequential
  Scenario: Add annotation screen

    Given I am logged on to DARTS as a "JUDGE" user
    #Upload Annotation
    When I click on the "Search" link
    And I see "Search for a case" on the page
    And I set "Case ID" to "K{{seq}}003"
    And I press the "Search" button
    And I click on the "K{{seq}}003" link
    And I click on the "{{displaydate}}" link
    And I click on the "Annotations" link
    And I press the "Upload annotation" button
    Then I upload the file "file-sample_1MB.doc" at "Upload annotation file"
    #Cancel Upload
    Then I click on the "Cancel" link

  #Upload Comment
  #And I set "Comments" to "AC3"
  #Then I see "You have 197 characters remaining" on the page

  @DMP-1612 @regression @sequential
  Scenario: Delete annotation screen

    Given I am logged on to DARTS as a "JUDGE" user
    #Upload Annotation
    When I click on the "Search" link
    And I see "Search for a case" on the page
    And I set "Case ID" to "K{{seq}}004"
    And I press the "Search" button
    And I click on the "K{{seq}}004" link
    And I click on the "{{displaydate}}" link
    And I click on the "Annotations" link
    And I press the "Upload annotation" button
    Then I upload the file "file-sample_1MB.doc" at "Upload annotation file"
    And I press the "Upload" button with exact name
    # TODO (DT): Added for extra verification
    And I see "You have added an annotation" on the page
    And I press the "back" button on my browser

    #Cancel Annotation
    And I click on the "Annotations" link
    And I click on the "Delete" link
    And I see "Are you sure you want to delete this item?" on the page
    Then I click on the "Cancel" link

    #Delete Annotation
    And  I click on the "Delete" link
    And I see "Are you sure you want to delete this item?" on the page
    Then I press the "Yes - delete" button

  @DMP-1508 @regression @sequential
  Scenario: Add All Annotations to Case File screen

    Given I am logged on to DARTS as a "JUDGE" user
    #Upload Annotation
    When I click on the "Search" link
    And I see "Search for a case" on the page
    And I set "Case ID" to "K{{seq}}005"
    And I press the "Search" button
    And I click on the "K{{seq}}005" link
    And I click on the "{{displaydate}}" link
    And I click on the "Annotations" link
    And I press the "Upload annotation" button
    Then I upload the file "file-sample_1MB.doc" at "Upload annotation file"
    And I press the "Upload" button with exact name
    # TODO (DT): Added for extra verification
    And I see "You have added an annotation" on the page
    And I press the "back" button on my browser

    #Judge to view documents uploaded by themselves
    And I click on the breadcrumb link "K{{seq}}005"
    And I click on the "All annotations" link
    # TODO (DT): amended value to be CSS ID of the table
    Then I verify the HTML table "annotationsTable" contains the following values
      | Hearing date | File name | Format   | Date created | Comments |
      | *IGNORE*     | *IGNORE*  | *IGNORE* | *IGNORE*     | *IGNORE* |

    #Hyperlink hearing date takes user to hearing
    And I click on the "{{displaydate}}" link
    Then I see "Upload annotation" on the page

  @DMP-1508-AC7-AC8 @regression @sequential
  Scenario: 1508 No annotations for a case (or visible for a particular judge user)

    Given I am logged on to DARTS as a "JUDGE" user
    When I click on the "Search" link
    And I see "Search for a case" on the page
    And I set "Case ID" to "K{{seq}}006"
    And I press the "Search" button
    And I click on the "K{{seq}}006" link
    And I click on the "All annotations" link
    Then I see "There are no annotations for this case. Annotations added to hearings will be listed here." on the page

  @DMP-1508-AC8-Approver @regression @sequential
  Scenario: All other users cannot see annotations

    Given I am logged on to DARTS as an "Approver" user
    When I click on the "Search" link
    And I see "Search for a case" on the page
    And I set "Case ID" to "K{{seq}}007"
    And I press the "Search" button
    And I click on the "K{{seq}}007" link
    Then I do not see "All annotations" on the page

  @DMP-1623 @regression @sequential
  Scenario: Add annotation confirmation screen

    Given I am logged on to DARTS as a "JUDGE" user
    #Upload Annotation
    When I click on the "Search" link
    And I see "Search for a case" on the page
    And I set "Case ID" to "K{{seq}}008"
    And I press the "Search" button
    And I click on the "K{{seq}}008" link
    And I click on the "{{displaydate}}" link
    And I click on the "Annotations" link
    And I press the "Upload annotation" button
    And I upload the file "file-sample_1MB.doc" at "Upload annotation file"
    And I press the "Upload" button with exact name
    Then I see "You have added an annotation" on the page

  @DMP-1552-AC1-AC4-AC7 @regression @sequential
  Scenario: Add Annotations to Hearing details screen

    Given I am logged on to DARTS as a "JUDGE" user
    #Upload Annotation
    When I click on the "Search" link
    And I see "Search for a case" on the page
    And I set "Case ID" to "K{{seq}}009"
    And I press the "Search" button
    And I click on the "K{{seq}}009" link
    And I click on the "{{displaydate}}" link
    And I click on the "Annotations" link
    And I press the "Upload annotation" button
    Then I upload the file "file-sample_1MB.doc" at "Upload annotation file"
    And I press the "Upload" button with exact name
    # TODO (DT): Added for extra verification
    And I see "You have added an annotation" on the page
    And I press the "back" button on my browser

    #AC1 Check Annotation tab for judge/admin
    Then I see "Annotations" on the page

    #AC4 Judge to view documents uploaded by themselves
    And I click on the "Annotations" link
    Then I see "Word Document" on the page

    #AC7 Judge/Admin can download individual document
    Then I click on the "Download" link

  @DMP-1552-AC9 @regression @sequential
  Scenario:  No annotations for a case (or visible for a particular judge user)

    Given I am logged on to DARTS as a "JUDGE" user
    #No annotations for a case (or visible for a particular judge user
    When I click on the "Search" link
    And I see "Search for a case" on the page
    And I set "Case ID" to "K{{seq}}010"
    And I press the "Search" button
    And I click on the "K{{seq}}010" link
    And I click on the "{{displaydate}}" link
    And I click on the "Annotations" link
    Then I see "There are no annotations for this hearing." on the page

  @DMP-2246 @regression @sequential
  Scenario: Download Annotation Document

    Given I am logged on to DARTS as a "JUDGE" user
    When I click on the "Search" link
    And I see "Search for a case" on the page
    And I set "Case ID" to "K{{seq}}011"
    And I press the "Search" button
    And I click on the "K{{seq}}011" link
    And I click on the "{{displaydate}}" link
    And I click on the "Annotations" link
    And I press the "Upload annotation" button
    And I upload the file "file-sample_1MB.doc" at "Upload annotation file"
    And I press the "Upload" button with exact name
    # TODO (DT): Added for extra verification
    And I see "You have added an annotation" on the page
    And I click on the "Return to hearing level" link
    And I click on the "Annotations" link
    Then I click on the "Download" link

  @DMP-2456 @regression @sequential
  Scenario: Delete annotation from case screen

    Given I am logged on to DARTS as a "JUDGE" user
    #Upload Annotation
    When I click on the "Search" link
    And I see "Search for a case" on the page
    And I set "Case ID" to "K{{seq}}012"
    And I press the "Search" button
    And I click on the "K{{seq}}012" link
    And I click on the "{{displaydate}}" link
    And I click on the "Annotations" link
    And I press the "Upload annotation" button
    Then I upload the file "file-sample_1MB.doc" at "Upload annotation file"
    And I press the "Upload" button with exact name
    # TODO (DT): Added for extra verification
    And I see "You have added an annotation" on the page
    And I press the "back" button on my browser

    #Cancel Annotation
    And I click on the breadcrumb link "K{{seq}}012"
    And  I click on the "All annotations" link
    And  I click on the "Delete" link
    And I see "Are you sure you want to delete this item?" on the page
    Then I click on the "Cancel" link

    #Delete Annotation
    And  I click on the "Delete" link
    And I see "Are you sure you want to delete this item?" on the page
    Then I press the "Yes - delete" button

  @DMP-2639 @regression @sequential
  Scenario: Fetch annotations for super admin

    Given I am logged on to DARTS as a "ADMIN" user
    When I click on the "Search" link
    And I see "Search for a case" on the page
    And I set "Case ID" to "K{{seq}}002"
    And I press the "Search" button
    And I click on the "K{{seq}}002" link
    And I see "Hearings" on the page
    And I see "All Transcripts" on the page
    And I see "All annotations" on the page
    And I click on the "{{displaydate}}" link
    And I click on the "Annotations" link
    And I press the "Upload annotation" button
    Then I upload the file "file-sample_1MB.doc" at "Upload annotation file"
    And I press the "Upload" button with exact name
    Then I see "You have added an annotation" on the page
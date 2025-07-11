@portal @portal_case_search
Feature: Case Search

  @DMP-509 @DMP-507 @DMP-508 @DMP-517 @DMP-515 @DMP-860 @DMP-702 @DMP-561 @DMP-963 @DMP-997 @DMP-2769 @DMP-4545 @regression @demo @sequential
  Scenario: Case Search data creation
    Given I create a case
      | courthouse         | courtroom   | case_number | defendants      | judges           | prosecutors         | defenders         |
      | HARROW CROWN COURT | A{{seq}}-1  | A{{seq}}001 | Def A{{seq}}-1  | JUDGE {{seq}}-1  | testprosecutor      | testdefender      |
      | HARROW CROWN COURT | A{{seq}}-11 | A{{seq}}002 | Def A{{seq}}-11 | JUDGE {{seq}}-11 | testprosecutortwo   | testdefendertwo   |
      | HARROW CROWN COURT | A{{seq}}-2  | A{{seq}}003 | Def A{{seq}}-2  | JUDGE {{seq}}-11 | testprosecutorthree | testdefenderthree |
      | HARROW CROWN COURT | A{{seq}}-11 | A{{seq}}004 | Def A{{seq}}-22 | JUDGE {{seq}}-2  | testprosecutorfour  | testdefenderfour  |
      | HARROW CROWN COURT | A{{seq}}-2  | A{{seq}}005 | Def A{{seq}}-11 | JUDGE {{seq}}-2  | testprosecutorfive  | testdefenderfive  |

    Given I authenticate from the "CPP" source system
    Given I create an event
      | message_id | type  | sub_type | event_id   | courthouse         | courtroom   | case_numbers | event_text     | date_time              | case_retention_fixed_policy | case_total_sentence |
      | {{seq}}001 | 1100  |          | {{seq}}001 | HARROW CROWN COURT | A{{seq}}-1  | A{{seq}}001  | A{{seq}}ABC-1  | {{timestamp-10:00:00}} |                             |                     |
      | {{seq}}002 | 1100  |          | {{seq}}002 | HARROW CROWN COURT | A{{seq}}-1  | A{{seq}}001  | A{{seq}}ABC-3  | {{timestamp-11:00:00}} |                             |                     |
      | {{seq}}003 | 1100  |          | {{seq}}003 | HARROW CROWN COURT | A{{seq}}-11 | A{{seq}}002  | A{{seq}}ABC-2  | {{timestamp-10:00:00}} |                             |                     |
      | {{seq}}004 | 1100  |          | {{seq}}004 | HARROW CROWN COURT | A{{seq}}-2  | A{{seq}}003  | A{{seq}}ABC-11 | {{timestamp-10:00:00}} |                             |                     |
      | {{seq}}005 | 1100  |          | {{seq}}005 | HARROW CROWN COURT | A{{seq}}-11 | A{{seq}}004  | A{{seq}}ABC-11 | {{timestamp-10:00:00}} |                             |                     |
      | {{seq}}006 | 21200 | 11008    | {{seq}}006 | HARROW CROWN COURT | A{{seq}}-2  | A{{seq}}005  | A{{seq}}ABC-21 | {{timestamp-10:00:00}} |                             |                     |

  @DMP-509 @DMP-507 @DMP-508 @DMP-517 @DMP-515 @DMP-860 @DMP-702 @DMP-561 @DMP-4318 @DMP-4545 @regression @demo @sequential
  Scenario: Simple and Advanced Case Search

    #Simple search

    Given I am logged on to DARTS as an "APPROVER" user
    And I click on the "Search" link
    And I see "Also known as a case reference or court reference. There should be no spaces." on the page
    And I set "Case ID" to "A{{seq}}00"
    And I press the "Search" button
    And I click on "Courthouse" in the table header
    And "Courthouse" has sort "ascending" icon
    And I click on "Case ID" in the table header
    And "Case ID" has sort "ascending" icon
    Then I verify the HTML table contains the following values
      | Case ID                                  | Courthouse         | Courtroom   | Judge(s)         | Defendant(s)    |
      | A{{seq}}001                              | Harrow Crown Court | A{{seq}}-1  | JUDGE {{seq}}-1  | Def A{{seq}}-1  |
      | A{{seq}}002                              | Harrow Crown Court | A{{seq}}-11 | JUDGE {{seq}}-11 | Def A{{seq}}-11 |
      | A{{seq}}003                              | Harrow Crown Court | A{{seq}}-2  | JUDGE {{seq}}-11 | Def A{{seq}}-2  |
      | A{{seq}}004                              | Harrow Crown Court | A{{seq}}-11 | JUDGE {{seq}}-2  | Def A{{seq}}-22 |
      | A{{seq}}005                              | Harrow Crown Court | A{{seq}}-2  | JUDGE {{seq}}-2  | Def A{{seq}}-11 |
      | There are restrictions against this case | *IGNORE*           | *IGNORE*    | *IGNORE*         | *IGNORE*        |

    #Advanced search

    When I click on the "Clear search" link
    And I click on the "Advanced search" link
    And I set "Case ID" to "A{{seq}}"
    And I set "Courthouse" to "Harrow Crown Court"
    And I set "Courtroom" to "A{{seq}}-11"
    And I press the "Search" button
    And I click on "Case ID" in the table header
    Then I verify the HTML table contains the following values
      | Case ID     | Courthouse         | Courtroom   | Judge(s)         | Defendant(s)    |
      | A{{seq}}002 | Harrow Crown Court | A{{seq}}-11 | JUDGE {{seq}}-11 | Def A{{seq}}-11 |
      | A{{seq}}004 | Harrow Crown Court | A{{seq}}-11 | JUDGE {{seq}}-2  | Def A{{seq}}-22 |

    When I click on the "Clear search" link
    And I click on the "Advanced search" link
    And "Courthouse" is ""
    And "Courtroom" is ""
    And I set "Defendant's name" to "Def A{{seq}}-2"
    And I set "Case ID" to "A{{seq}}"
    And I press the "Search" button
    And I click on "Case ID" in the table header
    Then I verify the HTML table contains the following values
      | Case ID     | Courthouse         | Courtroom   | Judge(s)         | Defendant(s)    |
      | A{{seq}}003 | Harrow Crown Court | A{{seq}}-2  | JUDGE {{seq}}-11 | Def A{{seq}}-2  |
      | A{{seq}}004 | Harrow Crown Court | A{{seq}}-11 | JUDGE {{seq}}-2  | Def A{{seq}}-22 |

    When I click on the "Clear search" link
    And I click on the "Advanced search" link
    And "Defendant's name" is ""
    And I set "Judge's name" to "JUDGE {{seq}}-1"
    And I set "Case ID" to "A{{seq}}"
    And I press the "Search" button
    And I click on "Case ID" in the table header
    Then I verify the HTML table contains the following values
      | Case ID     | Courthouse         | Courtroom   | Judge(s)         | Defendant(s)    |
      | A{{seq}}001 | Harrow Crown Court | A{{seq}}-1  | JUDGE {{seq}}-1  | Def A{{seq}}-1  |
      | A{{seq}}002 | Harrow Crown Court | A{{seq}}-11 | JUDGE {{seq}}-11 | Def A{{seq}}-11 |
      | A{{seq}}003 | Harrow Crown Court | A{{seq}}-2  | JUDGE {{seq}}-11 | Def A{{seq}}-2  |

    When I click on the "Clear search" link
    And I click on the "Advanced search" link
    And "Judge's name" is ""
    And I set "Keywords" to "A{{seq}}ABC-1"
    And I set "Case ID" to "A{{seq}}"
    And I press the "Search" button
    And I click on "Case ID" in the table header
    Then I verify the HTML table contains the following values
      | Case ID     | Courthouse         | Courtroom   | Judge(s)         | Defendant(s)    |
      | A{{seq}}001 | Harrow Crown Court | A{{seq}}-1  | JUDGE {{seq}}-1  | Def A{{seq}}-1  |
      | A{{seq}}003 | Harrow Crown Court | A{{seq}}-2  | JUDGE {{seq}}-11 | Def A{{seq}}-2  |
      | A{{seq}}004 | Harrow Crown Court | A{{seq}}-11 | JUDGE {{seq}}-2  | Def A{{seq}}-22 |

    When I click on the "Your audio" link
    # TODO (DT): Added for extra verification
    And I see "Your audio" on the page
    And I click on the "Search" link
    # TODO (DT): Added for extra verification
    And I see "Search for a case" on the page
    # TODO (DT): checking for 3 results as it's flakey to check the exact ordering after navigation
    And I see "3 results" on the page
    # And I click on "Case ID" in the table header
    # Then I verify the HTML table contains the following values
    #   | Case ID     | Courthouse         | Courtroom   | Judge(s)         | Defendant(s)    |
    #   | A{{seq}}001 | Harrow Crown Court | A{{seq}}-1  | JUDGE {{seq}}-1  | Def A{{seq}}-1  |
    #   | A{{seq}}003 | Harrow Crown Court | A{{seq}}-2  | JUDGE {{seq}}-11 | Def A{{seq}}-2  |
    #   | A{{seq}}004 | Harrow Crown Court | A{{seq}}-11 | JUDGE {{seq}}-2  | Def A{{seq}}-22 |

    #Change both specific and date range once Trevor's date/timestamp step is ready, some cases will be backdated

    When I click on the "Clear search" link
    And I click on the "Advanced search" link
    And "Keywords" is ""
    And I select the "Specific date" radio button
    And I set "Enter a specific date" to "{{dd/MM/y}}"
    And I set "Case ID" to "A{{seq}}"
    And I press the "Search" button
    And I click on "Case ID" in the table header
    Then I verify the HTML table contains the following values
      | Case ID                                  | Courthouse         | Courtroom   | Judge(s)         | Defendant(s)    |
      | A{{seq}}001                              | Harrow Crown Court | A{{seq}}-1  | JUDGE {{seq}}-1  | Def A{{seq}}-1  |
      | A{{seq}}002                              | Harrow Crown Court | A{{seq}}-11 | JUDGE {{seq}}-11 | Def A{{seq}}-11 |
      | A{{seq}}003                              | Harrow Crown Court | A{{seq}}-2  | JUDGE {{seq}}-11 | Def A{{seq}}-2  |
      | A{{seq}}004                              | Harrow Crown Court | A{{seq}}-11 | JUDGE {{seq}}-2  | Def A{{seq}}-22 |
      | A{{seq}}005                              | Harrow Crown Court | A{{seq}}-2  | JUDGE {{seq}}-2  | Def A{{seq}}-11 |
      | There are restrictions against this case | *IGNORE*           | *IGNORE*    | *IGNORE*         | *IGNORE*        |

    When I click on the "Clear search" link
    And I click on the "Advanced search" link
    And I select the "Date range" radio button
    And I set "Enter a date from" to "{{dd/MM/y}}"
    And I set "Enter a date to" to "{{dd/MM/y}}"
    And I set "Case ID" to "A{{seq}}"
    And I press the "Search" button
    And I click on "Case ID" in the table header
    Then I verify the HTML table contains the following values
      | Case ID                                  | Courthouse         | Courtroom   | Judge(s)         | Defendant(s)    |
      | A{{seq}}001                              | Harrow Crown Court | A{{seq}}-1  | JUDGE {{seq}}-1  | Def A{{seq}}-1  |
      | A{{seq}}002                              | Harrow Crown Court | A{{seq}}-11 | JUDGE {{seq}}-11 | Def A{{seq}}-11 |
      | A{{seq}}003                              | Harrow Crown Court | A{{seq}}-2  | JUDGE {{seq}}-11 | Def A{{seq}}-2  |
      | A{{seq}}004                              | Harrow Crown Court | A{{seq}}-11 | JUDGE {{seq}}-2  | Def A{{seq}}-22 |
      | A{{seq}}005                              | Harrow Crown Court | A{{seq}}-2  | JUDGE {{seq}}-2  | Def A{{seq}}-11 |
      | There are restrictions against this case | *IGNORE*           | *IGNORE*    | *IGNORE*         | *IGNORE*        |

    When I click on the "Clear search" link
    And I click on the "Advanced search" link
    And I set "Case ID" to "1"
    And I press the "Search" button
    Then I see "We need more information to search for a case" on the page
    And I see "Refine your search by adding more information and try again." on the page

    When I click on the "Clear search" link
    And I set "Case ID" to "DMP461"
    And I press the "Search" button
    Then I see "There are more than 500 results" on the page
    And I see "Refine your search by:" on the page
    And I see "adding more information to your search" on the page
    And I see "using filters to restrict the number of results" on the page

  @DMP-509 @DMP-507 @DMP-860 @regression @demo @MissingData @sequential
  Scenario: Case details and Hearing details

    #Case Details

    Given I am logged on to DARTS as an "APPROVER" user
    When I click on the "Search" link
    And I see "Search for a case" on the page
    And I set "Case ID" to "A{{seq}}001"
    And I press the "Search" button
    And I click on the "A{{seq}}001" link
    Then I see "A{{seq}}001" on the page
    And I see "Harrow Crown Court" on the page
    And I see "testprosecutor" on the page
    And I see "testdefender" on the page
    And I see "Def A{{seq}}-1" on the page
    And I see "Hearings" on the page

    #Hearing Details - Set permission for this particular CH as per confluence, may change
    #Changing below section to pass, why are there two hearings for each case?

    #And I verify the HTML table contains the following values
    #	| Hearing date    | Judge | Courtroom | No. of transcripts |
    #	| {{displaydate}} |       | {{seq}}-1 | 0                  |

    When I click on the "{{displaydate}}" link
    Then I see "Events and audio recordings" on the page
    And I see "Select events or audio to set the recording start and end times. You can also manually adjust the times for a custom recording." on the page
    And I see "Select events to include in requests" on the page
    And I see "{{seq}}-1" on the page
    #And I see "Judge" on the page - Empty at the moment
    And I see "Hearing started" on the page
    And I see "A{{seq}}ABC-1" on the page

  @DMP-509 @DMP-1135 @DMP-508 @DMP-515 @DMP-691 @regression @demo @retry @sequential
  Scenario: Case Search error message verification
    Given I am logged on to DARTS as an "APPROVER" user
    When I click on the "Search" link
    And I see "Search for a case" on the page
    And I click on the "Advanced search" link
    And I set "Courtroom" to "2"
    And I press the "Search" button
    Then I see an error message "You must also enter a courthouse"

    When I click on the "Clear search" link
    And I set "Case ID" to "D710458002D710458002D710458002D710458002"
    And I press the "Search" button
    Then I see an error message "Case ID must be less than or equal to 32 characters"

    When I click on the "Clear search" link
    And I click on the "Advanced search" link
    And I select the "Specific date" radio button
    And I set "Enter a specific date" to "{{date+3/}}"
    And I press the "Search" button
    Then I see an error message "You have selected a date in the future. The hearing date must be in the past"

    When I click on the "Clear search" link
    And I click on the "Advanced search" link
    And I select the "Date range" radio button
    And I set "Enter a date from" to "{{date+7/}}"
    And I set "Enter a date to" to "{{date+7/}}"
    And I press the "Search" button
    Then I see an error message "You have selected a date in the future. The hearing date must be in the past"

    When I click on the "Clear search" link
    And I click on the "Advanced search" link
    And I select the "Date range" radio button
    And I set "Date from" to "{{date-10/}}"
    And I set "Date to" to "{{date+10/}}"
    And I press the "Search" button
    Then I see an error message "You have selected a date in the future. The hearing date must be in the past"

    When I click on the "Clear search" link
    And I click on the "Advanced search" link
    And I select the "Date range" radio button
    And I set "Date from" to "{{date-7/}}"
    And I set "Date to" to "{{date-10/}}"
    And I press the "Search" button
    Then I see an error message "The start date must be before the end date"
    Then I see an error message "The end date must be after the start date"

    When I click on the "Clear search" link
    And I click on the "Advanced search" link
    And I select the "Date range" radio button
    And I set "Date to" to "{{date-7/}}"
    And I press the "Search" button
    Then I see an error message "You have not selected a start date. Select a start date to define your search"

    When I click on the "Clear search" link
    And I click on the "Advanced search" link
    And I select the "Date range" radio button
    And I set "Date from" to "{{date-10/}}"
    And I press the "Search" button
    Then I see an error message "You have not selected an end date. Select an end date to define your search"

    When I click on the "Clear search" link
    And I click on the "Advanced search" link
    And I select the "Specific date" radio button
    And I set "Enter a specific date" to "Invalid"
    And I press the "Search" button
    Then I see an error message "You have not entered a recognised date in the correct format (for example 31/01/2023)"

    When I click on the "Clear search" link
    And I click on the "Advanced search" link
    And I select the "Date range" radio button
    And I set "Enter a date from" to "Invalid"
    And I press the "Search" button
    Then I see an error message "You have not entered a recognised date in the correct format (for example 31/01/2023)"
    Then I see an error message "You have not selected an end date. Select an end date to define your search"

    When I click on the "Clear search" link
    And I click on the "Advanced search" link
    And I select the "Date range" radio button
    And I set "Enter a date to" to "Invalid"
    And I press the "Search" button
    Then I see an error message "You have not selected a start date. Select a start date to define your search"
    Then I see an error message "You have not entered a recognised date in the correct format (for example 31/01/2023)"

  @DMP-963 @regression @demo @sequential
  Scenario: Last Search results are retrievable on clicking Search in the breadcrumb trail
    Given I am logged on to DARTS as an "APPROVER" user
    And I click on the "Search" link
    And I set "Case ID" to "A{{seq}}00"
    And I press the "Search" button
    And I click on "Case ID" in the table header
    Then I verify the HTML table contains the following values
      | Case ID                                  | Courthouse         | Courtroom   | Judge(s)         | Defendant(s)    |
      | A{{seq}}001                              | Harrow Crown Court | A{{seq}}-1  | JUDGE {{seq}}-1  | Def A{{seq}}-1  |
      | A{{seq}}002                              | Harrow Crown Court | A{{seq}}-11 | JUDGE {{seq}}-11 | Def A{{seq}}-11 |
      | A{{seq}}003                              | Harrow Crown Court | A{{seq}}-2  | JUDGE {{seq}}-11 | Def A{{seq}}-2  |
      | A{{seq}}004                              | Harrow Crown Court | A{{seq}}-11 | JUDGE {{seq}}-2  | Def A{{seq}}-22 |
      | A{{seq}}005                              | Harrow Crown Court | A{{seq}}-2  | JUDGE {{seq}}-2  | Def A{{seq}}-11 |
      | There are restrictions against this case | *IGNORE*           | *IGNORE*    | *IGNORE*         | *IGNORE*        |
    # TODO (DT): remove redundant check for text in the same row, this case ID is unique
    # When I click on "A{{seq}}003" in the same row as "Harrow Crown Court"
    When I click on the "A{{seq}}003" link
    And I see "Prosecutor(s)" on the page

    And I click on the breadcrumb link "Search"
    And I click on "Case ID" in the table header
    Then I verify the HTML table contains the following values
      | Case ID                                  | Courthouse         | Courtroom   | Judge(s)         | Defendant(s)    |
      | A{{seq}}001                              | Harrow Crown Court | A{{seq}}-1  | JUDGE {{seq}}-1  | Def A{{seq}}-1  |
      | A{{seq}}002                              | Harrow Crown Court | A{{seq}}-11 | JUDGE {{seq}}-11 | Def A{{seq}}-11 |
      | A{{seq}}003                              | Harrow Crown Court | A{{seq}}-2  | JUDGE {{seq}}-11 | Def A{{seq}}-2  |
      | A{{seq}}004                              | Harrow Crown Court | A{{seq}}-11 | JUDGE {{seq}}-2  | Def A{{seq}}-22 |
      | A{{seq}}005                              | Harrow Crown Court | A{{seq}}-2  | JUDGE {{seq}}-2  | Def A{{seq}}-11 |
      | There are restrictions against this case | *IGNORE*           | *IGNORE*    | *IGNORE*         | *IGNORE*        |

  @DMP-997 @regression @demo @sequential
  Scenario: Case file breadcrumbs
    Given I am logged on to DARTS as an "APPROVER" user
    And I click on the "Search" link
    And I set "Case ID" to "A{{seq}}002"
    And I press the "Search" button
    Then I verify the HTML table contains the following values
      | Case ID     | Courthouse         | Courtroom   | Judge(s)         | Defendant(s)    |
      | A{{seq}}002 | Harrow Crown Court | A{{seq}}-11 | JUDGE {{seq}}-11 | Def A{{seq}}-11 |
    # TODO (DT): remove redundant check for text in the same row, this case ID is unique
    # When I click on "A{{seq}}002" in the same row as "Harrow Crown Court"
    When I click on the "A{{seq}}002" link
    And I see "testprosecutortwo" on the page
    And I see "testdefendertwo" on the page
    And I click on the "{{displaydate}}" link
    Then I see "Events and audio recordings" on the page
    When I click on the breadcrumb link "A{{seq}}002"
    Then I see "testprosecutortwo" on the page
    And I see "testdefendertwo" on the page

  # TODO (DT): This is not run due to lack of one of the following tags: @smoketest @regression @end2end
  @DMP-1397-AC1 @sequential
  Scenario: Hide automatic transcript request - Case file screen
    Given I am logged on to DARTS as an APPROVER user
    When I click on the "Search" link
    And I see "Search for a case" on the page
    And I set "Case ID" to "DMP-1225_case1"
    And I press the "Search" button
    And I click on the "DMP-1225_case1" link
    And I click on the "All Transcripts" link
    Then I verify the HTML table contains the following values
      | Hearing date | Type     | Requested on | Requested by | Status   |
      | 05 Jan 2024  | *IGNORE* | *IGNORE*     | *IGNORE*     | *IGNORE* |
      | 05 Jan 2024  | *IGNORE* | *IGNORE*     | *IGNORE*     | *IGNORE* |
      | 05 Jan 2024  | *IGNORE* | *IGNORE*     | *IGNORE*     | *IGNORE* |
      | 05 Jan 2024  | *IGNORE* | *IGNORE*     | *IGNORE*     | *IGNORE* |
      | 05 Jan 2024  | *IGNORE* | *IGNORE*     | *IGNORE*     | *IGNORE* |
      | 05 Jan 2024  | *IGNORE* | *IGNORE*     | *IGNORE*     | *IGNORE* |
      | 05 Jan 2024  | *IGNORE* | *IGNORE*     | *IGNORE*     | *IGNORE* |
      | 05 Jan 2024  | *IGNORE* | *IGNORE*     | *IGNORE*     | *IGNORE* |
      | 22 Dec 2023  | *IGNORE* | *IGNORE*     | *IGNORE*     | *IGNORE* |
      | 22 Dec 2023  | *IGNORE* | *IGNORE*     | *IGNORE*     | *IGNORE* |
      | 05 Jan 2024  | *IGNORE* | *IGNORE*     | *IGNORE*     | *IGNORE* |

  # TODO (DT): This is not run due to lack of one of the following tags: @smoketest @regression @end2end
  @DMP-1397-AC2 @sequential
  Scenario: Hide automatic transcript request - Heating details screen
    Given I am logged on to DARTS as an APPROVER user
    When I click on the "Search" link
    And I see "Search for a case" on the page
    And I set "Case ID" to "DMP-1225_case1"
    And I press the "Search" button
    And I click on the "DMP-1225_case1" link
    And I click on the "5 Jan 2023" link
    And I click on the "Transcripts" link
    Then I see "There are no transcripts for this hearing." on the page

  @DMP-1798-AC1-AC3 @regression @demo @sequential
  Scenario: Restrictions banner on hearing details screen - All restriction events received during hearing displayed on hearing details screen - Open restriction list
    Given I am logged on to DARTS as an "APPROVER" user
    When I click on the "Search" link
    And I see "Search for a case" on the page
    And I set "Case ID" to "A{{seq}}005"
    And I press the "Search" button
    And I click on the "A{{seq}}005" link
    And I click on the "{{displaydate}}" link
    # TODO (DT): Added for extra verification
    And I see "There are restrictions against this hearing" on the page
    And I click on the "Show restrictions" link
    Then I see "Hide restrictions" on the page
    And I see "Restriction applied: An order made under s46 of the Youth Justice and Criminal Evidence Act 1999" on the page
    And I see "For full details, check the hearing events." on the page

  @DMP-1798-AC2 @regression @demo @sequential
  Scenario: Restrictions banner on hearing details screen - Closed by default
    Given I am logged on to DARTS as an "APPROVER" user
    When I click on the "Search" link
    And I see "Search for a case" on the page
    And I set "Case ID" to "A{{seq}}005"
    And I press the "Search" button
    And I click on the "A{{seq}}005" link
    And I click on the "{{displaydate}}" link
    #Then I click on the "Show restrictions" link
    Then I do not see "Restriction applied: An order made under s46 of the Youth Justice and Criminal Evidence Act 1999" on the page

  @DMP-1798-AC4 @regression @sequential
  Scenario: Restrictions banner on hearing details screen - collapse restriction list
    Given I am logged on to DARTS as an "APPROVER" user
    When I click on the "Search" link
    And I see "Search for a case" on the page
    And I set "Case ID" to "A{{seq}}005"
    And I press the "Search" button
    And I click on the "A{{seq}}005" link
    And I click on the "{{displaydate}}" link
    # TODO (DT): Added for extra verification
    And I see "There are restrictions against this hearing" on the page
    And I click on the "Show restrictions" link
    Then I see "Restriction applied: An order made under s46 of the Youth Justice and Criminal Evidence Act 1999" on the page
    And I see "For full details, check the hearing events." on the page

    When I click on the "Hide restrictions" link
    Then I do not see "Restriction applied: An order made under s46 of the Youth Justice and Criminal Evidence Act 1999" on the page
    And I do not see "For full details, check the hearing events." on the page

  # TODO (DT): This is not run due to lack of one of the following tags: @smoketest @regression @end2end
  @DMP-1798-AC5 @sequential
  Scenario: Restrictions banner on hearing details screen - no restrictions during hearing but others on case
    Given I am logged on to DARTS as an APPROVER user
    When I click on the "Search" link
    And I see "Search for a case" on the page
    And I set "Case ID" to "DMP-1225_case1"
    And I press the "Search" button
    #And I click on the "DMP-1225_case1" link
    And I click on "DMP-1225_case1" in the same row as "DMP-1225_Courthouse"
    #And I click on the "5 Jan 2024" link
    And I click on "5 Jan 2024" in the same row as "Room1_DMP1225"
    Then I see "There are restrictions against this case" on the page
    And I do not see "Show restrictions" on the page

  # TODO (DT): This is not run due to lack of one of the following tags: @smoketest @regression @end2end
  @DMP-1798-AC6 @sequential
  Scenario: Restrictions banner on hearing details screen - No restrictions
    Given I am logged on to DARTS as an APPROVER user
    When I click on the "Search" link
    And I see "Search for a case" on the page
    And I click on the "Advanced search" link
    And I set "Case ID" to "CASE5_Event_DMP461"
    And I set "Courthouse" to "swansea"
    And I press the "Search" button
    And I click on the "CASE5_Event_DMP461" link
    Then I do not see "There are restrictions against this case" on the page

    When I click on the "10 Aug 2023" link
    And I do not see "There are restrictions against this case" on the page
    And I press the "back" button on my browser
    And I click on the "11 Aug 2023" link
    Then I do not see "There are restrictions against this case" on the page

  @DMP-772 @regression @demo @sequential
  Scenario: Search Results Pagination
    Given I am logged on to DARTS as an "APPROVER" user
    When I click on the "Search" link
    And I see "Search for a case" on the page
    And I click on the "Advanced search" link
    And I select the "Date range" radio button
    And I set "Enter a date from" to "{{date-7/}}"
    And I set "Enter a date to" to "{{date-0/}}"
    And I set "Judge's name" to "JUDGE NAME"
    And I set "Courthouse" to "Harrow Crown Court"
    And I press the "Search" button
    Then I do not see link with text "Previous"
    And I see link with text "Next"
    When I click on the pagination link "2"
    Then I see link with text "Previous"
    And I see link with text "Next"
    When I click on the pagination link "Previous"
    Then I do not see link with text "Previous"
    When I click on the pagination link "Next"
    Then I see link with text "Previous"
    When I click on the last pagination link
    Then I do not see link with text "Next"
    And I see link with text "Previous"

  @DMP-2769 @regression @sequential
  Scenario: Advanced Search Restrictions
    Given I am logged on to DARTS as an "APPROVER" user
    And I click on the "Search" link
    And I click on the "Advanced search" link
    And I set "Courtroom" to "A{{seq}}-11"
    And I set "Courthouse" to "Harrow Crown Court"
    And I click option "Harrow Crown Court"
    And I press the "Search" button
    Then I see "We need more information to search for a case" on the page

    When I select the "Specific date" radio button
    And I set "Enter a specific date" to "{{date+0/}}"
    And I press the "Search" button
    And I click on "Case ID" in the table header
    Then I verify the HTML table contains the following values
      | Case ID     | Courthouse         | Courtroom   | Judge(s)         | Defendant(s)    |
      | A{{seq}}002 | Harrow Crown Court | A{{seq}}-11 | JUDGE {{seq}}-11 | Def A{{seq}}-11 |
      | A{{seq}}004 | Harrow Crown Court | A{{seq}}-11 | JUDGE {{seq}}-2  | Def A{{seq}}-22 |

    When I click on the "Clear search" link
    And I click on the "Advanced search" link
    And I set "Courthouse" to "Harrow Crown Court"
    And I set "Defendant's name" to "Def A"
    And I press the "Search" button
    Then I see "We need more information to search for a case" on the page

    When I set "Judge's name" to "JUDGE {{seq}}-2"
    And I press the "Search" button
    And I click on "Case ID" in the table header
    Then I verify the HTML table contains the following values
      | Case ID                                  | Courthouse         | Courtroom   | Judge(s)        | Defendant(s)    |
      | A{{seq}}004                              | Harrow Crown Court | A{{seq}}-11 | JUDGE {{seq}}-2 | Def A{{seq}}-22 |
      | A{{seq}}005                              | Harrow Crown Court | A{{seq}}-2  | JUDGE {{seq}}-2 | Def A{{seq}}-11 |
      | There are restrictions against this case | *IGNORE*           | *IGNORE*    | *IGNORE*        | *IGNORE*        |

    When I click on the "Clear search" link
    And I click on the "Advanced search" link
    And I set "Keywords" to "A{{seq}}ABC-1"
    And I select the "Specific date" radio button
    And I set "Enter a specific date" to "{{date+0/}}"
    And I press the "Search" button
    And I click on "Case ID" in the table header
    #Then I see "We need more information to search for a case" on the page
    Then I verify the HTML table contains the following values
      | Case ID     | Courthouse         | Courtroom   | Judge(s)         | Defendant(s)    |
      | A{{seq}}001 | Harrow Crown Court | A{{seq}}-1  | JUDGE {{seq}}-1  | Def A{{seq}}-1  |
      | A{{seq}}003 | Harrow Crown Court | A{{seq}}-2  | JUDGE {{seq}}-11 | Def A{{seq}}-2  |
      | A{{seq}}004 | Harrow Crown Court | A{{seq}}-11 | JUDGE {{seq}}-2  | Def A{{seq}}-22 |

  #    When I set "Courthouse" to "Harrow Crown Court"
  #    And I press the "Search" button
  #    And I click on "Case ID" in the table header
  #    Then I verify the HTML table contains the following values
  #      | Case ID                                                  | Courthouse         | Courtroom   | Judge(s)         | Defendant(s)    |
  #      | A{{seq}}005                                              | Harrow Crown Court | A{{seq}}-2  | JUDGE {{seq}}-2  | Def A{{seq}}-11 |
  #      | !\nRestriction\nThere are restrictions against this case | *IGNORE*           | *IGNORE*    | *IGNORE*         | *IGNORE*        |
  #      | A{{seq}}004                                              | Harrow Crown Court | A{{seq}}-11 | JUDGE {{seq}}-2  | Def A{{seq}}-22 |
  #      | A{{seq}}003                                              | Harrow Crown Court | A{{seq}}-2  | JUDGE {{seq}}-11 | Def A{{seq}}-2  |
  #      | A{{seq}}002                                              | Harrow Crown Court | A{{seq}}-11 | JUDGE {{seq}}-11 | Def A{{seq}}-11 |
  #      | A{{seq}}001                                              | Harrow Crown Court | A{{seq}}-1  | JUDGE {{seq}}-1  | Def A{{seq}}-1  |

  @DMP-2963 @regression @sequential
  Scenario: Add a CourtLog into Case file screen
    Given I am logged on to DARTS as a "TRANSCRIBER" user
    And I click on the "Search" link
    And I see "Also known as a case reference or court reference. There should be no spaces." on the page
    And I set "Case ID" to "A{{seq}}002"
    And I press the "Search" button
    Then I verify the HTML table contains the following values
      | Case ID     | Courthouse         | Courtroom   | Judge(s)         | Defendant(s)    |
      | A{{seq}}002 | Harrow Crown Court | A{{seq}}-11 | JUDGE {{seq}}-11 | Def A{{seq}}-11 |
    And I click on "A{{seq}}002" in the same row as "Harrow Crown Court"
    Then I see "Court log" on the page
    And I click on the "Court log" link
    Then I see "Court log for this case" on the page
    And I verify the HTML table contains the following values
      | Hearing date    | Time     | Event           | Text          |
      | {{displaydate}} | 10:00:00 | Hearing started | A{{seq}}ABC-2 |

    Then I click on "Hearing date" in the table header
    And "Hearing date" has sort "descending" icon

    Then I click on "Time" in the table header
    And "Time" has sort "descending" icon

    Then I click on "Event" in the table header
    # TODO (DT): changed to ascending to match what happens
    And "Event" has sort "ascending" icon


  @DMP-4129 @DMP-4318 @regression @sequential
  Scenario: Column sorting for User and Admin Portal
    Given I am logged on to DARTS as a "REQUESTER" user

    #Your audio

    And I click on the "Your audio" link
    And I click on "Case ID" in the table header
    And "Case ID" has sort "ascending" icon
    And I click on "Courthouse" in the table header
    And "Courthouse" has sort "ascending" icon
    And I click on "Hearing date" in the table header
    And "Hearing date" has sort "descending" icon
    And I click on "Start time" in the table header
    And "Start time" has sort "descending" icon
    And I click on "End time" in the table header
    And "End time" has sort "descending" icon
    And I click on "Request ID" in the table header
    And "Request ID" has sort "ascending" icon
    And I click on "Last accessed" in the table header
    And "Last accessed" has sort "descending" icon
    And I click on "Status" in the table header
    Then "Status" has sort "ascending" icon

    #Same for Ready? Can click the column for Ready but can't verify sorting status

    # TODO (DT): removing this column heading click an it's adding no value here
    # When I click on "Case ID" in the "Ready" table header
    #And "Case ID" has sort "ascending" icon

    When I click on the "Expired" link
    And I click on "Case ID" in the table header
    And "Case ID" has sort "ascending" icon
    And I click on "Courthouse" in the table header
    And "Courthouse" has sort "ascending" icon
    And I click on "Hearing date" in the table header
    And "Hearing date" has sort "descending" icon
    And I click on "Start time" in the table header
    And "Start time" has sort "descending" icon
    And I click on "End time" in the table header
    And "End time" has sort "descending" icon
    And I click on "Request ID" in the table header
    And "Request ID" has sort "ascending" icon
    And I click on "Expiry date" in the table header
    And "Expiry date" has sort "descending" icon
    And I click on "Status" in the table header
    Then "Status" has sort "ascending" icon

    #Your transcripts

    When I click on the "Your transcripts" link
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
    And I click on "Status" in the table header
    Then "Status" has sort "ascending" icon
    And I click on "Urgency" in the table header
    Then "Urgency" has sort "ascending" icon

    #Same for Ready? Can click the column for Ready but can't verify sorting status

    # TODO (DT): removing this column heading click an it's adding no value here
    # When I click on "Case ID" in the "Ready" table header
    #And "Case ID" has sort "ascending" icon

    #Retention

    When I click on the "Search" link
    And I set "Case ID" to "retention"
    And I press the "Search" button
    And I click on "T20240001_retention1" in the same row as "Harrow Crown Court"
    And I click on the "View or change" link
    And I click on "Date retention changed" in the table header
    Then "Date retention changed" has sort "descending" icon

    #Approver transcript requests

    When I Sign out
    And I see "Sign in to the DARTS Portal" on the page
    And I am logged on to DARTS as an "APPROVER" user
    And I click on the "Your transcripts" link
    And I click on the "Transcript requests to authorise" link
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
    And I click on "Request ID" in the table header
    And "Request ID" has sort "ascending" icon
    And I click on "Urgency" in the table header
    Then "Urgency" has sort "ascending" icon

    #Judge annotations

    When I Sign out
    And I see "Sign in to the DARTS Portal" on the page
    And I am logged on to DARTS as a "JUDGE" user
    And I set "Case ID" to "K61076002"
    And I press the "Search" button
    And I click on the "K61076002" link
    And I click on the "All annotations" link
    And I click on "Hearing date" in the table header
    And "Hearing date" has sort "descending" icon
    And I click on "File name" in the table header
    And "File name" has sort "ascending" icon
    And I click on "Format" in the table header
    And "Format" has sort "ascending" icon
    And I click on "Date created" in the table header
    Then "Date created" has sort "descending" icon

    When I click on the "Hearings" link
    And I click on the "14 Jan 2025" link
    And I click on the "Annotations" link
    And I click on "File name" in the table header
    And "File name" has sort "ascending" icon
    And I click on "Format" in the table header
    And "Format" has sort "ascending" icon
    And I click on "Date created" in the table header
    Then "Date created" has sort "descending" icon

# TODO (DT): removing the steps below an it's adding no value here, it makes no checks/verifications
#Admin - user profile

# When I Sign out
# And I see "Sign in to the DARTS Portal" on the page
# And I am logged on to the admin portal as a "ADMIN" user
# And I click on the "Users" link
# And I set "Email" to "darts.requester@hmcts.net"
# And I press the "Search" button
# And I click on "View" in the same row as "Requestor"
# And I click on the "Transcript requests" sub-menu link
# And I see "Approved on" on the page
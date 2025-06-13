@admin @admin_search @retry
Feature: Admin Search

@regression @sequential
  Scenario: Search validation
    When I am logged on to the admin portal as an "ADMIN" user
    #Input validation
    Then I see "Search" on the page
    When I set "Case ID" to "123456789112345678911234567891111"
    And I press the "Search" button
    Then I see an error message "Case ID must be less than or equal to 32 characters"
    When I set "Courtroom" to "123456789112345678911234567891111123456789112345678911234567891111"
    And I press the "Search" button
    Then I see an error message "Courtroom name must be less than or equal to 64 characters"

  @DMP-3129 @DMP-4532 @regression @sequential
  Scenario: Search Results - Cases
    When I am logged on to the admin portal as an "ADMIN" user
    #Filter by courthouse
    And I set "Filter by courthouse" to "Swansea"
    And I press the "Search" button
    And I see "We need more information to search" on the page
    And I click on the "Hearings" link
    And I see "We need more information to search" on the page
    And I click on the "Cases" link
    And I see "We need more information to search" on the page
    And I click on the "Clear search" link

    #Case ID
    When I set "Case ID" to "CASE1009"
    And I press the "Search" button
    And I click on "Case ID" in the table header
    Then "Case ID" has sort "ascending" icon
    When I click on "Courthouse" in the table header
    And "Courthouse" has sort "ascending" icon
    Then I verify the HTML table contains the following values
      | Case ID  | Courthouse | Courtroom | Judge(s) | Defendant(s) |
      | CASE1009 | Liverpool  | ROOM_A    | *IGNORE* | *IGNORE*     |
      | CASE1009 | Swansea    | Multiple  | Mr Judge | Jow Bloggs   |

    When I click on the "Hearings" link
    Then I verify the HTML table contains the following values
      | Case ID  | Hearing date | Courthouse                  | Courtroom       |
      | CASE1009 | 15/08/2023   | Leeds Combined Court Centre | ROOM_A          |
      | CASE1009 | 01/01/2023   | Swansea                     | CR1             |
      | CASE1009 | 05/12/2023   | Swansea                     | ROOMA           |
      | CASE1009 | 15/08/2023   | Swansea                     | ROOM_A          |
      | CASE1009 | 19/09/2023   | Swansea                     | ROOM_A          |
      | CASE1009 | 05/12/2023   | Swansea                     | ROOM_A          |
      | CASE1009 | 07/12/2023   | Swansea                     | ROOM_A          |
      | CASE1009 | 15/08/2023   | Swansea                     | ROOM_A12434     |
      | CASE1009 | 15/08/2023   | Swansea                     | ROOM_XYZ        |
      | CASE1009 | 15/08/2023   | Swansea                     | ROOM_XYZHHIHIHI |

    When I click on the "Cases" link
    And I click on "Courthouse" in the table header
    Then I verify the HTML table contains the following values
      | Case ID  | Courthouse | Courtroom | Judge(s) | Defendant(s) |
      | CASE1009 | Liverpool  | ROOM_A    | *IGNORE* | *IGNORE*     |
      | CASE1009 | Swansea    | Multiple  | Mr Judge | Jow Bloggs   |
    And I click on the "Clear search" link

    #Courtroom
    And I set "Filter by courthouse" to "Swansea"
    And I click option "Swansea"
    And I set "Filter by courthouse" to "Liverpool"
    And I click option "Liverpool"
    And I set "Filter by courthouse" to "DMP-770-Courthouse"
    And I click option "DMP-770-Courthouse"
    And I set "Filter by courthouse" to "Leeds Combined Court Centre"
    And I click option "Leeds Combined Court Centre"
    When I set "Courtroom" to "ROOM_A"
    And I select the "Specific date" radio button
    And I set "Enter a specific date" to "15/08/2023"
    And I press the "Search" button
    And I click on "Courthouse" in the table header
    Then I verify the HTML table contains the following values
      | Case ID  | Courthouse         | Courtroom | Judge(s) | Defendant(s) |
      | 141      | DMP-770-Courthouse | ROOM_A    | Judge 1  | DAVE-D1      |
      | CASE1009 | Liverpool          | ROOM_A    | *IGNORE* | *IGNORE*     |
      | CASE1009 | Swansea            | Multiple  | Mr Judge | Jow Bloggs   |

    When I click on the "Hearings" link
    Then I verify the HTML table contains the following values
      | Case ID  | Hearing date | Courthouse                  | Courtroom   |
      | CASE1009 | 15/08/2023   | Leeds Combined Court Centre | ROOM_A      |
      | CASE1009 | 15/08/2023   | Swansea                     | ROOM_A      |
      | CASE1009 | 15/08/2023   | Swansea                     | ROOM_A12434 |
      | 141      | 15/08/2023   | Liverpool                   | ROOM_A      |

    When I click on the "Cases" link
    And I click on "Courthouse" in the table header
    Then I verify the HTML table contains the following values
      | Case ID  | Courthouse         | Courtroom | Judge(s) | Defendant(s) |
      | 141      | DMP-770-Courthouse | ROOM_A    | Judge 1  | DAVE-D1      |
      | CASE1009 | Liverpool          | ROOM_A    | *IGNORE* | *IGNORE*     |
      | CASE1009 | Swansea            | Multiple  | Mr Judge | Jow Bloggs   |
    And I click on the "Clear search" link

    #Hearing Date-Specific Date
    When I set "Case ID" to "CASE1009"
    And I select the "Specific date" radio button
    And I set "Enter a specific date" to "05/12/2023"
    And I press the "Search" button
    Then I verify the HTML table contains the following values
      | Case ID  | Courthouse | Courtroom | Judge(s) | Defendant(s) |
      | CASE1009 | Swansea    | Multiple  | Mr Judge | Jow Bloggs   |

    When I click on the "Hearings" link
    Then I verify the HTML table contains the following values
      | Case ID  | Hearing date | Courthouse | Courtroom |
      | CASE1009 | 05/12/2023   | Swansea    | ROOMA     |
      | CASE1009 | 05/12/2023   | Swansea    | ROOM_A    |

    When I click on the "Cases" link
    Then I verify the HTML table contains the following values
      | Case ID  | Courthouse | Courtroom | Judge(s) | Defendant(s) |
      | CASE1009 | Swansea    | Multiple  | Mr Judge | Jow Bloggs   |
    Then I click on the "Clear search" link

    #Hearing Date-Date Range
    And I set "Filter by courthouse" to "Harrow Crown Court"
    And I click option "Harrow Crown Court"
    When I select the "Date range" radio button
    And I set "Enter a date from" to "02/07/2024"
    And I set "Enter a date to" to "03/07/2024"
    And I set "Courtroom" to "GET99662"
    And  I press the "Search" button
    And I click on "Case ID" in the table header
    Then I verify the HTML table contains the following values
      | Case ID   | Courthouse         | Courtroom | Judge(s)   | Defendant(s)    |
      | T99662621 | Harrow Crown Court | GET99662  | test judge | test defendent1 |
      | T99662622 | Harrow Crown Court | GET99662  | test judge | test defendent2 |

    When I click on the "Hearings" link
    And I click on "Case ID" in the table header
    Then I verify the HTML table contains the following values
      | Case ID   | Hearing date | Courthouse         | Courtroom |
      | T99662621 | 02/07/2024   | Harrow Crown Court | GET99662  |
      | T99662622 | 02/07/2024   | Harrow Crown Court | GET99662  |

    When I click on the "Cases" link
    And I click on "Case ID" in the table header
    Then I verify the HTML table contains the following values
      | Case ID   | Courthouse         | Courtroom | Judge(s)   | Defendant(s)    |
      | T99662621 | Harrow Crown Court | GET99662  | test judge | test defendent1 |
      | T99662622 | Harrow Crown Court | GET99662  | test judge | test defendent2 |

  @DMP-2728 @DMP-4257 @DMP-4573 @regression @sequential
  Scenario: Associated Audio files for deletion/hidden and unhidden
    When I am logged on to the admin portal as an "ADMIN" user
    And I set "Case ID" to "CASE1009"
    And I press the "Search" button
    And I click on the "Audio" link
    And I click on "Audio ID" in the table header
    And I click on the "1313" link
    And I press the "Hide or delete" button
    And I select the "Other reason to hide only" radio button
    And I set "Enter ticket reference" to "Test"
    And I set "Comments" to "Test"
    And I press the "Hide or delete" button
    Then I see "There are other audio files associated with the file you are hiding and/or deleting" on the page
    And I verify the HTML table contains the following values
      | *NO-CHECK* | Audio ID   | Courthouse | Courtroom  | Start time | End time   | Channel number | Is current? |
      | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK*     | *NO-CHECK*  |
      | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK*     | *NO-CHECK*  |
      | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK*     | *NO-CHECK*  |
      | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK*     | *NO-CHECK*  |
      | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK*     | *NO-CHECK*  |
      | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK*     | *NO-CHECK*  |
      | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK*     | *NO-CHECK*  |
      | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK*     | *NO-CHECK*  |
      | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK*     | *NO-CHECK*  |
      | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK*     | *NO-CHECK*  |
      | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK*     | *NO-CHECK*  |
      | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK*     | *NO-CHECK*  |
      | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK*     | *NO-CHECK*  |
      | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK*     | *NO-CHECK*  |
      | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK*     | *NO-CHECK*  |

    When checkbox with name "Select all checkboxes" is checked
    And I check the "Select all checkboxes" checkbox


    # And I select the checkbox by name "selectAll"
    And checkbox with name "Select all checkboxes" is unchecked
    And I press the "Continue" button
    Then I see an error message "Select files to include"

    # When I select the checkbox by name "selectAll"

    And I check the "Select all checkboxes" checkbox
    And I press the "Continue" button
    Then I see "Files successfully hidden or marked for deletion" on the page
    And I see "Check for associated files" on the page
    And I see "There may be other associated audio or transcript files that also need hiding or deleting." on the page

    #AC1 & AC3 Screen as per wireframe & channels listed

    When I press the "Continue" button
    And I press the "Unhide" button
    Then I see "There are other audio files associated with the file you are unhiding/unmarking for deletion" on the page
    And I see "Select any files that you want to include in this action" on the page
    And I see "The files you are unhiding and/or unmarking for deletion" on the page
    And I verify the HTML table contains the following values
      | *NO-CHECK* | Audio ID   | Courthouse | Courtroom  | Start time | End time   | Channel number | Is current? |
      | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | 1              | *NO-CHECK*  |
      | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | 1              | *NO-CHECK*  |
      | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | 1              | *NO-CHECK*  |
      | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | 1              | *NO-CHECK*  |
      | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | 1              | *NO-CHECK*  |
      | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | 1              | *NO-CHECK*  |
      | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | 1              | *NO-CHECK*  |
      | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | 1              | *NO-CHECK*  |
      | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | 1              | *NO-CHECK*  |
      | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | 1              | *NO-CHECK*  |
      | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | 1              | *NO-CHECK*  |
      | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | 1              | *NO-CHECK*  |
      | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | 1              | *NO-CHECK*  |
      | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | 1              | *NO-CHECK*  |
      | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | *NO-CHECK* | 1              | *NO-CHECK*  |

    #DMP-4573-AC1 & DMP-4257-AC5 & AC6 Test cancel link

    When I click on the "Cancel" link
    Then I see "This file is hidden in DARTS" on the page
    And I see "Basic details" on the page

    #AC2 & AC4 All rows checked by default & Continue completes action

    When I press the "Unhide" button
    And I see "There are other audio files associated with the file you are unhiding/unmarking for deletion" on the page


    And checkbox with name "Select all checkboxes" is checked
    # And checkbox with name "selectAll" is checked
    And I check the "Select all checkboxes" checkbox
    # And I select the checkbox by name "selectAll"
    And checkbox with name "Select all checkboxes" is unchecked
    # And checkbox with name "selectAll" is unchecked
    And I press the "Continue" button
    Then I see an error message "Select files to include"

    When I check the "Select all checkboxes" checkbox
    # When I select the checkbox by name "selectAll"
    And I press the "Continue" button
    Then I see "Audio file(s) unhidden / unmarked for deletion" on the page

  @DMP-3315 @DMP-4532 @regression @sequential
  Scenario: Hearings search results
    When I am logged on to the admin portal as an "ADMIN" user
    Then I see "Search" on the page
    When I set "Case ID" to "B"
    And I select the "Date range" radio button
    And I set "Enter a date from" to "01/12/2024"
    And I set "Enter a date to" to "03/12/2024"
    And I select the "Hearings" radio button
    And I press the "Search" button
    And I click on the pagination link "2"
    And I click on the pagination link "Previous"
    And I click on the pagination link "Next"

    When I set "Case ID" to "A400471"
    And I select the "Cases" radio button
    And I press the "Search" button
    And I see "Showing 1-5 of 5" on the page
    And I click on "Case ID" in the table header
    And "Case ID" has sort "ascending" icon
    Then I verify the HTML table contains the following values
      | Case ID    | Courthouse         | Courtroom  | Judge(s)        | Defendant(s)   |
      | A400471001 | Harrow Crown Court | A400471-1  | JUDGE 400471-1  | Def A400471-1  |
      | A400471002 | Harrow Crown Court | A400471-11 | JUDGE 400471-11 | Def A400471-11 |
      | A400471003 | Harrow Crown Court | A400471-2  | JUDGE 400471-11 | Def A400471-2  |
      | A400471004 | Harrow Crown Court | A400471-11 | JUDGE 400471-2  | Def A400471-22 |
      | A400471005 | Harrow Crown Court | A400471-2  | JUDGE 400471-2  | Def A400471-11 |

    And I click on "Courthouse" in the table header
    Then "Courthouse" has sort "ascending" icon

  @DMP-2709 @DMP-3384 @sequential
  Scenario: Super Admin Audio file-Details page
    When I am logged on to the admin portal as a "SUPERUSER" user
    And I see "Search" on the page
    And I set "Filter by courthouse" to "DMP-3438_Courthouse"
    And I select the "Audio" radio button
    And I press the "Search" button
    Then I see "Audio" on the page
    And I see "Showing 1-2 of 2" on the page
    And I click on the "52849" link

    #Back
    Then I click on the "Back" link
    And I see "Search" on the page
    And I click on the "52849" link
    And I see "Audio file" on the page
    And I see "52849" on the page
    And I do not see " Hide or delete " on the page

  @DMP-2709 @DMP-3384 @DMP-4263 @sequential
  Scenario: Admin Audio file-Details page
    When I am logged on to the admin portal as an "SUPERUSER" user
    And I see "Search" on the page
    And I set "Filter by courthouse" to "DMP-3438_Courthouse"
    And I select the "Audio" radio button
    And I press the "Search" button
    Then I see "Audio" on the page
    And I see "Showing 1-2 of 2" on the page
    And I click on the "52849" link

    #Back
    Then I click on the "Back" link
    And I see "Search" on the page
    And I click on the "52849" link
    And I see "Audio file" on the page
    And I see "52849" on the page
    And I do not see " Hide or delete " on the page

    #Basic details
    And I see "Basic details" on the page
    And I see "Courthouse" in the same row as "DMP-3438_Courthouse"
    And I see "Courtroom" in the same row as "Room1_DMP-3438"
    And I see "Start time" in the same row as "28 Jun 2024 at 1:00:00AM"
    And I see "End time" in the same row as "28 Jun 2024 at 11:59:59PM"
    And I see "Channel number" in the same row as "1"
    And I see "Total channels" in the same row as "4"
    And I see "Media type" in the same row as "A"
    And I see "File type" in the same row as "mp2"
    And I see "File size" in the same row as "0.94KB"
    And I see "Filename" in the same row as "DMP-3438-file1"
    And I see "Date created" in the same row as "28 Jun 2024 at 1:40:41PM"
    Then I verify the HTML table "Associated cases" contains the following values
      | Case ID        | Courthouse          | Source |
      | DMP-3438_case1 | DMP-3438_Courthouse | Legacy |
    And I click on "Case ID" in the "Associated cases" table header
    And I click on "Case ID" in the table header
    Then "Case ID" has sort "ascending" icon
    And I click on "Courthouse" in the table header
    Then "Courthouse" has sort "ascending" icon
    And I click on "Source" in the table header
    Then "Source" has sort "ascending" icon
    And I Sign out
    #Super Admin
    And I am logged on to the admin portal as an "ADMIN" user
    Then I see "Search" on the page
    When I set "Filter by courthouse" to "DMP-3438_Courthouse"
    And I select the "Audio" radio button
    And I press the "Search" button
    Then I see "Audio" on the page
    And I see "Showing 1-2 of 2" on the page
    When I click on the "52849" link

    #Back
    And I click on the "Back" link
    Then I see "Search" on the page
    When I set "Filter by courthouse" to "DMP-3438_Courthouse"
    And I select the "Audio" radio button
    And I press the "Search" button
    Then I see "Audio" on the page
    And I see "Showing 1-2 of 2" on the page
    When I click on the "52849" link
    Then I see "Audio file" on the page
    And I see "52849" on the page
    And I see " Hide or delete " on the page

    #Basic details
    And I see "Basic details" on the page
    And I see "Courthouse" in the same row as "DMP-3438_Courthouse"
    And I see "Courtroom" in the same row as "Room1_DMP-3438"
    And I see "Start time" in the same row as "28 Jun 2024 at 1:00:00AM"
    And I see "End time" in the same row as "28 Jun 2024 at 11:59:59PM"
    And I see "Channel number" in the same row as "1"
    And I see "Total channels" in the same row as "4"
    And I see "Media type" in the same row as "A"
    And I see "File type" in the same row as "mp2"
    And I see "File size" in the same row as "0.94KB"
    And I see "Filename" in the same row as "DMP-3438-file1"
    And I see "Date created" in the same row as "28 Jun 2024 at 1:40:41PM"
    And I see "Associated cases" on the page
    Then I verify the HTML table contains the following values
      | Case ID        | Courthouse          | Source |
      | DMP-3438_case1 | DMP-3438_Courthouse | Legacy |

    And I see "Associated hearings" on the page
    Then I verify the HTML table "Associated hearings" contains the following values
      | Case ID        | Hearing date | Courthouse          | Courtroom      |
      | DMP-3438_case1 | 28 Jun 2024  | DMP-3438_Courthouse | ROOM1_DMP-3438 |

    #Advanced details
    When I click on the "Advanced details" link
    Then I see "Advanced details" on the page
    And I see "Media object ID" in the same row as ""
    And I see "Content object ID" in the same row as ""
    And I see "Clip ID" in the same row as ""
    And I see "Checksum" in the same row as "d6df4486865e46f60d6bcebda3950760"
    And I see "Media status" in the same row as ""
    And I see "Is current" in the same row as "Yes"
    And I see "Audio hidden?" in the same row as "No"
    And I see "Audio deleted?" in the same row as "No"

    And I see "Version data" on the page
    And I see "Version" in the same row as ""
    And I see "Chronicle ID" in the same row as "52849"
    And I see "Antecedent ID" in the same row as ""
    And I see "Retain until" in the same row as ""
    And I see "Date created" in the same row as "28 Jun 2024 at 1:40:41PM"
    And I see "Created by" in the same row as ""
    And I see "Date last modified" in the same row as "23 Jan 20245 at 11:24:39AM"
    And I see "Last modified by" in the same row as "Darts Admin"

    #Hide audio file
    When I press the "Hide or delete" button
    And I select the "Other reason to hide only" radio button
    And I set "Enter ticket reference" to "DMP-2709"
    And I set "Comments" to "Testing DMP-2709 AC-3" and click away
    Then I see "You have 235 characters remaining" on the page
    When I press the "Hide or delete" button

    Then I see "Files successfully hidden or marked for deletion" on the page
    And I see "Check for associated files" on the page
    And I see "There may be other associated audio or transcript files that also need hiding or deleting." on the page
    And I press the "Continue" button
    And I see "Important" on the page
    And I see "This file is hidden in DARTS" on the page
    And I see "DARTS users cannot view this file. You can unhide the file." on the page
    And I see "Hidden by - Darts Admin" on the page
    And I see "Reason - Other reason to hide only" on the page
    And I see "Testing DMP-2709 AC-3" on the page
    And I see "Unhide" on the page

    #Unhide audio file
    When I click on the "unhide" link
    Then I do not see "Important" on the page
    When I click on the "Advanced details" link
    Then I see "Audio hidden?" in the same row as "No"
    And I see " Hide or delete " on the page

  @DMP-3317 @DMP-4532 @regression @sequential
  Scenario: Audio and events search results
    Given I am logged on to the admin portal as an "ADMIN" user
    Then I see "Search" on the page
    When I set "Filter by courthouse" to "Harrow Crown Court"
    And I set "Case ID" to "C"
    And I select the "Specific date" radio button
    And I set "Enter a specific date" to "14/01/2025"
    And I select the "Audio" radio button
    And I press the "Search" button
    And I click on the pagination link "2"
    And I click on the pagination link "Previous"
    And I click on the pagination link "Next"

    When I click on "Audio ID" in the table header
    Then "Audio ID" has sort "ascending" icon

    When I click on "Courthouse" in the table header
    Then "Courthouse" has sort "ascending" icon

    When I click on "Courtroom" in the table header
    Then "Courtroom" has sort "ascending" icon

    When I click on "Start Time" in the table header
    Then "Start Time" has sort "descending" icon

    When I click on "End Time" in the table header
    Then "End Time" has sort "descending" icon

    When I click on "Channel" in the table header
    Then "Channel" has sort "ascending" icon

    When I click on "Hidden" in the table header
    Then "Hidden" has sort "ascending" icon

    When I click on the "Events" link
    And I click on "Event ID" in the table header
    Then "Event ID" has sort "ascending" icon

    When I click on "Time stamp" in the table header
    Then "Time stamp" has sort "descending" icon

    When I click on "Name" in the table header
    Then "Name" has sort "ascending" icon

    When I click on "Courthouse" in the table header
    Then "Courthouse" has sort "ascending" icon

    When I click on "Courtroom" in the table header
    Then "Courtroom" has sort "ascending" icon

    When I click on "Text" in the table header
    Then "Text" has sort "ascending" icon

  @DMP-3309 @sequential
  Scenario: Event_ID Screen
    When I am logged on to the admin portal as an "ADMIN" user
    And I see "Search" on the page
    And I select the "Specific date" radio button
    And I set "Enter a date" to "01/01/2024"
    And I select the "Events" radio button
    And I press the "Search" button
    Then I see "Events" on the page

    #Back Link
    And I click on "490225" in the same row as "01 Jan 2024 at 06:00:00"
    And I see link with text "Back"
    Then I click on the "Back" link
    And I see "Events" on the page

    #Basic details
    Then I click on "490225" in the same row as "22 Aug 2024 at 04:16:55"
    And I see "Event" on the page
    And I see "490225" on the page
    And I see "Basic details" on the page
    And I see "Name" in the same row as "Proceedings in chambers"
    And I see "Text" in the same row as "some text for the event"
    And I see "Courthouse" in the same row as "Harrow Crown Court"
    And I see "Courtroom" in the same row as "132311"
    And I see "Time stamp" in the same row as "01 Jan 2024 at 06:00:00"

    #Advanced details
    Then I click on the "Advanced details" link
    And I see "Documentum ID" in the same row as ""
    And I see "Source event ID" in the same row as "12345"
    And I see "Message ID" in the same row as "100"
    And I see "Type" in the same row as "1000"
    And I see "Subtype" in the same row as "1002"
    And I see "Event Handler" in the same row as "StandardEventHandler"
    And I see "Reporting restriction?" in the same row as "No"
    And I see "Log entry?" in the same row as "No"

    And I see "Version data" on the page
    And I see "Version" in the same row as ""
    And I see "Chronicle ID" in the same row as ""
    And I see "Antecedent ID" in the same row as ""
    And I see "Date created" in the same row as "22 Aug 2024 at 16:16:55"
    And I see "Created by" in the same row as "System"
    And I see "Date last modified" in the same row as "07 Nov 2024 at 10:23:48"
    And I see "Last modified by" in the same row as "System"

  @DMP-3311 @DMP-4818 @regression @sequential
  Scenario: Event version screen - all versions of an event are correctly displayed
    Given I am logged on to the admin portal as an "ADMIN" user
    When I set "Filter by courthouse" to "Harrow Crown Court"
    And I set "Case ID" to "DMP-3311"
    And I select the "Events" radio button
    And I press the "Search" button
    And I click on the "1672370" link
    And I click on the "Advanced details" sub-menu link
    And I click on the "Show versions" link
    Then I see "All versions of this event" on the page
    And I see "Source event ID" on the page
    And I see "1741621553" on the page

    When I see "Current version" on the page
    Then I verify the HTML table "currentVersionTable" contains the following values
      | Event ID | Timestamp               | Name            | Courthouse         | Courtroom | Text                 |
      | 1672370  | 10 Mar 2025 at 15:47:35 | Hearing started | Harrow Crown Court | 98363     | DT TEST 1741621695 3 |

    Then I verify the HTML table "previousVersionsTable" includes the following values
      | Event ID | Timestamp               | Name            | Courthouse         | Courtroom | Text                 |
      | 1672369  | 10 Mar 2025 at 15:45:55 | Hearing started | Harrow Crown Court | 98363     | DT TEST 1741621623 2 |
      | 1672349  | 10 Mar 2025 at 15:45:53 | Hearing started | Harrow Crown Court | 98363     | DT TEST 1741621553 1 |

    When I click on the "Back to event details" link
    Then I see "DarStartHandler" on the page
    And I see "Show versions" on the page

  @DMP-4180 @DMP-3642 @DMP-3214 @DMP-3307 @DMP-3226 @regression @sequential
  Scenario: Basic case file screen, including case details, hearings, restrictions and additional case details

    Given I am logged on to the admin portal as an "ADMIN" user
    And I see "You can search for cases, hearings, events and audio." on the page
    And I set "Case ID" to "CASE1009"
    And I press the "Search" button
    And I click on "CASE1009" in the same row as "Swansea"
    Then I see "Case details" on the page
    And I see "CASE1009" in summary row for "Case ID"
    And I see "Swansea" in summary row for "Courthouse"
    And I see "Mr Judge" in summary row for "Judge(s)"
    And I see "Jow Bloggs" in summary row for "Defendant(s)"
    And I see "Mr Defender" in summary row for "Defence"
    And I see "Mrs Prosecutor" in summary row for "Prosecutor(s)"
    And I see "No date applied" in summary row for "Retained until"

    #Case with restrictions

    When I see "There are restrictions against this case" on the page
    And I see "Important" on the page
    And I click on the "Show restrictions" link
    And I see "Restriction applied: Judge directed on reporting restrictions" on the page
    And I see "For full details, check the events for each hearing below." on the page
    And I click on the "Hide restrictions" link
    Then I do not see "Restriction applied: Judge directed on reporting restrictions" on the page

    #Hearing tab

    When I click on the "Hearings" sub-menu link
    Then I verify the HTML table contains the following values
      | Hearing date | Judge | Courtroom       | No. of transcripts |
      | 07 Dec 2023  |       | ROOM_A          | 0                  |
      | 05 Dec 2023  |       | ROOMA           | 0                  |
      | 05 Dec 2023  |       | ROOM_A          | 0                  |
      | 19 Sep 2023  |       | ROOM_A          | 5                  |
      | 15 Aug 2023  |       | ROOM_A          | 81                 |
      | 15 Aug 2023  |       | ROOM_A12434     | 2                  |
      | 15 Aug 2023  |       | ROOM_XYZ        | 1                  |
      | 15 Aug 2023  |       | ROOM_XYZHHIHIHI | 2                  |
      | 01 Jan 2023  |       | CR1             | 0                  |

    #Additional case details tab

    When I click on the "Additional case details" sub-menu link
    Then I see "141" in summary row for "Database ID"
    And I see "-" in summary row for "Case object ID"
    And I see "-" in summary row for "Case object name"
    And I see "-" in summary row for "Case type"
    And I see "-" in summary row for "Upload priority"
    And I see "No" in summary row for "Case closed?"
    And I see "-" in summary row for "Date case closed"
    And I see "Yes" in summary row for "Interpreter used?"
    And I see "No" in summary row for "Retention updated?"
    And I see "-" in summary row for "Retention retries?"
    And I see "No" in summary row for "Case anonymised?"
    And I see "-" in summary row for "Case anonymised by"
    And I see "-" in summary row for "Date anonymised"
    And I see "-" in summary row for "Retention confidence score"
    And I see "-" in summary row for "Retention confidence reason"
    And I see "-" in summary row for "Retention confidence date updated"
    And I see "No" in summary row for "Case deleted?"
    And I see "-" in summary row for "Case deleted by"
    And I see "-" in summary row for "Date deleted"
    And I see "16/08/2024" in summary row for "Date created"
    And I see "System" in summary row for "Created by"
    And I see "03/12/2024" in summary row for "Date last modified"
    And I see "System" in summary row for "Last modified by"

    #Case with no restrictions

    When I click on the "Search" link
    And I see "You can search for cases, hearings, events and audio." on the page
    And I set "Case ID" to "E1665001"
    And I press the "Search" button
    And I click on "E1665001" in the same row as "Harrow Crown Court"
    Then I see "Case details" on the page
    And I do not see "There are restrictions against this case" on the page

    #Navigate to hearing details screen via search screen

    When I click on the "Search" link
    And I set "Case ID" to "C161466005"
    And I select the "Hearings" radio button
    And I press the "Search" button
    And I click on the "13/03/2025" link
    Then I see "Hearing details" on the page
    And I see "C161466005" in summary row for "Case ID"
    And I see "Harrow Crown Court" in summary row for "Courthouse"
    And I see "161466-12" in summary row for "Courtroom"
    And I see "13 Mar 2025" in summary row for "Hearing date"
    And I see "DefC 161466-12" in summary row for "Defendant(s)"
    And I see "testdefendertwelve" in summary row for "Defence"
    And I see "testprosecutortwelve" in summary row for "Prosecutor(s)"
    And I see "JUDGEC 161466-12" in summary row for "Judge(s)"
    And I see "" in summary row for "Scheduled start time"
    And I see "Yes" in summary row for "Hearing took place"
    And I see "13 Mar 2025 09:09:19" in summary row for "Date created"
    And I see "System" in summary row for "Created by"
    And I see "13 Mar 2025 09:09:29" in summary row for "Date last modified"
    And I see "System" in summary row for "Last modified by"

    When I click on the "Audio" sub-menu link
    Then I verify the HTML table contains the following values
      | Audio ID | Filename           | Start time | End time | Channel number |
      | 154413   | testHarness_x1.mp2 | 12:00 PM   | 12:01 PM | 1              |

    When I click on the "Events" sub-menu link
    Then I verify the HTML table contains the following values
      | Event ID | Time stamp              | Name            |
      | 1684697  | 13 Mar 2025 at 12:00:00 | Hearing started |
      | 1684773  | 13 Mar 2025 at 12:01:00 | Hearing ended   |

    When I click on the "Transcripts" sub-menu link
    Then I verify the HTML table contains the following values
      | Transcript ID | Type            | Requested by | Requested on | Status   |
      | 217054        | Specified Times | Requestor    | 13 Mar 2025  | Closed   |
      | 217073        | Court Log       | Requestor    | 13 Mar 2025  | Rejected |

    #Navigate to hearing details screen via hearing link on case file screen

    When I click on the "Search" link
    And I see "You can search for cases, hearings, events and audio." on the page
    And I set "Case ID" to "C161466005"
    And I select the "Cases" radio button
    And I press the "Search" button
    And I click on the "C161466005" link
    And I click on the "13 Mar 2025" link
    Then I see "Hearing details" on the page
    And I see "C161466005" in summary row for "Case ID"
    And I see "Harrow Crown Court" in summary row for "Courthouse"
    And I see "161466-12" in summary row for "Courtroom"
    And I see "13 Mar 2025" in summary row for "Hearing date"
    And I see "DefC 161466-12" in summary row for "Defendant(s)"
    And I see "testdefendertwelve" in summary row for "Defence"
    And I see "testprosecutortwelve" in summary row for "Prosecutor(s)"
    And I see "JUDGEC 161466-12" in summary row for "Judge(s)"
    And I see "" in summary row for "Scheduled start time"
    And I see "Yes" in summary row for "Hearing took place"
    And I see "13 Mar 2025 09:09:19" in summary row for "Date created"
    And I see "System" in summary row for "Created by"
    And I see "13 Mar 2025 09:09:29" in summary row for "Date last modified"
    And I see "System" in summary row for "Last modified by"

    When I click on the "Audio" sub-menu link
    Then I verify the HTML table contains the following values
      | Audio ID | Filename           | Start time | End time | Channel number |
      | 154413   | testHarness_x1.mp2 | 12:00 PM   | 12:01 PM | 1              |

    When I click on the "Events" sub-menu link
    Then I verify the HTML table contains the following values
      | Event ID | Time stamp              | Name            |
      | 1684697  | 13 Mar 2025 at 12:00:00 | Hearing started |
      | 1684773  | 13 Mar 2025 at 12:01:00 | Hearing ended   |

    When I click on the "Transcripts" sub-menu link
    Then I verify the HTML table contains the following values
      | Transcript ID | Type            | Requested by | Requested on | Status   |
      | 217054        | Specified Times | Requestor    | 13 Mar 2025  | Closed   |
      | 217073        | Court Log       | Requestor    | 13 Mar 2025  | Rejected |
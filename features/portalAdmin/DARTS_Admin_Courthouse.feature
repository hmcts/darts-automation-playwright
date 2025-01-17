@admin @admin_courthouse
Feature: Admin Courthouse

  @DMP-2263 @DMP-635 @regression
  Scenario: Create a Courthouse Page - Check Details
    Given I am logged on to the admin portal as an "ADMIN" user
    Then I click on the "Courthouses" link
    And I press the "Create new courthouse" button
    And I see "Create courthouse" on the page
    Then I set "Courthouse name" to "Test Courthouse {{seq}}"
    And I set "Display name" to "Test Display Name {{seq}}"
    And I select the "Midlands" radio button
    And I select "Swansea_Transcribers" from the dropdown
    And I press the "Add company" button
    And I press the "Continue" button
    #AC1 - Review Courthouse Details
    # Then I see "Create courthouse" on the page
    And I see "Check details" on the page
    And I see "Back" on the page
    And I see "Check the courthouse name carefully, as it must exactly match the name on XHIBIT or CPP." on the page
    # And I see "Must be the same ID used on XHIBIT or CPP" on the page
    And I see "Display name" on the page
    # And I see "Details" in summary row for "Change"
    And I see "TEST COURTHOUSE {{seq}}" in summary row for "Courthouse name"
    And I see "Test Display Name {{seq}}" in summary row for "Display name"
    And I see "Midlands" in summary row for "Region"
    And I see "Swansea_Transcribers" in summary row for "Transcription companies"
    And I see "Cancel" on the page
    And I see the "Create courthouse" button
    #AC2 - Change user details
    Then I click on the "Change" link
    Then "Courthouse name" is "TEST COURTHOUSE {{seq}}"
    Then "Display name" is "Test Display Name {{seq}}"
    And I see "Midlands" on the page
    And I see "Swansea_Transcribers" on the page
    #AC3 - Cancel Courthouse Creation
    And I press the "Continue" button
    Then I click on the "Cancel" link
    And I press the "Create new courthouse" button
    And I see "Create courthouse" on the page
    #AC4 - Creating a courthouse
    Then I set "Courthouse name" to "Test Courthouse {{seq}}"
    And I set "Display name" to "Test Display Name {{seq}}"
    And I select the "Midlands" radio button
    And I select "Swansea_Transcribers" from the dropdown
    And I press the "Add company" button
    And I press the "Continue" button
    And I press the "Create courthouse" button
    Then I see "Created Test Display Name {{seq}}" on the page
    And I see "© Crown copyright" on the page

  @DMP-1192 @regression @DMP-4209
  Scenario: View Courthouse - Details Tab
    When I am logged on to the admin portal as an "ADMIN" user
    Then I click on the "Courthouses" link
    And I set "Courthouse name" to "Harrow"
    And I press the "Search" button
    # And I see "HARROW CROWN COURT" in the same row as "Harrow Crown Court"
    And I click on the "HARROW CROWN COURT" link
    And I see heading "Harrow Crown Court"
    #DMP-4209
    And I see link with text "Back"
    Then I click on the "Back" link
    And I see "Search for courthouse" on the page
    # And I see "HARROW CROWN COURT" in the same row as "Harrow Crown Court"
    And I click on the "HARROW CROWN COURT" link
    #AC1
    Then I see "Courthouse record" on the page
    And I see heading "Harrow Crown Court"
    # And I see "Harrow Crown Court" on the page
    And I see the "Edit courthouse" button
    And I see "Date created" on the page
    And I see "Thu 17 Aug 2023" on the page
    And I see "Last updated" on the page
    And I see "Thu 17 Aug 2023" on the page
    And I see "Details" on the page
    And I see link with text "Courthouse users"
    And I see "Details" on the page
    And I see "1356" in summary row for "Database ID"
    And I see "HARROW CROWN COURT" in summary row for "Courthouse name"
    And I see "No region" in summary row for "Region"
    And I see "Testgroupone" as one of many in summary row for "Groups"
    And I see "Testgrouptwo" as one of many in summary row for "Groups"
    And I see "hmcts_staff_2" as one of many in summary row for "Groups"
    And I see "hmcts_staff_5" as one of many in summary row for "Groups"
    And I see "Harrow Crown Court_REQUESTER" as one of many in summary row for "Groups"
    And I see "ITHC_Test" as one of many in summary row for "Groups"
    And I see "hmcts_staff_1" as one of many in summary row for "Groups"
    And I see "hmcts_staff_4" as one of many in summary row for "Groups"
    And I see "hmcts_staff_6" as one of many in summary row for "Groups"
    And I see "Harrow Crown Court_SUPER_ADMIN" as one of many in summary row for "Groups"
    And I see "hmcts_staff_3" as one of many in summary row for "Groups"
    And I see "Harrow Crown Court_APPROVER" as one of many in summary row for "Groups"
    And I see "Harrow Crown Court_JUDGE" as one of many in summary row for "Groups"
    And I see "© Crown copyright" on the page

  #TODO update to edit a different courthouse & save
  @DMP-2263 @regression
  Scenario: Editing a courthouse - Check details
    When I am logged on to the admin portal as an "ADMIN" user
    #AC1- Review courthouse details
    And I click on the "Courthouses" link
    And I set "Courthouse name" to "Swansea"
    And I press the "Search" button
    And I click on the "SWANSEA" link exact
    And I press the "Edit courthouse" button
    And I press the "Continue" button
    Then I see "Check details" on the page
    Then I see "Check the courthouse name carefully, as it must exactly match the name on XHIBIT or CPP." on the page
    #AC2- Change courthouse details
    And I click on "Change" in summary row for "Display name"
    And I see "Courthouse details" on the page
    And I press the "Continue" button
    And I click on "Change" in summary row for "Region"
    And I see "Courthouse details" on the page
    And I press the "Continue" button
    And I click on "Change" in summary row for "Transcription companies"
    And I see "Courthouse details" on the page
    And I press the "Continue" button
    #AC3- Cancel courthouse edit
    Then I click on the "Cancel" link
    #AC4- Save changes
    And I press the "Edit courthouse" button
    And I press the "Continue" button
    Then I see "Update courthouse" on the page

  @DMP-725 @DMP-2269 @regression
  Scenario: Search Courthouse
    When I am logged on to the admin portal as an "ADMIN" user
    And I click on the "Courthouses" link
    And I see "Search for courthouse" on the page
    And I set "Courthouse name" to "Bristol"
    Then I press the "Search" button
    And I see "4 results" on the page
    Then I click on "Courthouse name" in the table header
    And I verify the HTML table contains the following values
      | Courthouse name      | Display name         | Region     |
      | BRISTOL              | Bristol              | South West |
      | BRISTOL CITY COURTS  | Bristol City Courts  | South West |
      | DMP-2163-BRISTOL-AAA | DMP-2163-Bristol-AAA |            |
      | DMP-2163-BRISTOL-AAB | DMP-2163-Bristol-AAB |            |

    When I click on the "Clear search" link
    Then I set "Display name" to "Bristol"
    Then I press the "Search" button
    And I see "4 results" on the page
    Then I click on "Display name" in the table header
    And I verify the HTML table contains the following values
      | Courthouse name      | Display name         | Region     |
      | BRISTOL              | Bristol              | South West |
      | BRISTOL CITY COURTS  | Bristol City Courts  | South West |
      | DMP-2163-BRISTOL-AAA | DMP-2163-Bristol-AAA |            |
      | DMP-2163-BRISTOL-AAB | DMP-2163-Bristol-AAB |            |

    When I click on the "Clear search" link
    Then I set "Region" to "London"
    Then I press the "Search" button
    And I see at least 40 search results
    And I set "Courthouse name" to "guil"
    Then I press the "Search" button
    And I see "2 results" on the page
    And I verify the HTML table contains the following values
      | Courthouse name              | Display name                 | Region |
      | GUILDFORD                    | Guildford                    | London |
      | GUILDFORD CROWN COURT SITE B | Guildford Crown Court Site B | London |
    When I click on the "Clear search" link
    #    Then I set "Region" to "London"
    And I set "Courthouse name" to "guil"
    Then I press the "Search" button
    And I see "4 results" on the page
    Then I click on "Region" in the table header
    And I verify the HTML table contains the following values
      | Courthouse name               | Display name                 | Region |
      | GUILDFORD COURT               | GF Court                     |        |
      | GUILDFORD                     | Guildford                    | London |
      | GUILDFORD CROWN COURT SITE B  | Guildford Crown Court Site B | London |
      | THE CRIMINAL COURT, GUILDHALL | Swansea sitting at Guildhall | Wales  |
    Then I click on "Region" in the table header
    And I verify the HTML table contains the following values
      | Courthouse name               | Display name                 | Region |
      | THE CRIMINAL COURT, GUILDHALL | Swansea sitting at Guildhall | Wales  |
      | GUILDFORD                     | Guildford                    | London |
      | GUILDFORD CROWN COURT SITE B  | Guildford Crown Court Site B | London |
      | GUILDFORD COURT               | GF Court                     |        |
    When I click on the "Clear search" link

    #AC2 Search Courthouse-No results
    When I set "Courthouse name" to "111"
    And I press the "Search" button
    Then I see "No search results" on the page
    And I see "No courthouses can be found with the search details provided. Review your search criteria and try again." on the page
    And I click on the "Clear search" link

    When I set "Display name" to "111"
    And I press the "Search" button
    Then I see "No search results" on the page
    And I see "No courthouses can be found with the search details provided. Review your search criteria and try again." on the page
    And I click on the "Clear search" link

    When I set "Region" to "111"
    And I press the "Search" button
    Then I see "No search results" on the page
    And I see "No courthouses can be found with the search details provided. Review your search criteria and try again." on the page

  @DMP-2931 @regression
  Scenario: Remove user role from courthouse, single and multiple, test cancel link
    Given I am logged on to the admin portal as an "ADMIN" user
    #Add users roles for test
    Given I add user "Testuserfour" to group "Harrow Crown Court_REQUESTER"
    Given I add user "Testuserfive" to group "Harrow Crown Court_REQUESTER"
    Given I add user "Testusersix" to group "Harrow Crown Court_REQUESTER"

    When I click on the "Courthouses" link
    And I set "Courthouse name" to "Harrow"
    And I press the "Search" button
    And I click on the "{{upper-case-Harrow Crown Court}}" link
    And I click on the "Users" sub-menu link
    And I check the checkbox in the same row as "Testuserfour" "testuserfour@hmcts.net"
    And I press the "Remove user role" button
    Then I see "You are removing 1 user role from Harrow Crown Court" on the page

    When I click on the "Cancel" link
    Then I see "Courthouse record" on the page
    And I do not see "You are removing 1 user role from Harrow Crown Court" on the page

    When I check the checkbox in the same row as "Testuserfour" "testuserfour@hmcts.net"
    And I press the "Remove user role" button
    And I see "You are removing 1 user role from Harrow Crown Court" on the page
    And I see "Testuserfour" in the same row as "testuserfour@hmcts.net"
    And I press the "Confirm" button
    Then I see "1 user role removed from Harrow Crown Court" on the page
    And I do not see "Testuserfour" on the page

    When I check the checkbox in the same row as "Testuserfive" "testuserfive@hmcts.net"
    And I check the checkbox in the same row as "Testusersix" "testusersix@hmcts.net"
    And I press the "Remove user roles" button
    And I see "You are removing 2 user roles from Harrow Crown Court" on the page
    And I see "Testuserfive" in the same row as "testuserfive@hmcts.net"
    And I see "Testusersix" in the same row as "testusersix@hmcts.net"
    And I press the "Confirm" button
    Then I see "2 user roles removed from Harrow Crown Court" on the page
    And I do not see "Testuserfive" on the page
    And I do not see "Testusersix" on the page

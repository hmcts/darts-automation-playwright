# TO DO: This feature only obfuscates events via Admin portal currently. 
# To implement case expiry we would likely need to amend expiry date of case via DB client and then run automated job to expire case.
@portal @portal_case_expiry @regression
Feature: Case Expiry

  @regression @sequential
  Scenario: Case Expiry data creation
    Given I create a case
      | courthouse         | courtroom  | case_number | defendants     | judges          | prosecutors    | defenders    |
      | HARROW CROWN COURT | A{{seq}}-1 | A{{seq}}001 | Def A{{seq}}-1 | JUDGE {{seq}}-1 | testprosecutor | testdefender |
    Given I create an event
      | message_id | type | sub_type | event_id   | courthouse         | courtroom  | case_numbers | event_text    | date_time              | case_retention_fixed_policy | case_total_sentence |
      | {{seq}}001 | 1100 |          | {{seq}}001 | HARROW CROWN COURT | A{{seq}}-1 | A{{seq}}001  | A{{seq}}ABC-1 | {{timestamp-10:00:00}} |                             |                     |

  @regression @sequential
  Scenario: Search for event and obfuscate event text
    Given I am logged on to the admin portal as an "ADMIN" user
    When I set "Case ID" to "A{{seq}}001"
    And I select the "Events" radio button
    And I press the "Search" button
    Then I see "Events" on the page
    When I click on the first link in the results table
    Then I see "Basic details" on the page
    When I obfuscate event text for an event
    Then I should see the event obfuscation banners

  @regression @sequential
  Scenario: Search for case and verify hearing event and court log obfuscation
    Given I am logged on to DARTS as an "APPROVER" user
    And I click on the "Search" link
    And I set "Case ID" to "A{{seq}}001"
    And I press the "Search" button
    And I click on the "A{{seq}}001" link
    Then I see "Hearings" on the page
    When I click on the first link in the results table
    Then I see "The event text has been anonymised in line with HMCTS policy." on the page
    When I click on the "A{{seq}}001" link
    Then I see "Hearings" on the page
    When I click on the "Court log" link
    Then I see "Court log for this case" on the page
    And I see "The event text has been anonymised in line with HMCTS policy" on the page

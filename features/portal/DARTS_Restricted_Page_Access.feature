Feature: Restricted Page Access

  @DMP-1486 @DMP-3035 @regression @demo @sequential
  Scenario: Error for Restricted Page Access
    Given I am logged on to DARTS as a "REQUESTER" user
    And I navigate to the url "/work"
    Then I see "You do not have permission to access this page" on the page
    And I see "If you believe you should have permission, contact DTS-IT Service Desk." on the page
    And I click on the "contact DTS-IT Service Desk." link

  @DMP-1479 @regression @demo @sequential
  Scenario: Error - 404 - Page not found
    Given I am logged on to DARTS as a "external" user
    And I navigate to the url "/case/002"
    Then I see "Page not found" on the page
    And I click on the "Go to search" link
    And I see "Search for a case" on the page


@COURTLOG @SOAP_API
Feature: Add Courtlog SOAP

  @regression @sequential
  Scenario Outline: SOAP courtLog where case exists & hearing exists
    Given that courthouse "<courthouse>" case "<caseNumber>" does not exist
    Given I create a case
      | courthouse   | case_number  | defendants   | judges   | prosecutors   | defenders   |
      | <courthouse> | <caseNumber> | <defendants> | <judges> | <prosecutors> | <defenders> |
    When I add courtlogs
      | courthouse   | courtroom   | case_numbers | text                  | date       | time     |
      | <courthouse> | <courtroom> | <caseNumber> | log details {{seq}}-1 | {{date-0}} | 10:00:01 |
      | <courthouse> | <courtroom> | <caseNumber> | log details {{seq}}-2 | {{date-0}} | 11:00:01 |
    And I select column "eve.eve_id" from table "EVENT" where "cas.case_number" = "<caseNumber>" and "courthouse_name" = "<courthouse>" and "courtroom_name" = "<courtroom>" and "event_text" = "log details {{seq}}-1"
    Then I see table "EVENT" column "event_ts::time" is "{{time-10:00:01}}" where "eve.eve_id" = "{{eve.eve_id}}"
    And I see table "EVENT" column "event_name" is "LOG" where "eve.eve_id" = "{{eve.eve_id}}"
    And I see table "EVENT" column "interpreter_used" is "false" where "eve.eve_id" = "{{eve.eve_id}}"
    And I see table "EVENT" column "handler" is "StandardEventHandler" where "eve.eve_id" = "{{eve.eve_id}}"
    And I see table "EVENT" column "active" is "true" where "eve.eve_id" = "{{eve.eve_id}}"
    And I see table "EVENT" column "case_closed_ts" is "null" where "eve.eve_id" = "{{eve.eve_id}}"
    When I select column "eve.eve_id" from table "EVENT" where "cas.case_number" = "<caseNumber>" and "courthouse_name" = "<courthouse>" and "courtroom_name" = "<courtroom>" and "event_text" = "log details {{seq}}-2"
    Then I see table "EVENT" column "event_ts::time" is "{{time-11:00:01}}" where "eve.eve_id" = "{{eve.eve_id}}"
    And I see table "EVENT" column "event_name" is "LOG" where "eve.eve_id" = "{{eve.eve_id}}"
    And I see table "EVENT" column "interpreter_used" is "false" where "eve.eve_id" = "{{eve.eve_id}}"
    And I see table "EVENT" column "handler" is "StandardEventHandler" where "eve.eve_id" = "{{eve.eve_id}}"
    And I see table "EVENT" column "active" is "true" where "eve.eve_id" = "{{eve.eve_id}}"
    And I see table "EVENT" column "case_closed_ts" is "null" where "eve.eve_id" = "{{eve.eve_id}}"

    Examples:
      | courthouse         | courtroom    | caseNumber  | defendants                        | judges     | prosecutors     | defenders     |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}131 | test defendent11~test defendent22 | test judge | test prosecutor | test defender |

  @regression @sequential
  Scenario Outline: SOAP courtLog where case does not exist and the courtlog creates the case
    Given I see table "COURTCASE" column "COUNT(cas_id)" is "0" where "cas.case_number" = "<caseNumber>" and "courthouse_name" = "<courthouse>"
    When I add courtlogs
      | courthouse   | courtroom   | case_numbers | text                  | date       | time     |
      | <courthouse> | <courtroom> | <caseNumber> | log details {{seq}}-1 | {{date-0}} | 10:00:01 |
      | <courthouse> | <courtroom> | <caseNumber> | log details {{seq}}-2 | {{date-0}} | 11:00:01 |
    And I select column "eve.eve_id" from table "EVENT" where "cas.case_number" = "<caseNumber>" and "courthouse_name" = "<courthouse>" and "courtroom_name" = "<courtroom>" and "event_text" = "log details {{seq}}-1"
    Then I see table "EVENT" column "event_ts::time" is "{{time-10:00:01}}" where "eve.eve_id" = "{{eve.eve_id}}"
    And I see table "EVENT" column "event_name" is "LOG" where "eve.eve_id" = "{{eve.eve_id}}"
    And I see table "EVENT" column "interpreter_used" is "false" where "eve.eve_id" = "{{eve.eve_id}}"
    And I see table "EVENT" column "handler" is "StandardEventHandler" where "eve.eve_id" = "{{eve.eve_id}}"
    And I see table "EVENT" column "active" is "true" where "eve.eve_id" = "{{eve.eve_id}}"
    And I see table "EVENT" column "case_closed_ts" is "null" where "eve.eve_id" = "{{eve.eve_id}}"
    When I select column "eve.eve_id" from table "EVENT" where "cas.case_number" = "<caseNumber>" and "courthouse_name" = "<courthouse>" and "courtroom_name" = "<courtroom>" and "event_text" = "log details {{seq}}-2"
    Then I see table "EVENT" column "event_ts::time" is "{{time-11:00:01}}" where "eve.eve_id" = "{{eve.eve_id}}"
    And I see table "EVENT" column "event_name" is "LOG" where "eve.eve_id" = "{{eve.eve_id}}"
    And I see table "EVENT" column "interpreter_used" is "false" where "eve.eve_id" = "{{eve.eve_id}}"
    And I see table "EVENT" column "handler" is "StandardEventHandler" where "eve.eve_id" = "{{eve.eve_id}}"
    And I see table "EVENT" column "active" is "true" where "eve.eve_id" = "{{eve.eve_id}}"
    And I see table "EVENT" column "case_closed_ts" is "null" where "eve.eve_id" = "{{eve.eve_id}}"

    Examples:
      | courthouse         | courtroom    | caseNumber  | defendants                        | judges     | prosecutors     | defenders     |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}132 | test defendent11~test defendent22 | test judge | test prosecutor | test defender |

  @regression @DMP-3945 @sequential
  Scenario Outline: SOAP courtLog where courtlog creates different cases with whitespace maintained
    Given I see table "COURTCASE" column "COUNT(cas_id)" is "0" where "cas.case_number" = "  <caseNumber>  " and "courthouse_name" = "<courthouse>"
    And I see table "COURTCASE" column "COUNT(cas_id)" is "0" where "cas.case_number" = "<caseNumber>  " and "courthouse_name" = "<courthouse>"
    When I add courtlogs
      | courthouse   | courtroom   | case_numbers       | text                  | date       | time     |
      | <courthouse> | <courtroom> | "  <caseNumber>  " | log details {{seq}}-1 | {{date-0}} | 10:00:01 |
    And the API status code is 200
    When I add courtlogs
      | courthouse   | courtroom   | case_numbers     | text                  | date       | time     |
      | <courthouse> | <courtroom> | "<caseNumber>  " | log details {{seq}}-1 | {{date-0}} | 10:00:01 |
    And the API status code is 200
    And I select column "cas.cas_id" from table "COURTCASE" where "courthouse_name" = "<courthouse>" and "case_number" = "  <caseNumber>  "
    And I see table "COURTCASE" column "case_number" is "  T{{seq}}134  " where "cas.cas_id" = "{{cas.cas_id}}"
    And I select column "cas.cas_id" from table "COURTCASE" where "courthouse_name" = "<courthouse>" and "case_number" = "<caseNumber>  "
    And I see table "COURTCASE" column "case_number" is "T{{seq}}134  " where "cas.cas_id" = "{{cas.cas_id}}"

    Examples:
      | courthouse         | courtroom    | caseNumber  | defendants                        | judges     | prosecutors     | defenders     |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}134 | test defendent11~test defendent22 | test judge | test prosecutor | test defender |

  @regression @sequential
  Scenario: addLogEntry successful baseline
    Given I authenticate from the "VIQ" source system
    When I call POST SOAP API using soap action "addLogEntry" and body:
      """
      <document xmlns="">
      <![CDATA[<log_entry Y="{{yyyy-{{date-0}}}}" M="{{mm-{{date-0}}}}" D="{{dd-{{date-0}}}}" H="11" MIN="00" S="03">
      <courthouse>HARROW CROWN COURT</courthouse>
      <courtroom>Room 9335</courtroom>
      <case_numbers>
      <case_number>T{{seq}}133</case_number>
      </case_numbers>
      <text>Log Entry {{seq}} text</text>
      </log_entry>]]>
      </document>
      """
    Then the API status code is 200

  @regression @sequential
  Scenario: addLogEntry with invalid court fails
    Given I authenticate from the "VIQ" source system
    When I call POST SOAP API using soap action "addLogEntry" and body:
      """
      <document xmlns="">
      <![CDATA[<log_entry Y="{{yyyy-{{date-0}}}}" M="{{mm-{{date-0}}}}" D="{{dd-{{date-0}}}}" H="11" MIN="00" S="03">
      <courthouse>NO CROWN COURT</courthouse>
      <courtroom>Room 9335</courtroom>
      <case_numbers>
      <case_number>T0000000</case_number>
      </case_numbers>
      <text>Log Entry {{seq}} text</text>
      </log_entry>]]>
      </document>
      """
    Then the API status code is 404
    And the SOAP fault response includes "Courthouse Not Found"

  @regression @sequential
  Scenario: addLogEntry with authenticating from XHIBIT fails
    Given I authenticate from the "XHIBIT" source system
    When I call POST SOAP API using soap action "addLogEntry" and body:
      """
      <document xmlns="">
      <![CDATA[<log_entry Y="{{yyyy-{{date-0}}}}" M="{{mm-{{date-0}}}}" D="{{dd-{{date-0}}}}" H="11" MIN="00" S="03">
      <courthouse>HARROW CROWN COURT</courthouse>
      <courtroom>Room 9335</courtroom>
      <case_numbers>
      <case_number>T0000000</case_number>
      </case_numbers>
      <text>Log Entry {{seq}} text</text>
      </log_entry>]]>
      </document>
      """
    Then the API status code is 500

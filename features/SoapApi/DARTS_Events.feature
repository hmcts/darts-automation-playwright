@SOAP_API @EVENT_API @SOAP_EVENT @DMP-3060
Feature: Test operation of SOAP events

  Based on spreadsheet "handler mapping colour coded - modernised - pre-updates - 19122023.xlsx"

  All event types can be added to the same case
  interpreter_used field is true where appropriate
  hearing_is_actual field on the hearing is set to true
  handler, event_name & event_text is as expected

  @STANDARD_EVENT @regression
  @reads-and-writes-system-properties @sequential
  Scenario Outline: Create a case for event tests
    Given that courthouse "<courthouse>" case "<caseNumbers>" does not exist
    # TODO (DT): This will always fail because this the daily list scenario creates a pending (NEW) daily list for tomorrow
    # Given I wait until there is not a daily list waiting for "<courthouse>"
    Given I add a daily list
      | messageId                      | type | subType | documentName              | courthouse   | courtroom   | caseNumber    | startDate  | startTime | endDate    | timeStamp     | defendant     | judge      | prosecution     | defence      |
      | 58b211f4-426d-81be-20{{seq}}00 | DL   | DL      | DL {{date+0/}} {{seq}}201 | <courthouse> | <courtroom> | <caseNumbers> | {{date+0}} | 09:50     | {{date+0}} | {{timestamp}} | defendant one | judge name | prosecutor name | defence name |
    And I process the daily list for courthouse "<courthouse>"
    And I wait for case "<caseNumbers>" courthouse "<courthouse>"
    Examples:
      | courthouse         | courtroom    | caseNumbers |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 |

  @STANDARD_EVENT @regression @sequential
  Scenario Outline: Create standard events
    Given I authenticate from the "XHIBIT" source system
    Given I select column "cas.cas_id" from table "COURTCASE" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>"
    And I set table "darts.court_case" column "interpreter_used" to "false" where "cas_id" = "{{cas.cas_id}}"
    And I set table "darts.court_case" column "case_closed_ts" to "null" where "cas_id" = "{{cas.cas_id}}"
    And I set table "darts.hearing" column "hearing_is_actual" to "false" where "cas_id" = "{{cas.cas_id}}"
    When I create an event
      | message_id | type   | sub_type  | event_id  | courthouse   | courtroom   | case_numbers  | event_text  | date_time  | case_retention_fixed_policy | case_total_sentence |
      | <msgId>    | <type> | <subType> | <eventId> | <courthouse> | <courtroom> | <caseNumbers> | <eventText> | <dateTime> | <caseRetention>             | <totalSentence>     |
    Then I see table "EVENT" column "event_text" is "<eventText>" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>" and "message_id" = "<msgId>"
    And I see table "EVENT" column "event_name" is "<text>" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>" and "message_id" = "<msgId>"
    And I see table "EVENT" column "interpreter_used" is "false" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>" and "message_id" = "<msgId>"
    And I see table "EVENT" column "handler" is "StandardEventHandler" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>" and "message_id" = "<msgId>"
    And I see table "EVENT" column "active" is "true" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>" and "message_id" = "<msgId>"
    And I see table "EVENT" column "case_closed_ts" is "null" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>" and "message_id" = "<msgId>"
    And I see table "CASE_HEARING" column "hearing_is_actual" is "true" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>" and "courtroom_name" = "<courtroom>"
    Examples:
      | courthouse         | courtroom    | caseNumbers | dateTime               | msgId      | eventId    | type   | subType | eventText    | caseRetention | totalSentence | text                                                                                                                                   | notes |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:00:00}} | {{seq}}001 | {{seq}}001 | 1000   | 1001    | text {{seq}} |               |               | Offences put to defendant                                                                                                              |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:00:20}} | {{seq}}002 | {{seq}}002 | 1000   | 1002    | text {{seq}} |               |               | Proceedings in chambers                                                                                                                |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:00:40}} | {{seq}}003 | {{seq}}003 | 1000   | 1003    | text {{seq}} |               |               | Prosecution opened                                                                                                                     |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:01:00}} | {{seq}}004 | {{seq}}004 | 1000   | 1004    | text {{seq}} |               |               | Voir dire                                                                                                                              |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:01:20}} | {{seq}}005 | {{seq}}005 | 1000   | 1005    | text {{seq}} |               |               | Prosecution closed case                                                                                                                |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:01:40}} | {{seq}}006 | {{seq}}006 | 1000   | 1006    | text {{seq}} |               |               | Prosecution gave closing speech                                                                                                        |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:02:00}} | {{seq}}007 | {{seq}}007 | 1000   | 1007    | text {{seq}} |               |               | Defence opened case                                                                                                                    |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:02:20}} | {{seq}}008 | {{seq}}008 | 1000   | 1009    | text {{seq}} |               |               | Defence closed case                                                                                                                    |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:02:40}} | {{seq}}009 | {{seq}}009 | 1000   | 1010    | text {{seq}} |               |               | Defence gave closing speech                                                                                                            |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:03:00}} | {{seq}}010 | {{seq}}010 | 1000   | 1011    | text {{seq}} |               |               | Discussion on directions to be given to the jury                                                                                       |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:03:20}} | {{seq}}011 | {{seq}}011 | 1000   | 1012    | text {{seq}} |               |               | Discussion on juror irregularity                                                                                                       |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:03:40}} | {{seq}}012 | {{seq}}012 | 1000   | 1014    | text {{seq}} |               |               | Discussion on contempt of court issues                                                                                                 |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:04:00}} | {{seq}}013 | {{seq}}013 | 1000   | 1022    | text {{seq}} |               |               | Application: Goodyear indication                                                                                                       |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:04:20}} | {{seq}}014 | {{seq}}014 | 1000   | 1024    | text {{seq}} |               |               | Application: No case to answer                                                                                                         |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:04:40}} | {{seq}}015 | {{seq}}015 | 1000   | 1026    | text {{seq}} |               |               | Judge summing-up                                                                                                                       |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:05:00}} | {{seq}}016 | {{seq}}016 | 1000   | 1027    | text {{seq}} |               |               | Judge directed defendant                                                                                                               |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:05:20}} | {{seq}}017 | {{seq}}017 | 1000   | 1028    | text {{seq}} |               |               | Judge directed jury                                                                                                                    |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:05:40}} | {{seq}}018 | {{seq}}018 | 1000   | 1029    | text {{seq}} |               |               | Judge gave a majority direction                                                                                                        |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:06:00}} | {{seq}}019 | {{seq}}019 | 1000   | 1051    | text {{seq}} |               |               | Jury in                                                                                                                                |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:06:20}} | {{seq}}020 | {{seq}}020 | 1000   | 1052    | text {{seq}} |               |               | Jury sworn-in                                                                                                                          |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:06:40}} | {{seq}}021 | {{seq}}021 | 1000   | 1053    | text {{seq}} |               |               | Jury out                                                                                                                               |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:07:00}} | {{seq}}022 | {{seq}}022 | 1000   | 1054    | text {{seq}} |               |               | Jury retired                                                                                                                           |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:07:20}} | {{seq}}023 | {{seq}}023 | 1000   | 1056    | text {{seq}} |               |               | Jury gave verdict                                                                                                                      |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:07:40}} | {{seq}}024 | {{seq}}024 | 1000   | 1057    | text {{seq}} |               |               | Juror discharged                                                                                                                       |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:08:00}} | {{seq}}025 | {{seq}}025 | 1000   | 1058    | text {{seq}} |               |               | Jury discharged                                                                                                                        |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:08:20}} | {{seq}}026 | {{seq}}026 | 1000   | 1059    | text {{seq}} |               |               | Witness recalled                                                                                                                       |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:08:40}} | {{seq}}027 | {{seq}}027 | 1000   | 1062    | text {{seq}} |               |               | Defendant sworn-in                                                                                                                     |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:09:00}} | {{seq}}028 | {{seq}}028 | 1000   | 1063    | text {{seq}} |               |               | Defendant examination in-chief                                                                                                         |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:09:20}} | {{seq}}029 | {{seq}}029 | 1000   | 1064    | text {{seq}} |               |               | Defendant continued                                                                                                                    |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:09:40}} | {{seq}}030 | {{seq}}030 | 1000   | 1065    | text {{seq}} |               |               | Defendant cross-examined by Prosecution                                                                                                |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:10:00}} | {{seq}}031 | {{seq}}031 | 1000   | 1066    | text {{seq}} |               |               | Defendant cross-examined Defence                                                                                                       |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:10:20}} | {{seq}}032 | {{seq}}032 | 1000   | 1067    | text {{seq}} |               |               | Re-examination                                                                                                                         |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:10:40}} | {{seq}}033 | {{seq}}033 | 1000   | 1068    | text {{seq}} |               |               | Defendant released                                                                                                                     |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:11:00}} | {{seq}}034 | {{seq}}034 | 1000   | 1069    | text {{seq}} |               |               | Defendant recalled                                                                                                                     |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:11:20}} | {{seq}}035 | {{seq}}035 | 1000   | 1070    | text {{seq}} |               |               | Defendant questioned by Judge                                                                                                          |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:11:40}} | {{seq}}036 | {{seq}}036 | 2100   |         | text {{seq}} |               |               | Defendant identified                                                                                                                   |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:12:00}} | {{seq}}037 | {{seq}}037 | 2198   | 3900    | text {{seq}} |               |               | Defendant arraigned                                                                                                                    |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:12:20}} | {{seq}}038 | {{seq}}038 | 2198   | 3901    | text {{seq}} |               |               | Defendant rearraigned                                                                                                                  |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:12:40}} | {{seq}}039 | {{seq}}039 | 2198   | 3903    | text {{seq}} |               |               | Prosecution responded                                                                                                                  |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:13:00}} | {{seq}}040 | {{seq}}040 | 2198   | 3904    | text {{seq}} |               |               | Mitigation                                                                                                                             |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:13:20}} | {{seq}}041 | {{seq}}041 | 2198   | 3905    | text {{seq}} |               |               | Defence responded                                                                                                                      |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:13:40}} | {{seq}}042 | {{seq}}042 | 2198   | 3906    | text {{seq}} |               |               | Discussion on ground rules                                                                                                             |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:14:00}} | {{seq}}043 | {{seq}}043 | 2198   | 3907    | text {{seq}} |               |               | Discussion on basis of plea                                                                                                            |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:14:20}} | {{seq}}044 | {{seq}}044 | 2198   | 3918    | text {{seq}} |               |               | Point of law raised                                                                                                                    |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:14:40}} | {{seq}}045 | {{seq}}045 | 2198   | 3921    | text {{seq}} |               |               | Prosecution application: Adjourn                                                                                                       |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:15:00}} | {{seq}}046 | {{seq}}046 | 2198   | 3931    | text {{seq}} |               |               | Prosecution application: Break fixture                                                                                                 |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:15:20}} | {{seq}}047 | {{seq}}047 | 2198   | 3932    | text {{seq}} |               |               | Defence application: Break fixture                                                                                                     |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:25:00}} | {{seq}}251 | {{seq}}251 | 2198   | 3934    | text {{seq}} | 4             | 26Y0M0D       | Judge passed sentence                                                                                                                  |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:15:40}} | {{seq}}048 | {{seq}}048 | 2198   | 3935    | text {{seq}} |               |               | Judge directed Prosecution to obtain a report                                                                                          |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:16:00}} | {{seq}}049 | {{seq}}049 | 2198   | 3936    | text {{seq}} |               |               | Judge directed Defence to obtain a medical report                                                                                      |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:16:20}} | {{seq}}050 | {{seq}}050 | 2198   | 3937    | text {{seq}} |               |               | Judge directed Defence to obtain a psychiatric report                                                                                  |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:16:40}} | {{seq}}051 | {{seq}}051 | 2198   | 3938    | text {{seq}} |               |               | Judge directed Defence counsel to obtain a report                                                                                      |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:17:00}} | {{seq}}052 | {{seq}}052 | 2198   | 3940    | text {{seq}} |               |               | Judges ruling                                                                                                                          |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:17:20}} | {{seq}}053 | {{seq}}053 | 2198   | 3986    | text {{seq}} |               |               | Defence application: Adjourn                                                                                                           |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:17:40}} | {{seq}}054 | {{seq}}054 | 2199   |         | text {{seq}} |               |               | Prosecution application                                                                                                                |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:18:00}} | {{seq}}055 | {{seq}}055 | 2201   |         | text {{seq}} |               |               | Defence application                                                                                                                    |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:18:20}} | {{seq}}056 | {{seq}}056 | 2902   | 3964    | text {{seq}} |               |               | Application: Fitness to plead                                                                                                          |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:18:40}} | {{seq}}057 | {{seq}}057 | 2906   | 3968    | text {{seq}} |               |               | Witness gave pre-recorded evidence                                                                                                     |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:19:00}} | {{seq}}058 | {{seq}}058 | 2907   | 3969    | text {{seq}} |               |               | Witness read                                                                                                                           |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:19:20}} | {{seq}}059 | {{seq}}059 | 2908   | 3970    | text {{seq}} |               |               | Witness sworn-in                                                                                                                       |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:19:40}} | {{seq}}060 | {{seq}}060 | 2909   | 3971    | text {{seq}} |               |               | Witness examination in-chief                                                                                                           |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:20:00}} | {{seq}}061 | {{seq}}061 | 2910   | 3972    | text {{seq}} |               |               | Witness continued                                                                                                                      |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:20:20}} | {{seq}}062 | {{seq}}062 | 2912   | 3974    | text {{seq}} |               |               | Re-examination                                                                                                                         |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:20:40}} | {{seq}}063 | {{seq}}063 | 2913   | 3975    | text {{seq}} |               |               | Witness released                                                                                                                       |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:21:00}} | {{seq}}064 | {{seq}}064 | 2914   | 3976    | text {{seq}} |               |               | Witness questioned by Judge                                                                                                            |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:21:20}} | {{seq}}065 | {{seq}}065 | 2918   | 3980    | text {{seq}} |               |               | Intermediatory sworn-in                                                                                                                |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:21:40}} | {{seq}}066 | {{seq}}066 | 2920   | 3981    | text {{seq}} |               |               | Probation gave oral PSR                                                                                                                |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:22:00}} | {{seq}}067 | {{seq}}067 | 2933   | 3982    | text {{seq}} |               |               | Victim Personal Statement(s) read                                                                                                      |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:22:20}} | {{seq}}068 | {{seq}}068 | 2934   | 3983    | text {{seq}} |               |               | Unspecified event                                                                                                                      |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:22:40}} | {{seq}}069 | {{seq}}069 | 4101   |         | text {{seq}} |               |               | Witness cross-examined by Defence                                                                                                      |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:23:00}} | {{seq}}070 | {{seq}}070 | 4102   |         | text {{seq}} |               |               | Witness cross-examined by Prosecution                                                                                                  |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:23:20}} | {{seq}}071 | {{seq}}071 | 10200  |         | text {{seq}} |               |               | Defendant attendance                                                                                                                   |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:23:40}} | {{seq}}072 | {{seq}}072 | 10300  |         | text {{seq}} |               |               | Prosecution addresses judge                                                                                                            |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:24:00}} | {{seq}}073 | {{seq}}073 | 10400  |         | text {{seq}} |               |               | Defence addresses judge                                                                                                                |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:24:20}} | {{seq}}074 | {{seq}}074 | 20100  |         | text {{seq}} |               |               | Bench Warrant Issued                                                                                                                   |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:24:40}} | {{seq}}075 | {{seq}}075 | 20101  |         | text {{seq}} |               |               | Bench Warrant Executed                                                                                                                 |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:25:00}} | {{seq}}076 | {{seq}}076 | 20198  | 13900   | text {{seq}} |               |               | Acceptable guilty plea(s) entered late to some or all charges / counts on the charge sheet, offered for the first time by the defence. |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:25:20}} | {{seq}}077 | {{seq}}077 | 20198  | 13901   | text {{seq}} |               |               | Acceptable guilty plea(s) entered late to some or all charges / counts on the charge sheet, previously rejected by the prosecution.    |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:25:40}} | {{seq}}078 | {{seq}}078 | 20198  | 13902   | text {{seq}} |               |               | Acceptable guilty plea(s) to alternative new charge (not previously on the charge sheet), first offered by defence.                    |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:26:00}} | {{seq}}079 | {{seq}}079 | 20198  | 13903   | text {{seq}} |               |               | Acceptable guilty plea(s) to alternative new charge (not previously on the charge sheet), previously rejected by the prosecution.      |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:26:20}} | {{seq}}080 | {{seq}}080 | 20198  | 13904   | text {{seq}} |               |               | Defendant bound over, acceptable to prosecution - offered for the first by the defence.                                                |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:26:40}} | {{seq}}081 | {{seq}}081 | 20198  | 13905   | text {{seq}} |               |               | Effective Trial.                                                                                                                       |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:27:00}} | {{seq}}082 | {{seq}}082 | 20198  | 13906   | text {{seq}} |               |               | Defendant bound over, now acceptable to prosecution - previously rejected by the prosecution                                           |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:27:20}} | {{seq}}083 | {{seq}}083 | 20198  | 13907   | text {{seq}} |               |               | Unable to proceed with the trail because defendant incapable through alcohol/drugs                                                     |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:27:40}} | {{seq}}084 | {{seq}}084 | 20198  | 13908   | text {{seq}} |               |               | Defendant deceased                                                                                                                     |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:28:00}} | {{seq}}085 | {{seq}}085 | 20198  | 13909   | text {{seq}} |               |               | Prosecution end case: insufficient evidence                                                                                            |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:28:20}} | {{seq}}086 | {{seq}}086 | 20198  | 13910   | text {{seq}} |               |               | Prosecution end case: witness absent / withdrawn                                                                                       |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:28:40}} | {{seq}}087 | {{seq}}087 | 20198  | 13911   | text {{seq}} |               |               | Prosecution end case: public interest grounds                                                                                          |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:29:00}} | {{seq}}088 | {{seq}}088 | 20198  | 13912   | text {{seq}} |               |               | Prosecution end case: adjournment refused                                                                                              |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:29:20}} | {{seq}}089 | {{seq}}089 | 20198  | 13913   | text {{seq}} |               |               | Prosecution not ready: served late notice of additional evidence on defence                                                            |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:29:40}} | {{seq}}090 | {{seq}}090 | 20198  | 13914   | text {{seq}} |               |               | Prosecution not ready: specify in comments                                                                                             |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:30:00}} | {{seq}}091 | {{seq}}091 | 20198  | 13915   | text {{seq}} |               |               | Prosecution failed to disclose unused material                                                                                         |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:30:20}} | {{seq}}092 | {{seq}}092 | 20198  | 13916   | text {{seq}} |               |               | Prosecution witness absent: police                                                                                                     |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:30:40}} | {{seq}}093 | {{seq}}093 | 20198  | 13917   | text {{seq}} |               |               | Prosecution witness absent: professional / expert                                                                                      |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:31:00}} | {{seq}}094 | {{seq}}094 | 20198  | 13918   | text {{seq}} |               |               | Prosecution witness absent: other                                                                                                      |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:31:20}} | {{seq}}095 | {{seq}}095 | 20198  | 13919   | text {{seq}} |               |               | Prosecution advocate engaged in another trial                                                                                          |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:31:40}} | {{seq}}096 | {{seq}}096 | 20198  | 13920   | text {{seq}} |               |               | Prosecution advocate failed to attend                                                                                                  |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:32:00}} | {{seq}}097 | {{seq}}097 | 20198  | 13921   | text {{seq}} |               |               | Prosecution increased time estimate - insufficient time for trail to start                                                             |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:32:20}} | {{seq}}098 | {{seq}}098 | 20198  | 13922   | text {{seq}} |               |               | Defence not ready: disclosure problems                                                                                                 |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:32:40}} | {{seq}}099 | {{seq}}099 | 20198  | 13923   | text {{seq}} |               |               | Defence not ready: specify in comments (inc. no instructions)                                                                          |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:33:00}} | {{seq}}100 | {{seq}}100 | 20198  | 13924   | text {{seq}} |               |               | Defence asked for additional prosecution witness toattend                                                                              |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:33:20}} | {{seq}}101 | {{seq}}101 | 20198  | 13925   | text {{seq}} |               |               | Defence witness absent                                                                                                                 |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:33:40}} | {{seq}}102 | {{seq}}102 | 20198  | 13926   | text {{seq}} |               |               | Defendant absent - did not proceed in absence (judicial discretion)                                                                    |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:34:00}} | {{seq}}103 | {{seq}}103 | 20198  | 13927   | text {{seq}} |               |               | Defendant ill or otherwise unfit to proceed                                                                                            |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:34:20}} | {{seq}}104 | {{seq}}104 | 20198  | 13928   | text {{seq}} |               |               | Defendant not produced by PECS                                                                                                         |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:34:40}} | {{seq}}105 | {{seq}}105 | 20198  | 13929   | text {{seq}} |               |               | Defendant absent - unable to proceed as defendant not notified of place and time of hearing                                            |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:35:00}} | {{seq}}106 | {{seq}}106 | 20198  | 13930   | text {{seq}} |               |               | Defence increased time estimate - insufficient time for trial to start                                                                 |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:35:20}} | {{seq}}107 | {{seq}}107 | 20198  | 13931   | text {{seq}} |               |               | Defence advocate engaged in other trial                                                                                                |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:35:40}} | {{seq}}108 | {{seq}}108 | 20198  | 13932   | text {{seq}} |               |               | Defence advocate failed to attend                                                                                                      |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:36:00}} | {{seq}}109 | {{seq}}109 | 20198  | 13933   | text {{seq}} |               |               | Defence dismissed advocate                                                                                                             |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:36:20}} | {{seq}}110 | {{seq}}110 | 20198  | 13934   | text {{seq}} |               |               | Another case over-ran                                                                                                                  |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:36:40}} | {{seq}}111 | {{seq}}111 | 20198  | 13935   | text {{seq}} |               |               | Judge / magistrate availability                                                                                                        |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:37:00}} | {{seq}}112 | {{seq}}112 | 20198  | 13936   | text {{seq}} |               |               | Case not reached / insufficient cases drop out / floater not reached                                                                   |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:37:20}} | {{seq}}113 | {{seq}}113 | 20198  | 13937   | text {{seq}} |               |               | Equipment / accommodation                                                                                                              |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:37:40}} | {{seq}}114 | {{seq}}114 | 20198  | 13938   | text {{seq}} |               |               | No interpreter available                                                                                                               |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:38:00}} | {{seq}}115 | {{seq}}115 | 20198  | 13939   | text {{seq}} |               |               | Insufficient jurors available                                                                                                          |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:38:20}} | {{seq}}116 | {{seq}}116 | 20198  | 13940   | text {{seq}} |               |               | Outstanding committals in a magistrates court                                                                                          |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:38:40}} | {{seq}}117 | {{seq}}117 | 20198  | 13941   | text {{seq}} |               |               | Outstanding committals in a Crown Court centre                                                                                         |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:39:00}} | {{seq}}118 | {{seq}}118 | 20200  |         | text {{seq}} |               |               | Bail and custody                                                                                                                       |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:39:20}} | {{seq}}119 | {{seq}}119 | 20501  |         | text {{seq}} |               |               | Indictment to be filed                                                                                                                 |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:39:40}} | {{seq}}120 | {{seq}}120 | 20502  |         | text {{seq}} |               |               | List from plea and direction hearing                                                                                                   |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:40:00}} | {{seq}}121 | {{seq}}121 | 20503  |         | text {{seq}} |               |               | Certify readiness for trial                                                                                                            |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:40:20}} | {{seq}}122 | {{seq}}122 | 20504  |         | text {{seq}} |               |               | Directions form completed                                                                                                              |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:40:40}} | {{seq}}123 | {{seq}}123 | 20601  |         | text {{seq}} |               |               | Appellant attendance                                                                                                                   |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:41:00}} | {{seq}}124 | {{seq}}124 | 20602  |         | text {{seq}} |               |               | Respondant case opened                                                                                                                 |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:41:20}} | {{seq}}125 | {{seq}}125 | 20603  |         | text {{seq}} |               |               | Appeal witness sworn in                                                                                                                |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:41:40}} | {{seq}}126 | {{seq}}126 | 20604  |         | text {{seq}} |               |               | Appeal witness released                                                                                                                |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:42:00}} | {{seq}}127 | {{seq}}127 | 20605  |         | text {{seq}} |               |               | Respondant case closed                                                                                                                 |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:42:20}} | {{seq}}128 | {{seq}}128 | 20606  |         | text {{seq}} |               |               | Appellant case opened                                                                                                                  |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:42:40}} | {{seq}}129 | {{seq}}129 | 20607  |         | text {{seq}} |               |               | Appellant submissions                                                                                                                  |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:43:00}} | {{seq}}130 | {{seq}}130 | 20608  |         | text {{seq}} |               |               | Appellant case closed                                                                                                                  |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:43:20}} | {{seq}}131 | {{seq}}131 | 20609  |         | text {{seq}} |               |               | Bench retires                                                                                                                          |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:43:40}} | {{seq}}132 | {{seq}}132 | 20613  |         | text {{seq}} |               |               | Appeal witness continues                                                                                                               |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:44:00}} | {{seq}}133 | {{seq}}133 | 20701  |         | text {{seq}} |               |               | Application to stand out                                                                                                               |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:44:20}} | {{seq}}134 | {{seq}}134 | 20702  |         | text {{seq}} |               |               | Defence application                                                                                                                    |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:44:40}} | {{seq}}135 | {{seq}}135 | 20703  |         | text {{seq}} |               |               | Judges ruling                                                                                                                          |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:45:00}} | {{seq}}136 | {{seq}}136 | 20704  |         | text {{seq}} |               |               | Prosecution application                                                                                                                |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:45:20}} | {{seq}}137 | {{seq}}137 | 20705  |         | text {{seq}} |               |               | Other application                                                                                                                      |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:45:40}} | {{seq}}138 | {{seq}}138 | 20901  |         | text {{seq}} |               |               | Time estimate                                                                                                                          |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:46:00}} | {{seq}}139 | {{seq}}139 | 20902  |         | text {{seq}} |               |               | Jury sworn in                                                                                                                          |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:46:20}} | {{seq}}140 | {{seq}}140 | 20903  |         | text {{seq}} |               |               | Prosecution opening                                                                                                                    |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:46:40}} | {{seq}}141 | {{seq}}141 | 20904  |         | text {{seq}} |               |               | Witness sworn in                                                                                                                       |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:47:00}} | {{seq}}142 | {{seq}}142 | 20905  |         | text {{seq}} |               |               | Witness released                                                                                                                       |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:47:20}} | {{seq}}143 | {{seq}}143 | 20906  |         | text {{seq}} |               |               | Defence case opened                                                                                                                    |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:47:40}} | {{seq}}144 | {{seq}}144 | 20907  |         | text {{seq}} |               |               | Prosecution closing speech                                                                                                             |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:48:00}} | {{seq}}145 | {{seq}}145 | 20908  |         | text {{seq}} |               |               | Prosecution case closed                                                                                                                |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:48:20}} | {{seq}}146 | {{seq}}146 | 20909  |         | text {{seq}} |               |               | Defence closing speech                                                                                                                 |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:48:40}} | {{seq}}147 | {{seq}}147 | 20910  |         | text {{seq}} |               |               | Defence case closed                                                                                                                    |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:49:00}} | {{seq}}148 | {{seq}}148 | 20911  |         | text {{seq}} |               |               | Summing up                                                                                                                             |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:49:20}} | {{seq}}149 | {{seq}}149 | 20912  |         | text {{seq}} |               |               | Jury out                                                                                                                               |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:49:40}} | {{seq}}150 | {{seq}}150 | 20914  |         | text {{seq}} |               |               | Jury retire                                                                                                                            |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:50:00}} | {{seq}}151 | {{seq}}151 | 20915  |         | text {{seq}} |               |               | Jury/Juror discharged                                                                                                                  |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:50:20}} | {{seq}}152 | {{seq}}152 | 20916  |         | text {{seq}} |               |               | Judge addresses advocate                                                                                                               |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:50:40}} | {{seq}}153 | {{seq}}153 | 20918  |         | text {{seq}} |               |               | Cracked or ineffective trial                                                                                                           |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:51:00}} | {{seq}}154 | {{seq}}154 | 20920  |         | text {{seq}} |               |               | Witness continued                                                                                                                      |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:51:20}} | {{seq}}155 | {{seq}}155 | 20933  | 10622   | text {{seq}} |               |               | Judge sentences                                                                                                                        |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:51:40}} | {{seq}}156 | {{seq}}156 | 20934  | 10623   | text {{seq}} |               |               | Special measures application                                                                                                           |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:52:00}} | {{seq}}157 | {{seq}}157 | 20935  | 10630   | text {{seq}} |               |               | Witness Read                                                                                                                           |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:52:20}} | {{seq}}158 | {{seq}}158 | 20935  | 10631   | text {{seq}} |               |               | Defendant Read                                                                                                                         |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:52:40}} | {{seq}}159 | {{seq}}159 | 20935  | 10632   | text {{seq}} |               |               | Interpreter Read                                                                                                                       |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:53:00}} | {{seq}}160 | {{seq}}160 | 20935  | 10633   | text {{seq}} |               |               | Appellant Read                                                                                                                         |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:53:20}} | {{seq}}161 | {{seq}}161 | 20936  | 10630   | text {{seq}} |               |               | Witness Read                                                                                                                           |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:53:40}} | {{seq}}162 | {{seq}}162 | 20936  | 10631   | text {{seq}} |               |               | Defendant Read                                                                                                                         |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:54:00}} | {{seq}}163 | {{seq}}163 | 20936  | 10632   | text {{seq}} |               |               | Interpreter Read                                                                                                                       |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:54:20}} | {{seq}}164 | {{seq}}164 | 20936  | 10633   | text {{seq}} |               |               | Appellant Read                                                                                                                         |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:54:40}} | {{seq}}165 | {{seq}}165 | 20937  | 10624   | text {{seq}} |               |               | <Sentence remarks filmed>                                                                                                              | new   |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:55:00}} | {{seq}}166 | {{seq}}166 | 20937  | 10625   | text {{seq}} |               |               | <Sentence remarks not filmed>                                                                                                          | new   |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:55:20}} | {{seq}}167 | {{seq}}167 | 21200  | 10311   | text {{seq}} |               |               | Bail Conditions Ceased - sentence deferred                                                                                             |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:55:40}} | {{seq}}168 | {{seq}}168 | 21200  | 10312   | text {{seq}} |               |               | Bail Conditions Ceased - defendant deceased                                                                                            |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:56:00}} | {{seq}}169 | {{seq}}169 | 21200  | 10313   | text {{seq}} |               |               | Bail Conditions Ceased - non-custodial sentence imposed                                                                                |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:56:20}} | {{seq}}170 | {{seq}}170 | 21300  |         | text {{seq}} |               |               | Freetext                                                                                                                               |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:56:40}} | {{seq}}171 | {{seq}}171 | 21400  | 12414   | text {{seq}} |               |               | Defendant disqualified from working with children for life (Defendant under 18)                                                        |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:57:00}} | {{seq}}172 | {{seq}}172 | 21400  | 12415   | text {{seq}} |               |               | Defendant disqualified from working with children for life (Defendant over 18)                                                         |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:57:20}} | {{seq}}173 | {{seq}}173 | 21500  | 13700   | text {{seq}} |               |               | Defendant ordered to be electronically monitored                                                                                       |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:57:40}} | {{seq}}174 | {{seq}}174 | 21500  | 13701   | text {{seq}} |               |               | Electronic monitoring requirement amended                                                                                              |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:58:00}} | {{seq}}175 | {{seq}}175 | 21500  | 13702   | text {{seq}} |               |               | Electronic monitoring/tag to be removed                                                                                                |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:58:20}} | {{seq}}176 | {{seq}}176 | 21500  | 13703   | text {{seq}} |               |               | Defendant subject to an electronically monitored curfew                                                                                |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:58:40}} | {{seq}}177 | {{seq}}177 | 21500  | 13704   | text {{seq}} |               |               | Terms of electronically monitored curfew amended                                                                                       |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:59:00}} | {{seq}}178 | {{seq}}178 | 21500  | 13705   | text {{seq}} |               |               | Requirement for an electronically monitored curfew removed                                                                             |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:59:20}} | {{seq}}179 | {{seq}}179 | 21600  | 13600   | text {{seq}} |               |               | Sex Offenders Register - victim under 18 years of age - for an indefinite period                                                       |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-10:59:40}} | {{seq}}180 | {{seq}}180 | 21600  | 13601   | text {{seq}} |               |               | Sex Offenders Register - victim under 18 years of age - for 10 years                                                                   |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:00:00}} | {{seq}}181 | {{seq}}181 | 21600  | 13602   | text {{seq}} |               |               | Sex Offenders Register - victim under 18 years of age - for 3-7 years                                                                  |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:00:20}} | {{seq}}182 | {{seq}}182 | 21600  | 13603   | text {{seq}} |               |               | Sex Offenders Register - victim under 18 years of age - period to be specified later                                                   |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:00:40}} | {{seq}}183 | {{seq}}183 | 21600  | 13604   | text {{seq}} |               |               | Sex Offenders Register - victim under 18 years of age - for another period                                                             |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:01:00}} | {{seq}}184 | {{seq}}184 | 21600  | 13605   | text {{seq}} |               |               | Sex Offenders Register - victim over 18 years of age - for an indefinite period                                                        |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:01:20}} | {{seq}}185 | {{seq}}185 | 21600  | 13606   | text {{seq}} |               |               | Sex Offenders Register - victim over 18 years of age - for 10 years                                                                    |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:01:40}} | {{seq}}186 | {{seq}}186 | 21600  | 13607   | text {{seq}} |               |               | Sex Offenders Register - victim over 18 years of age - for 3-7 years                                                                   |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:02:00}} | {{seq}}187 | {{seq}}187 | 21600  | 13608   | text {{seq}} |               |               | Sex Offenders Register - victim over 18 years of age - for another period                                                              |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:02:20}} | {{seq}}188 | {{seq}}188 | 21600  | 13609   | text {{seq}} |               |               | Sex Offenders Register - victim over 18 years of age - period to be specified later                                                    |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:02:40}} | {{seq}}189 | {{seq}}189 | 21800  | 12310   | text {{seq}} |               |               | Disqualification from driving removed (3076)                                                                                           |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:03:00}} | {{seq}}190 | {{seq}}190 | 30601  | 11113   | text {{seq}} |               |               | Delete end hearing                                                                                                                     |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:03:20}} | {{seq}}191 | {{seq}}191 | 40203  |         | text {{seq}} |               |               | Join indictments                                                                                                                       |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:03:40}} | {{seq}}192 | {{seq}}192 | 40410  |         | text {{seq}} |               |               | Maintain charges                                                                                                                       |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:04:00}} | {{seq}}193 | {{seq}}193 | 40601  |         | text {{seq}} |               |               | 7/14 day orders                                                                                                                        |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:04:20}} | {{seq}}194 | {{seq}}194 | 40706  | 10305   | text {{seq}} |               |               | Remanded in Custody                                                                                                                    |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:04:40}} | {{seq}}195 | {{seq}}195 | 40706  | 10308   | text {{seq}} |               |               | Bail as before                                                                                                                         |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:05:00}} | {{seq}}196 | {{seq}}196 | 40706  | 10309   | text {{seq}} |               |               | Bail varied                                                                                                                            |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:05:20}} | {{seq}}197 | {{seq}}197 | 40711  |         | text {{seq}} |               |               | Time estimate supplied                                                                                                                 |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:05:40}} | {{seq}}198 | {{seq}}198 | 40720  |         | text {{seq}} |               |               | Verdict                                                                                                                                |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:06:00}} | {{seq}}199 | {{seq}}199 | 40721  |         | text {{seq}} |               |               | Verdict                                                                                                                                |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:06:20}} | {{seq}}200 | {{seq}}200 | 40722  |         | text {{seq}} |               |               | Verdict                                                                                                                                |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:06:40}} | {{seq}}201 | {{seq}}201 | 40725  |         | text {{seq}} |               |               | Verdict                                                                                                                                |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:07:00}} | {{seq}}202 | {{seq}}202 | 40726  |         | text {{seq}} |               |               | Verdict                                                                                                                                |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:07:20}} | {{seq}}203 | {{seq}}203 | 40727  |         | text {{seq}} |               |               | Verdict                                                                                                                                |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:07:40}} | {{seq}}204 | {{seq}}204 | 40730  |         | text {{seq}} |               |               | Verdict                                                                                                                                |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:08:00}} | {{seq}}205 | {{seq}}205 | 40731  |         | text {{seq}} |               |               | Verdict                                                                                                                                |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:08:20}} | {{seq}}206 | {{seq}}206 | 40732  |         | text {{seq}} |               |               | Verdict                                                                                                                                |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:08:40}} | {{seq}}207 | {{seq}}207 | 40733  |         | text {{seq}} |               |               | Verdict                                                                                                                                |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:09:00}} | {{seq}}208 | {{seq}}208 | 40736  |         | text {{seq}} |               |               | Verdict                                                                                                                                |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:09:20}} | {{seq}}209 | {{seq}}209 | 40737  |         | text {{seq}} |               |               | Verdict                                                                                                                                |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:09:40}} | {{seq}}210 | {{seq}}210 | 40738  |         | text {{seq}} |               |               | Verdict                                                                                                                                |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:10:00}} | {{seq}}211 | {{seq}}211 | 40750  | 12309   | text {{seq}} |               |               | Driving disqualification suspended pending appeal subsequent to imposition (3075)                                                      |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:10:20}} | {{seq}}212 | {{seq}}212 | 40750  |         | text {{seq}} |               |               | Sentencing                                                                                                                             |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:32:20}} | {{seq}}273 | {{seq}}273 | 40750  | 12400   | text {{seq}} | 4             | 26Y0M0D       | Disqualification Order (from working with children) - ADULTS                                                                           |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:32:40}} | {{seq}}274 | {{seq}}274 | 40750  | 12401   | text {{seq}} | 4             | 26Y0M0D       | Disqualification Order (from working with children) - JUVENILES                                                                        |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:10:40}} | {{seq}}213 | {{seq}}213 | 40751  |         | text {{seq}} |               |               | Sentencing                                                                                                                             |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:39:20}} | {{seq}}294 | {{seq}}294 | 40751  | 12400   | text {{seq}} | 4             | 26Y0M0D       | Disqualification Order (from working with children) - ADULTS                                                                           |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:39:40}} | {{seq}}295 | {{seq}}295 | 40751  | 12401   | text {{seq}} | 4             | 26Y0M0D       | Disqualification Order (from working with children) - JUVENILES                                                                        |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:11:00}} | {{seq}}214 | {{seq}}214 | 40752  |         | text {{seq}} |               |               | Sentencing                                                                                                                             |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:46:20}} | {{seq}}315 | {{seq}}315 | 40752  | 12400   | text {{seq}} | 4             | 26Y0M0D       | Disqualification Order (from working with children) - ADULTS                                                                           |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:46:40}} | {{seq}}316 | {{seq}}316 | 40752  | 12401   | text {{seq}} | 4             | 26Y0M0D       | Disqualification Order (from working with children) - JUVENILES                                                                        |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:11:20}} | {{seq}}215 | {{seq}}215 | 40753  |         | text {{seq}} |               |               | Sentencing                                                                                                                             |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:53:20}} | {{seq}}336 | {{seq}}336 | 40753  | 12400   | text {{seq}} | 4             | 26Y0M0D       | Disqualification Order (from working with children) - ADULTS                                                                           |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:53:40}} | {{seq}}337 | {{seq}}337 | 40753  | 12401   | text {{seq}} | 4             | 26Y0M0D       | Disqualification Order (from working with children) - JUVENILES                                                                        |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:11:40}} | {{seq}}216 | {{seq}}216 | 40754  |         | text {{seq}} |               |               | Sentencing                                                                                                                             |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:12:00}} | {{seq}}217 | {{seq}}217 | 40755  |         | text {{seq}} |               |               | Sentencing                                                                                                                             |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:12:20}} | {{seq}}218 | {{seq}}218 | 40756  |         | text {{seq}} |               |               | Guilty                                                                                                                                 |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:12:40}} | {{seq}}219 | {{seq}}219 | 40791  |         | text {{seq}} |               |               | Recommended for Deportation                                                                                                            |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:13:00}} | {{seq}}220 | {{seq}}220 | 60101  |         | text {{seq}} |               |               | Plea                                                                                                                                   |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:13:20}} | {{seq}}221 | {{seq}}221 | 60102  |         | text {{seq}} |               |               | Plea                                                                                                                                   |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:13:40}} | {{seq}}222 | {{seq}}222 | 60103  |         | text {{seq}} |               |               | Plea                                                                                                                                   |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:14:00}} | {{seq}}223 | {{seq}}223 | 60104  |         | text {{seq}} |               |               | Plea                                                                                                                                   |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:14:20}} | {{seq}}224 | {{seq}}224 | 60106  | 11317   | text {{seq}} |               |               | Admitted ( Bail Act Offence)                                                                                                           |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:14:40}} | {{seq}}225 | {{seq}}225 | 60106  | 11318   | text {{seq}} |               |               | Not Admitted ( Bail Act Offence)                                                                                                       |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:15:00}} | {{seq}}226 | {{seq}}226 | 302001 |         | text {{seq}} |               |               | Long adjournment                                                                                                                       |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:15:20}} | {{seq}}227 | {{seq}}227 | 302002 |         | text {{seq}} |               |               | Adjourned for pre-sentence report                                                                                                      |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:15:40}} | {{seq}}228 | {{seq}}228 | 302003 |         | text {{seq}} |               |               | Case reserved                                                                                                                          |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:16:00}} | {{seq}}229 | {{seq}}229 | 302004 |         | text {{seq}} |               |               | Case not reserved                                                                                                                      |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:16:20}} | {{seq}}230 | {{seq}}230 | 407131 |         | text {{seq}} |               |               | Case to be listed                                                                                                                      |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:16:40}} | {{seq}}231 | {{seq}}231 | 407132 |         | text {{seq}} |               |               | Case to be listed                                                                                                                      |       |


  @regression @sequential
  Scenario Outline: Create a LOG event
    Given I authenticate from the "XHIBIT" source system
    Given I select column "cas.cas_id" from table "COURTCASE" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>"
    And I set table "darts.court_case" column "interpreter_used" to "false" where "cas_id" = "{{cas.cas_id}}"
    And I set table "darts.court_case" column "case_closed_ts" to "null" where "cas_id" = "{{cas.cas_id}}"
    And I set table "darts.hearing" column "hearing_is_actual" to "false" where "cas_id" = "{{cas.cas_id}}"
    When I create an event
      | message_id | type   | sub_type  | event_id  | courthouse   | courtroom   | case_numbers  | event_text  | date_time  | case_retention_fixed_policy | case_total_sentence |
      | <msgId>    | <type> | <subType> | <eventId> | <courthouse> | <courtroom> | <caseNumbers> | <eventText> | <dateTime> | <caseRetention>             | <totalSentence>     |
    Then I see table "EVENT" column "event_text" is "<eventText>" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>" and "message_id" = "<msgId>"
    And I see table "EVENT" column "event_name" is "<text>" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>" and "message_id" = "<msgId>"
    And I see table "EVENT" column "interpreter_used" is "false" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>" and "message_id" = "<msgId>"
    And I see table "EVENT" column "handler" is "StandardEventHandler" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>" and "message_id" = "<msgId>"
    And I see table "EVENT" column "active" is "true" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>" and "message_id" = "<msgId>"
    And I see table "EVENT" column "case_closed_ts" is "null" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>" and "message_id" = "<msgId>"
    And I see table "CASE_HEARING" column "hearing_is_actual" is "true" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>" and "courtroom_name" = "<courtroom>"
    Examples:
      | courthouse         | courtroom    | caseNumbers | dateTime               | msgId      | eventId    | type | subType | eventText | caseRetention | totalSentence | text | notes |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:17:00}} | {{seq}}232 | {{seq}}232 | LOG  |         | log text  |               |               | LOG  |       |

  @regression @sequential
  Scenario Outline: Create a SetReportingRestriction event
    Given I authenticate from the "XHIBIT" source system
    Given I select column "cas.cas_id" from table "COURTCASE" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>"
    And I set table "darts.court_case" column "interpreter_used" to "false" where "cas_id" = "{{cas.cas_id}}"
    And I set table "darts.court_case" column "case_closed_ts" to "null" where "cas_id" = "{{cas.cas_id}}"
    And I set table "darts.hearing" column "hearing_is_actual" to "false" where "cas_id" = "{{cas.cas_id}}"
    When  I create an event
      | message_id | type   | sub_type  | event_id  | courthouse   | courtroom   | case_numbers  | event_text  | date_time  | case_retention_fixed_policy | case_total_sentence |
      | <msgId>    | <type> | <subType> | <eventId> | <courthouse> | <courtroom> | <caseNumbers> | <eventText> | <dateTime> | <caseRetention>             | <totalSentence>     |
    Then I see table "EVENT" column "event_text" is "<eventText>" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>" and "message_id" = "<msgId>"
    And I see table "EVENT" column "event_name" is "<text>" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>" and "message_id" = "<msgId>"
    And I see table "EVENT" column "interpreter_used" is "false" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>" and "message_id" = "<msgId>"
    And I see table "EVENT" column "handler" is "SetReportingRestrictionEventHandler" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>" and "message_id" = "<msgId>"
    And I see table "EVENT" column "active" is "true" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>" and "message_id" = "<msgId>"
    And I see table "EVENT" column "case_closed_ts" is "null" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>" and "message_id" = "<msgId>"
    And I see table "CASE_HEARING" column "hearing_is_actual" is "true" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>" and "courtroom_name" = "<courtroom>"
    Examples:
      | courthouse         | courtroom    | caseNumbers | dateTime               | msgId      | eventId    | type  | subType | eventText    | caseRetention | totalSentence | text                                                                         | notes |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:18:00}} | {{seq}}233 | {{seq}}233 | 2198  | 3933    | text {{seq}} |               |               | Judge directed on reporting restrictions                                     |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:18:20}} | {{seq}}234 | {{seq}}234 | 21200 | 11000   | text {{seq}} |               |               | Section 4(2) of the Contempt of Court Act 1981                               |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:18:40}} | {{seq}}235 | {{seq}}235 | 21200 | 11001   | text {{seq}} |               |               | Section 11 of the Contempt of Court Act 1981                                 |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:19:00}} | {{seq}}236 | {{seq}}236 | 21200 | 11002   | text {{seq}} |               |               | Section 39 of the Children and Young Persons Act 1933                        |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:19:20}} | {{seq}}237 | {{seq}}237 | 21200 | 11003   | text {{seq}} |               |               | Section 4 of the Sexual Offenders (Amendment) Act 1976                       |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:19:40}} | {{seq}}238 | {{seq}}238 | 21200 | 11004   | text {{seq}} |               |               | Section 2 of the Sexual Offenders (Amendment) Act 1992                       |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:20:00}} | {{seq}}239 | {{seq}}239 | 21200 | 11006   | text {{seq}} |               |               | An order made under s45 of the Youth Justice and Criminal Evidence Act 1999  |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:20:20}} | {{seq}}240 | {{seq}}240 | 21200 | 11007   | text {{seq}} |               |               | An order made under s45a of the Youth Justice and Criminal Evidence Act 1999 |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:20:40}} | {{seq}}241 | {{seq}}241 | 21200 | 11008   | text {{seq}} |               |               | An order made under s46 of the Youth Justice and Criminal Evidence Act 1999  |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:21:00}} | {{seq}}242 | {{seq}}242 | 21200 | 11009   | text {{seq}} |               |               | An order made under s49 of the Children and Young Persons Act 1933           |       |
      #   Lift restrictions
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:21:20}} | {{seq}}243 | {{seq}}243 | 21201 |         | text {{seq}} |               |               | Restrictions lifted                                                          |       |

  @regression @sequential
  Scenario Outline: Create a SetInterpreterUsed event
    Given I authenticate from the "XHIBIT" source system
    Given I select column "cas.cas_id" from table "COURTCASE" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>"
    And I set table "darts.court_case" column "interpreter_used" to "false" where "cas_id" = "{{cas.cas_id}}"
    And I set table "darts.hearing" column "hearing_is_actual" to "false" where "cas_id" = "{{cas.cas_id}}"
    And I set table "darts.court_case" column "case_closed_ts" to "null" where "cas_id" = "{{cas.cas_id}}"
    When  I create an event
      | message_id | type   | sub_type  | event_id  | courthouse   | courtroom   | case_numbers  | event_text  | date_time  | case_retention_fixed_policy | case_total_sentence |
      | <msgId>    | <type> | <subType> | <eventId> | <courthouse> | <courtroom> | <caseNumbers> | <eventText> | <dateTime> | <caseRetention>             | <totalSentence>     |
    Then I see table "EVENT" column "event_text" is "<eventText>" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>" and "message_id" = "<msgId>"
    And I see table "EVENT" column "event_name" is "<text>" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>" and "message_id" = "<msgId>"
    And I see table "EVENT" column "interpreter_used" is "true" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>" and "message_id" = "<msgId>"
    And I see table "EVENT" column "handler" is "InterpreterUsedHandler" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>" and "message_id" = "<msgId>"
    And I see table "EVENT" column "active" is "true" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>" and "message_id" = "<msgId>"
    And I see table "EVENT" column "case_closed_ts" is "null" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>" and "message_id" = "<msgId>"
    And I see table "CASE_HEARING" column "hearing_is_actual" is "true" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>" and "courtroom_name" = "<courtroom>"
    # TODO (DT): should these eventIds be different? They are getting treated as 3 versions of the same event because they are the same...
    Examples:
      | courthouse         | courtroom    | caseNumbers | dateTime               | msgId      | eventId    | type  | subType | eventText    | caseRetention | totalSentence | text                        | notes |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:22:00}} | {{seq}}244 | {{seq}}244 | 2917  | 3979    | text {{seq}} |               |               | Interpreter sworn-in        |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:22:20}} | {{seq}}245 | {{seq}}244 | 20612 |         | text {{seq}} |               |               | Appeal interpreter sworn in |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:22:40}} | {{seq}}246 | {{seq}}244 | 20917 |         | text {{seq}} |               |               | Interpretor sworn           |       |

  @SENTENCING_EVENT @regression @sequential
  Scenario Outline: Create a Sentencing event
    Given I authenticate from the "XHIBIT" source system
    Given I select column "cas.cas_id" from table "COURTCASE" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>"
    And I set table "darts.court_case" column "interpreter_used" to "false" where "cas_id" = "{{cas.cas_id}}"
    And I set table "darts.court_case" column "case_closed_ts" to "null" where "cas_id" = "{{cas.cas_id}}"
    And I set table "darts.hearing" column "hearing_is_actual" to "false" where "cas_id" = "{{cas.cas_id}}"
    When  I create an event
      | message_id | type   | sub_type  | event_id  | courthouse   | courtroom   | case_numbers  | event_text  | date_time  | case_retention_fixed_policy | case_total_sentence |
      | <msgId>    | <type> | <subType> | <eventId> | <courthouse> | <courtroom> | <caseNumbers> | <eventText> | <dateTime> | <caseRetention>             | <totalSentence>     |
    Then I see table "EVENT" column "event_text" is "<eventText>" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>" and "message_id" = "<msgId>"
    And I see table "EVENT" column "event_name" is "<text>" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>" and "message_id" = "<msgId>"
    And I see table "EVENT" column "handler" is "SentencingRemarksAndRetentionPolicyHandler" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>" and "message_id" = "<msgId>"
    And I see table "EVENT" column "active" is "true" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>" and "message_id" = "<msgId>"
    And I see table "EVENT" column "case_closed_ts" is "null" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>" and "message_id" = "<msgId>"
    And I see table "EVENT" column "interpreter_used" is "false" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>" and "message_id" = "<msgId>"
    And I see table "CASE_HEARING" column "hearing_is_actual" is "true" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>" and "courtroom_name" = "<courtroom>"
    Examples:
      | courthouse         | courtroom    | caseNumbers | dateTime               | msgId      | eventId    | type  | subType | eventText                  | caseRetention | totalSentence | text                                                                                           | notes |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:24:00}} | {{seq}}250 | {{seq}}250 | 3010  |         | [Defendant: DEFENDANT ONE] | 4             | 26Y0M0D       | Sentence Transcription Required                                                                |       |
      #  | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:25:20}} | {{seq}}252 | {{seq}}252 | 40730   | 10808   | [Defendant: DEFENDANT ONE] | 4             | 26Y0M0D       | Case Level Criminal Appeal Result                                                              |       |
      #  | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:25:40}} | {{seq}}253 | {{seq}}253 | 40731   | 10808   | [Defendant: DEFENDANT ONE] | 4             | 26Y0M0D       | Offence Level Criminal Appeal Result                                                           |       |
      #  | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:26:00}} | {{seq}}254 | {{seq}}254 | 40732   | 10808   | [Defendant: DEFENDANT ONE] | 4             | 26Y0M0D       | Offence Level Criminal Appeal Result with alt offence                                          |       |
      #  | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:26:20}} | {{seq}}255 | {{seq}}255 | 40733   | 10808   | [Defendant: DEFENDANT ONE] | 4             | 26Y0M0D       | Case Level Misc Appeal Result                                                                  |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:26:40}} | {{seq}}256 | {{seq}}256 | 40735 | 10808   | [Defendant: DEFENDANT ONE] | 0             | 26Y0M1D       | Delete Offence Level Appeal Result                                                             |       |
      #  | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:27:00}} | {{seq}}257 | {{seq}}257 | 40735   |         | [Defendant: DEFENDANT ONE] | 4             | 26Y0M0D       | Verdict                                                                                        |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:27:20}} | {{seq}}258 | {{seq}}258 | 40750 | 11504   | [Defendant: DEFENDANT ONE] | 1             | 26Y0M2D       | Life Imprisonment                                                                              |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:27:40}} | {{seq}}259 | {{seq}}259 | 40750 | 11505   | [Defendant: DEFENDANT ONE] | 2             | 26Y0M3D       | Life Imprisonment (with minimum period)                                                        |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:28:00}} | {{seq}}260 | {{seq}}260 | 40750 | 11506   | [Defendant: DEFENDANT ONE] | 3             | 26Y0M4D       | Custody for Life                                                                               |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:28:20}} | {{seq}}261 | {{seq}}261 | 40750 | 11507   | [Defendant: DEFENDANT ONE] | 4             | 26Y0M5D       | Mandatory Life Sentence for Second Serious Offence                                             |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:28:40}} | {{seq}}262 | {{seq}}262 | 40750 | 11508   | [Defendant: DEFENDANT ONE] | 4             | 26Y0M6D       | Mandatory Life Sentence for Second Serious Offence (Young Offender)                            |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:29:00}} | {{seq}}263 | {{seq}}263 | 40750 | 11509   | [Defendant: DEFENDANT ONE] | 4             | 26Y0M7D       | Detained During Her Majestys Pleasure                                                          |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:29:20}} | {{seq}}264 | {{seq}}264 | 40750 | 11521   | [Defendant: DEFENDANT ONE] | 4             | 26Y0M8D       | INIMP: Indeterminate Sentence of Imprisonment for Public Protection                            |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:29:40}} | {{seq}}265 | {{seq}}265 | 40750 | 11522   | [Defendant: DEFENDANT ONE] | 4             | 26Y0M9D       | INDET: Indeterminate Sentence of Detention for Public Protection                               |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:30:00}} | {{seq}}266 | {{seq}}266 | 40750 | 11523   | [Defendant: DEFENDANT ONE] | 4             | 26Y0M10D      | Mandatory Life Sentence for Second Listed Offence                                              |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:30:20}} | {{seq}}267 | {{seq}}267 | 40750 | 11524   | [Defendant: DEFENDANT ONE] | 4             | 26Y0M11D      | Mandatory Life Sentence for Second Listed Offence (Young Offender)                             |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:30:40}} | {{seq}}268 | {{seq}}268 | 40750 | 11525   | [Defendant: DEFENDANT ONE] | 4             | 26Y0M12D      | Imprisonment - Extended under s236A CJA2003                                                    |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:31:00}} | {{seq}}269 | {{seq}}269 | 40750 | 11526   | [Defendant: DEFENDANT ONE] | 4             | 26Y0M13D      | Imprisonment - Minimum Imposed after 3 strikes (Young Offender) - Extended under s236A CJA2003 |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:31:20}} | {{seq}}270 | {{seq}}270 | 40750 | 11527   | [Defendant: DEFENDANT ONE] | 4             | 26Y0M14D      | Imprisonment - Minimum Imposed after 3 strikes - Extended under s236A CJA2003                  |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:31:40}} | {{seq}}271 | {{seq}}271 | 40750 | 11528   | [Defendant: DEFENDANT ONE] | 4             | 26Y0M15D      | Detention in Y.O.I. - Extended under s235A CJA2003                                             |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:32:00}} | {{seq}}272 | {{seq}}272 | 40750 | 11529   | [Defendant: DEFENDANT ONE] | 4             | 26Y0M16D      | Detention for Life under s226 (u18)                                                            |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:33:00}} | {{seq}}275 | {{seq}}275 | 40750 | 13503   | [Defendant: DEFENDANT ONE] | 4             | 26Y0M17D      | S226a Extended Discretional for over 18                                                        |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:33:20}} | {{seq}}276 | {{seq}}276 | 40750 | 13504   | [Defendant: DEFENDANT ONE] | 4             | 26Y0M18D      | S226a Extended Automatic for over 18                                                           |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:33:40}} | {{seq}}277 | {{seq}}277 | 40750 | 13505   | [Defendant: DEFENDANT ONE] | 4             | 26Y0M19D      | S226b Extended Discretional for under 18                                                       |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:34:00}} | {{seq}}278 | {{seq}}278 | 40750 | 13506   | [Defendant: DEFENDANT ONE] | 4             | 26Y0M20D      | S226b Extended Automatic for under 18                                                          |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:34:20}} | {{seq}}279 | {{seq}}279 | 40751 | 11504   | [Defendant: DEFENDANT ONE] | 4             | 26Y0M21D      | Life Imprisonment                                                                              |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:34:40}} | {{seq}}280 | {{seq}}280 | 40751 | 11505   | [Defendant: DEFENDANT ONE] | 4             | 26Y0M22D      | Life Imprisonment (with minimum period)                                                        |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:35:00}} | {{seq}}281 | {{seq}}281 | 40751 | 11506   | [Defendant: DEFENDANT ONE] | 4             | 26Y0M23D      | Custody for Life                                                                               |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:35:20}} | {{seq}}282 | {{seq}}282 | 40751 | 11507   | [Defendant: DEFENDANT ONE] | 4             | 26Y0M24D      | Mandatory Life Sentence for Second Serious Offence                                             |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:35:40}} | {{seq}}283 | {{seq}}283 | 40751 | 11508   | [Defendant: DEFENDANT ONE] | 4             | 26Y0M25D      | Mandatory Life Sentence for Second Serious Offence (Young Offender)                            |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:36:00}} | {{seq}}284 | {{seq}}284 | 40751 | 11509   | [Defendant: DEFENDANT ONE] | 4             | 26Y0M26D      | Detained During Her Majestys Pleasure                                                          |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:36:20}} | {{seq}}285 | {{seq}}285 | 40751 | 11521   | [Defendant: DEFENDANT ONE] | 4             | 26Y0M27D      | INIMP: Indeterminate Sentence of Imprisonment for Public Protection                            |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:36:40}} | {{seq}}286 | {{seq}}286 | 40751 | 11522   | [Defendant: DEFENDANT ONE] | 4             | 26Y0M28D      | INDET: Indeterminate Sentence of Detention for Public Protection                               |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:37:00}} | {{seq}}287 | {{seq}}287 | 40751 | 11523   | [Defendant: DEFENDANT ONE] | 4             | 26Y1M1D       | Mandatory Life Sentence for Second Listed Offence                                              |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:37:20}} | {{seq}}288 | {{seq}}288 | 40751 | 11524   | [Defendant: DEFENDANT ONE] | 4             | 26Y1M2D       | Mandatory Life Sentence for Second Listed Offence (Young Offender)                             |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:37:40}} | {{seq}}289 | {{seq}}289 | 40751 | 11525   | [Defendant: DEFENDANT ONE] | 4             | 26Y1M3D       | Imprisonment - Extended under s236A CJA2003                                                    |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:38:00}} | {{seq}}290 | {{seq}}290 | 40751 | 11526   | [Defendant: DEFENDANT ONE] | 4             | 26Y1M4D       | Imprisonment - Minimum Imposed after 3 strikes (Young Offender) - Extended under s236A CJA2003 |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:38:20}} | {{seq}}291 | {{seq}}291 | 40751 | 11527   | [Defendant: DEFENDANT ONE] | 4             | 26Y1M5D       | Imprisonment - Minimum Imposed after 3 strikes - Extended under s236A CJA2003                  |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:38:40}} | {{seq}}292 | {{seq}}292 | 40751 | 11528   | [Defendant: DEFENDANT ONE] | 4             | 26Y1M6D       | Detention in Y.O.I. - Extended under s235A CJA2003                                             |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:39:00}} | {{seq}}293 | {{seq}}293 | 40751 | 11529   | [Defendant: DEFENDANT ONE] | 4             | 26Y1M7D       | Detention for Life under s226 (u18)                                                            |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:40:00}} | {{seq}}296 | {{seq}}296 | 40751 | 13503   | [Defendant: DEFENDANT ONE] | 4             | 26Y1M8D       | S226a Extended Discretional for over 18                                                        |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:40:20}} | {{seq}}297 | {{seq}}297 | 40751 | 13504   | [Defendant: DEFENDANT ONE] | 4             | 26Y1M9D       | S226a Extended Automatic for over 18                                                           |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:40:40}} | {{seq}}298 | {{seq}}298 | 40751 | 13505   | [Defendant: DEFENDANT ONE] | 4             | 26Y1M10D      | S226b Extended Discretional for under 18                                                       |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:41:00}} | {{seq}}299 | {{seq}}299 | 40751 | 13506   | [Defendant: DEFENDANT ONE] | 4             | 26Y1M11D      | S226b Extended Automatic for under 18                                                          |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:41:20}} | {{seq}}300 | {{seq}}300 | 40752 | 11504   | [Defendant: DEFENDANT ONE] | 4             | 26Y1M12D      | Life Imprisonment                                                                              |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:41:40}} | {{seq}}301 | {{seq}}301 | 40752 | 11505   | [Defendant: DEFENDANT ONE] | 4             | 26Y1M13D      | Life Imprisonment (with minimum period)                                                        |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:42:00}} | {{seq}}302 | {{seq}}302 | 40752 | 11506   | [Defendant: DEFENDANT ONE] | 4             | 26Y1M14D      | Custody for Life                                                                               |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:42:20}} | {{seq}}303 | {{seq}}303 | 40752 | 11507   | [Defendant: DEFENDANT ONE] | 4             | 26Y1M15D      | Mandatory Life Sentence for Second Serious Offence                                             |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:42:40}} | {{seq}}304 | {{seq}}304 | 40752 | 11508   | [Defendant: DEFENDANT ONE] | 4             | 26Y1M16D      | Mandatory Life Sentence for Second Serious Offence (Young Offender)                            |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:43:00}} | {{seq}}305 | {{seq}}305 | 40752 | 11509   | [Defendant: DEFENDANT ONE] | 4             | 26Y1M17D      | Detained During Her Majestys Pleasure                                                          |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:43:20}} | {{seq}}306 | {{seq}}306 | 40752 | 11521   | [Defendant: DEFENDANT ONE] | 4             | 26Y1M18D      | INIMP: Indeterminate Sentence of Imprisonment for Public Protection                            |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:43:40}} | {{seq}}307 | {{seq}}307 | 40752 | 11522   | [Defendant: DEFENDANT ONE] | 4             | 26Y1M19D      | INDET: Indeterminate Sentence of Detention for Public Protection                               |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:44:00}} | {{seq}}308 | {{seq}}308 | 40752 | 11523   | [Defendant: DEFENDANT ONE] | 4             | 26Y1M20D      | Mandatory Life Sentence for Second Listed Offence                                              |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:44:20}} | {{seq}}309 | {{seq}}309 | 40752 | 11524   | [Defendant: DEFENDANT ONE] | 4             | 26Y1M21D      | Mandatory Life Sentence for Second Listed Offence (Young Offender)                             |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:44:40}} | {{seq}}310 | {{seq}}310 | 40752 | 11525   | [Defendant: DEFENDANT ONE] | 4             | 26Y1M22D      | Imprisonment - Extended under s236A CJA2003                                                    |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:45:00}} | {{seq}}311 | {{seq}}311 | 40752 | 11526   | [Defendant: DEFENDANT ONE] | 4             | 26Y1M23D      | Imprisonment - Minimum Imposed after 3 strikes (Young Offender) - Extended under s236A CJA2003 |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:45:20}} | {{seq}}312 | {{seq}}312 | 40752 | 11527   | [Defendant: DEFENDANT ONE] | 4             | 26Y1M24D      | Imprisonment - Minimum Imposed after 3 strikes - Extended under s236A CJA2003                  |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:45:40}} | {{seq}}313 | {{seq}}313 | 40752 | 11528   | [Defendant: DEFENDANT ONE] | 4             | 26Y1M25D      | Detention in Y.O.I. - Extended under s235A CJA2003                                             |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:46:00}} | {{seq}}314 | {{seq}}314 | 40752 | 11529   | [Defendant: DEFENDANT ONE] | 4             | 26Y1M26D      | Detention for Life under s226 (u18)                                                            |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:47:00}} | {{seq}}317 | {{seq}}317 | 40752 | 13503   | [Defendant: DEFENDANT ONE] | 4             | 26Y1M27D      | S226a Extended Discretional for over 18                                                        |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:47:20}} | {{seq}}318 | {{seq}}318 | 40752 | 13504   | [Defendant: DEFENDANT ONE] | 4             | 26Y1M28D      | S226a Extended Automatic for over 18                                                           |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:47:40}} | {{seq}}319 | {{seq}}319 | 40752 | 13505   | [Defendant: DEFENDANT ONE] | 4             | 26Y2M1D       | S226b Extended Discretional for under 18                                                       |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:48:00}} | {{seq}}320 | {{seq}}320 | 40752 | 13506   | [Defendant: DEFENDANT ONE] | 4             | 26Y2M2D       | S226b Extended Automatic for under 18                                                          |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:48:20}} | {{seq}}321 | {{seq}}321 | 40753 | 11504   | [Defendant: DEFENDANT ONE] | 4             | 26Y2M3D       | Life Imprisonment                                                                              |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:48:40}} | {{seq}}322 | {{seq}}322 | 40753 | 11505   | [Defendant: DEFENDANT ONE] | 4             | 26Y2M4D       | Life Imprisonment (with minimum period)                                                        |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:49:00}} | {{seq}}323 | {{seq}}323 | 40753 | 11506   | [Defendant: DEFENDANT ONE] | 4             | 26Y2M5D       | Custody for Life                                                                               |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:49:20}} | {{seq}}324 | {{seq}}324 | 40753 | 11507   | [Defendant: DEFENDANT ONE] | 4             | 26Y2M6D       | Mandatory Life Sentence for Second Serious Offence                                             |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:49:40}} | {{seq}}325 | {{seq}}325 | 40753 | 11508   | [Defendant: DEFENDANT ONE] | 4             | 26Y2M7D       | Mandatory Life Sentence for Second Serious Offence (Young Offender)                            |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:50:00}} | {{seq}}326 | {{seq}}326 | 40753 | 11509   | [Defendant: DEFENDANT ONE] | 4             | 26Y2M8D       | Detained During Her Majestys Pleasure                                                          |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:50:20}} | {{seq}}327 | {{seq}}327 | 40753 | 11521   | [Defendant: DEFENDANT ONE] | 4             | 26Y2M9D       | INIMP: Indeterminate Sentence of Imprisonment for Public Protection                            |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:50:40}} | {{seq}}328 | {{seq}}328 | 40753 | 11522   | [Defendant: DEFENDANT ONE] | 4             | 26Y2M10D      | INDET: Indeterminate Sentence of Detention for Public Protection                               |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:51:00}} | {{seq}}329 | {{seq}}329 | 40753 | 11523   | [Defendant: DEFENDANT ONE] | 4             | 26Y2M11D      | Mandatory Life Sentence for Second Listed Offence                                              |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:51:20}} | {{seq}}330 | {{seq}}330 | 40753 | 11524   | [Defendant: DEFENDANT ONE] | 4             | 26Y2M12D      | Mandatory Life Sentence for Second Listed Offence (Young Offender)                             |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:51:40}} | {{seq}}331 | {{seq}}331 | 40753 | 11525   | [Defendant: DEFENDANT ONE] | 4             | 26Y2M13D      | Imprisonment - Extended under s236A CJA2003                                                    |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:52:00}} | {{seq}}332 | {{seq}}332 | 40753 | 11526   | [Defendant: DEFENDANT ONE] | 4             | 26Y2M14D      | Imprisonment - Minimum Imposed after 3 strikes (Young Offender) - Extended under s236A CJA2003 |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:52:20}} | {{seq}}333 | {{seq}}333 | 40753 | 11527   | [Defendant: DEFENDANT ONE] | 4             | 26Y2M15D      | Imprisonment - Minimum Imposed after 3 strikes - Extended under s236A CJA2003                  |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:52:40}} | {{seq}}334 | {{seq}}334 | 40753 | 11528   | [Defendant: DEFENDANT ONE] | 4             | 26Y2M16D      | Detention in Y.O.I. - Extended under s235A CJA2003                                             |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:53:00}} | {{seq}}335 | {{seq}}335 | 40753 | 11529   | [Defendant: DEFENDANT ONE] | 4             | 26Y2M17D      | Detention for Life under s226 (u18)                                                            |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:54:00}} | {{seq}}338 | {{seq}}338 | 40753 | 13503   | [Defendant: DEFENDANT ONE] | 4             | 26Y2M18D      | S226a Extended Discretional for over 18                                                        |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:54:20}} | {{seq}}339 | {{seq}}339 | 40753 | 13504   | [Defendant: DEFENDANT ONE] | 4             | 26Y2M19D      | S226a Extended Automatic for over 18                                                           |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:54:40}} | {{seq}}340 | {{seq}}340 | 40753 | 13505   | [Defendant: DEFENDANT ONE] | 4             | 26Y2M20D      | S226b Extended Discretional for under 18                                                       |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:55:00}} | {{seq}}341 | {{seq}}341 | 40753 | 13506   | [Defendant: DEFENDANT ONE] | 4             | 26Y2M21D      | S226b Extended Automatic for under 18                                                          |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:55:20}} | {{seq}}342 | {{seq}}342 | 40750 | 11533   | [Defendant: DEFENDANT ONE] | 4             | 26Y2M22D      | Imprisonment for life (adult) for manslaughter of an emergency worker                          |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:55:40}} | {{seq}}343 | {{seq}}343 | 40750 | 11534   | [Defendant: DEFENDANT ONE] | 4             | 26Y2M23D      | Detention for life (youth) for manslaughter of an emergency worker                             |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:56:00}} | {{seq}}344 | {{seq}}344 | 40750 | 13507   | [Defendant: DEFENDANT ONE] | 4             | 26Y2M24D      | (Extended Discretional 18 to 20)   Section 266                                                 |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:56:20}} | {{seq}}345 | {{seq}}345 | 40750 | 13508   | [Defendant: DEFENDANT ONE] | 4             | 26Y2M25D      | (Extended Discretional over 21)                                                                |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:56:40}} | {{seq}}346 | {{seq}}346 | 40751 | 11533   | [Defendant: DEFENDANT ONE] | 4             | 26Y2M26D      | Imprisonment for life (adult) for manslaughter of an emergency worker                          |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:57:00}} | {{seq}}347 | {{seq}}347 | 40751 | 11534   | [Defendant: DEFENDANT ONE] | 4             | 26Y2M27D      | Detention for life (youth) for manslaughter of an emergency worker                             |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:57:20}} | {{seq}}348 | {{seq}}348 | 40751 | 13507   | [Defendant: DEFENDANT ONE] | 4             | 26Y2M28D      | (Extended Discretional 18 to 20)   Section 266                                                 |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:57:40}} | {{seq}}349 | {{seq}}349 | 40751 | 13508   | [Defendant: DEFENDANT ONE] | 4             | 26Y3M1D       | (Extended Discretional over 21)                                                                |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:58:00}} | {{seq}}350 | {{seq}}350 | 40752 | 11533   | [Defendant: DEFENDANT ONE] | 4             | 26Y3M2D       | Imprisonment for life (adult) for manslaughter of an emergency worker                          |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:58:20}} | {{seq}}351 | {{seq}}351 | 40752 | 11534   | [Defendant: DEFENDANT ONE] | 4             | 26Y3M3D       | Detention for life (youth) for manslaughter of an emergency worker                             |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:58:40}} | {{seq}}352 | {{seq}}352 | 40752 | 13507   | [Defendant: DEFENDANT ONE] | 4             | 26Y3M4D       | (Extended Discretional 18 to 20)   Section 266                                                 |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:59:00}} | {{seq}}353 | {{seq}}353 | 40752 | 13508   | [Defendant: DEFENDANT ONE] | 4             | 26Y3M5D       | (Extended Discretional over 21)                                                                |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:59:20}} | {{seq}}354 | {{seq}}354 | 40753 | 11533   | [Defendant: DEFENDANT ONE] | 4             | 26Y3M6D       | Imprisonment for life (adult) for manslaughter of an emergency worker                          |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:59:40}} | {{seq}}355 | {{seq}}355 | 40753 | 11534   | [Defendant: DEFENDANT ONE] | 4             | 26Y3M7D       | Detention for life (youth) for manslaughter of an emergency worker                             |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-12:00:00}} | {{seq}}356 | {{seq}}356 | 40753 | 13507   | [Defendant: DEFENDANT ONE] | 4             | 26Y3M8D       | (Extended Discretional 18 to 20)   Section 266                                                 |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-12:00:20}} | {{seq}}357 | {{seq}}357 | 40753 | 13508   | [Defendant: DEFENDANT ONE] | 4             | 26Y3M9D       | (Extended Discretional over 21)                                                                |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-12:00:40}} | {{seq}}358 | {{seq}}358 | 40754 | 11533   | [Defendant: DEFENDANT ONE] | 4             | 26Y3M10D      | Imprisonment for life (adult) for manslaughter of an emergency worker                          |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-12:01:00}} | {{seq}}359 | {{seq}}359 | 40754 | 11534   | [Defendant: DEFENDANT ONE] | 4             | 26Y3M11D      | Detention for life (youth) for manslaughter of an emergency worker                             |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-12:01:20}} | {{seq}}360 | {{seq}}360 | 40754 | 13507   | [Defendant: DEFENDANT ONE] | 4             | 26Y3M12D      | (Extended Discretional 18 to 20)   Section 266                                                 |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-12:01:40}} | {{seq}}361 | {{seq}}361 | 40754 | 13508   | [Defendant: DEFENDANT ONE] | 4             | 26Y3M13D      | (Extended Discretional over 21)                                                                |       |
  #  | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-12:02:00}} | {{seq}}362 | {{seq}}362 | DETTO   | 11531   | [Defendant: DEFENDANT ONE] | 4             | 26Y0M0D      | Special Sentence of Detention for Terrorist Offenders of Particular Concern                    |       |
  #  | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-12:02:20}} | {{seq}}363 | {{seq}}363 | STS     | 11530   | [Defendant: DEFENDANT ONE] | 4             | 26Y0M0D       | Serious Terrorism Sentence                                                                     |       |
  #  | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-12:02:40}} | {{seq}}364 | {{seq}}364 | STS1821 | 11532   | [Defendant: DEFENDANT ONE] | 4             | 26Y0M0D       | Serious Terrorism Sentence 18 to 21                                                            |       |


  @regression @sequential
  Scenario Outline: Create a DarStart event
    Given I authenticate from the "XHIBIT" source system
    Given I select column "cas.cas_id" from table "COURTCASE" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>"
    And I set table "darts.court_case" column "interpreter_used" to "false" where "cas_id" = "{{cas.cas_id}}"
    And I set table "darts.court_case" column "case_closed_ts" to "null" where "cas_id" = "{{cas.cas_id}}"
    And I set table "darts.hearing" column "hearing_is_actual" to "false" where "cas_id" = "{{cas.cas_id}}"
    When  I create an event
      | message_id | type   | sub_type  | event_id  | courthouse   | courtroom   | case_numbers  | event_text  | date_time  | case_retention_fixed_policy | case_total_sentence |
      | <msgId>    | <type> | <subType> | <eventId> | <courthouse> | <courtroom> | <caseNumbers> | <eventText> | <dateTime> | <caseRetention>             | <totalSentence>     |
    Then I see table "EVENT" column "event_text" is "<eventText>" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>" and "message_id" = "<msgId>"
    And I see table "EVENT" column "event_name" is "<text>" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>" and "message_id" = "<msgId>"
    And I see table "EVENT" column "handler" is "DarStartHandler" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>" and "message_id" = "<msgId>"
    And I see table "EVENT" column "active" is "true" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>" and "message_id" = "<msgId>"
    And I see table "EVENT" column "interpreter_used" is "false" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>" and "message_id" = "<msgId>"
    And I see table "CASE_HEARING" column "hearing_is_actual" is "true" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>" and "courtroom_name" = "<courtroom>"
    And I see table "EVENT" column "case_closed_ts" is "null" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>" and "message_id" = "<msgId>"
    Examples:
      | courthouse         | courtroom    | caseNumbers | dateTime               | msgId      | eventId    | type  | subType | eventText    | caseRetention | totalSentence | text            | notes |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-12:03:00}} | {{seq}}365 | {{seq}}365 | 1000  | 1055    | text {{seq}} |               |               | Jury returned   |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-12:03:20}} | {{seq}}366 | {{seq}}366 | 1100  |         | text {{seq}} |               |               | Hearing started |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-12:03:40}} | {{seq}}367 | {{seq}}367 | 1500  |         | text {{seq}} |               |               | Hearing resumed |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-12:04:00}} | {{seq}}368 | {{seq}}368 | 10100 |         | text {{seq}} |               |               | Case called on  |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-12:04:20}} | {{seq}}369 | {{seq}}369 | 10500 |         | text {{seq}} |               |               | Resume          |       |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-12:04:40}} | {{seq}}370 | {{seq}}370 | 20913 |         | text {{seq}} |               |               | Jury returns    |       |

  @regression @sequential
  Scenario Outline: Create a DarStop event
    Given I authenticate from the "XHIBIT" source system
    Given I select column "cas.cas_id" from table "COURTCASE" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>"
    And I set table "darts.court_case" column "interpreter_used" to "false" where "cas_id" = "{{cas.cas_id}}"
    And I set table "darts.court_case" column "case_closed_ts" to "null" where "cas_id" = "{{cas.cas_id}}"
    And I set table "darts.hearing" column "hearing_is_actual" to "false" where "cas_id" = "{{cas.cas_id}}"
    When  I create an event
      | message_id | type   | sub_type  | event_id  | courthouse   | courtroom   | case_numbers  | event_text  | date_time  | case_retention_fixed_policy | case_total_sentence |
      | <msgId>    | <type> | <subType> | <eventId> | <courthouse> | <courtroom> | <caseNumbers> | <eventText> | <dateTime> | <caseRetention>             | <totalSentence>     |
    Then I see table "EVENT" column "event_text" is "<eventText>" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>" and "message_id" = "<msgId>"
    And I see table "EVENT" column "event_name" is "<text>" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>" and "message_id" = "<msgId>"
    And I see table "EVENT" column "handler" is "DarStopHandler" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>" and "message_id" = "<msgId>"
    And I see table "EVENT" column "active" is "true" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>" and "message_id" = "<msgId>"
    And I see table "EVENT" column "interpreter_used" is "false" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>" and "message_id" = "<msgId>"
    And I see table "EVENT" column "case_closed_ts" is "null" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>" and "message_id" = "<msgId>"
    And I see table "CASE_HEARING" column "hearing_is_actual" is "true" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>" and "courtroom_name" = "<courtroom>"
    Examples:
      | courthouse         | courtroom    | caseNumbers | dateTime               | msgId      | eventId    | type  | subType | eventText    | caseRetention | totalSentence | text              | notes                  |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-12:06:00}} | {{seq}}372 | {{seq}}372 | 1200  |         | text {{seq}} |               |               | Hearing ended     |                        |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-12:06:20}} | {{seq}}373 | {{seq}}373 | 1400  |         | text {{seq}} |               |               | Hearing paused    |                        |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-12:06:40}} | {{seq}}374 | {{seq}}374 | 30100 |         | text {{seq}} |               |               | Short adjournment |                        |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:23:20}} | {{seq}}248 | {{seq}}248 | 30500 |         | text {{seq}} |               |               | Hearing ended     | ex StopAndCloseHandler |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-11:23:40}} | {{seq}}249 | {{seq}}249 | 30600 |         | text {{seq}} |               |               | Hearing ended     | ex StopAndCloseHandler |

  @regression @retention
  @reads-and-writes-system-properties @sequential
  Scenario Outline: Create a StopAndClose event for custodial sentence - not life
    retention is 7 years or length of sentence
    Only 1 stop & close event per case is used to verify that a case_retention row is created
    Test creates a courtroom & hearing for each case
    # TODO (DT): This will always fail because this the daily list scenario creates a pending (NEW) daily list for tomorrow
    # Given I wait until there is not a daily list waiting for "<courthouse>"
    Given I authenticate from the "XHIBIT" source system
    Given that courthouse "<courthouse>" case "<caseNumbers>" does not exist
    Given I add a daily list
      | messageId                      | type | subType | documentName              | courthouse   | courtroom   | caseNumber    | startDate  | startTime | endDate    | timeStamp     | defendant     | judge      | prosecution     | defence      |
      | 58b211f4-426d-81be-21{{seq}}00 | DL   | DL      | DL {{date+0/}} {{seq}}211 | <courthouse> | <courtroom> | <caseNumbers> | {{date+0}} | 09:50     | {{date+0}} | {{timestamp}} | defendant one | judge name | prosecutor name | defence name |
    And I process the daily list for courthouse "<courthouse>"
    And I wait for case "<caseNumbers>" courthouse "<courthouse>"
    Given I select column "cas.cas_id" from table "COURTCASE" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>"
    And I see table "darts.court_case" column "interpreter_used" is "false" where "cas_id" = "{{cas.cas_id}}"
    And I see table "darts.court_case" column "case_closed_ts" is "null" where "cas_id" = "{{cas.cas_id}}"
    When  I create an event
      | message_id | type   | sub_type  | event_id  | courthouse   | courtroom   | case_numbers  | event_text  | date_time  | case_retention_fixed_policy | case_total_sentence |
      | <msgId>    | <type> | <subType> | <eventId> | <courthouse> | <courtroom> | <caseNumbers> | <eventText> | <dateTime> | <caseRetention>             | <totalSentence>     |
    Then I see table "EVENT" column "event_text" is "<eventText>" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>" and "message_id" = "<msgId>"
    And I see table "EVENT" column "event_name" is "<text>" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>" and "message_id" = "<msgId>"
    And I see table "EVENT" column "handler" is "StopAndCloseHandler" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>" and "message_id" = "<msgId>"
    And I see table "EVENT" column "active" is "true" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>" and "message_id" = "<msgId>"
    And I see table "EVENT" column "case_closed_ts" is "not null" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>" and "message_id" = "<msgId>"
    And I see table "EVENT" column "interpreter_used" is "false" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>" and "message_id" = "<msgId>"
    And I see table "CASE_HEARING" column "hearing_is_actual" is "true" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>" and "courtroom_name" = "<courtroom>"
    And I select column "eve.eve_id" from table "EVENT" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>" and "message_id" = "<msgId>"
    And I see table "CASE_MANAGEMENT_RETENTION" column "total_sentence" is "<totalSentence>" where "eve_id" = "{{eve.eve_id}}"
    And I see table "CASE_MANAGEMENT_RETENTION" column "fixed_policy_key" is "<caseRetention>" where "eve_id" = "{{eve.eve_id}}"
    And I select column "cmr_id" from table "CASE_MANAGEMENT_RETENTION" where "eve_id" = "{{eve.eve_id}}"
    And I see table "CASE_RETENTION" column "total_sentence" is "<totalSentence>" where "cmr_id" = "{{cmr_id}}"
    And I see table "CASE_RETENTION" column "fixed_policy_key" is "<caseRetention>" where "cmr_id" = "{{cmr_id}}"
    And I see table "CASE_RETENTION" column "retain_until_ts" is "{{retention-<actualRetention>}}" where "cmr_id" = "{{cmr_id}}"
    Examples:
      | courthouse         | courtroom     | caseNumbers | dateTime               | msgId      | eventId    | type  | subType | eventText    | caseRetention | totalSentence | text         | actualRetention |
      | HARROW CROWN COURT | RM {{seq}}A13 | T{{seq}}213 | {{timestamp-11:23:00}} | {{seq}}613 | {{seq}}613 | 3000  |         | text {{seq}} | 3             | 3Y3M3D        | Archive Case | 7Y0M0D          |
      | HARROW CROWN COURT | RM {{seq}}A14 | T{{seq}}214 | {{timestamp-11:23:00}} | {{seq}}614 | {{seq}}614 | 3000  |         | text {{seq}} | 3             | 7Y3M7D        | Archive Case | 7Y3M7D          |
      | HARROW CROWN COURT | RM {{seq}}A23 | T{{seq}}223 | {{timestamp-12:07:00}} | {{seq}}623 | {{seq}}623 | 30300 |         | text {{seq}} | 3             | 3Y3M3D        | Case closed  | 7Y0M0D          |
      | HARROW CROWN COURT | RM {{seq}}A24 | T{{seq}}224 | {{timestamp-12:07:00}} | {{seq}}624 | {{seq}}624 | 30300 |         | text {{seq}} | 3             | 7Y3M7D        | Case closed  | 7Y3M7D          |

  @regression @retention
  @reads-and-writes-system-properties @sequential
  Scenario Outline: Create a StopAndClose event for LIFE sentence
    Difference from other sentencing event is
    table CASE_RETENTION column total_sentence is not set
    retention is 99 years
    Only 1 stop & close event per case is used to verify that a case_retention row is created
    Test creates a courtroom & hearing for each case
    Given that courthouse "<courthouse>" case "<caseNumbers>" does not exist
    # TODO (DT): This will always fail because this the daily list scenario creates a pending (NEW) daily list for tomorrow
    # Given I wait until there is not a daily list waiting for "<courthouse>"
    Given I authenticate from the "XHIBIT" source system
    Given I add a daily list
      | messageId                      | type | subType | documentName              | courthouse   | courtroom   | caseNumber    | startDate  | startTime | endDate    | timeStamp     | defendant     | judge      | prosecution     | defence      |
      | 58b211f4-426d-81be-22{{seq}}00 | DL   | DL      | DL {{date+0/}} {{seq}}221 | <courthouse> | <courtroom> | <caseNumbers> | {{date+0}} | 09:50     | {{date+0}} | {{timestamp}} | defendant one | judge name | prosecutor name | defence name |
    And I process the daily list for courthouse "<courthouse>"
    And I wait for case "<caseNumbers>" courthouse "<courthouse>"
    Given I select column "cas.cas_id" from table "COURTCASE" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>"
    And I see table "darts.court_case" column "interpreter_used" is "false" where "cas_id" = "{{cas.cas_id}}"
    And I see table "darts.court_case" column "case_closed_ts" is "null" where "cas_id" = "{{cas.cas_id}}"
    When  I create an event
      | message_id | type   | sub_type  | event_id  | courthouse   | courtroom   | case_numbers  | event_text  | date_time  | case_retention_fixed_policy | case_total_sentence |
      | <msgId>    | <type> | <subType> | <eventId> | <courthouse> | <courtroom> | <caseNumbers> | <eventText> | <dateTime> | <caseRetention>             | <totalSentence>     |
    Then I see table "EVENT" column "event_text" is "<eventText>" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>" and "message_id" = "<msgId>"
    And I see table "EVENT" column "event_name" is "<text>" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>" and "message_id" = "<msgId>"
    And I see table "EVENT" column "handler" is "StopAndCloseHandler" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>" and "message_id" = "<msgId>"
    And I see table "EVENT" column "active" is "true" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>" and "message_id" = "<msgId>"
    And I see table "EVENT" column "case_closed_ts" is "not null" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>" and "message_id" = "<msgId>"
    And I see table "EVENT" column "interpreter_used" is "false" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>" and "message_id" = "<msgId>"
    And I see table "CASE_HEARING" column "hearing_is_actual" is "true" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>" and "courtroom_name" = "<courtroom>"
    And I select column "eve.eve_id" from table "EVENT" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>" and "message_id" = "<msgId>"
    And I see table "CASE_MANAGEMENT_RETENTION" column "total_sentence" is "<totalSentence>" where "eve_id" = "{{eve.eve_id}}"
    And I see table "CASE_MANAGEMENT_RETENTION" column "fixed_policy_key" is "<caseRetention>" where "eve_id" = "{{eve.eve_id}}"
    And I select column "cmr_id" from table "CASE_MANAGEMENT_RETENTION" where "eve_id" = "{{eve.eve_id}}"
    #   And I see table "CASE_RETENTION" column "total_sentence" is "<totalSentence>" where "cmr_id" = "{{cmr_id}}"
    And I see table "CASE_RETENTION" column "fixed_policy_key" is "<caseRetention>" where "cmr_id" = "{{cmr_id}}"
    And I see table "CASE_RETENTION" column "retain_until_ts" is "{{retention-<actualRetention>}}" where "cmr_id" = "{{cmr_id}}"
    Examples:
      | courthouse         | courtroom     | caseNumbers | dateTime               | msgId      | eventId    | type  | subType | eventText    | caseRetention | totalSentence | text         | actualRetention |
      | HARROW CROWN COURT | RM {{seq}}A15 | T{{seq}}215 | {{timestamp-11:23:00}} | {{seq}}615 | {{seq}}615 | 3000  |         | text {{seq}} | 4             | 4Y4M4D        | Archive Case | 99Y0M0D         |
      | HARROW CROWN COURT | RM {{seq}}A25 | T{{seq}}225 | {{timestamp-12:07:00}} | {{seq}}625 | {{seq}}625 | 30300 |         | text {{seq}} | 4             | 4Y4M4D        | Case closed  | 99Y0M0D         |

  @regression @retention
  @reads-and-writes-system-properties @sequential
  Scenario Outline: Create a StopAndClose event for non-custodial sentence
    Only 1 stop & close event per case works due to retentions
    Test creates a courtroom & hearing for each case
    # TODO (DT): This will always fail because this the daily list scenario creates a pending (NEW) daily list for tomorrow
    # Given I wait until there is not a daily list waiting for "<courthouse>"
    Given that courthouse "<courthouse>" case "<caseNumbers>" does not exist
    Given I authenticate from the "XHIBIT" source system
    Given I add a daily list
      | messageId                      | type | subType | documentName              | courthouse   | courtroom   | caseNumber    | startDate  | startTime | endDate    | timeStamp     | defendant     | judge      | prosecution     | defence      |
      | 58b211f4-426d-81be-23{{seq}}00 | DL   | DL      | DL {{date+0/}} {{seq}}231 | <courthouse> | <courtroom> | <caseNumbers> | {{date+0}} | 09:50     | {{date+0}} | {{timestamp}} | defendant one | judge name | prosecutor name | defence name |
    And I process the daily list for courthouse "<courthouse>"
    And I wait for case "<caseNumbers>" courthouse "<courthouse>"
    Given I select column "cas.cas_id" from table "COURTCASE" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>"
    And I see table "darts.court_case" column "interpreter_used" is "false" where "cas_id" = "{{cas.cas_id}}"
    And I see table "darts.court_case" column "case_closed_ts" is "null" where "cas_id" = "{{cas.cas_id}}"
    When  I create an event
      | message_id | type   | sub_type  | event_id  | courthouse   | courtroom   | case_numbers  | event_text  | date_time  | case_retention_fixed_policy | case_total_sentence |
      | <msgId>    | <type> | <subType> | <eventId> | <courthouse> | <courtroom> | <caseNumbers> | <eventText> | <dateTime> | <caseRetention>             | <totalSentence>     |
    Then I see table "EVENT" column "event_text" is "<eventText>" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>" and "message_id" = "<msgId>"
    And I see table "EVENT" column "event_name" is "<text>" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>" and "message_id" = "<msgId>"
    And I see table "EVENT" column "handler" is "StopAndCloseHandler" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>" and "message_id" = "<msgId>"
    And I see table "EVENT" column "active" is "true" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>" and "message_id" = "<msgId>"
    And I see table "EVENT" column "case_closed_ts" is "not null" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>" and "message_id" = "<msgId>"
    And I see table "EVENT" column "interpreter_used" is "false" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>" and "message_id" = "<msgId>"
    And I see table "CASE_HEARING" column "hearing_is_actual" is "true" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>" and "courtroom_name" = "<courtroom>"
    And I select column "eve.eve_id" from table "EVENT" where "cas.case_number" = "<caseNumbers>" and "courthouse_name" = "<courthouse>" and "message_id" = "<msgId>"
    And I see table "CASE_MANAGEMENT_RETENTION" column "total_sentence" is "" where "eve_id" = "{{eve.eve_id}}"
    And I see table "CASE_MANAGEMENT_RETENTION" column "fixed_policy_key" is "<caseRetention>" where "eve_id" = "{{eve.eve_id}}"
    And I select column "cmr_id" from table "CASE_MANAGEMENT_RETENTION" where "eve_id" = "{{eve.eve_id}}"
    And I see table "CASE_RETENTION" column "total_sentence" is "null" where "cmr_id" = "{{cmr_id}}"
    And I see table "CASE_RETENTION" column "fixed_policy_key" is "<caseRetention>" where "cmr_id" = "{{cmr_id}}"
    And I see table "CASE_RETENTION" column "retain_until_ts" is "{{retention-<actualRetention>}}" where "cmr_id" = "{{cmr_id}}"
    Examples:
      | courthouse         | courtroom     | caseNumbers | dateTime               | msgId      | eventId    | type  | subType | eventText    | caseRetention | totalSentence | text         | actualRetention |
      | HARROW CROWN COURT | RM {{seq}}A11 | T{{seq}}211 | {{timestamp-11:23:00}} | {{seq}}611 | {{seq}}611 | 3000  |         | text {{seq}} | 1             |               | Archive Case | 1Y0M0D          |
      | HARROW CROWN COURT | RM {{seq}}A12 | T{{seq}}212 | {{timestamp-11:23:00}} | {{seq}}612 | {{seq}}612 | 3000  |         | text {{seq}} | 2             |               | Archive Case | 7Y0M0D          |
      | HARROW CROWN COURT | RM {{seq}}A21 | T{{seq}}221 | {{timestamp-12:07:00}} | {{seq}}621 | {{seq}}621 | 30300 |         | text {{seq}} | 1             |               | Case closed  | 1Y0M0D          |
      | HARROW CROWN COURT | RM {{seq}}A22 | T{{seq}}222 | {{timestamp-12:07:00}} | {{seq}}622 | {{seq}}622 | 30300 |         | text {{seq}} | 2             |               | Case closed  | 7Y0M0D          |

  @regression @TODO @sequential
  Scenario Outline: Create a Null event
    # An event row is not created
    Given I authenticate from the "XHIBIT" source system
    When  I create an event
      | message_id | type   | sub_type  | event_id  | courthouse   | courtroom   | case_numbers | event_text  | date_time  | case_retention_fixed_policy | case_total_sentence |
      | <msgId>    | <type> | <subType> | <eventId> | <courthouse> | <courtroom> | <caseNumber> | <eventText> | <dateTime> | <caseRetention>             | <totalSentence>     |
    #  Then I see table EVENT column event_text is "<eventText>" where cas.case_number = "<caseNumber>" and courthouse_name = "<courthouse>" and message_id = "<msgId>"
    And I see table "EVENT" column "COUNT(eve.eve_id)" is "0" where "cas.case_number" = "<caseNumber>" and "courthouse_name" = "<courthouse>" and "message_id" = "<msgId>"
    Examples:
      | courthouse         | courtroom    | caseNumbers | dateTime               | msgId      | eventId    | type  | subType | eventText    | caseRetention | totalSentence | text    | notes |
      | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}201 | {{timestamp-12:08:00}} | {{seq}}376 | {{seq}}376 | 40790 |         | text {{seq}} |               |               | Results |       |

  @regression @sequential
  Scenario Outline: Create case with an event
    Given that courthouse "<courthouse>" case "<caseNumber>" does not exist
    Given I see table "COURTCASE" column "COUNT(cas_id)" is "0" where "cas.case_number" = "<caseNumber>" and "courthouse_name" = "<courthouse>"
    Given I authenticate from the "CPP" source system
    When  I create an event
      | message_id | type   | sub_type  | event_id   | courthouse   | courtroom   | case_numbers | event_text     | date_time  | case_retention_fixed_policy | case_total_sentence |
      | <msgId>1   | <type> | <subType> | <eventId>1 | <courthouse> | <courtroom> | <caseNumber> | text {{seq}}C1 | <dateTime> | <caseRetention>             | <totalSentence>     |
      | <msgId>2   | <type> | <subType> | <eventId>2 | <courthouse> | <courtroom> | <caseNumber> | text {{seq}}C2 | <dateTime> | <caseRetention>             | <totalSentence>     |
    #    | <msgId>2     | <type> | <subType> | <eventId>2        | <courthouse> | <courtroom> | <caseNumber>D | text {{seq}}D1 | <dateTime> | <caseRetention>             | <totalSentence>     |
    #    | <msgId>3     | <type> | <subType> | <eventId>3        | <courthouse> | <courtroom> | <caseNumber>C,<caseNumber>D | text {{seq}}CD | <dateTime> | <caseRetention>             | <totalSentence>     |
    Then I see table "COURTCASE" column "COUNT(cas_id)" is "1" where "cas.case_number" = "<caseNumber>" and "courthouse_name" = "<courthouse>"
    And I see table "EVENT" column "COUNT(eve.eve_id)" is "2" where "cas.case_number" = "<caseNumber>" and "courthouse_name" = "<courthouse>"
    # TODO (DT): I amended the second msgId/eventId values to {{seq}}42 to prevent them being duplicates
    Examples:
      | courthouse         | courtroom     | caseNumber  | dateTime               | msgId     | eventId   | type  | subType | eventText     | caseRetention | totalSentence | text           | notes |
      | HARROW CROWN COURT | 1             | T{{seq}}230 | {{timestamp-12:04:00}} | {{seq}}41 | {{seq}}41 | 10100 |         | text {{seq}}1 |               |               | Case called on |       |
      | HARROW CROWN COURT | ROOM {{seq}}Z | T{{seq}}231 | {{timestamp-12:04:00}} | {{seq}}42 | {{seq}}42 | 10100 |         | text {{seq}}1 |               |               | Case called on |       |

  @regression @sequential
  Scenario Outline: Event creates a courtroom / hearing
    Given that courthouse "<courthouse>" case "<caseNumber>" does not exist
    Given I create a case
      | courthouse   | case_number  | defendants    | judges     | prosecutors     | defenders     |
      | <courthouse> | <caseNumber> | defendant one | test judge | test prosecutor | test defender |
    Given I see table "COURTCASE" column "COUNT(cas_id)" is "1" where "cas.case_number" = "<caseNumber>" and "courthouse_name" = "<courthouse>"
    Given I authenticate from the "XHIBIT" source system
    And I create an event
      | message_id | type   | sub_type  | event_id  | courthouse   | courtroom   | case_numbers | event_text  | date_time  | case_retention_fixed_policy | case_total_sentence |
      | <msgId>    | <type> | <subType> | <eventId> | <courthouse> | <courtroom> | <caseNumber> | <eventText> | <dateTime> | <caseRetention>             | <totalSentence>     |
    Then I see table "CASE_HEARING" column "hearing_is_actual" is "true" where "cas.case_number" = "<caseNumber>" and "courthouse_name" = "<courthouse>" and "courtroom_name" = "<courtroom>"
    Examples:
      | courthouse         | courtroom     | caseNumber  | dateTime               | msgId    | eventId  | type | subType | eventText     | caseRetention | totalSentence | text                      | notes               |
      | HARROW CROWN COURT | ROOM {{seq}}B | T{{seq}}260 | {{timestamp-10:00:00}} | {{seq}}0 | {{seq}}0 | 1000 | 1001    | text {{seq}}E |               |               | Offences put to defendant | courtroom & hearing |
      | HARROW CROWN COURT | 1             | T{{seq}}261 | {{timestamp-10:00:00}} | {{seq}}1 | {{seq}}1 | 1000 | 1001    | text {{seq}}E |               |               | Offences put to defendant | hearing only        |

  @EVENT_API @SOAP_API @DMP-2835 @regression @TODO @sequential
  Scenario: Event for 2 cases from CPP
    messages for 2 cases differ between CPP & XHIBIT
    Given I authenticate from the "CPP" source system
    # TODO (DT): I amended eventId from "{{seq}}4014" to "{{seq}}414" because it was bigger than max int
    When I call POST SOAP API using soap action "addDocument" and body:
      """
      <messageId>{{seq}}4014</messageId>
      <type>10100</type>
      <document>
      <![CDATA[<be:DartsEvent xmlns:be="urn:integration-cjsonline-gov-uk:pilot:entities" ID="{{seq}}414" Y="{{date-yyyy}}" M="{{date-mm}}" D="{{date-dd}}" H="12" MIN="04" S="10">
      <be:CourtHouse>HARROW CROWN COURT</be:CourtHouse>
      <be:CourtRoom>ROOM {{seq}}C</be:CourtRoom>
      <be:CaseNumbers>
      <be:CaseNumber>T{{seq}}251,T{{seq}}252</be:CaseNumber>
      </be:CaseNumbers>
      <be:EventText>text {{seq}} CD1</be:EventText>
      </be:DartsEvent>]]>
      </document>
      """
    Then the API status code is 200
  #TODO Database verifications here

  @EVENT_API @SOAP_API @DMP-2960 @regression @TODO @sequential
  Scenario: Event for 2 cases from XHIBIT
    messages for 2 cases differ between CPP & XHIBIT
    Given I authenticate from the "XHIBIT" source system
    # TODO (DT): I amended eventId from "{{seq}}4015" to "{{seq}}415" because it was bigger than max int
    When I call POST SOAP API using soap action "addDocument" and body:
      """
      <messageId>{{seq}}4015</messageId>
      <type>10100</type>
      <document>
      <![CDATA[<be:DartsEvent xmlns:be="urn:integration-cjsonline-gov-uk:pilot:entities" ID="{{seq}}415" Y="{{date-yyyy}}" M="{{date-mm}}" D="{{date-dd}}" H="12" MIN="04" S="10">
      <be:CourtHouse>HARROW CROWN COURT</be:CourtHouse>
      <be:CourtRoom>ROOM {{seq}}C</be:CourtRoom>
      <be:CaseNumbers>
      <be:CaseNumber>T{{seq}}253</be:CaseNumber>
      <be:CaseNumber>T{{seq}}254</be:CaseNumber>
      </be:CaseNumbers>
      <be:EventText>text {{seq}} CD2</be:EventText>
      </be:DartsEvent>]]>
      </document>
      """
    Then the API status code is 200
  #TODO Database verifications here

  @EVENT_API @SOAP_API @DMP-2960 @regression @sequential
  Scenario: Create an event baseline
    Given I authenticate from the "XHIBIT" source system
    When I call POST SOAP API using soap action "addDocument" and body:
      """
      <messageId>{{seq}}416</messageId>
      <type>10100</type>
      <document>
      <![CDATA[<be:DartsEvent xmlns:be="urn:integration-cjsonline-gov-uk:pilot:entities" ID="{{seq}}416" Y="{{yyyy-{{date-0}}}}" M="{{mm-{{date-0}}}}" D="{{dd-{{date-0}}}}" H="12" MIN="04" S="10">
      <be:CourtHouse>HARROW CROWN COURT</be:CourtHouse>
      <be:CourtRoom>ROOM {{seq}}</be:CourtRoom>
      <be:CaseNumbers>
      <be:CaseNumber>T{{seq}}201</be:CaseNumber>
      </be:CaseNumbers>
      <be:EventText>text {{seq}} CD2</be:EventText>
      </be:DartsEvent>]]>
      </document>
      """
    Then the API status code is 200

  @EVENT_API @SOAP_API @DMP-2960 @regression @sequential
  Scenario: Verify that VIQ cannot create an event
    Given I authenticate from the "VIQ" source system
    When I call POST SOAP API using soap action "addDocument" and body:
      """
      <messageId>{{seq}}417</messageId>
      <type>10100</type>
      <document>
      <![CDATA[<be:DartsEvent xmlns:be="urn:integration-cjsonline-gov-uk:pilot:entities" ID="{{seq}}417" Y="{{yyyy-{{date-0}}}}" M="{{mm-{{date-0}}}}" D="{{dd-{{date-0}}}}" H="12" MIN="04" S="10">
      <be:CourtHouse>HARROW CROWN COURT</be:CourtHouse>
      <be:CourtRoom>ROOM {{seq}}C</be:CourtRoom>
      <be:CaseNumbers>
      <be:CaseNumber>T{{seq}}255</be:CaseNumber>
      </be:CaseNumbers>
      <be:EventText>text {{seq}} CD2</be:EventText>
      </be:DartsEvent>]]>
      </document>
      """
    Then the API status code is 500

  @EVENT_API @SOAP_API @DMP-2960 @regression @sequential
  Scenario: Verify that a case is created by an event if the case does not already exist
    Given that courthouse "HARROW CROWN COURT" case "T{{seq}}256" does not exist
    Given I see table "COURTCASE" column "COUNT(cas_id)" is "0" where "cas.case_number" = "T{{seq}}256" and "courthouse_name" = "HARROW CROWN COURT"
    And I authenticate from the "XHIBIT" source system
    When I call POST SOAP API using soap action "addDocument" and body:
      """
      <messageId>{{seq}}418</messageId>
      <type>10100</type>
      <document>
      <![CDATA[<be:DartsEvent xmlns:be="urn:integration-cjsonline-gov-uk:pilot:entities" ID="{{seq}}418" Y="{{yyyy-{{date-0}}}}" M="{{mm-{{date-0}}}}" D="{{dd-{{date-0}}}}" H="12" MIN="04" S="10">
      <be:CourtHouse>HARROW CROWN COURT</be:CourtHouse>
      <be:CourtRoom>ROOM {{seq}}U</be:CourtRoom>
      <be:CaseNumbers>
      <be:CaseNumber>T{{seq}}256</be:CaseNumber>
      </be:CaseNumbers>
      <be:EventText>text {{seq}} CD2</be:EventText>
      </be:DartsEvent>]]>
      </document>
      """
    Then the API status code is 200
    And I see table "EVENT" column "count(eve.eve_id)" is "1" where "cas.case_number" = "T{{seq}}256" and "courthouse_name" = "HARROW CROWN COURT"

  @EVENT_API @SOAP_API @DMP-2960 @DMP-3945 @regression @sequential
  Scenario: Verify that a case is created with whitespace retained
    Given that courthouse "HARROW CROWN COURT" case "  T{{seq}}400  " does not exist
    Given I see table "COURTCASE" column "COUNT(cas_id)" is "0" where "cas.case_number" = "  T{{seq}}400  " and "courthouse_name" = "HARROW CROWN COURT"
    And I authenticate from the "XHIBIT" source system
    When I call POST SOAP API using soap action "addDocument" and body:
      """
      <messageId>{{seq}}421</messageId>
      <type>10100</type>
      <document>
      <![CDATA[<be:DartsEvent xmlns:be="urn:integration-cjsonline-gov-uk:pilot:entities" ID="{{seq}}421" Y="{{yyyy-{{date-0}}}}" M="{{mm-{{date-0}}}}" D="{{dd-{{date-0}}}}" H="12" MIN="04" S="10">
      <be:CourtHouse>HARROW CROWN COURT</be:CourtHouse>
      <be:CourtRoom>ROOM {{seq}}U</be:CourtRoom>
      <be:CaseNumbers>
      <be:CaseNumber>  T{{seq}}400  </be:CaseNumber>
      </be:CaseNumbers>
      <be:EventText>text {{seq}} CD2</be:EventText>
      </be:DartsEvent>]]>
      </document>
      """
    Then the API status code is 200
    And I see table "EVENT" column "count(eve.eve_id)" is "1" where "cas.case_number" = "  T{{seq}}400  " and "courthouse_name" = "HARROW CROWN COURT"

  @EVENT_API @SOAP_API @DMP-2960 @DMP-3945 @regression @sequential
  Scenario: Verify that another case is created with different whitespace retained
    Given that courthouse "HARROW CROWN COURT" case "T{{seq}}400  " does not exist
    Given I see table "COURTCASE" column "COUNT(cas_id)" is "0" where "cas.case_number" = "T{{seq}}400  " and "courthouse_name" = "HARROW CROWN COURT"
    And I authenticate from the "XHIBIT" source system
    When I call POST SOAP API using soap action "addDocument" and body:
      """
      <messageId>{{seq}}422</messageId>
      <type>10100</type>
      <document>
      <![CDATA[<be:DartsEvent xmlns:be="urn:integration-cjsonline-gov-uk:pilot:entities" ID="{{seq}}422" Y="{{yyyy-{{date-0}}}}" M="{{mm-{{date-0}}}}" D="{{dd-{{date-0}}}}" H="12" MIN="04" S="10">
      <be:CourtHouse>HARROW CROWN COURT</be:CourtHouse>
      <be:CourtRoom>ROOM {{seq}}U</be:CourtRoom>
      <be:CaseNumbers>
      <be:CaseNumber>T{{seq}}400  </be:CaseNumber>
      </be:CaseNumbers>
      <be:EventText>text {{seq}} CD2</be:EventText>
      </be:DartsEvent>]]>
      </document>
      """
    Then the API status code is 200
    And I see table "EVENT" column "count(eve.eve_id)" is "1" where "cas.case_number" = "T{{seq}}400  " and "courthouse_name" = "HARROW CROWN COURT"

  @EVENT_API @SOAP_API @DMP-2960 @regression @sequential
  Scenario: Verify that event creation for an invalid courthouse fails
    Given I authenticate from the "XHIBIT" source system
    When I call POST SOAP API using soap action "addDocument" and body:
      """
      <messageId>{{seq}}419</messageId>
      <type>10100</type>
      <document>
      <![CDATA[<be:DartsEvent xmlns:be="urn:integration-cjsonline-gov-uk:pilot:entities" ID="{{seq}}419" Y="{{yyyy-{{date-0}}}}" M="{{mm-{{date-0}}}}" D="{{dd-{{date-0}}}}" H="12" MIN="04" S="10">
      <be:CourtHouse>Non Existant Court House</be:CourtHouse>
      <be:CourtRoom>ROOM {{seq}}C</be:CourtRoom>
      <be:CaseNumbers>
      <be:CaseNumber>T{{seq}}257</be:CaseNumber>
      </be:CaseNumbers>
      <be:EventText>text {{seq}} CD2</be:EventText>
      </be:DartsEvent>]]>
      </document>
      """
    Then the API status code is 404
    And the SOAP fault response includes "Courthouse Not Found"

  @EVENT_API @SOAP_API @DMP-2960 @regression @sequential
  Scenario: Create an event using invalid type / subtype
    Given I authenticate from the "XHIBIT" source system
    When I call POST SOAP API using soap action "addDocument" and body:
      """
      <messageId>{{seq}}420</messageId>
      <type>1</type>
      <subType>1</subType>
      <document>
      <![CDATA[<be:DartsEvent xmlns:be="urn:integration-cjsonline-gov-uk:pilot:entities" ID="{{seq}}420" Y="{{yyyy-{{date-0}}}}" M="{{mm-{{date-0}}}}" D="{{dd-{{date-0}}}}" H="12" MIN="04" S="10">
      <be:CourtHouse>HARROW CROWN COURT</be:CourtHouse>
      <be:CourtRoom>ROOM {{seq}}</be:CourtRoom>
      <be:CaseNumbers>
      <be:CaseNumber>T{{seq}}201</be:CaseNumber>
      </be:CaseNumbers>
      <be:EventText>text {{seq}} CD2</be:EventText>
      </be:DartsEvent>]]>
      </document>
      """
    Then the API status code is 404
    And the SOAP fault response includes "Handler Not Found"

  @regression
  @reads-and-writes-system-properties @sequential
  Scenario Outline: Verify that a hearing courtroom can be modified by an event
    where a case is added via daily lists (so a hearing record exists)
    if the first event added is for a different courtroom
    then the existing hearing should be updated with the new courtroom
    ** n.b. Portal will be changed to ignore hearings where 'hearing_is_actual' is false
    Given that courthouse "<courthouse>" case "<caseNumber>" does not exist
    # TODO (DT): This will always fail because this the daily list scenario creates a pending (NEW) daily list for tomorrow
    # Given I wait until there is not a daily list waiting for "<courthouse>"
    Given I authenticate from the "XHIBIT" source system
    When I add a daily list
      | messageId                       | type | subType | documentName              | courthouse   | courtroom    | caseNumber   | startDate  | startTime | endDate    | timeStamp     |
      | 58b211f4-426d-81be-00{{seq}}901 | DL   | DL      | DL {{date+0/}} {{seq}}901 | <courthouse> | <courtroom1> | <caseNumber> | {{date+0}} | 16:00     | {{date+0}} | {{timestamp}} |
    And I process the daily list for courthouse "<courthouse>"
    And I wait for case "<caseNumber>" courthouse "<courthouse>"
    Then I see table "CASE_HEARING" column "hearing_is_actual" is "false" where "cas.case_number" = "<caseNumber>" and "courthouse_name" = "<courthouse>" and "courtroom_name" = "<courtroom1>"
    And I create an event
      | message_id | type   | sub_type  | event_id   | courthouse   | courtroom    | case_numbers | event_text  | date_time  | case_retention_fixed_policy | case_total_sentence |
      | <msgId>2   | <type> | <subType> | <eventId>2 | <courthouse> | <courtroom2> | <caseNumber> | <eventText> | <dateTime> | <caseRetention>             | <totalSentence>     |
    Then I see table "CASE_HEARING" column "hearing_is_actual" is "true" where "cas.case_number" = "<caseNumber>" and "courthouse_name" = "<courthouse>" and "courtroom_name" = "<courtroom2>"
    And I see table "CASE_HEARING" column "hearing_is_actual" is "false" where "cas.case_number" = "<caseNumber>" and "courthouse_name" = "<courthouse>" and "courtroom_name" = "<courtroom1>"
    And I see table "EVENT" column "COUNT(eve.eve_id)" is "0" where "cas.case_number" = "<caseNumber>" and "courthouse_name" = "<courthouse>" and "courtroom_name" = "<courtroom1>"
    Examples:
      | courthouse         | courtroom1    | courtroom2    | caseNumber  | dateTime               | msgId     | eventId   | type | subType | eventText     | caseRetention | totalSentence | text                      | notes |
      | HARROW CROWN COURT | ROOM {{seq}}A | ROOM {{seq}}B | T{{seq}}258 | {{timestamp-10:00:00}} | {{seq}}45 | {{seq}}45 | 1000 | 1001    | text {{seq}}E |               |               | Offences put to defendant |       |
      | HARROW CROWN COURT | ROOM {{seq}}A | 1             | T{{seq}}259 | {{timestamp-10:00:00}} | {{seq}}45 | {{seq}}45 | 1000 | 1001    | text {{seq}}E |               |               | Offences put to defendant |       |

  @regression @DMP-1941 @DMP-1928 @sequential
  Scenario Outline: Create Poll Check events
    These tests will help populate the relevant section of the DARTS Dynatrace Dashboard each time they are executed
    NB: The usual 'Then' step is missing as the 'When' step includes the assertion of the API response code
    Given I authenticate from the "<source>" source system
    When  I create an event
      | message_id | type   | sub_type  | event_id  | courthouse   | courtroom   | case_numbers  | event_text  | date_time  | case_retention_fixed_policy | case_total_sentence |
      | <msgId>    | <type> | <subType> | <eventId> | <courthouse> | <courtroom> | <caseNumbers> | <eventText> | <dateTime> | <caseRetention>             | <totalSentence>     |
    Examples:
      | source | courthouse         | courtroom    | caseNumbers     | dateTime               | msgId      | eventId    | type  | subType | eventText         | caseRetention | totalSentence |
      | CPP    | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}2070501 | {{timestamp-10:01:01}} | {{seq}}705 | {{seq}}705 | 20705 |         | CPP Daily Test    |               |               |
      | XHIBIT | HARROW CROWN COURT | ROOM {{seq}} | T{{seq}}2070502 | {{timestamp-10:02:02}} | {{seq}}705 | {{seq}}705 | 20705 |         | Xhibit Daily Test |               |               |

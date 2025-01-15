@request_transcript
Feature: Create data

  @DMP-696 @DMP-862 @DMP-868 @DMP-872 @DMP-892 @DMP-917 @DMP-925 @DMP-934 @DMP-1009 @DMP-1011 @DMP-1012 @DMP-1025 @DMP-1028 @DMP-1033 @DMP-1053 @DMP-1054 @DMP-1138 @DMP-1198 @DMP-1203 @DMP-1234 @DMP-1243 @DMP-1326 @DMP-2123 @DMP-2124 @DMP-2740 @regression
  Scenario: Request Transcription data creation
    Given I create a case
      | courthouse | courtroom | case_number | defendants         | judges         | prosecutors         | defenders         |
      | SWANSEA    | ROOM_A    | CASE1010    | CASE1010 Defendant | CASE1010 JUDGE | CASE1010 Prosecutor | CASE1010 Defender |

    Given I authenticate from the "XHIBIT" source system
    Given I create an event
      | message_id   | type | sub_type | event_id | courthouse | courtroom | case_numbers | event_text | date_time           | case_retention_fixed_policy | case_total_sentence |
      | CASE1010_001 | 2917 | 3979     | 0        | SWANSEA    | ROOM_A    | CASE1010     | Some event | 2023-08-16 11:44:01 |                             |                     |

    When I load an audio file
      | courthouse | courtroom | case_numbers | date       | startTime | endTime  | audioFile   |
      | SWANSEA    | ROOM_A    | CASE1010     | 2023-08-16 | 14:00:00  | 14:01:00 | sample1.mp2 |
      | SWANSEA    | ROOM_A    | CASE1010     | 2023-08-16 | 15:00:00  | 15:01:00 | sample1.mp2 |
      | SWANSEA    | ROOM_A    | CASE1010     | 2023-08-16 | 11:00:00  | 12:14:05 | sample1.mp2 |
      | SWANSEA    | ROOM_A    | CASE1010     | 2023-08-16 | 11:33:23  | 11:33:23 | sample1.mp2 |

Feature: DAR-PC Source System

  @DMP-1170 @sequential
  Scenario: Get /cases
    Given I authenticate from the "VIQ" source system
    Then I call GET "/cases" API with query params:
      | courthouse         | courtroom    | date       |
      | HARROW CROWN COURT | Rayners room | 2023-11-28 |
    Then the DARTS API status code is 200
    Then the API response contains:
      """
      [
        {
          "courthouse": "Harrow Crown Court",
          "courtroom": "RAYNERS ROOM",
          "hearing_date": "2023-11-28",
          "case_number": "T20230001",
          "scheduled_start": "",
          "defendants": [
            "fred"
          ],
          "judges": [
            "test judge"
          ],
          "prosecutors": [
            "test prosecutor"
          ],
          "defenders": [
            "test defender"
          ]
        }
      ]
      """
@SOAP_API @NEWCASE @UPDCASE @regression
Feature: NEWCASE and UPDCASE using SOAP

  @DMP-4753 @sequential
  Scenario: NEWCASE creates case and sets defendant successfully from XHIBIT
    Given I authenticate from the "XHIBIT" source system
    When I call POST SOAP API using soap action "addDocument" and body:
      """
      <messageId xmlns="">34567</messageId>
      <type xmlns="">NEWCASE</type>
      <subType xmlns="">NEWCASE</subType>
      <document xmlns="">
      <![CDATA[<ccm:NewCaseMessage xmlns:ccm="http://www.hmcs.gov.uk/schemas/crowncourt/msg"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xmlns:apd="http://www.govtalk.gov.uk/people/AddressAndPersonalDetails"
      xmlns:cs="http://www.courtservice.gov.uk/schemas/courtservice" xsi:schemaLocation="http://www.hmcs.gov.uk/schemas/crowncourt/msg CaseInfo.xsd">
      <ccm:DocumentID>
      <cs:DocumentName></cs:DocumentName>
      <cs:UniqueID>123</cs:UniqueID>
      <cs:DocumentType>NEWCASE</cs:DocumentType>
      <cs:TimeStamp>2010-02-18T11:13:23.030</cs:TimeStamp>
      <cs:Version>1.0</cs:Version>
      <cs:SecurityClassification>NPM</cs:SecurityClassification>
      <cs:SellByDate>2009-05-14</cs:SellByDate>
      </ccm:DocumentID>
      <ccm:Case>
      <ccm:CaseNumber>T{{seq}}610</ccm:CaseNumber>
      <ccm:Court>
      <cs:CourtHouseType>Crown Court</cs:CourtHouseType>
      <cs:CourtHouseCode CourtHouseShortName="HARROW CROWN COURT">10005</cs:CourtHouseCode>
      <cs:CourtHouseName>HARROW CROWN COURT</cs:CourtHouseName>
      <cs:CourtHouseAddress>
      <apd:Line>THE CROWN COURT AT HARROW</apd:Line>
      <apd:Line>Wharf Rd</apd:Line>
      <apd:Line>Frimley Green</apd:Line>
      <apd:Line>Camberley</apd:Line>
      <apd:PostCode>GU16 6PT</apd:PostCode>
      </cs:CourtHouseAddress>
      <cs:CourtHouseDX>DX 12345 HARROW</cs:CourtHouseDX>
      <cs:CourtHouseTelephone>01252 836464</cs:CourtHouseTelephone>
      <cs:CourtHouseFax>01252 836464</cs:CourtHouseFax>
      </ccm:Court>
      <ccm:CaseArrivedFrom>
      <ccm:OriginatingCourt>
      <cs:CourtHouseType>Magistrates Court</cs:CourtHouseType>
      <cs:CourtHouseCode CourtHouseShortName="NTYNM">2852</cs:CourtHouseCode>
      <cs:CourtHouseName>NORTH TYNESIDE MAGISTRATES' COURT</cs:CourtHouseName>
      <cs:CourtHouseAddress>
      <apd:Line>THE COURTHOUSE</apd:Line>
      <apd:Line>TYNEMOUTH ROAD</apd:Line>
      <apd:Line>NORTH SHIELDS, TYNE AND WEAR</apd:Line>
      <apd:PostCode>NE30 1AG</apd:PostCode>
      </cs:CourtHouseAddress>
      <cs:CourtHouseDX></cs:CourtHouseDX>
      <cs:CourtHouseTelephone>01912960099</cs:CourtHouseTelephone>
      </ccm:OriginatingCourt>
      </ccm:CaseArrivedFrom>
      <ccm:Defendants>
      <ccm:Defendant>
      <cs:PersonalDetails>
      <cs:Name>
      <apd:CitizenNameForename>Penelope</apd:CitizenNameForename>
      <apd:CitizenNameForename>Iris</apd:CitizenNameForename>
      <apd:CitizenNameSurname>Howard</apd:CitizenNameSurname>
      </cs:Name>
      <cs:IsMasked>no</cs:IsMasked>
      <cs:DateOfBirth>
      <apd:BirthDate>1979-07-31</apd:BirthDate>
      <apd:VerifiedBy>not verified</apd:VerifiedBy>
      </cs:DateOfBirth>
      <cs:Sex>male</cs:Sex>
      <cs:Address>
      <apd:Line>2 WATERVILLE TERRACE</apd:Line>
      <apd:Line>-</apd:Line>
      <apd:Line>NORTH SHIELDS</apd:Line>
      <apd:Line>TYNE &amp; WEAR</apd:Line>
      </cs:Address>
      </cs:PersonalDetails>
      <cs:CRESTdefendantID>36979</cs:CRESTdefendantID>
      <cs:URN>T{{seq}}610</cs:URN>
      <cs:MagistratesCourtRefNumber>JR/LD</cs:MagistratesCourtRefNumber>
      <cs:CustodyStatus>In custody</cs:CustodyStatus>
      <cs:Counsel>
      <cs:Solicitor>
      <cs:Party>
      <cs:Organisation>
      <cs:OrganisationCode>62</cs:OrganisationCode>
      <cs:OrganisationName>HINDLE CAMPBELL</cs:OrganisationName>
      <cs:OrganisationAddress>
      <apd:Line>8 NORTHUMBERLAND SQUARE</apd:Line>
      <apd:Line>-</apd:Line>
      <apd:Line>NORTH SHIELDS</apd:Line>
      <apd:PostCode>NE30 1QQ</apd:PostCode>
      </cs:OrganisationAddress>
      <cs:OrganisationDX>62006 NORTH SHIELDS</cs:OrganisationDX>
      <cs:ContactDetails>
      <apd:Email>
      <apd:EmailAddress>lawyer@hindle-campbell.co.uk</apd:EmailAddress>
      </apd:Email>
      <apd:Telephone>
      <apd:TelNationalNumber>01912961777</apd:TelNationalNumber>
      </apd:Telephone>
      <apd:Fax>
      <apd:FaxNationalNumber>01912579326</apd:FaxNationalNumber>
      </apd:Fax>
      </cs:ContactDetails>
      </cs:Organisation>
      </cs:Party>
      </cs:Solicitor>
      </cs:Counsel>
      </ccm:Defendant>
      </ccm:Defendants>
      <ccm:Prosecution ProsecutingAuthority="Crown Prosecution Service">
      <cs:ProsecutingReference>CPS Ref:10U53995081</cs:ProsecutingReference>
      <cs:ProsecutingOrganisation>
      <cs:OrganisationName>Crown Prosecution Service</cs:OrganisationName>
      <cs:OrganisationAddress>
      <apd:Line>TYNESIDE NORTH BRANCH</apd:Line>
      <apd:Line>ST ANN`S QUAY</apd:Line>
      <apd:Line>122 QUAYSIDE</apd:Line>
      <apd:Line>NEWCASTLE UPON TYNE</apd:Line>
      <apd:PostCode>NE1 3BD</apd:PostCode>
      </cs:OrganisationAddress>
      <cs:ContactDetails>
      <apd:Telephone>
      <apd:TelNationalNumber>0912604200</apd:TelNationalNumber>
      </apd:Telephone>
      </cs:ContactDetails>
      </cs:ProsecutingOrganisation>
      </ccm:Prosecution>
      <ccm:MethodOfInstigation>Committal</ccm:MethodOfInstigation>
      <ccm:DateOfInstigation>2008-07-10</ccm:DateOfInstigation>
      <ccm:CaseClassNumber>3</ccm:CaseClassNumber>
      <ccm:PTIURN>T{{seq}}610</ccm:PTIURN>
      </ccm:Case>
      </ccm:NewCaseMessage>]]>
      </document>
      """
    Then the API status code is 200
    And I select column "cas.cas_id" from table "COURTCASE" where "courthouse_name" = "HARROW CROWN COURT" and "case_number" = "T{{seq}}610"
    And I see table "COURTCASE" column "case_number" is "T{{seq}}610" where "cas.cas_id" = "{{cas.cas_id}}"
    And I see table "darts.defendant" column "defendant_name" is "Penelope Iris Howard" where "cas_id" = "{{cas.cas_id}}"

  @DMP-4752 @sequential
  Scenario: UPDCASE creates case and sets defendant successfully from XHIBIT
    Given I authenticate from the "XHIBIT" source system
    When I call POST SOAP API using soap action "addDocument" and body:
      """
      <messageId xmlns="">34567</messageId>
      <type xmlns="">UPDCASE</type>
      <subType xmlns="">UPDCASE</subType>
      <document xmlns="">
      <![CDATA[
      <ccm:UpdatedCaseMessage xmlns:ccm="http://www.hmcs.gov.uk/schemas/crowncourt/msg"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xmlns:apd="http://www.govtalk.gov.uk/people/AddressAndPersonalDetails"
      xmlns:cs="http://www.courtservice.gov.uk/schemas/courtservice" xsi:schemaLocation="http://www.hmcs.gov.uk/schemas/crowncourt/msg CaseInfo.xsd">
      <ccm:DocumentID>
      <cs:DocumentName></cs:DocumentName>
      <cs:UniqueID>123</cs:UniqueID>
      <cs:DocumentType>UPDCASE</cs:DocumentType>
      <cs:TimeStamp>2010-02-18T11:13:23.030</cs:TimeStamp>
      <cs:Version>1.0</cs:Version>
      <cs:SecurityClassification>NPM</cs:SecurityClassification>
      <cs:SellByDate>2009-05-14</cs:SellByDate>
      </ccm:DocumentID>
      <ccm:Case>
      <ccm:CaseNumber>T{{seq}}611</ccm:CaseNumber>
      <ccm:Court>
      <cs:CourtHouseType>Crown Court</cs:CourtHouseType>
      <cs:CourtHouseCode CourtHouseShortName="HARROW CROWN COURT">10005</cs:CourtHouseCode>
      <cs:CourtHouseName>HARROW CROWN COURT</cs:CourtHouseName>
      <cs:CourtHouseAddress>
      <apd:Line>THE CROWN COURT AT HARROW</apd:Line>
      <apd:Line>Wharf Rd</apd:Line>
      <apd:Line>Frimley Green</apd:Line>
      <apd:Line>Camberley</apd:Line>
      <apd:PostCode>GU16 6PT</apd:PostCode>
      </cs:CourtHouseAddress>
      <cs:CourtHouseDX>DX 12345 HARROW</cs:CourtHouseDX>
      <cs:CourtHouseTelephone>01252 836464</cs:CourtHouseTelephone>
      <cs:CourtHouseFax>01252 836464</cs:CourtHouseFax>
      </ccm:Court>
      <ccm:CaseArrivedFrom>
      <ccm:OriginatingCourt>
      <cs:CourtHouseType>Magistrates Court</cs:CourtHouseType>
      <cs:CourtHouseCode CourtHouseShortName="NTYNM">2852</cs:CourtHouseCode>
      <cs:CourtHouseName>NORTH TYNESIDE MAGISTRATES' COURT</cs:CourtHouseName>
      <cs:CourtHouseAddress>
      <apd:Line>THE COURTHOUSE</apd:Line>
      <apd:Line>TYNEMOUTH ROAD</apd:Line>
      <apd:Line>NORTH SHIELDS, TYNE AND WEAR</apd:Line>
      <apd:PostCode>NE30 1AG</apd:PostCode>
      </cs:CourtHouseAddress>
      <cs:CourtHouseDX></cs:CourtHouseDX>
      <cs:CourtHouseTelephone>01912960099</cs:CourtHouseTelephone>
      </ccm:OriginatingCourt>
      </ccm:CaseArrivedFrom>
      <ccm:Defendants>
      <ccm:Defendant>
      <cs:PersonalDetails>
      <cs:Name>
      <apd:CitizenNameForename>Joe</apd:CitizenNameForename>
      <apd:CitizenNameForename>William</apd:CitizenNameForename>
      <apd:CitizenNameSurname>Spud</apd:CitizenNameSurname>
      </cs:Name>
      <cs:IsMasked>no</cs:IsMasked>
      <cs:DateOfBirth>
      <apd:BirthDate>1979-07-31</apd:BirthDate>
      <apd:VerifiedBy>not verified</apd:VerifiedBy>
      </cs:DateOfBirth>
      <cs:Sex>male</cs:Sex>
      <cs:Address>
      <apd:Line>2 WATERVILLE TERRACE</apd:Line>
      <apd:Line>-</apd:Line>
      <apd:Line>NORTH SHIELDS</apd:Line>
      <apd:Line>TYNE &amp; WEAR</apd:Line>
      </cs:Address>
      </cs:PersonalDetails>
      <cs:CRESTdefendantID>36979</cs:CRESTdefendantID>
      <cs:URN>T{{seq}}611</cs:URN>
      <cs:MagistratesCourtRefNumber>JR/LD</cs:MagistratesCourtRefNumber>
      <cs:CustodyStatus>In custody</cs:CustodyStatus>
      <cs:Counsel>
      <cs:Solicitor>
      <cs:Party>
      <cs:Organisation>
      <cs:OrganisationCode>62</cs:OrganisationCode>
      <cs:OrganisationName>HINDLE CAMPBELL</cs:OrganisationName>
      <cs:OrganisationAddress>
      <apd:Line>8 NORTHUMBERLAND SQUARE</apd:Line>
      <apd:Line>-</apd:Line>
      <apd:Line>NORTH SHIELDS</apd:Line>
      <apd:PostCode>NE30 1QQ</apd:PostCode>
      </cs:OrganisationAddress>
      <cs:OrganisationDX>62006 NORTH SHIELDS</cs:OrganisationDX>
      <cs:ContactDetails>
      <apd:Email>
      <apd:EmailAddress>lawyer@hindle-campbell.co.uk</apd:EmailAddress>
      </apd:Email>
      <apd:Telephone>
      <apd:TelNationalNumber>01912961777</apd:TelNationalNumber>
      </apd:Telephone>
      <apd:Fax>
      <apd:FaxNationalNumber>01912579326</apd:FaxNationalNumber>
      </apd:Fax>
      </cs:ContactDetails>
      </cs:Organisation>
      </cs:Party>
      </cs:Solicitor>
      </cs:Counsel>
      </ccm:Defendant>
      </ccm:Defendants>
      <ccm:Prosecution ProsecutingAuthority="Crown Prosecution Service">
      <cs:ProsecutingReference>CPS Ref:10U53995081</cs:ProsecutingReference>
      <cs:ProsecutingOrganisation>
      <cs:OrganisationName>Crown Prosecution Service</cs:OrganisationName>
      <cs:OrganisationAddress>
      <apd:Line>TYNESIDE NORTH BRANCH</apd:Line>
      <apd:Line>ST ANN`S QUAY</apd:Line>
      <apd:Line>122 QUAYSIDE</apd:Line>
      <apd:Line>NEWCASTLE UPON TYNE</apd:Line>
      <apd:PostCode>NE1 3BD</apd:PostCode>
      </cs:OrganisationAddress>
      <cs:ContactDetails>
      <apd:Telephone>
      <apd:TelNationalNumber>0912604200</apd:TelNationalNumber>
      </apd:Telephone>
      </cs:ContactDetails>
      </cs:ProsecutingOrganisation>
      </ccm:Prosecution>
      <ccm:MethodOfInstigation>Committal</ccm:MethodOfInstigation>
      <ccm:DateOfInstigation>2008-07-10</ccm:DateOfInstigation>
      <ccm:CaseClassNumber>3</ccm:CaseClassNumber>
      <ccm:PTIURN>T{{seq}}611</ccm:PTIURN>
      </ccm:Case>
      </ccm:UpdatedCaseMessage>]]>
      </document>
      """
    Then the API status code is 200
    And I select column "cas.cas_id" from table "COURTCASE" where "courthouse_name" = "HARROW CROWN COURT" and "case_number" = "T{{seq}}611"
    And I see table "COURTCASE" column "case_number" is "T{{seq}}611" where "cas.cas_id" = "{{cas.cas_id}}"
    And I see table "darts.defendant" column "defendant_name" is "Joe William Spud" where "cas_id" = "{{cas.cas_id}}"




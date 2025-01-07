import { ExternalServiceUserCredential } from './credentials';

interface Defendant {
  defendant: string;
}
interface Judge {
  judge: string;
}
interface Prosecutor {
  prosecutor: string;
}
interface Defender {
  defender: string;
}

interface CaseNumber {
  case_number: string;
}

interface CourtHouseAddress {
  'apd:Line': string;
}

export interface AddCaseObject {
  case: {
    $type: string;
    $id: string;
    courthouse: string;
    defendants: Defendant[];
    judges: Judge[];
    prosecutors: Prosecutor[];
    defenders: Defender[];
  };
}

export interface GetCasesObject {
  courthouse: string;
  courtroom: string;
  date: string;
}

export interface RegisterNodeObject {
  node: {
    $type: string;
    courthouse: string;
    courtroom: string;
    hostname: string;
    ip_address: string;
    mac_address: string;
  };
}

export interface AddLogEntryObject {
  log_entry: {
    $Y: string;
    $M: string;
    $D: string;
    $H: string;
    $MIN: string;
    $S: string;
    courthouse: string;
    courtroom: string;
    case_numbers: CaseNumber[];
    text: string;
  };
}

interface EventCaseNumber {
  'be:CaseNumber': string;
}

export interface EventObject {
  'be:DartsEvent': {
    '$xmlns:be': string;
    $ID: string;
    $Y: string;
    $M: string;
    $D: string;
    $H: string;
    $MIN: string;
    $S: string;
    'be:CourtHouse': string;
    'be:CourtRoom': string;
    'be:CaseNumbers': EventCaseNumber[];
    'be:EventText': string;
    'be:RetentionPolicy'?: {
      'be:CaseRetentionFixedPolicy': string;
      'be:CaseTotalSentence': string;
    };
  };
}

interface PersonalDetails {
  'cs:PersonalDetails': {
    'cs:Name': {
      'apd:CitizenNameForename': string;
      'apd:CitizenNameSurname': string;
    };
  };
}

interface DailyListProsecution {
  $ProsecutingAuthority: string;
  'cs:ProsecutingReference': string;
  'cs:ProsecutingOrganisation': {
    'cs:OrganisationName': string;
  };
  'cs:Advocate': PersonalDetails;
}

type DailyListDefendant = PersonalDetails & {
  'cs:URN': string;
  'cs:Counsel': {
    'cs:Advocate': PersonalDetails;
  };
};

interface Hearing {
  'cs:Hearing': {
    'cs:HearingSequenceNumber': string;
    'cs:HearingDetails': {
      $HearingType: string;
      'cs:HearingDescription': string;
      'cs:HearingDate': string;
    };
    'cs:TimeMarkingNote': string;
    'cs:CaseNumber': string;
    'cs:Prosecution': DailyListProsecution;
    'cs:Defendants': {
      'cs:Defendant': DailyListDefendant | DailyListDefendant[];
    };
  };
}

interface Sitting {
  'cs:Sitting': {
    'cs:CourtRoomNumber': string;
    'cs:SittingSequenceNo': string;
    'cs:SittingAt': string;
    'cs:SittingPriority': string;
    'cs:Judiciary': {
      'cs:Judge': {
        'apd:CitizenNameForename': string;
        'apd:CitizenNameSurname': string;
        'apd:CitizenNameRequestedName': string;
        'apd:CRESTjudgeID': string;
      };
    };
    'cs:Hearings': Hearing;
  };
}

interface CourtList {
  'cs:CourtList': {
    'cs:CourtHouse': {
      'cs:CourtHouseType': string;
      'cs:CourtHouseCode': string;
      'cs:CourtHouseName': string;
    };
    'cs:Sittings': Sitting;
  };
}

export interface DailyListObject {
  'cs:DailyList': {
    'cs:DocumentID': {
      'cs:DocumentName': string;
      'cs:UniqueID': string;
      'cs:DocumentType': string;
      'cs:TimeStamp': string;
      'cs:Version': string;
      'cs:SecurityClassification': string;
      'cs:SellByDate': string;
      'cs:XSLstylesheetURL': string;
    };
    'cs:ListHeader': {
      'cs:ListCategory': string;
      'cs:StartDate': string;
      'cs:EndDate': string;
      'cs:Version': string;
      'cs:CRESTprintRef': string;
      'cs:PublishedTime': string;
      'cs:CRESTlistID': string;
    };
    'cs:CrownCourt': {
      'cs:CourtHouseType': string;
      'cs:CourtHouseCode': string & {
        $CourtHouseShortName: string;
      };
      'cs:CourtHouseName': string;
      'cs:CourtHouseAddress': CourtHouseAddress[] & {
        'apd:PostCode': string;
      };
      'cs:CourtHouseDX': string;
      'cs:CourtHouseTelephone': string;
      'cs:CourtHouseFax': string;
    };
    'cs:CourtLists': CourtList;
  };
}

export interface SoapResponseCodeAndMessage {
  code: number;
  message: string;
}

export type SoapGetCasesResponse = SoapResponseCodeAndMessage & {
  cases: string;
};

export type SoapRegisterNodeResponse = SoapResponseCodeAndMessage & {
  node_id: string;
};

export interface SoapFaultResponse {
  'ns2:Fault': {
    faultcode: string;
    faultstring: string;
  };
}

export interface GatewaySoapResponse {
  'SOAP-ENV:Envelope': {
    'SOAP-ENV:Header': string;
    'SOAP-ENV:Body': SoapFaultResponse & {
      'ns3:addCaseResponse'?: {
        return: SoapResponseCodeAndMessage;
      };
      'ns3:addLogEntryResponse'?: {
        return: SoapResponseCodeAndMessage;
      };
      'ns3:addDocumentResponse'?: {
        return: SoapResponseCodeAndMessage;
      };
      'ns3:registerResponse'?: {
        return: string;
      };
      'ns3:registerNodeResponse'?: {
        return: SoapRegisterNodeResponse;
      };
    };
  };
}

export interface ProxySoapResponse {
  'S:Envelope': {
    'S:Body': SoapFaultResponse & {
      'ns2:addCaseResponse'?: {
        return: SoapResponseCodeAndMessage;
      };
      'ns2:getCasesResponse'?: {
        return: SoapGetCasesResponse;
      };
      'ns2:registerNodeResponse'?: {
        return: SoapRegisterNodeResponse;
      };
    };
  };
}

export type SoapResponse = GatewaySoapResponse | ProxySoapResponse;

export const XML_HEADER = '<?xml version="1.0" encoding="utf-8"?>';
export const SOAP_ENVELOPE_OPEN =
  '<S:Envelope xmlns:S="http://schemas.xmlsoap.org/soap/envelope/">';
export const SOAP_ENVELOPE_CLOSE = '</S:Envelope>';

export const SOAP_HEADER = `
  <S:Header>
    <ServiceContext token="temporary/127.0.0.1-1694086218480-789961425" xmlns="http://context.core.datamodel.fs.documentum.emc.com/">
      <Identities xsi:type="RepositoryIdentity" userName="" password="" repositoryName="moj_darts" domain="" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
    </ServiceContext>
  </S:Header>`;

export const soapHeaderWithAuth = ({
  username,
  password,
}: ExternalServiceUserCredential): string => `
  <S:Header>
    <ServiceContext token="temporary/127.0.0.1-1694086218480-789961425" xmlns="http://context.core.datamodel.fs.documentum.emc.com/">
      <Identities xsi:type="RepositoryIdentity" userName="${username}" password="${password}" repositoryName="moj_darts" domain="" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
    </ServiceContext>
  </S:Header>`;

export const soapHeaderWithToken = (token: string) => `
  <S:Header>
    <wsse:Security xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
      <wsse:BinarySecurityToken xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd" QualificationValueType="http://schemas.emc.com/documentum#ResourceAccessToken" wsu:Id="RAD">${token}</wsse:BinarySecurityToken>
    </wsse:Security>
    <ServiceContext xmlns="http://context.core.datamodel.fs.documentum.emc.com/"
      xmlns:ns2="http://properties.core.datamodel.fs.documentum.emc.com/"
      xmlns:ns3="http://profiles.core.datamodel.fs.documentum.emc.com/"
      xmlns:ns4="http://query.core.datamodel.fs.documentum.emc.com/"
      xmlns:ns5="http://content.core.datamodel.fs.documentum.emc.com/"
      xmlns:ns6="http://core.datamodel.fs.documentum.emc.com/">
      <Profiles xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" allowAsyncContentTransfer="false" allowCachedContentTransfer="false" isProcessOLELinks="false" transferMode="BASE64" xsi:type="ns3:ContentTransferProfile"/>
    </ServiceContext>
  </S:Header>`;

export const soapBody = (
  soapAction: string,
  document: string,
  includesDocumentTag: boolean,
  soapActionXmlNsName?: string,
  includesSoapActionTag?: boolean,
) => {
  const soapActionTagName = soapActionXmlNsName
    ? `${soapActionXmlNsName}:${soapAction}`
    : soapAction;
  const soapActionXmlNsAttr = soapActionXmlNsName
    ? `xmlns:${soapActionXmlNsName}="http://com.synapps.mojdarts.service.com"`
    : `xmlns="http://com.synapps.mojdarts.service.com"`;

  return `
<S:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  ${includesSoapActionTag ? '' : `<${soapActionTagName} ${soapActionXmlNsAttr}>`}
    ${includesDocumentTag ? '' : '<document xmlns="">'}
      ${document}
    ${includesDocumentTag ? '' : '</document>'}
  ${includesSoapActionTag ? '' : `</${soapActionTagName}>`}
</S:Body>`;
};

export const soapRegisterBody = (
  host: string,
  { username, password }: ExternalServiceUserCredential,
) => `
<S:Body>
  <ns8:register xmlns:ns8="http://services.rt.fs.documentum.emc.com/" xmlns:ns7="http://core.datamodel.fs.documentum.emc.com/" xmlns:ns6="http://content.core.datamodel.fs.documentum.emc.com/" xmlns:ns5="http://query.core.datamodel.fs.documentum.emc.com/" xmlns:ns4="http://profiles.core.datamodel.fs.documentum.emc.com/" xmlns:ns3="http://properties.core.datamodel.fs.documentum.emc.com/" xmlns:ns2="http://context.core.datamodel.fs.documentum.emc.com/">
      <context>
        <ns2:Identities xsi:type="ns2:RepositoryIdentity" repositoryName="moj_darts" password="${password}" userName="${username}" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"></ns2:Identities>
      </context>
      <host>${host}</host>
  </ns8:register>
</S:Body>`;

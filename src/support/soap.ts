import { ExternalServiceUserCredential } from './credentials';

export interface SoapResponseCodeAndMessage {
  code: number;
  message: string;
}

export interface GatewaySoapResponse {
  'SOAP-ENV:Envelope': {
    'SOAP-ENV:Header': string;
    'SOAP-ENV:Body': {
      'ns3:addCaseResponse'?: {
        return: SoapResponseCodeAndMessage;
      };
      'ns3:registerResponse'?: {
        return: string;
      };
    };
  };
}

export interface ProxySoapResponse {
  'S:Envelope': {
    'S:Body': {
      'ns2:addCaseResponse'?: {
        return: SoapResponseCodeAndMessage;
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

export const soapBody = (soapAction: string, document: string, includesDocumentTag: boolean) => `
<S:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <${soapAction} xmlns="http://com.synapps.mojdarts.service.com">
    ${includesDocumentTag ? '' : '<document xmlns="">'}
      ${document}
    ${includesDocumentTag ? '' : '</document>'}
  </${soapAction}>
</S:Body>`;

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

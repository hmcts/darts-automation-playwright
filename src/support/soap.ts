import { ExternalServiceUserCredential } from './credentials';

export interface SoapResponseCodeAndMessage {
  code: number;
  message: string;
}

export interface SoapResponse {
  'SOAP-ENV:Envelope': {
    'SOAP-ENV:Header': string;
    'SOAP-ENV:Body': {
      'ns3:addCaseResponse': {
        return: SoapResponseCodeAndMessage;
      };
    };
  };
}

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

export const soapBody = (soapAction: string, document: string, includesDocumentTag: boolean) => `
<S:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <${soapAction} xmlns="http://com.synapps.mojdarts.service.com">
    ${includesDocumentTag ? '' : '<document xmlns="">'}
      ${document}
    ${includesDocumentTag ? '' : '</document>'}
  </${soapAction}>
</S:Body>
`;

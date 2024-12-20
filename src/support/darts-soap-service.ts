import supertest from 'supertest';
import cache from 'memory-cache';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';
import { expect } from '@playwright/test';
import { config } from './config';
import {
  GatewaySoapResponse,
  ProxySoapResponse,
  SOAP_ENVELOPE_CLOSE,
  SOAP_ENVELOPE_OPEN,
  soapBody,
  soapRegisterBody,
  soapHeaderWithAuth,
  soapHeaderWithToken,
  SoapResponse,
  SoapResponseCodeAndMessage,
  XML_HEADER,
} from './soap';
import { ExternalServiceUserTypes, getExternalUserCredentials } from './credentials';

const SOAP_RESPONSE_CACHE_KEY = 'darts_soap_response';
const ACCESS_TOKEN_CACHE_KEY = 'darts_soap_access_token';
const AUTHENTICATED_SOURCE_CACHE_KEY = 'soap_authenticated_source';

export default class DartsSoapService {
  private static gatewayRequest = supertest(config.DARTS_GATEWAY);
  private static proxyRequest = supertest(config.DARTS_PROXY);

  private static buildSoapRequest(
    soapAction: string,
    xml: string,
    includesDocumentTag: boolean,
    userType: ExternalServiceUserTypes,
    soapActionXmlNsName?: string,
  ): string {
    const userCredentials = getExternalUserCredentials(userType);
    const accessToken = cache.get(ACCESS_TOKEN_CACHE_KEY);
    if (userCredentials.useToken && !accessToken) {
      throw new Error(`Access token for user ${userType} not set in cache.`);
    }
    const soapHeader = userCredentials.useToken
      ? soapHeaderWithToken(accessToken)
      : soapHeaderWithAuth(userCredentials);
    return `${XML_HEADER}
${SOAP_ENVELOPE_OPEN}
  ${soapHeader}
  ${soapBody(soapAction, xml, includesDocumentTag, soapActionXmlNsName)}
${SOAP_ENVELOPE_CLOSE}`;
  }

  private static buildRegisterRequest(host: string, userType: ExternalServiceUserTypes): string {
    const userCredentials = getExternalUserCredentials(userType);
    const soapHeader = soapHeaderWithAuth(userCredentials);

    return `${XML_HEADER}
${SOAP_ENVELOPE_OPEN}
  ${soapHeader}
  ${soapRegisterBody(host, userCredentials)}
${SOAP_ENVELOPE_CLOSE}`;
  }

  private static async sendGatewayRequest(
    soapAction: string,
    soapEnvelope: string,
  ): Promise<supertest.Test> {
    // console.log('Performing DARTS Gateway SOAP request', soapAction, soapEnvelope);
    return await this.gatewayRequest
      .post(config.DARTS_GATEWAY_SERVICE_PATH)
      .set('Content-Type', 'text/xml')
      .set('SOAPAction', soapAction)
      .send(soapEnvelope);
  }

  private static async sendProxyRequest(
    soapAction: string,
    soapEnvelope: string,
  ): Promise<supertest.Test> {
    // console.log('Performing DARTS Proxy SOAP request', soapAction, soapEnvelope);
    return await this.proxyRequest
      .post(config.DARTS_PROXY_SERVICE_PATH)
      .set('Content-Type', 'text/xml')
      .set('SOAPAction', soapAction)
      .send(soapEnvelope);
  }

  static async addCase(
    caseXml: string,
    {
      includesDocumentTag,
      useGateway,
    }: { includesDocumentTag?: boolean; useGateway?: boolean } = {},
  ): Promise<void> {
    const authenticatedSource = cache.get(AUTHENTICATED_SOURCE_CACHE_KEY) ?? 'VIQ';
    const response = await this[useGateway ? 'sendGatewayRequest' : 'sendProxyRequest'](
      'addCase',
      this.buildSoapRequest('addCase', caseXml, includesDocumentTag ?? false, authenticatedSource),
    );
    expect(response.status).toEqual(200);
    cache.put(SOAP_RESPONSE_CACHE_KEY, response.text);
  }

  static async addLogEntry(
    addLogEntryXml: string,
    {
      includesDocumentTag,
      useGateway,
    }: { includesDocumentTag?: boolean; useGateway?: boolean } = {},
  ): Promise<void> {
    const authenticatedSource = cache.get(AUTHENTICATED_SOURCE_CACHE_KEY) ?? 'VIQ';
    const response = await this[useGateway ? 'sendGatewayRequest' : 'sendProxyRequest'](
      'addLogEntry',
      this.buildSoapRequest(
        'addLogEntry',
        addLogEntryXml,
        includesDocumentTag ?? false,
        authenticatedSource,
      ),
    );
    expect(response.status).toEqual(200);
    cache.put(SOAP_RESPONSE_CACHE_KEY, response.text);
  }

  static async addDocument(
    messageId: string,
    type: string,
    subType: string,
    documentXmlString: string,
  ): Promise<void> {
    const authenticatedSource = cache.get(AUTHENTICATED_SOURCE_CACHE_KEY) ?? 'XHIBIT';
    if (!cache.get(AUTHENTICATED_SOURCE_CACHE_KEY)) {
      await this.register('XHIBIT');
    }

    const addDocument = {
      messageId,
      type,
      subType,
      document: documentXmlString,
    };

    const builder = new XMLBuilder({
      ignoreAttributes: false,
      attributeNamePrefix: '$',
      oneListGroup: true,
    });

    const addDocumentXml = builder.build(addDocument) as string;
    const response = await this.sendGatewayRequest(
      'addDocument',
      this.buildSoapRequest('addDocument', addDocumentXml, true, authenticatedSource, 'ns5'),
    );

    expect(response.status).toEqual(200);
    cache.put(SOAP_RESPONSE_CACHE_KEY, response.text);
  }

  static async register(userType: ExternalServiceUserTypes): Promise<void> {
    if (userType === 'VIQ') {
      // register not required for VIQ, but set as the auth'd source
      cache.put(AUTHENTICATED_SOURCE_CACHE_KEY, userType);
      return;
    }
    const host = `${config.DARTS_GATEWAY}${config.DARTS_GATEWAY_SERVICE_PATH}`;
    const response = await this.sendGatewayRequest(
      'register',
      this.buildRegisterRequest(host, userType),
    );
    expect(response.status).toEqual(200);

    const parser = new XMLParser();
    const registerResponse: GatewaySoapResponse = parser.parse(response.text);

    cache.put(
      ACCESS_TOKEN_CACHE_KEY,
      registerResponse['SOAP-ENV:Envelope']['SOAP-ENV:Body']['ns3:registerResponse']?.return,
    );
    cache.put(AUTHENTICATED_SOURCE_CACHE_KEY, userType);
  }

  static getResponseObject(): SoapResponse {
    const parser = new XMLParser();
    return parser.parse(cache.get(SOAP_RESPONSE_CACHE_KEY));
  }

  static getResponseCodeAndMessage(): SoapResponseCodeAndMessage | undefined {
    const parser = new XMLParser();
    const responseObj: SoapResponse = parser.parse(cache.get(SOAP_RESPONSE_CACHE_KEY));
    if (!responseObj) {
      throw new Error('SOAP response not found');
    }
    if ((responseObj as GatewaySoapResponse)['SOAP-ENV:Envelope']) {
      const r = responseObj as GatewaySoapResponse;
      const body = r['SOAP-ENV:Envelope']['SOAP-ENV:Body'];
      if (body['ns3:addCaseResponse']) {
        return body['ns3:addCaseResponse'].return;
      }
      if (body['ns3:addLogEntryResponse']) {
        return body['ns3:addLogEntryResponse'].return;
      }
    }
    if ((responseObj as ProxySoapResponse)['S:Envelope']) {
      const r = responseObj as ProxySoapResponse;
      return r['S:Envelope']['S:Body']['ns2:addCaseResponse']?.return;
    }
    console.error('SOAP response does not conform to know structure', responseObj);
    throw new Error('SOAP response does not conform to know structure');
  }
}

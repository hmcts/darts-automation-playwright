import supertest from 'supertest';
import cache from 'memory-cache';
import { XMLParser } from 'fast-xml-parser';
import { expect } from '@playwright/test';
import { config } from './config';
import {
  SOAP_ENVELOPE_CLOSE,
  SOAP_ENVELOPE_OPEN,
  soapBody,
  soapHeaderWithAuth,
  SoapResponse,
  SoapResponseCodeAndMessage,
  XML_HEADER,
} from './soap';
import { getExternalUserCredentials } from './credentials';

const DARTS_SERVICE_PATH = '/service/darts';
const CACHE_KEY = 'darts_soap_response';

type UserType = 'XHIBIT' | 'DAR_PC';

// TODO: need to be able to use proxy and gateway
export default class DartsGateway {
  private static request = supertest(config.DARTS_GATEWAY);

  private static buildSoapRequest(
    operation: string,
    xml: string,
    includesDocumentTag: boolean,
    userType: UserType,
  ): string {
    const soapHeader = soapHeaderWithAuth(getExternalUserCredentials(userType));
    return `${XML_HEADER}
${SOAP_ENVELOPE_OPEN}
  ${soapHeader}
  ${soapBody(operation, xml, includesDocumentTag)}
${SOAP_ENVELOPE_CLOSE}`;
  }

  private static async gatewayCall(
    soapAction: string,
    soapEnvelope: string,
  ): Promise<supertest.Test> {
    // console.log('Performing DARTS Gateway SOAP request', soapAction, soapEnvelope);
    return await this.request
      .post(DARTS_SERVICE_PATH)
      .set('Content-Type', 'text/xml')
      .set('SOAPAction', soapAction)
      .send(soapEnvelope);
  }

  static async addCase(
    caseXml: string,
    { includesDocumentTag }: { includesDocumentTag?: boolean } = {},
  ): Promise<void> {
    const response = await this.gatewayCall(
      'addCase',
      this.buildSoapRequest('addCase', caseXml, includesDocumentTag ?? false, 'DAR_PC'),
    );
    expect(response.status).toEqual(200);
    cache.put(CACHE_KEY, response.text);
  }

  static getResponseObject(): SoapResponse {
    const parser = new XMLParser();
    return parser.parse(cache.get(CACHE_KEY));
  }

  static getResponseCodeAndMessage(): SoapResponseCodeAndMessage {
    const parser = new XMLParser();
    const responseObj: SoapResponse = parser.parse(cache.get(CACHE_KEY));
    return responseObj['SOAP-ENV:Envelope']['SOAP-ENV:Body']['ns3:addCaseResponse'].return;
  }
}

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
const CACHE_KEY = 'darts_gateway_api_response';

type UserType = 'XHIBIT' | 'DAR_PC';

export default class DartsGateway {
  private static request = supertest(config.DARTS_GATEWAY);

  private static buildSoapRequest(operation: string, xml: string, userType: UserType): string {
    const soapHeader = soapHeaderWithAuth(getExternalUserCredentials(userType));
    return `${XML_HEADER}
${SOAP_ENVELOPE_OPEN}
  ${soapHeader}
  ${soapBody(operation, xml)}
${SOAP_ENVELOPE_CLOSE}`;
  }

  private static async gatewayCall(
    soapAction: string,
    soapEnvelope: string,
  ): Promise<supertest.Test> {
    return await this.request
      .post(DARTS_SERVICE_PATH)
      .set('Content-Type', 'text/xml')
      .set('SOAPAction', soapAction)
      .send(soapEnvelope);
  }

  static async addCase(caseXml: string): Promise<void> {
    const response = await this.gatewayCall(
      'addCase',
      this.buildSoapRequest('addCase', caseXml, 'DAR_PC'),
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

import supertest from 'supertest';
import cache from 'memory-cache';
import querystring from 'node:querystring';
import { XMLParser } from 'fast-xml-parser';
import { expect } from '@playwright/test';
import { config } from './config';
import {
  GatewaySoapResponse,
  ProxySoapResponse,
  SoapResponse,
  SoapResponseCodeAndMessage,
} from './soap';
import { DartsUserTypes, getDartsUserCredentials } from './credentials';

const API_RESPONSE_CACHE_KEY = 'darts_api_response';
const ACCESS_TOKEN_CACHE_KEY = 'darts_api_access_token';
const AUTHENTICATED_SOURCE_CACHE_KEY = 'api_authenticated_source';

export default class DartsApiService {
  private static authRequest = supertest(config.apiAuthentication.endpoint);
  private static apiRequest = supertest(config.DARTS_API);

  private static async authenticate(userType: DartsUserTypes = 'ROPC_GLOBAL') {
    console.log('Authenticating as user', userType);
    if (
      cache.get(AUTHENTICATED_SOURCE_CACHE_KEY) === userType &&
      cache.get(ACCESS_TOKEN_CACHE_KEY)
    ) {
      // already authenticated as user
      console.log('Already authenticated as', userType);
      return;
    }
    const userCredentials = getDartsUserCredentials(userType);
    const response = await this.authRequest
      .post('/')
      .send({
        grant_type: 'password',
        username: userCredentials.username,
        password: userCredentials.password,
        client_id: config.apiAuthentication.clientId,
        client_secret: config.apiAuthentication.clientSecret,
        scope: config.apiAuthentication.scope,
      })
      .set('Content-Type', 'application/x-www-form-urlencoded');

    expect(response.status).toEqual(200);

    cache.put(ACCESS_TOKEN_CACHE_KEY, response.body.access_token);
    cache.put(AUTHENTICATED_SOURCE_CACHE_KEY, userType);
  }

  public static async sendApiPostRequest(
    path: string,
    body: string | object | undefined,
    queryParams?: { [key: string]: string },
    expectedResponseCode: number = 200,
  ): Promise<void> {
    await this.authenticate();
    const pathWithQs = queryParams ? `${path}?${querystring.stringify(queryParams)}` : path;
    console.log('Performing DARTS API request', pathWithQs, body, expectedResponseCode);
    const response = await this.apiRequest
      .post(pathWithQs)
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${cache.get(ACCESS_TOKEN_CACHE_KEY)}`)
      .send(body);
    expect(response.status).toEqual(expectedResponseCode);
    cache.put(API_RESPONSE_CACHE_KEY, response.text);
  }

  static getResponseObject(): SoapResponse {
    const parser = new XMLParser();
    return parser.parse(cache.get(API_RESPONSE_CACHE_KEY));
  }

  static getResponseCodeAndMessage(): SoapResponseCodeAndMessage | undefined {
    const parser = new XMLParser();
    const responseObj: SoapResponse = parser.parse(cache.get(API_RESPONSE_CACHE_KEY));
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

import supertest from 'supertest';
import cache from 'memory-cache';
import querystring from 'node:querystring';
import { expect } from '@playwright/test';
import md5File from 'md5-file';
import { config } from './config';
import { AuthRequestBody, DartsUserTypes, getDartsUserCredentials } from './credentials';
import { AddAudioRequest } from './types';
import { DateTime } from 'luxon';
import { fileURLToPath } from 'url';
import path from 'path';
import AzureStorageService from './azure-storage-service';

const API_RESPONSE_STATUS_CACHE_KEY = 'darts_api_response_status';
const API_RESPONSE_CACHE_KEY = 'darts_api_response';
const ACCESS_TOKEN_CACHE_KEY = 'darts_api_access_token';
const AUTHENTICATED_SOURCE_CACHE_KEY = 'api_authenticated_source';

export default class DartsApiService {
  private static externalAuthRequest = supertest(config.apiAuthentication.external.endpoint);
  private static internalAuthRequest = supertest(config.apiAuthentication.internal.endpoint);
  private static apiRequest = supertest(config.DARTS_API);

  public static async authenticate(userType: DartsUserTypes = 'ROPC_GLOBAL') {
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

    let authRequest = this.internalAuthRequest;
    const body: AuthRequestBody = {
      grant_type: 'password',
      username: userCredentials.username,
      password: userCredentials.password,
      client_id: config.apiAuthentication.internal.clientId as string,
      client_secret: config.apiAuthentication.internal.clientSecret as string,
      scope: config.apiAuthentication.internal.scope as string,
    };

    if (userCredentials.type === 'EXTERNAL' || userCredentials.type === 'API') {
      authRequest = this.externalAuthRequest;
      body.client_id = config.apiAuthentication.external.clientId as string;
      body.client_secret = config.apiAuthentication.external.clientSecret as string;
      body.scope = config.apiAuthentication.external.scope as string;
    }
    console.log('Authenticating', userCredentials.type, 'user for API', userCredentials.username);

    const response = await authRequest
      .post('/oauth2/v2.0/token')
      .send(body)
      .set('Content-Type', 'application/x-www-form-urlencoded');
    expect(response?.status).toEqual(200);

    cache.put(ACCESS_TOKEN_CACHE_KEY, response?.body.access_token);
    cache.put(AUTHENTICATED_SOURCE_CACHE_KEY, userType);
  }

  public static async sendApiPostRequest(
    path: string,
    body: string | object | undefined,
    queryParams?: { [key: string]: string },
    expectedResponseCode: null | number = 200,
  ): Promise<void> {
    await this.authenticate();
    const pathWithQs = queryParams ? `${path}?${querystring.stringify(queryParams)}` : path;
    // console.log('Performing DARTS API POST request', pathWithQs, body, expectedResponseCode);
    const response = await this.apiRequest
      .post(pathWithQs)
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${cache.get(ACCESS_TOKEN_CACHE_KEY)}`)
      .send(body);

    if (expectedResponseCode !== null) {
      expect(response.status).toEqual(expectedResponseCode);
    }
    // console.log('DARTS API POST response', response.status, response.text);
    cache.put(API_RESPONSE_STATUS_CACHE_KEY, response.status);
    cache.put(API_RESPONSE_CACHE_KEY, JSON.stringify(response.text));
  }

  public static async sendApiGetRequest(
    path: string,
    queryParams?: { [key: string]: string },
  ): Promise<void> {
    await this.authenticate();
    const pathWithQs = queryParams ? `${path}?${querystring.stringify(queryParams)}` : path;
    // console.log('Performing DARTS API GET request', pathWithQs);
    const response = await this.apiRequest
      .get(pathWithQs)
      .set('Authorization', `Bearer ${cache.get(ACCESS_TOKEN_CACHE_KEY)}`)
      .send();
    // console.log('DARTS API GET response', response.status, response.text);
    cache.put(API_RESPONSE_STATUS_CACHE_KEY, response.status);
    cache.put(API_RESPONSE_CACHE_KEY, JSON.stringify(response.text));
  }

  public static async sendAddAudioRequest(addAudioDetails: AddAudioRequest): Promise<void> {
    await this.authenticate();
    // console.log('Performing DARTS API add audio request', addAudioDetails);

    const __filename = fileURLToPath(import.meta.url);
    const filePath = path.join(path.dirname(__filename), '../testdata/', addAudioDetails.audioFile);

    const checksum = await md5File(filePath);
    const storageUuid = await AzureStorageService.uploadBlobToInbound(filePath);
    const metadata = {
      started_at: DateTime.fromFormat(
        `${addAudioDetails.date} ${addAudioDetails.startTime}`,
        'y-MM-dd HH:mm:ss',
      ).toISO(),
      ended_at: DateTime.fromFormat(
        `${addAudioDetails.date} ${addAudioDetails.endTime}`,
        'y-MM-dd HH:mm:ss',
      ).toISO(),
      channel: 1,
      total_channels: 1,
      format: 'mp2',
      filename: addAudioDetails.audioFile,
      courthouse: addAudioDetails.courthouse,
      courtroom: addAudioDetails.courtroom,
      // TODO: calculate file size?
      file_size: 937.96,
      checksum,
      cases: [addAudioDetails.case_numbers],
      storage_guid: storageUuid,
    };
    await this.sendApiPostRequest('/audios/metadata', metadata);
  }

  public static getResponseStatus() {
    return cache.get(API_RESPONSE_STATUS_CACHE_KEY);
  }
  public static getResponse() {
    return JSON.parse(cache.get(API_RESPONSE_CACHE_KEY));
  }
}

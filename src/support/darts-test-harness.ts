import supertest from 'supertest';
import cache from 'memory-cache';
import { expect } from '@playwright/test';
import { config } from './config';
import { getExternalUserCredentials } from './credentials';
import { DateTime } from 'luxon';
import { AddAudioRequest } from './types';

const API_RESPONSE_CACHE_KEY = 'darts_api_response';

export default class DartsTestHarness {
  private static readonly testHarnessRequest = supertest(config.DARTS_TEST_HARNESS);

  public static async addAudio(addAudioDetails: AddAudioRequest): Promise<void> {
    const userCredentials = getExternalUserCredentials('VIQ');
    const body = {
      destinationUrl: `${config.DARTS_GATEWAY}/service`,
      username: userCredentials.username,
      password: userCredentials.password,
      transferFormat: config.DARTS_TEST_HARNESS_TRANSFER_FORMAT,
      audioFiles: [
        {
          startDate: DateTime.fromFormat(
            `${addAudioDetails.date} ${addAudioDetails.startTime}`,
            'y-MM-dd HH:mm:ss',
          ).toFormat(`y-MM-dd'T'HH:mm:ss.SSS`),
          endDate: DateTime.fromFormat(
            `${addAudioDetails.date} ${addAudioDetails.endTime}`,
            'y-MM-dd HH:mm:ss',
          ).toFormat(`y-MM-dd'T'HH:mm:ss.SSS`),
          channel: '1',
          maxChannels: '1',
          courthouse: addAudioDetails.courthouse,
          courtroom: addAudioDetails.courtroom,
          mediaFormat: 'mp2',
          fileSizeMultiplier: 1,
          caseNumbers: [addAudioDetails.case_numbers],
        },
      ],
    };
    console.log('Performing DARTS test harness addAudio request', addAudioDetails);
    const response = await this.testHarnessRequest
      .post('/audio/external-component-test-harness')
      .set('Content-Type', 'application/json')
      .send(body);
    expect(response.status).toEqual(200);
    cache.put(API_RESPONSE_CACHE_KEY, response.text);
  }
}

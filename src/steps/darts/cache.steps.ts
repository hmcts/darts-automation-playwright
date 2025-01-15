import { ICustomWorld } from '../../support/custom-world';
import { Given, Then } from '@cucumber/cucumber';
import cache from 'memory-cache';
import { expect } from '@playwright/test';
import DartsSoapService from '../../support/darts-soap-service';
import { SoapRegisterNodeResponse } from '../../support/soap';

Given('I use {string} {string}', function (this: ICustomWorld, name: string, value: string) {
  cache.put(name, value);
});

Given('I use transcript request ID', async function (this: ICustomWorld) {
  const traId = await this.page?.getByText('Your request ID').locator('strong').textContent();
  console.log('CACHING TRA_ID =', traId);
  cache.put('tra_id', traId);
});

Given(
  'I use transcript request ID as {string}',
  async function (this: ICustomWorld, cacheKey: string) {
    const traId = await this.page?.getByText('Your request ID').locator('strong').textContent();
    console.log('CACHING TRA_ID =', traId);
    cache.put(cacheKey, traId);
  },
);

Given('I use the Audio Request ID', async function (this: ICustomWorld) {
  const merId = await this.page?.getByText('Your request ID').locator('strong').textContent();
  console.log('CACHING MER_ID =', merId);
  cache.put('mer_id', merId);
});

Then(
  'I find {string} in the xml response at {string}',
  async function (this: ICustomWorld, cacheName: string, expectedPropertyName: string) {
    const response = DartsSoapService.getResponseCodeAndMessage() as SoapRegisterNodeResponse;
    expect(response).toHaveProperty(expectedPropertyName);
    cache.put(cacheName, response[expectedPropertyName as 'node_id']);
  },
);

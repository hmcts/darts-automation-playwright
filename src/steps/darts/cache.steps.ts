import { ICustomWorld } from '../../support/custom-world';
import { Given, Then } from '@cucumber/cucumber';
import cache from 'memory-cache';
import { expect } from '@playwright/test';
import DartsSoapService from '../../support/darts-soap-service';
import { SoapRegisterNodeResponse } from '../../support/soap';

Given('I use {string} {string}', function (this: ICustomWorld, name: string, value: string) {
  cache.put(name, value);
});

Then(
  'I find {string} in the xml response at {string}',
  async function (this: ICustomWorld, cacheName: string, expectedPropertyName: string) {
    const response = DartsSoapService.getResponseCodeAndMessage() as SoapRegisterNodeResponse;
    expect(response).toHaveProperty(expectedPropertyName);
    cache.put(cacheName, response[expectedPropertyName as 'node_id']);
  },
);
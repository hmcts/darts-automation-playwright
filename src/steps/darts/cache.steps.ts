import { ICustomWorld } from '../../support/custom-world';
import { Given } from '@cucumber/cucumber';
import cache from 'memory-cache';

Given('I use {string} {string}', function (this: ICustomWorld, name: string, value: string) {
  cache.put(name, value);
});

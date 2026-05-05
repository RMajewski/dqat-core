import { Then, When } from '@cucumber/cucumber';
import {
  expectLastResponseStatusCallback,
  fetchRequestCallback,
  responseBodyContainsCallback,
} from '../callback/endpoint.ts';

When('ich den Endpunkt {string} über {word} abrufe', fetchRequestCallback);

Then('erwarte ich den HTTP-Statuscode {int}', expectLastResponseStatusCallback);

Then('der Response-Body enthält {string}', responseBodyContainsCallback);

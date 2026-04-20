import { Then, When } from '@cucumber/cucumber';
import {
  expectLastResponseStatusCallback,
  fetchRequestCallback,
} from '../callback/endpoint.ts';

When('ich den Endpunkt {string} über {word} abrufe', fetchRequestCallback);

Then('erwarte ich den HTTP-Statuscode {int}', expectLastResponseStatusCallback);

import { setWorldConstructor } from '@cucumber/cucumber';
import { dqatBootstrap } from '@RMajewski/dqat-core/setup';
import { DqatAcceptanceWorld } from './type/acceptanceWorld.ts';

setWorldConstructor(DqatAcceptanceWorld);

dqatBootstrap();

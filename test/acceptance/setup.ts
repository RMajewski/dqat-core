import { setWorldConstructor } from '@cucumber/cucumber';
import { dqatBootstrap, DqatWorld } from '@RMajewski/dqat-core/setup';

setWorldConstructor(DqatWorld);

dqatBootstrap();

'use babel';

/* @flow */

import { parseReporterOutput } from '../lib/spawn-runner';
import { pathToFile, messages, output, processOutput } from './fixtures';

describe('spawn-runner', () => {
  describe('getMessagesFromTestResults', () => {
    it('should return promise with tester messages', async () => {
      expect(await parseReporterOutput(processOutput, pathToFile)).toEqual({ messages, output });
    });
  });
});

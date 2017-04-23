'use babel';

/* @flow */
import { EOL } from 'os';
import { parseReporterOutput, removeBadArgs } from '../lib/spawn-runner';
import { pathToFile, messages, output, processOutput } from './fixtures';

describe('spawn-runner', () => {
  describe('getMessagesFromTestResults', () => {
    it('should return promise with tester messages', async () => {
      expect(await parseReporterOutput(processOutput, pathToFile)).toEqual({ messages, output });
    });
    it('should return promise with one unknown tester messages if no results', async () => {
      expect(await parseReporterOutput('Nothing', pathToFile)).toEqual({
        messages: [{
          state: 'unknown',
          title: 'No results',
          error: {
            name: '',
            message: `Nothing${EOL}`,
          },
          duration: 0,
          lineNumber: 0,
          filePath: pathToFile,
        }],
        output: `Nothing${EOL}`,
      });
    });
  });

  describe('removeBadArgs', () => {
    it('should return clear array with args', () => {
      expect(removeBadArgs(['--my-arg', '--watch'])).toEqual(['--my-arg']);
    });
  });
});

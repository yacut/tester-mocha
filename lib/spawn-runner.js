'use babel';

/* @flow */
import * as path from 'path';
import _ from 'lodash';
import os from 'os';
import { BufferedProcess } from 'atom';
import type { TextEditor } from 'atom';

export function run(textEditor :?TextEditor, additionalArgs: ?string) {
  return new Promise((resolve) => {
    let processOutput = `\u001b[1mTester Mocha\u001b[0m${os.EOL}`;
    const filePath = textEditor ? textEditor.getPath() : '';
    const projectPath = filePath ? atom.project.relativizePath(filePath)[0] : atom.project.getPaths()[0];

    let cwd = projectPath;
    if (!(cwd)) {
      cwd = path.dirname(filePath);
    }
    function parseReporterOutput(outputString) {
      let output = '';
      const messages = [];
      _.forEach(_.split(outputString, os.EOL), (line) => {
        try {
          const outputEvent = JSON.parse(line);
          messages.push(outputEvent);
        } catch (e) {
          output += line.toString() + os.EOL;
        }
      });
      if (!messages.length) {
        messages.push({
          state: 'unknown',
          title: 'No results',
          error: {
            name: '',
            message: output,
          },
          duration: 0,
          lineNumber: 0,
          filePath,
        });
      }
      return { messages, output };
    }
    const userConfigArgs = atom.config.get('tester-mocha.args');
    const prohibitedArgs = ['--reporter', '-R', '--watch', '-w'];
    const removedArgs = _.remove(userConfigArgs, a => _.indexOf(prohibitedArgs, a) !== -1);
    const additionalArgsArray = additionalArgs ? additionalArgs.trim().split(' ') : [];
    _.remove(additionalArgsArray, a => _.indexOf(prohibitedArgs, a) !== -1);
    if (removedArgs && removedArgs.length > 0) {
      atom.notifications.addWarning(`Tester: The args "${_.toString(removedArgs)}" are not allowed and removed from command.`);
    }
    const defaultArgs = ['--reporter', `${atom.packages.resolvePackagePath('tester-mocha')}/lib/mocha-reporter.js`];
    if (filePath) {
      defaultArgs.push(filePath);
    }
    const args = _.union(defaultArgs, userConfigArgs, additionalArgsArray);
    const options = { cwd };
    const mochaBinary = atom.config.get('tester-mocha.binaryPath');
    const command = mochaBinary !== '' ? mochaBinary : `${atom.packages.resolvePackagePath('tester-mocha')}/node_modules/.bin/mocha`;
    processOutput += `\u001b[1mcommand:\u001b[0m ${command} ${args.join(' ')}${os.EOL}`;
    processOutput += `\u001b[1mcwd:\u001b[0m ${cwd}${os.EOL}`;
    const stdout = data => processOutput += data;
    const stderr = data => processOutput += data;
    const exit = () => {
      this.bufferedProcess = null;
      resolve(parseReporterOutput(processOutput));
    };
    this.bufferedProcess = new BufferedProcess({ command, args, options, stdout, stderr, exit });

    this.bufferedProcess.onWillThrowError((errorObject) => {
      atom.notifications.addError('Tester is unable to locate the mocha command. Please ensure process.env.PATH can access mocha.');
      console.error('Tester Mocha: ', errorObject);
    });
  });
}

export function stop() {
  if (this.bufferedProcess) {
    this.bufferedProcess.kill();
    this.bufferedProcess = null;
  }
}

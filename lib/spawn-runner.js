'use babel';

/* @flow */
import * as path from 'path';
import Promise from 'bluebird';
import { EOL } from 'os';
import { BufferedProcess } from 'atom';
import type { TextEditor } from 'atom';

// TODO write and read test results from json file
export function parseReporterOutput(outputString :string, filePath :string) {
  const messages = [];
  let output = '';
  return Promise.map(outputString.split(EOL), (line) => {
    if (!line.startsWith('###tester-mocha-event###')) {
      output += line.toString() + EOL;
    } else {
      try {
        line = line.replace('###tester-mocha-event###', '');
        const outputEvent = JSON.parse(line);
        messages.push(outputEvent);
      } catch (e) {
        output += line.toString() + EOL;
      }
    }
  })
  .then(() => {
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
  });
}

export function removeBadArgs(args :Array<string>) {
  if (!args) {
    return [];
  }

  const prohibitedArgs = ['--reporter', '-R', '--watch', '-w'];
  const clearArgs = [];
  args.forEach((arg) => {
    const index = prohibitedArgs.indexOf(arg);
    if (index === -1) {
      clearArgs.push(arg);
    }
  });
  return clearArgs;
}

export function run(textEditor :?TextEditor, additionalArgs: ?string) {
  return new Promise((resolve) => {
    let processOutput = `\u001b[1mTester Mocha\u001b[0m${EOL}`;
    const filePath = textEditor ? textEditor.getPath() : '';
    const projectPath = filePath ? atom.project.relativizePath(filePath)[0] : atom.project.getPaths()[0];

    let cwd = projectPath;
    if (!(cwd)) {
      cwd = path.dirname(filePath);
    }

    const userConfigArgs = removeBadArgs(atom.config.get('tester-mocha.args'));
    const additionalArgsArray = (additionalArgs && additionalArgs.trim()) ? removeBadArgs(additionalArgs.trim().split(' ')) : [];
    const defaultArgs = ['--reporter', `${atom.packages.resolvePackagePath('tester-mocha')}/lib/mocha-reporter.js`];
    if (filePath) {
      defaultArgs.push(filePath);
    }
    const args = defaultArgs.concat(userConfigArgs, additionalArgsArray);

    const options = { cwd };
    const mochaBinary = atom.config.get('tester-mocha.binaryPath');
    const command = mochaBinary !== '' ? mochaBinary : `${atom.packages.resolvePackagePath('tester-mocha')}/node_modules/.bin/mocha`;

    processOutput += `\u001b[1mcommand:\u001b[0m ${command} ${args.join(' ')}${EOL}`;
    processOutput += `\u001b[1mcwd:\u001b[0m ${cwd}${EOL}`;
    const stdout = data => processOutput += data;
    const stderr = data => processOutput += data;
    const exit = async () => {
      this.bufferedProcess = null;
      const results = await parseReporterOutput(processOutput, filePath);
      resolve(results);
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

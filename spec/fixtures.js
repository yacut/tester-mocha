'use babel';

/* @flow*/
import { join } from 'path';
import { homedir } from 'os';

export const pathToFile = join(homedir(), 'some/file');

export const messages = [
  { state: 'passed', title: 'should pass', duration: 0, lineNumber: 0, filePath: pathToFile },
  { state: 'failed', title: 'should failed', duration: 0, lineNumber: 1, filePath: pathToFile },
];

export const output = `
  Array
    ✓ should pass
  Some mocha tests
    1) should failed

2 passing (1ms)
`;

export const processOutput = `
  Array
    ✓ should pass
  Some mocha tests
    1) should failed
###tester-mocha-event###{"state":"passed","title":"should pass","duration":0,"lineNumber":0,"filePath":"${pathToFile}"}
###tester-mocha-event###{"state":"failed","title":"should failed","duration":0,"lineNumber":1,"filePath":"${pathToFile}"}

2 passing (1ms)`;

export const textEditor = {
  getPath() {
    return pathToFile;
  },
  getURI() {
    return pathToFile;
  },
  getText() {
    return 'text';
  },
  scan(regex/* :string|RegExp*/, callback/* :()=>void*/) {
    callback();
  },
  onDidDestroy(destroy/* :any*/) {
    this.destroy = destroy;
    return {
      dispose() {},
    };
  },
  onDidSave(save/* :any*/) {
    this.save = save;
    return {
      dispose() {
        return undefined;
      },
    };
  },
};

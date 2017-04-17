'use babel';

/* @flow */
import type { TextEditor } from 'atom';
import * as mochaRunner from './spawn-runner';

export function activate() {
  require('atom-package-deps').install();
}

export function deactivate() {
  // Fill something here, optional
}

export function provideTester() {
  return {
    name: 'tester-mocha',
    options: {},
    scopes: atom.config.get('tester-mocha.scopes'),
    test(textEditor :?TextEditor) {
      // Note, a Promise may be returned as well!
      return mochaRunner.run(textEditor);
    },
    stop() {
      mochaRunner.stop();
    },
  };
}

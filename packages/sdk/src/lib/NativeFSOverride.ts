export class NativeFsOverride {
  static fs: any;
  static path: any;
  static os: any;
  static archiver: any;
  static unzipper: any;
  static loadNOdeModules() {
    if (typeof window === 'undefined') {
      this.fs = require('fs');
      this.os = require('os');
      this.path = require('path');
      this.archiver = require('archiver');
      this.unzipper = require('unzipper');
    } else {
      console.warn('Node.js modules are not available in the browser');
    }
  }
}

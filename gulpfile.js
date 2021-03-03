/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-console */
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Neil Enns. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const spawn = require('child_process').spawn;
const gulp = require('gulp');
const path = require('path');
const tap = require('gulp-tap')

function assemble(sourceFile) {
  const fileBasenameNoExtension = path.basename(sourceFile.path, ".asm");

  const cl65 = spawn("./cc65/bin/cl65.exe", 
  ['-o',
    `./tests/roms/${fileBasenameNoExtension}`,
    sourceFile.path
  ]);

  cl65.stdout.on('data', (data) => {
    console.log(`${fileBasenameNoExtension}: ${data}`);
  });
  
  cl65.stderr.on('data', (data) => {
    console.error(`${fileBasenameNoExtension}: ${data}`);
  });
  
  cl65.on('close', () => {
    console.log(`Successfully assembled ${fileBasenameNoExtension}`);
  });
  
  return cl65;
}

function build() {
  return gulp.src("tests/assembly/*.asm")
    .pipe(tap((file) => assemble(file)));
}

exports.default = gulp.series(build);
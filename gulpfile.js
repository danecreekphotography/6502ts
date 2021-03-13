/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-console */
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Neil Enns. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const spawnSync = require('child_process').spawnSync;
const gulp = require('gulp');
const path = require('path');
const tap = require('gulp-tap')

function assemble(sourceFile) {
  const fileBasenameNoExtension = path.basename(sourceFile.path, ".asm");

  const cl65 = spawnSync("./cc65/bin/cl65.exe", 
  ['-o',
    `./tests/roms/${fileBasenameNoExtension}`,
    sourceFile.path
  ]);

  if (cl65.stdout != "") {
    console.log(`${fileBasenameNoExtension}: ${cl65.stdout}`);
  }
  else if (cl65.stderr != "") {
    console.error(`${fileBasenameNoExtension}: ${cl65.stderr}`);
  }
  else {
    console.log(`Successfully assembled ${fileBasenameNoExtension}`);
  }
  
  return cl65;
}

function build() {
  return gulp.src("tests/assembly/**/*.asm")
    .pipe(tap((file) => assemble(file)));
}

exports.default = gulp.series(build);
#!/usr/bin/env node
/* *******************************************************************
  author: William Madruga <willmadruga@gmail.com>
  version: 0.2.4

  Convention:
  -----------
  1. xml request should be created inside a 'req' folder.
  2. xml expected responses should be created inside a 'res' folder.
  3. both should have the same name.
  4. server configuration should be created under config folder.
  5. server configuration should be named as version_servername.json.
  6. if you want to skip a test case, start its name with 'off_'
********************************************************************* */

const fs         = require('fs');
const path       = require('path');
const colors     = require('colors');
const async      = require('async');
const helper     = require('./lib/helper.js');

try {

  helper.banner();

  var file_or_directory = process.argv[4];
  var tests_path = path.parse(file_or_directory);
  var conn_options = helper.get_conn_options(process.argv[3], process.argv[2]);

  // if a single test file is passed:
  if (tests_path.ext !== '') {

    var current_test = tests_path.dir + '/' + tests_path.base;
    helper.make_request(conn_options, file_or_directory, current_test);

  } else { // if a directory is passed, loop through and test them all

    // create a queue object with concurrency of five.
    var q = async.queue(function (params, callback) {
      helper.make_request(conn_options, params.path, params.file);
      callback();
    }, 5);

    tests_path = path.parse(file_or_directory + '/req');
    var current_test = tests_path.dir + '/' + tests_path.base;
    fs.readdir( current_test, function( err, files ) {
      if (err) {
        helper.error_message(err);
      }
      files.forEach( function( file, index ) {
        var full_file_path = current_test + '/' + file;
        if (file.startsWith('off_')) {
          console.log(colors.bgYellow.blue('skipping ' + file));
        } else {
          q.push({'path': full_file_path, 'file': file}, function (err) {
            if (err) {
              helper.error_message(err);
            }
          });
        }
      });
    });
  }
} catch (err) {
    helper.show_usage();
    helper.error_message(err);
    process.exit(1);
}

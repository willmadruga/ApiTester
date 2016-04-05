/* *******************************************************************
  author: William Madruga <willmadruga@gmail.com>
  version: 0.2.0

  Convention:
  -----------
  1. xml request should be created inside a 'req' folder.
  2. xml expected responses should be created inside a 'res' folder.
  3. both should have the same name.
  4. server configuration should be created under config folder.
  5. server configuration should be named as version_servername.json.
********************************************************************* */

const fs         = require('fs');
const path       = require('path');
const colors      = require('colors');
const helper     = require('./lib/helper.js');

try {

  var file_or_directory = process.argv[2];
  var tests_path = path.parse(file_or_directory);
  var conn_options = helper.get_conn_options(process.argv[3], process.argv[4]);

  // if a single test file is passed:
  if (tests_path.ext !== '') {

    var current_test = tests_path.dir + '/' + tests_path.base;
    console.log(colors.bgBlack.white('Testing: ' + current_test));
    helper.make_request(conn_options, file_or_directory, current_test);

  } else { // if a directory is passed, loop through and test them all

    var current_test = tests_path.dir + '/' + tests_path.base;
    console.log(colors.bgBlack.white('Processing directory: ' + current_test));
    fs.readdir( current_test, function( err, files ) {
      if (err) {
        helper.error_message(err);
      }
      files.forEach( function( file, index ) {
        var full_file_path = current_test + '/' + file;
        helper.make_request(conn_options, full_file_path, file);
      });
    });
  }

} catch (err) {
    helper.show_usage();
    helper.error_message(err);
    process.exit(1);
}
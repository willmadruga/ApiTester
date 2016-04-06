const fs        = require('fs');
const http      = require('http');
const https     = require('https');
const colors    = require('colors');
const assert    = require('assert');
const parse_xml = require('xml2js').parseString;

module.exports = {

  // cool banner eh? figlet FTW
  banner : function() {
    console.log('');
    console.log("             _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_    ".rainbow);
    console.log("                 _          _ _____         _                 ".rainbow);
    console.log("                / \\   _ __ (_)_   _|__  ___| |_ ___ _ __     ".rainbow);
    console.log("               / _ \\ | '_ \\| | | |/ _ \\/ __| __/ _ \\ '__| ".rainbow);
    console.log("              / ___ \\| |_) | | | |  __/\\__ \\ ||  __/ |     ".rainbow);
    console.log("             /_/   \\_\\ .__/|_| |_|\\___||___/\\__\\___|_|   ".rainbow);
    console.log("                     |_|                                      ".rainbow);
    console.log("             _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_    ".rainbow);
    console.log('');

  },

  // shows usage.
  show_usage : function() {
    console.log('');
    console.log('########################################################################'.bgBlack.white);
    console.log('#                                                                      #'.bgBlack.white);
    console.log('# Usage: ./tester.js <server> <version> <directory_with_test_cases>    #'.bgBlack.white);
    console.log('# i.e.:  ./tester.js localhost mock test-cases/tool-tests              #'.bgBlack.white);
    console.log('#                                                                      #'.bgBlack.white);
    console.log('#   default server: localhost                                          #'.bgBlack.white);
    console.log('#   default version: 42                                                #'.bgBlack.white);
    console.log('#                                                                      #'.bgBlack.white);
    console.log('########################################################################'.bgBlack.white);
  },

  // shows error message.
  error_message : function(str) {
    console.log('');
    console.error(colors.bgBlack.red(str));
    console.log('');
  },

  // builds the connection options
  get_conn_options : function(version, server) {
    if (version == undefined) {
      version = "42";
    }
    if (server == undefined) {
      server = 'localhost'
    }
    var config_file = 'config/' + version + '_' + server + '.json';
    return JSON.parse(fs.readFileSync(config_file.toString(), 'utf8'));
  },

  // reads file and prepares payload.
  get_payload : function(file) {
    var payload = fs.readFileSync(file, 'utf8');
    // return payload.trim();
    return payload.replace(/\n/g,'').trim();
  },

  // builds the request and make the API call.
  make_request : function(conn_options, payload, current_test) {
    var req = http.request(conn_options, function(res) {
      var res_data = '';

      res.on('error', function (err) {
        error_message(err);
      });

      res.on('data', function (chunk) {
        res_data += chunk;
      });

      res.on('end', function () {
        // Working with response data:

        if (payload !== '') {
          var expected_res_file = payload.replace('/req/', '/res/');
          var expected_res_data = fs.readFileSync(expected_res_file, 'utf8');

          parse_xml(expected_res_data, function (err, parsed_expected_res) {
              if (err != undefined) {
                console.error(colors.red('oh-oh!!! [Error]: Parsing expected result: ' + err));
              } else {
                parse_xml(res_data, function (err, parsed_server_res) {
                    if (err != undefined) {
                      console.error(colors.red('oh-oh!!! [Error]: Parsing server result: ' + err));
                    } else {
                      // All good? Let me know if not and move on...
                      try {
                        var parsed_server_res_json = JSON.stringify(parsed_server_res);
                        var parsed_expected_res_json = JSON.stringify(parsed_expected_res);
                        assert.equal(parsed_server_res_json, parsed_expected_res_json);
                        console.log(colors.bgBlack.white(current_test) + ' ' + colors.rainbow('☺  Passed ☺ '));

                      } catch (err) {
                        console.log(colors.bgBlack.white(current_test) + ' ' + colors.bgRed.black('☹  Failed ☹ '));
                        console.log('');
                        console.log(colors.yellow('\tExpected:' + err.expected));
                        console.log(colors.red('\tActual: ' + err.actual));
                        console.log('');
                      }
                    }
                  });
              }
          });
        }
      });
    });
    req.write(this.get_payload(payload));
    req.end();
  }

};

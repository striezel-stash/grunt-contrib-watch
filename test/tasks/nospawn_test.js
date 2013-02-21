'use strict';

var grunt = require('grunt');
var path = require('path');
var fs = require('fs');
var helper = require('./helper');

var fixtures = helper.fixtures;

function cleanUp() {
  helper.cleanUp([
    'nospawn/node_modules'
  ]);
}

exports.nospawn = {
  setUp: function(done) {
    cleanUp();
    fs.symlinkSync(path.join(__dirname, '../../node_modules'), path.join(fixtures, 'nospawn', 'node_modules'));
    done();
  },
  tearDown: function(done) {
    cleanUp();
    done();
  },
  nospawn: function(test) {
    test.expect(3);
    var cwd = path.resolve(fixtures, 'nospawn');
    var assertWatch = helper.assertTask('watch', {cwd:cwd});
    assertWatch([function() {
      var write = 'var nospawn = true;';
      grunt.file.write(path.join(cwd, 'lib', 'nospawn.js'), write);
    }, function() {
      var write = 'var nospawn = true;';
      grunt.file.write(path.join(cwd, 'lib', 'nospawn.js'), write);
    }], function(result) {
      helper.verboseLog(result);
      var count = result.match((new RegExp('File "lib' + path.sep + 'nospawn.js" changed', 'g'))).length;
      test.equal(count, 2, 'Watch should have fired twice when nospawn.js has changed.');
      test.ok(result.indexOf('Server is listening...') !== -1, 'server should have been started.');
      test.ok(result.indexOf('Server is talking!') !== -1, 'server should have responded.');
      test.done();
    });
  },
  interrupt: function(test) {
    test.expect(2);
    var cwd = path.resolve(fixtures, 'nospawn');
    var assertWatch = helper.assertTask('watch', {cwd:cwd});
    assertWatch([function() {
      var write = 'var interrupt = true;';
      grunt.file.write(path.join(cwd, 'lib', 'interrupt.js'), write);
      setTimeout(function() {
        grunt.file.write(path.join(cwd, 'lib', 'interrupt.js'), write);
      }, 1000);
    }, function() {
      // Two functions needed to run two rounds of watching
    }], function(result) {
      helper.verboseLog(result);
      var count = result.match((new RegExp('Running "long" task', 'g'))).length;
      test.equal(count, 4, 'long task should have been ran only 4 times.');
      test.ok(result.indexOf('Previously ran tasks have been interrupted') !== -1, 'tasks should have been interrupted.');
      test.done();
    });
  },
};
"use strict";

var should = require("chai").should();
var poliscore = require("../");

describe('#versionGuard', function() {
  it('global._poliscore should be defined', function() {
    should.equal(global._poliscore, poliscore.version);
  });

  it('throw an error if version is already defined', function() {
    (function() {
      poliscore.versionGuard('version');
    }).should.throw('More than one instance of poliscore');
  });
});

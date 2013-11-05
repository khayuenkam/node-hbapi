var superagent = require('superagent');
var expect = require('expect.js');

describe('api server', function() {
  it('retrieves data from /paper', function(done) {
    superagent.get('http://imba-box-40776.apse1.actionbox.io:4000/paper')
      .end(function(err, res) {
        expect(err).to.eql(null);
        expect(typeof res.body).to.eql('object');
        expect(res.body.magazine.length).to.eql(1);
        done();
      });
  });

  it('retrieves data from /magazine', function(done) {
    superagent.get('http://imba-box-40776.apse1.actionbox.io:4000/magazine')
      .end(function(err, res) {
        expect(err).to.eql(null);
        expect(typeof res.body).to.eql('object');
        expect(res.body.magazine.length).to.eql(5);
        done();
      });
  });

  it('retrieves data from /news', function(done) {
    superagent.get('http://imba-box-40776.apse1.actionbox.io:4000/news')
      .end(function(err, res) {
        expect(err).to.eql(null);
        expect(res.body).to.be.an('array');
        expect(res.body.length).to.eql(16);
        done();
      });
  });

  it('retrieves data from /news/page/2', function(done) {
    superagent.get('http://imba-box-40776.apse1.actionbox.io:4000/news/page/2')
      .end(function(err, res) {
        expect(err).to.eql(null);
        expect(res.body).to.be.an('array');
        expect(res.body.length).to.eql(15);
        done();
      });
  });

  it('retrieves data from /news/page/200000 where the page does not exist', function(done) {
    superagent.get('http://imba-box-40776.apse1.actionbox.io:4000/news/page/200000')
      .end(function(err, res) {
        expect(err).to.eql(null);
        expect(res.body).to.be.an('object');
        expect(res.body.error).to.eql("No Such Page");
        done();
      });
  });
});


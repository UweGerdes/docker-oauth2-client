/**
 * Test for page elements
 */

'use strict';

const chai = require('chai'),
  chaiHttp = require('chai-http'),
  jsdom = require('jsdom'),
  assert = chai.assert,
  expect = chai.expect,
  { JSDOM } = jsdom;

chai.use(chaiHttp);

describe('/pages/tests/views/page.js', function () {
  describe('GET /app/', function () {
    it('should have head', function (done) {
      chai.request('http://localhost:8080')
        .get('/app/')
        .end(function (err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res).to.be.html;
          const { document } = (new JSDOM(res.text)).window;
          assert.equal(document.title, 'Module');
          assert.equal(document.head.getElementsByTagName('link').length, 1);
          assert.equal(
            document.head.getElementsByTagName('link')[0].attributes.href.nodeValue,
            '/css/app.css'
          );
          const headline = document.getElementById('headline');
          assert.equal(headline.textContent, 'Module:');
          done();
        });
    });
    it('should have footer', function (done) {
      chai.request('http://localhost:8080')
        .get('/app/')
        .end(function (err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res).to.be.html;
          const { document } = (new JSDOM(res.text)).window;
          const footer = document.getElementById('footer');
          assert.equal(footer.textContent.trim(), '© 2018 Uwe Gerdes');
          assert.equal(
            document.body.getElementsByTagName('script')[0].attributes.src.nodeValue,
            'http://localhost:8081/livereload.js'
          );
          done();
        });
    });
  });
});

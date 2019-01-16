/**
 * Test for boilerplate form elements
 */

'use strict';

const chai = require('chai'),
  chaiHttp = require('chai-http'),
  jsdom = require('jsdom'),
  assert = chai.assert,
  expect = chai.expect,
  { JSDOM } = jsdom;

chai.use(chaiHttp);

describe('/boilerplate/tests/views/form.js', function () {
  describe('GET /boilerplate/', function () {
    it('should have head and script', function (done) {
      chai.request('http://localhost:8080')
        .get('/boilerplate/form/')
        .end(function (err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res).to.be.html;
          const { document } = (new JSDOM(res.text)).window;
          assert.equal(document.title, 'Formular');
          assert.equal(document.head.getElementsByTagName('script').length, 1);
          assert.equal(
            document.head.getElementsByTagName('script')[0].attributes.src.nodeValue,
            '/js/boilerplate/script.js'
          );
          done();
        });
    });
    it('should have headline', function (done) {
      chai.request('http://localhost:8080')
        .get('/boilerplate/form/')
        .end(function (err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res).to.be.html;
          const { document } = (new JSDOM(res.text)).window;
          const headline = document.getElementById('headline');
          assert.equal(headline.textContent, 'Boilerplate');
          done();
        });
    });
  });
});

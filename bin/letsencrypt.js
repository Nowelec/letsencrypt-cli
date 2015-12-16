#!/usr/bin/env node
'use strict';

var cli = require('cli');

cli.parse({
  email: [ false, " Email used for registration and recovery contact. (default: null)", 'email' ]
, domains: [ false, " Domain names to apply. For multiple domains you can enter a comma separated list of domains as a parameter. (default: [])", 'string' ]
, duplicate: [ false, " Allow getting a certificate that duplicates an existing one", 'boolean', false ]
, 'agree-tos': [ false, " Agree to the Let's Encrypt Subscriber Agreement", 'boolean', false ]
, debug: [ false, " show traces and logs", 'boolean', false ]
, 'tls-sni-01-port': [ false, " Port number to perform tls-sni-01 challenge. Boulder in testing mode defaults to 5001. (default: 443 and 5001)", 'int' ]
, 'http-01-port': [ false, " Port used in the SimpleHttp challenge.", 'int', 80 ]
, 'rsa-key-size': [ false, " Size (in bits) of the RSA key.", 'int', 2048 ]
, 'cert-path': [ false, " Path to where new cert.pem is saved", 'string',':conf/live/:hostname/cert.pem' ]
, 'fullchain-path': [ false, " Path to where new fullchain.pem (cert + chain) is saved", 'string', ':conf/live/:hostname/fullchain.pem' ]
, 'chain-path': [ false, " Path to where new chain.pem is saved", 'string', ':conf/live/:hostname/chain.pem' ]
, 'domain-key-path': [ false, " Path to privkey.pem to use for domain (default: generate new)", 'string' ]
, 'config-dir': [ false, " Configuration directory.", 'string', '~/letsencrypt/etc/' ]
, server: [ false, " ACME Directory Resource URI.", 'string', 'https://acme-v01.api.letsencrypt.org/directory)' ]
, standalone: [ false, " Obtain certs using a \"standalone\" webserver.", 'boolean', true ]
//, manual: [ false, " Provide laborious manual instructions for obtaining a cert (default: false)", 'boolean', false ]
, webroot: [ false, " Obtain certs by placing files in a webroot directory.", 'boolean', false ]
, 'webroot-path': [ false, " public_html / webroot path.", 'string' ]
//, 'standalone-supported-challenges': [ false, " Supported challenges, order preferences are randomly chosen. (default: http-01,tls-sni-01)", 'string', 'http-01,tls-sni-01']
, 'work-dir': [ false, "(ignored)", 'string', '~/letsencrypt/var/lib/' ]
, 'logs-dir': [ false, "(ignored)", 'string', '~/letsencrypt/var/log/' ]
});

// ignore certonly and extraneous arguments
cli.main(function(_, options) {
  var args = {};
  var homedir = require('homedir')(); 

  Object.keys(options).forEach(function (key) {
    var val = options[key];

    if ('string' === typeof val) {
      val = val.replace(/^~/, homedir);
    }

    key = key.replace(/\-([a-z0-9A-Z])/g, function (c) { return c[1].toUpperCase(); });
    args[key] = val;
  });

  Object.keys(args).forEach(function (key) {
    var val = args[key];

    if ('string' === typeof val) {
      val = val.replace(/\:conf/, args.configDir);
    }

    args[key] = val;
  });

  var LE = require('letsencrypt');
  var handlers;
  
  if (args.standalone) {
    handlers = require('../lib/standalone');
  }
  else if (args.webrootPath) {
    handlers = require('../lib/webroot');
  }

  LE.create({}, handlers).register(args, function (err, results) {
    if (err) {
      console.error(err.stack);
      return;
    }

    // should get back account, path to certs, pems, etc?
    console.log(results);
  });
});

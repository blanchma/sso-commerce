var CrossStorageHub    = require('cross-storage').CrossStorageHub;
//var CrossStorageClient = require('cross-storage').CrossStorageClient;

CrossStorageHub.init([
  {origin: /localhost:9393$/, allow: ['get', 'set', 'del', 'getKeys', 'clear']},
  {origin: /store-fs7zl9.mybigcommerce.com$/, allow: ['get', 'set', 'del', 'getKeys', 'clear']},
  {origin: /test-store118.mybigcommerce.com$/, allow: ['get', 'set', 'del', 'getKeys', 'clear']}
]);
//
// var storage = new CrossStorageClient('http://localhost:9393/hub', {
//    timeout: 5000
// });
//
// storage.onConnect().then(function() {
//   return storage.set('email', 'admin@avi-on.com');
// }).then(function(res) {
//   console.log(res);
//   storage.close();
// });

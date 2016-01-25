var CrossStorageHub    = require('cross-storage').CrossStorageHub;

CrossStorageHub.init([
  {origin: /localhost:9393$/, allow: ['get', 'set', 'del', 'getKeys', 'clear']},
  {origin: /store-fs7zl9.mybigcommerce.com$/, allow: ['get', 'set', 'del', 'getKeys', 'clear']}
]);

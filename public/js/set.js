var CrossStorageClient = require('cross-storage').CrossStorageClient;


$(document).ready(function() {
  var storage = new CrossStorageClient('http://localhost:9393/hub', {
     timeout: 5000
  });

  storage.onConnect().then(function() {
    return storage.set('email', 'admin@avi-on.com');
  }).then(function(res) {
    console.log(res);
    storage.close();
  });
});

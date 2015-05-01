 var Twit = require('twit')

  var T = new Twit({
      consumer_key:         'xL0BXTOaaCcQmVmLA6nlYQ'
    , consumer_secret:      'Bek6nLcTnLl4rLxifZShemQd2SMsD4eIzyOyKo1WzE'
    , access_token:         '29187442-LorzteOUEh0T0EWVj4vIVmSOPx9jhZ0G8YsRDweId'
    , access_token_secret:  'FkIwNhLo0ncZMPpsm7ayUulP6Z0Cm4Ta6T8GCe82vOP6J'
  })

  var fs = require('fs');

  var geo = [ '-180', '-90', '180', '90' ];

  var stream = T.stream('statuses/filter', { locations: geo, language: 'en' });
  var i = 0;
  var file = 0;

  stream.on('tweet', function (tweet) {
//    console.log(tweet); //.user.name
    if (tweet.user.name.indexOf(" ")!=-1)
      console.log(tweet.user.name+" |  "+tweet.place.full_name)
//    fs.appendFile('tweets'+file+'.json', JSON.stringify(tweet)+"\n", function(err) {
//      if(err) {
//        console.log(err);
//      } else {
//        console.log("JSON saved to tweets"+i+".json");
//      }
//      });
//
//
//    i++;
//    if(i%500==0){
//      file++;
//      console.log("///")
//      setTimeout(function(){console.log("-->");stream.start();},1000);
//      stream.stop();
//    }
  })
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const unirest = require('unirest');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/stoplist', (req, res) => {
  var url = 'https://api.vertrektijd.info/stop/_geo/' + req.body.lat + '/' + req.body.lng + '/0.3';
  console.log(url);

  var key = process.env.vertrektijdkey;
  
  unirest.get(url)
  .headers({'Accept': 'application/json', 'Content-Type': 'application/json', 'X-Vertrektijd-Client-Api-Key' : key })
    .end(function(response){
      console.log(response.body);
     // iterate through the stations returned in the body and create buttons for each one
      let buttons = [];
      for(i=0;i<response.body.length;i++)  {
          var button = 
          {
            title : response.body[i].StopName + " - " + response.body[i].StopCode,
            type : "value",
            value : response.body[i].StopCode 
          }

          buttons.push(button)
      }
      var myResponse = 
      { replies: [
      {
          type : "buttons",
          content : {
            title : "Please choose your stop",
            buttons : buttons
          }

      }  ]}
      res.send( myResponse);
    });
  
} );

// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log('ovstopfinder  listening on port ${PORT}...');

});

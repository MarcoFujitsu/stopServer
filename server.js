var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var axios = require('axios');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var key = process.env.vertrektijdkey;
axios.defaults.headers.common["Content-Type"] = "application/json";
axios.defaults.headers.common["X-Vertrektijd-Client-Api-Key"] = key;

app.post('/stopinfo', (req, res) => {

  var stopCode = req.body.stopCode;

  var url = "https://api.vertrektijd.info/departures/_stopcode/" + stopCode + "/";
  
  axios.get(url)
  .then(function(response) {

    res.send(response.data);
  });

});

app.post('/stoplist', (req, res) => {
  console.log(req.body);
  var url = 'https://api.vertrektijd.info/stop/_geo/' + req.body.lat + '/' + req.body.lng + '/0.3';
  
  axios.get(url)
  .then(function(response){
    let buttons = [];
      for(i=0;i<response.data.length;i++)  {
          var button = 
          {
            title : response.data[i].StopName + " - " + response.data[i].StopCode,
            type : "value",
            value : response.data[i].StopCode 
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



// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log('ovstopfinder  listening on port ${PORT}...');

});



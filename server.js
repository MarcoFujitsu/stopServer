var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var axios = require('axios');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var key = process.env.vertrektijdkey;
var car = {
   type: "carousel",
  content : [] };

axios.defaults.headers.common["Content-Type"] = "application/json";
axios.defaults.headers.common["X-Vertrektijd-Client-Api-Key"] = key;

app.post('/stopinfo', (req, res) => {

  var stopCode = req.body.stopCode;

  var url = "https://api.vertrektijd.info/departures/_stopcode/" + stopCode + "/";
  
  axios.get(url)
    .then(function(response) {

    
    
    // go through all departures, and put them in a unique list
    let journeyNumbers = [];
    var jn;
    for(i=0;i<response.data.BTMF[0].Departures.length;i++)
    {
      jn = response.data.BTMF[0].Departures[i].JourneyNumber;
      if( journeyNumbers.includes(jn) == false) {
        journeyNumbers.push(jn);
        addToCarousel(response.data.BTMF[0].Departures[i]);
        console.log(response.data.BTMF[0].Departures[i]);
      }
      
    }

    var myResponse = 
      { replies: [] };

    myResponse.replies.push(car);
    console.log(myResponse);
    res.send(myResponse);
    });
});


function addToCarousel(departure) {
    var name = departure.LineName + " - " + departure.Destination
    var depTime = new Date(departure.ExpectedDeparture).toLocaleTimeString();
    depTime = depTime.substring(0, depTime.length-3);

      for(i=0; i< car.content.length; i++){
          if(car.content[i].title == name ) {
            // update existing stop with new time button
            var button = { 
              "Title" : depTime,
              "type" : "postback",
              "value" : depTime
            }

            car.content[i].buttons.push(button)
            return;
          }
      }
      var content = {
        "title": departure.LineName + " - " + departure.Destination,
        "subtitle": departure.TransportType,
        "imageUrl": "https://cdn4.iconfinder.com/data/icons/eldorado-transport/40/bus_2-512.png",
        "buttons": [
          {
            "Title" : depTime,
            "type" : "postback",
            "value" : depTime
          }
        ]
      };
      car.content.push(content);
}


app.post('/stoplist', (req, res) => {
  console.log(req.body);
  var url = 'https://api.vertrektijd.info/stop/_geo/' + req.body.lat + '/' + req.body.lng + '/0.3';
  
  axios.get(url)
  .then( function(response){
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
  })
});
   
  



// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log('ovstopfinder  listening on port ${PORT}...');
});

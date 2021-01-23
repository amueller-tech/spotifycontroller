const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const path = require('path');
const config = require('./config/config.json');
const log = require('console-log-level')({ level: config.server.logLevel })

const SpotifyWebApi = require('spotify-web-api-node');
const app = express();
const server = http.createServer(app);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


var scopes = ['streaming', 'user-read-currently-playing', 'user-modify-playback-state', 'user-read-playback-state'];

var spotifyApi = new SpotifyWebApi({
    clientId: config.spotify.clientId,
    clientSecret: config.spotify.clientSecret,
    refreshToken: config.spotify.refreshToken,
});

 /*sets and refreshes access token every hour */
spotifyApi.setAccessToken(config.spotify.accessToken);
refreshToken();
setInterval(refreshToken, 1000 * 60 * 60);


function refreshToken(){
  spotifyApi.refreshAccessToken().then(
    function(data) {
      log.debug('The access token has been refreshed!');

      // Save the access token so that it's used in future calls
      spotifyApi.setAccessToken(data.body['access_token']);
    },
    function(err) {
      log.debug('Could not refresh access token', err);
    }
  );
}

  /*queries all devices and transfers playback to the first one discovered*/
function setActiveDevice() {
  let activeDevice ;
  spotifyApi.getMyDevices().then(function(data) {
      let availableDevices = data.body.devices;
      log.debug("[Spotify Control] Getting available devices...");
      activeDevice = availableDevices[0];
    }, function(err) {
      handleSpotifyError(err);
    }).then(function(){
    spotifyApi.transferMyPlayback([activeDevice.id], {"play": true})
      .then(function() {
        log.debug('[Spotify Control] Transfering playback to ' + activeDevice.name);
      }, function(err) {
        handleSpotifyError(err);
      });
});
}

function handleSpotifyError(err){

  if (err.body.error.status == 401){
    log.debug("access token expired, refreshing...");
    refreshToken();
  }

  else if (err.toString().includes("NO_ACTIVE_DEVICE")) {
    log.debug("no active device, setting the first one found to active");
    setActiveDevice();
  }
  else {
    log.debug("an error occured: " + err)
  }
}

function pause(){
  spotifyApi.pause().then(function() {
      log.debug('[Spotify Control] Playback paused');
    }, function(err) {
      handleSpotifyError(err);
    });
}

function play(){
  spotifyApi.play().then(function() {
      log.debug('[Spotify Control] Playback started');
    }, function(err) {
      handleSpotifyError(err);
    });
}

function next(){
spotifyApi.skipToNext().then(function() {
    log.debug('[Spotify Control] Skip to next');
  }, function(err) {
    handleSpotifyError(err);
  });
}

function previous(){
spotifyApi.skipToPrevious().then(function() {
    log.debug('[Spotify Control] Skip to previous');
  }, function(err) {
    handleSpotifyError(err);
  });
}

function playMe(activePlaylistId){
  spotifyApi.play({ context_uri: activePlaylistId }).then(
      function(data){
          log.debug("[Spotify Control] Playback started");
      },
      function(err){
          handleSpotifyError(err);
      }
  );
}

  /*gets available devices, searches for the active one and returns its volume*/
function setVolume(volume){

  let targetVolume = 0;

  spotifyApi.getMyDevices().then(function(data) {
      let availableDevices = data.body.devices;
      let currentVolume = 0;

      availableDevices.forEach(item => {
        if (item.is_active){
          currentVolume = item.volume_percent;
          log.debug("[Spotify Control]Current volume for active device is " + currentVolume);
          }
      });

      if (volume) targetVolume = currentVolume+5;
      else targetVolume = currentVolume-5;

    }).then(function(){
      spotifyApi.setVolume(targetVolume).then(function () {
          log.debug('[Spotify Control] Setting volume to '+ targetVolume);
          }, function(err) {
          handleSpotifyError(err);
        });

    }, function(err) {
      handleSpotifyError(err);
    });
}

  /*endpoint to return all spotify connect devices on the network*/
  /*only used if sonos-kids-player is modified*/
app.get("/getDevices", function(req, res){

  spotifyApi.getMyDevices().then(function(data) {
      let availableDevices = data.body.devices;
      log.debug("[Spotify Control] Getting available devices...");
      res.send(availableDevices);
    }, function(err) {
      handleSpotifyError(err);
    });
});

  /*endpoint transfer a playback to a specific device*/
  /*only used if sonos-kids-player is modified*/
app.get("/setDevice", function(req, res){

  spotifyApi.transferMyPlayback([req.query.id], {"play": true})
    .then(function() {
      log.debug('[Spotify Control] Transfering playback to ' + req.query.id);
      let resp = {"status":"ok","error":"none"};
      res.send(resp);

    }, function(err) {
      //if the user making the request is non-premium, a 403 FORBIDDEN response code will be returned
      handleSpotifyError(err);
      let resp = {"status":"error","error":"could not transfer playback"};
      res.send(resp);
    });
});

  /*sonos-kids-controller sends commands via https get and path names*/
app.use(function(req, res){
  let command = path.parse(req.url);

  if(command.name.includes("spotify:") )
    playMe(command.name);

  else if (command.name == "pause")
    pause();

  else if (command.name == "play")
    play();

  else if (command.name == "next")
    next();

  else if (command.name == "previous")
    previous();

  else if (command.name == "+5")
    setVolume(1);

  else if (command.name == "-5")
    setVolume(0);

  let resp = {"status":"ok","error":"none"};
  res.send(resp);
});

server.listen(config.server.port, () => {
  log.debug("[Spotify Control] Webserver is running on port: " + config.server.port );
});
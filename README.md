# Spotify Controller - a Spotify Connect Endpoint for the Sonos Kids Controller

## About
This software provides a simple REST API to control a spotify device.
It was developed to enable the Sonos Kids Controller (https://github.com/Thyraz/Sonos-Kids-Controller) to also work without a sonos device. Instead, it receives the original commands and sends them to a spotify connect enabled device.

As the REST API is compatible to a subset of the [node-sonos-http-api](https://github.com/Thyraz/node-sonos-http-api) this can be done without any changes to the Sonos Kids Controller itself. However, this slightly modified version https://github.com/amueller-tech/Sonos-Kids-Controller extends the frontend by the ability to chose among all available spotify connect players.

## Installation
Ensure that you have Node.js and npm installed.
Then install this software from Github:
```
wget https://github.com/amueller-tech/spotifycontroller/archive/main.zip
unzip main.zip
rm main.zip
cd spotifycontroller-main
npm install
```

## Linking the application to your Spotify Account
First you need to link the application to your spotify account and retrieve an access and a refresh token. This only needs to be done once, the software refreshes the access token (which expires every 3600s) automatically.
```
Go to: https://developer.spotify.com/dashboard/ and click "log in"
create an app
Give it a name and a description
the Client ID and Client Secret are shown
click "edit settings"
add "http://localhost:8888/callback" to "Redirect URIs" and save
run the following command in a terminal: node auth.js "<Client ID>" "<Client Secret>"
in a browser go to: http://localhost:8888/login
log into spotify and confirm the requested permissions
it will output an access and a refresh token
```
## Configuration
Create the configuration file by making a copy of the included example:
```
cp config/config-example.json config/config.json
```
Edit the config/config.json file. The server port 5005 should equal to the port as defined in sonos-kids-controller. You can set the logLevel to "debug" to see some output when running the application
```
{
    "spotify": {
        "clientId": "as shown in the spotify dashboard",
        "clientSecret": "as shown in the spotify dashboard",
        "accessToken": "as shown in ther terminal from auth.js",
        "refreshToken": "as shown in ther terminal from auth.js",
        "redirectUri": "http://localhost:8888/callback"
    },
    "server": {
        "port": "5005",
        "logLevel": "error"
    }
}
```
Then start the software like this:
```
npm start
```
If all went well, you get get a list of available spotify connect devices by browsing to
```
http://localhost:5005/getDevices
```

## Docker
You can easily run the application in a docker container. To build and start:
`````
docker-compose build
docker-compose up

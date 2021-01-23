# Spotify Controller - a Spotify Connect Endpoint for the Sonos Kids Controller

## About
This software provides a simple REST API to control a spotify device.
It was developed to enable the Sonos Kids Controller (https://github.com/Thyraz/Sonos-Kids-Controller) to also work without a sonos device.
As the REST API is compatible to a subset of the [node-sonos-http-api](https://github.com/Thyraz/node-sonos-http-api) this can be done without major changes to the Sonos Kids Controller itself.

## Installation
Ensure that you have Node.js and npm installed.
Then install this software from Github:
```
wget https://github.com/amueller-tech/spotifycontroller/archive/main.zip

unzip main.zip

rm master.zip

cd spotifycontrolller

npm install

```
Create the configuration file by making a copy of the included example:
```
cd server/config

cp config-example.json config.json
```
Edit the config file as discribed in the chapter [configuration](#configuration)

Then start the software like this:
```
npm start
```

After that open a browser window and navigate to 
```
http://ip.of.the.server:8200
```
Now the user interface should appear

## Configuration
```
{
    "node-sonos-http-api": {
        "server": "127.0.0.1",
        "port": "5005",
        "rooms": [
            "Livingroom",
            "Kitchen"
        ]
    },
    "spotify": {
        "clientId": "your_id",
        "clientSecret": "your_secret"
    }
}
```
Point the node-sonos-http-api section to the adress and the port where the service is running.
The rooms are the Sonos room names that you want to be allowed as target.

Room selection isn't implemented yet, so only the first room will be used at the moment.

The spotify section is only needed when you want to use Spotify Premium as source.
The id and the secret are the same values as entered in the node-sonos-http-api configuration as described [here.](https://github.com/Thyraz/node-sonos-http-api#note-for-spotify-users)

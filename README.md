# Bitmovin Analytics Sample Dashboard
[![bitmovin](http://bitmovin-a.akamaihd.net/webpages/bitmovin-logo-github.png)](http://www.bitmovin.com)
[![Build Status](https://travis-ci.org/bitmovin/bitmovin-analytics-sample-dashboard.svg?branch=master)](https://travis-ci.org/bitmovin/bitmovin-analytics-sample-dashboard)

This project is meant as an example of how a Bitmovin Analytics dashboard could look like. This is by no means a fully featured Dashboard but meant to give users a starting point from where to develop their own.

Using the Bitmovin API requires an active account. [Sign up for a Bitmovin API key](https://bitmovin.com/bitmovins-video-api/).

Installation 
------------

This project is using [yarn](https://yarnpkg.com/en/). Please make sure you have the latest version of yarn installed.

``` bash
git clone https://github.com/bitmovin/bitmovin-analytics-sample-dashboard.git
yarn install
```

Running the Dashboard locally
----------

To start up the built-in webpack development server run:

```es6
yarn start
```


Docker
-----------

A sample `Dockerfile` is provided to run a simple [pushstate-server](https://www.npmjs.com/package/pushstate-server) inside the container.

```bash
docker build -t <image-name> .
```

Contributing
-----------

We'd love to make the dashboard better for everyone so feel free to contribute back via Pull-Requests!

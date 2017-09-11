#!/usr/bin/env bash

yarn run build

cp Dockerfile build/Dockerfile
cd build/

echo "Building docker image: bitmovin/bitanalytics-dashboard:`git describe`"
docker build -t bitmovin/bitanalytics-dashboard:latest -t bitmovin/bitanalytics-dashboard:`git describe` .

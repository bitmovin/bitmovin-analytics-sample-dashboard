from nodesource/node:4.0

RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb http://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
RUN apt-get update && apt-get install yarn

ADD . .
RUN yarn global add pushstate-server
CMD pushstate-server .
EXPOSE 9000

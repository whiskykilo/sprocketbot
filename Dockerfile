# whiskykilo
# last updated: 5/17/17
# usage: docker run --name sprocketbot01 sprocketbot

FROM bottato/botkit

COPY . /app

RUN cd /app \
  && npm install --production

WORKDIR /app

CMD ["node", "slack_bot.js"]

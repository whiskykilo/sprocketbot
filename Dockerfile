# @sprocket
# Nutanix Slackbot
# Maintained by: whiskykilo

FROM bottato/botkit

COPY . /app

RUN cd /app \
  && npm install --production && npm install dotenv nutanix_prism

WORKDIR /app

CMD ["node", "slack_bot.js"]

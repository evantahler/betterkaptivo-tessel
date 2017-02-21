# Better Kaptivo Tessel

The Kaptivo camera's hardware is awesome... but its software... misses the mark.  All I want is to hit a button and send the image to Slack.  Here's how to do that with a [Tessel](https://tessel.io/)

![https://github.com/evantahler/betterkaptivo-tessel/blob/master/images/hardware.jpg?raw=true](https://github.com/evantahler/betterkaptivo-tessel/blob/master/images/hardware.jpg?raw=true)

![https://github.com/evantahler/betterkaptivo-tessel/blob/master/images/log.png?raw=true](https://github.com/evantahler/betterkaptivo-tessel/blob/master/images/log.png?raw=true)

![https://github.com/evantahler/betterkaptivo-tessel/blob/master/images/slack.png?raw=true](https://github.com/evantahler/betterkaptivo-tessel/blob/master/images/slack.png?raw=true)

Install Tessel CLI
`npm install -g t2-cli`

Update your Tessel
`t2 update`

Get your Tessel on wifi
`t2 wifi --help`

Update the code on `./node_modules/tessel-av/` per https://forums.tessel.io/t/dest-end-is-not-a-function-error/2874/3
(there is a bug in the Tessel A/V code)

Generate a slack API token @ https://my.slack.com/apps/manage/custom-integrations.  Make a new `bot`

copy `config.json.example` to `config.json` in your project and fill in:
- `slackToken` from above
- `rooms` are the human-readable names for the rooms you want to post images into, ie: `general`

Wire up your button so that pressing it would connect the ground to the pin (Tessel has a default of 'high' for digital inputs)

push the code to your tessel with `t2 push index.js`

Profit.

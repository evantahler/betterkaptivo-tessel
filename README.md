# Better Kaptivo Tessel

Install Tessel CLI
`npm install -g t2-cli`

Update your Tessel
`t2 update`

Get your Tessel on wifi
`t2 wifi --help`

Update the code on `./node_modules/tessel-av/` per https://forums.tessel.io/t/dest-end-is-not-a-function-error/2874/3
(there is a bug in the Tessel A/V code)

Generate a slack API token @ https://my.slack.com/apps/manage/custom-integrations.  Make a new `bot`

copy `config.json.example` to `config.json` in your project

push the code to your tessel with `t2 push index.json`

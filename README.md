# BallotBot
_I am a work in progress; not all features have been implemented yet._
A Discord bot meant to deliver democracy upon the disenfranchised masses.
To vote, simply react to the ballot message with the appropriate emoji.

## The Electoral System 
As a voter, you are able to give a **for**, **against**, or **present** vote.
Voting thresholds are calculated based on a proportion of members in the server
who have been recently active within a certain timeframe.
A policy is either accepted or rejected when the number of **for** or **present** votes
exceeds the threshold, or the ballot expires.
A **present** vote counts for whichever side reaches the threshold first.

## Configuration
There is a configuration file that is not committed to this repository for security reasons.
If you wish to host your own instance of BallotBot, you must provide a _config.json_ file.
This file has the following format and fields:
```json
{
	"token": "YOUR_DISCORD_BOT_TOKEN",
	"prefix": "/",
	"command": "callvote",
	"for_emoji": "\uD83D\uDC4D",
	"against_emoji": "\uD83D\uDC4E",
	"present_emoji": "\uD83D\uDC4C"
	"prune_days": "7"
}
```

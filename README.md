# Snapcord

Turns text channels into a Snapchat-style chats, where messages are deleted after 24 hours. You can save messages by reacting with 💾.

Click [install](https://discord.com/oauth2/authorize?client_id=1337983783864893450) to add it to your server 😊

## Features

- Automatically deletes old messages.
- Set how long messages last in the channel.
- Messages reacted with 💾 are saved.

## Commands

### `/enable`

Enables Snapcord in a channel with a specified duration.

| Option     | Required | Description                                    |
| ---------- | -------- | ---------------------------------------------- |
| `duration` | yes      | Amount of time before messages are deleted.    |
| `channel`  | no       | Which channel to enable (this one by default). |

### `/disable`

Disables Snapcord in a channel.

| Option    | Required | Description                                     |
| --------- | -------- | ----------------------------------------------- |
| `channel` | no       | Which channel to disable (this one by default). |

### `/status`

Replies whether or not Snapcord is enabled in a channel.

| Option    | Required | Description                                    |
| --------- | -------- | ---------------------------------------------- |
| `channel` | no       | Which channel to enable (this one by default). |

## Local Install

### Requirements

- Node.js (latest LTS version recommended)
- A Discord bot token
- A PostgreSQL database hosted on Neon

### Installation

1. Clone this repository:

   ```sh
   git clone https://github.com/Helmare/snapcord.git
   cd snapcord
   ```

2. Install dependencies:

   ```sh
   npm install
   ```

3. Create a `.env` or `.env.development` file and add the following:

   ```env
   SLEEP_DURATION=60000
   DISCORD_CLIENT_TOKEN='your-token'
   DATABASE_URL='your-database-url'
   ```

4. Start the bot:
   ```sh
   npm run dev
   ```

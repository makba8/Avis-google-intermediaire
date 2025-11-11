import { google } from 'googleapis';
import * as fs from 'fs';
import * as readline from 'readline';
import * as path from 'path';

// Import des constantes depuis le dossier src
const Constants = {
  GOOGLE_CREDENTIALS_PATH: './credentials.json',
  GOOGLE_TOKEN_PATH: './token.json',
  GOOGLE_SCOPES: ['https://www.googleapis.com/auth/calendar.readonly']
};

const CREDENTIALS_PATH = process.env.GOOGLE_CREDENTIALS_PATH || Constants.GOOGLE_CREDENTIALS_PATH;
const TOKEN_PATH = process.env.GOOGLE_TOKEN_PATH || Constants.GOOGLE_TOKEN_PATH;

async function main() {
  const creds = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
  const { client_secret, client_id, redirect_uris } = creds.installed || creds.web;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  const SCOPES = Constants.GOOGLE_SCOPES;

  const authUrl = oAuth2Client.generateAuthUrl({ access_type: 'offline', scope: SCOPES });
  console.log('Authorize this app by visiting this url:', authUrl);

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err || !token) return console.error('Error retrieving access token', err);
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
      console.log('Token stored to', TOKEN_PATH);
    });
  });
}

main().catch(console.error);

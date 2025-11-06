import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  // Charger credentials et token
  const credentials = JSON.parse(fs.readFileSync(path.join(__dirname, '../credentials.json'), 'utf8'));
  const token = JSON.parse(fs.readFileSync(path.join(__dirname, '../token.json'), 'utf8'));

  const { client_id, client_secret } = credentials.installed;
  const redirect_uri = 'urn:ietf:wg:oauth:2.0:oob';

  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uri);
  oAuth2Client.setCredentials(token);

  const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

  const res = await calendar.events.list({
    calendarId: 'primary',
    timeMin: (new Date()).toISOString(),
    maxResults: 5,
    singleEvents: true,
    orderBy: 'startTime',
  });

  console.log('Événements récupérés :');
  console.log(res.data.items);
}

main().catch(console.error);

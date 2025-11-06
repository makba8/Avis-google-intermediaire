import { Injectable, Logger } from '@nestjs/common';
import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class GoogleService {
  private oauth2Client;
  private calendar;
  private logger = new Logger(GoogleService.name);

  constructor() {
    const credsPath = process.env.GOOGLE_CREDENTIALS_PATH || './credentials.json';
    const tokenPath = process.env.GOOGLE_TOKEN_PATH || './token.json';
    const creds = require(credsPath);
    const { client_secret, client_id, redirect_uris } = creds.installed || creds.web;
    this.oauth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    if (fs.existsSync(tokenPath)) {
      const tok = require(path.resolve(tokenPath));
      this.oauth2Client.setCredentials(tok);
    } else {
      this.logger.warn('Google token.json missing. Run the token generator script.');
    }
    this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

      const res = this.calendar.events.list({
        calendarId: 'primary',
        timeMin: (new Date()).toISOString(),
        maxResults: 5,
        singleEvents: true,
        orderBy: 'startTime',
      });
      console.log(res.data.items);
  }

  async listEvents(timeMin: string, timeMax: string) {
    const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';
    const res = await this.calendar.events.list({
      calendarId,
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: 'startTime'
    });
    return res.data.items || [];
  }
}

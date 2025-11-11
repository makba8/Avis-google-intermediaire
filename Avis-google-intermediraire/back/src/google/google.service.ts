import { Injectable, Logger } from '@nestjs/common';
import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';
import { Constants } from '../Ressources/Constants';

@Injectable()
export class GoogleService {
  private oauth2Client;
  private calendar;
  private logger = new Logger(GoogleService.name);

  constructor() {
    // Résoudre les chemins de manière absolue depuis le dossier back/
    const backDir = process.cwd();
    const credsPath = process.env.GOOGLE_CREDENTIALS_PATH || '';
    const tokenPath = process.env.GOOGLE_TOKEN_PATH || '';

    
    this.logger.log(`Looking for credentials at: ${credsPath}`);
    this.logger.log(`Looking for token at: ${tokenPath}`);
    
    // Check if credentials file exists
    if (!fs.existsSync(credsPath)) {
      this.logger.warn(
        `Google credentials.json not found at ${credsPath}. ` +
        'Google Calendar integration will be disabled. ' +
        'See README.md for setup instructions.'
      );
      this.calendar = null;
      return;
    }

    try {
      this.logger.log('Loading credentials...');
      const creds = JSON.parse(fs.readFileSync(credsPath, 'utf8'));
      const { client_secret, client_id, redirect_uris } = creds.installed || creds.web;
      
      if (!client_id || !client_secret) {
        throw new Error('Missing client_id or client_secret in credentials.json');
      }
      
      this.oauth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris?.[0]);
      this.logger.log('OAuth2 client created');
      
      if (fs.existsSync(tokenPath)) {
        this.logger.log('Loading token...');
        const tok = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
        this.oauth2Client.setCredentials(tok);
        
        // Configurer le refresh automatique du token
        this.oauth2Client.on('tokens', (tokens) => {
          if (tokens.refresh_token) {
            // Sauvegarder le nouveau refresh_token
            const updatedToken = { ...tok, ...tokens };
            fs.writeFileSync(tokenPath, JSON.stringify(updatedToken));
            this.logger.log('Token refreshed and saved');
          }
        });
        
        this.logger.log('Token loaded and set');
      } else {
        this.logger.warn(`Google token.json missing at ${tokenPath}. Run: npm run generate-google-token`);
      }
      
      this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
      this.logger.log('✅ Google Calendar API initialized successfully');
    } catch (error) {
      this.logger.error(`❌ Failed to initialize Google Calendar API: ${error.message}`);
      this.logger.error(error.stack);
      this.calendar = null;
    }
  }

  async listEvents(timeMin: string, timeMax: string) {
    if (!this.calendar) {
      this.logger.warn('Google Calendar not initialized. Skipping event fetch.');
      return [];
    }

    try {
      const calendarId = process.env.GOOGLE_CALENDAR_ID;
      const res = await this.calendar.events.list({
        calendarId,
        timeMin,
        timeMax,
        singleEvents: true,
        orderBy: 'startTime'
      });
      return res.data.items || [];
    } catch (error: any) {
      if (error.message === 'invalid_grant' || error.code === 'invalid_grant') {
        this.logger.error('❌ Google token expired or invalid. Please regenerate:');
        this.logger.error('   1. Run: npm run generate-google-token');
        this.logger.error('   2. Follow the instructions to authorize again');
        this.logger.error('   3. Restart the backend');
      } else {
        this.logger.error(`Error fetching calendar events: ${error.message}`);
      }
      return [];
    }
  }
}

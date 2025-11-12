import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private client: SupabaseClient | null = null;
  private readonly logger = new Logger(SupabaseService.name);

  onModuleInit() {
    // Initialiser Supabase seulement en production
    if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
      this.client = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY,
        {
          auth: {
            persistSession: false,
          },
        }
      );
      this.logger.log('✅ Supabase client initialisé');
    } else {
      this.logger.warn('⚠️ Supabase non configuré (utilise SQLite en dev)');
    }
  }

  getClient(): SupabaseClient | null {
    return this.client;
  }

  isEnabled(): boolean {
    return this.client !== null;
  }

  // Méthodes pour les RDV
  async findRdvByCalendarEventId(eventId: string) {
    if (!this.client) return null;
    const { data, error } = await this.client
      .from('rdv')
      .select('*')
      .eq('calendarEventId', eventId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      this.logger.error(`Erreur Supabase findRdvByCalendarEventId: ${error.message}`);
      return null;
    }
    return data;
  }

  async createRdv(rdv: {
    id?: string;
    emailClient: string;
    dateRdv: Date;
    token: string;
    calendarEventId: string;
    mailEnvoye?: boolean;
  }) {
    if (!this.client) throw new Error('Supabase non initialisé');
    
    const { data, error } = await this.client
      .from('rdv')
      .insert({
        id: rdv.id,
        emailClient: rdv.emailClient,
        dateRdv: rdv.dateRdv.toISOString(),
        token: rdv.token,
        calendarEventId: rdv.calendarEventId,
        mailEnvoye: rdv.mailEnvoye || false,
      })
      .select()
      .single();
    
    if (error) {
      this.logger.error(`Erreur Supabase createRdv: ${error.message}`);
      throw error;
    }
    return data;
  }

  async updateRdv(id: string, updates: Partial<{
    emailClient: string;
    dateRdv: Date;
    mailEnvoye: boolean;
    token: string;
  }>) {
    if (!this.client) throw new Error('Supabase non initialisé');
    
    const updateData: any = { ...updates };
    if (updateData.dateRdv) {
      updateData.dateRdv = updateData.dateRdv.toISOString();
    }
    
    const { data, error } = await this.client
      .from('rdv')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      this.logger.error(`Erreur Supabase updateRdv: ${error.message}`);
      throw error;
    }
    return data;
  }

  async findRdvByToken(token: string) {
    if (!this.client) return null;
    const { data, error } = await this.client
      .from('rdv')
      .select('*')
      .eq('token', token)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      this.logger.error(`Erreur Supabase findRdvByToken: ${error.message}`);
      return null;
    }
    return data;
  }

  async countRdv() {
    if (!this.client) return 0;
    const { count, error } = await this.client
      .from('rdv')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      this.logger.error(`Erreur Supabase countRdv: ${error.message}`);
      return 0;
    }
    return count || 0;
  }

  // Méthodes pour les Votes
  async findVoteByToken(token: string) {
    if (!this.client) return null;
    const { data, error } = await this.client
      .from('vote')
      .select('*')
      .eq('token', token)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      this.logger.error(`Erreur Supabase findVoteByToken: ${error.message}`);
      return null;
    }
    return data;
  }

  async createVote(vote: {
    id?: string;
    token: string;
    note: number;
    commentaire: string | null;
    dateVote: Date;
  }) {
    if (!this.client) throw new Error('Supabase non initialisé');
    
    const { data, error } = await this.client
      .from('vote')
      .insert({
        id: vote.id,
        token: vote.token,
        note: vote.note,
        commentaire: vote.commentaire,
        dateVote: vote.dateVote.toISOString(),
      })
      .select()
      .single();
    
    if (error) {
      this.logger.error(`Erreur Supabase createVote: ${error.message}`);
      throw error;
    }
    return data;
  }

  async getAllVotes() {
    if (!this.client) return [];
    const { data, error } = await this.client
      .from('vote')
      .select('*');
    
    if (error) {
      this.logger.error(`Erreur Supabase getAllVotes: ${error.message}`);
      return [];
    }
    return data || [];
  }

  async countVotes() {
    if (!this.client) return 0;
    const { count, error } = await this.client
      .from('vote')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      this.logger.error(`Erreur Supabase countVotes: ${error.message}`);
      return 0;
    }
    return count || 0;
  }
}


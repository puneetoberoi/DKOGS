// src/services/reportService.ts

import type { MarketReport } from '../schema';
import { supabase } from '../contexts/AuthContext';

export interface SavedReportItem {
  id: string;
  keyword: string;
  industry: string;
  overall_score: number;
  created_at: string;
  report_data: MarketReport;
}

export const saveReport = async (userId: string, report: MarketReport) => {
  try {
    console.log('Attempting to save report for user:', userId);
    
    // 1. Check session first
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error('No active session');
      return { success: false, error: 'User not authenticated (No Session)' };
    }

    // 2. Check if profile exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();
    
    if (!profile || profileError) {
      console.warn('Profile missing, attempting to create...');
      // Try to create profile if missing (Fallback)
      const { error: createError } = await supabase
        .from('profiles')
        .insert({ id: userId, email: session.user.email });
        
      if (createError) {
        console.error('Failed to create fallback profile:', createError);
      }
    }

    // 3. Insert Report
    const payload = {
      user_id: userId,
      keyword: report.keyword,
      industry: report.industry,
      overall_score: report.overallSentiment, 
      summary: report.summary,
      report_data: report, 
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('saved_reports')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('Supabase Insert Error:', error);
      return { success: false, error: error.message || 'Database Insert Failed' };
    }
    
    return { success: true, data };
  } catch (error: any) {
    console.error('Unexpected error saving report:', error);
    return { success: false, error: error.message || 'Unexpected Error' };
  }
};

export const getSavedReports = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('saved_reports')
      .select('id, keyword, industry, overall_score, created_at, report_data')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data: data as SavedReportItem[] };
  } catch (error) {
    console.error('Error fetching reports:', error);
    return { success: false, error };
  }
};

export const deleteReport = async (reportId: string) => {
  try {
    const { error } = await supabase
      .from('saved_reports')
      .delete()
      .eq('id', reportId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting report:', error);
    return { success: false, error };
  }
};

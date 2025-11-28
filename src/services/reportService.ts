import { createClient } from '@supabase/supabase-js';
import type { MarketReport } from '../schema';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export interface SavedReportItem {
  id: string;
  keyword: string;
  industry: string;
  overall_score: number;
  created_at: string;
  report_data: MarketReport; // We need this to view it
}

export const saveReport = async (userId: string, report: MarketReport) => {
  try {
    console.log('Attempting to save report for user:', userId);
    
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
      console.error('Supabase Error Detail:', error);
      throw error;
    }
    
    return { success: true, data };
  } catch (error: any) {
    console.error('Error saving report:', error.message || error);
    return { success: false, error };
  }
};

export const getSavedReports = async (userId: string) => {
  try {
    // Fetch everything needed for the card + the data to load it
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

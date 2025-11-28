import { createClient } from '@supabase/supabase-js';
import type { MarketReport } from '../schema';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export const saveReport = async (userId: string, report: MarketReport) => {
  try {
    console.log('Attempting to save report for user:', userId);
    
    // Validate payload
    const payload = {
      user_id: userId,
      keyword: report.keyword,
      industry: report.industry,
      overall_score: report.overallSentiment, 
      summary: report.summary,
      report_data: report, 
      created_at: new Date().toISOString(),
    };

    console.log('Payload:', payload);

    const { data, error } = await supabase
      .from('saved_reports')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('Supabase Error Detail:', error); // CRITICAL: Log exact error
      throw error;
    }
    
    console.log('Report saved successfully:', data);
    return { success: true, data };
  } catch (error: any) {
    console.error('Error saving report:', error.message || error);
    return { success: false, error };
  }
};

export const getSavedReports = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('saved_reports')
      .select('id, keyword, industry, overall_score, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching reports:', error);
    return { success: false, error };
  }
};

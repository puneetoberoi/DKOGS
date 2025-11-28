import { createClient } from '@supabase/supabase-js';
import type { MarketReport } from '../schema';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export const saveReport = async (userId: string, report: MarketReport) => {
  try {
    const { data, error } = await supabase
      .from('saved_reports')
      .insert({
        user_id: userId,
        keyword: report.keyword,
        industry: report.industry,
        overall_score: report.overallSentiment, // Assuming overallSentiment is the score (0-100)
        summary: report.summary,
        report_data: report, // Save full JSON
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error saving report:', error);
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

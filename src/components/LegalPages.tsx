import React from 'react';
import { ArrowLeft } from 'lucide-react';

export const PrivacyPage: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <div className="max-w-3xl mx-auto px-4 py-12 animate-fade-in">
    <button onClick={onBack} className="mb-6 flex items-center text-slate-500 hover:text-indigo-600">
      <ArrowLeft size={16} className="mr-2" /> Back
    </button>
    <h1 className="text-3xl font-bold text-slate-900 mb-6">Privacy Policy</h1>
    <div className="prose prose-slate text-slate-600">
      <p><strong>Effective Date:</strong> {new Date().toLocaleDateString()}</p>
      <p>MarketGap ("we", "our", "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our AI-powered market intelligence platform.</p>
      
      <h3>1. Information We Collect</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li><strong>Account Information:</strong> When you sign up via Google or Email, we collect your email address and name to manage your account and save your reports.</li>
        <li><strong>Usage Data:</strong> We track search queries ("keywords") to generate reports. These are stored in our database associated with your account.</li>
        <li><strong>Payment Information:</strong> Payments are processed securely by Stripe. We do not store your credit card details on our servers.</li>
        <li><strong>Analytics:</strong> We use Google Analytics and Vercel Analytics to understand website traffic and improve user experience.</li>
      </ul>
      
      <h3>2. How We Use Your Information</h3>
      <p>We use your data to:</p>
      <ul className="list-disc pl-5 space-y-1">
        <li>Generate and store market research reports.</li>
        <li>Send transactional emails (e.g., "Report Ready") via our email provider (Resend).</li>
        <li>Improve our AI algorithms and platform functionality.</li>
        <li>Comply with legal obligations.</li>
      </ul>
      
      <h3>3. Data Sharing & Third Parties</h3>
      <p>We do not sell your personal data. We share data only with trusted infrastructure providers:</p>
      <ul className="list-disc pl-5 space-y-1">
        <li><strong>Supabase:</strong> Database and Authentication.</li>
        <li><strong>Stripe:</strong> Payment processing.</li>
        <li><strong>Google/Groq/Tavily:</strong> AI and Search APIs (Only anonymous search keywords are sent; personal data is not shared).</li>
      </ul>

      <h3>4. Data Retention</h3>
      <p>We retain your generated reports and account data indefinitely to provide your history dashboard. You may request account deletion at any time by contacting support.</p>
      
      <h3>5. Contact Us</h3>
      <p>For privacy concerns, please contact: <a href="mailto:support@marketgap.ca" className="text-indigo-600 hover:underline">support@marketgap.ca</a></p>
    </div>
  </div>
);

export const TermsPage: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <div className="max-w-3xl mx-auto px-4 py-12 animate-fade-in">
    <button onClick={onBack} className="mb-6 flex items-center text-slate-500 hover:text-indigo-600">
      <ArrowLeft size={16} className="mr-2" /> Back
    </button>
    <h1 className="text-3xl font-bold text-slate-900 mb-6">Terms of Service</h1>
    <div className="prose prose-slate text-slate-600">
      <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>
      
      <h3>1. Acceptance of Terms</h3>
      <p>By accessing or using MarketGap (the "Service"), you agree to be bound by these Terms. If you do not agree, please do not use the Service.</p>
      
      <h3>2. Nature of Service</h3>
      <p>MarketGap is an AI-powered research tool that aggregates publicly available data to generate market insights. <strong>We provide information, not advice.</strong></p>
      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 my-4">
        <p className="text-amber-900 font-medium text-sm">
          <strong>Disclaimer of Warranties:</strong> The Service is provided "AS IS". MarketGap makes no warranties regarding the accuracy, reliability, or profitability of the market data provided. The AI may generate errors or hallucinations. Users should independently verify all data before making financial decisions.
        </p>
      </div>
      
      <h3>3. Payments & Refunds</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li><strong>Pricing:</strong> Services are billed on a per-report basis or as described at checkout.</li>
        <li><strong>Refund Policy:</strong> Due to the immediate digital delivery of our reports, <strong>all sales are final and non-refundable</strong> once the report generation has initiated. If a technical error prevents report delivery, please contact support for a resolution or refund.</li>
      </ul>
      
      <h3>4. Intellectual Property</h3>
      <p>You retain the rights to the specific insights you generate. MarketGap retains all rights to the platform, code, and underlying technology. You may not scrape, reverse engineer, or resell the Service.</p>
      
      <h3>5. Limitation of Liability</h3>
      <p>To the maximum extent permitted by law, MarketGap shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service. Our total liability is limited to the amount you paid for the Service in the 12 months preceding the claim.</p>
      
      <h3>6. Governing Law</h3>
      <p>These Terms are governed by the laws of Canada. Any disputes shall be resolved in the courts of Canada.</p>

      <h3>7. Contact</h3>
      <p>Questions? Email us at <a href="mailto:support@marketgap.ca" className="text-indigo-600 hover:underline">support@marketgap.ca</a>.</p>
    </div>
  </div>
);

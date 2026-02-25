/**
 * PDF Report Generation Service
 *
 * Generates branded PDF remedy reports using HTML-to-PDF conversion.
 * For MVP, we generate a structured HTML template and convert it.
 * In production, this would use Puppeteer or react-pdf for richer output.
 */

import { queryOne, query } from '../db/connection';

interface ReportData {
  userName: string | null;
  dateOfBirth: string;
  placeOfBirth: string;
  reportId: string;
  generatedDate: string;
  rootDosha: string;
  severity: string;
  impactedAreas: unknown;
  dashaAnalysis: unknown;
  freeRemedies: unknown[];
  fullRemedies: unknown;
}

/**
 * Build the report data from diagnosis and user records.
 */
export async function buildReportData(diagnosisId: string, userId: string): Promise<ReportData> {
  const diagnosis = await queryOne<{
    id: string;
    kundli_id: string;
    root_dosha: string;
    severity: string;
    impacted_areas: unknown;
    dasha_analysis: unknown;
    free_remedies: unknown[];
    full_remedies: unknown;
    result: unknown;
  }>(
    'SELECT * FROM diagnoses WHERE id = $1',
    [diagnosisId],
  );

  if (!diagnosis) {
    throw new Error(`Diagnosis ${diagnosisId} not found`);
  }

  const kundli = await queryOne<{
    date_of_birth: string;
    place_of_birth_name: string;
  }>(
    'SELECT date_of_birth, place_of_birth_name FROM kundlis WHERE id = $1',
    [diagnosis.kundli_id],
  );

  const user = await queryOne<{ name: string | null }>(
    'SELECT name FROM users WHERE id = $1',
    [userId],
  );

  return {
    userName: user?.name || null,
    dateOfBirth: kundli?.date_of_birth || 'N/A',
    placeOfBirth: kundli?.place_of_birth_name || 'N/A',
    reportId: `UP-2026-${diagnosisId.slice(0, 4).toUpperCase()}`,
    generatedDate: new Date().toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    rootDosha: diagnosis.root_dosha || 'Unknown',
    severity: diagnosis.severity || 'Significant',
    impactedAreas: diagnosis.impacted_areas || {},
    dashaAnalysis: diagnosis.dasha_analysis || {},
    freeRemedies: diagnosis.free_remedies || [],
    fullRemedies: diagnosis.full_remedies || {},
  };
}

/**
 * Generate an HTML report that can be rendered or converted to PDF.
 * Returns HTML string suitable for download/print-to-PDF.
 */
export function generateReportHtml(data: ReportData): string {
  const remediesList = Array.isArray(data.freeRemedies)
    ? data.freeRemedies
        .map((r: unknown) => {
          const rec = r as Record<string, unknown>;
          const name = (rec as { name?: string }).name || 'Remedy';
          const desc = (rec as { description?: string }).description || '';
          const freq = (rec as { frequency?: string }).frequency || '';
          const dur = (rec as { duration?: string }).duration || '';
          const mantra = rec.mantraText as { roman?: string; devanagari?: string } | undefined;
          return `
            <div style="border-left:3px solid #10B981;padding:12px 16px;margin-bottom:12px;background:#f9fafb;border-radius:6px;">
              <h4 style="margin:0 0 6px;color:#1F2937;font-size:14px;">${name}</h4>
              ${mantra ? `<p style="color:#4A0E0E;font-style:italic;margin:4px 0;">"${mantra.roman || ''}"</p>
              <p style="color:#4A0E0E;font-size:16px;font-weight:600;margin:4px 0;">${mantra.devanagari || ''}</p>` : ''}
              <p style="color:#4B5563;font-size:13px;margin:4px 0;">${desc}</p>
              <p style="color:#6B7280;font-size:12px;margin:4px 0;">Frequency: ${freq} &middot; Duration: ${dur}</p>
            </div>`;
        })
        .join('\n')
    : '<p>No remedies available</p>';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Upaya Remedy Report — ${data.reportId}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700&family=Noto+Sans+Devanagari:wght@400;600;700&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:'Noto Sans','Noto Sans Devanagari',system-ui,sans-serif;color:#1F2937;background:#fff;font-size:14px;line-height:1.6;}
    .page{max-width:720px;margin:0 auto;padding:32px 24px;}
    .header{text-align:center;padding:24px 0;border-bottom:2px solid #D4A017;margin-bottom:24px;}
    .logo{font-size:24px;font-weight:700;color:#FF8C00;letter-spacing:0.05em;}
    .logo-sub{font-size:11px;color:#6B7280;margin-top:2px;}
    .report-title{font-size:20px;font-weight:700;color:#4A0E0E;margin-top:16px;letter-spacing:0.02em;}
    .meta{font-size:12px;color:#6B7280;margin-top:6px;}
    .meta span{margin:0 8px;}
    .section{margin:24px 0;}
    .section-title{font-size:16px;font-weight:700;color:#1F2937;border-bottom:2px solid #E8C547;padding-bottom:6px;margin-bottom:16px;}
    .dosha-card{border:1px solid #E5E7EB;border-radius:8px;padding:16px;margin-bottom:12px;}
    .dosha-name{font-size:15px;font-weight:600;color:#4A0E0E;}
    .dosha-severity{font-size:12px;color:#6B7280;background:#F3F4F6;padding:2px 8px;border-radius:12px;display:inline-block;margin-left:8px;}
    .dosha-desc{font-size:13px;color:#374151;margin-top:8px;line-height:1.6;}
    .disclaimer{background:#F9FAFB;border:1px solid #E5E7EB;border-radius:8px;padding:16px;margin-top:32px;font-size:11px;color:#6B7280;line-height:1.6;font-style:italic;}
    .footer{text-align:center;margin-top:32px;padding-top:16px;border-top:1px solid #E5E7EB;font-size:11px;color:#9CA3AF;}
    @media print{.page{padding:16px;max-width:100%;}}
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="logo">UPAYA</div>
      <div class="logo-sub">Your Spiritual Problem Solver</div>
      <div class="report-title">COMPLETE REMEDY PLAN</div>
      <div class="meta">
        ${data.userName ? `<span>${data.userName}</span> &middot;` : ''}
        <span>DOB: ${data.dateOfBirth}</span> &middot;
        <span>${data.placeOfBirth}</span>
      </div>
      <div class="meta">
        <span>Report ID: ${data.reportId}</span> &middot;
        <span>Generated: ${data.generatedDate}</span>
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">DOSHA ANALYSIS</h2>
      <div class="dosha-card">
        <span class="dosha-name">${data.rootDosha}</span>
        <span class="dosha-severity">${data.severity}</span>
        <p class="dosha-desc">
          This dosha has been identified in your kundli based on planetary positions at the time of your birth.
          The analysis below provides targeted remedies to address its effects.
        </p>
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">YOUR REMEDIES</h2>
      ${remediesList}
    </div>

    <div class="section">
      <h2 class="section-title">9-WEEK PROTOCOL</h2>
      <div style="border-left:2px solid #D4A017;padding-left:16px;">
        <div style="margin-bottom:16px;">
          <h4 style="color:#1F2937;font-size:14px;margin-bottom:4px;">Week 1-3: Foundation Phase</h4>
          <p style="color:#4B5563;font-size:13px;">Start all free remedies — mantras, fasting, and daily practices. Book recommended puja if applicable.</p>
        </div>
        <div style="margin-bottom:16px;">
          <h4 style="color:#1F2937;font-size:14px;margin-bottom:4px;">Week 4-6: Intensification</h4>
          <p style="color:#4B5563;font-size:13px;">Continue all practices. The cumulative effect of consistent practice begins to build. Complete additional pujas.</p>
        </div>
        <div style="margin-bottom:16px;">
          <h4 style="color:#1F2937;font-size:14px;margin-bottom:4px;">Week 7-9: Consolidation</h4>
          <p style="color:#4B5563;font-size:13px;">Complete all cycles. Review progress. Consider Navagraha puja for overall planetary balance.</p>
        </div>
      </div>
    </div>

    <div class="disclaimer">
      Remedies work by reducing the intensity of negative planetary influences. They are traditional Vedic practices
      performed with faith and discipline. Results vary by individual. This is not a guarantee of specific outcomes.
      For health concerns, always consult a qualified medical professional alongside spiritual guidance.
    </div>

    <div class="footer">
      <p>Generated by Upaya — AI-Powered Vedic Astrology Platform</p>
      <p>https://upaya.app</p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Generate report and update status.
 * For MVP, generates HTML report URL. In production, would use Puppeteer for true PDF.
 */
export async function generateReport(reportId: string, diagnosisId: string, userId: string): Promise<void> {
  try {
    const data = await buildReportData(diagnosisId, userId);
    // Validate that the report HTML can be generated (catches data issues early)
    generateReportHtml(data);

    // For MVP: Mark report as ready. The frontend will render the report directly.
    // In production: Upload PDF to R2/S3, store the URL.
    await query(
      `UPDATE reports SET status = 'ready', pdf_url = $1 WHERE id = $2`,
      [`/api/reports/${reportId}/pdf`, reportId],
    );

    console.log(`[PDF] Report ${reportId} generated successfully`);
  } catch (error) {
    console.error(`[PDF] Failed to generate report ${reportId}:`, error);
    await query(
      `UPDATE reports SET status = 'failed' WHERE id = $1`,
      [reportId],
    );
  }
}

import { useState, useCallback, useRef } from "react";

const NG_FULL = "NavGurukul Foundation for Social Welfare";

const FIXED = {
  working: "Monday to Friday, the first, third, and fifth Saturday are working days. As a young organisation in a growing phase, the work sometimes may extend to days of leave beyond regular office hours. However, we value healthy boundaries and balances and trust you to prioritise with ownership, honesty, and kindness.",
  workingConsult: "Five weekdays and the first & third Saturdays are working days. Other leaves, as usual, apply. However, being a young organisation in a growing phase the work may extend to days of leaves, and beyond regular office hours.",
  notice: "Either party can end the agreement by providing a 30-day notice to the other.",
  termination: "The employer reserves the right to terminate the agreement with one week's notice/immediate termination on the grounds of breach of trust, gross misconduct, non-performance, or project closure unless otherwise negotiated with the employer. If the employee wants to discontinue, they have to serve the notice period as mentioned in the agreement.",
  dispute: "Safety, in all forms, be it emotional, social, or physical, is crucial, and in case of any discomfort or dispute, feel free to discuss it with any team member openly. We believe that alignment of personal values and deriving a sense of meaning at work adds to the joy of working, and we would encourage you to openly share any concerns, disputes, or grievances with our People-and-Culture team or any other senior member you feel comfortable with.",
  disputeConsult: "In the case of any kind of discomfort or dispute, feel free to discuss it with any core team member openly. You can also ask for an independent person to be involved for fairness.",
  data: "All sensitive information and data must be handled as confidential unless expressly permitted otherwise. Safeguarding sensitive data is crucial to maintaining privacy, security, and compliance with relevant regulations or policies.",
  noncompete: "There are no non-compete laws. We trust you to use your knowledge for the right use. We encourage you to share the same with as many organisations as possible toward a cooperative ecosystem. There are no restrictions against hiring current employees on your departure or engaging with the existing partners for your new work – as long as the sensitivity of the data is preserved in line with our commitments to the partners.",
  licensing: "All the work that is going to be done and knowledge that is being generated can be open-sourced or shared by you at any platform, however, any data has to be treated as confidential unless explicitly stated otherwise.",
  closingOffer: "We look forward to your acceptance. Kindly return the duplicate copy of this offer duly signed within three days of receiving the letter. If you have questions, please do not hesitate to reach out to us.",
  closingAgreement: "Please feel free to clarify doubts or queries, if any. Hope you have a wonderful time at NavGurukul.",
};

const DOC_TYPES = [
  { id: "offer", label: "Offer letter" },
  { id: "employment", label: "Employment agreement" },
  { id: "consultant", label: "Consultancy agreement" },
  { id: "appraisal", label: "Appraisal / addendum" },
  { id: "experience", label: "Experience letter" },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function calcSalary(ctcInput, pfM, mode) {
  const pf = parseFloat(pfM) || 1800;
  const ctcA = mode === "monthly" ? (parseFloat(ctcInput) || 0) * 12 : (parseFloat(ctcInput) || 0);
  const ctcM = Math.round(ctcA / 12);
  const grossM = ctcM - pf;
  const basicM = Math.round(grossM * 0.5);
  const hraM = Math.round(grossM * 0.2);
  const specM = grossM - basicM - hraM;
  return { ctcA, ctcM, grossM, basicM, hraM, specM, pfM: pf };
}

const fi = n => n.toLocaleString("en-IN");

// ─── PDF print styles ───────────────────────────────────────────────────────────

const PRINT_CSS = `
  @media print {
    body * { visibility: hidden !important; }
    #pdf-preview, #pdf-preview * { visibility: visible !important; }
    #pdf-preview { position: fixed; inset: 0; background: white; z-index: 9999; overflow: auto; }
  }
`;

// ─── Document renderers (return structured data for both preview and PDF) ──────

function buildOfferDoc(f, sal) {
  const respLines = (f.resp || "").split("\n").filter(Boolean);
  return {
    title: `Offer Letter from ${NG_FULL}`,
    sections: [
      { type: "salutation", text: `Dear ${f.name},` },
      { type: "bold", text: "Greetings from NavGurukul." },
      { type: "para", text: `We are delighted to inform you that, after reviewing your application and conducting subsequent interviews, you have been selected for the role of ${f.role}. We're excited about this journey together! Kindly take a moment to review the comprehensive specifics of the role, as mentioned below.` },
      { type: "field", label: "Position Title", value: f.role },
      { type: "field", label: "Reporting To", value: f.reporting },
      { type: "subheading", text: `Role: As the ${f.role}, your role will involve the following:` },
      { type: "subheading", text: "Roles and Responsibility:" },
      { type: "bullets", items: respLines },
      { type: "field", label: "Compensation", value: `₹${f.ctc} Per Annum. TDS will be deducted, if applicable, as per the law. No other deductions will be made unless processes for insurance or other benefits are set up. The detailed breakup is mentioned below.` },
      { type: "field", label: "Date of Joining", value: f.doj },
      { type: "field", label: "Work Location", value: f.location },
      { type: "field", label: "Working Days and Leaves", value: FIXED.working },
      { type: "field", label: "Review Period", value: `${f.probation} Probation` },
      { type: "field", label: "Notice Period", value: FIXED.notice },
      { type: "field", label: "Termination Clause", value: FIXED.termination },
      { type: "field", label: "Discomfort/Dispute Reporting", value: FIXED.dispute },
      { type: "field", label: "Sensitive Data", value: FIXED.data },
      { type: "field", label: "Non-Compete", value: FIXED.noncompete },
      { type: "para", text: FIXED.closingOffer },
      { type: "signatures", left: { name: f.signname, title: f.signtitle, date: f.signdate }, right: { name: f.name, date: f.signdate } },
      sal ? { type: "annexure", sal, name: f.name, role: f.role } : null,
    ].filter(Boolean),
  };
}

function buildEmploymentDoc(f, sal) {
  const respLines = (f.resp || "").split("\n").filter(Boolean);
  return {
    title: `Employment Agreement between ${NG_FULL} (Employer) and ${f.name} (Employee)`,
    sections: [
      { type: "field", label: "Position Title", value: f.role },
      { type: "field", label: "Reporting To", value: f.reporting },
      { type: "subheading", text: `Role: As a ${f.role}, your role will involve the following responsibilities:` },
      { type: "bullets", items: respLines },
      { type: "field", label: "Compensation", value: `₹${f.ctc} Per Annum. TDS will be deducted, if applicable, as per the law. No other deductions will be made unless processes for insurance or other benefits are set up. The detailed breakup is mentioned below.` },
      { type: "field", label: "Date of Joining", value: f.doj },
      { type: "field", label: "Work Location", value: f.location },
      { type: "field", label: "Working Days and Leaves", value: FIXED.working },
      { type: "field", label: "Probation/Review Period", value: `${f.probation} Probation` },
      { type: "field", label: "Notice Period", value: FIXED.notice },
      { type: "field", label: "Termination Clause", value: FIXED.termination },
      { type: "field", label: "Discomfort/Dispute Reporting", value: FIXED.dispute },
      { type: "field", label: "Sensitive Data", value: FIXED.data },
      { type: "field", label: "Non-Compete", value: FIXED.noncompete },
      { type: "para", text: FIXED.closingAgreement },
      { type: "signatures", left: { name: f.signname, title: f.signtitle, date: f.signdate }, right: { name: f.name, date: f.signdate } },
      sal ? { type: "annexure", sal, name: f.name, role: f.role } : null,
    ].filter(Boolean),
  };
}

function buildConsultantDoc(f) {
  const respLines = (f.resp || "").split("\n").filter(Boolean);
  return {
    title: `Consultancy Agreement between ${NG_FULL} (Employer) and ${f.name} (Consultant)`,
    sections: [
      { type: "field", label: "Position Title", value: f.role },
      { type: "field", label: "Reporting To", value: f.reporting },
      { type: "subheading", text: "Responsibilities include but aren't limited to:" },
      { type: "numbered", items: respLines },
      { type: "field", label: "Starting Date", value: f.startdate },
      { type: "field", label: "Compensation", value: `Rs. ${f.compensation}/month. The TDS deductions are as usual. No other deductions unless insurance, etc., processes are set up.` },
      { type: "field", label: "Work Location", value: f.campus },
      { type: "field", label: "Travel", value: "Please refer to the reimbursement policy." },
      { type: "field", label: "Working Days and Leaves", value: FIXED.workingConsult },
      { type: "field", label: "Notice Period", value: `${f.noticep} on either side.` },
      { type: "field", label: "Discomfort/Dispute Reporting", value: FIXED.disputeConsult },
      { type: "field", label: "Licensing of Work", value: FIXED.licensing },
      { type: "field", label: "Non-Compete", value: FIXED.noncompete },
      { type: "para", text: FIXED.closingAgreement },
      { type: "signatures", left: { name: f.signname, title: f.signtitle, date: f.signdate }, right: { name: f.name, date: f.signdate } },
    ],
  };
}

function buildAppraisalDoc(f, sal) {
  return {
    title: "Employee Addendum",
    org: NG_FULL,
    sections: [
      { type: "salutation", text: `Dear ${f.name},` },
      { type: "para", text: `NavGurukul has and continues to move ahead because of the hard work and dedication of the team members. Congratulations on a successful journey so far, and we're grateful for your contributions.` },
      { type: "para", text: `In recognition of your performance, we are delighted to inform you that your revised compensation will be ${f.newctc} INR per month, inclusive of all taxes (inclusive of employee and employer PF contribution). TDS is to be deducted, if applicable, as per law. No other deductions unless insurance, etc., processes are set up.) w.e.f. ${f.effdate}` },
      { type: "para", text: "All the other terms from the previous agreement remain unchanged." },
      { type: "para", text: "All the very best." },
      { type: "signatures", left: { prefix: "For the Organisation", name: f.signname, title: f.signtitle, date: f.signdate }, right: { name: f.name, title: f.role, date: f.signdate } },
      sal ? { type: "annexure", sal, name: f.name, role: f.role } : null,
    ].filter(Boolean),
  };
}

function buildExperienceDoc(f) {
  const g = (f.gender || "she/her").toLowerCase();
  const pronObj = g.startsWith("he") ? "his" : "her";
  const pronSub = g.startsWith("he") ? "he" : "she";
  const pronSubCap = pronSub.charAt(0).toUpperCase() + pronSub.slice(1);
  return {
    title: `Experience Letter offered to ${f.name}`,
    sections: [
      { type: "para", text: "To whomsoever it may concern," },
      { type: "para", text: `This is to certify that during the period from ${f.fromdate} to ${f.todate}, ${f.name} worked as ${f.role} in ${f.dept} with NavGurukul.` },
      { type: "para", text: `During ${pronObj} tenure, ${pronSub} effectively ${f.resp}` },
      { type: "para", text: `${pronSubCap} dedication to contributing to the overall success of the team was commendable. We wish ${pronObj} all the very best in ${pronObj} future endeavours!` },
      { type: "closing", text: "Sincerely," },
      { type: "signatureSingle", name: f.signname, title: f.signtitle, org: "NavGurukul", date: f.signdate },
    ],
  };
}

// ─── Document Preview Renderer ─────────────────────────────────────────────────

function DocPreview({ doc }) {
  if (!doc) return null;

  const renderSection = (s, i) => {
    switch (s.type) {
      case "salutation":
        return <p key={i} style={{ marginBottom: 16, fontWeight: 600 }}>{s.text}</p>;
      case "bold":
        return <p key={i} style={{ marginBottom: 12, fontWeight: 600 }}>{s.text}</p>;
      case "para":
        return <p key={i} style={{ marginBottom: 12, lineHeight: 1.7 }}>{s.text}</p>;
      case "closing":
        return <p key={i} style={{ marginTop: 24, marginBottom: 8 }}>{s.text}</p>;
      case "subheading":
        return <p key={i} style={{ marginBottom: 8, marginTop: 12, fontWeight: 600 }}>{s.text}</p>;
      case "field":
        return (
          <div key={i} style={{ marginBottom: 14 }}>
            <span style={{ fontWeight: 700 }}>{s.label}:</span>{" "}
            <span style={{ lineHeight: 1.7 }}>{s.value}</span>
          </div>
        );
      case "bullets":
        return (
          <ul key={i} style={{ marginLeft: 20, marginBottom: 12, lineHeight: 1.7 }}>
            {s.items.map((item, j) => <li key={j} style={{ marginBottom: 6 }}>{item}</li>)}
          </ul>
        );
      case "numbered":
        return (
          <ol key={i} style={{ marginLeft: 20, marginBottom: 12, lineHeight: 1.7 }}>
            {s.items.map((item, j) => <li key={j} style={{ marginBottom: 6 }}>{item}</li>)}
          </ol>
        );
      case "signatures":
        return (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, marginTop: 36, marginBottom: 16 }}>
            {[s.left, s.right].map((sig, j) => sig ? (
              <div key={j}>
                {sig.prefix && <p style={{ marginBottom: 4, fontWeight: 600 }}>{sig.prefix}</p>}
                <div style={{ height: 48, borderBottom: "1px solid #ccc", marginBottom: 8 }} />
                <p style={{ fontWeight: 600, marginBottom: 2 }}>{sig.name}</p>
                {sig.title && <p style={{ marginBottom: 2, fontSize: 13 }}>{sig.title}</p>}
                {sig.date && <p style={{ fontSize: 13, color: "#555" }}>Date: {sig.date}</p>}
              </div>
            ) : <div key={j} />)}
          </div>
        );
      case "signatureSingle":
        return (
          <div key={i} style={{ marginTop: 24 }}>
            <div style={{ height: 48, borderBottom: "1px solid #ccc", width: 160, marginBottom: 8 }} />
            <p style={{ fontWeight: 600, marginBottom: 2 }}>{s.name}</p>
            <p style={{ marginBottom: 2, fontSize: 13 }}>{s.title}</p>
            {s.org && <p style={{ fontSize: 13 }}>{s.org}</p>}
            <p style={{ fontSize: 13, color: "#555" }}>{s.date}</p>
          </div>
        );
      case "annexure":
        const { sal, name, role } = s;
        return (
          <div key={i} style={{ marginTop: 32, pageBreakBefore: "always" }}>
            <p style={{ textAlign: "center", fontWeight: 700, marginBottom: 20, fontSize: 14 }}>Annexure A</p>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontWeight: 600 }}>{name}</span>
              <span style={{ fontWeight: 600 }}>{role}</span>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #333" }}>
                  <th style={{ textAlign: "left", padding: "8px 0", fontWeight: 700 }}>Description</th>
                  <th style={{ textAlign: "right", padding: "8px 0", fontWeight: 700 }}>Monthly (Rs. Per Month)</th>
                  <th style={{ textAlign: "right", padding: "8px 0", fontWeight: 700 }}>Annual (In Rs.)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Basic Pay", sal.basicM, sal.basicM * 12],
                  ["House Rent Allowance", sal.hraM, sal.hraM * 12],
                  ["Special Allowance", sal.specM, sal.specM * 12],
                  ["Gross (Incl of Employee PF)", sal.grossM, sal.grossM * 12, true],
                  ["Employer's Contribution to PF", sal.pfM, sal.pfM * 12],
                  ["CTC (in Rs.)", sal.ctcM, sal.ctcA, true],
                ].map(([label, mo, ann, bold], j) => (
                  <tr key={j} style={{ borderBottom: "1px solid #ddd" }}>
                    <td style={{ padding: "7px 0", fontWeight: bold ? 700 : 400 }}>{label}</td>
                    <td style={{ padding: "7px 0", textAlign: "right", fontWeight: bold ? 700 : 400 }}>{fi(mo)}</td>
                    <td style={{ padding: "7px 0", textAlign: "right", fontWeight: bold ? 700 : 400 }}>{fi(ann)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div style={{ fontFamily: "Georgia, serif", fontSize: 14, color: "#111", lineHeight: 1.6, padding: "0 4px" }}>
      {doc.org && <p style={{ textAlign: "center", fontWeight: 700, marginBottom: 4, fontSize: 14 }}>{doc.org}</p>}
      <h2 style={{ textAlign: "center", fontWeight: 700, fontSize: 15, marginBottom: 28, lineHeight: 1.4 }}>{doc.title}</h2>
      {doc.sections.map(renderSection)}
      <div style={{ marginTop: 36, paddingTop: 12, borderTop: "1px solid #e0e0e0", display: "flex", justifyContent: "space-between", fontSize: 11, color: "#888" }}>
        <span>www.navgurukul.org</span>
        <span>hi@navgurukul.org</span>
      </div>
    </div>
  );
}

// ─── Form components ───────────────────────────────────────────────────────────

const inputStyle = {
  width: "100%", padding: "8px 11px", border: "1px solid #ddd",
  borderRadius: 7, fontSize: 13.5, fontFamily: "inherit",
  background: "#fff", color: "#111", outline: "none",
};

function Field({ label, value, onChange, placeholder, type = "text", rows, hint }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 11.5, fontWeight: 600, color: "#666", letterSpacing: "0.03em", textTransform: "uppercase" }}>{label}</label>
      {type === "textarea"
        ? <textarea style={{ ...inputStyle, minHeight: rows ? rows * 22 + 16 : 80, resize: "vertical" }} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
        : <input style={inputStyle} type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />}
      {hint && <span style={{ fontSize: 11, color: "#aaa" }}>{hint}</span>}
    </div>
  );
}

function SalaryBlock({ ctcInput, pfPerMonth, onCtcChange, onPfChange, mode = "annual" }) {
  const sal = calcSalary(ctcInput, pfPerMonth, mode);
  const hasSal = parseFloat(ctcInput) > 0;
  const row = (label, mo, ann, bold) => (
    <tr key={label}>
      <td style={{ padding: "6px 8px", fontSize: 12.5, fontWeight: bold ? 700 : 400, borderBottom: "1px solid #eee" }}>{label}</td>
      <td style={{ padding: "6px 8px", fontSize: 12.5, textAlign: "right", fontWeight: bold ? 700 : 400, borderBottom: "1px solid #eee" }}>₹{fi(mo)}</td>
      <td style={{ padding: "6px 8px", fontSize: 12.5, textAlign: "right", fontWeight: bold ? 700 : 400, borderBottom: "1px solid #eee" }}>₹{fi(ann)}</td>
    </tr>
  );
  return (
    <div style={{ background: "#f9f8f6", border: "1px solid #e5e2db", borderRadius: 9, overflow: "hidden" }}>
      <div style={{ padding: "12px 14px", borderBottom: "1px solid #e5e2db", display: "flex", gap: 12, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 160 }}>
          <Field label={mode === "monthly" ? "CTC per month (₹)" : "CTC per annum (₹)"} value={ctcInput} onChange={onCtcChange} placeholder={mode === "monthly" ? "82500" : "650000"} type="number" />
        </div>
        <div style={{ width: 180 }}>
          <Field label="Employer PF / month (₹)" value={pfPerMonth} onChange={onPfChange} placeholder="1800" type="number" />
        </div>
      </div>
      {hasSal && (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f0ede6" }}>
              <th style={{ padding: "6px 8px", fontSize: 11.5, fontWeight: 700, textAlign: "left", color: "#555" }}>Description</th>
              <th style={{ padding: "6px 8px", fontSize: 11.5, fontWeight: 700, textAlign: "right", color: "#555" }}>Monthly</th>
              <th style={{ padding: "6px 8px", fontSize: 11.5, fontWeight: 700, textAlign: "right", color: "#555" }}>Annual</th>
            </tr>
          </thead>
          <tbody>
            {row("Basic Pay", sal.basicM, sal.basicM * 12)}
            {row("House Rent Allowance", sal.hraM, sal.hraM * 12)}
            {row("Special Allowance", sal.specM, sal.specM * 12)}
            {row("Gross (incl. Employee PF)", sal.grossM, sal.grossM * 12, true)}
            {row("Employer's Contribution to PF", sal.pfM, sal.pfM * 12)}
            {row("CTC", sal.ctcM, sal.ctcA, true)}
          </tbody>
        </table>
      )}
    </div>
  );
}

function JDUploader({ onRnRGenerated, role, loading, setLoading }) {
  const [mode, setMode] = useState("auto");
  const [jdText, setJdText] = useState("");

  const readFile = (file) => {
    const reader = new FileReader();
    reader.onload = e => setJdText(e.target.result);
    reader.readAsText(file);
  };
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) readFile(file);
  }, []);

  const generate = async () => {
    setLoading(true);
    const source = mode === "auto" ? null : jdText;
    const prompt = source
      ? `Extract clean, concise responsibilities from this job description for a ${role || "role"} at NavGurukul (an NGO empowering underserved youth through tech education in India). Return ONLY a numbered list, one responsibility per line, no extra commentary or headers.\n\nJD:\n${source}`
      : `Generate a realistic numbered list of 6-8 key responsibilities for a "${role}" at NavGurukul Foundation for Social Welfare — an NGO running residential tech education for underserved youth in India. Write in NavGurukul's warm, values-driven tone. Return ONLY the numbered list, one item per line, no headers or commentary.`;
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 600, messages: [{ role: "user", content: prompt }] }),
      });
      const data = await res.json();
      const text = data.content?.find(b => b.type === "text")?.text || "";
      onRnRGenerated(text.trim());
    } catch { onRnRGenerated("Could not generate. Please try again."); }
    setLoading(false);
  };

  const tabBtn = (id, label) => (
    <button onClick={() => setMode(id)} style={{
      padding: "5px 13px", fontSize: 12, fontWeight: 500, borderRadius: 6, cursor: "pointer",
      border: "1px solid " + (mode === id ? "#E05A2B" : "#ddd"),
      background: mode === id ? "#fdf1ec" : "#fff",
      color: mode === id ? "#E05A2B" : "#555",
    }}>{label}</button>
  );

  return (
    <div style={{ border: "1px solid #e5e2db", borderRadius: 9, overflow: "hidden", marginBottom: 10 }}>
      <div style={{ padding: "10px 14px", background: "#f9f8f6", borderBottom: "1px solid #e5e2db", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: 11.5, fontWeight: 700, color: "#666", textTransform: "uppercase", letterSpacing: "0.04em", marginRight: 4 }}>R&R source:</span>
        {tabBtn("auto", "Auto-generate")}
        {tabBtn("upload", "Upload JD")}
        {tabBtn("paste", "Paste JD")}
      </div>
      <div style={{ padding: 14 }}>
        {mode === "auto" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <p style={{ fontSize: 13, color: "#666" }}>AI will write responsibilities based on the role title you entered above.</p>
            <button onClick={generate} disabled={loading || !role} style={{
              alignSelf: "flex-start", padding: "8px 16px", background: "#E05A2B", color: "#fff",
              border: "none", borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: loading || !role ? "not-allowed" : "pointer",
              opacity: !role ? 0.5 : 1,
            }}>{loading ? "Generating…" : `Generate R&R for "${role || "role"}"`}</button>
            {!role && <span style={{ fontSize: 11, color: "#aaa" }}>Enter the role title in the form above first.</span>}
          </div>
        )}
        {mode === "upload" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div onDrop={handleDrop} onDragOver={e => e.preventDefault()}
              style={{ border: "2px dashed #ddd", borderRadius: 8, padding: 20, textAlign: "center", cursor: "pointer", background: "#faf9f7" }}
              onClick={() => document.getElementById("jd-file-in").click()}>
              <input id="jd-file-in" type="file" accept=".txt" style={{ display: "none" }} onChange={e => { if (e.target.files[0]) readFile(e.target.files[0]); }} />
              <p style={{ fontSize: 13, color: "#777" }}>Drop .txt file here or click to browse</p>
              {jdText && <p style={{ fontSize: 12, color: "#1a7a4a", marginTop: 6 }}>✓ File loaded ({jdText.length} chars)</p>}
            </div>
            <button onClick={generate} disabled={loading || !jdText.trim()} style={{
              alignSelf: "flex-start", padding: "8px 16px", background: "#E05A2B", color: "#fff",
              border: "none", borderRadius: 7, fontSize: 13, fontWeight: 600,
              cursor: loading || !jdText.trim() ? "not-allowed" : "pointer", opacity: !jdText.trim() ? 0.5 : 1,
            }}>{loading ? "Extracting…" : "Extract R&R from JD"}</button>
          </div>
        )}
        {mode === "paste" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Field label="Paste JD text" value={jdText} onChange={setJdText} placeholder="Paste the full job description here…" type="textarea" rows={5} />
            <button onClick={generate} disabled={loading || !jdText.trim()} style={{
              alignSelf: "flex-start", padding: "8px 16px", background: "#E05A2B", color: "#fff",
              border: "none", borderRadius: 7, fontSize: 13, fontWeight: 600,
              cursor: loading || !jdText.trim() ? "not-allowed" : "pointer", opacity: !jdText.trim() ? 0.5 : 1,
            }}>{loading ? "Extracting…" : "Extract R&R from JD"}</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main App ──────────────────────────────────────────────────────────────────

const EMPTY = {
  name: "", role: "", reporting: "", doj: "", location: "", probation: "3 months",
  noticep: "30 days", ctc: "", pf: "1800", resp: "",
  startdate: "", compensation: "", campus: "",
  newctc: "", effdate: "", fromdate: "", todate: "", dept: "", gender: "she/her",
  signname: "Nidhi Anarkat", signtitle: "Co-Founder & CEO", signdate: "",
};

export default function App() {
  const [docType, setDocType] = useState("offer");
  const [fields, setFields] = useState(EMPTY);
  const [doc, setDoc] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [rnrLoading, setRnrLoading] = useState(false);
  const pdfRef = useRef(null);

  const set = (k, v) => setFields(f => ({ ...f, [k]: v }));
  const f = k => fields[k] || "";

  const getSal = (mode) => {
    const ctcInput = mode === "monthly" ? f("newctc") : f("ctc");
    if (!parseFloat(ctcInput)) return null;
    return calcSalary(ctcInput, f("pf"), mode);
  };

  const buildPrompt = () => {
    const respLines = (f("resp") || "").split("\n").filter(Boolean);
    const bulleted = respLines.map(r => `● ${r}`).join("\n");
    const numbered = respLines.map((r, i) => `${i + 1}. ${r}`).join("\n");
    if (docType === "offer" || docType === "employment") {
      return `Clean up and lightly polish the following responsibilities for a ${f("role")} at ${NG_FULL}. Keep the meaning, fix grammar/formatting only. Return ONLY a numbered list, one item per line.\n\n${f("resp")}`;
    }
    return null;
  };

  const generateDoc = () => {
    const sal = getSal("annual");
    const salM = getSal("monthly");
    if (docType === "offer") setDoc(buildOfferDoc(fields, sal));
    else if (docType === "employment") setDoc(buildEmploymentDoc(fields, sal));
    else if (docType === "consultant") setDoc(buildConsultantDoc(fields));
    else if (docType === "appraisal") setDoc(buildAppraisalDoc(fields, salM));
    else if (docType === "experience") setDoc(buildExperienceDoc(fields));
  };

  const downloadPDF = () => {
    const printWin = window.open("", "_blank", "width=900,height=700");
    if (!printWin) { alert("Please allow popups for PDF download."); return; }
    const content = pdfRef.current?.innerHTML || "";
    printWin.document.write(`<!DOCTYPE html><html><head><title>NavGurukul Document</title><style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: Georgia, serif; font-size: 13.5pt; color: #111; padding: 50px 60px; max-width: 780px; margin: 0 auto; line-height: 1.7; }
      h2 { font-size: 14pt; font-weight: 700; text-align: center; margin-bottom: 28px; line-height: 1.4; }
      p { margin-bottom: 12px; }
      ul, ol { margin-left: 22px; margin-bottom: 12px; }
      li { margin-bottom: 5px; }
      table { width: 100%; border-collapse: collapse; margin-top: 8px; }
      td, th { padding: 6px 8px; }
      .sig-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 36px; }
      .sig-line { height: 44px; border-bottom: 1px solid #bbb; margin-bottom: 8px; }
      .footer { margin-top: 36px; padding-top: 10px; border-top: 1px solid #ddd; display: flex; justify-content: space-between; font-size: 9pt; color: #aaa; }
      @media print { body { padding: 0; } @page { margin: 2cm 2.5cm; } }
    </style></head><body>${content}</body></html>`);
    printWin.document.close();
    setTimeout(() => { printWin.focus(); printWin.print(); }, 400);
  };

  const g2 = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 };
  const g1 = { display: "grid", gridTemplateColumns: "1fr", gap: 14 };
  const sLabel = (t) => <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#aaa", marginTop: 20, marginBottom: 10 }}>{t}</div>;

  const renderForm = () => {
    const commonSig = (
      <>
        {sLabel("Signatory")}
        <div style={g2}>
          <Field label="Signatory name" value={f("signname")} onChange={v => set("signname", v)} placeholder="Nidhi Anarkat" />
          <Field label="Signatory title" value={f("signtitle")} onChange={v => set("signtitle", v)} placeholder="Co-Founder & CEO" />
        </div>
        <div style={{ ...g1, marginTop: 14 }}>
          <Field label="Document date" value={f("signdate")} onChange={v => set("signdate", v)} placeholder="29th March 2025" />
        </div>
      </>
    );
    const rnrBlock = (
      <>
        {sLabel("Roles & responsibilities")}
        <JDUploader role={f("role")} onRnRGenerated={v => set("resp", v)} loading={rnrLoading} setLoading={setRnrLoading} />
        <Field label="Edit responsibilities (one per line)" value={f("resp")} onChange={v => set("resp", v)} type="textarea" rows={7} placeholder="Responsibilities will appear here — edit freely before generating." />
      </>
    );

    if (docType === "offer") return (
      <>
        {sLabel("Candidate details")}
        <div style={g2}>
          <Field label="Full name" value={f("name")} onChange={v => set("name", v)} placeholder="Aayushi Bhansali" />
          <Field label="Position title" value={f("role")} onChange={v => set("role", v)} placeholder="People and Culture Specialist" />
        </div>
        <div style={{ ...g1, marginTop: 14 }}>
          <Field label="Reporting to" value={f("reporting")} onChange={v => set("reporting", v)} placeholder="Senior Associate, People & Culture / as assigned by NG" />
        </div>
        <div style={{ ...g2, marginTop: 14 }}>
          <Field label="Date of joining" value={f("doj")} onChange={v => set("doj", v)} placeholder="1st April 2025" />
          <Field label="Work location" value={f("location")} onChange={v => set("location", v)} placeholder="Remote / Pune Campus" />
        </div>
        <div style={{ ...g2, marginTop: 14 }}>
          <Field label="Probation period" value={f("probation")} onChange={v => set("probation", v)} placeholder="3 months" />
        </div>
        {rnrBlock}
        {sLabel("Compensation — Annexure A")}
        <SalaryBlock ctcInput={f("ctc")} pfPerMonth={f("pf")} onCtcChange={v => set("ctc", v)} onPfChange={v => set("pf", v)} mode="annual" />
        {commonSig}
      </>
    );

    if (docType === "employment") return (
      <>
        {sLabel("Employee details")}
        <div style={g2}>
          <Field label="Full name" value={f("name")} onChange={v => set("name", v)} placeholder="Aayushi Bhansali" />
          <Field label="Position title" value={f("role")} onChange={v => set("role", v)} placeholder="People and Culture Specialist" />
        </div>
        <div style={{ ...g1, marginTop: 14 }}>
          <Field label="Reporting to" value={f("reporting")} onChange={v => set("reporting", v)} placeholder="Senior Associate, People & Culture / as assigned by NG" />
        </div>
        <div style={{ ...g2, marginTop: 14 }}>
          <Field label="Date of joining" value={f("doj")} onChange={v => set("doj", v)} placeholder="1st April 2025" />
          <Field label="Work location" value={f("location")} onChange={v => set("location", v)} placeholder="Remote" />
        </div>
        <div style={{ ...g2, marginTop: 14 }}>
          <Field label="Probation period" value={f("probation")} onChange={v => set("probation", v)} placeholder="3 months" />
        </div>
        {rnrBlock}
        {sLabel("Compensation — Annexure A")}
        <SalaryBlock ctcInput={f("ctc")} pfPerMonth={f("pf")} onCtcChange={v => set("ctc", v)} onPfChange={v => set("pf", v)} mode="annual" />
        {commonSig}
      </>
    );

    if (docType === "consultant") return (
      <>
        {sLabel("Consultant details")}
        <div style={g2}>
          <Field label="Full name" value={f("name")} onChange={v => set("name", v)} placeholder="Aarzoo Jolly" />
          <Field label="Position title" value={f("role")} onChange={v => set("role", v)} placeholder="Program Manager" />
        </div>
        <div style={{ ...g2, marginTop: 14 }}>
          <Field label="Reporting to" value={f("reporting")} onChange={v => set("reporting", v)} placeholder="Aditya Minocha" />
          <Field label="Work location / campus" value={f("campus")} onChange={v => set("campus", v)} placeholder="Amravati Campus" />
        </div>
        <div style={{ ...g2, marginTop: 14 }}>
          <Field label="Starting date" value={f("startdate")} onChange={v => set("startdate", v)} placeholder="14th October 2022" />
          <Field label="Monthly compensation (₹)" value={f("compensation")} onChange={v => set("compensation", v)} placeholder="44,000" />
        </div>
        <div style={{ ...g2, marginTop: 14 }}>
          <Field label="Notice period" value={f("noticep")} onChange={v => set("noticep", v)} placeholder="30 days" />
        </div>
        {rnrBlock}
        {commonSig}
      </>
    );

    if (docType === "appraisal") return (
      <>
        {sLabel("Employee details")}
        <div style={g2}>
          <Field label="Full name" value={f("name")} onChange={v => set("name", v)} placeholder="Aarzoo Jolly" />
          <Field label="Designation" value={f("role")} onChange={v => set("role", v)} placeholder="Co-founder SOSC" />
        </div>
        <div style={{ ...g2, marginTop: 14 }}>
          <Field label="Revised CTC effective from" value={f("effdate")} onChange={v => set("effdate", v)} placeholder="1st July 2025" />
        </div>
        {sLabel("Revised compensation — Annexure A")}
        <SalaryBlock ctcInput={f("newctc")} pfPerMonth={f("pf")} onCtcChange={v => set("newctc", v)} onPfChange={v => set("pf", v)} mode="monthly" />
        {commonSig}
      </>
    );

    if (docType === "experience") return (
      <>
        {sLabel("Employee details")}
        <div style={g2}>
          <Field label="Full name" value={f("name")} onChange={v => set("name", v)} placeholder="Anjali Vishwakarma" />
          <Field label="Designation" value={f("role")} onChange={v => set("role", v)} placeholder="Program Associate" />
        </div>
        <div style={{ ...g2, marginTop: 14 }}>
          <Field label="Department" value={f("dept")} onChange={v => set("dept", v)} placeholder="Residential Programs" />
          <Field label="Pronoun" value={f("gender")} onChange={v => set("gender", v)} placeholder="she/her" hint="Fills 'her tenure', 'she effectively', etc." />
        </div>
        <div style={{ ...g2, marginTop: 14 }}>
          <Field label="Tenure from" value={f("fromdate")} onChange={v => set("fromdate", v)} placeholder="8th January 2021" />
          <Field label="Tenure to" value={f("todate")} onChange={v => set("todate", v)} placeholder="January 2024" />
        </div>
        {sLabel("Contributions during tenure")}
        <Field label="Describe what they did (completes '…she effectively ___')" value={f("resp")} onChange={v => set("resp", v)} type="textarea" rows={4} placeholder="managed student onboarding and academic coordination, supported faculty in curriculum delivery…" />
        {sLabel("Signatory")}
        <div style={g2}>
          <Field label="Signatory name" value={f("signname")} onChange={v => set("signname", v)} placeholder="Aarzoo" />
          <Field label="Signatory title" value={f("signtitle")} onChange={v => set("signtitle", v)} placeholder="Manager – People and Culture" />
        </div>
        <div style={{ ...g1, marginTop: 14 }}>
          <Field label="Letter date" value={f("signdate")} onChange={v => set("signdate", v)} placeholder="20th May 2026" />
        </div>
      </>
    );
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f5f3ef", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap'); @keyframes spin { to { transform: rotate(360deg); } } ${PRINT_CSS}`}</style>

      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e8e4de", padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 1 }}>
          <span style={{ fontFamily: "Georgia, serif", fontSize: 22, color: "#E05A2B", fontWeight: 700 }}>nav</span>
          <span style={{ fontFamily: "Georgia, serif", fontSize: 22, color: "#111", fontWeight: 700 }}>gurukul</span>
        </div>
        <span style={{ fontSize: 12, color: "#aaa" }}>HR document generator</span>
      </div>

      <div style={{ maxWidth: 820, margin: "0 auto", padding: "24px 20px 60px" }}>
        {/* Doc type tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 24, flexWrap: "wrap" }}>
          {DOC_TYPES.map(d => (
            <button key={d.id} onClick={() => { setDocType(d.id); setDoc(null); setFields(EMPTY); }}
              style={{
                padding: "8px 16px", fontSize: 13, fontWeight: 500, borderRadius: 8, cursor: "pointer",
                border: "1px solid " + (docType === d.id ? "#E05A2B" : "#ddd"),
                background: docType === d.id ? "#E05A2B" : "#fff",
                color: docType === d.id ? "#fff" : "#444",
                transition: "all .15s",
              }}>{d.label}</button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: doc ? "1fr 1fr" : "1fr", gap: 20 }}>
          {/* Form panel */}
          <div style={{ background: "#fff", border: "1px solid #e8e4de", borderRadius: 12, padding: "22px 22px 26px" }}>
            {renderForm()}
            <button onClick={generateDoc} disabled={generating} style={{
              marginTop: 24, width: "100%", padding: 13,
              background: generating ? "#ccc" : "#E05A2B", color: "#fff",
              border: "none", borderRadius: 9, fontSize: 14, fontWeight: 600,
              cursor: generating ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
              {generating
                ? <><span style={{ width: 15, height: 15, border: "2px solid rgba(255,255,255,.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin .7s linear infinite", display: "inline-block" }} /> Generating…</>
                : "✦  Generate document"}
            </button>
          </div>

          {/* Preview panel */}
          {doc && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#aaa" }}>Preview</span>
                <button onClick={downloadPDF} style={{
                  padding: "7px 16px", fontSize: 12.5, fontWeight: 600,
                  background: "#111", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 6,
                }}>⬇ Download PDF</button>
              </div>
              <div style={{ background: "#fff", border: "1px solid #e8e4de", borderRadius: 12, padding: "28px 28px 24px", maxHeight: "80vh", overflowY: "auto" }}>
                <div ref={pdfRef}>
                  <DocPreview doc={doc} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hidden PDF target */}
      <div id="pdf-preview" style={{ display: "none" }}>
        <div ref={pdfRef}><DocPreview doc={doc} /></div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaFileUpload,
  FaSignOutAlt,
  FaChartBar,
  FaExclamationTriangle,
  FaBalanceScale,
  FaNewspaper,
  FaKey,
  FaLightbulb,
  FaBullhorn,
  FaCompress,
} from "react-icons/fa";

import ChatPanel from "../components/ChatPanel";
import RiskChart from "../components/RiskChart";
import logo from "../assets/logo.png";
import "./Home.css";

export default function Home() {
  const [file, setFile] = useState(null);
  const [docId, setDocId] = useState(null);
  const [results, setResults] = useState({});
  const [activeTab, setActiveTab] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [history, setHistory] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [loadingTab, setLoadingTab] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const endpoints = [
    { key: "summary", label: "Summary", icon: FaChartBar },
    { key: "simple", label: "Simple", icon: FaLightbulb },
    { key: "headline", label: "Headline", icon: FaNewspaper },
    { key: "keywords", label: "Keywords", icon: FaKey },
    { key: "impact", label: "Impact", icon: FaBullhorn },
    { key: "pros-cons", label: "Pros/Cons", icon: FaBalanceScale },
    { key: "risk", label: "Risk", icon: FaExclamationTriangle },
    { key: "compress", label: "Compress", icon: FaCompress },
  ];

  useEffect(() => {
    const saved = localStorage.getItem("history");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("history", JSON.stringify(history));
  }, [history]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/AuthPage");
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setDocId(null);
    setResults({});
    setActiveTab(null);
  };

  const upload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const data = await res.json();
      console.log("UPLOAD:", data);

      setDocId(data.document_id);
      setSelectedDoc(data.document_id);

      setHistory((prev) => [
        {
          id: data.document_id,
          name: file.name,
          results: {},
          time: new Date().toLocaleString(),
        },
        ...prev.slice(0, 9),
      ]);

      setFile(null);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const normalizeData = (responseData, endpoint) => {
    if (!responseData) return null;

    const safeArray = (arr) => Array.isArray(arr) ? arr : [];
    const safeString = (val) => {
      if (val === null || val === undefined) return "";
      return typeof val === 'string' ? val : JSON.stringify(val, null, 2);
    };

    try {
      switch (endpoint) {
        case "summary":
          const summaryObj = responseData.summary || responseData;
          if (typeof summaryObj === 'object' && summaryObj.summary) {
            return safeString(summaryObj.summary);
          }
          return safeString(summaryObj) || "No summary available";

        case "simple":
          const simpleObj = responseData.simple_explanation || responseData;
          if (typeof simpleObj === 'object' && simpleObj.simple_explanation) {
            return safeString(simpleObj.simple_explanation);
          }
          return safeString(simpleObj) || "No explanation available";

        case "headline":
          const headlineObj = responseData.headline || responseData;
          if (typeof headlineObj === 'object' && headlineObj.headline) {
            return safeString(headlineObj.headline);
          }
          return safeString(headlineObj) || "No headline available";

        case "keywords":
          let keywordsData = responseData.keywords || responseData;
          
          if (typeof keywordsData === 'string') {
            try {
              const parsed = JSON.parse(keywordsData);
              if (parsed.keywords && Array.isArray(parsed.keywords)) {
                return [...new Set(parsed.keywords)];
              } else if (Array.isArray(parsed)) {
                return [...new Set(parsed)];
              }
            } catch (e) {
              console.warn("Could not parse keywords string:", e);
              return [];
            }
          }
          
          if (Array.isArray(keywordsData)) return [...new Set(keywordsData)];
          return [];

        case "impact":
          const impactData = responseData.impact || responseData;
          if (typeof impactData === 'object' && impactData !== null) {
            return {
              citizens: safeString(impactData.citizens || ""),
              businesses: safeString(impactData.businesses || ""),
              government: safeString(impactData.government || ""),
              rights: safeString(impactData.rights || ""),
              responsibilities: safeString(impactData.responsibilities || "")
            };
          }
          return {
            citizens: "",
            businesses: "",
            government: "",
            rights: "",
            responsibilities: ""
          };

        case "pros-cons":
          return {
            pros: safeArray(responseData.pros || []),
            cons: safeArray(responseData.cons || [])
          };

        case "risk":
          let riskData = responseData.risk || responseData;
          console.log("Raw risk data:", riskData, typeof riskData);
          
          if (Array.isArray(riskData)) {
            const processedRisks = riskData
              .filter(item => item && typeof item === 'object')
              .map((item, index) => ({
                risk_score: item.risk_score || item.score || 0,
                reason: item.reason || item.description || `Risk ${index + 1}`,
              }));
            console.log("Processed array risks:", processedRisks);
            return processedRisks;
          }
          
          if (typeof riskData === 'string') {
            const jsonBlocks = [];
            const jsonRegex = /```json\n([\s\S]*?)\n```/g;
            let match;
            
            while ((match = jsonRegex.exec(riskData)) !== null) {
              try {
                const parsed = JSON.parse(match[1]);
                if (parsed.risk_score !== undefined || parsed.score !== undefined) {
                  jsonBlocks.push({
                    risk_score: parsed.risk_score || parsed.score || 0,
                    reason: parsed.reason || `Risk Block ${jsonBlocks.length + 1}`,
                  });
                }
              } catch (e) {
                console.warn("Could not parse risk JSON block:", e);
              }
            }
            
            console.log("Parsed string risks:", jsonBlocks);
            return jsonBlocks.length > 0 ? jsonBlocks : [];
          }

          if (typeof riskData === 'number') {
            return [{
              risk_score: riskData,
              reason: "Overall Risk Score"
            }];
          }

          console.log("No risk data matched any format");
          return [];

        case "compress":
          return {
            original_tokens: responseData.original_tokens || 0,
            compressed_tokens: responseData.compressed_tokens || 0,
            saved_tokens: responseData.saved_tokens || 0,
            compression_ratio: responseData.compression_ratio || 0,
            compressed_text: safeString(responseData.compressed_text || "")
          };

        default:
          return responseData;
      }
    } catch (error) {
      console.error(`Normalization error for ${endpoint}:`, error);
      return null;
    }
  };

  const cleanText = (text) => {
    if (!text) return "";
    return String(text)
      .replace(/\*\*/g, "")
      .replace(/##/g, "")
      .replace(/---/g, "")
      .replace(/```/g, "")
      .replace(/`/g, "")
      .trim();
  };

  const parseTextWithSections = (text) => {
    if (!text) return null;
    
    const cleanedText = cleanText(text);
    const sections = cleanedText.split("\n").filter(line => line.trim());
    
    return sections.map((section, idx) => (
      <div key={idx} className="text-section">
        {section}
      </div>
    ));
  };

  const callAPI = async (endpointKey) => {
    try {
      let url;
      if (endpointKey === "compress") {
        url = "http://localhost:8000/api/compression/compress";
      } else {
        url = `http://localhost:8000/api/analysis/${endpointKey}`;
      }

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ document_id: docId }),
      });

      if (!res.ok) {
        throw new Error(`API ${endpointKey} failed: ${res.status}`);
      }

      const response = await res.json();
      console.log(`API ${endpointKey} RAW:`, response);
      console.log(`API ${endpointKey} DATA:`, response?.data);

      const normalizedData = normalizeData(response?.data || response, endpointKey);
      console.log(`NORMALIZED ${endpointKey}:`, normalizedData);

      setResults((prev) => ({
        ...prev,
        [endpointKey]: normalizedData,
      }));
    } catch (err) {
      console.error(endpointKey, err);
      setResults((prev) => ({
        ...prev,
        [endpointKey]: { error: `Failed: ${err.message}` },
      }));
    }
  };

  const runAnalysis = async () => {
    setAnalyzing(true);
    setResults({});
    
    await Promise.all(
      endpoints.map(({ key }) => callAPI(key))
    );
    
    setAnalyzing(false);
    setActiveTab("summary");
  };

  const loadTabData = async (tabKey) => {
    if (results[tabKey] !== undefined) {
      setActiveTab(tabKey);
      return;
    }

    setLoadingTab(tabKey);
    setActiveTab(tabKey);

    try {
      await callAPI(tabKey);
    } finally {
      setLoadingTab(null);
    }
  };

  const renderContent = (key, value) => {
    try {
      if (loadingTab === key) {
        return <div className="loading">⏳ Loading {key}...</div>;
      }

      if (value?.error) {
        return <div className="error-message">❌ {String(value.error)}</div>;
      }

      if (value === null || value === undefined || value === "") {
        return <div className="loading">⏳ Click "Run Full Analysis" or wait for data...</div>;
      }

      if (typeof value === 'string' || typeof value === 'number') {
        const cleanedValue = cleanText(value);
        return (
          <div className="content-text">
            {parseTextWithSections(cleanedValue)}
          </div>
        );
      }

      if (typeof value === 'object' && value !== null) {
        switch (key) {
          case "summary":
          case "simple":
          case "headline":
            const cleanedContent = cleanText(value);
            return (
              <div className="content-text">
                {parseTextWithSections(cleanedContent)}
              </div>
            );

          case "keywords":
            if (Array.isArray(value)) {
              return (
                <div className="chip-container">
                  {value.length > 0 ? (
                    value.map((k, i) => (
                      <span key={i} className="chip">{cleanText(k)}</span>
                    ))
                  ) : (
                    <div className="no-data">No keywords found</div>
                  )}
                </div>
              );
            }
            return <div className="no-data">No keywords found</div>;

          case "impact":
            return (
              <div className="impact-grid">
                {[
                  { title: "👥 Citizens", field: "citizens" },
                  { title: "💼 Businesses", field: "businesses" },
                  { title: "🏛️ Government", field: "government" },
                  { title: "⚖️ Rights", field: "rights" },
                  { title: "📋 Responsibilities", field: "responsibilities" }
                ].map(({ title, field }) => (
                  <div key={field} className="impact-item">
                    <h4>{title}</h4>
                    <div className="impact-content">
                      {parseTextWithSections(cleanText(value[field] || "No impact mentioned"))}
                    </div>
                  </div>
                ))}
              </div>
            );

          case "pros-cons":
            return (
              <div className="pros-cons-container">
                <div className="pros-list">
                  <h4>✅ Pros ({Array.isArray(value?.pros) ? value.pros.length : 0})</h4>
                  {Array.isArray(value?.pros) && value.pros.length > 0 ? (
                    <ul>
                      {value.pros.map((p, i) => (
                        <li key={`pro-${i}`}>{cleanText(p)}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="no-items">No pros identified</p>
                  )}
                </div>
                <div className="cons-list">
                  <h4>❌ Cons ({Array.isArray(value?.cons) ? value.cons.length : 0})</h4>
                  {Array.isArray(value?.cons) && value.cons.length > 0 ? (
                    <ul>
                      {value.cons.map((c, i) => (
                        <li key={`con-${i}`}>{cleanText(c)}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="no-items">No cons identified</p>
                  )}
                </div>
              </div>
            );

          case "risk":
            if (Array.isArray(value) && value.length > 0) {
              return (
                <div className="risk-list">
                  {value.map((riskItem, index) => {
                    const riskScore = riskItem.risk_score || riskItem.score || 0;
                    
                    let reason = "";
                    if (typeof riskItem.reason === 'string') {
                      reason = riskItem.reason;
                    } else if (typeof riskItem === 'string') {
                      reason = riskItem;
                    } else if (riskItem.description) {
                      reason = riskItem.description;
                    } else {
                      reason = `Risk ${index + 1}`;
                    }
                    
                    const riskLevel = riskScore >= 7 ? 'high' : riskScore >= 4 ? 'medium' : 'low';
                    
                    return (
                      <div key={index} className={`risk-item risk-${riskLevel}`}>
                        <div className="risk-header">
                          <span className={`risk-badge risk-${riskLevel}`}>
                            Risk Level: {riskScore}/10
                          </span>
                        </div>
                        <div className="risk-content">
                          <p>{cleanText(reason).substring(0, 300)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            }
            return <div className="no-data">No risks identified</div>;

          case "compress":
            if (value && typeof value === 'object') {
              const compressionPercent = ((1 - value.compressed_tokens / value.original_tokens) * 100).toFixed(1);
              return (
                <div className="compression-result-inline">
                  <div className="compression-stats">
                    <div className="stat">
                      <span className="label">Original Tokens</span>
                      <span className="value">{value.original_tokens}</span>
                    </div>
                    <div className="stat">
                      <span className="label">Compressed Tokens</span>
                      <span className="value">{value.compressed_tokens}</span>
                    </div>
                    <div className="stat">
                      <span className="label">Tokens Saved</span>
                      <span className="value success">{value.saved_tokens}</span>
                    </div>
                    <div className="stat">
                      <span className="label">Compression Ratio</span>
                      <span className="value">{compressionPercent}%</span>
                    </div>
                  </div>
                  <div className="compressed-text-container">
                    <h5>Compressed Document</h5>
                    <div className="compressed-text">
                      {parseTextWithSections(cleanText(value.compressed_text))}
                    </div>
                  </div>
                </div>
              );
            }
            return <div className="no-data">No compression data available</div>;

          default:
            return (
              <div className="content-text">
                {parseTextWithSections(cleanText(JSON.stringify(value, null, 2)))}
              </div>
            );
        }
      }

      return (
        <div className="content-text">
          {parseTextWithSections(cleanText(JSON.stringify(value)))}
        </div>
      );
    } catch (renderError) {
      console.error("Render error:", renderError, "Value:", value);
      return <div className="error-message">⚠️ Render error - Unable to display content</div>;
    }
  };

  const selectDocument = (doc) => {
    setDocId(doc.id);
    setSelectedDoc(doc.id);
    setResults(doc.results || {});
    setActiveTab("summary");
  };

  return (
    <div className="app-layout">
      {/* SIDEBAR */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-branding">
            <img src={logo} alt="LEGISAID Logo" className="app-logo" />
            <h2>LEGISAID</h2>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            <FaSignOutAlt />
          </button>
        </div>

        <div className="history-section">
          <h3>📁 Document History</h3>
          {history.length === 0 ? (
            <div className="empty-state">No documents yet. Upload one!</div>
          ) : (
            <div className="history-list">
              {history.map((doc) => (
                <div
                  key={doc.id}
                  className={`history-item ${
                    selectedDoc === doc.id ? "active" : ""
                  }`}
                  onClick={() => selectDocument(doc)}
                  title={doc.name}
                >
                  <div className="doc-name">{doc.name}</div>
                  <small className="doc-time">{doc.time}</small>
                  {doc.results && Object.keys(doc.results).length > 0 && (
                    <span className="analysis-badge">✓ Analyzed</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="main-content">
        {!docId ? (
          <div className="upload-section">
            <div className="upload-icon">
              <img src={logo} alt="LEGISAID" className="upload-logo" />
            </div>
            <h1>AI Legal Document Analysis</h1>
            <p>Upload any document and get instant multi-faceted insights</p>
            
            <div className="upload-area">
              <label className="upload-box">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileChange}
                  disabled={loading}
                  hidden
                />
                {!file ? (
                  <>
                    <FaFileUpload size={48} />
                    <p>Click to upload document<br/><small>PDF, DOC, DOCX, TXT supported</small></p>
                  </>
                ) : (
                  <div className="file-preview">
                    <span className="file-name" title={file.name}>{file.name}</span>
                    <button 
                      className="clear-btn" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                    >
                      ✕
                    </button>
                  </div>
                )}
              </label>

              {file && (
                <button 
                  className="primary-btn upload-btn" 
                  onClick={upload}
                  disabled={loading}
                >
                  {loading ? "⏳ Uploading..." : "🚀 Upload Document"}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="dashboard-container">
            <div className="dashboard-header">
              <div>
                <h2>Analysis Results</h2>
                <small>Document ID: {docId}</small>
              </div>
              <div className="progress-info">
                <span>
                  {Object.keys(results).filter(k => results[k] && !results[k]?.error).length}/8 
                  analyses complete
                </span>
                <button 
                  className="primary-btn analyze-btn" 
                  onClick={runAnalysis}
                  disabled={analyzing}
                >
                  {analyzing ? "🔄 Analyzing..." : "🔍 Run Full Analysis"}
                </button>
              </div>
            </div>

            <div className="dashboard-grid">
              <div className="results-panel">
                <div className="tabs-container">
                  {endpoints.map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      className={`tab-btn ${activeTab === key ? "active" : ""} ${
                        results[key] && !results[key]?.error ? "completed" : ""
                      } ${analyzing ? "disabled" : ""} ${loadingTab === key ? "loading" : ""}`}
                      onClick={() => loadTabData(key)}
                      disabled={analyzing || loadingTab === key}
                    >
                      <Icon size={18} />
                      <span>{label}</span>
                      {results[key] && !results[key]?.error && <span className="check">✓</span>}
                      {loadingTab === key && <span className="tab-loader"></span>}
                    </button>
                  ))}
                </div>

                {activeTab && (
                  <div className="result-card">
                    <div className="result-header">
                      <h3>{endpoints.find(e => e.key === activeTab)?.label}</h3>
                      {results[activeTab]?.error && (
                        <span className="error-badge">⚠️ Error</span>
                      )}
                    </div>
                    {renderContent(activeTab, results[activeTab])}
                  </div>
                )}
              </div>

              <div className="right-panel">
                {activeTab === "risk" && results.risk && !results.risk?.error && Array.isArray(results.risk) && results.risk.length > 0 && (
                  <div className="risk-chart-container">
                    <RiskChart data={results.risk} />
                  </div>
                )}
                <ChatPanel docId={docId} token={token} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
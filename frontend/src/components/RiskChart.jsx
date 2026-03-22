import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
  CartesianGrid,
} from "recharts";
import { FaExclamationTriangle, FaCheckCircle } from "react-icons/fa";
import "./RiskChart.css";

export default function RiskChart({ data }) {
  if (!data || (Array.isArray(data) && data.length === 0)) {
    return (
      <div className="no-risk-data">
        <FaCheckCircle size={40} />
        <p>No risk data available</p>
        <small>Upload and analyze a document to view risk scores</small>
      </div>
    );
  }

  // 🔥 HANDLE ALL BACKEND RISK FORMATS
  const parseRiskData = (riskData) => {
    const risks = [];

    try {
      // 1. Array of objects with risk_score and reason
      if (Array.isArray(riskData)) {
        return riskData
          .map((item, index) => {
            // Handle: { risk_score: 8, reason: "..." }
            const score = item.risk_score || item.score || 0;
            const reason = item.reason || item.name || `Risk ${index + 1}`;
            
            // Normalize score to 0-100 if it's on 0-10 scale
            const normalizedScore = score > 10 ? score : score * 10;
            
            return {
              id: index,
              name: reason.substring(0, 30) + (reason.length > 30 ? "..." : ""),
              score: Math.min(normalizedScore, 100),
              fullReason: reason,
              riskLevel: getRiskLevel(normalizedScore),
            };
          })
          .filter((item) => !isNaN(item.score));
      }

      // 2. String format with markdown JSON blocks
      if (typeof riskData === "string") {
        const jsonRegex = /```json\n([\s\S]*?)\n```/g;
        let match;
        
        while ((match = jsonRegex.exec(riskData)) !== null) {
          try {
            const parsed = JSON.parse(match[1]);
            const score = parsed.risk_score || parsed.score || 0;
            const normalizedScore = score > 10 ? score : score * 10;
            
            risks.push({
              id: risks.length,
              name: `Risk ${risks.length + 1}`,
              score: Math.min(normalizedScore, 100),
              fullReason: parsed.reason || "Risk identified",
              riskLevel: getRiskLevel(normalizedScore),
            });
          } catch (e) {
            console.warn("Could not parse risk JSON block:", e);
          }
        }
        
        return risks.length > 0 
          ? risks 
          : [{
              id: 0,
              name: "Unstructured Risk",
              score: 50,
              fullReason: riskData.substring(0, 100),
              riskLevel: "medium",
            }];
      }

      // 3. Object format: { risk1: 85, risk2: 72 }
      if (typeof riskData === "object" && !Array.isArray(riskData)) {
        Object.entries(riskData).forEach(([key, value], index) => {
          const score = parseFloat(value);
          if (!isNaN(score)) {
            risks.push({
              id: index,
              name: key.substring(0, 30),
              score: Math.min(score, 100),
              fullReason: key,
              riskLevel: getRiskLevel(score),
            });
          }
        });
        return risks;
      }

      // 4. Single number
      const singleScore = parseFloat(riskData);
      if (!isNaN(singleScore)) {
        return [{
          id: 0,
          name: "Overall Risk",
          score: Math.min(singleScore, 100),
          fullReason: "Overall document risk assessment",
          riskLevel: getRiskLevel(singleScore),
        }];
      }
    } catch (error) {
      console.error("Error parsing risk data:", error);
    }

    return [];
  };

  // 🔥 DETERMINE RISK LEVEL
  const getRiskLevel = (score) => {
    if (score >= 80) return "critical";
    if (score >= 60) return "high";
    if (score >= 40) return "medium";
    if (score >= 20) return "low";
    return "minimal";
  };

  // 🔥 COLOR CODING BY RISK LEVEL
  const getRiskColor = (riskLevel) => {
    const colors = {
      critical: "#ff4444",  // Red
      high: "#ff8833",      // Orange-Red
      medium: "#ffaa00",    // Orange
      low: "#ffdd44",       // Yellow
      minimal: "#44ff44",   // Green
    };
    return colors[riskLevel] || "#999999";
  };

  const chartData = parseRiskData(data);

  if (chartData.length === 0) {
    return (
      <div className="no-risk-data">
        <FaExclamationTriangle size={40} />
        <p>Unable to parse risk data</p>
        <small>Please ensure the document has been analyzed</small>
      </div>
    );
  }

  // Calculate statistics
  const avgScore = Math.round(chartData.reduce((sum, d) => sum + d.score, 0) / chartData.length);
  const maxScore = Math.max(...chartData.map(d => d.score));
  const criticalCount = chartData.filter(d => d.score >= 80).length;

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="tooltip-name">{data.fullReason}</p>
          <p className="tooltip-score">Risk Score: <strong>{data.score}%</strong></p>
          <p className={`tooltip-level ${data.riskLevel}`}>
            Level: <strong>{data.riskLevel.toUpperCase()}</strong>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="risk-chart-wrapper">
      <div className="chart-header">
        <div className="header-content">
          <h3>📊 Risk Assessment</h3>
          <p className="header-subtitle">Document risk analysis breakdown</p>
        </div>
        
        <div className="chart-stats">
          <div className="stat-item">
            <span className="stat-label">Average</span>
            <span className="stat-value">{avgScore}%</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Maximum</span>
            <span className="stat-value">{maxScore}%</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Critical</span>
            <span className="stat-value critical">{criticalCount}</span>
          </div>
        </div>
      </div>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart 
            data={chartData}
            margin={{ top: 20, right: 30, left: 10, bottom: 60 }}
          >
            <defs>
              <linearGradient id="riskGradientCritical" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ff6666" />
                <stop offset="100%" stopColor="#ff4444" />
              </linearGradient>
              <linearGradient id="riskGradientHigh" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffaa55" />
                <stop offset="100%" stopColor="#ff8833" />
              </linearGradient>
              <linearGradient id="riskGradientMedium" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffdd77" />
                <stop offset="100%" stopColor="#ffaa00" />
              </linearGradient>
              <linearGradient id="riskGradientLow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffff77" />
                <stop offset="100%" stopColor="#ffdd44" />
              </linearGradient>
              <linearGradient id="riskGradientMinimal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#77ff77" />
                <stop offset="100%" stopColor="#44ff44" />
              </linearGradient>
            </defs>

            <CartesianGrid 
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.1)"
              vertical={false}
            />
            
            <XAxis 
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 11 }}
              angle={-45}
              textAnchor="end"
              height={100}
            />
            
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 11 }}
              width={45}
              domain={[0, 100]}
              label={{ value: "Risk %", angle: -90, position: "insideLeft" }}
            />
            
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.1)" }} />
            
            <Bar 
              dataKey="score" 
              radius={[6, 6, 0, 0]}
              animationDuration={800}
            >
              {chartData.map((entry) => (
                <Cell
                  key={`cell-${entry.id}`}
                  fill={
                    entry.riskLevel === "critical"
                      ? "url(#riskGradientCritical)"
                      : entry.riskLevel === "high"
                      ? "url(#riskGradientHigh)"
                      : entry.riskLevel === "medium"
                      ? "url(#riskGradientMedium)"
                      : entry.riskLevel === "low"
                      ? "url(#riskGradientLow)"
                      : "url(#riskGradientMinimal)"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 🔥 RISK LEGEND */}
      <div className="risk-legend">
        <div className="legend-item critical">
          <div className="color-box"></div>
          <div className="legend-text">
            <span className="level-name">Critical</span>
            <small>80 - 100%</small>
          </div>
        </div>
        <div className="legend-item high">
          <div className="color-box"></div>
          <div className="legend-text">
            <span className="level-name">High</span>
            <small>60 - 79%</small>
          </div>
        </div>
        <div className="legend-item medium">
          <div className="color-box"></div>
          <div className="legend-text">
            <span className="level-name">Medium</span>
            <small>40 - 59%</small>
          </div>
        </div>
        <div className="legend-item low">
          <div className="color-box"></div>
          <div className="legend-text">
            <span className="level-name">Low</span>
            <small>20 - 39%</small>
          </div>
        </div>
        <div className="legend-item minimal">
          <div className="color-box"></div>
          <div className="legend-text">
            <span className="level-name">Minimal</span>
            <small>0 - 19%</small>
          </div>
        </div>
      </div>

      {/* 🔥 RISK DETAILS TABLE */}
      {chartData.length > 0 && (
        <div className="risk-details">
          <h4>Risk Details</h4>
          <div className="details-table">
            {chartData.map((risk) => (
              <div key={risk.id} className={`detail-row ${risk.riskLevel}`}>
                <div className="detail-score">
                  <span className={`score-badge ${risk.riskLevel}`}>{risk.score}%</span>
                </div>
                <div className="detail-info">
                  <p className="detail-reason">{risk.fullReason}</p>
                  <span className={`detail-level ${risk.riskLevel}`}>{risk.riskLevel.toUpperCase()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
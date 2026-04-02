import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PhishingScoreCircle } from "@/components/common/PhishingScoreCircle";
import { RiskBadge } from "@/components/common/RiskBadge";
import { Shield, Flame, ChevronDown, Plus } from "lucide-react";
import { getHistory, HistorySummary } from "@/services/api";
import { useNavigate } from "react-router-dom";

const microLessons = [
  { icon: "🔍", title: "Check the Sender's Domain", body: "Hover over the sender's name. If the email is from 'support@amaz0n.com' instead of 'amazon.com', it's a trap." },
  { icon: "⚡", title: "Beware of Artificial Urgency", body: 'Phrases like "Account Suspended" or "Action Required in 2 hours" are designed to make you panic and click without thinking.' },
  { icon: "🔗", title: "Inspect Shortened URLs", body: "Bit.ly links can hide malicious destinations. Always use a URL expander if you're unsure about the source." },
];

export default function Learn() {
  const [history, setHistory] = useState<HistorySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getHistory();
        setHistory(data);
      } catch (err) {
        console.error("Failed to load statistics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const totalScans = history.length;
  const threatsCaught = history.filter(h => h.risk.toLowerCase() === 'high' || h.risk.toLowerCase() === 'medium').length;
  const safeScans = history.filter(h => h.risk.toLowerCase() === 'low').length;
  const awarenessScore = totalScans > 0 ? Math.round((safeScans / totalScans) * 100) : 0;
  
  const getIcon = (source: string) => {
    source = source.toLowerCase();
    if (source.includes("upload") || source.includes("file")) return "📎";
    if (source.includes("text input")) return "📝";
    return "📧";
  };

  const stats = [
    { label: "TOTAL SCANS", value: totalScans.toString(), change: "Lifetime operations", positive: true },
    { label: "THREATS CAUGHT", value: threatsCaught.toString(), change: "Filtered by Engine", positive: true },
    { label: "AWARENESS", value: awarenessScore + "%", progress: awarenessScore },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Awareness Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 flex flex-col items-center"
        >
          <h2 className="text-lg font-semibold text-foreground mb-6 self-start">Environment Shield Status</h2>
          <div className="relative">
            <PhishingScoreCircle score={awarenessScore} size={160} label={awarenessScore > 80 ? "EXPERT" : awarenessScore > 50 ? "GROWING" : "NOVICE"} />
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6 w-full">
            <div className="bg-muted/30 rounded-lg p-3 text-center">
              <Shield className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="text-lg font-bold text-foreground">Scans: {totalScans}</p>
              <p className="text-xs text-muted-foreground">Historical Logs</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-3 text-center">
              <Flame className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="text-lg font-bold text-foreground">{threatsCaught} Caught</p>
              <p className="text-xs text-muted-foreground">Defended Assets</p>
            </div>
          </div>
        </motion.div>

        {/* Scanning History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 glass-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Recent Security Checks</h2>
              <p className="text-sm text-muted-foreground">Detailed log of your last 5 operations.</p>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 text-xs rounded-md bg-primary text-primary-foreground font-medium flex items-center gap-1" onClick={() => window.location.href = '/'}>
                <Plus className="h-3 w-3" /> NEW SCAN
              </button>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4 text-xs text-muted-foreground uppercase tracking-wider pb-3 border-b border-border/30">
            <div className="col-span-6">Target / Source</div>
            <div className="col-span-3">Risk Level</div>
            <div className="col-span-3">Result</div>
          </div>

          {!loading && history.length === 0 ? (
            <p className="py-6 text-center text-muted-foreground text-sm">No analysis history found.</p>
          ) : (
            history.slice(0, 5).map((scan, i) => (
              <motion.div
                key={scan.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="grid grid-cols-12 gap-4 py-4 border-b border-border/20 items-center text-sm"
              >
                <div className="col-span-6 flex items-center gap-3 truncate pr-4">
                  <span className="text-lg">{getIcon(scan.source)}</span>
                  <div className="truncate">
                    <p className="font-medium text-foreground truncate">{scan.target}</p>
                    <p className="text-xs text-muted-foreground truncate">{scan.source}</p>
                  </div>
                </div>
                <div className="col-span-3"><RiskBadge level={scan.risk.toLowerCase() as "low" | "medium" | "high"} className="text-[10px]" /></div>
                <div className="col-span-3 flex items-center gap-1.5 w-full truncate">
                  <span className={`min-w-1.5 h-1.5 rounded-full flex-shrink-0 ${scan.risk.toLowerCase() === "low" ? "bg-safe" : scan.risk.toLowerCase() === "high" ? "bg-destructive" : "bg-warning"}`} />
                  <span className="text-muted-foreground truncate" title={scan.result}>{scan.result}</span>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Daily Micro-Lessons</h2>
          </div>
          <div className="space-y-3">
            {microLessons.map((lesson, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="glass-card p-4"
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl">{lesson.icon}</span>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{lesson.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{lesson.body}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 content-start">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="glass-card p-4"
            >
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
              <p className={`text-xs mt-1 text-muted-foreground`}>
                {stat.change}
              </p>
              {stat.progress !== undefined && (
                <div className="w-full bg-muted h-1.5 rounded-full mt-2 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${stat.progress}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

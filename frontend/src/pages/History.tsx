import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, Search } from "lucide-react";
import { RiskBadge } from "@/components/common/RiskBadge";
import { getHistory, HistorySummary } from "@/services/api";
import { useNavigate } from "react-router-dom";

export default function History() {
  const [history, setHistory] = useState<HistorySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLevel, setFilterLevel] = useState("All");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getHistory();
        setHistory(data);
      } catch (err) {
        console.error("Failed to fetch history", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const filteredHistory = history.filter((scan) => {
    const matchesSearch = 
      scan.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scan.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scan.result.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterLevel === "All" || scan.risk.toLowerCase() === filterLevel.toLowerCase();
    
    return matchesSearch && matchesFilter;
  });

  const handleExport = () => {
    const headers = ["Target", "Source", "Date", "Score", "Risk", "Result"];
    const rows = filteredHistory.map(scan => [
      `"${scan.target.replace(/"/g, '""')}"`,
      `"${scan.source.replace(/"/g, '""')}"`,
      new Date(scan.timestamp).toLocaleString(),
      scan.score,
      scan.risk,
      `"${scan.result.replace(/"/g, '""')}"`
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `phishguard_history_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getIcon = (source: string) => {
    source = source.toLowerCase();
    if (source.includes("upload") || source.includes("file")) return "📎";
    if (source.includes("text input")) return "📝";
    return "📧";
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Scan History</h1>
          <p className="text-muted-foreground mt-1">Complete log of all security scans performed.</p>
        </div>
        <button 
          onClick={handleExport}
          disabled={filteredHistory.length === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border/50 text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {/* Filters and Search */}
      <div className="glass-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search scans..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-muted/50 border border-border/50 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {["All", "High", "Medium", "Low"].map((filter) => (
            <button
              key={filter}
              onClick={() => setFilterLevel(filter)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filterLevel === filter ? "bg-primary/20 text-primary border border-primary/30" : "text-muted-foreground hover:bg-muted border border-transparent"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/30 border-b border-border/50">
              <tr>
                <th className="px-6 py-4 font-semibold tracking-wider">Target</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Date</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Score</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Risk</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">Loading history...</td></tr>
              ) : filteredHistory.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">No scans found matching your criteria.</td></tr>
              ) : (
                filteredHistory.map((scan, i) => (
                  <motion.tr
                    key={scan.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="hover:bg-muted/10 transition-colors group cursor-pointer"
                    onClick={() => navigate(`/analysis/${scan.id}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{getIcon(scan.source)}</span>
                        <div>
                          <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {scan.target}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">{scan.source}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                      {formatDate(scan.timestamp)}
                    </td>
                    <td className="px-6 py-4 font-bold" style={{ color: scan.score > 70 ? 'var(--destructive)' : scan.score > 40 ? 'var(--warning)' : 'var(--safe)' }}>
                      {Math.round(scan.score)}
                    </td>
                    <td className="px-6 py-4">
                      <RiskBadge level={scan.risk.toLowerCase() as "low" | "medium" | "high"} />
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{scan.result}</td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

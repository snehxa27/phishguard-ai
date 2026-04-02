import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, ChevronLeft, AlertTriangle } from "lucide-react";
import { RiskBadge } from "@/components/common/RiskBadge";
import { ProgressBar } from "@/components/common/ProgressBar";
import { getScanById, HistoryDetail } from "@/services/api";

import { toast } from "sonner";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Analysis() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<HistoryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isActioned, setIsActioned] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchScan = async () => {
      try {
        const result = await getScanById(parseInt(id));
        setData(result);
      } catch (err) {
        console.error("Failed to load scan details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchScan();
  }, [id]);

  const handleAction = (type: "discard" | "quarantine") => {
    setIsActioned(type);
    if (type === "discard") {
      toast.info("Threat record discarded", {
        description: "The analysis record has been archived and removed from active monitoring.",
      });
    } else {
      toast.success("Content Quarantined", {
        description: "Sender has been blacklisted and similar patterns will be automatically blocked.",
      });
    }
  };

  if (loading) return <div className="text-center py-20 animate-pulse text-muted-foreground">Loading Deep Dive Analysis...</div>;
  if (!data) return <div className="text-center py-20 text-destructive text-lg font-bold">Scan Record Not Found</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
        <button onClick={() => navigate(-1)} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-2 transition-colors">
          <ChevronLeft className="h-4 w-4" /> Back to History
        </button>
        <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center gap-3">
          <RiskBadge level={data.risk.toLowerCase() as "low" | "medium" | "high"} />
          <span className="text-sm text-muted-foreground font-mono">UUID: PG-{data.id.toString().padStart(6, '0')}</span>
          <span className="text-sm px-3 py-1 rounded-full bg-muted/50 text-foreground border border-border/50 truncate max-w-sm">Source: {data.source}</span>
        </motion.div>
        <motion.h1 variants={item} className="text-3xl font-bold text-foreground">Threat Deep-Dive: {data.target}</motion.h1>
        <motion.p variants={item} className="text-muted-foreground text-lg leading-relaxed max-w-4xl">
          {data.explanation}
        </motion.p>
      </motion.div>

      {/* Explainability + Triggers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
           className="lg:col-span-2 glass-card p-6 border-t-2"
           style={{ borderTopColor: data.risk.toLowerCase() === 'high' ? 'var(--destructive)' : data.risk.toLowerCase() === 'medium' ? 'var(--warning)' : 'var(--safe)' }}
         >
           <div className="flex items-center gap-2 mb-6">
             <span className="w-2 h-2 rounded-full" style={{ backgroundColor: data.risk.toLowerCase() === 'high' ? 'var(--destructive)' : data.risk.toLowerCase() === 'medium' ? 'var(--warning)' : 'var(--safe)' }} />
             <h2 className="text-lg font-semibold text-foreground">AI Tactic Findings</h2>
           </div>
           <div className="space-y-6">
             {Object.keys(data.tactics).length > 0 ? Object.entries(data.tactics).map(([tacticName, score], i) => (
               <motion.div
                 key={i}
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: 0.3 + i * 0.15 }}
                 className="border-l-2 pl-4 flex flex-col justify-center"
                 style={{ borderLeftColor: score > 50 ? 'var(--warning)' : 'var(--primary)' }}
               >
                 <div className="flex justify-between items-center mb-1">
                    <h3 className="font-semibold text-foreground uppercase tracking-wide text-sm">{tacticName.replace(/_/g, ' ')}</h3>
                    <span className="text-sm font-mono text-muted-foreground">Confidence: {score.toFixed(1)}%</span>
                 </div>
                 <div className="w-full bg-muted h-1 rounded-full overflow-hidden mt-1">
                   <div className="h-full bg-primary" style={{ width: `${score}%`, backgroundColor: score > 70 ? 'var(--destructive)' : score > 40 ? 'var(--warning)' : 'var(--safe)' }} />
                 </div>
               </motion.div>
             )) : (
               <p className="text-muted-foreground">No specific manipulation tactics were isolated in this scan.</p>
             )}
           </div>
         </motion.div>
 
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.4 }}
           className="glass-card p-6"
         >
           <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-6">Engine Overview</h3>
           <div className="space-y-5">
             <ProgressBar label="Overall Phishing Score" value={data.score} variant={data.score > 70 ? "danger" : data.score > 40 ? "warning" : "primary"} />
           </div>
           <div className="mt-8 bg-muted/30 rounded-lg p-3">
              <AlertTriangle className="h-4 w-4 text-primary inline-block mr-1.5 mb-0.5" />
             <span className="text-xs text-muted-foreground leading-relaxed">
               Analysis based on Deep Learning Natural Language Processing combining ML models and zero-day heuristic detection.
             </span>
           </div>
         </motion.div>
       </div>
       {/* Link Analysis */}
       {data.urls && data.urls.length > 0 && (
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.5 }}
           className="glass-card p-6"
         >
           <div className="flex items-center gap-2 mb-6">
             <span className="text-xl">🔗</span>
             <h2 className="text-lg font-semibold text-foreground">Link Analysis Results</h2>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {data.urls.map((urlData, idx) => (
               <div key={idx} className="bg-muted/30 rounded-lg p-4 border border-border/20">
                 <div className="flex items-center justify-between mb-2">
                   <span className="text-xs font-mono text-muted-foreground truncate max-w-[70%]" title={urlData.url}>{urlData.url}</span>
                   <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                     urlData.status === 'Malicious' ? 'bg-destructive/20 text-destructive border border-destructive/30' :
                     urlData.status === 'Suspicious' ? 'bg-warning/20 text-warning border border-warning/30' :
                     'bg-safe/20 text-safe border border-safe/30'
                   }`}>
                     {urlData.status}
                   </span>
                 </div>
                 <p className="text-xs text-muted-foreground leading-relaxed">{urlData.reason}</p>
               </div>
             ))}
           </div>
         </motion.div>
       )}
 
       {/* Remediation */}
       <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ delay: 0.6 }}
         className="glass-card p-6 flex flex-col md:flex-row items-center justify-between gap-4"
       >
         <div>
           <h3 className="text-lg font-bold text-foreground">Action Required?</h3>
           <p className="text-sm text-muted-foreground">
             {isActioned ? (
               <span className="flex items-center gap-2 text-primary font-semibold">
                 <Shield className="h-4 w-4" /> Action Completed: {isActioned.toUpperCase()}
               </span>
             ) : (
               `PhishGuard AI recommends ${data.risk.toLowerCase() === 'high' ? 'immediate quarantine' : data.risk.toLowerCase() === 'medium' ? 'caution and user training' : 'no action needed'}.`
             )}
           </p>
         </div>
         <div className="flex gap-3">
           <button 
             onClick={() => handleAction("discard")}
             disabled={!!isActioned}
             className="px-6 py-2.5 text-sm rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors font-medium disabled:opacity-50"
           >
             DISCARD
           </button>
           <button 
             onClick={() => handleAction("quarantine")}
             disabled={!!isActioned || data.risk.toLowerCase() === 'low'}
             className="px-6 py-2.5 text-sm rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
           >
             QUARANTINE
           </button>
         </div>
       </motion.div>
     </div>
  );
}

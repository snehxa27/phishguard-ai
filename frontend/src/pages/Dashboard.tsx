import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Zap, Shield, AlertTriangle, CheckCircle, User, Mail } from "lucide-react";
import { PhishingScoreCircle } from "@/components/common/PhishingScoreCircle";
import { RiskBadge } from "@/components/common/RiskBadge";
import { scanText, uploadFile, ScanResponse, HighlightItem } from "@/services/api";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function Dashboard() {
  const [emailText, setEmailText] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<ScanResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleScan = async () => {
    if (!emailText.trim()) return;
    setIsScanning(true);
    setResult(null);
    setError(null);
    try {
      const data = await scanText(emailText);
      setResult(data);
      toast.success("Scan Complete", {
        description: `Analysis identifies this as a ${data.risk.toUpperCase()} risk.`,
      });
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || "Failed to scan text";
      setError(msg);
      toast.error("Scan Failed", { description: msg });
    } finally {
      setIsScanning(false);
    }
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsScanning(true);
    setResult(null);
    setError(null);
    e.target.value = "";
    
    try {
      const data = await uploadFile(file);
      if (data.extracted_text) {
        setEmailText(data.extracted_text);
      }
      setResult(data);
      toast.success("File Processed", {
        description: `Successfully analyzed ${file.name}.`,
      });
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || "Failed to upload and parse file";
      setError(msg);
      toast.error("Upload Failed", { description: msg });
    } finally {
      setIsScanning(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleActionCard = (title: string) => {
    toast.info(`${title} Triggered`, {
      description: "This feature is being simulated for the demo and would integrate with security APIs in production.",
    });
  };

  const highlightEmail = (body: string, highlights: HighlightItem[]) => {
    if (!highlights || highlights.length === 0) return body;
    let highlighted = body;
    highlights.forEach((h) => {
      const textToReplace = h.word;
      if (textToReplace) {
        const colorClass = h.type === "urgency" ? "text-warning" : "text-destructive";
        highlighted = highlighted.replace(
          textToReplace,
          `<span class="${colorClass} font-semibold underline decoration-dotted">${textToReplace}</span>`
        );
      }
    });
    return highlighted;
  };

  const getRiskLevel = (risk: string) => {
    return risk.toLowerCase() as "low" | "medium" | "high";
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Security Scan</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-sm text-primary font-medium">AI CORE ACTIVE</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-5 space-y-4">
            <textarea
              className="w-full h-32 p-4 rounded-lg bg-muted/50 border border-border/50 text-foreground placeholder-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
              placeholder="Paste message or email content here..."
              value={emailText}
              onChange={(e) => setEmailText(e.target.value)}
            />
            {error && (
              <div className="text-sm text-destructive font-medium p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertTriangle className="inline-block h-4 w-4 mr-2 mb-0.5" />
                {error}
              </div>
            )}
            <div className="flex gap-3">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".txt,.pdf,.eml"
                onChange={onFileChange}
              />
              <button
                onClick={triggerFileInput}
                disabled={isScanning}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors text-sm disabled:opacity-50"
              >
                <Upload className="h-4 w-4" />
                Upload File (.txt, .pdf, .eml)
              </button>
              <button
                onClick={handleScan}
                disabled={isScanning || !emailText.trim()}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isScanning ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Scan Now
                  </>
                )}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {isScanning && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="glass-card p-8 flex flex-col items-center gap-4"
              >
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-muted-foreground scan-pulse">Analyzing content with AI engine...</p>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-4"
              >
                <div className="glass-card p-5">
                  <div className="flex items-start justify-between mb-4">
                     <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                        <div>
                        <h3 className="font-semibold text-foreground">Email Preview: Suspicious Content Analysis</h3>
                        </div>
                     </div>
                  </div>

                  {/* Metadata display if exists */}
                  {(result.subject || result.sender) && (
                    <div className="mb-4 space-y-2 bg-muted/20 p-3 rounded-lg border border-border/20">
                      {result.sender && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="h-4 w-4" />
                          <span className="font-semibold text-foreground/80">From:</span> <span className="text-foreground">{result.sender}</span>
                        </div>
                      )}
                      {result.subject && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          <span className="font-semibold text-foreground/80">Subject:</span> <span className="text-foreground">{result.subject}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="bg-muted/30 rounded-lg p-4 border border-border/30">
                    <p
                      className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: highlightEmail(emailText, result.highlights) }}
                    />
                  </div>
                  <div className="flex gap-2 mt-4 flex-wrap">
                    {result.tactics && Object.keys(result.tactics).map((tag) => (
                      <span key={tag} className="text-xs px-3 py-1 rounded-full border border-primary/30 text-primary bg-primary/5">
                        {tag.replace(/_/g, " ").toUpperCase()}: {result.tactics[tag].toFixed(0)}
                      </span>
                    ))}
                  </div>

                  {result.urls && result.urls.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-border/30">
                      <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                        <span>🔗</span> Link Checker Results
                      </h4>
                      <div className="space-y-3">
                        {result.urls.map((urlData, idx) => (
                          <div key={idx} className="bg-muted/30 rounded-lg p-3 border border-border/20">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-mono text-muted-foreground truncate max-w-[70%]">{urlData.url}</span>
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
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { icon: Zap, title: "Rapid Mitigation", desc: "Instantly block this sender across your organization with one click." },
                    { icon: Shield, title: "Historical Match", desc: "Similar patterns were seen in our scanning engines recently." },
                    { icon: CheckCircle, title: "Threat Intelligence", desc: "Report this text to global threat databases anonymously." },
                  ].map((action) => (
                    <div 
                      key={action.title} 
                      className="glass-card-hover p-4 cursor-pointer"
                      onClick={() => handleActionCard(action.title)}
                    >
                      <action.icon className="h-5 w-5 text-primary mb-2" />
                      <h4 className="text-sm font-semibold text-foreground">{action.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{action.desc}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-6">
          <AnimatePresence>
            {result ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className="glass-card p-6 flex flex-col items-center">
                  <div className="relative">
                    <PhishingScoreCircle score={Math.round(result.score)} size={180} />
                  </div>
                  <div className="mt-4 text-center">
                    <RiskBadge level={getRiskLevel(result.risk)} />
                    <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{result.explanation}</p>
                  </div>
                </div>

                <div className="glass-card p-5">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Deep Scan Meta-Analysis</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                        <div className="flex items-center gap-2">
                          <span>📋</span>
                          <span className="text-sm text-muted-foreground">Tactics Identified</span>
                        </div>
                        <span className="text-sm font-mono text-foreground">{Object.keys(result.tactics).length}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                        <div className="flex items-center gap-2">
                          <span>🔤</span>
                          <span className="text-sm text-muted-foreground">Highlights Found</span>
                        </div>
                        <span className="text-sm font-mono text-foreground">{result.highlights.length}</span>
                    </div>
                    {result.urls !== undefined && (
                    <div className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                        <div className="flex items-center gap-2">
                          <span>🔗</span>
                          <span className="text-sm text-muted-foreground">Links Analyzed</span>
                        </div>
                        <span className="text-sm font-mono text-foreground">{result.urls.length}</span>
                    </div>
                    )}
                  </div>
                  <button 
                    onClick={() => {
                        if (result.id) navigate(`/analysis/${result.id}`);
                    }}
                    className="w-full mt-4 py-2 text-sm text-primary border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors">
                    ✦ Generate Full Forensic Report
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card p-6 flex flex-col items-center"
              >
                <div className="relative">
                  <PhishingScoreCircle score={0} size={180} label="READY" />
                </div>
                <p className="text-sm text-muted-foreground mt-4 text-center">
                  Paste email content and click Scan Now to analyze for phishing threats.
                </p>
                <button
                  onClick={() => {
                    setEmailText(`Dear Valued Customer,

We've noticed suspicious activity on your account. To prevent unauthorized access, please click here to verify your identity immediately.

Failure to do so within 24 hours will result in permanent account suspension.

Regards,
Security Team Support`);
                  }}
                  className="mt-4 px-4 py-2 text-sm bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                >
                  Quick Scan (Demo)
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>

  );
}

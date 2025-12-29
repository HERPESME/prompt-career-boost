import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ATSScore } from "@/utils/atsScoring";
import { CheckCircle2, XCircle, AlertCircle, TrendingUp, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EnhancedATSScoreDisplayProps {
  score: ATSScore;
  className?: string;
}

// Animated circular progress component
function CircularProgress({ value, size = 120, strokeWidth = 8 }: { value: number; size?: number; strokeWidth?: number }) {
  const [animatedValue, setAnimatedValue] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => setAnimatedValue(value), 100);
    return () => clearTimeout(timer);
  }, [value]);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (animatedValue / 100) * circumference;

  const getColor = (val: number) => {
    if (val >= 80) return { stroke: "#10b981", bg: "#d1fae5" }; // green
    if (val >= 60) return { stroke: "#f59e0b", bg: "#fef3c7" }; // yellow
    return { stroke: "#ef4444", bg: "#fee2e2" }; // red
  };

  const colors = getColor(value);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold" style={{ color: colors.stroke }}>{value}</span>
        <span className="text-xs text-slate-500">/ 100</span>
      </div>
    </div>
  );
}

export function EnhancedATSScoreDisplay({ score, className = "" }: EnhancedATSScoreDisplayProps) {
  const [showImprovements, setShowImprovements] = useState(true);
  const [showKeywords, setShowKeywords] = useState(false);

  const getScoreColor = (value: number) => {
    if (value >= 80) return "text-green-600";
    if (value >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBgColor = (value: number) => {
    if (value >= 80) return "bg-green-100";
    if (value >= 60) return "bg-yellow-100";
    return "bg-red-100";
  };

  const getProgressIndicatorColor = (value: number) => {
    if (value >= 80) return "bg-green-500";
    if (value >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getScoreLabel = (value: number) => {
    if (value >= 90) return { text: "Excellent", variant: "default" as const };
    if (value >= 80) return { text: "Very Good", variant: "default" as const };
    if (value >= 70) return { text: "Good", variant: "secondary" as const };
    if (value >= 60) return { text: "Fair", variant: "secondary" as const };
    return { text: "Needs Work", variant: "destructive" as const };
  };

  const label = getScoreLabel(score.overall);

  return (
    <Card className={`p-6 ${className}`}>
      {/* Main Score Section */}
      <div className="flex flex-col md:flex-row items-center gap-6 mb-6 pb-6 border-b border-slate-100">
        <CircularProgress value={score.overall} size={140} strokeWidth={10} />
        
        <div className="text-center md:text-left flex-1">
          <h3 className="text-xl font-semibold text-slate-800 mb-2">ATS Compatibility Score</h3>
          <Badge variant={label.variant} className="mb-3">{label.text}</Badge>
          
          {score.details.matchPercentage > 0 && (
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-slate-700">{score.details.matchedCount}</span> of {score.details.totalKeywords} keywords matched ({score.details.matchPercentage}%)
            </p>
          )}
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Keywords", value: score.breakdown.keywordMatch },
          { label: "Format", value: score.breakdown.formatting },
          { label: "Structure", value: score.breakdown.structure },
          { label: "Readability", value: score.breakdown.readability },
        ].map((item, index) => (
          <div key={index} className={`p-3 rounded-lg ${getScoreBgColor(item.value)} text-center`}>
            <div className={`text-2xl font-bold ${getScoreColor(item.value)}`}>{item.value}%</div>
            <div className="text-xs text-slate-600 font-medium">{item.label}</div>
          </div>
        ))}
      </div>

      {/* Keywords Section */}
      <div className="mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowKeywords(!showKeywords)}
          className="w-full flex items-center justify-between text-slate-700 hover:text-slate-900"
        >
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            Keywords Analysis ({score.matchedKeywords.length} matched, {score.missingKeywords.length} missing)
          </span>
          {showKeywords ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </Button>
        
        {showKeywords && (
          <div className="mt-3 space-y-4 px-2">
            {/* Matched Keywords */}
            {score.matchedKeywords.length > 0 && (
              <div>
                <p className="text-xs font-medium text-green-700 mb-2">✓ Found in your resume:</p>
                <div className="flex flex-wrap gap-1.5">
                  {score.matchedKeywords.map((keyword, index) => (
                    <Badge key={index} variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Keywords */}
            {score.missingKeywords.length > 0 && (
              <div>
                <p className="text-xs font-medium text-red-700 mb-2">✗ Missing from your resume:</p>
                <div className="flex flex-wrap gap-1.5">
                  {score.missingKeywords.slice(0, 15).map((keyword, index) => (
                    <Badge key={index} variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
                      {keyword}
                    </Badge>
                  ))}
                  {score.missingKeywords.length > 15 && (
                    <Badge variant="outline" className="bg-slate-50 text-xs">
                      +{score.missingKeywords.length - 15} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Improvements Section */}
      {score.improvements.length > 0 && (
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowImprovements(!showImprovements)}
            className="w-full flex items-center justify-between text-slate-700 hover:text-slate-900"
          >
            <span className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              Recommendations ({score.improvements.length})
            </span>
            {showImprovements ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
          
          {showImprovements && (
            <div className="mt-3 space-y-2 px-2">
              {score.improvements.map((improvement, index) => (
                <div key={index} className="flex items-start gap-2 text-sm bg-blue-50 p-3 rounded-lg">
                  <AlertCircle className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
                  <span className="text-slate-700">{improvement}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

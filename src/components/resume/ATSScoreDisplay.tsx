import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ATSScore } from "@/utils/atsScoring";
import { CheckCircle2, XCircle, AlertCircle, TrendingUp } from "lucide-react";

interface ATSScoreDisplayProps {
  score: ATSScore;
  className?: string;
}

export function ATSScoreDisplay({ score, className = "" }: ATSScoreDisplayProps) {
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

  const getProgressColor = (value: number) => {
    if (value >= 80) return "bg-green-600";
    if (value >= 60) return "bg-yellow-600";
    return "bg-red-600";
  };

  return (
    <Card className={`p-6 ${className}`}>
      {/* Overall Score */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">ATS Compatibility Score</h3>
          <div className={`text-4xl font-bold ${getScoreColor(score.overall)}`}>
            {score.overall}
            <span className="text-lg text-muted-foreground">/100</span>
          </div>
        </div>
        
        <Progress 
          value={score.overall} 
          className="h-3"
          indicatorClassName={getProgressColor(score.overall)}
        />
        
        <div className="flex items-center gap-2 mt-2">
          <Badge variant={score.overall >= 80 ? "default" : score.overall >= 60 ? "secondary" : "destructive"}>
            {score.overall >= 90 ? "Excellent" : 
             score.overall >= 80 ? "Very Good" :
             score.overall >= 70 ? "Good" :
             score.overall >= 60 ? "Fair" : "Needs Improvement"}
          </Badge>
          
          {score.details.matchPercentage > 0 && (
            <span className="text-sm text-muted-foreground">
              {score.details.matchedCount}/{score.details.totalKeywords} keywords matched ({score.details.matchPercentage}%)
            </span>
          )}
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="space-y-4 mb-6">
        <h4 className="font-semibold text-sm text-muted-foreground">Score Breakdown</h4>
        
        {/* Keyword Match */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium">Keyword Match</span>
            <span className={`text-sm font-semibold ${getScoreColor(score.breakdown.keywordMatch)}`}>
              {score.breakdown.keywordMatch}%
            </span>
          </div>
          <Progress 
            value={score.breakdown.keywordMatch} 
            className="h-2"
            indicatorClassName={getProgressColor(score.breakdown.keywordMatch)}
          />
        </div>

        {/* Formatting */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium">Formatting</span>
            <span className={`text-sm font-semibold ${getScoreColor(score.breakdown.formatting)}`}>
              {score.breakdown.formatting}%
            </span>
          </div>
          <Progress 
            value={score.breakdown.formatting} 
            className="h-2"
            indicatorClassName={getProgressColor(score.breakdown.formatting)}
          />
        </div>

        {/* Structure */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium">Structure</span>
            <span className={`text-sm font-semibold ${getScoreColor(score.breakdown.structure)}`}>
              {score.breakdown.structure}%
            </span>
          </div>
          <Progress 
            value={score.breakdown.structure} 
            className="h-2"
            indicatorClassName={getProgressColor(score.breakdown.structure)}
          />
        </div>

        {/* Readability */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium">Readability</span>
            <span className={`text-sm font-semibold ${getScoreColor(score.breakdown.readability)}`}>
              {score.breakdown.readability}%
            </span>
          </div>
          <Progress 
            value={score.breakdown.readability} 
            className="h-2"
            indicatorClassName={getProgressColor(score.breakdown.readability)}
          />
        </div>
      </div>

      {/* Matched Keywords */}
      {score.matchedKeywords.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <h4 className="font-semibold text-sm">Matched Keywords ({score.matchedKeywords.length})</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {score.matchedKeywords.slice(0, 10).map((keyword, index) => (
              <Badge key={index} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {keyword}
              </Badge>
            ))}
            {score.matchedKeywords.length > 10 && (
              <Badge variant="outline" className="bg-gray-50">
                +{score.matchedKeywords.length - 10} more
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Missing Keywords */}
      {score.missingKeywords.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-4 h-4 text-red-600" />
            <h4 className="font-semibold text-sm">Missing Keywords ({score.missingKeywords.length})</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {score.missingKeywords.slice(0, 10).map((keyword, index) => (
              <Badge key={index} variant="outline" className="bg-red-50 text-red-700 border-red-200">
                {keyword}
              </Badge>
            ))}
            {score.missingKeywords.length > 10 && (
              <Badge variant="outline" className="bg-gray-50">
                +{score.missingKeywords.length - 10} more
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Improvements */}
      {score.improvements.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <h4 className="font-semibold text-sm">Recommended Improvements</h4>
          </div>
          <div className="space-y-2">
            {score.improvements.map((improvement, index) => (
              <div key={index} className="flex items-start gap-2 text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
                <span className="text-muted-foreground">{improvement}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

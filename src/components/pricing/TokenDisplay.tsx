
import { Zap, FileText, PenTool, MessageSquare } from "lucide-react";
import { useTokens } from "@/hooks/useTokens";

export const TokenDisplay = () => {
  const { tokens } = useTokens();

  const tokenInfo = [
    {
      type: 'Resume',
      count: tokens.resume,
      icon: FileText,
      color: 'text-blue-600'
    },
    {
      type: 'Cover Letter',
      count: tokens.coverLetter,
      icon: PenTool,
      color: 'text-green-600'
    },
    {
      type: 'Interview',
      count: tokens.interview,
      icon: MessageSquare,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="flex items-center gap-4 p-3 bg-white/90 backdrop-blur-sm rounded-lg border border-slate-200 shadow-sm">
      <div className="flex items-center gap-1 text-slate-700">
        <Zap className="h-4 w-4" />
        <span className="text-sm font-medium">Tokens:</span>
      </div>
      {tokenInfo.map((token, index) => (
        <div key={index} className="flex items-center gap-1">
          <token.icon className={`h-4 w-4 ${token.color}`} />
          <span className={`text-sm font-semibold ${token.count === 0 ? 'text-red-500' : 'text-slate-800'}`}>
            {token.count}
          </span>
        </div>
      ))}
    </div>
  );
};

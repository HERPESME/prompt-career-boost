
import { Zap, FileText, PenTool, MessageSquare, Loader2, AlertCircle } from "lucide-react";
import { useSecureTokens } from "@/hooks/useSecureTokens";
import { useAuthUser } from "@/hooks/useAuthUser";

export const SecureTokenDisplay = () => {
  const { tokens, loading } = useSecureTokens();
  const { user, loading: authLoading } = useAuthUser();

  // Don't show anything if auth is still loading
  if (authLoading) {
    return null;
  }

  // Don't show token display if user is not authenticated
  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-3 glass-effect rounded-lg border border-slate-200">
        <Loader2 className="h-4 w-4 animate-spin text-slate-600" />
        <span className="text-sm text-slate-700">Loading tokens...</span>
      </div>
    );
  }

  const tokenInfo = [
    {
      type: 'Resume',
      count: tokens.resume,
      icon: FileText,
      color: 'text-purple-600'
    },
    {
      type: 'Cover Letter',
      count: tokens.coverLetter,
      icon: PenTool,
      color: 'text-blue-600'
    },
    {
      type: 'Interview',
      count: tokens.interview,
      icon: MessageSquare,
      color: 'text-cyan-600'
    }
  ];

  return (
    <div className="flex items-center gap-4 p-3 glass-effect rounded-lg border border-slate-200">
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

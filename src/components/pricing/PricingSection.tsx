import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Star, Zap, Crown } from "lucide-react";
import { useState } from "react";

interface PricingTier {
  name: string;
  price: string;
  resumeTokens: number;
  coverLetterTokens: number;
  interviewTokens: number;
  popular?: boolean;
  icon: any;
  gradient: string;
  bgGradient: string;
}

const pricingTiers: PricingTier[] = [
  {
    name: "Basic",
    price: "$1",
    resumeTokens: 10,
    coverLetterTokens: 15,
    interviewTokens: 20,
    icon: Zap,
    gradient: "from-purple-600 to-purple-700",
    bgGradient: "from-background to-purple-50"
  },
  {
    name: "Standard", 
    price: "$2",
    resumeTokens: 15,
    coverLetterTokens: 20,
    interviewTokens: 30,
    popular: true,
    icon: Star,
    gradient: "from-blue-600 to-cyan-600",
    bgGradient: "from-background to-blue-50"
  },
  {
    name: "Value Pack",
    price: "$5",
    resumeTokens: 60,
    coverLetterTokens: 80,
    interviewTokens: 200,
    icon: Crown,
    gradient: "from-cyan-600 to-blue-600",
    bgGradient: "from-background to-cyan-50"
  }
];

export const PricingSection = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section className="py-24 bg-gradient-to-br from-slate-50 to-purple-50 relative overflow-hidden">
      <div className="absolute inset-0 glass-effect"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-800 rounded-full px-6 py-2 mb-6 font-medium border border-purple-200">
            <Zap className="h-4 w-4" />
            Token-Based Pricing
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-800">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Start free with generous token allowances. Upgrade only when you need more AI-powered career assistance.
          </p>
          
          <div className="mt-8 p-6 glass-effect rounded-2xl border border-slate-200 max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">🎉 Free Starter Tokens</h3>
            <div className="space-y-2 text-sm text-slate-700">
              <div className="flex items-center justify-between">
                <span>Resume Builder</span>
                <span className="font-medium">3 tokens</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Cover Letter Generator</span>
                <span className="font-medium">3 tokens</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Interview Coach</span>
                <span className="font-medium">5 tokens</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {pricingTiers.map((tier, index) => (
            <Card 
              key={index} 
              className={`relative transition-all duration-500 border-0 bg-gradient-to-br ${tier.bgGradient} overflow-hidden glass-effect border border-slate-200/50 cursor-pointer ${
                tier.popular ? 'ring-2 ring-purple-400' : ''
              } ${
                hoveredIndex === null 
                  ? 'hover:shadow-2xl hover:scale-105' 
                  : hoveredIndex === index 
                    ? 'shadow-2xl scale-110 z-20' 
                    : 'blur-sm scale-95 opacity-70'
              }`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                    Most Popular
                  </div>
                </div>
              )}
              
              <CardHeader className="text-center pb-4 relative z-10 pt-8">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${tier.gradient} mb-4 mx-auto shadow-lg`}>
                  <tier.icon className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-slate-800 mb-2">{tier.name}</CardTitle>
                <div className="text-4xl font-bold text-slate-800 mb-2">
                  {tier.price}
                  <span className="text-lg font-normal text-slate-600"> /package</span>
                </div>
              </CardHeader>
              
              <CardContent className="relative z-10 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 glass-effect rounded-lg border border-slate-200/50">
                    <span className="text-slate-700 font-medium">Resume Tokens</span>
                    <span className="text-slate-800 font-bold">{tier.resumeTokens}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 glass-effect rounded-lg border border-slate-200/50">
                    <span className="text-slate-700 font-medium">Cover Letter Tokens</span>
                    <span className="text-slate-800 font-bold">{tier.coverLetterTokens}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 glass-effect rounded-lg border border-slate-200/50">
                    <span className="text-slate-700 font-medium">Interview Coach Tokens</span>
                    <span className="text-slate-800 font-bold">{tier.interviewTokens}</span>
                  </div>
                </div>

                <div className="space-y-3 pt-4">
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-purple-600 flex-shrink-0" />
                    <span className="text-slate-700 text-sm">ATS-optimized resumes</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-purple-600 flex-shrink-0" />
                    <span className="text-slate-700 text-sm">Personalized cover letters</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-purple-600 flex-shrink-0" />
                    <span className="text-slate-700 text-sm">AI interview coaching</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-purple-600 flex-shrink-0" />
                    <span className="text-slate-700 text-sm">Multiple format downloads</span>
                  </div>
                </div>

                <Button 
                  className={`w-full bg-gradient-to-r ${tier.gradient} hover:shadow-lg transition-all duration-300 text-white font-semibold py-3 text-lg`}
                  size="lg"
                >
                  Choose {tier.name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-slate-600 mb-4">Need more tokens? Packages never expire!</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1">
              <Check className="h-4 w-4" />
              No subscription required
            </span>
            <span className="flex items-center gap-1">
              <Check className="h-4 w-4" />
              Tokens never expire
            </span>
            <span className="flex items-center gap-1">
              <Check className="h-4 w-4" />
              Pay only for what you use
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
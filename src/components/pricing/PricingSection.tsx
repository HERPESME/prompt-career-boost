
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Star, Zap, Crown } from "lucide-react";

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
    gradient: "from-warm-brown-500 to-warm-brown-600",
    bgGradient: "from-cream-50 to-warm-brown-50"
  },
  {
    name: "Standard", 
    price: "$2",
    resumeTokens: 15,
    coverLetterTokens: 20,
    interviewTokens: 30,
    popular: true,
    icon: Star,
    gradient: "from-warm-brown-600 to-warm-brown-700",
    bgGradient: "from-warm-brown-50 to-cream-100"
  },
  {
    name: "Value Pack",
    price: "$5",
    resumeTokens: 60,
    coverLetterTokens: 80,
    interviewTokens: 200,
    icon: Crown,
    gradient: "from-warm-brown-700 to-warm-brown-800",
    bgGradient: "from-cream-100 to-warm-brown-100"
  }
];

export const PricingSection = () => {
  return (
    <section className="py-24 bg-gradient-to-br from-cream-50 to-warm-brown-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-white/30"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-warm-brown-100 text-warm-brown-800 rounded-full px-6 py-2 mb-6 font-medium border border-warm-brown-200">
            <Zap className="h-4 w-4" />
            Token-Based Pricing
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-warm-brown-800">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-warm-brown-600 max-w-3xl mx-auto leading-relaxed">
            Start free with generous token allowances. Upgrade only when you need more AI-powered career assistance.
          </p>
          
          <div className="mt-8 p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-warm-brown-200 max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-warm-brown-800 mb-4">🎉 Free Starter Tokens</h3>
            <div className="space-y-2 text-sm text-warm-brown-700">
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
              className={`relative hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br ${tier.bgGradient} hover:scale-105 overflow-hidden backdrop-blur-sm border border-warm-brown-200/50 ${tier.popular ? 'ring-2 ring-warm-brown-400 scale-105' : ''}`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-warm-brown-600 to-warm-brown-700 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                    Most Popular
                  </div>
                </div>
              )}
              
              <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-white/40"></div>
              
              <CardHeader className="text-center pb-4 relative z-10 pt-8">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${tier.gradient} mb-4 mx-auto shadow-lg`}>
                  <tier.icon className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-warm-brown-800 mb-2">{tier.name}</CardTitle>
                <div className="text-4xl font-bold text-warm-brown-800 mb-2">
                  {tier.price}
                  <span className="text-lg font-normal text-warm-brown-600"> /package</span>
                </div>
              </CardHeader>
              
              <CardContent className="relative z-10 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg border border-warm-brown-200/50">
                    <span className="text-warm-brown-700 font-medium">Resume Tokens</span>
                    <span className="text-warm-brown-800 font-bold">{tier.resumeTokens}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg border border-warm-brown-200/50">
                    <span className="text-warm-brown-700 font-medium">Cover Letter Tokens</span>
                    <span className="text-warm-brown-800 font-bold">{tier.coverLetterTokens}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg border border-warm-brown-200/50">
                    <span className="text-warm-brown-700 font-medium">Interview Coach Tokens</span>
                    <span className="text-warm-brown-800 font-bold">{tier.interviewTokens}</span>
                  </div>
                </div>

                <div className="space-y-3 pt-4">
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-warm-brown-600 flex-shrink-0" />
                    <span className="text-warm-brown-700 text-sm">ATS-optimized resumes</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-warm-brown-600 flex-shrink-0" />
                    <span className="text-warm-brown-700 text-sm">Personalized cover letters</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-warm-brown-600 flex-shrink-0" />
                    <span className="text-warm-brown-700 text-sm">AI interview coaching</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-warm-brown-600 flex-shrink-0" />
                    <span className="text-warm-brown-700 text-sm">Multiple format downloads</span>
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
          <p className="text-warm-brown-600 mb-4">Need more tokens? Packages never expire!</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-warm-brown-500">
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

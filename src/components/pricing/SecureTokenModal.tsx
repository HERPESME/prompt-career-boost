
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Zap, Star, Crown, CreditCard } from "lucide-react";
import { useSecureTokens } from "@/hooks/useSecureTokens";

const tokenTypeLabels = {
  'resume': 'Resume Builder',
  'cover-letter': 'Cover Letter Generator',
  'interview': 'Interview Coach'
};

const pricingOptions = [
  {
    name: "Basic Pack",
    price: "$1",
    resumeTokens: 10,
    coverLetterTokens: 15,
    interviewTokens: 20,
    icon: Zap,
    gradient: "from-warm-brown-500 to-warm-brown-600",
    value: "Great for getting started"
  },
  {
    name: "Standard Pack", 
    price: "$2",
    resumeTokens: 15,
    coverLetterTokens: 20,
    interviewTokens: 30,
    popular: true,
    icon: Star,
    gradient: "from-warm-brown-600 to-warm-brown-700",
    value: "Most popular choice"
  },
  {
    name: "Value Pack",
    price: "$5",
    resumeTokens: 60,
    coverLetterTokens: 80,
    interviewTokens: 200,
    icon: Crown,
    gradient: "from-warm-brown-700 to-warm-brown-800",
    value: "Best value for heavy users"
  }
];

export const SecureTokenModal = () => {
  const { isTokenModalOpen, currentTokenType, tokens, closeTokenModal, addTokens } = useSecureTokens();

  const getTokenCount = (option: any, type: string) => {
    switch (type) {
      case 'resume': return option.resumeTokens;
      case 'cover-letter': return option.coverLetterTokens;
      case 'interview': return option.interviewTokens;
      default: return 0;
    }
  };

  const handlePurchase = async (option: any) => {
    // In a real implementation, this would integrate with a payment processor
    // For now, we'll simulate adding tokens
    await addTokens({
      resume: option.resumeTokens,
      coverLetter: option.coverLetterTokens,
      interview: option.interviewTokens
    });
    closeTokenModal();
  };

  const remainingTokens = currentTokenType === 'resume' 
    ? tokens.resume 
    : currentTokenType === 'cover-letter' 
    ? tokens.coverLetter 
    : tokens.interview;

  return (
    <Dialog open={isTokenModalOpen} onOpenChange={closeTokenModal}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center pb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold text-warm-brown-800">
            Out of {tokenTypeLabels[currentTokenType]} Tokens
          </DialogTitle>
          <DialogDescription className="text-lg text-warm-brown-600 mt-2">
            You have <span className="font-semibold text-red-600">{remainingTokens} tokens</span> remaining for {tokenTypeLabels[currentTokenType].toLowerCase()}.
            <br />
            Choose a token package to continue using our AI-powered tools.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            {pricingOptions.map((option, index) => (
              <Card 
                key={index}
                className={`relative hover:shadow-lg transition-all duration-300 border-2 ${
                  option.popular 
                    ? 'border-warm-brown-400 bg-gradient-to-br from-warm-brown-50 to-cream-100' 
                    : 'border-warm-brown-200 hover:border-warm-brown-300'
                }`}
              >
                {option.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-warm-brown-600 to-warm-brown-700 text-white px-4 py-1 rounded-full text-xs font-semibold">
                      RECOMMENDED
                    </div>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4 pt-6">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${option.gradient} mb-3 mx-auto`}>
                    <option.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg font-bold text-warm-brown-800">{option.name}</CardTitle>
                  <div className="text-2xl font-bold text-warm-brown-800">
                    {option.price}
                  </div>
                  <p className="text-xs text-warm-brown-600">{option.value}</p>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="bg-warm-brown-100 p-3 rounded-lg border border-warm-brown-200">
                    <div className="text-sm text-warm-brown-700 mb-1">You'll get:</div>
                    <div className="font-bold text-warm-brown-800 text-lg">
                      +{getTokenCount(option, currentTokenType)} {tokenTypeLabels[currentTokenType]} tokens
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-xs text-warm-brown-600">
                    <div className="flex justify-between">
                      <span>Resume tokens:</span>
                      <span className="font-medium">{option.resumeTokens}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cover Letter tokens:</span>
                      <span className="font-medium">{option.coverLetterTokens}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Interview tokens:</span>
                      <span className="font-medium">{option.interviewTokens}</span>
                    </div>
                  </div>

                  <Button 
                    className={`w-full bg-gradient-to-r ${option.gradient} hover:shadow-md transition-all duration-300 text-white font-semibold`}
                    size="sm"
                    onClick={() => handlePurchase(option)}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Buy Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="bg-cream-100 p-6 rounded-xl border border-warm-brown-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <h3 className="font-semibold text-warm-brown-800">Why Choose Token Packages?</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-warm-brown-700">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-warm-brown-400 rounded-full"></div>
                <span>Tokens never expire</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-warm-brown-400 rounded-full"></div>
                <span>No monthly subscriptions</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-warm-brown-400 rounded-full"></div>
                <span>Pay only for what you use</span>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <Button 
              variant="outline" 
              onClick={closeTokenModal}
              className="border-warm-brown-300 text-warm-brown-700 hover:bg-warm-brown-50"
            >
              Maybe Later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

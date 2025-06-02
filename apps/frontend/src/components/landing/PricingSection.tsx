import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check } from 'lucide-react'

const plans = [
  {
    title: 'Starter',
    price: 'Free',
    originalPrice: null,
    subtitle: '/forever',
    features: [
      'Basic practice questions',
      'Basic progress tracking',
      'Community support',
    ],
    button: 'Get Started',
    highlight: false,
    comingSoon: false,
  },
  {
    title: 'Rank Booster',
    price: '₹1999',
    originalPrice: '₹2999',
    subtitle: '/year',
    features: [
      'Unlimited AI-powered practice',
      'Advanced mistake tracking',
      'Personalized daily suggestions',
      'Detailed mastery analytics',
      'Topic-wise prioritization',
      'Priority support',
    ],
    button: 'Start Free Trial',
    highlight: true,
    comingSoon: false,
  },
  {
    title: 'Pro',
    price: '₹4999',
    originalPrice: null,
    subtitle: '/year',
    features: [
      'Everything in Rank Booster',
      'AI Mentor Intelligence',
      '1-on-1 doubt sessions',
      'Mock test analysis',
      'Exam strategy guidance',
    ],
    button: 'Notify Me',
    highlight: false,
    comingSoon: true,
  },
];

const PlanCard = ({ plan }) => {
  return (
    <Card className={`relative transition-all duration-300 hover:shadow-lg flex flex-col  h-full ${
      plan.highlight ? 'border-2 border-primary-500 shadow-lg' : ''
    }`}>
      {/* Badges */}
      {plan.highlight && (
        <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary-100 text-primary-700 hover:bg-primary-100">
          Most Popular
        </Badge>
      )}
      
      {plan.comingSoon && (
        <Badge 
          variant="secondary" 
          className="absolute -top-2 left-1/2 transform -translate-x-1/2"
        >
          Coming Soon
        </Badge>
      )}

      <CardHeader className="text-center pb-4">
        <h3 className="text-xl font-bold text-gray-900 mb-4">{plan.title}</h3>
        
        {/* Price Section */}
        <div className="flex items-baseline justify-center mb-2">
          <span className="text-3xl font-bold text-gray-900">
            {plan.price}
          </span>
          <span className="text-gray-500 ml-1 text-sm">{plan.subtitle}</span>
        </div>
        
        {/* Original Price */}
        {plan.originalPrice && (
          <div className="text-sm text-gray-500">
            <span className="line-through">{plan.originalPrice}</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 pb-8 mx-5">
        {/* Features */}
        <ul className="space-y-3">
          {plan.features.map((feature, i) => (
            <li key={i} className="flex items-start space-x-3">
              <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center mt-0.5 flex-shrink-0">
                <Check className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm text-gray-700 leading-relaxed">
                {feature}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="pt-0 mt-auto">
        <Button
          className={`w-full ${
            plan.highlight 
              ? 'bg-primary-600 hover:bg-primary-700' 
              : plan.comingSoon 
                ? 'bg-gray-300 text-gray-500 hover:bg-gray-300' 
                : 'bg-primary-100 hover:bg-primary-200 text-gray-700'
          }`}
          disabled={plan.comingSoon}
        >
          {plan.button}
        </Button>
      </CardFooter>
    </Card>
  );
};

const PricingSection = () => {
  return (
    <section className="py-16  min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Pricing
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose the perfect plan to accelerate your NEET/JEE preparation journey
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, i) => (
            <PlanCard key={i} plan={plan} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
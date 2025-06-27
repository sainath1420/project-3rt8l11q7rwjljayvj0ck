import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Rocket, Globe, Target, Lightbulb } from 'lucide-react';
import { CompanyData } from '@/pages/Index';

interface CompanyAnalysisFormProps {
  onSubmit: (data: CompanyData) => void;
}

const marketCategories = [
  'SaaS',
  'E-commerce',
  'FinTech',
  'HealthTech',
  'EdTech',
  'MarTech',
  'PropTech',
  'FoodTech',
  'Gaming',
  'Social Media',
  'Productivity',
  'Security',
  'Other'
];

const exampleCompanies = [
  {
    name: 'Slack',
    website: 'https://slack.com',
    description: 'Team communication and collaboration platform',
    category: 'SaaS'
  },
  {
    name: 'Shopify',
    website: 'https://shopify.com',
    description: 'E-commerce platform for online stores',
    category: 'E-commerce'
  },
  {
    name: 'Stripe',
    website: 'https://stripe.com',
    description: 'Online payment processing platform',
    category: 'FinTech'
  }
];

export const CompanyAnalysisForm: React.FC<CompanyAnalysisFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<CompanyData>({
    name: '',
    website_url: '',
    product_description: '',
    market_category: ''
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.website_url || !formData.product_description || !formData.market_category) {
      return;
    }

    setIsLoading(true);
    onSubmit(formData);
  };

  const handleExampleClick = (example: typeof exampleCompanies[0]) => {
    setFormData({
      name: example.name,
      website_url: example.website,
      product_description: example.description,
      market_category: example.category
    });
  };

  const isFormValid = formData.name && formData.website_url && formData.product_description && formData.market_category;

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Rocket className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Start Your Competitive Analysis
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Enter your company details to get instant competitive intelligence
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Name */}
            <div className="space-y-2">
              <Label htmlFor="company-name" className="text-sm font-medium text-gray-700">
                Company Name *
              </Label>
              <Input
                id="company-name"
                placeholder="e.g., Slack, Shopify, Stripe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-12"
              />
            </div>

            {/* Website URL */}
            <div className="space-y-2">
              <Label htmlFor="website" className="text-sm font-medium text-gray-700">
                Website URL *
              </Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="website"
                  type="url"
                  placeholder="https://yourcompany.com"
                  value={formData.website_url}
                  onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                  className="h-12 pl-11"
                />
              </div>
            </div>

            {/* Market Category */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium text-gray-700">
                Market Category *
              </Label>
              <Select value={formData.market_category} onValueChange={(value) => setFormData({ ...formData, market_category: value })}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select your market category" />
                </SelectTrigger>
                <SelectContent>
                  {marketCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Product Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                Product Description *
              </Label>
              <Textarea
                id="description"
                placeholder="Briefly describe your main product or service..."
                value={formData.product_description}
                onChange={(e) => setFormData({ ...formData, product_description: e.target.value })}
                className="min-h-[100px] resize-none"
              />
              <p className="text-xs text-gray-500">
                Describe what your company does and who your target customers are
              </p>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              disabled={!isFormValid || isLoading}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Starting Analysis...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Target className="w-5 h-5" />
                  <span>Analyze Competition</span>
                </div>
              )}
            </Button>
          </form>

          {/* Example Companies */}
          <div className="pt-6 border-t">
            <div className="flex items-center space-x-2 mb-4">
              <Lightbulb className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium text-gray-700">Try these examples:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {exampleCompanies.map((example, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors px-3 py-1"
                  onClick={() => handleExampleClick(example)}
                >
                  {example.name}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
'use client';
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { toast } from 'sonner';

type Company = {
  id: string;
  name: string;
  domain: string;
  industry: string;
  subIndustry?: string;
  description?: string;
  founded?: number;
  employees?: number;
  employeeRange?: string;
  revenue?: number;
  revenueRange?: string;
  location: {
    city?: string;
    state?: string;
    country?: string;
    address?: string;
  };
  socialProfiles: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
  technologies: Array<{
    name: string;
    category?: string;
  }>;
  keywords: string[];
  phoneNumbers?: string;
  parentCompany?: string;
  subsidiaries: string[];
  fundingInfo: {
    totalFunding?: number;
    latestFunding?: string;
    fundingStage?: string;
  };
  marketCap?: number;
  stockSymbol?: string;
  source: string;
  enrichedAt: string;
};

type CompanySearchForm = {
  domain: string;
  companyName: string;
  apolloId: string;
};

export default function CompanyEnrichment() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchForm, setSearchForm] = useState<CompanySearchForm>({
    domain: '',
    companyName: '',
    apolloId: ''
  });

  const handleSearch = async () => {
    if (!searchForm.domain && !searchForm.companyName && !searchForm.apolloId) {
      toast.error('Please fill at least one search field');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/apollo/company-enrichment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to enrich company data');
      }

      if (data.companies && data.companies.length > 0) {
        setCompanies(data.companies);
        toast.success(`Found ${data.companies.length} companies! Credits used: ${data.creditsUsed}`);
        
        // Reset form
        setSearchForm({ domain: '', companyName: '', apolloId: '' });
      } else {
        toast.info('No companies found with the given criteria');
        setCompanies([]);
      }
    } catch (error: any) {
      console.error('Company enrichment error:', error);
      toast.error(error.message || 'Failed to enrich company data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(amount);
  };

  const formatNumber = (num: number | undefined) => {
    if (!num) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(num);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Company Enrichment</h2>
        <Badge variant="outline" className="text-sm">
          Apollo.io Integration
        </Badge>
      </div>

      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle>Search Companies</CardTitle>
          <p className="text-sm text-gray-600">
            Get detailed company information including financials, technologies, and insights. Cost: $0.35 per search
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Domain</label>
              <Input
                value={searchForm.domain}
                onChange={(e) => setSearchForm(prev => ({ ...prev, domain: e.target.value }))}
                placeholder="example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Company Name</label>
              <Input
                value={searchForm.companyName}
                onChange={(e) => setSearchForm(prev => ({ ...prev, companyName: e.target.value }))}
                placeholder="Example Corp"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Apollo ID</label>
              <Input
                value={searchForm.apolloId}
                onChange={(e) => setSearchForm(prev => ({ ...prev, apolloId: e.target.value }))}
                placeholder="12345"
              />
            </div>
          </div>
          
          <Button
            onClick={handleSearch}
            disabled={isLoading}
            className="mt-4 bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? 'Enriching...' : 'Enrich Company Data (1 Credit)'}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {companies.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold">Company Results</h3>
          
          {companies.map((company) => (
            <Card key={company.id} className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl text-blue-900">{company.name}</CardTitle>
                    <p className="text-blue-700 mt-1">{company.domain}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">{company.industry}</Badge>
                      {company.subIndustry && (
                        <Badge variant="secondary">{company.subIndustry}</Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="default" className="mb-2">
                      {company.source}
                    </Badge>
                    <p className="text-sm text-gray-600">
                      Enriched: {new Date(company.enrichedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg border-b pb-2">Company Overview</h4>
                    
                    {company.description && (
                      <div>
                        <h5 className="font-medium text-gray-700 mb-1">Description</h5>
                        <p className="text-sm text-gray-600">{company.description}</p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium text-gray-700 mb-1">Founded</h5>
                        <p className="text-sm">{company.founded || 'N/A'}</p>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-700 mb-1">Employees</h5>
                        <p className="text-sm">
                          {company.employeeRange || formatNumber(company.employees)}
                        </p>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-700 mb-1">Revenue</h5>
                        <p className="text-sm">
                          {company.revenueRange || formatCurrency(company.revenue)}
                        </p>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-700 mb-1">Market Cap</h5>
                        <p className="text-sm">{formatCurrency(company.marketCap)}</p>
                      </div>
                    </div>

                    {/* Location */}
                    <div>
                      <h5 className="font-medium text-gray-700 mb-1">Location</h5>
                      <p className="text-sm">
                        {[
                          company.location.city,
                          company.location.state,
                          company.location.country
                        ].filter(Boolean).join(', ') || 'N/A'}
                      </p>
                      {company.location.address && (
                        <p className="text-xs text-gray-500 mt-1">{company.location.address}</p>
                      )}
                    </div>

                    {/* Contact Info */}
                    <div>
                      <h5 className="font-medium text-gray-700 mb-1">Contact</h5>
                      {company.phoneNumbers && (
                        <p className="text-sm">📞 {company.phoneNumbers}</p>
                      )}
                      <div className="flex gap-2 mt-2">
                        {company.socialProfiles.linkedin && (
                          <a
                            href={company.socialProfiles.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            LinkedIn
                          </a>
                        )}
                        {company.socialProfiles.twitter && (
                          <a
                            href={company.socialProfiles.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-600 text-sm"
                          >
                            Twitter
                          </a>
                        )}
                        {company.socialProfiles.facebook && (
                          <a
                            href={company.socialProfiles.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-800 hover:text-blue-900 text-sm"
                          >
                            Facebook
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Technologies & Additional Info */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg border-b pb-2">Technologies & Insights</h4>
                    
                    {/* Technologies */}
                    {company.technologies.length > 0 && (
                      <div>
                        <h5 className="font-medium text-gray-700 mb-2">Technology Stack</h5>
                        <div className="flex flex-wrap gap-2">
                          {company.technologies.map((tech, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tech.name}
                              {tech.category && (
                                <span className="ml-1 text-gray-500">({tech.category})</span>
                              )}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Keywords */}
                    {company.keywords.length > 0 && (
                      <div>
                        <h5 className="font-medium text-gray-700 mb-2">Keywords</h5>
                        <div className="flex flex-wrap gap-1">
                          {company.keywords.slice(0, 10).map((keyword, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                          {company.keywords.length > 10 && (
                            <Badge variant="secondary" className="text-xs">
                              +{company.keywords.length - 10} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Funding Information */}
                    {(company.fundingInfo.totalFunding || company.fundingInfo.fundingStage) && (
                      <div>
                        <h5 className="font-medium text-gray-700 mb-2">Funding Information</h5>
                        <div className="space-y-1">
                          {company.fundingInfo.totalFunding && (
                            <p className="text-sm">
                              Total Funding: {formatCurrency(company.fundingInfo.totalFunding)}
                            </p>
                          )}
                          {company.fundingInfo.fundingStage && (
                            <p className="text-sm">Stage: {company.fundingInfo.fundingStage}</p>
                          )}
                          {company.fundingInfo.latestFunding && (
                            <p className="text-sm">
                              Latest: {new Date(company.fundingInfo.latestFunding).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Corporate Structure */}
                    {(company.parentCompany || company.subsidiaries.length > 0 || company.stockSymbol) && (
                      <div>
                        <h5 className="font-medium text-gray-700 mb-2">Corporate Structure</h5>
                        <div className="space-y-1">
                          {company.stockSymbol && (
                            <p className="text-sm">Stock Symbol: <Badge variant="outline">{company.stockSymbol}</Badge></p>
                          )}
                          {company.parentCompany && (
                            <p className="text-sm">Parent Company: {company.parentCompany}</p>
                          )}
                          {company.subsidiaries.length > 0 && (
                            <div>
                              <p className="text-sm font-medium">Subsidiaries:</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {company.subsidiaries.slice(0, 5).map((sub, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {sub}
                                  </Badge>
                                ))}
                                {company.subsidiaries.length > 5 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{company.subsidiaries.length - 5} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { CheckCircle, AlertCircle, TrendingDown, Users, Shield, Zap } from "lucide-react";

interface DetailedResult {
  technique: string;
  recordsSuppressed: number;
  totalRecords: number;
  informationLoss: number;
  equivalenceClasses?: number;
  avgGroupSize?: number;
  privacyRisk?: number;
  diverseClasses?: number;
  violatingClasses?: number;
  avgDiversity?: number;
  satisfyingClasses?: number;
  avgDistance?: number;
  maxDistance?: number;
}

export function PrivacyResultsDetail({ result }: { result: DetailedResult }) {
  const recordsRetained = result.totalRecords - result.recordsSuppressed;
  const retentionRate = ((recordsRetained / result.totalRecords) * 100).toFixed(1);

  // Chart data
  const suppressionData = [
    { name: "Retained", value: recordsRetained, percentage: parseFloat(retentionRate) },
    { name: "Suppressed", value: result.recordsSuppressed, percentage: 100 - parseFloat(retentionRate) },
  ];

  const privacyMetricsData = result.technique === "k-anonymity" && result.equivalenceClasses
    ? [
        { metric: "Equivalence Classes", value: result.equivalenceClasses || 0 },
        { metric: "Avg Group Size", value: Math.round(result.avgGroupSize || 0) },
        { metric: "Privacy Risk", value: Math.round((result.privacyRisk || 0) * 100) / 100 },
      ]
    : result.technique === "l-diversity" && result.avgDiversity
    ? [
        { metric: "Diverse Classes", value: result.diverseClasses || 0 },
        { metric: "Violating Classes", value: result.violatingClasses || 0 },
        { metric: "Avg Diversity", value: Math.round((result.avgDiversity || 0) * 100) / 100 },
      ]
    : result.technique === "t-closeness" && result.avgDistance
    ? [
        { metric: "Satisfying Classes", value: result.satisfyingClasses || 0 },
        { metric: "Violating Classes", value: result.violatingClasses || 0 },
        { metric: "Avg Distance", value: Math.round((result.avgDistance || 0) * 100) / 100 },
        { metric: "Max Distance", value: Math.round((result.maxDistance || 0) * 100) / 100 },
      ]
    : [];

  const getPrivacyLevel = () => {
    if (result.informationLoss > 0.5) return { level: "High", color: "text-destructive", bg: "bg-destructive/10" };
    if (result.informationLoss > 0.2) return { level: "Medium", color: "text-yellow-600", bg: "bg-yellow-100/20" };
    return { level: "Good", color: "text-green-600", bg: "bg-green-100/20" };
  };

  const privacy = getPrivacyLevel();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Detailed Privacy Enhancement Results
          </CardTitle>
          <CardDescription>Comprehensive analysis of {result.technique.replace("-", " ")} application</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                Records Retained
              </div>
              <p className="text-2xl font-bold">{recordsRetained}</p>
              <p className="text-xs text-muted-foreground">{retentionRate}% retention rate</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingDown className="h-4 w-4" />
                Information Loss
              </div>
              <p className="text-2xl font-bold">{(result.informationLoss * 100).toFixed(1)}%</p>
              <Badge className={`${privacy.bg} ${privacy.color} text-xs`}>{privacy.level}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                Records Suppressed
              </div>
              <p className="text-2xl font-bold">{result.recordsSuppressed}</p>
              <p className="text-xs text-muted-foreground">{((result.recordsSuppressed / result.totalRecords) * 100).toFixed(1)}% of total</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Zap className="h-4 w-4" />
                Total Records
              </div>
              <p className="text-2xl font-bold">{result.totalRecords}</p>
              <p className="text-xs text-muted-foreground">Original dataset size</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Records Suppression Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Records Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={suppressionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `${value} records`} />
              <Legend />
              <Bar dataKey="value" fill="#3b82f6" name="Count" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Privacy-Specific Metrics */}
      {privacyMetricsData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Technique-Specific Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={privacyMetricsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="metric" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8b5cf6" name="Value" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Privacy Metrics Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Summary Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
              <span className="text-sm font-medium">Information Loss</span>
              <span className="text-sm">{(result.informationLoss * 100).toFixed(2)}%</span>
            </div>
            {result.technique === "k-anonymity" && result.avgGroupSize && (
              <>
                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                  <span className="text-sm font-medium">Equivalence Classes</span>
                  <span className="text-sm">{result.equivalenceClasses}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                  <span className="text-sm font-medium">Average Group Size</span>
                  <span className="text-sm">{result.avgGroupSize?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                  <span className="text-sm font-medium">Privacy Risk</span>
                  <span className="text-sm">{(result.privacyRisk || 0).toFixed(4)}</span>
                </div>
              </>
            )}
            {result.technique === "l-diversity" && result.avgDiversity && (
              <>
                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                  <span className="text-sm font-medium">Diverse Classes</span>
                  <span className="text-sm">{result.diverseClasses}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                  <span className="text-sm font-medium">Violating Classes</span>
                  <span className="text-sm">{result.violatingClasses}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                  <span className="text-sm font-medium">Average Diversity</span>
                  <span className="text-sm">{result.avgDiversity?.toFixed(2)}</span>
                </div>
              </>
            )}
            {result.technique === "t-closeness" && result.avgDistance !== undefined && (
              <>
                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                  <span className="text-sm font-medium">Satisfying Classes</span>
                  <span className="text-sm">{result.satisfyingClasses}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                  <span className="text-sm font-medium">Average Distance</span>
                  <span className="text-sm">{result.avgDistance?.toFixed(4)}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                  <span className="text-sm font-medium">Maximum Distance</span>
                  <span className="text-sm">{result.maxDistance?.toFixed(4)}</span>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Status and Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Assessment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm">
            <strong>{result.technique.replace("-", " ")}</strong> has been successfully applied to your dataset.
          </p>
          <p className="text-sm text-muted-foreground">
            {result.recordsSuppressed === 0
              ? "All records were retained with no suppression."
              : `${result.recordsSuppressed} records were suppressed or generalized to maintain privacy.`}
          </p>
          <p className="text-sm text-muted-foreground">
            The resulting dataset has {(result.informationLoss * 100).toFixed(1)}% information loss, which represents the trade-off between privacy and data utility.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

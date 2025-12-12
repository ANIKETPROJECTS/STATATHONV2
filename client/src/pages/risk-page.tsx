import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  Shield,
  Users,
  Fingerprint,
  BarChart3,
  Play,
  Loader2,
  CheckCircle,
  XCircle,
  Info,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Dataset, RiskAssessment } from "@shared/schema";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { ScrollArea } from "@/components/ui/scroll-area";

const attackScenarios = [
  { id: "prosecutor", label: "Prosecutor Attack", description: "Attacker knows target is in the dataset" },
  { id: "journalist", label: "Journalist Attack", description: "Attacker randomly selects records" },
  { id: "marketer", label: "Marketer Attack", description: "Attacker targets multiple records" },
];

export default function RiskPage() {
  const { toast } = useToast();
  const [selectedDataset, setSelectedDataset] = useState<string>("");
  const [quasiIdentifiers, setQuasiIdentifiers] = useState<string[]>([]);
  const [sensitiveAttributes, setSensitiveAttributes] = useState<string[]>([]);
  const [kThreshold, setKThreshold] = useState([5]);
  const [sampleSize, setSampleSize] = useState([100]);
  const [selectedAttacks, setSelectedAttacks] = useState<string[]>(["prosecutor"]);
  const [currentAssessment, setCurrentAssessment] = useState<RiskAssessment | null>(null);

  const { data: datasets, isLoading: datasetsLoading } = useQuery<Dataset[]>({
    queryKey: ["/api/datasets"],
  });

  const { data: assessments, isLoading: assessmentsLoading } = useQuery<RiskAssessment[]>({
    queryKey: ["/api/risk/assessments"],
  });

  const selectedDatasetObj = datasets?.find((d) => d.id.toString() === selectedDataset);

  const assessMutation = useMutation({
    mutationFn: async (params: {
      datasetId: number;
      quasiIdentifiers: string[];
      sensitiveAttributes: string[];
      kThreshold: number;
      sampleSize: number;
      attackScenarios: string[];
    }) => {
      const res = await apiRequest("POST", "/api/risk/assess", params);
      return res.json();
    },
    onSuccess: (data) => {
      setCurrentAssessment(data);
      queryClient.invalidateQueries({ queryKey: ["/api/risk/assessments"] });
      toast({
        title: "Assessment complete",
        description: `Risk level: ${data.riskLevel}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Assessment failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleRunAssessment = () => {
    if (!selectedDataset || quasiIdentifiers.length === 0) {
      toast({
        title: "Configuration required",
        description: "Please select a dataset and at least one quasi-identifier.",
        variant: "destructive",
      });
      return;
    }

    assessMutation.mutate({
      datasetId: parseInt(selectedDataset),
      quasiIdentifiers,
      sensitiveAttributes,
      kThreshold: kThreshold[0],
      sampleSize: sampleSize[0],
      attackScenarios: selectedAttacks,
    });
  };

  const toggleColumn = (column: string, type: "quasi" | "sensitive") => {
    if (type === "quasi") {
      setQuasiIdentifiers((prev) =>
        prev.includes(column) ? prev.filter((c) => c !== column) : [...prev, column]
      );
    } else {
      setSensitiveAttributes((prev) =>
        prev.includes(column) ? prev.filter((c) => c !== column) : [...prev, column]
      );
    }
  };

  const toggleAttack = (attackId: string) => {
    setSelectedAttacks((prev) =>
      prev.includes(attackId) ? prev.filter((a) => a !== attackId) : [...prev, attackId]
    );
  };

  const getRiskColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case "low":
        return "text-chart-4";
      case "medium":
        return "text-chart-5";
      case "high":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  const getRiskBadgeVariant = (level: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (level?.toLowerCase()) {
      case "low":
        return "secondary";
      case "medium":
        return "outline";
      case "high":
        return "destructive";
      default:
        return "outline";
    }
  };

  const equivalenceClassData = currentAssessment?.equivalenceClasses as any;
  const chartData = equivalenceClassData?.histogram || [];
  
  const riskDistData = [
    { name: "Safe Records", value: 100 - (currentAssessment?.overallRisk || 0) * 100, color: "hsl(var(--chart-4))" },
    { name: "At Risk Records", value: (currentAssessment?.overallRisk || 0) * 100, color: "hsl(var(--destructive))" },
  ];

  return (
    <DashboardLayout title="Risk Assessment" breadcrumbs={[{ label: "Risk Assessment" }]}>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Configuration
              </CardTitle>
              <CardDescription>
                Configure risk assessment parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Select Dataset</Label>
                <Select value={selectedDataset} onValueChange={setSelectedDataset}>
                  <SelectTrigger data-testid="select-dataset">
                    <SelectValue placeholder="Choose a dataset" />
                  </SelectTrigger>
                  <SelectContent>
                    {datasets?.map((dataset) => (
                      <SelectItem key={dataset.id} value={dataset.id.toString()}>
                        {dataset.originalName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedDatasetObj && (
                <>
                  <div className="space-y-3">
                    <Label>Quasi-Identifiers</Label>
                    <ScrollArea className="h-[120px] rounded-md border p-3">
                      <div className="space-y-2">
                        {selectedDatasetObj.columns?.map((col) => (
                          <div key={col} className="flex items-center gap-2">
                            <Checkbox
                              id={`qi-${col}`}
                              checked={quasiIdentifiers.includes(col)}
                              onCheckedChange={() => toggleColumn(col, "quasi")}
                            />
                            <label htmlFor={`qi-${col}`} className="text-sm cursor-pointer">
                              {col}
                            </label>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>

                  <div className="space-y-3">
                    <Label>Sensitive Attributes</Label>
                    <ScrollArea className="h-[120px] rounded-md border p-3">
                      <div className="space-y-2">
                        {selectedDatasetObj.columns?.map((col) => (
                          <div key={col} className="flex items-center gap-2">
                            <Checkbox
                              id={`sa-${col}`}
                              checked={sensitiveAttributes.includes(col)}
                              onCheckedChange={() => toggleColumn(col, "sensitive")}
                            />
                            <label htmlFor={`sa-${col}`} className="text-sm cursor-pointer">
                              {col}
                            </label>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>K-Anonymity Threshold</Label>
                  <Badge variant="outline">{kThreshold[0]}</Badge>
                </div>
                <Slider
                  value={kThreshold}
                  onValueChange={setKThreshold}
                  min={2}
                  max={20}
                  step={1}
                  data-testid="slider-k-threshold"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Sample Size</Label>
                  <Badge variant="outline">{sampleSize[0]}%</Badge>
                </div>
                <Slider
                  value={sampleSize}
                  onValueChange={setSampleSize}
                  min={10}
                  max={100}
                  step={10}
                  data-testid="slider-sample-size"
                />
              </div>

              <div className="space-y-3">
                <Label>Attack Scenarios</Label>
                <div className="space-y-2">
                  {attackScenarios.map((attack) => (
                    <div key={attack.id} className="flex items-start gap-2">
                      <Checkbox
                        id={attack.id}
                        checked={selectedAttacks.includes(attack.id)}
                        onCheckedChange={() => toggleAttack(attack.id)}
                      />
                      <div className="grid gap-0.5">
                        <label htmlFor={attack.id} className="text-sm font-medium cursor-pointer">
                          {attack.label}
                        </label>
                        <p className="text-xs text-muted-foreground">{attack.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                className="w-full"
                onClick={handleRunAssessment}
                disabled={assessMutation.isPending || !selectedDataset || quasiIdentifiers.length === 0}
                data-testid="button-run-assessment"
              >
                {assessMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Run Assessment
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {currentAssessment ? (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
                    <CardTitle className="text-sm font-medium">Overall Risk</CardTitle>
                    <Shield className="h-5 w-5 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-3xl font-bold ${getRiskColor(currentAssessment.riskLevel)}`}>
                      {((currentAssessment.overallRisk || 0) * 100).toFixed(1)}%
                    </div>
                    <Badge className="mt-2" variant={getRiskBadgeVariant(currentAssessment.riskLevel)}>
                      {currentAssessment.riskLevel} Risk
                    </Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
                    <CardTitle className="text-sm font-medium">K-Anonymity Violations</CardTitle>
                    <XCircle className="h-5 w-5 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-destructive">
                      {currentAssessment.violations}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Records below k={kThreshold[0]}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
                    <CardTitle className="text-sm font-medium">Unique Records</CardTitle>
                    <Fingerprint className="h-5 w-5 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-chart-5">
                      {currentAssessment.uniqueRecords}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Highest re-identification risk
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Equivalence Class Distribution</CardTitle>
                    <CardDescription>Size distribution of equivalence classes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData.length ? chartData : [
                          { size: "1", count: currentAssessment.uniqueRecords },
                          { size: "2-4", count: Math.floor(currentAssessment.violations * 0.3) },
                          { size: "5-10", count: Math.floor(currentAssessment.violations * 0.4) },
                          { size: ">10", count: Math.floor(currentAssessment.violations * 0.3) },
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="size" className="text-xs" />
                          <YAxis className="text-xs" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                            }}
                          />
                          <Bar dataKey="count" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Risk Distribution</CardTitle>
                    <CardDescription>Proportion of records at risk</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={riskDistData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {riskDistData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-6 mt-4">
                      {riskDistData.map((item) => (
                        <div key={item.name} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-xs text-muted-foreground">{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {currentAssessment.recommendations?.map((rec, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                        <CheckCircle className="h-5 w-5 text-chart-4 mt-0.5 shrink-0" />
                        <p className="text-sm">{rec}</p>
                      </div>
                    )) || (
                      <>
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                          <CheckCircle className="h-5 w-5 text-chart-4 mt-0.5 shrink-0" />
                          <p className="text-sm">Consider increasing k-anonymity threshold to reduce unique records</p>
                        </div>
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                          <CheckCircle className="h-5 w-5 text-chart-4 mt-0.5 shrink-0" />
                          <p className="text-sm">Apply generalization to quasi-identifiers with high cardinality</p>
                        </div>
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                          <CheckCircle className="h-5 w-5 text-chart-4 mt-0.5 shrink-0" />
                          <p className="text-sm">Consider suppressing records that cannot meet the k-threshold</p>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="lg:col-span-2">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <BarChart3 className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Assessment Results</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  Configure the assessment parameters on the left and click "Run Assessment" to analyze your dataset's re-identification risks.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

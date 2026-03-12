"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Stamp,
  ShieldCheck,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface EStamp {
  id: string;
  certificateNumber: string;
  jurisdiction: string;
  stampType: string;
  stampDuty: number;
  verified: boolean;
  verifiedAt?: string;
  createdAt: string;
}

interface EStampFormProps {
  contractId: string;
}

const INDIAN_JURISDICTIONS = [
  { value: "ANDHRA_PRADESH", label: "Andhra Pradesh" },
  { value: "ARUNACHAL_PRADESH", label: "Arunachal Pradesh" },
  { value: "ASSAM", label: "Assam" },
  { value: "BIHAR", label: "Bihar" },
  { value: "CHHATTISGARH", label: "Chhattisgarh" },
  { value: "DELHI", label: "Delhi" },
  { value: "GOA", label: "Goa" },
  { value: "GUJARAT", label: "Gujarat" },
  { value: "HARYANA", label: "Haryana" },
  { value: "HIMACHAL_PRADESH", label: "Himachal Pradesh" },
  { value: "JHARKHAND", label: "Jharkhand" },
  { value: "KARNATAKA", label: "Karnataka" },
  { value: "KERALA", label: "Kerala" },
  { value: "MADHYA_PRADESH", label: "Madhya Pradesh" },
  { value: "MAHARASHTRA", label: "Maharashtra" },
  { value: "MANIPUR", label: "Manipur" },
  { value: "MEGHALAYA", label: "Meghalaya" },
  { value: "MIZORAM", label: "Mizoram" },
  { value: "NAGALAND", label: "Nagaland" },
  { value: "ODISHA", label: "Odisha" },
  { value: "PUNJAB", label: "Punjab" },
  { value: "RAJASTHAN", label: "Rajasthan" },
  { value: "SIKKIM", label: "Sikkim" },
  { value: "TAMIL_NADU", label: "Tamil Nadu" },
  { value: "TELANGANA", label: "Telangana" },
  { value: "TRIPURA", label: "Tripura" },
  { value: "UTTAR_PRADESH", label: "Uttar Pradesh" },
  { value: "UTTARAKHAND", label: "Uttarakhand" },
  { value: "WEST_BENGAL", label: "West Bengal" },
  { value: "JAMMU_AND_KASHMIR", label: "Jammu & Kashmir" },
  { value: "LADAKH", label: "Ladakh" },
  { value: "CHANDIGARH", label: "Chandigarh" },
  { value: "PUDUCHERRY", label: "Puducherry" },
];

const STAMP_TYPES = [
  { value: "JUDICIAL", label: "Judicial" },
  { value: "NON_JUDICIAL", label: "Non-Judicial" },
  { value: "COMMERCIAL", label: "Commercial" },
];

export default function EStampForm({ contractId }: EStampFormProps) {
  const [stamps, setStamps] = useState<EStamp[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const [jurisdiction, setJurisdiction] = useState("");
  const [stampType, setStampType] = useState("");
  const [stampDuty, setStampDuty] = useState("");

  const fetchStamps = useCallback(async () => {
    try {
      const res = await fetch(`/api/contracts/${contractId}/estamp`);
      if (res.ok) {
        const data = await res.json();
        setStamps(data);
      }
    } catch {
      // API may not be available
    } finally {
      setLoading(false);
    }
  }, [contractId]);

  useEffect(() => {
    fetchStamps();
  }, [fetchStamps]);

  const handleApply = async () => {
    if (!jurisdiction || !stampType || !stampDuty) {
      toast.error("Please fill in all fields");
      return;
    }

    const dutyAmount = parseFloat(stampDuty);
    if (isNaN(dutyAmount) || dutyAmount <= 0) {
      toast.error("Please enter a valid stamp duty amount");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/contracts/${contractId}/estamp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jurisdiction,
          stampType,
          stampDuty: dutyAmount,
        }),
      });

      if (res.ok) {
        toast.success("E-Stamp applied successfully");
        setJurisdiction("");
        setStampType("");
        setStampDuty("");
        fetchStamps();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Failed to apply e-stamp");
      }
    } catch {
      toast.error("Failed to apply e-stamp");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async (stamp: EStamp) => {
    setVerifyingId(stamp.id);
    try {
      const res = await fetch("/api/estamp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ certificateNumber: stamp.certificateNumber }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.verified) {
          toast.success("E-Stamp verified successfully");
        } else {
          toast.error("E-Stamp verification failed");
        }
        fetchStamps();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Verification failed");
      }
    } catch {
      toast.error("Verification failed");
    } finally {
      setVerifyingId(null);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Stamp className="w-5 h-5" />
          E-Stamping
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Apply E-Stamp Form */}
        <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
          <h4 className="text-sm font-semibold">Apply New E-Stamp</h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="jurisdiction">Jurisdiction</Label>
              <Select
                id="jurisdiction"
                value={jurisdiction}
                onChange={(e) => setJurisdiction(e.target.value)}
                options={INDIAN_JURISDICTIONS}
                placeholder="Select state/region"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stampType">Stamp Type</Label>
              <Select
                id="stampType"
                value={stampType}
                onChange={(e) => setStampType(e.target.value)}
                options={STAMP_TYPES}
                placeholder="Select type"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stampDuty">Stamp Duty (INR)</Label>
              <Input
                id="stampDuty"
                type="number"
                min="0"
                step="0.01"
                value={stampDuty}
                onChange={(e) => setStampDuty(e.target.value)}
                placeholder="Enter amount"
              />
            </div>
          </div>

          <Button
            onClick={handleApply}
            disabled={!jurisdiction || !stampType || !stampDuty || submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Applying...
              </>
            ) : (
              <>
                <Stamp className="w-4 h-4 mr-2" />
                Apply E-Stamp
              </>
            )}
          </Button>
        </div>

        {/* Applied Stamps */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Applied E-Stamps</h4>

          {loading ? (
            <div className="flex items-center justify-center py-6 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Loading e-stamps...
            </div>
          ) : stamps.length === 0 ? (
            <div className="text-center py-6 border rounded-lg">
              <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-sm text-muted-foreground">
                No e-stamps applied yet
              </p>
            </div>
          ) : (
            <div className="divide-y border rounded-lg">
              {stamps.map((stamp) => (
                <div
                  key={stamp.id}
                  className="flex items-start gap-3 px-4 py-3"
                >
                  <div className="mt-0.5">
                    {stamp.verified ? (
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Clock className="w-5 h-5 text-amber-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-mono font-medium">
                        {stamp.certificateNumber}
                      </p>
                      <Badge
                        variant={stamp.verified ? "success" : "warning"}
                      >
                        {stamp.verified ? "Verified" : "Unverified"}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
                      <span>
                        {INDIAN_JURISDICTIONS.find(
                          (j) => j.value === stamp.jurisdiction
                        )?.label || stamp.jurisdiction}
                      </span>
                      <span>&middot;</span>
                      <span>
                        {STAMP_TYPES.find((t) => t.value === stamp.stampType)
                          ?.label || stamp.stampType}
                      </span>
                      <span>&middot;</span>
                      <span>{formatCurrency(stamp.stampDuty)}</span>
                      <span>&middot;</span>
                      <span>{formatDate(stamp.createdAt)}</span>
                    </div>
                  </div>
                  {!stamp.verified && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleVerify(stamp)}
                      disabled={verifyingId === stamp.id}
                      className="shrink-0"
                    >
                      {verifyingId === stamp.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                      ) : (
                        <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                      )}
                      Verify
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

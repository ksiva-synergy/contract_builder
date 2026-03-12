"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";

type Step = "loading" | "error" | "details" | "otp" | "signature" | "success";
type SignatureMethod = "draw" | "type" | "upload";

interface ContractDetails {
  contractNumber: string;
  seafarerName: string;
  vessel: string;
  position: string;
  requiresOtp: boolean;
}

export default function SignTokenPage() {
  const { token } = useParams<{ token: string }>();

  const [step, setStep] = useState<Step>("loading");
  const [contract, setContract] = useState<ContractDetails | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const [otpSending, setOtpSending] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpError, setOtpError] = useState("");

  const [signatureMethod, setSignatureMethod] = useState<SignatureMethod>("draw");
  const [signatureData, setSignatureData] = useState("");
  const [typedName, setTypedName] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const typeCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/signing/token/${token}`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || (res.status === 404 ? "This signing link is invalid or has expired." : "Failed to load contract details."));
        }
        return res.json();
      })
      .then((data: ContractDetails) => {
        setContract(data);
        setStep(data.requiresOtp ? "otp" : "signature");
      })
      .catch((err) => {
        setErrorMessage(err.message);
        setStep("error");
      });
  }, [token]);

  const getCanvasCoords = (
    canvas: HTMLCanvasElement,
    e: React.MouseEvent | React.TouchEvent
  ) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    isDrawing.current = true;
    lastPoint.current = getCanvasCoords(canvas, e);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !lastPoint.current) return;

    const point = getCanvasCoords(canvas, e);
    ctx.beginPath();
    ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
    ctx.lineTo(point.x, point.y);
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    lastPoint.current = point;
  };

  const stopDrawing = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    lastPoint.current = null;
    const canvas = canvasRef.current;
    if (canvas) {
      setSignatureData(canvas.toDataURL("image/png"));
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setSignatureData("");
  };

  const renderTypedSignature = useCallback(() => {
    const canvas = typeCanvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !typedName.trim()) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#1e293b";
    ctx.font = "italic 36px 'Georgia', 'Times New Roman', serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(typedName, canvas.width / 2, canvas.height / 2);
    setSignatureData(canvas.toDataURL("image/png"));
  }, [typedName]);

  useEffect(() => {
    if (signatureMethod === "type") {
      renderTypedSignature();
    }
  }, [typedName, signatureMethod, renderTypedSignature]);

  useEffect(() => {
    if (signatureMethod === "draw") {
      clearCanvas();
      setSignatureData("");
    } else if (signatureMethod === "type") {
      setSignatureData("");
      setTypedName("");
    } else {
      setSignatureData("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signatureMethod]);

  const handleSendOtp = async () => {
    setOtpSending(true);
    setOtpError("");
    try {
      const res = await fetch(`/api/signing/token/${token}/send-otp`, {
        method: "POST",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to send verification code.");
      }
      setOtpSent(true);
    } catch (err: unknown) {
      setOtpError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    setOtpVerifying(true);
    setOtpError("");
    try {
      const res = await fetch(`/api/signing/token/${token}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: otpCode }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Verification failed. Please try again.");
      }
      setStep("signature");
    } catch (err: unknown) {
      setOtpError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setSignatureData(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!signatureData || !agreedToTerms) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/signing/token/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signatureData,
          signatureType: signatureMethod,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to submit signature.");
      }
      setStep("success");
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
      setStep("error");
    } finally {
      setSubmitting(false);
    }
  };

  // --- Render helpers ---

  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
      <p className="mt-4 text-sm text-slate-500">Loading contract details…</p>
    </div>
  );

  const renderError = () => (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
        <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <h2 className="mt-4 text-lg font-semibold text-slate-900">Unable to Load Contract</h2>
      <p className="mt-2 max-w-sm text-sm text-slate-500">{errorMessage}</p>
    </div>
  );

  const renderContractInfo = () => (
    <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Contract Details</h3>
      <div className="grid grid-cols-2 gap-x-6 gap-y-3">
        <div>
          <p className="text-xs text-slate-400">Contract No.</p>
          <p className="text-sm font-medium text-slate-800">{contract?.contractNumber}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Seafarer</p>
          <p className="text-sm font-medium text-slate-800">{contract?.seafarerName}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Vessel</p>
          <p className="text-sm font-medium text-slate-800">{contract?.vessel}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Position</p>
          <p className="text-sm font-medium text-slate-800">{contract?.position}</p>
        </div>
      </div>
    </div>
  );

  const renderOtp = () => (
    <div>
      {renderContractInfo()}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="text-base font-semibold text-slate-900">Identity Verification</h3>
        <p className="mt-1 text-sm text-slate-500">
          A verification code will be sent to your registered contact to confirm your identity.
        </p>

        {!otpSent ? (
          <button
            onClick={handleSendOtp}
            disabled={otpSending}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-sky-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-sky-600 disabled:opacity-60"
          >
            {otpSending ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Sending…
              </>
            ) : (
              "Send Verification Code"
            )}
          </button>
        ) : (
          <div className="mt-5 space-y-4">
            <p className="text-sm text-emerald-600 font-medium">
              ✓ Verification code sent. Please check your phone or email.
            </p>
            <div>
              <label htmlFor="otp-input" className="mb-1.5 block text-sm font-medium text-slate-700">
                Enter 6-digit code
              </label>
              <input
                id="otp-input"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="w-40 rounded-lg border border-slate-300 px-4 py-2.5 text-center text-lg font-mono tracking-[0.3em] focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                placeholder="000000"
              />
            </div>
            <button
              onClick={handleVerifyOtp}
              disabled={otpCode.length !== 6 || otpVerifying}
              className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-sky-600 disabled:opacity-60"
            >
              {otpVerifying ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Verifying…
                </>
              ) : (
                "Verify Code"
              )}
            </button>
            <button
              onClick={handleSendOtp}
              disabled={otpSending}
              className="ml-3 text-sm text-sky-600 hover:text-sky-700 hover:underline disabled:opacity-60"
            >
              Resend code
            </button>
          </div>
        )}

        {otpError && (
          <p className="mt-3 text-sm text-red-600">{otpError}</p>
        )}
      </div>
    </div>
  );

  const methodTabs: { key: SignatureMethod; label: string; icon: React.ReactNode }[] = [
    {
      key: "draw",
      label: "Draw",
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      ),
    },
    {
      key: "type",
      label: "Type",
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h8m-8 6h16" />
        </svg>
      ),
    },
    {
      key: "upload",
      label: "Upload",
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
      ),
    },
  ];

  const renderSignature = () => (
    <div>
      {renderContractInfo()}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="text-base font-semibold text-slate-900">Sign Contract</h3>
        <p className="mt-1 mb-5 text-sm text-slate-500">
          Choose how you&apos;d like to provide your signature.
        </p>

        {/* Method tabs */}
        <div className="mb-5 flex gap-1 rounded-lg bg-slate-100 p-1">
          {methodTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSignatureMethod(tab.key)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition ${
                signatureMethod === tab.key
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Draw */}
        {signatureMethod === "draw" && (
          <div>
            <div className="relative rounded-lg border-2 border-dashed border-slate-300 bg-white">
              <canvas
                ref={canvasRef}
                width={600}
                height={200}
                className="w-full cursor-crosshair touch-none"
                style={{ height: "200px" }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
              {!signatureData && (
                <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-slate-300">
                  Draw your signature here
                </p>
              )}
            </div>
            <button
              onClick={clearCanvas}
              className="mt-2 text-xs text-slate-400 hover:text-slate-600"
            >
              Clear signature
            </button>
          </div>
        )}

        {/* Type */}
        {signatureMethod === "type" && (
          <div className="space-y-4">
            <div>
              <label htmlFor="typed-name" className="mb-1.5 block text-sm font-medium text-slate-700">
                Full Name
              </label>
              <input
                id="typed-name"
                type="text"
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
            <div className="rounded-lg border-2 border-dashed border-slate-300 bg-white">
              <canvas
                ref={typeCanvasRef}
                width={600}
                height={120}
                className="w-full"
                style={{ height: "120px" }}
              />
            </div>
            {typedName.trim() && (
              <p className="text-xs text-emerald-600">Preview of your typed signature above</p>
            )}
          </div>
        )}

        {/* Upload */}
        {signatureMethod === "upload" && (
          <div>
            <label
              htmlFor="sig-upload"
              className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 px-6 py-10 transition hover:border-sky-400 hover:bg-sky-50/30"
            >
              <svg className="mb-2 h-8 w-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <p className="text-sm text-slate-500">Click to upload a signature image</p>
              <p className="mt-1 text-xs text-slate-400">PNG, JPG, or SVG</p>
              <input
                id="sig-upload"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            {signatureData && signatureData.startsWith("data:image") && (
              <div className="mt-4 rounded-lg border border-slate-200 bg-white p-3">
                <p className="mb-2 text-xs text-slate-400">Preview</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={signatureData} alt="Uploaded signature" className="mx-auto max-h-24" />
              </div>
            )}
          </div>
        )}

        {/* Terms */}
        <label className="mt-6 flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-sky-500 focus:ring-sky-500"
          />
          <span className="text-sm text-slate-600">
            I agree this constitutes my legally binding signature
          </span>
        </label>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!signatureData || !agreedToTerms || submitting}
          className="mt-6 w-full rounded-lg bg-sky-500 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? (
            <span className="inline-flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Submitting…
            </span>
          ) : (
            "Submit Signature"
          )}
        </button>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
        <svg className="h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="mt-4 text-lg font-semibold text-slate-900">Signature Submitted</h2>
      <p className="mt-2 max-w-sm text-sm text-slate-500">
        Your signature has been recorded successfully. You may close this page.
      </p>
      {contract && (
        <p className="mt-4 text-xs text-slate-400">
          Contract: {contract.contractNumber}
        </p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-slate-800">Contract Signing</span>
          </div>
          <span className="text-xs text-slate-400">Secure Document Portal</span>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-2xl px-6 py-10">
        {step === "loading" && renderLoading()}
        {step === "error" && renderError()}
        {step === "otp" && renderOtp()}
        {step === "signature" && renderSignature()}
        {step === "success" && renderSuccess()}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-6 text-center text-xs text-slate-400">
        Contract Builder CBA &middot; Secure Digital Signing
      </footer>
    </div>
  );
}

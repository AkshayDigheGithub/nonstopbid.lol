"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    paypal?: {
      Buttons: (config: Record<string, unknown>) => {
        render: (el: HTMLElement) => void;
      };
    };
  }
}

const CATEGORIES = [
  "AI Agents",
  "AI Media",
  "Developer Tools",
  "Marketing",
  "SEO",
  "Productivity",
  "Design",
  "Social Media",
  "Writing",
  "Sales",
  "Business",
  "Games",
  "Education",
  "Health & Fitness",
  "Ecommerce",
  "Directories",
  "Hiring",
  "Audio",
  "Crypto",
  "Agencies",
  "Security",
  "Travel",
  "News",
  "Domains",
  "Real Estate",
  "Other",
];

type Props = {
  onSuccess: () => void;
};

export default function BidForm({ onSuccess }: Props) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [amount, setAmount] = useState("5");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<
    "idle" | "ready-to-pay" | "processing" | "success"
  >("idle");
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const buttonsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (document.getElementById("paypal-sdk")) {
      setScriptLoaded(true);
      return;
    }
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    if (!clientId) return;

    const script = document.createElement("script");
    script.id = "paypal-sdk";
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(
      clientId
    )}&currency=USD&intent=capture`;
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (
      status !== "ready-to-pay" ||
      !scriptLoaded ||
      !window.paypal ||
      !buttonsContainerRef.current
    ) {
      return;
    }

    buttonsContainerRef.current.innerHTML = "";

    window.paypal
      .Buttons({
        style: { layout: "vertical", label: "pay" },
        createOrder: async () => {
          setError(null);
          const res = await fetch("/api/paypal/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title,
              url,
              description,
              category,
              amountDollars: parseFloat(amount),
            }),
          });
          const data = await res.json();
          if (!res.ok) {
            setError(data.error ?? "Could not start checkout");
            throw new Error(data.error ?? "create-order failed");
          }
          return data.orderId;
        },
        onApprove: async (data: { orderID: string }) => {
          setStatus("processing");
          const res = await fetch("/api/paypal/capture-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId: data.orderID }),
          });
          const result = await res.json();
          if (!res.ok) {
            setError(result.error ?? "Payment capture failed");
            setStatus("ready-to-pay");
            return;
          }
          setStatus("success");
          onSuccess();
        },
        onError: (err: unknown) => {
          console.error(err);
          setError("Something went wrong with PayPal. Please try again.");
          setStatus("ready-to-pay");
        },
      })
      .render(buttonsContainerRef.current);
  }, [status, scriptLoaded, title, url, description, category, amount, onSuccess]);

  function handleContinue(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !url.trim()) {
      setError("Title and URL are required");
      return;
    }
    try {
      const parsed = new URL(url);
      if (!["http:", "https:"].includes(parsed.protocol)) throw new Error();
    } catch {
      setError("Enter a valid URL, including https://");
      return;
    }
    const amountNum = parseFloat(amount);
    if (!Number.isFinite(amountNum) || amountNum < 5) {
      setError("Minimum bid is $5");
      return;
    }

    setStatus("ready-to-pay");
  }

  const locked = status === "ready-to-pay" || status === "processing";
  const fieldClasses =
    "rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 outline-none transition-colors placeholder:text-neutral-600 focus:border-neutral-500 disabled:opacity-50";

  function adjustAmount(delta: number) {
    const current = parseFloat(amount) || 0;
    const next = Math.max(5, current + delta);
    setAmount(next.toString());
  }

  if (status === "success") {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-green-700/50 bg-green-950/30 p-4 text-green-400">
        <span className="text-xl">✓</span>
        <span>
          You&apos;re on the board! Refresh the leaderboard to see your spot.
        </span>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleContinue}
      className="flex flex-col gap-3 rounded-xl border border-neutral-800 bg-neutral-900 p-5 shadow-lg shadow-black/20"
    >
      <h2 className="text-lg font-semibold">Claim a spot</h2>

      <input
        className={fieldClasses}
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={locked}
        maxLength={120}
      />
      <input
        className={fieldClasses}
        placeholder="https://yoursite.com"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        disabled={locked}
      />
      <textarea
        className={`${fieldClasses} resize-none`}
        placeholder="Short description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        disabled={locked}
        maxLength={500}
        rows={2}
      />
      <select
        className={fieldClasses}
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        disabled={locked}
      >
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <div className="flex items-center gap-3">
        <div className="flex items-center overflow-hidden rounded-lg border border-neutral-700 bg-neutral-950">
          <button
            type="button"
            onClick={() => adjustAmount(-1)}
            disabled={locked}
            className="px-3 py-2 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white disabled:opacity-50"
          >
            −
          </button>
          <span className="px-1 text-neutral-500">$</span>
          <input
            type="number"
            min={5}
            step="0.01"
            className="w-20 bg-transparent py-2 text-center outline-none disabled:opacity-50"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={locked}
          />
          <button
            type="button"
            onClick={() => adjustAmount(1)}
            disabled={locked}
            className="px-3 py-2 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white disabled:opacity-50"
          >
            +
          </button>
        </div>
        <span className="text-sm text-neutral-500">min $5</span>
      </div>

      {error && (
        <p className="rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      {status === "idle" && (
        <button
          type="submit"
          className="rounded-lg bg-white px-4 py-2 font-medium text-black transition-colors hover:bg-neutral-200"
        >
          Continue to pay
        </button>
      )}

      {status === "ready-to-pay" && !scriptLoaded && (
        <p className="text-sm text-neutral-500">Loading PayPal…</p>
      )}

      <div ref={buttonsContainerRef} className="min-h-[45px]" />

      {status === "processing" && (
        <p className="text-sm text-neutral-500">Confirming payment…</p>
      )}
    </form>
  );
}

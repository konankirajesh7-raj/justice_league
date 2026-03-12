// API functions — calls Next.js API routes (no Python backend needed)

export const extractOpportunity = async (text: string) => {
  const res = await fetch("/api/extract", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Extraction failed" }));
    throw new Error(err.error || "Extraction failed");
  }
  return res.json();
};

const API = process.env.NEXT_PUBLIC_API_URL;

export const extractOpportunity = async (text: string) => {
  const res = await fetch(`${API}/extract`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error("Extraction failed");
  return res.json();
};

export const saveOpportunity = async (data: Record<string, unknown>) => {
  const res = await fetch(`${API}/save`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const getOpportunities = async (userId: string) => {
  const res = await fetch(`${API}/opportunities/${userId}`);
  return res.json();
};

export const deleteOpportunity = async (id: string) => {
  await fetch(`${API}/opportunities/${id}`, { method: "DELETE" });
};

export const markApplied = async (id: string) => {
  const res = await fetch(`${API}/opportunities/${id}/applied`, {
    method: "PUT",
  });
  return res.json();
};

export const togglePublic = async (id: string) => {
  const res = await fetch(`${API}/opportunities/${id}/public`, {
    method: "PUT",
  });
  return res.json();
};

export const getCommunity = async () => {
  const res = await fetch(`${API}/community`);
  return res.json();
};

export const upvoteOpportunity = async (id: string, userId: string) => {
  const res = await fetch(`${API}/community/${id}/upvote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId }),
  });
  return res.json();
};

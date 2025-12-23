export async function claimGift(userId: string, link: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/gift/claim`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, link }),
  });
  return response.json();
}


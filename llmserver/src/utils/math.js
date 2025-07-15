export function cosineSimilarity(vecA, vecB) {
  const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a ** 2, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b ** 2, 0));
  return dot / (magA * magB);
}
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .replace(/\{|\}/g, '')
    .replace(/\[|\]/g, '')
    .replace(/`/g, '')
    .replace(/\\/g, '')
    .replace(/system|assistant|user:/gi, '')
    .replace(/ignore|forget|disregard|override|reveal/gi, '')
    .trim()
    .substring(0, 200)
}

export function validateNoInjection(input: string): boolean {
  const injectionPatterns = [
    /ignore\s+(previous|above|all|the)/i,
    /forget\s+(everything|all|previous)/i,
    /disregard\s+(previous|above|all|instructions)/i,
    /new\s+instructions?:/i,
    /system\s*:/i,
    /assistant\s*:/i,
    /you\s+are\s+now/i,
    /act\s+as/i,
    /pretend\s+to\s+be/i,
    /roleplay/i,
    /\[INST\]/i,
    /\[\/INST\]/i,
    /<\|.*?\|>/,
    /reveal\s+(your|the)\s+(prompt|instructions?|system)/i,
    /show\s+me\s+your\s+(prompt|instructions?|system)/i,
    /what\s+(is|are)\s+your\s+(instructions?|prompt|system)/i,
  ]
  
  return !injectionPatterns.some(pattern => pattern.test(input))
}

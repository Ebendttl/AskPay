import fs from "fs";
import path from "path";

// In-memory cache + file-based persistence for referrals.
// Maps refereeAddress (lowercase) -> referrerAddress (lowercase)
const referralsFile = path.join(process.cwd(), "src/lib/referrals-db.json");

let referralsMap: Record<string, string> = {};

// Load referrals from disk on startup
try {
  if (fs.existsSync(referralsFile)) {
    const data = fs.readFileSync(referralsFile, "utf-8");
    referralsMap = JSON.parse(data);
  }
} catch (err) {
  console.error("Failed to load referrals database:", err);
}

function saveToDisk() {
  try {
    const dir = path.dirname(referralsFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(referralsFile, JSON.stringify(referralsMap, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save referrals to disk:", err);
  }
}

/**
 * Save a referral mapping: referee -> referrer
 */
export function saveReferral(referee: string, referrer: string): boolean {
  const refereeLower = referee.toLowerCase();
  const referrerLower = referrer.toLowerCase();

  // Basic validation: cannot refer self, and referee cannot be already referred
  if (refereeLower === referrerLower) return false;
  if (referralsMap[refereeLower]) return false; // Already referred

  referralsMap[refereeLower] = referrerLower;
  saveToDisk();
  return true;
}

/**
 * Get the referrer for a referee
 */
export function getReferrer(referee: string): string | undefined {
  return referralsMap[referee.toLowerCase()];
}

/**
 * Get the full referrals map
 */
export function getReferralsMap(): Record<string, string> {
  return { ...referralsMap };
}

/**
 * One-off backfill: populates heroTitleTa / heroSubtitleTa on the existing
 * SiteSettings singleton. Mongoose schema `default` only applies when a
 * document is created — a site whose settings document already existed
 * before these fields were added needs them set explicitly, once.
 *
 * Safe to run more than once: it only touches a field that is currently
 * empty, so it never overwrites Tamil copy an admin has already written in
 * the dashboard.
 *
 * Usage: npx tsx --env-file=.env.local scripts/backfill-hero-ta.ts
 */
import "dotenv/config";
import { dbConnect } from "../src/lib/db";
import SiteSettings from "../src/models/SiteSettings";

const HERO_TITLE_TA =
  "KANI.LK-க்கு வரவேற்கிறோம். வடக்கு மற்றும் கிழக்கில் நீங்கள் நம்பக்கூடிய நிலத்தைக் கண்டறியுங்கள்.";
const HERO_SUBTITLE_TA =
  "வவுனியா, மன்னார், யாழ்ப்பாணம், மட்டக்களப்பு, திருகோணமலை மற்றும் முல்லைத்தீவு முழுவதும் சரிபார்க்கப்பட்ட மனைகள், நெல் வயல்கள் மற்றும் வீடுகள் - ஒவ்வொரு பட்டியலிலும் உரிமையாளரின் எண்ணுடன் கிடைக்கும்.";

async function main() {
  await dbConnect();

  // .lean() is essential here: a hydrated Mongoose document (findOne without
  // .lean()) applies schema defaults for fields absent from the stored data,
  // which would make an unset heroTitleTa look "already set" and skip the
  // backfill it actually needs. .lean() returns the raw persisted document,
  // matching what getSettings() (also .lean()) serves to the app.
  const doc = await SiteSettings.findOne({ key: "main" }).lean();
  if (!doc) {
    console.log("No SiteSettings document found — nothing to backfill (a fresh one will get the Tamil defaults on create).");
    process.exit(0);
  }

  const updates: Record<string, string> = {};
  if (!doc.heroTitleTa?.trim()) updates.heroTitleTa = HERO_TITLE_TA;
  if (!doc.heroSubtitleTa?.trim()) updates.heroSubtitleTa = HERO_SUBTITLE_TA;

  if (Object.keys(updates).length === 0) {
    console.log("heroTitleTa and heroSubtitleTa are already set — nothing to do.");
    process.exit(0);
  }

  await SiteSettings.updateOne({ key: "main" }, { $set: updates });
  console.log(`Backfilled: ${Object.keys(updates).join(", ")}`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

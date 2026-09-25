import { InternshipTrack } from '../models/InternshipTrack.js';

const FIXED_TRACKS = [
  { name: '3 Day', slug: '3-day', description: '3-day intensive internship program materials' },
  { name: '5 Day', slug: '5-day', description: '5-day internship program materials' },
  { name: '12 Day', slug: '12-day', description: '12-day comprehensive internship program materials' }
];

/**
 * Seed the three fixed InternshipTrack documents if they don't exist yet.
 * Safe to call on every startup — uses upsert.
 */
export async function seedInternshipTracks() {
  try {
    await Promise.all(
      FIXED_TRACKS.map((track) =>
        InternshipTrack.findOneAndUpdate(
          { slug: track.slug },
          { $setOnInsert: track },
          { upsert: true, new: false }
        )
      )
    );
    console.info('✅ InternshipTrack seed complete (3-day, 5-day, 12-day)');
  } catch (err) {
    console.error('⚠️ InternshipTrack seed failed:', err.message);
  }
}

import { Course } from '../models/Course.js';
import { InternshipTrack } from '../models/InternshipTrack.js';
import { PdfMaterial } from '../models/PdfMaterial.js';

/**
 * GET /api/admin/dashboard
 * Returns summary counts for the admin dashboard overview.
 */
export async function getDashboardStats(_req, res) {
  const [totalCourses, totalTracks, totalPdfs] = await Promise.all([
    Course.countDocuments(),
    InternshipTrack.countDocuments(),
    PdfMaterial.countDocuments()
  ]);

  res.json({
    data: {
      totalCourses,
      totalTracks,
      totalPdfs
    }
  });
}

import { Course } from '../models/Course.js';
import { Subject } from '../models/Subject.js';
import { Student } from '../models/Student.js';
import { PdfMaterial } from '../models/PdfMaterial.js';

/**
 * GET /api/admin/dashboard
 * Returns summary counts for the admin dashboard overview.
 */
export async function getDashboardStats(_req, res) {
  const [totalCourses, totalSubjects, totalStudents, totalStudyMaterials] = await Promise.all([
    Course.countDocuments(),
    Subject.countDocuments(),
    Student.countDocuments(),
    PdfMaterial.countDocuments()
  ]);

  res.json({
    data: {
      totalCourses,
      totalSubjects,
      totalStudents,
      totalStudyMaterials
    }
  });
}

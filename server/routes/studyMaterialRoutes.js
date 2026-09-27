import { Router } from 'express';
import { Course } from '../models/Course.js';
import { Subject } from '../models/Subject.js';
import { PdfMaterial } from '../models/PdfMaterial.js';

const router = Router();

// GET /api/study-material
// Returns hierarchical structure: Course -> Subjects -> Pdfs
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find({ isActive: true }).select('name slug image').lean();
    
    // We can fetch all subjects and pdfs and stitch them together, or do it iteratively.
    // Fetching all is fine if data size is reasonable.
    const courseIds = courses.map(c => c._id);
    const subjects = await Subject.find({ course: { $in: courseIds } }).sort({ order: 1, createdAt: -1 }).lean();
    
    const subjectIds = subjects.map(s => s._id);
    const pdfs = await PdfMaterial.find({ subject: { $in: subjectIds } }).sort({ createdAt: -1 }).lean();

    // Stitch together
    const result = courses.map(course => {
      const courseSubjects = subjects
        .filter(s => s.course.toString() === course._id.toString())
        .map(subject => {
          const subjectPdfs = pdfs.filter(p => p.subject.toString() === subject._id.toString());
          return { ...subject, pdfs: subjectPdfs };
        });
      return { ...course, subjects: courseSubjects };
    });

    res.json({ data: result });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching study material', error: error.message });
  }
});

// Optional: GET /api/study-material/:courseId/subjects/:subjectId/pdfs
router.get('/:courseId/subjects/:subjectId/pdfs', async (req, res) => {
  try {
    const { subjectId } = req.params;
    const pdfs = await PdfMaterial.find({ subject: subjectId }).sort({ createdAt: -1 });
    res.json({ data: pdfs });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching PDFs', error: error.message });
  }
});

export default router;

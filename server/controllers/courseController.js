import { getCourseBySlug, listCourses } from '../services/courseService.js';

export async function getCourses(_req, res) {
  res.json({ data: await listCourses() });
}

export async function getCourse(req, res) {
  const course = await getCourseBySlug(req.params.slug);
  if (!course) return res.status(404).json({ message: 'Course not found' });
  return res.json({ data: course });
}
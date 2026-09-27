import { Student } from '../models/Student.js';

export async function listStudents(req, res) {
  const students = await Student.find().populate('course', 'name slug').sort({ createdAt: -1 });
  res.json({ data: students });
}

export async function getStudent(req, res) {
  const student = await Student.findById(req.params.id).populate('course', 'name slug');
  if (!student) return res.status(404).json({ message: 'Student not found' });
  res.json({ data: student });
}

export async function createStudent(req, res) {
  const { name, course, courseFees, discount, enrolledAt } = req.body;

  const student = await Student.create({
    name,
    course,
    courseFees: Number(courseFees),
    discount: discount ? Number(discount) : 0,
    ...(enrolledAt ? { enrolledAt } : {})
  });

  res.status(201).json({ data: student });
}

export async function updateStudent(req, res) {
  const { name, course, courseFees, discount, enrolledAt } = req.body;

  const student = await Student.findById(req.params.id);
  if (!student) return res.status(404).json({ message: 'Student not found' });

  if (name !== undefined) student.name = name;
  if (course !== undefined) student.course = course;
  if (courseFees !== undefined) student.courseFees = Number(courseFees);
  if (discount !== undefined) student.discount = Number(discount);
  if (enrolledAt !== undefined) student.enrolledAt = enrolledAt;

  await student.save(); // triggers pre-save for finalFees

  res.json({ data: student });
}

export async function deleteStudent(req, res) {
  const student = await Student.findByIdAndDelete(req.params.id);
  if (!student) return res.status(404).json({ message: 'Student not found' });
  res.json({ message: 'Student deleted successfully' });
}

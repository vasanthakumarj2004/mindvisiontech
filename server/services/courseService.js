import { Course } from '../models/Course.js';

export const listCourses = () => Course.find({ isActive: true }).populate('branches').sort({ name: 1 });
export const getCourseBySlug = (slug) => Course.findOne({ slug, isActive: true }).populate('branches');
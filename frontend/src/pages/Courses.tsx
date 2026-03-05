import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Course {
  id: string;
  title: string;
  description: string | null;
  status: string;
  teacher: { id: string; name: string };
  _count: { enrollments: number; quizzes: number };
}

const Courses: React.FC = () => {
  const { token, user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('http://localhost:1099/api/courses?status=APPROVED');
        const data = await res.json();
        setCourses(data);
      } catch (e) {
        console.error('Failed to load courses', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleEnroll = async (courseId: string) => {
    if (!token || user?.role !== 'STUDENT') {
      alert('You must be logged in as a student to enroll.');
      return;
    }
    try {
      setEnrolling(courseId);
      const res = await fetch(
        `http://localhost:1099/api/courses/${courseId}/enroll`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to enroll');
      }
      alert('Enrolled successfully!');
    } catch (e: any) {
      alert(e.message);
    } finally {
      setEnrolling(null);
    }
  };

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader" />
      </div>
    );
  }

  return (
    <div>
      <h2>Available Courses</h2>
      {courses.length === 0 ? (
        <p>No courses have been approved yet.</p>
      ) : (
        <div className="items-grid">
          {courses.map((course) => (
            <div key={course.id} className="item-card">
              <div className="item-header">
                <h3 className="item-title">{course.title}</h3>
              </div>
              <p className="item-desc">
                {course.description || 'No description provided.'}
              </p>
              <div className="item-footer">
                <span className="item-date">
                  Teacher: {course.teacher?.name ?? 'Unknown'}
                </span>
                <span className="item-date">
                  {course._count.enrollments} students · {course._count.quizzes} quizzes
                </span>
              </div>
              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                <Link to={`/courses/${course.id}`} className="btn btn-secondary">
                  View details
                </Link>
                {user?.role === 'STUDENT' && (
                  <button
                    className="btn btn-primary"
                    onClick={() => handleEnroll(course.id)}
                    disabled={enrolling === course.id}
                  >
                    {enrolling === course.id ? 'Enrolling...' : 'Enroll'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Courses;


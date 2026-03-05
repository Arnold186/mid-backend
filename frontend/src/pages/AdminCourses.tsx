import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface Course {
  id: string;
  title: string;
  description: string | null;
  status: string;
  teacher: { id: string; name: string };
}

const AdminCourses: React.FC = () => {
  const { user, token } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('http://localhost:1085/api/courses?status=PENDING');
        const data = await res.json();
        setCourses(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('Failed to load pending courses', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const reviewCourse = async (courseId: string, status: 'APPROVED' | 'REJECTED') => {
    if (!token) {
      alert('You must be logged in as admin.');
      return;
    }
    try {
      setUpdatingId(courseId);
      const res = await fetch(
        `http://localhost:1085/api/courses/${courseId}/approve`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ status })
        }
      );
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error || 'Failed to update course');
      }
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
    } catch (e: any) {
      alert(e.message);
    } finally {
      setUpdatingId(null);
    }
  };

  if (user?.role !== 'ADMIN') {
    return <p>You must be an admin to access this page.</p>;
  }

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader" />
      </div>
    );
  }

  return (
    <div>
      <h2>Admin Course Review</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        Approve or reject new courses submitted by teachers.
      </p>

      {courses.length === 0 ? (
        <p>No courses waiting for review.</p>
      ) : (
        <div className="items-grid">
          {courses.map((course) => (
            <div key={course.id} className="item-card">
              <div className="item-header">
                <h3 className="item-title">{course.title}</h3>
                <span className="item-date">
                  Teacher: {course.teacher?.name ?? 'Unknown'}
                </span>
              </div>
              <p className="item-desc">
                {course.description || 'No description provided.'}
              </p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className="btn btn-primary"
                  onClick={() => reviewCourse(course.id, 'APPROVED')}
                  disabled={updatingId === course.id}
                >
                  Approve
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => reviewCourse(course.id, 'REJECTED')}
                  disabled={updatingId === course.id}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCourses;


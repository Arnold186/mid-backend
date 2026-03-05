import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home: React.FC = () => {
  const { user } = useAuth();

  return (
    <div>
      <h1>Welcome to Mid Learning</h1>
      <p style={{ color: 'var(--text-secondary)', maxWidth: 640, marginTop: '0.5rem' }}>
        A simple online learning platform where teachers publish courses and quizzes,
        admins review them, and students learn at their own pace.
      </p>

      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <Link to="/courses" className="btn btn-primary">
          Browse Courses
        </Link>
        {!user && (
          <>
            <Link to="/login" className="btn btn-secondary">
              Log In
            </Link>
            <Link to="/register" className="btn btn-secondary">
              Create Account
            </Link>
          </>
        )}
        {user?.role === 'TEACHER' && (
          <Link to="/teach/courses" className="btn btn-secondary">
            Teacher Dashboard
          </Link>
        )}
        {user?.role === 'ADMIN' && (
          <Link to="/admin/courses" className="btn btn-secondary">
            Admin Review
          </Link>
        )}
      </div>
    </div>
  );
};

export default Home;


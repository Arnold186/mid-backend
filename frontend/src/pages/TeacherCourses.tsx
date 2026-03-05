import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface Course {
  id: string;
  title: string;
  description: string | null;
  status: string;
}

interface NewQuizQuestion {
  text: string;
  options: string;
  answer: string;
}

const TeacherCourses: React.FC = () => {
  const { user, token } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [quizCourseId, setQuizCourseId] = useState<string | null>(null);
  const [quizTitle, setQuizTitle] = useState('');
  const [quizQuestions, setQuizQuestions] = useState<NewQuizQuestion[]>([
    { text: '', options: '', answer: '' }
  ]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('http://localhost:1099/api/courses');
        const data = await res.json();
        const mine = Array.isArray(data)
          ? data.filter((c: any) => c.teacher?.id === user?.id)
          : [];
        setCourses(mine);
      } catch (e) {
        console.error('Failed to load courses', e);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      load();
    }
  }, [user]);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      alert('You must be logged in to create courses.');
      return;
    }
    try {
      setCreating(true);
      const res = await fetch('http://localhost:1099/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title, description })
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error || 'Failed to create course');
      }
      setCourses((prev) => [body, ...prev]);
      setTitle('');
      setDescription('');
      alert('Course created and sent for admin approval.');
    } catch (e: any) {
      alert(e.message);
    } finally {
      setCreating(false);
    }
  };

  const handleAddQuizQuestion = () => {
    setQuizQuestions((prev) => [...prev, { text: '', options: '', answer: '' }]);
  };

  const handleSaveQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizCourseId || !token) return;
    try {
      const questionsPayload = quizQuestions.map((q) => ({
        text: q.text,
        options: q.options.split(',').map((o) => o.trim()),
        answer: q.answer
      }));
      const res = await fetch(
        `http://localhost:1099/api/courses/${quizCourseId}/quizzes`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ title: quizTitle, questions: questionsPayload })
        }
      );
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error || 'Failed to create quiz');
      }
      alert('Quiz created successfully.');
      setQuizCourseId(null);
      setQuizTitle('');
      setQuizQuestions([{ text: '', options: '', answer: '' }]);
    } catch (e: any) {
      alert(e.message);
    }
  };

  if (user?.role !== 'TEACHER') {
    return <p>You must be a teacher to access this page.</p>;
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
      <h2>Teacher Dashboard</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        Create courses and attach quizzes. Admins will approve courses before
        students can see them.
      </p>

      <form onSubmit={handleCreateCourse} style={{ marginBottom: '2rem' }}>
        <div className="form-group">
          <label className="form-label">Course title</label>
          <input
            className="form-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            className="form-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>
        <button className="btn btn-primary" type="submit" disabled={creating}>
          {creating ? 'Creating...' : 'Create course'}
        </button>
      </form>

      <h3>Your courses</h3>
      {courses.length === 0 ? (
        <p>You have not created any courses yet.</p>
      ) : (
        <div className="items-grid">
          {courses.map((course) => (
            <div key={course.id} className="item-card">
              <div className="item-header">
                <h3 className="item-title">{course.title}</h3>
                <span className="item-date">Status: {course.status}</span>
              </div>
              <p className="item-desc">
                {course.description || 'No description provided.'}
              </p>
              <button
                className="btn btn-secondary"
                onClick={() => setQuizCourseId(course.id)}
              >
                Add quiz
              </button>
            </div>
          ))}
        </div>
      )}

      {quizCourseId && (
        <div
          style={{
            marginTop: '2rem',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--surface-color)'
          }}
        >
          <h3>Create quiz</h3>
          <form onSubmit={handleSaveQuiz}>
            <div className="form-group">
              <label className="form-label">Quiz title</label>
              <input
                className="form-input"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                required
              />
            </div>
            {quizQuestions.map((q, idx) => (
              <div
                key={idx}
                style={{
                  borderTop: '1px solid var(--border-color)',
                  paddingTop: '1rem',
                  marginTop: '1rem'
                }}
              >
                <div className="form-group">
                  <label className="form-label">Question text</label>
                  <input
                    className="form-input"
                    value={q.text}
                    onChange={(e) => {
                      const next = [...quizQuestions];
                      next[idx].text = e.target.value;
                      setQuizQuestions(next);
                    }}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Options (comma separated, at least 2)
                  </label>
                  <input
                    className="form-input"
                    value={q.options}
                    onChange={(e) => {
                      const next = [...quizQuestions];
                      next[idx].options = e.target.value;
                      setQuizQuestions(next);
                    }}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Correct answer (must match one option)</label>
                  <input
                    className="form-input"
                    value={q.answer}
                    onChange={(e) => {
                      const next = [...quizQuestions];
                      next[idx].answer = e.target.value;
                      setQuizQuestions(next);
                    }}
                    required
                  />
                </div>
              </div>
            ))}

            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleAddQuizQuestion}
              style={{ marginRight: '0.75rem' }}
            >
              Add another question
            </button>
            <button type="submit" className="btn btn-primary">
              Save quiz
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default TeacherCourses;


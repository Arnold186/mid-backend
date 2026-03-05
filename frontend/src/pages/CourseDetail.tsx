import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

interface Question {
  id: string;
  text: string;
  options: string;
  answer: string;
}

interface Quiz {
  id: string;
  title: string;
  questions: Question[];
}

interface CourseDetailData {
  id: string;
  title: string;
  description: string | null;
  teacher: { id: string; name: string };
}

const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<CourseDetailData | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [score, setScore] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const [courseRes, quizRes] = await Promise.all([
          fetch(`http://localhost:1099/api/courses/${id}`),
          fetch(`http://localhost:1099/api/courses/${id}/quizzes`)
        ]);
        const courseData = await courseRes.json();
        const quizData = await quizRes.json();
        setCourse(courseData);
        setQuizzes(quizData);
      } catch (e) {
        console.error('Failed to load course detail', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleSubmitQuiz = (quiz: Quiz) => {
    let correct = 0;
    quiz.questions.forEach((q) => {
      if (answers[q.id] && answers[q.id] === q.answer) {
        correct += 1;
      }
    });
    setScore(`You scored ${correct} / ${quiz.questions.length} on "${quiz.title}".`);
  };

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader" />
      </div>
    );
  }

  if (!course) {
    return <p>Course not found.</p>;
  }

  return (
    <div>
      <h2>{course.title}</h2>
      <p style={{ color: 'var(--text-secondary)' }}>
        Taught by {course.teacher?.name ?? 'Unknown'}
      </p>
      {course.description && (
        <p style={{ marginTop: '1rem' }}>{course.description}</p>
      )}

      <h3 style={{ marginTop: '2rem' }}>Quizzes</h3>
      {quizzes.length === 0 ? (
        <p>No quizzes have been added for this course yet.</p>
      ) : (
        quizzes.map((quiz) => (
          <div key={quiz.id} className="item-card" style={{ marginTop: '1rem' }}>
            <h4>{quiz.title}</h4>
            {quiz.questions.map((q) => {
              const options = JSON.parse(q.options) as string[];
              return (
                <div key={q.id} style={{ marginTop: '1rem' }}>
                  <p>{q.text}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {options.map((opt) => (
                      <label key={opt} style={{ fontSize: '0.9rem' }}>
                        <input
                          type="radio"
                          name={q.id}
                          value={opt}
                          checked={answers[q.id] === opt}
                          onChange={() =>
                            setAnswers((prev) => ({ ...prev, [q.id]: opt }))
                          }
                          style={{ marginRight: '0.5rem' }}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
            <button
              className="btn btn-primary"
              style={{ marginTop: '1rem' }}
              onClick={() => handleSubmitQuiz(quiz)}
            >
              Check answers
            </button>
          </div>
        ))
      )}

      {score && (
        <div
          style={{
            marginTop: '1.5rem',
            padding: '1rem',
            borderRadius: '0.5rem',
            border: '1px solid var(--border-color)'
          }}
        >
          {score}
        </div>
      )}
    </div>
  );
};

export default CourseDetail;


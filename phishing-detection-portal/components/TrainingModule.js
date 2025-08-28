import { useState, useEffect } from 'react';
import axios from 'axios';

export default function TrainingModule() {
  const [modules, setModules] = useState([]);
  const [currentModule, setCurrentModule] = useState(null);
  const [userProgress, setUserProgress] = useState({});
  const [quizMode, setQuizMode] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    loadTrainingModules();
  }, []);

  const loadTrainingModules = async () => {
    try {
      const response = await axios.get('/api/training-modules');
      setModules(response.data);
    } catch (error) {
      console.error('Failed to load training modules:', error);
    }
  };

  const startModule = (module) => {
    setCurrentModule(module);
    setQuizMode(false);
    setCurrentQuestion(0);
    setScore(0);
    setCompleted(false);
  };

  const startQuiz = () => {
    setQuizMode(true);
    setCurrentQuestion(0);
    setSelectedAnswer('');
  };

  const submitAnswer = () => {
    if (!selectedAnswer) return;

    const isCorrect = selectedAnswer === currentModule.quiz[currentQuestion].correct;
    if (isCorrect) setScore(score + 1);

    if (currentQuestion + 1 < currentModule.quiz.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer('');
    } else {
      setCompleted(true);
      const progress = { ...userProgress };
      progress[currentModule.id] = {
        completed: true,
        score: score + (isCorrect ? 1 : 0),
        total: currentModule.quiz.length,
        completedAt: new Date().toISOString()
      };
      setUserProgress(progress);
    }
  };

  if (currentModule && quizMode) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Quiz: {currentModule.title}</h2>
            <button
              onClick={() => setCurrentModule(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕ Close
            </button>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Question {currentQuestion + 1} of {currentModule.quiz.length}
          </div>
        </div>

        {!completed ? (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-3">
                {currentModule.quiz[currentQuestion].question}
              </h3>
              <div className="space-y-2">
                {currentModule.quiz[currentQuestion].options.map((option, index) => (
                  <label key={index} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="answer"
                      value={option}
                      checked={selectedAnswer === option}
                      onChange={(e) => setSelectedAnswer(e.target.value)}
                      className="text-blue-600"
                    />
                    <span className="text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={submitAnswer}
              disabled={!selectedAnswer}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {currentQuestion + 1 === currentModule.quiz.length ? 'Finish Quiz' : 'Next Question'}
            </button>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🎉</div>
            <h3 className="text-xl font-semibold mb-2">Quiz Completed!</h3>
            <p className="text-gray-600 mb-4">
              Your score: {score} out of {currentModule.quiz.length}
            </p>
            <div className="space-x-4">
              <button
                onClick={() => setCurrentModule(null)}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
              >
                Back to Modules
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (currentModule) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">{currentModule.title}</h2>
            <button
              onClick={() => setCurrentModule(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕ Close
            </button>
          </div>
          <p className="text-gray-600 mt-1">{currentModule.description}</p>
        </div>

        <div className="prose max-w-none mb-8">
          <div dangerouslySetInnerHTML={{ __html: currentModule.content }} />
        </div>

        <div className="flex space-x-4">
          <button
            onClick={startQuiz}
            className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
          >
            Take Quiz ({currentModule.quiz.length} questions)
          </button>
          <button
            onClick={() => setCurrentModule(null)}
            className="border border-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-50"
          >
            Back to Modules
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Security Training Modules</h2>
        <p className="text-gray-600 mb-6">
          Complete these interactive training modules to improve your cybersecurity awareness.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => {
            const progress = userProgress[module.id];
            return (
              <div key={module.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">{module.title}</h3>
                  {progress?.completed && (
                    <span className="text-green-600 text-sm">✓ Completed</span>
                  )}
                </div>
                
                <p className="text-gray-600 text-sm mb-4">{module.description}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>🕐 {module.duration}</span>
                  <span>📝 {module.quiz.length} questions</span>
                </div>

                {progress?.completed && (
                  <div className="text-sm text-green-600 mb-3">
                    Score: {progress.score}/{progress.total}
                  </div>
                )}

                <button
                  onClick={() => startModule(module)}
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 text-sm"
                >
                  {progress?.completed ? 'Review Module' : 'Start Module'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

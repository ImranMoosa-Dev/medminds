import axios from "../utils/AxiosConfig";

const BASE_URL = process.env.REACT_APP_BASEURL;

// get all quizzez
export const getAllQuizzes = async () => {
  const { data } = await axios.get(`${BASE_URL}/api/v1/quizzes`);
  return data;
};

// get quiz details by quizId
export const getQuizById = async (quizId) => {
  const { data } = await axios.get(`${BASE_URL}/api/v1/quizzes/quiz/${quizId}`);

  return data;
};

// Submit Quiz
export const submitQuiz = async (quizId, answers) => {
  const { data } = await axios.post(
    `${BASE_URL}/api/v1/quizzes/submit/${quizId}`,
    { answers },
  );

  return data;
};

// save quiz progress
export const saveQuizProgress = async (attemptId, payload) => {
  const { data } = await axios.put(
    `${BASE_URL}/api/v1/quizzes/save-progress/${attemptId}}`,
    payload,
  );
  return data;
};

// get started quiz
export const startQuiz = async (quizId) => {
  const { data } = await axios.get(
    `${BASE_URL}/api/v1/quizzes/start/${quizId}`,
  );
  return data;
};

// get quiz result
export const getQuizResult = async (attemptId) => {
  const { data } = await axios.get(
    `${BASE_URL}/api/v1/quizzes/result/${attemptId}`,
  );
  return data;
};

// get quiz history
export const getQuizHistory = async () => {
  const { data } = await axios.get(`${BASE_URL}/api/v1/quizzes/history`);
  return data;
};

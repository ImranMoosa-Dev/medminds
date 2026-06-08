import axios from "../utils/AxiosConfig";

const BASE_URL = process.env.REACT_APP_BASEURL;

// get custom quiz details by attemp id
export const getCustomQuizById = async (attemptId) => {
  const { data } = await axios.get(
    `${BASE_URL}/api/v1/custom-quiz/details/${attemptId}`,
  );

  return data;
};

// Create custom quiz
export const createCustomQuiz = async (payload) => {
  const { data } = await axios.post(`${BASE_URL}/api/v1/custom-quiz/create`, {
    payload,
  });
  return data;
};

// get custom quiz result
export const getCustomQuizResult = async (attemptId) => {
  const { data } = await axios.get(
    `${BASE_URL}/api/v1/custom-quiz/result/${attemptId}`,
  );
  return data;
};

// get started custom quiz
export const startCustomQuiz = async (customAttemptId) => {
  const { data } = await axios.get(
    `${BASE_URL}/api/v1/custom-quiz/start/${customAttemptId}`,
  );
  return data;
};

// submit custom quiz
export const submitCustomQuiz = async (attemptId, answers) => {
  const { data } = await axios.post(
    `${BASE_URL}/api/v1/custom-quiz/submit/${attemptId}`,
    { answers },
  );
  return data;
};

// save custom quiz progress
export const saveCustomQuizProgress = async (attemptId, payload) => {
  const { data } = await axios.put(
    `${BASE_URL}/api/v1/custom-quiz/save-progress/${attemptId}`,
    { payload },
  );
  return data;
};

// get all custom quiz attempts history
export const getCustomQuizAttemptsHistory = async () => {
  const { data } = await axios.get(`${BASE_URL}/api/v1/custom-quiz/history`);
  return data;
};

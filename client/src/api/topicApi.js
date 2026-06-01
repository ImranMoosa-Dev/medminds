import axios from "../utils/AxiosConfig";

const BASE_URL = process.env.REACT_APP_BASEURL;

// get topics by subjectId
export const getTopicBySubjectId = async (selectedSubjectIds) => {
  const { data } = await axios.post(`${BASE_URL}/api/v1/topics/by-subjects`, {
    selectedSubjectIds,
  });
  return data;
};

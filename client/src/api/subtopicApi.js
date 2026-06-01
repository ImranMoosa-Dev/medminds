import axios from "../utils/AxiosConfig";

const BASE_URL = process.env.REACT_APP_BASEURL;

// get subtopics by topicId
export const getSubtopicsByTopicId = async (selectedTopicIds) => {
  const { data } = await axios.post(`${BASE_URL}/api/v1/subtopics/by-topics`, {
    selectedTopicIds,
  });
  return data;
};

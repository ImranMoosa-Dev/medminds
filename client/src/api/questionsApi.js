import axios from "../utils/AxiosConfig";

const BASE_URL = process.env.REACT_APP_BASEURL;

// get questions count by subtopicIds
export const getQuestionsCountBySubtopicId = async (selectedsubtopicIds) => {
  const { data } = await axios.post(`${BASE_URL}/api/v1/questions/count`, {
    selectedsubtopicIds,
  });

  return data;
};

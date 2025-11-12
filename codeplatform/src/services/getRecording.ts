import axios from "axios";

const client_id = import.meta.env.DEV
  ? import.meta.env.VITE_API_SECRET_KEY_DEFAULT_NO_EXPIRATION_CLIENT_ID_DEVELOPMENT
  : import.meta.env.VITE_API_SECRET_KEY_DEFAULT_NO_EXPIRATION_CLIENT_ID_PRODUCTION;

const secret = import.meta.env.DEV
  ? import.meta.env.VITE_API_SECRET_KEY_DEFAULT_NO_EXPIRATION_SECRET_DEVELOPMENT
  : import.meta.env.VITE_API_SECRET_KEY_DEFAULT_NO_EXPIRATION_SECRET_PRODUCTION;

const getRecordings = async () => {
  try {
    const response = await axios.get("https://api.superviz.com/recording", {
      headers: {
        "Content-Type": "application/json",
        client_id: client_id,
        secret: secret,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching recordings:", error);
    throw error;
  }
};

export default getRecordings;

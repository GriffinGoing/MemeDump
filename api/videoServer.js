import axios from "axios";
import { YouTubeKey } from "../credentials/youtubeCreds";

const YouTubeServer = axios.create({
  baseURL: "https://www.googleapis.com/youtube/v3/videos",
})

YouTubeServer.interceptors.request.use(
  async (config) => {
    config.headers.Accept = "application/json"
    return config
  },
  (err) => {
    return Promise.reject(err)
  }
)

export const getVideoDetails = async (videoID, callback) => {
  //console.log(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=${key}`)
  const response = await YouTubeServer.get(
    `?part=snippet&id=${videoID}&key=${YouTubeKey}`
  )
  callback(response.data)
}
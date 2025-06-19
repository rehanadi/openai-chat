import { writeFileSync } from "fs"
import OpenAI from "openai"

const openai = new OpenAI()

const generateFreeImage = async () => {
  const response = await openai.images.generate({
    prompt: "A photo of a cat on a mat",
    model: "dall-e-2",
    size: "256x256",
    // style: "vivid",
    // quality: "standard",
    n: 1,
  })

  console.log(response)
}

const saveFreeImage = async () => {
  const response = await openai.images.generate({
    prompt: "A photo of a cat on a mat",
    model: "dall-e-2",
    size: "256x256",
    n: 1,
    response_format: "b64_json",
  })

  const rawImage =
    response.data && response.data[0] ? response.data[0].b64_json : undefined

  if (rawImage) {
    writeFileSync("public/images/catMat.png", Buffer.from(rawImage, "base64"))
  }
}

const saveAdvanceImage = async () => {
  const response = await openai.images.generate({
    prompt: "Photo of a city at night with skyscrapers",
    model: "dall-e-3",
    quality: "hd",
    size: "1024x1024",
    response_format: "b64_json",
    n: 1,
  })

  const rawImage =
    response.data && response.data[0] ? response.data[0].b64_json : undefined

  if (rawImage) {
    writeFileSync(
      "public/images/cityNight.png",
      Buffer.from(rawImage, "base64")
    )
  }
}

// generateFreeImage()
// saveFreeImage()
saveAdvanceImage()

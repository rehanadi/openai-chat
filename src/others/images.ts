import { createReadStream, writeFileSync } from "fs"
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

const generateFreeLocalImage = async () => {
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

const generateAdvanceImage = async () => {
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

const generateImageVariation = async () => {
  const response = await openai.images.createVariation({
    image: createReadStream("public/images/cityNight.png"),
    model: "dall-e-2",
    response_format: "b64_json",
    n: 1,
  })

  const rawImage =
    response.data && response.data[0] ? response.data[0].b64_json : undefined

  if (rawImage) {
    writeFileSync(
      "public/images/cityNightVariation.png",
      Buffer.from(rawImage, "base64")
    )
  }
}

const editImage = async () => {
  const response = await openai.images.edit({
    image: createReadStream("public/images/cityNight.png"),
    mask: createReadStream("public/images/cityNightMask.png"),
    prompt: "Add thunderstorm to the sky",
    model: "dall-e-2",
    response_format: "b64_json",
    n: 1,
  })

  const rawImage =
    response.data && response.data[0] ? response.data[0].b64_json : undefined

  if (rawImage) {
    writeFileSync(
      "public/images/cityNightEdited.png",
      Buffer.from(rawImage, "base64")
    )
  }
}
// generateFreeImage()
// generateFreeLocalImage()
// generateAdvanceImage()
// generateImageVariation()
editImage()

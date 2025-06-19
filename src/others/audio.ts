import OpenAI from "openai"
import { createReadStream, writeFileSync } from "fs"

const openai = new OpenAI()

// speech to text
const createTranscription = async () => {
  const response = await openai.audio.transcriptions.create({
    file: createReadStream("public/audio/AudioSample.m4a"),
    model: "whisper-1",
    language: "en",
  })

  console.log(response)
  /*
  {
    text: "And yes, now we have a new entry called City Edited and let's see what it did. Yes, it added a thunder to our image, it looks alright in my opinion, it can do better, but this is the way we can work or we can start to work with the DALI 2 and 3 models from OpenAI. Let's proceed into the next lectures of this section and talk about audio models."
  }
  */
}

// translate
const translate = async () => {
  const response = await openai.audio.translations.create({
    file: createReadStream("public/audio/FrenchSample.m4a"),
    model: "whisper-1",
  })

  console.log(response)
  /*
  {
    text: 'France takes its name from the Franks, a Germanic people who established the first foundations on the base of the Roman Gaul. The name Frank comes from the proto-Germanic frankon, which means javelin or spear, or maybe the word Frank, which meant free man.'
  }
  */
}

// text to speech
const textToSpeech = async () => {
  const sampleText =
    "France takes its name from the Franks, a Germanic people who established the first foundations on the base of the Roman Gaul."

  const response = await openai.audio.speech.create({
    input: sampleText,
    model: "tts-1",
    voice: "alloy",
    response_format: "mp3",
  })

  const buffer = Buffer.from(await response.arrayBuffer())
  writeFileSync("public/audio/French.mp3", buffer)
}

// createTranscription()
// translate()
// textToSpeech()

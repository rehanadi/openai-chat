import OpenAI from "openai"

const openai = new OpenAI({})

const context: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
  {
    role: "system",
    content: "You are a helpful chatbot.",
  },
]

const createChatCompletion = async () => {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: context,
  })

  const responseMessage = response.choices[0].message
  context.push(responseMessage)

  console.log(`${responseMessage.role}: ${responseMessage.content}\n`)
}

process.stdin.addListener("data", async (input) => {
  const userInput = input.toString().trim()

  context.push({
    role: "user",
    content: userInput,
  })

  await createChatCompletion()
})

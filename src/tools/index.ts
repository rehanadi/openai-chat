import OpenAI from "openai"

const openAI = new OpenAI()

const getTimeOfDay = () => {
  return "5:45"
}

const callOpenAIWIthTools = async () => {
  const context: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content:
        "You are a helpful assistant that gives information about the time of day.",
    },
    {
      role: "user",
      content: "What is the time of day?",
    },
  ]

  // configure chat tools for reasoning (first openAI call)
  const response = await openAI.chat.completions.create({
    model: "gpt-4o",
    messages: context,
    tools: [
      {
        type: "function",
        function: {
          name: "getTimeOfDay",
          description: "Get the current time of day.",
        },
      },
    ],
    tool_choice: "auto", // the engine will decide which tool to use
  })

  // decide if tool call is required
  const willInvokeFunction = response.choices[0].finish_reason === "tool_calls"

  if (willInvokeFunction) {
    // invoke the tool
    const toolCall = response.choices[0].message.tool_calls![0]
    const toolName = toolCall.function.name

    if (toolName === "getTimeOfDay") {
      const toolResponse = getTimeOfDay()

      context.push(response.choices[0].message)
      context.push({
        role: "tool",
        content: toolResponse,
        tool_call_id: toolCall.id,
      })
    }
  }

  // make a second openAI call with the tool response
  const secondResponse = await openAI.chat.completions.create({
    model: "gpt-4o",
    messages: context,
  })

  console.log(secondResponse.choices[0].message.content)

  console.log("Final context:", context)
}

callOpenAIWIthTools()

/*
context:
[
  {
    role: 'system',
    content: 'You are a helpful assistant that gives information about the time of day.'
  },
  { role: 'user', content: 'What is the time of day?' },
  {
    role: 'assistant',
    content: null,
    tool_calls: [ [Object] ],
    refusal: null,
    annotations: []
  },
  {
    role: 'tool',
    content: '5:45',
    tool_call_id: 'call_Dp9IHJxg4Ja6PWGBJkDXqR8D'
  }
]
*/

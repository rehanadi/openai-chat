import OpenAI from "openai"

const openAI = new OpenAI()

const getTimeOfDay = () => {
  return "5:45"
}

const getOrderStatus = (orderId: string) => {
  console.log(`Getting the status of order ID: ${orderId}`)
  const orderAsNumber = parseInt(orderId)

  if (orderAsNumber % 2 === 0) {
    return "IN_PROGRESS"
  }

  return "COMPLETED"
}

const callOpenAIWIthTools = async () => {
  const context: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content:
        "You are a helpful assistant that gives information about the time of day and order status.",
    },
    // {
    //   role: "user",
    //   content: "What is the time of day?",
    // },
    {
      role: "user",
      content: "What is the status of order 1234?",
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
      {
        type: "function",
        function: {
          name: "getOrderStatus",
          description: "Returns the status of an order.",
          parameters: {
            type: "object",
            properties: {
              orderId: {
                type: "string",
                description: "The ID of the order to get the status of.",
              },
            },
            required: ["orderId"],
          },
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

      // assistant message with tool calls
      context.push(response.choices[0].message)

      // tool message with tool response
      context.push({
        role: "tool",
        content: toolResponse,
        tool_call_id: toolCall.id,
      })
    }

    if (toolName === "getOrderStatus") {
      const args = JSON.parse(toolCall.function.arguments)
      const toolResponse = getOrderStatus(args.orderId)

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

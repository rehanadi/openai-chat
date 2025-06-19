import OpenAI from "openai"

const openAI = new OpenAI()

const getAvailableFlights = (
  departure: string,
  destination: string
): string[] => {
  console.log("Getting available flights...")

  if (departure === "SFO" && destination === "LAX") {
    return ["UA 123", "AA 456"]
  } else if (departure === "DFW" && destination === "LAX") {
    return ["AA 789"]
  } else {
    return ["66 FSFG"]
  }
}

const reverseFlight = (flightNumber: string): string | "FULLY_BOOKED" => {
  if (flightNumber.length === 6) {
    console.log(`Reversing flight: ${flightNumber}`)
    return "123456"
  } else {
    return "FULLY_BOOKED"
  }
}

const context: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
  {
    role: "system",
    content:
      "You are a helpful flight assistant that gives information about flights and makes reservations.",
  },
]

const callOpenAIWIthTools = async () => {
  const response = await openAI.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.0,
    messages: context,
    tools: [
      {
        type: "function",
        function: {
          name: "getAvailableFlights",
          description: "Get available flights between two cities.",
          parameters: {
            type: "object",
            properties: {
              departure: {
                type: "string",
                description: "The departure city code.",
              },
              destination: {
                type: "string",
                description: "The destination city code.",
              },
            },
            required: ["departure", "destination"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "reverseFlight",
          description:
            "Reverse a flight reservation by flight number, returns new flight number or 'FULLY_BOOKED'.",
          parameters: {
            type: "object",
            properties: {
              flightNumber: {
                type: "string",
                description:
                  "The flight number to reverse, must be 6 characters long.",
              },
            },
            required: ["flightNumber"],
          },
        },
      },
    ],
    tool_choice: "auto",
  })

  const willInvokeFunction = response.choices[0].finish_reason === "tool_calls"

  if (willInvokeFunction) {
    const toolCall = response.choices[0].message.tool_calls![0]
    const toolName = toolCall.function.name
    const args = JSON.parse(toolCall.function.arguments)

    if (toolName === "getAvailableFlights") {
      const flights = getAvailableFlights(args.departure, args.destination)

      context.push(response.choices[0].message)
      context.push({
        role: "tool",
        content: flights.toString(),
        tool_call_id: toolCall.id,
      })
    }

    if (toolName === "reverseFlight") {
      const flightNumber = args.flightNumber
      const toolResponse = reverseFlight(flightNumber)

      context.push(response.choices[0].message)
      context.push({
        role: "tool",
        content: toolResponse,
        tool_call_id: toolCall.id,
      })
    }
  }

  const secondResponse = await openAI.chat.completions.create({
    model: "gpt-4o",
    messages: context,
  })

  console.log(secondResponse.choices[0].message)
}

console.log("Welcome to the Flight Assistant!")
process.stdin.addListener("data", async (input) => {
  const userInput = input.toString().trim()

  context.push({
    role: "user",
    content: userInput,
  })

  await callOpenAIWIthTools()
})

/*
User: Are there flights between SFO and LAX?
Assistant: Yes, there are flights between San Francisco International Airport (SFO) and Los Angeles International Airport (LAX). Some of the available flights include:
- United Airlines Flight UA 123
- American Airlines Flight AA 456
Would you like more information or assistance with booking?

User: Please make a reservation for the second flight
Assistant: Your reservation has been successfully made for flight AA 456. Your confirmation number is 123456. Safe travels!
*/

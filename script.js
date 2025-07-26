/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Set initial message
chatWindow.textContent = "👋 Hello! How can I help you today?";

// Conversation history for multi-turn context
let conversationHistory = [];

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get the user's question
  const question = userInput.value;

  // Typewriter effect for user's question with 'You: ' just above the AI's response
  const typeUserQuestion = async (text) => {
    const userMsgDiv = document.createElement("div");
    userMsgDiv.className = "msg user";
    chatWindow.appendChild(userMsgDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
    const displayText = `You: ${text}`;
    for (let i = 0; i < displayText.length; i++) {
      userMsgDiv.textContent += displayText[i];
      chatWindow.scrollTop = chatWindow.scrollHeight;
      await new Promise((res) => setTimeout(res, 6));
    }
  };
  await typeUserQuestion(question);
  userInput.value = "";

  // Add the user's message to the conversation history
  conversationHistory.push({ role: "user", content: question });

  // System message to restrict the assistant's scope
  const systemMessage = {
    role: "system",
    content:
      "You are a helpful assistant for L'Oréal. Only answer questions about L'Oréal, its products, routines, recommendations, and beauty-related topics. If a user asks about other brands, unrelated topics, or anything not related to L'Oréal or beauty, politely refuse and explain that you can only discuss L'Oréal products, services, routines, recommendations, and beauty-related matters. Never answer questions about social criticisms or unrelated topics. If the user tells you their name, remember it and use it in future responses.",
  };

  // Prepare messages array for OpenAI API (system + full conversation)
  const messages = [systemMessage, ...conversationHistory];

  // Show loading message
  chatWindow.innerHTML += `<div class="msg ai">Thinking...</div>`;
  chatWindow.scrollTop = chatWindow.scrollHeight;

  try {
    // Call OpenAI API
    const response = await fetch(
      "https://young-sky-1bbe.bv8728a.workers.dev/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: messages,
        }),
      }
    );

    const data = await response.json();

    // Remove loading message
    const loadingMsg = document.querySelector(".msg.ai:last-child");
    if (loadingMsg && loadingMsg.textContent === "Thinking...") {
      loadingMsg.remove();
    }

    // Get the assistant's reply
    const aiReply =
      data.choices &&
      data.choices[0] &&
      data.choices[0].message &&
      data.choices[0].message.content
        ? data.choices[0].message.content
        : "Sorry, I couldn't get a response. Please try again.";

    // Add the assistant's reply to the conversation history
    conversationHistory.push({ role: "assistant", content: aiReply });

    // Typewriter effect for assistant's reply
    const typeReply = async (text) => {
      const msgDiv = document.createElement("div");
      msgDiv.className = "msg ai";
      chatWindow.appendChild(msgDiv);
      chatWindow.scrollTop = chatWindow.scrollHeight;
      for (let i = 0; i < text.length; i++) {
        msgDiv.textContent += text[i];
        chatWindow.scrollTop = chatWindow.scrollHeight;
        await new Promise((res) => setTimeout(res, 6)); // 3x faster typing
      }
    };
    await typeReply(aiReply);
  } catch (error) {
    // Remove loading message
    const loadingMsg = document.querySelector(".msg.ai:last-child");
    if (loadingMsg && loadingMsg.textContent === "Thinking...") {
      loadingMsg.remove();
    }
    chatWindow.innerHTML += `<div class="msg ai">Sorry, there was an error. Please try again.</div>`;
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }
});

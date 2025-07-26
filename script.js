/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Set initial message
chatWindow.textContent = "👋 Hello! How can I help you today?";

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get the user's question
  const question = userInput.value;

  // Show user's message in the chat window
  chatWindow.innerHTML += `<div class="msg user">${question}</div>`;
  chatWindow.scrollTop = chatWindow.scrollHeight;
  userInput.value = "";

  // System message to restrict the assistant's scope
  const systemMessage = {
    role: "system",
    content:
      "You are a helpful assistant for L'Oréal. Only answer questions about L'Oréal, its products, routines, recommendations, and beauty-related topics. If a user asks about other brands, unrelated topics, or anything not related to L'Oréal or beauty, politely refuse and explain that you can only discuss L'Oréal products, services, routines, recommendations, and beauty-related matters. Never answer questions about social criticisms or unrelated topics.",
  };

  // Prepare messages array for OpenAI API
  const messages = [systemMessage, { role: "user", content: question }];

  // Show loading message
  chatWindow.innerHTML += `<div class="msg ai">Thinking...</div>`;
  chatWindow.scrollTop = chatWindow.scrollHeight;

  try {
    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: messages,
      }),
    });

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

    // Show assistant's reply
    chatWindow.innerHTML += `<div class="msg ai">${aiReply}</div>`;
    chatWindow.scrollTop = chatWindow.scrollHeight;
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

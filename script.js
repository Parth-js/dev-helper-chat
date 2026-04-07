document.addEventListener("DOMContentLoaded", function () {
  const chat = document.getElementById("chatcontainer");
  const chatbox = document.querySelector(".chatbox");
  const chatInput = document.getElementById("messageInput");
  const sendBtn = document.getElementById("btn");

  sendBtn.addEventListener("click", sendMessage);
  chatInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      sendMessage();
    }
  });

  async function sendMessage() {
    const userMess = chatInput.value.trim();
    if (userMess) {
      appendMessage("user", userMess);
      chatInput.value = "";


      showLoader();

      try {
        const botreply = await getBotRes(userMess);
        appendMessage("bot", botreply);
        removeLoader();
      } catch (error) {
        removeLoader();
        appendMessage("bot", "Error:" + error.message);
      }
    }
  }

  // sender message start

  function appendMessage(sender, message) {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", sender);
    messageElement.textContent = message;
    chatbox.appendChild(messageElement);
    chatbox.scrollTop = chatbox.scrollHeight;
    // console.log(chatbox);
  }
  // sender message end

  // Gen data from AI
  chat.addEventListener("submit", async (e) => {
    
    e.preventDefault();
    const message = chatInput.value.trim();
    if (!message) return;
    //Todo: add user message to chat
    addMessage(message, true);
    
    chatInput.value = "";
    chatInput.style.height = "auto";
    sendBtn.disabled = true;
    //Todo:Show Typing
    const typingIndicator = showTypingIndicator();
    try {
      //Todo:Generate response-Function
      const response = await generateResponse(message);
      typingIndicator.remove();
      //Ad AI response
      addMessage(response, false);
    } catch (error) {
      typingIndicator.remove();
      addErrorMessage(error.message);
    } finally {
      sendBtn.disabled = false;
    }
  });


  async function getBotRes(prompt) {
    const apiKey =  "API_KEY";
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  // text: prompt,
                  text: `
                      You are an expert full-stack developer and coding mentor.
                      Assist software engineers with debugging, optimization, and best practices.
                      Rules:
                      - Keep answers short and structured.
                      - Prefer bullet points.
                      - Provide minimal clean code examples.
                      - Suggest better approaches if applicable.
                      - No long paragraphs.

                      User request: ${prompt}
                      `,
                },
              ],
            },
          ],
        }),
      },
    );
    if (!response.ok) {
      throw new Error("Failed  to generate the responaw");
    }
    const data = await response.json();
    console.log(data);

    return data.candidates[0].content.parts[0].text;
  }

  // gen data end

  // prof start
  function appendMessage(sender, message) {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", sender);

    const avatar = document.createElement("div");
    avatar.classList.add("avatar");
    avatar.textContent = sender === "user" ? "U" : "AI";

    const content = document.createElement("div");
    content.classList.add("content");

    const name = document.createElement("div");
    name.classList.add("name");
    name.textContent = sender === "user" ? "You" : "AI Assistant";

    const text = document.createElement("div");
    text.classList.add("text");
    text.textContent = message;

    content.appendChild(name);
    content.appendChild(text);

    messageElement.appendChild(avatar);
    messageElement.appendChild(content);

    chatbox.appendChild(messageElement);
    chatbox.scrollTop = chatbox.scrollHeight;
  }

  // prof end

  //load
  function showLoader() {
    const loader = document.createElement("div");
    loader.classList.add("loader");
    loader.id = "loader";
    chatbox.appendChild(loader);
    chatbox.scrollTop = chatbox.scrollHeight;
  }

  function removeLoader() {
    const loader = document.getElementById("loader");
    if (loader) loader.remove();
  }
  //end load
});

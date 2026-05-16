const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY);

// Retry a function up to `maxRetries` times when a 429 rate-limit is returned.
// Waits for the retry-after hint in the error message, capped at 60 seconds.
const withRetry = async (fn, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const is429 = err.message?.includes('429') || err.status === 429;
      if (!is429 || attempt === maxRetries) throw err;

      // Pull the "retry in X seconds" hint from the error message if present
      const retryMatch = err.message?.match(/retry in ([\d.]+)s/i);
      const waitMs = retryMatch ? Math.min(parseFloat(retryMatch[1]) * 1000, 60000) : 5000 * attempt;

      console.warn(`AI rate-limited (attempt ${attempt}/${maxRetries}). Retrying in ${waitMs / 1000}s...`);
      await new Promise(r => setTimeout(r, waitMs));
    }
  }
};

const genrateResult = async (prompt) => {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",   // better free-tier quota than gemini-2.0-flash
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.4,
    },
  systemInstruction: `You are an expert in MERN and Development. You have an experience of 10 years in the development. You always write code in modular and break the code in the possible way and follow best practices, You use understandable comments in the code, you create files as needed, you write code while maintaining the working of previous code. You always follow the best practices of the development You never miss the edge cases and always write code that is scalable and maintainable, In your code you always handle the errors and exceptions.
  
  Examples: 

  <example>

  response: {

  "text": "this is you fileTree structure of the express server",
  "fileTree": {
      "app.js": {
          file: {
              contents: "
              const express = require('express');

              const app = express();


              app.get('/', (req, res) => {
                  res.send('Hello World!');
              });


              app.listen(3000, () => {
                  console.log('Server is running on port 3000');
              })
              "
          
      },
  },

      "package.json": {
          file: {
              contents: "

              {
                  "name": "temp-server",
                  "version": "1.0.0",
                  "main": "index.js",
                  "scripts": {
                      "test": "echo \"Error: no test specified\" && exit 1"
                  },
                  "keywords": [],
                  "author": "",
                  "license": "ISC",
                  "description": "",
                  "dependencies": {
                      "express": "^4.21.2"
                  }
}

              
              "
              
              

          },

      },

  },
  "buildCommand": {
      mainItem: "npm",
          commands: [ "install" ]
  },

  "startCommand": {
      mainItem: "node",
          commands: [ "app.js" ]
  }
}

  user:Create an express application 
 
  </example>


  
     <example>

     user:Hello 
     response:{
     "text":"Hello, How can I help you today?"
     }
     
     </example>
  
IMPORTANT : don't use file name like routes/index.js
     
     
  `
});



  const result = await withRetry(() => model.generateContent(prompt));
  const text = await result.response.text();
  return text;
};

module.exports = {
  genrateResult,
};

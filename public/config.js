// config.js
module.exports = function configJSON(req) {
  return {
    name: "My Custom Activity",
    description: "A description of the custom activity",
    icon: "path/to/icon.png", // Ensure this path is correct and the file exists
    edit: {
      url: "https://your-edit-url.com" // Make sure this URL is valid
    },
    execute: {
      url: "https://your-execute-url.com" // Make sure this URL is valid
    },
    schema: {
      arguments: {
        execute: {
          inArguments: [], // Add any input arguments if needed
          outArguments: [] // Add any output arguments if needed
        }
      }
    }
  };
};

// Example usage in another file
const configJSON = require('./config.js');

// Use the configJSON function
const config = configJSON();
console.log(config);

console.log("Logging Enabled:", process.env.REACT_APP_ENABLE_LOGS);
console.log("Warnings Enabled:", process.env.REACT_APP_ENABLE_WARNS);
console.log("Errors Enabled:", process.env.REACT_APP_ENABLE_ERRORS);

const LOGGING_ENABLED = process.env.REACT_APP_ENABLE_LOGS === "true";
const WARNINGS_ENABLED = process.env.REACT_APP_ENABLE_WARNS === "true";
const ERRORS_ENABLED = process.env.REACT_APP_ENABLE_ERRORS === "true";

// Override console methods based on the environment variables
if (!LOGGING_ENABLED) {
  console.log = () => {}; // No-op function to disable console.log
}

if (!WARNINGS_ENABLED) {
  console.warn = () => {}; // No-op function to disable console.warn
}

if (!ERRORS_ENABLED) {
  console.error = () => {}; // No-op function to disable console.error
}

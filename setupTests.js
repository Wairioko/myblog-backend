// setupTests.js
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Additional logging or error handling can be added here
    throw reason; // Rethrow the error to ensure the test suite fails
  });


  jest.setTimeout(10000); // Increase the default timeout to 10 seconds for testing purposes

// Other setup code can be added here...
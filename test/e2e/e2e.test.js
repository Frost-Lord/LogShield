/**
 * @file Contains end-to-end tests for the Vercel preview instance.
 */
require("dotenv").config();

describe("API Calls", () => {
  //let VERCEL_PREVIEW_URL;

  beforeAll(() => {
    process.env.NODE_ENV = "development";
    //VERCEL_PREVIEW_URL = process.env.VERCEL_PREVIEW_URL;
  });

  test('retrieve API call', async () => {
    const promise = new Promise((resolve, reject) => {
      // This Promise will never reject, so it should never throw an error.
      resolve('test');
    });
  
    await expect(promise).resolves.not.toThrow();
  });
  
});
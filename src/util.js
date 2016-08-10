import request from 'request';

export function getJSON(url) {
  // return new pending promise
  return new Promise((resolve, reject) => {
    request(url, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        resolve(body);
      } else {
        reject(new Error(`Failed to load page, status code:  ${response.statusCode}`));
      }
    });
  });
}

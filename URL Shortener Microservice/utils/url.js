const re = new RegExp(
  /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/
);
const urlValidate = (url) => {
  console.log(url);

  return re.test(url);
};
const removeHTTP = (url) => {
  url = url.replace(/^(?:https?:\/\/)?(?:www\.)?/, "");

  url = url.split("/")[0];

  return url;
};

exports.urlValidate = urlValidate;
exports.removeHTTP = removeHTTP;

const re = new RegExp(
  "((http|https)://)(www.)?[a-zA-Z0-9@:%._\\+~#?&//=]{2,256}\\.[a-z]{2,6}\\b([-a-zA-Z0-9@:%._\\+~#?&//=]*)"
);
const urlValidate = (url) => {
  return re.test(url);
};
const removeHTTP = (url) => {
  url = url.replace(/^(?:https?:\/\/)?(?:www\.)?/, "");
  url = url.split("/")[0];
  return url;
};

exports.urlValidate = urlValidate;
exports.removeHTTP = removeHTTP;

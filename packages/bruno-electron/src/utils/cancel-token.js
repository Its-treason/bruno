// TODO: This should be a Map
const cancelTokens = {};

const saveCancelToken = (uid, abortController) => {
  cancelTokens[uid] = abortController;
};

const deleteCancelToken = (uid) => {
  delete cancelTokens[uid];
};

module.exports = {
  cancelTokens,
  saveCancelToken,
  deleteCancelToken
};

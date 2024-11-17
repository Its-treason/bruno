import { randomUUID } from 'node:crypto';

const uuid = () => {
  return randomUUID().replaceAll('-', '');
};

const stringifyJson = async (str) => {
  try {
    return JSON.stringify(str, null, 2);
  } catch (err) {
    return Promise.reject(err);
  }
};

const parseJson = async (obj) => {
  try {
    return JSON.parse(obj);
  } catch (err) {
    return Promise.reject(err);
  }
};

const safeStringifyJSON = (data) => {
  try {
    return JSON.stringify(data);
  } catch (e) {
    return data;
  }
};

const safeParseJSON = (data) => {
  try {
    return JSON.parse(data);
  } catch (e) {
    return data;
  }
};

const simpleHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash &= hash; // Convert to 32bit integer
  }
  return new Uint32Array([hash])[0].toString(36);
};

const generateUidBasedOnHash = (str) => {
  const hash = simpleHash(str);

  return `${hash}`.padEnd(21, '0');
};

module.exports = {
  uuid,
  stringifyJson,
  parseJson,
  safeStringifyJSON,
  safeParseJSON,
  simpleHash,
  generateUidBasedOnHash
};

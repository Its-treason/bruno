const { CookieJar } = require('tough-cookie');
const each = require('lodash/each');

const cookieJar = new CookieJar();

const getDomainsWithCookies = () => {
  return new Promise((resolve, reject) => {
    const domainCookieMap = {};

    cookieJar.store.getAllCookies((err, cookies) => {
      if (err) {
        return reject(err);
      }

      cookies.forEach((cookie) => {
        if (!domainCookieMap[cookie.domain]) {
          domainCookieMap[cookie.domain] = [cookie];
        } else {
          domainCookieMap[cookie.domain].push(cookie);
        }
      });

      const domains = Object.keys(domainCookieMap);
      const domainsWithCookies = [];

      each(domains, (domain) => {
        const cookies = domainCookieMap[domain];
        const validCookies = cookies.filter((cookie) => !cookie.expires || cookie.expires > Date.now());

        if (validCookies.length) {
          domainsWithCookies.push({
            domain,
            cookies: validCookies,
            cookieString: validCookies.map((cookie) => cookie.cookieString()).join('; ')
          });
        }
      });

      resolve(domainsWithCookies);
    });
  });
};

const deleteCookiesForDomain = (domain) => {
  return new Promise((resolve, reject) => {
    cookieJar.store.removeCookies(domain, null, (err) => {
      if (err) {
        return reject(err);
      }

      return resolve();
    });
  });
};

module.exports = {
  getDomainsWithCookies,
  deleteCookiesForDomain,
  cookieJar
};

import { Cookie } from '../entities/Cookie';
import { TabEventHandler } from './TabEventHandler';

const HEADER_NAME = {
  SET_COOKIE: 'set-cookie',
};

export class CookieTracker {
  constructor({ repository }) {
    this.repository = repository;
    this.tabHandler = new TabEventHandler({ repository });
  }

  start() {
    const { VENDOR } = process.env;

    const onHeadersReceivedOptions = ['blocking', 'responseHeaders'];

    browser.webRequest.onHeadersReceived.addListener(
      (details) => {
        const { responseHeaders, tabId, url } = details;

        const site = this.repository.findByTabId(tabId);

        const hasCookies = (responseHeaders || []).some(
          (header) => header.name.toLowerCase() === HEADER_NAME.SET_COOKIE,
        );

        if (!site || !hasCookies) {
          return;
        }

        site.addCookie({ cookie: new Cookie({ url }) });
      },
      { urls: ['http://*/*', 'https://*/*'] },
      VENDOR === 'chrome' ? onHeadersReceivedOptions.concat('extraHeaders') : onHeadersReceivedOptions,
    );
  }
}

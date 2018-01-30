{// Disable Disable About Something, for Firefox 52/Thunderbird 52 and later
  let { classes: Cc, interfaces: Ci, utils: Cu } = Components;
  let { Services } = Cu.import('resource://gre/modules/Services.jsm', {});
  const BASE = 'extensions.disable-about-something@clear-code.com.';
  let blocker = {
    observe(aSubject, aTopic, aData) {
      if (aSubject.location.href.indexOf('about:') == 0) {
        let localPart = aSubject.location.href.replace(/^about:|\?.*$/g, '');
        if (localPart != 'blank' &&
            getPref(`${BASE}about.${localPart}`) === false) {
          aSubject.location.replace('about:blank');
          Cu.reportError(new Error(`[disable-about-something]: ${aSubject.location.href} is blocked!`));
        }
      }
    }
  };
  Services.obs.addObserver(blocker, 'chrome-document-global-created', false);
  Services.obs.addObserver(blocker, 'content-document-global-created', false);
}

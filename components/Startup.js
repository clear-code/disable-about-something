/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
const ID = 'disable-about-something@clear-code.com';

const Cc = Components.classes;
const Ci = Components.interfaces;
Components.utils.import('resource://gre/modules/XPCOMUtils.jsm');
Components.utils.import('resource://disable-about-something-modules/prefs.js');

const kCID  = Components.ID('{3ac26e19-e7f2-4541-91c0-2d7bdc1dc4f3}');
const kID   = '@clear-code.com/disable-about-something/startup;1';
const kNAME = 'DisableAboutSomethingStartupService';

const ObserverService = Cc['@mozilla.org/observer-service;1']
    .getService(Ci.nsIObserverService);

const STARTUP_TOPIC = XPCOMUtils.generateNSGetFactory ?
          'profile-after-change' : // for gecko 2.0
          'app-startup' ;

const BASE = 'extensions.' + ID + '.';

function DisableAboutSomethingStartupService() {
}
DisableAboutSomethingStartupService.prototype = {
  listening : false,

  observe : function(aSubject, aTopic, aData)
  {
    switch (aTopic)
    {
      case 'app-startup':
        this.listening = true;
        ObserverService.addObserver(this, 'profile-after-change', false);
        return;

      case 'profile-after-change':
        if (this.listening) {
          ObserverService.removeObserver(this, 'profile-after-change');
          this.listening = false;
        }
        ObserverService.addObserver(this, 'chrome-document-global-created', false);
        ObserverService.addObserver(this, 'content-document-global-created', false);
        return;

      case 'chrome-document-global-created':
      case 'content-document-global-created':
        if (aSubject.location.href.indexOf('about:') == 0) {
          let localPart = aSubject.location.href.replace(/^about:|\?.*$/g, '');
          if (localPart != 'blank' &&
              prefs.getPref(BASE + 'about.' + localPart) === false) {
            aSubject.location.replace('about:blank');
            Components.utils.reportError(new Error(ID + ': ' + aSubject.location.href + ' is blocked!'));
          }
        }
        return;
    }
  },

  classID : kCID,
  contractID : kID,
  classDescription : kNAME,
  QueryInterface : XPCOMUtils.generateQI([Ci.nsIObserver]),
  _xpcom_categories : [
    { category : STARTUP_TOPIC, service : true }
  ]

};

if (XPCOMUtils.generateNSGetFactory)
  var NSGetFactory = XPCOMUtils.generateNSGetFactory([DisableAboutSomethingStartupService]);
else
  var NSGetModule = XPCOMUtils.generateNSGetModule([DisableAboutSomethingStartupService]);

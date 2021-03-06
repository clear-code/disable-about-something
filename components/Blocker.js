/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const ID = 'disable-about-something@clear-code.com';

const Cc = Components.classes;
const Ci = Components.interfaces;
Components.utils.import('resource://gre/modules/XPCOMUtils.jsm');
Components.utils.import('resource://disable-about-something-modules/prefs.js');

const kCID  = Components.ID('{a00cbf60-9527-11e3-a5e2-0800200c9a66}');
const kID   = '@clear-code.com/disable-about-something/blocker;1';
const kNAME = "DisableAboutSomethingBlocker";

const ObserverService = Cc['@mozilla.org/observer-service;1']
  .getService(Ci.nsIObserverService);

// const Application = Cc['@mozilla.org/steel/application;1']
//     .getService(Ci.steelIApplication);

// let { console } = Application;

// function dir(obj) console.log(Object.getOwnPropertyNames(obj).join("\n"));

const BASE = 'extensions.disable-about-something@clear-code.com.';

function DisableAboutSomethingBlocker() {}

DisableAboutSomethingBlocker.prototype = {
  QueryInterface: function (aIID) {
    if (!aIID.equals(Ci.nsIContentPolicy) &&
        !aIID.equals(Ci.nsISupportsWeakReference) &&
        !aIID.equals(Ci.nsISupports))
      throw Components.results.NS_ERROR_NO_INTERFACE;
    return this;
  },

  shouldLoad: function (aContentType, aContentLocation, aRequestOrigin, aContext, aMimeTypeGuess, aExtra) {
    var scheme = aContentLocation.scheme;
    if (scheme == 'about') {
      let localPart = aContentLocation.spec.replace(/^about:|\?.*$/g, '');
      if (localPart != 'blank' &&
          prefs.getPref(BASE + 'about.' + localPart) === false) {
        this.processBlockedContext(aContext);
        Components.utils.reportError(new Error(ID + ': ' + aContentLocation.spec + ' is blocked!'));
        return Ci.nsIContentPolicy.REJECT_REQUEST;
      }
    }

    return Ci.nsIContentPolicy.ACCEPT;
  },

  shouldProcess: function (aContentType, aContentLocation, aRequestOrigin, aContext, aMimeTypeGuess, aExtra) {
    return Ci.nsIContentPolicy.ACCEPT;
  },

  processBlockedContext: function (aContext) {
    try {
      if (aContext && aContext.localName == 'browser') {
        aContext.stop();
        let doc = aContext.ownerDocument;
        let chrome = doc.defaultView;
        if (chrome &&
            chrome.gBrowser &&
            chrome.gBrowser.selectedBrowser == aContext &&
            chrome.gBrowser.visibleTabs.length == 1)
          return;
      }
      let win = aContext.contentWindow;
      win.close();
    } catch (error) {}

    // XXX: does not work
    // win.setTimeout(function () {
    //   win.close();
    // }, 0);
  },

  classID           : kCID,
  contractID        : kID,
  classDescription  : kNAME,
  QueryInterface    : XPCOMUtils.generateQI([Ci.nsIContentPolicy]),
  _xpcom_categories : [
    { category : 'content-policy', service : true }
  ]
};

if (XPCOMUtils.generateNSGetFactory)
  var NSGetFactory = XPCOMUtils.generateNSGetFactory([DisableAboutSomethingBlocker]);
else
  var NSGetModule = XPCOMUtils.generateNSGetModule([DisableAboutSomethingBlocker]);

disable-about-something
=======================

Download link: https://addons.mozilla.org/firefox/addon/disable-about-something/

Provides ability to disable "about:*" pages by the configuration.

For example, if you want the page "about:addons" to be disabled, then put a line like following to your MCD configuration file:

    lockPref("extensions.disable-about-something@clear-code.com.about.addons", false);


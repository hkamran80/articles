I tried using Firefox (my default) and Chrome (ugh), but neither worked.
I would get to the "Continue with" page and then it would fail to redirect.

As described in [this forum post](https://community.smartthings.com/t/smartthings-android-app-sign-in-goes-to-browser-not-supported/260520/5), you must use [Microsoft Edge](https://play.google.com/store/apps/details?id=com.microsoft.emmx).
You have to set it as your default browser, then start the login process from SmartThings.
Any other browser, including Samsung's own browser, fail to work because of the SmartThings authentication page performing [User-Agent sniffing](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Browser_detection_using_the_user_agent), something which MDN notes as "very hard to do reliably, and is often a cause of bugs".
No kidding.

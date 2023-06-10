Your digital self controls your life. Lose your password, and you're locked out of
a potentially important email or bank account. It's even worse if you don't have
any recovery systems set up. But what's worse is if you are hacked. Your digital
self, ripped away. Your social media accounts, your connection to friends, family,
and others, disappearing in an instant. However, there are proactive measures you
can take.

## Passwords

The first thing you can do is ensure you have strong passwords. Try entering your
most commonly used passwords into [Security.org's tool](https://www.security.org/how-secure-is-my-password/),
and see how long it takes to crack your password. According to a 2021 Statista survey,
64% of U.S. respondents had passwords 8–11 characters.[^1] Assuming a mix of numbers,
uppercase and lowercase letters, an 11-character password will take ten months to
crack.[^2]

The easiest way to secure your password is to get a password manager. I recommend
against using Google's password manager, given that it's built into your browser,
so if your browser is compromised, there goes your passwords. If you use an iOS/iPadOS
or Safari on macOS, Apple has a password manager built-in that's secured by end-to-end
encryption, as well as encrypted locally by the onboard chips until the password
is needed. Alternatively, if you use multiple platforms, or prefer not to use Apple's
offering, there's [Bitwarden](https://bitwarden.com/), [1Password](https://1password.com/),
and [Dashlane](https://www.dashlane.com/) to name a few. Definitely don't use LastPass,
their security has been well covered [in](https://www.theverge.com/2023/2/28/23618353/lastpass-security-breach-disclosure-password-vault-encryption-update)
[the](https://www.forbes.com/sites/daveywinder/2023/03/03/why-you-should-stop-using-lastpass-after-new-hack-method-update/?sh=d8aa4d328fc9)
[media](https://arstechnica.com/information-technology/2023/02/lastpass-hackers-infected-employees-home-computer-and-stole-corporate-vault/).

If you choose to use a third-party password manager, make sure to set a strong password
for that. Bitwarden created a [password and passphrase generator](https://bitwarden.com/password-generator/)
that you can use to create a master password.

No matter what password manager you use, the first step is to add all your existing
passwords to it. Whenever you create a new account, generate a strong password using
the tool. I recommend at least 20 characters using a mix of numbers, uppercase and
lowercase letters, and symbols (4+). Go through and change all your passwords to
strengthen them.

## Multi-factor Authentication

Multi-factor authentication, also known as two-factor authentication, 2FA, or MFA,
is where a user is required to enter two verification methods before authentication
can proceed. You should enable multi-factor authentication on all your accounts,
especially for those accounts that secure personal identifiable information (PII).
Some key accounts that should absolutely be secured, even if you don't use MFA on
any other service, include your financial accounts (including revenue agencies like
the U.S. Internal Revenue Service, the Canada Revenue Agency, AFIP, etc.), your
government accounts (e.g. Login.gov, Singpass, etc.), and your healthcare accounts
(e.g. insurance, patient portals (like MyChart), etc.).

Don't just take my word for it. Many government agencies, including, but certainly
not limited to, the [U.S. Cybersecurity and Infrastructure Security Agency (CISA)](https://www.cisa.gov/MFA),
the [UK National Cyber Security Centre](https://www.ncsc.gov.uk/guidance/setting-2-step-verification-2sv),
and the [Australian Cyber Security Centre](https://www.cyber.gov.au/learn-basics/explore-basics/mfa),
all recommend MFA.

When you enable MFA, try to avoid text messages, phone calls, and email as authentication
methods. Text messages and phone calls are susceptible to a SIM swap scam, which
is when a malicious person contacts a mobile service provider to change the SIM
which has phone calls and text messages routed to it. For more information on SIM
swap scams, check out [the Wikipedia page](https://wikipedia.org/wiki/SIM_swap_scam)
or [this Norton article](https://us.norton.com/blog/mobile/sim-swap-fraud).

The best method to use is [FIDO2](https://fidoalliance.org/fido2/), also known as
[WebAuthn](https://www.yubico.com/authentication-standards/webauthn/). FIDO2 uses
physical security keys, such as [Yubico's YubiKey series](https://www.yubico.com/products/)
or [Google's Titan keys](https://store.google.com/product/titan_security_key), or
mobile devices that are secured. These devices make up phishing-resistant MFA. It
gets this name because the token that is generated for MFA will not work with any
site other than the site it was registered with. It's recommended to register at
least two keys per site in case you lose one. Some, like Apple,
[require at least two keys](https://support.apple.com/en-us/HT213154). The U.S.
federal government requires phishing-resistant MFA, mostly through security keys,
through [the Federal Zero Trust Strategy](https://www.whitehouse.gov/wp-content/uploads/2022/01/M-22-09.pdf#page=4).
NIST, the U.S. National Institute of Standards and Technology, is recommending phishing-resistant
MFA through the [draft version of SP 800-63-4 (Digital Identity Guidelines)](https://doi.org/10.6028/NIST.SP.800-63-4.ipd).

In the event that the site doesn't offer FIDO2 or you don't have a FIDO2-capable
device, the other recommended method is TOTP, popularized by Google Authenticator.
TOTP stands for time-based one-time password. Nowadays, there are countless apps
that can generate TOTP, including [iOS/iPadOS' built-in authenticator](https://9to5mac.com/2022/03/07/use-ios-15-2fa-code-generator-plus-autofill-iphone/)
(I personally only recommend if you only use iOS/iPadOS and Safari on macOS), [Authy](https://authy.com/)
(a cross-platform synced authenticator), and [Google Authenticator](https://support.google.com/accounts/answer/1066447).
I personally use [Authenticator Pro](https://play.google.com/store/apps/details?id=me.jmh.authenticatorpro)
(an [open-source](https://github.com/jamie-mh/AuthenticatorPro) authenticator for
Android) on my Android devices, and [OTP Auth](https://apps.apple.com/app/otp-auth/id659877384)
on my iOS devices. Most password managers offer to store TOTP keys in their vaults
for you, but that means that all your eggs are in one basket.

I try to avoid proprietary MFA solutions like Symantec VIP, which a lot of U.S.
financial institutions love[^3]. Instead, and only for those services, I use SMS
MFA. One big problem with SMS MFA is if you travel, you don't necessarily have access
to your texts. To prevent losing access to those services that use SMS, you could
use a service like [Google Voice](https://voice.google.com) as the phone number
for MFA codes.

If you're curious about what MFA options a service offers, check out [2FA Directory](https://2fa.directory)[^4],
a directory of sites that support, and don't support, MFA. If it's not there, add
it by following [our contribution guide](https://github.com/2factorauth/twofactorauth/blob/master/CONTRIBUTING.md).

## Conclusion

If you have any questions or need any help, feel free to contact me on
[Twitter](https://twitter.com/hkamran80) or [Mastodon](https://vmst.io/@hkamran).

If you have any improvements to any of my articles or notes, please
[submit a pull request](https://github.com/hkamran80/articles#contributions).

Thank you for reading!

[^1]: [Average number of characters for a password in the United States in 2021 (Statista)](https://www.statista.com/statistics/1305713/average-character-length-of-a-password-us/)
[^2]: [Are Your Passwords in the Green? — Hive Systems](https://hivesystems.io/password)
[^3]: U.S. financial institutions, please follow [Vanguard](https://vanguard.com)'s example and support FIDO2!
[^4]: Full disclosure: I am a maintainer of the site

<!--
Internal drafting note (not part of the user-facing policy): this draft reflects the repository as inspected on 14 July 2026. Before publication, replace every [PLACEHOLDER], confirm which features are actually enabled in production, set and operationalise the retention periods below, confirm the hosting provider, processor terms/locations, lawful-basis assessment and transfer safeguards, and obtain review from a UK-qualified solicitor or data-protection adviser. Decide and enforce the intended minimum age and assess whether the UK Children's code applies. In particular, do not describe saved outfit images as private until the private-storage migration has completed in production.
-->

# Style/Me Privacy Policy

**Effective date:** 14 July 2026  
**Last updated:** 14 July 2026

This Privacy Policy explains how **[FULL LEGAL NAME OF OPERATOR]**, trading as Style/Me (**“Style/Me”**, **“we”**, **“us”** or **“our”**), collects and uses personal data when you use the Style/Me website and related services (the **“Service”**).

**Controller details**

- Legal name: [FULL LEGAL NAME]
- Company number (if applicable): [COMPANY NUMBER]
- Registered or principal address: [POSTAL ADDRESS]
- Privacy contact: [PRIVACY EMAIL]
- Data Protection Officer or representative (if applicable): [DETAILS OR “NOT APPLICABLE”]

We are the controller of the personal data described in this policy, except where a third party acts as a separate controller for its own service.

## 1. Service status and planned features

The current codebase supports AI outfit ratings and analysis, optional accounts and profiles, optional weather and calendar context, product search, and usage limits. The production version may not expose every capability at all times.

The codebase also contains features intended for a later release, including saved outfits and paid subscription plans. **Saved outfits and paid plan purchasing are not live as at the effective date of this policy.** Sections marked “planned” explain the processing that will apply if and when we launch those features. We will update the Service and this policy if the actual processing differs materially.

## 2. Personal data we collect

Depending on how you use the Service, we may collect the following information.

### Account and authentication data

- email address;
- account identifier, account creation date and authentication/session information;
- password credentials, which are handled by our authentication provider rather than stored by us in readable form; and
- password-reset and email-confirmation activity.

You may use parts of the Service without creating an account.

### Photos, AI requests and results

- outfit photos you choose to upload;
- the selected AI adviser or analysis mode;
- style preferences, weather details and upcoming-event context included with a request; and
- AI-generated ratings, descriptions, colour analysis, style tags and recommendations.

For an ordinary rating or analysis, the application sends the photo and relevant context to our AI provider for processing. The application code does not save the uploaded photo to the Style/Me database merely because you request a rating. The photo and result may remain temporarily in your browser while you use the page. Our hosting and AI providers may process request data and technical logs in accordance with their terms and our configuration.

Please do not upload a photo unless you have the right to use it. Photos can reveal faces, surroundings and potentially sensitive information. We do not ask you to provide special-category data and you should avoid including it where it is not needed.

### Profile data

If you create and complete a profile, we may collect:

- display name;
- avatar image and avatar URL;
- country or market selection;
- style preferences;
- favourite colours and brands; and
- your choice about whether calendar context is used.

Profile avatars are currently designed to be served from a public storage bucket. Do not use an avatar you want to keep private.

### Calendar data

If you import an `.ics` calendar file, the file is parsed in your browser and event data may be stored in your profile. This can include event titles, descriptions, dates and times, locations and other raw event fields contained in the file. If calendar context is enabled, a limited number of upcoming-event summaries may be included in an AI rating request.

Only import a calendar you are entitled to use. Calendar entries may contain personal data about other people; remove information that is not necessary before importing it.

### Weather and location data

If weather context is enabled, your browser may ask for permission to provide approximate or precise device coordinates. Alternatively, you may enter a city, postcode or other location query. We use this information to obtain location suggestions and current weather. Weather description, temperature, location, humidity and wind speed may be included in an AI rating request.

We do not use the application database to build a location-history profile. The browser, hosting provider and weather provider may nevertheless process requests and technical logs.

### Product-search and shopping data

If you request product suggestions, we may process the search term, selected country or market and result limit. Results can include third-party retailer links and externally hosted product images. When your browser loads an external image or you follow a link, that third party may receive technical information such as your IP address, browser details and referring page under its own privacy policy.

The current “save to wishlist” control is not backed by persistent wishlist storage. If persistent wishlists are introduced, we will describe that processing before or when the feature launches.

### Usage, device and security data

We process information needed to operate and secure the Service, which may include:

- rating and analysis type and time;
- user ID for signed-in users;
- for signed-out users, an HMAC-derived digest of the requesting IP address used to enforce monthly limits (rather than the raw IP address in the usage table);
- access tokens submitted with authenticated API requests;
- IP address, request headers, timestamps, error information and similar server or hosting logs; and
- browser storage values used for session handling and a signed-out user’s local monthly rating and analysis counters.

The IP-derived digest is pseudonymous data and may still be personal data. Raw IP addresses may also be visible to infrastructure providers in ordinary network logs.

### Planned saved-outfit data

If saved outfits are launched and you choose **Save**, we expect to store the outfit image, rating text, numeric rating, AI adviser mode, social summary, account ID and creation time in account-linked storage. The feature is designed to use private object storage and time-limited viewing links. You will be able to delete individual saved outfits. We will confirm these controls in the live feature before launch.

### Planned paid-plan and billing data

Paid checkout is not currently connected. If paid plans launch, we expect to use Stripe or another payment provider to process payment-card and billing information. Style/Me would normally receive transaction and subscription information—such as customer and subscription IDs, plan, status and billing period—rather than full card details. The provider would process payment data under its own terms and privacy notice. We will identify the live payment provider at checkout.

## 3. How we use personal data and our lawful bases

We use personal data for the purposes and lawful bases below. The appropriate basis depends on the circumstances.

| Purpose | Typical data | UK GDPR lawful basis |
| --- | --- | --- |
| Create and administer accounts; authenticate users; provide requested ratings, analysis, weather and product results | Account data, photos, request context, results, location query | Performance of our contract with you; legitimate interests where necessary to deliver or improve a requested free service |
| Save profile settings and calendar context | Profile and calendar data | Performance of our contract; consent where a permission or genuinely optional processing requires it |
| Enforce usage limits and prevent abuse | User ID, usage records, IP-derived digest, security logs | Legitimate interests in protecting the Service, allocating capacity and preventing misuse |
| Diagnose faults, maintain security and improve reliability | Technical and error data | Legitimate interests in operating a safe and reliable service |
| Send essential account messages | Email, account and security data | Performance of our contract; legitimate interests in account security; legal obligation where applicable |
| Comply with law and establish, exercise or defend legal claims | Relevant account, request, transaction and log data | Legal obligation; legitimate interests |
| Operate saved outfits if launched | Saved-outfit data | Performance of our contract at your request |
| Administer paid plans if launched | Account, subscription and transaction data | Performance of our contract; legal obligation for tax and accounting records |

Where we rely on legitimate interests, we consider the necessity and impact of the processing and your rights. Where we rely on consent, you may withdraw it at any time without affecting earlier lawful processing.

We do not use the current codebase for third-party behavioural advertising or automated decisions that produce legal or similarly significant effects. AI output is advisory only.

## 4. Who receives personal data

We may share data with service providers that help us operate the Service, subject to appropriate contracts and access controls:

- **Supabase** — authentication, database and file storage;
- **Anthropic** — AI outfit rating and analysis, including uploaded photos and selected request context;
- **OpenWeather** — geocoding, location suggestions and weather data using coordinates or a location query;
- **RapidAPI and its product-search provider** — product-search terms and country/market when live search is configured;
- **[HOSTING PROVIDER]** — website, API, network and application hosting; and
- **Stripe (planned, not currently connected)** — checkout, payment and subscription administration if paid plans launch.

We may also disclose information to professional advisers, regulators, courts, law-enforcement bodies or a buyer/reorganised entity where reasonably necessary and lawful.

Retailers, product-image hosts, device geolocation services and native sharing destinations may act as separate controllers when you interact with them. We do not control their privacy practices.

We do not sell personal data. If we introduce affiliate links, we will label them appropriately; the current repository does not add affiliate tracking identifiers to product links.

## 5. International transfers

Some providers or their subprocessors may process personal data outside the United Kingdom. Where UK data-protection law requires it, we will use an adequacy regulation, the UK International Data Transfer Agreement or Addendum, or another lawful safeguard, and carry out any required transfer-risk assessment. Contact us for more information about safeguards relevant to your data.

## 6. Retention

We keep personal data only for as long as needed for the purposes described above, including security, dispute and legal requirements. Before this policy is published, the operator must insert and implement the production retention schedule below.

| Data | Retention approach |
| --- | --- |
| Account, profile and imported calendar data | Until account deletion, then [BACKUP/DELETION PERIOD], unless law requires longer |
| Ordinary unsaved outfit uploads and AI request content | Not intentionally persisted in the Style/Me application database; provider and infrastructure copies/logs: [CONFIRM PERIOD AND SETTINGS] |
| Authenticated usage records | [INSERT PERIOD]; the current schema does not itself schedule automatic deletion |
| Guest IP-derived usage records | [INSERT PERIOD]; the current schema does not itself schedule automatic deletion |
| Security and hosting logs | [INSERT PERIOD] |
| Planned saved outfits | Until you delete the outfit or account, then [BACKUP/DELETION PERIOD] |
| Planned payment, subscription and tax records | [INSERT PERIOD CONSISTENT WITH UK ACCOUNTING/TAX OBLIGATIONS] |

Local browser data remains on your device until it expires under the browser or application logic, you clear it, or you remove site data. The guest counter is logically reset for a new UTC calendar month, although the previous value may remain in local storage until overwritten or cleared.

## 7. Cookies and browser storage

The current repository does not include an analytics or advertising SDK and does not set advertising cookies. It does use browser storage for essential functions, including authentication-session handling by the authentication library and signed-out monthly usage counters. These technologies are necessary to provide login and quota functionality.

Our providers may use essential cookies or storage in their own interfaces. If we add non-essential analytics, advertising or similar technologies, we will update this policy and, where required, ask for consent before using them.

## 8. Security

We use technical and organisational measures intended to protect personal data. The codebase includes account-based database access controls, server-side validation, restricted API credentials, usage-limit controls, and a design for private saved-outfit storage. No system is completely secure, and we cannot guarantee absolute security.

Keep your password confidential and contact us promptly if you believe your account has been compromised.

## 9. Your rights

Subject to UK data-protection law and any applicable exceptions, you may have the right to:

- access your personal data and receive a copy;
- correct inaccurate or incomplete data;
- request deletion;
- restrict or object to processing;
- receive certain data in a portable format;
- withdraw consent where processing is based on consent; and
- complain to a supervisory authority.

The Service currently lets you edit parts of your profile, clear calendar events and, if enabled, delete individual saved outfits. It does not currently provide a self-service account-deletion control. To exercise a right or request account deletion, email [PRIVACY EMAIL]. We may need to verify your identity.

You may complain to the UK Information Commissioner’s Office at [ico.org.uk](https://ico.org.uk/). If you live elsewhere, you may also have the right to contact your local data-protection authority. We would appreciate the opportunity to address your concern first.

## 10. Children

The Service is not directed to children under 13, and we do not knowingly collect their personal data. If you are under 18, use the Service only with the permission and supervision of a parent or legal guardian, particularly before uploading an image. If you believe a child has provided personal data contrary to this section, contact [PRIVACY EMAIL].

## 11. Your choices and responsibilities

You can:

- decline browser location permission and enter a location manually, or turn weather context off;
- turn calendar context off and remove imported events;
- avoid creating a profile or uploading an avatar;
- choose not to save an outfit if the planned saving feature launches;
- clear local storage through your browser; and
- avoid following third-party shopping links.

If an image or calendar entry includes another person’s data, you are responsible for having a lawful basis and any necessary permission to provide it to us.

## 12. Changes to this policy

We may update this policy as the Service, our providers or legal requirements change. We will post the revised policy with a new “Last updated” date and provide additional notice where a change is material or the law requires it.

## 13. Contact us

Questions, requests and complaints may be sent to:

**[FULL LEGAL NAME OF OPERATOR]**  
[POSTAL ADDRESS]  
[PRIVACY EMAIL]

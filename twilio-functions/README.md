# Twilio call routing (email lead alerts, no SMS)

**Why this folder exists.** The Twilio Function source lives here in version control, not only in the Twilio console, so the call-routing logic is recoverable, reviewable, and clonable for the next site. This build ships the **six network-standard functions named in this site's build spec** (incoming-call, whisper, dial-through, screen, voicemail-done, send-voicemail-email), cloned from the proven Abilene/Omaha pattern.

**Note on `call-status.js`:** sites #2 and #3 (Abilene, Omaha) added a seventh function, `call-status.js`, wired at the number level ("Call status changes") to catch a caller hanging up before `/voicemail-done` is ever reached (mid-ring, or during the greeting), so no email fires at all in that edge case. This build's spec names exactly six functions, so `call-status.js` is not included here. **Flagged as a Findings item in this build's receipt**, not silently added or silently omitted: adding it later is a small, independent addition (one more file, one more number-level webhook), not a rework of anything shipped here.

## The six functions

| File | Route | Visibility | Role |
|---|---|---|---|
| `incoming-call.js` | `/incoming-call` | Public | Voice webhook for the published number. An owner calling in (From === OWNER_NUMBER) starts an outbound dial-through; a customer call rings the owner (and PARTNER_NUMBER if set) for `timeout=12` (about two rings) with call SCREENING, then falls through to the recorded greeting + voicemail if the call is not accepted. |
| `whisper.js` | `/whisper` | Public | Screening prompt played to the answering party ONLY, never the customer. Says "Call for {SITE_LABEL}. Press any key to take it." One-second pause first (answer-supervision clip fix). A keypress is required to accept. |
| `screen.js` | `/screen` | Public | The `/whisper` Gather action. A keypress returns empty TwiML (bridges the owner to the caller); no key hangs up that leg so the parent call falls through to voicemail. This is what stops a declined / unanswered / carrier-voicemail call from stealing the lead. |
| `dial-through.js` | `/dial-through` | Public | Owner-mode gather target. Dials the number the owner typed using the site's Twilio number as caller ID, so callbacks and cold calls show the business number, not a personal cell. |
| `voicemail-done.js` | `/voicemail-done` | Public | The `<Record action>`. The single RELIABLE email per call, fired synchronously when recording ends (does not depend on Twilio transcription). Voicemail left (>=2s): email with the recording ATTACHED as an mp3 (listen with no login; falls back to the link if the fetch fails). No message (<2s): a "missed call, no message" email. |
| `send-voicemail-email.js` | `/send-voicemail-email` | Public | The record `transcribeCallback`. Sends a short best-effort follow-up email with just the transcript text. Twilio transcription is unreliable, so this is the secondary path; the recording itself is the reliable email above. |

Email only, never SMS: A2P 10DLC was deliberately skipped network-wide, so no `send-voicemail-sms.js` exists. Alerts and transcripts travel by email via SendGrid.

**Why the email fires from the Record action, not the transcribeCallback (learned the hard way on an earlier site).** Twilio's built-in transcription callback did not fire reliably in live testing, so the dependable email (with the mp3) comes from `/voicemail-done`, which runs synchronously when recording ends. `/send-voicemail-email` is kept only as a best-effort transcript follow-up.

**All callback functions MUST be Public.** A Protected function returns 403 ("Unauthorized") to Twilio's own signed Record / Gather / transcribe callbacks, silently, so no email or routing fires. Every function in this flow is Public.

## Environment variables (set in the Twilio Functions Service, NOT in this source)

| Variable | Value |
|---|---|
| `OWNER_NUMBER` | the Chair's cell, E.164 (`+1XXXXXXXXXX`) |
| `PARTNER_NUMBER` | optional second simultaneous ring, E.164 (unset = owner only) |
| `TWILIO_NUMBER` | the provisioned number, used as the outbound caller ID |
| `SENDGRID_API_KEY` | SendGrid API key (Restricted Access, Mail Send). Pasted by the Chair; never in source, logs, or any shared file. |
| `ALERT_EMAIL_TO` | comma-separated recipient list, so one alert reaches every inbox with no forwarding rule |
| `ALERT_EMAIL_FROM` | a SendGrid-verified sender address |
| `SITE_LABEL` | human label for this site, used in the email subject line; recommend "CO Springs Deck Building" |

`DOMAIN_NAME` is provided automatically by the runtime. `greeting.mp3` is a PUBLIC asset (the owner's own recorded voice) uploaded to the service.

## Provisioning (network standard, when a real number is provisioned)

1. Buy a local number; set its Voice "A call comes in" webhook to `/incoming-call`.
2. Add the six functions above (all Public), the `@sendgrid/mail` dependency, the env vars, and tick "Add my Twilio Credentials to ENV".
3. Record this site's greeting (the Chair's own voice); upload it as the public asset `greeting.mp3`.
4. Generate a SendGrid key and paste it into `SENDGRID_API_KEY` (or reuse the network's existing verified sender/key if one is already set up).
5. Deploy. **Deploying visibility, learned the hard way on prior sites:** a visibility-only toggle does NOT deploy; the deploy ships whatever visibility was baked into the last SAVED function version. To make a function Public in the live build you must re-SAVE it while it is Public, then Deploy All. Verify with a browser GET (append `?cb=N`): a Public function returns its TwiML, a Protected one returns "Unauthorized - you are not authenticated to perform this request".
6. Live-test (two phones): accept (press a key), decline -> greeting -> voicemail email with the mp3 attached + a best-effort transcript follow-up, and a no-message hang-up -> one "missed call" email.

## This site

**Not yet provisioned.** This build ships with the FCC-reserved 555-01xx placeholder number `(719) 555-0100` (`src/lib/site.js`), matching the network's standard pre-launch placeholder convention. No Twilio number, Function Service, SendGrid key, or greeting exists yet for this site; provisioning happens at C4 (launch), same as sites #1-#3, and `src/lib/site.js`'s `phoneDisplay`/`phoneHref` get swapped to the real number the same session.

No em-dashes anywhere (portfolio-wide rule).

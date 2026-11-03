### I am documenting what I am doing in this spike to help create the issue we will add to the github.

# Spike: Email moderators when a review needs moderation

## Goal

When a user submits a review that needs moderation (one with comments), every moderator gets an
email with a link to the moderation page.

## What we're looking for (for students)

As a **moderator**, I want to get an email when a review needs moderation, so I don't have to keep
checking the moderation page.

Roughly, a finished version should:

- Send an email to the moderators when a user submits a review that needs moderation.
- Not send anything for reviews that are auto-approved (no comments).
- Include a link to the moderation page in the email.
- Not expose moderators' email addresses to the student.
- Never block or break submitting a review: if the email fails, the review still saves.
- Be fully tested, keeping the project's 100% coverage and mutation testing.

Hints:

- Look into the Gmail API's "send message" endpoint and the `gmail.send` OAuth scope.
- Spring Security already has the logged-in user's Google token; find out how to get it.
- Look at how existing services in `services/` call external APIs with `RestTemplate`.

How you structure it is up to you. Think about what should happen when things go wrong.

## Approach chosen

The email is sent through the **Gmail API from the submitting user's own UCSB Google account**,
using the OAuth token they already got when they logged in. No separate email account, SMTP
password, or third-party email service is needed.

This needs the `gmail.send` OAuth scope. Google requires app verification for that scope on
External apps but not on **Internal** ones, which is why the consent screen is switched to Internal.

## Setup steps (Google Cloud Console, per deployment)

1. Make sure the GCP project belongs to the `ucsb.edu` organization. A project created under a
   personal Gmail account cannot be set to Internal.
2. **APIs & Services → OAuth consent screen**: set User type to **Internal**.
3. **APIs & Services → Library**: enable the **Gmail API**.
4. **OAuth consent screen → Scopes**: add `https://www.googleapis.com/auth/gmail.send`.
5. Check UCSB's Workspace policy: deploy, log out, and log back in with a `@ucsb.edu` account.
   - If the consent screen asks to "Send email on your behalf" and lets you continue, you're done.
   - If you see `admin_policy_enforced` / "This app is blocked", ask UCSB IT to mark the app's
     OAuth Client ID as **Trusted** (Admin console → Security → Access and data control →
     API controls → Manage third-party app access). Only a Workspace admin can do this.
6. Make sure `APP_NAME` and `APP_HOSTNAME` are set up as in `docs/dokku.md`; the email link is
   `https://APP_NAME.APP_HOSTNAME/moderate`. Check with
   `dokku enter <app> web env | grep -E 'APP_NAME|APP_HOSTNAME'`: the values should be real
   (e.g. `APP_NAME=dining-qa`, `APP_HOSTNAME=dokku-00.cs.ucsb.edu`), not `$(...)` text.

## Code changes

- `src/main/resources/application.properties`: added the `gmail.send` scope to the Google login.
- `src/main/java/edu/ucsb/cs156/dining/services/ModeratorNotificationService.java` (new):
  - Gets the current user's Google access token from Spring's `OAuth2AuthorizedClientService`.
  - Sends one email to all moderators (from `ModeratorRepository`) via
    `POST https://gmail.googleapis.com/gmail/v1/users/me/messages/send`.
  - Moderators are on **Bcc** so students can't see moderator addresses.
  - The email has only the review id and a link to `/moderate`, not the review text.
  - **Fails safe**: it never throws. If there's no token, no moderators, the user logged in before
    the scope was added, or Gmail returns an error, it logs and the review is still saved.
  - Skips sending for non-Google logins (e.g. the mock OAuth provider used in integration tests).
  - 5s connect / 10s read timeouts so a slow Gmail API can't hang the request.
- `ReviewController.postReview`: calls the service after saving, only when the review's status is
  `AWAITING_REVIEW`.
- `ReviewControllerTests`: added a `@MockBean` for the new service so the existing tests still
  start. No new tests were written.

## Known limitations / decisions for the issue

- **Non-UCSB users can no longer log in** once the consent screen is Internal.
- **Existing sessions** don't have the new scope; users must log out and back in before emails
  send from their account.
- **Token expiry**: access tokens last about 1 hour. No refresh token handling was added, so if a
  session outlives its token, the email silently isn't sent (logged as an error). A follow-up could
  request `access_type=offline` and use an `OAuth2AuthorizedClientManager` to refresh tokens.
- **Server restart** clears the in-memory token store; users must log in again before emails send.
- Emails appear in the **student's Sent folder**, since they are sent from their account.
- **Edited reviews** that go back to `AWAITING_REVIEW` (`PUT /api/reviews/reviewer`) do not send
  an email yet; it's a one-line addition if wanted.
- Only moderators (the `moderators` table) are emailed, not admins.
- One email per submission; a daily digest could be considered if volume gets high.

## For the real implementation (out of scope for this spike)

- **Tests**: this spike has none. The project enforces 100% Jacoco coverage and Pitest, so the
  issue should include testing `ModeratorNotificationService` and the new branch in `postReview`
  (mock `OAuth2AuthorizedClientService` and `ModeratorRepository`; use `MockRestServiceServer` for
  the Gmail call).
- Manual test on a real deployment (the mock OAuth server can't exercise this):
  1. Log in as an admin and add your own `@ucsb.edu` email as a moderator.
  2. Log out, log back in as a regular `@ucsb.edu` user, and accept the "send email" permission.
  3. Submit a review **with comments** for any menu item.
  4. The moderator inbox should get "A new dining review needs moderation" with a link to
     `/moderate`.
  5. Submit a review **without comments**: no email should be sent (it's auto-approved).

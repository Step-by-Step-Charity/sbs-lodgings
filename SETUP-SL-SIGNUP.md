# Supported Lodgings kiosk: connecting the host sign-up to ActiveCampaign

Page: `index.html` (the Supported Lodgings kiosk)
Live at `https://step-by-step-charity.github.io/sbs-lodgings/` (and `https://lodgings.stepbystep.org.uk` once the domain is set up)

The page has two forms. They do different jobs and go to different places.

| Form | What the visitor gets | Where it goes | Status |
|---|---|---|---|
| **Get the free guide** | The SL and/or fostering guide by email | Form 3, **F&L – Guide requests (kiosks)**, Source `SL Guide` / `Fostering Guide`, picked up by AC automation A1 | **Live** |
| **Sign up** (call request) | A call back (they choose Supported Lodgings, Fostering or Not sure yet) | Form 8, **F&L – Call requests (kiosks)** (`slsignup` in CONFIG); Source `SL Call Requested` / `Fostering Call Requested` / `F&L Not Sure Call Requested`; form emails results to marketing@ | **Live from 6 Nov 2026 (Version 79)** |

Until the sign-up form is connected, every sign-up is saved on the tablet or phone it was taken on. Nothing is lost, but nothing reaches ActiveCampaign either. The staff panel shows how many sign-ups are being held. **Export the CSV before you leave each event.**

---

## Step 1. Pick or make the ActiveCampaign form

Use whichever of these fits:

- **Option A: reuse the website's sign-up form** (if it's an ActiveCampaign form). The kiosk sign-ups then land in the same place as website sign-ups, and the same automation picks them up.
- **Option B: make a new form called "SL kiosk – Host sign-up".** Choose this if you want kiosk sign-ups reported separately.

The form needs these fields:

- Full name
- Email
- **Phone**. Use a custom **text** field rather than ActiveCampaign's built-in Phone field. The built-in field rejected kiosk entries before, because of its validation.
- Town and County (custom text fields: F&L Town = field 45, F&L County = field 48)
- Spare room? (custom text field; the kiosk sends `Yes` / `Not yet` / `Not sure`)
- Best time to call (custom text field; the kiosk sends `Morning` / `Afternoon` / `Evening` / `Any time`)
- Source, Date, Time and Opt-in. These are the same custom fields the F&L form already uses: field 30, 31, 32 and 33.

## Step 2. Get the embed code

In ActiveCampaign, go to **Website → Forms**, open the form, then choose **Integrate → Embed → Full embed** and copy the code.

The embed code contains no personal data. It's just the form's settings, so it's safe to paste into a Claude chat. Claude can then do Step 3 for you.

## Step 3. Put the values into the kiosk

To do it yourself, open `index.html` on GitHub (click the pencil to edit) and search for `slsignup:`. Fill it in from the embed code:

```js
slsignup: {
  ready: true,                                   // ← switch on
  meta: { u: '…', f: '…', s: '', c: '0', m: '0', act: 'sub', v: '2', or: '…' },
  fields: {
    source: 'field[30]', date: 'field[31]', time: 'field[32]', optin: 'field[33]',
    phone: 'field[..]', postcode: 'field[..]', room: 'field[..]', calltime: 'field[..]'
  }
}
```

- `u`, `f` and `or` are the values of the hidden inputs with those names in the embed code.
- Each `field[..]` is the `name="field[NN]"` of the matching input in the embed code.

## Step 4. Automation

Sign-ups go through the existing **A1 – F&L Routing Automations** in ActiveCampaign, using its call-request branches. The kiosk sets Kiosk Source to "SL Call Requested", "Fostering Call Requested" or "F&L Not Sure Call Requested" (from "What are you interested in?"). In A1:
- add a start trigger for each: "Contact's field Kiosk Source changes to …"
- point the three call-request conditions at **Kiosk Source** (they currently reference a deleted field)
- add a **notification email** to the right team in each call branch, so someone calls them back

Full details are in the ClickUp doc "ActiveCampaign: Set-up and Reference".

- notify the SL team or create a task to call the person back
- add a tag such as `SL – Kiosk sign-up` so you can report on it

## Step 5. Test it, then bump the cache

1. Submit a test sign-up on a phone.
2. Check it arrives in ActiveCampaign with the phone, postcode, room and call-time values filled in.
3. Tablets keep a cached copy of the page. To make them pick up the change, edit `sw.js` and add one to `CACHE_VERSION` (e.g. `sbs-kiosk-v59` → `sbs-kiosk-v60`).

Anything held on a device sends automatically the next time it's online with the new version.

---

## Staff panel and records

**Getting in:** there are three ways to open the staff panel:
- **Press and hold the Step by Step logo for 2 seconds** (on the home screen)
- tap the bottom-right corner 5 times quickly
- add `#staff` to the end of the address

All of these go straight to a code screen; nothing staff-related shows without a code. Enter the **staff code** to see who has signed up. Use the **search box** to check a name or email when someone asks "did I put it in?". The code screen also shows the page version (e.g. *Version 65*), so you can check a device has the latest copy.

**Two codes:**
- **Staff code:** view who has signed up and export the CSV. It can't delete anything.
- **Admin code (Nic only):** the only code that can delete records.

**The records screen** lists every guide request and host sign-up taken on that device, with name, email, phone, postcode, spare room and best time to call. Each entry has a status:
- **Sent (check it arrived in ActiveCampaign).** The page can only tell that the entry went out, not that ActiveCampaign accepted it, so spot-check after each event.
- **Waiting to send.** The device is offline; it sends automatically when it reconnects.
- **Held on this device.** The sign-up form isn't connected to ActiveCampaign yet.

From the records screen you can **Export CSV**.

**The record is permanent.** Sending an entry never removes it. The only way to clear it is **Delete all records from this device**, which needs the **admin code**. If anything hasn't reached ActiveCampaign, the page warns you before deleting.

The records screen locks itself when the kiosk goes idle or someone taps the logo.

**Things that can still wipe a device's record** (so export the CSV after every event):
- clearing the browser's data or history for the site
- using a private or incognito window
- iPhone and iPad Safari can clear a site's data after 7 days without a visit, unless the page is added to the home screen

**Changing a code:** both codes are stored as fingerprints (`staffCodeHash` and `adminCodeHash` in CONFIG), not as the codes themselves. To change one, ask Claude, or run `printf 'sbs-sl-kiosk:NEWCODE' | sha256sum` and paste the result in. They keep visitors at the stand out of the list; they are not bank-grade security.

## Donations

The Give a Little link is in `CONFIG.event.donateUrl`, and the QR image is `project/assets/qr-donate.png`. The QR encodes the same link.

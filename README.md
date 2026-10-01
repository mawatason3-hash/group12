# Musanze Safe Market Field Inspection Prototype

A mobile field-inspection prototype for Musanze safe-market auditing, built with React Native, Expo, and TypeScript for Android in Expo Go.

## Group information

- Group number: G12
- Group verification code: MOB-G12-4982
- Group leader: Solomon Kamara (reg 2324982)
- GitHub repo URL: [FILL]

## Members

| Name | Registration number | Role |
| --- | --- | --- |
| Hamody [FILL surname] | 25/27639 | Product and UX lead |
| Alexander Dyujay Kpande | 25/27596 | Interface engineer |
| Christine NDATIMANA | [FILL] | State and navigation engineer |
| Alain Sauverain ISHEMA | 25/27343 | Device integration and QA lead |
| Solomon Kamara | 2324982 | Release and evidence lead |

## Project run instructions

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start Expo:
   ```bash
   npx expo start
   ```
3. Open in Expo Go on Android and scan the QR code.

## Tested environment

- Node.js: v20.20.2
- Expo SDK: ~57.0.26
- Android version: [FILL]
- Android device model: [FILL]
- Final commit hash: [FILL AFTER FINAL COMMIT]

## Features

- Home catalogue for Musanze stall inspection zones
- Validation for vendor alias, stall code, contact number, and consent
- Review screen with group verification code and save flow
- Records list and detail screen navigation
- Camera and gallery capture with permission, cancel, replace, and remove actions
- Shared group constant and validation rules across screens

## Known limitations

- In-memory only; no persistence layer
- No backend or database integration
- No live external data source or remote API
- Photos remain local on the device only

## Repository and evidence notes

- Source files are in `src/` and the app shell remains in `App.tsx`.
- Evidence and assignment notes are stored in the `evidence/` folder.
- The package manifest and app settings are in `package.json` and `app.json`.

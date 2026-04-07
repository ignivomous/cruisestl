# CruiseSTL

Community calendar for car shows, cruise nights, swap meets, and drag races in the St. Louis region.

## Stack

- React + Vite
- Deployed on Vercel
- Domain: cruisestl.com

## Development

```bash
npm install
npm run dev
```

## Deployment

Push to `main` — Vercel auto-deploys.

## Adding Events

Events live in `src/App.jsx` in the `EVENTS` array. Each event takes:

```js
{
  id: 99,                        // unique number
  name: "Event Name",
  date: "2026-05-01",            // YYYY-MM-DD
  dateEnd: "2026-05-02",         // optional, for multi-day events
  type: "car-show",              // car-show | cruise-night | swap-meet | drag-race | other
  venue: "Venue Name",           // or "TBD"
  city: "St. Louis",
  state: "MO",
  recurring: true                // optional
}
```

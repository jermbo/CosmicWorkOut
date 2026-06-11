# App Structure

How the SvelteKit app is organized — routes, layout, and boot sequence.

---

## Routes

| Route | File | Purpose |
|-------|------|---------|
| `/` | `routes/+page.svelte` | Today — workout card, streak, week strip |
| `/program` | `routes/program/+page.svelte` | Program — workout cards, editor entry |
| `/calendar` | `routes/calendar/+page.svelte` | History — month grid, stats, day summary |

Navigation via fixed `BottomNav` (Today · Program · Calendar). No settings route yet.

---

## Root Layout

`routes/+layout.svelte` owns everything outside page content:

```mermaid
flowchart TB
    Layout["+layout.svelte"]
    Layout --> Main["main — page content"]
    Layout --> Nav[BottomNav]
    Layout --> Overlay["SessionOverlay<br/>(isActive)"]
    Layout --> Complete["SessionComplete<br/>(isComplete)"]
    Layout --> Recovery["Recovery banner<br/>(unfinished session)"]

    Main --> Today["/ Today"]
    Main --> Program["/program"]
    Main --> Calendar["/calendar"]
```

`routes/+layout.ts` sets `ssr = false` — fully client-rendered.

---

## Boot Sequence

On `onMount` in the layout:

```mermaid
sequenceDiagram
    participant L as +layout.svelte
    participant DB as initDB
    participant P as prefsStore
    participant Prog as programStore
    participant S as sessionStore

    L->>DB: open IndexedDB, seed if empty
    L->>P: load prefs, apply to DOM
    L->>Prog: load programs, exercises, sessions
    L->>S: checkForRecovery()
    L->>L: appReady = true
```

1. `initDB()` — open IndexedDB, upsert exercises, seed programs if empty
2. `prefsStore.load()` — read localStorage, apply accent/density/roundness to DOM
3. `programStore.load()` — load programs, exercises, sessions; pick active program
4. `sessionStore.checkForRecovery()` — flag recoverable session if from today
5. Set `appReady = true` → render app

---

## Source Layout

```mermaid
flowchart TB
    src[src/]
    src --> appcss[app.css]
    src --> apphtml[app.html]
    src --> routes[routes/]
    src --> lib[lib/]

    routes --> layout["+layout.svelte / .ts"]
    routes --> today["+page.svelte (Today)"]
    routes --> progpage["program/+page.svelte"]
    routes --> calpage["calendar/+page.svelte"]

    lib --> db[db/]
    lib --> stores[stores/]
    lib --> components[components/]
    lib --> utils[utils.ts]

    db --> types[types.ts]
    db --> database[database.ts]
    db --> seed[seed.ts]

    stores --> ps[program.svelte.ts]
    stores --> ss[session.svelte.ts]
    stores --> pr[prefs.svelte.ts]
```

---

## Global Overlays

These render above any route — the user never navigates away during a session:

- **SessionOverlay** — full-screen dialog with exercise cards, timer, finish/abandon
- **SessionComplete** — celebration screen with volume/duration stats
- **WorkoutEditor** — full-screen editor launched from Program page (not a route)
- **LogSetSheet** — bottom sheet for stepper/numpad input during session

---

## Related

- [How It Works](behavior.md) — What happens on each screen
- [Components](components.md) — What each component does
- [State Management](state.md) — Store boot and data flow
- [Dev Guide](dev-guide.md) — Running the app locally

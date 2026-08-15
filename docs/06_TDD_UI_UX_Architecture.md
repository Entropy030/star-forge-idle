# TDD — UI/UX Architecture

## Surface contract

| Surface | Player question | Owns | Does not own |
| --- | --- | --- | --- |
| Cosmos | What is happening now, and what should I affect? | Current universe, process status, immediate action, Core context | Full upgrade shop, meta loadout, utility settings |
| Forge | What can I construct or improve this run? | Upgrade hierarchy, cost, contribution, buy controls, requirements | Permanent reset rewards or narrative reference |
| Legacy | What persists across stellar runs? | Supernova terminal, meta currencies/rewards, loadout | Current-run resource wall or save utilities |
| More | Where are reference and utilities? | Archive/Codex, settings, save/import/export | Primary progression actions |

Navigation exposes only relevant destinations and uses at most the current supported set. Do not add a permanent destination merely because a module exists.

## Guidance ownership

- Objective: a concise next action and progress.
- Chrono: a short event interpretation or change in meaning.
- Codex: deeper explanation unlocked for later reading.

An objective should not duplicate Codex prose. Chrono should not become a blocker checklist. Cosmos status can identify the active bottleneck but should not replace the objective.

## Era-specific Cosmos

- Fresh Era I is intentionally sparse and Core-focused.
- Later Era I introduces Vacuum Coherence only when it has acquisition/purpose context.
- Era II foregrounds the active recipe/cooling bottleneck rather than every particle equally.
- Era III foregrounds Core Temperature, the next physical threshold, and stellar action.

Presentation is derived in `src/engine/cosmosPresentation.js`. The renderer should not recreate readiness formulas.

## Resource hierarchy

`src/engine/resourcePresentation.js` groups current resources into:

- **Primary:** the value that best represents current progress.
- **Support:** active inputs/outputs or bottlenecks needed for the current process.
- **Details:** useful secondary information available on demand.

Meta currencies belong in Legacy, not the always-visible current-run HUD. Resource membership can change with Era/relevance, but current values must come from authoritative state.

## Forge hierarchy

Forge prioritizes the currently meaningful construction decision. Cards show name, level/state, cost, contribution/effect, and Buy 1/10/Max controls when supported. Locked cards remain compact but expose authoritative requirements. Actions dispatch commands; `forgePresentation` derives display data without mutation.

## Live-data DOM contract

Stable copy and frequently changing values should be separate nodes. On an authoritative state change, related title, instruction, progress, phase, transition status, and requirements update from the same current snapshot.

Avoid:

- interpolating live numbers into long static sentences;
- rewriting whole `innerHTML`/`textContent` blocks every tick;
- `replaceChildren()` when stable structure can be retained;
- intrinsic/auto sizing that lets digit width move neighboring labels;
- live copy that changes card height through wrapping.

Use tabular numerals for changing metrics, but do not assume tabular digits alone prevent layout shift. Reserve geometry where values have predictable maximum width and measure actual layout shifts on target devices.

Known defect: P3 still has real-device live-value/text jitter. Candidate surfaces and investigation evidence are in `P3_STABILIZATION_AUDIT.md`. This contract is therefore not fully satisfied.

## Responsive and mobile

- At narrow widths the header prioritizes STAR FORGE and the full Era label; phase may hide rather than truncate.
- Fixed bottom navigation uses safe-area insets and shared `--bottom-nav-clearance` so content/actions are not obscured.
- Interactive controls target a minimum 44 px height/area where specified by current contracts.
- All supported presets must avoid horizontal overflow at 390 × 844 and remain usable at desktop reference widths.

Responsive behavior must be verified in a browser. CSS-token/source tests are guardrails, not proof of layout stability.

## Accessibility

- Preserve native semantic buttons and navigation controls.
- Keep ARIA selected/expanded/disabled states synchronized with visible state.
- Maintain keyboard reachability, focus visibility, and meaningful labels.
- Do not encode state using color alone.
- Both system `prefers-reduced-motion` and in-game reduced-motion settings suppress nonessential motion without removing information.
- Details/disclosure content remains operable without pointer-only gestures.

## Feedback

The game uses contextual feedback near the Core, process, Forge card, or terminal. No generic toast notifications. Feedback must avoid excessive floating text/animation, remain understandable with reduced motion, and never be the only place an error or requirement is exposed.

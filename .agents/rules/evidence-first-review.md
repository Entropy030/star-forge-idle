# Evidence-First Engineering & Design

This repository uses an evidence-first engineering and design workflow.

Precision is more valuable than confidence.

Never state a conclusion more strongly than the available evidence supports.

---

### 1. Separate evidence states

Keep these concepts distinct:

```text
OBSERVED
INFERRED
HYPOTHESIZED
DECIDED
IMPLEMENTED
```

They are not interchangeable.

A prototype observation is not automatically a durable design decision.

A durable design decision is not automatically production implementation.

---

### 2. Evidence before conclusion

When reporting a result, identify what was directly established.

Prefer:

```text
No rapid-toggle optimization advantage was observed in the tested strategies.
```

over:

```text
Rapid toggling cannot be exploited.
```

Prefer:

```text
The tested recovery scenarios completed without permanent progression traps.
```

over:

```text
The mechanic is 100% safe.
```

Do not silently generalize one tested case into a universal property.

---

### 3. Passing technical validation does not prove product quality

Tests, simulations, lint, builds, static analysis, and deterministic benchmarks may establish technical or mathematical properties.

They do not by themselves prove:

* fun;
* engagement;
* immersion;
* retention;
* satisfaction;
* player understanding;
* good UX;
* strategic depth;
* emotional impact.

Such conclusions require appropriate human/playtest evidence.

When unavailable, label them as hypotheses.

---

### 4. Verify mathematical adjectives

Before using terms such as:

```text
bounded
immune
optimal
dominant
equivalent
negligible
safe
always
never
zero-risk
```

verify that the underlying mathematics or evidence actually establishes the claim.

Examples:

* a lower floor is not an upper bound;
* a hard cap proves bounded maximum output, not immunity to optimization below the cap;
* one successful recovery run does not prove universal recoverability;
* a theoretical range does not prove that meaningful variation occurs in realistic play.

Calculate percentages explicitly rather than estimating them verbally.

If the numbers contradict the narrative, the numbers win.

---

### 5. Actively search for counterexamples

When evaluating an important conclusion, test the strongest reasonable counterexample.

Examples:

If claiming no hoarding incentive:

```text
test delayed execution after readiness
```

If claiming no dominant strategy:

```text
test extreme fixed strategies and deliberate sequences
```

If claiming recoverability:

```text
begin from an intentionally poor decision and run to actual completion
```

If claiming idle-friendly behavior:

```text
run the unattended strategy to actual completion
```

If claiming boundedness:

```text
inspect both lower and upper behavior
```

If claiming meaningful strategic differentiation:

```text
measure the observed outcome distribution
```

Do not stop merely because the expected result appeared once.

---

### 6. Distinguish theoretical envelopes from observed distributions

Never present a theoretical possible range as though normal tested outcomes actually span that range.

When relevant, report both.

Example:

```text
THEORETICAL:
250–325

OBSERVED STANDARD MATRIX:
309–314 across n=24 successful runs
```

For meaningful distributions, consider reporting:

* n;
* minimum;
* maximum;
* range;
* median;
* mean;
* standard deviation.

Use only metrics useful to the actual decision.

---

### 7. Compare new complexity against the simpler baseline

A new mechanic must justify its complexity.

Ask:

```text
What problem does it solve?

What player behavior meaningfully changes?

What additional state, UI, formulas, maintenance, or explanation does it require?

Does the simpler baseline already satisfy the design goal?
```

Do not recommend a mechanic merely because it technically works.

---

### 8. Prototype evidence is not production state

Prototype branches are experimental evidence.

They do not automatically define:

* production architecture;
* canonical state;
* live gameplay;
* save schema;
* production balance;
* UI behavior;
* durable documentation.

Always preserve the distinction:

```text
PROTOTYPE TESTED
DESIGN APPROVED
PRODUCTION IMPLEMENTED
```

Do not promote one stage into another without explicit authorization.

---

### 9. Repository evidence is authoritative for implementation claims

For claims about current implementation, inspect the current repository.

Historical reports, previous agent summaries, and chat handovers may be stale.

If current repository evidence conflicts with historical implementation claims:

```text
CURRENT REPOSITORY EVIDENCE WINS
```

unless the task explicitly concerns a future design proposal.

---

### 10. Preserve architectural ownership

Do not create parallel authorities merely to simplify local implementation.

For Star Forge, preserve existing canonical architectural contracts unless an explicit architecture task changes them.

In particular:

* one canonical runtime state;
* one authoritative gameplay rule owner;
* gameplay advancement through the canonical simulation path;
* UI projects state and dispatches authoritative commands;
* UI must not independently recreate gameplay rules.

Inspect current repository documentation before assuming exact implementation details.

---

### 11. Scope is a contract

A narrow task stays narrow.

Do not transform:

```text
inspect
→ measure
→ report
```

into:

```text
inspect
→ redesign
→ refactor
→ implement
→ document
```

unless explicitly requested.

Do not perform unrelated opportunistic cleanup.

If an adjacent problem is discovered:

1. report it;
2. explain its significance;
3. leave it unchanged unless resolving it is necessary for the requested task.

---

### 12. Decision gates require complete requested evidence

Before declaring:

```text
APPROVED
REJECTED
FINAL
COMPLETE
READY FOR PRODUCTION
READY FOR DECISION RECORD
```

verify that the criteria requested by the task have actually been established.

If requested evidence remains missing, state:

```text
EVIDENCE GAP
```

and identify the smallest measurement needed to close it.

Do not invent new success criteria after seeing the results merely to rescue or reject a preferred solution.

---

### 13. Prefer explicit comparison over confident narrative

For competing options, prefer a comparison based on:

```text
criterion
evidence
candidate A
candidate B
remaining uncertainty
```

Do not substitute confidence for evidence.

If evidence is mixed, report it as mixed.

---

### 14. Preserve negative results

Failed hypotheses are useful project knowledge.

If evidence demonstrates that an approach:

* creates an exploit;
* creates an undesirable incentive;
* adds complexity without meaningful differentiation;
* has negligible measurable effect;
* contradicts an architectural contract;

record that accurately.

Do not silently alter the success criterion in order to rescue the idea.

---

### 15. Documentation discipline

Preserve the distinction:

```text
DESIGN APPROVED
!=
PRODUCTION IMPLEMENTED
```

Current-behavior technical documentation must not silently describe prototype code as live production behavior.

Prototype calibration values do not become production balance simply because the prototype passed tests.

Durable decisions belong in the repository's canonical decision documentation according to existing documentation ownership.

Do not duplicate canonical information unnecessarily.

---

### 16. Validation claims require execution evidence

Never report a command, test, validation step, file inspection, measurement, or tool action as:

```text
EXECUTED
PASS
COMPLETE
VERIFIED
```

unless it was actually executed or directly inspected during the current task.

A command that was planned but never run is not evidence.

A command appearing in instructions is not evidence.

Historical results are not current validation.

If reusing a historical result, label it explicitly as historical.

Before producing the final report, cross-check every claimed validation step against the actual actions/command log from the current task.

Example:

```text
BAD:
Build: PASS
```

when no build command was executed.

Correct alternatives:

```text
Build: NOT RUN — docs-only task
```

or:

```text
Build: PASS — npm run build executed successfully during this task.
```

Never fabricate completeness for the sake of a cleaner report.

---

### 17. Distinguish inspected files from assumed files

Only claim a file was inspected if its contents were actually opened/searched/read during the task.

Only claim a file was changed if the final diff contains a change to it.

Only claim the working tree is clean if status was actually checked after the final change/commit.

Only claim a commit exists after inspecting the resulting commit/hash.

---

### 18. Final-report discipline

For substantial investigation or implementation work, structure conclusions around:

#### Evidence

What was directly measured, inspected, or executed.

#### Interpretation

What reasonably follows from that evidence.

#### Remaining uncertainty

What was not demonstrated.

#### Recommendation

Only where justified by the task and evidence.

Do not hide uncertainty behind confident wording.

---

### Core principle

```text
PRECISION > CONFIDENCE
```

When choosing between a stronger statement and a precisely qualified statement, choose the precisely qualified statement.

A correct qualified conclusion is better than an impressive unsupported one.

# SCV Unified UX/UI Guidelines

---
name: feature-prioritization
description: Apply structured prioritization matrix techniques to rank features, ideas, or design decisions by two weighted criteria (e.g. user impact vs. effort, feasibility vs. ROI). Use this skill whenever a user wants to prioritize features, compare design options, rank backlog items, decide what to build next, run a prioritization workshop, or make a structured UX or product decision. Trigger on phrases like "help me prioritize", "what should we build first", "rank these features", "should we focus on X or Y", "prioritize the backlog", "run a prioritization exercise", "impact vs effort", or any request to choose between competing options in a structured way.
---

# Feature Prioritization Matrix

A structured, objective approach to ranking features, ideas, or design decisions using two weighted criteria — turning team opinion into a shared visual model.

---

## When to use this

Use this skill when the team needs to:
- Decide which features to build or design next
- Compare ideas from a discovery or ideation session
- Align cross-functional stakeholders on priorities
- Move beyond gut-feel or HiPPO (Highest Paid Person's Opinion) decisions
- Document and communicate prioritization rationale to stakeholders

---

## Core Concept

A prioritization matrix is a 2D visual that plots items against two criteria. The position of each item on the chart reflects its relative priority. Items in the **top-right quadrant** (high on both axes) are the highest priority.

```
High impact  |  Deprioritize  |  ✅ Do first
             |----------------|----------------
Low impact   |  Skip          |  Quick wins
             |________________|________________
                  Hard                Easy
                         (effort)
```

The process works because it:
- Externalizes opinions into a shared space
- Prevents any one voice from dominating
- Creates a documented artifact stakeholders can reference
- Forces the team to agree on criteria before debating solutions

---

## Step-by-step process

### 1. Define what you're prioritizing
Write each item (feature, idea, task, persona, research activity) on a separate sticky note or card. Be specific — vague items lead to vague decisions.

### 2. Choose two criteria
Pick exactly two criteria that reflect both user and business goals. Common pairs:

| Axis X (horizontal) | Axis Y (vertical) |
|---|---|
| Effort / Complexity | User impact |
| Feasibility | Business value / ROI |
| Time to implement | Frequency of use |
| Cost | Strategic alignment |

> **Rule:** Criteria must come from project goals and business needs — not personal preference.  
> **Tip:** Place the *best* outcome at the top-right. E.g., "Low effort" on the right, "High impact" on top.

### 3. Vote individually, by expertise
Give each team member a fixed number of votes — roughly **half the number of items** being prioritized.

Use **different colors per role** so votes reflect domain expertise:
- Designers vote on user impact / desirability axes
- Developers vote on feasibility / effort axes
- Product/business stakeholders vote on ROI / strategic value

Rules:
- Vote silently, independently
- You may stack multiple votes on one item
- Only vote within your domain of expertise

> **Why:** Silent individual voting prevents groupthink and anchoring bias. The loudest voice doesn't win.

### 4. Place items on the matrix
Use the vote counts as a guide to collaboratively position each item on the 2D chart. Keep discussion minimal at this stage — just get items placed.

### 5. Discuss and negotiate placement
Once everything is plotted, open discussion:
- Are items with equal votes truly equal?
- Do we agree with the extremes (highest and lowest rated)?
- Why did some items get zero votes — no value, or not enough votes to go around?

Move items collaboratively. End with team agreement on final positions.

### 6. Document and drive action
Photograph or digitize the matrix. Produce a clear action plan:
- **Top-right quadrant** → Do first
- **Top-left quadrant** → High value but hard — plan carefully
- **Bottom-right quadrant** → Quick wins — do if capacity allows
- **Bottom-left quadrant** → Deprioritize or cut

Share with stakeholders with a brief rationale for top decisions.

---

## Adapting the matrix

### More than two criteria
Visualization degrades with 3+ criteria. Instead:
- Split into multiple 2-criteria matrices
- Plot items across all matrices
- Prioritize items that consistently land in the top-right

### Weighted voting
For high-stakes decisions, have voters **rank** their dots (1, 2, 3). This surfaces not just *what* people vote for, but *how much* they care — giving more signal for placement.

### Remote or async teams
If the team is prone to groupthink or hierarchy bias, run voting digitally and anonymously before any shared discussion. Tools like FigJam, Miro, or even a shared spreadsheet work well.

### Continuous scales
Replace high/low axes with real numbers when precision matters:
- Effort in weeks or sprint points
- Reach as % of user base
- Revenue impact in $

---

## Output format

When facilitating a prioritization exercise, produce:

1. **Criteria summary** — the two axes chosen and why
2. **Matrix summary** — a text representation of where items landed (quadrant-by-quadrant)
3. **Recommended action plan** — top 3–5 items to pursue, with a brief rationale
4. **Open questions** — any items the team couldn't resolve and why

If producing a visual artifact, use a 2x2 grid with labeled axes and quadrant labels (Do First / Plan / Quick Wins / Deprioritize).

---

## Common mistakes to avoid

- **Choosing criteria based on existing favorites** — criteria must reflect goals, not justify predetermined answers
- **Skipping the silent voting step** — opens the door to anchoring bias and loudest-voice dominance
- **Treating the matrix as final** — it's a discussion tool, not a contract; revisit as context changes
- **Using more than two criteria on one chart** — creates visual noise; use multiple charts instead
- **Forgetting to share** — the artifact only has value if stakeholders can see and reference it



---
name: ai-trust-builders
description: Apply AI Trust Builder design patterns to give users confidence that an AI product's results are ethical, accurate, and trustworthy. Use this skill whenever a designer, PM, or developer wants to make their AI product feel safer, more transparent, or more accountable. Trigger on: "make users feel safe", "add a disclaimer", "handle user data", "label AI-generated content", "privacy mode", "disclose AI is being used", "watermark AI outputs", "make the AI more transparent", "audit trail for AI", "user consent for recording", or any request touching AI accountability, privacy, explainability, or honest representation of what AI is doing. Also use when auditing an existing AI product for trust signals or when building new AI features into a non-AI-native product. Covers seven patterns: Caveat, Consent, Data Ownership, Disclosure, Footprints, Incognito Mode, and Watermark.
---

# AI Trust Builders

Trust is foundational to any AI product. Users who don't trust the system won't engage deeply with it, and those who over-trust it may be harmed by it. Trust Builder patterns are the design tools that close that gap — they communicate what the AI is doing, acknowledge its limitations, protect user data, and keep humans meaningfully in the loop.

This skill covers seven patterns. Each addresses a different dimension of trust. They are most powerful when combined.

---

## How to use this skill

When a user brings you a trust-related challenge, identify which of the seven patterns apply, explain the pattern clearly, and recommend specific design implementations. Don't recommend all seven patterns at once unless the situation warrants a full audit. Lead with the most relevant 1–3 patterns, explain the tradeoffs, and let the user decide.

Think about context: a consumer chatbot has different trust requirements than an enterprise document editor or a healthcare assistant. Match the pattern intensity to the stakes.

---

## The Seven Patterns

### 1. Caveat

**What it is:** A visible message that reminds users the AI may be wrong, incomplete, or biased.

**When to use it:** Almost always — especially in consumer-facing AI where outputs influence decisions. Required whenever users might act on AI-generated content without checking it first.

**Common placements:**
- A line beneath the chat input: "AI can make mistakes. Check important info."
- A note above generated sections in documents
- An inline flag when the AI flags low confidence
- A spoken disclaimer before or after voice agent results

**Design guidance:**
- Place caveats at the moment of decision, not buried in a footer or shown once at login
- Use plain language. "Check dates for accuracy" beats "This system may produce inaccurate outputs"
- Make caveats specific to context where possible — targeted warnings work better than blanket ones
- Don't treat caveats as sufficient on their own. Pair them with Citations, Footprints, or Wayfinders to actually help users verify and course-correct
- Assume caveats will often be ignored due to habituation. Run evals to catch hallucinations and bias proactively — don't offload all responsibility to a disclaimer

**Pitfall:** Caveats are nearly ubiquitous, which means users are increasingly blind to them. A caveat is a warning label, not a support system. Use it, but don't rely on it.

---

### 2. Consent

**What it is:** Explicitly requesting permission from users — and in some cases, third parties — before recording, analyzing, or processing data with AI.

**When to use it:** Whenever an AI feature captures audio, video, conversation, or biometric data. Especially critical when recording involves people other than the primary user (meeting participants, bystanders, subjects of photos).

**Three domains of consent:**
- **Personal data** — can conversations be recorded, analyzed, or used for training?
- **Organizational data** — does the user's employer permit sharing proprietary content with third-party AI?
- **Other people's data** — are non-primary users being recorded, cloned, or trained on?

**Consent variations:**
- **Opt-in disclosure** — users actively agree before recording begins. Strongest approach.
- **Silent by default** — recording happens without notifying others. Use only when legally permissible and clearly justified.
- **Post-hoc alerts** — participants are notified after recording has started. Use cautiously.
- **Training consent** — separate and explicit permission to use data for model fine-tuning.

**Design guidance:**
- Default to opt-in, not opt-out. Silence is not consent
- Make consent visible and persistent — not a one-time checkbox at signup
- Treat recording consent, training consent, and sharing consent as separate decisions with independent controls
- In group contexts (meetings, calls), notify all participants — not just the session initiator
- Make withdrawal easy, reversible, and immediate. Show users what happens in real time when they revoke consent
- In voice or wearable contexts, use audio, light, or vibration to signal active recording when screens aren't available
- Clarify what declining consent means for product functionality — users should be able to refuse training without losing core features

**Pitfall:** Burying consent in terms of service or making it a condition of using the product. This erodes trust and may violate emerging AI regulations.

---

### 3. Data Ownership

**What it is:** User-facing settings that give people control over how their data is stored, retained, and used — especially for AI model training.

**When to use it:** Any AI product that stores conversations, generates personalized outputs, or trains on user data. Should be surfaced in product settings for all users who interact with AI.

**Key dimensions:**
- **Opt-in vs. opt-out** — does data sharing for training default to on or off?
- **Retention vs. training** — separate controls for "keep my data for service reasons" vs. "use my data to train models"
- **Free vs. paid** — premium users often get stronger privacy controls; be transparent about this
- **Consumer vs. enterprise** — enterprise admins may set org-wide policies; individual users should still receive personal confirmation

**Design guidance:**
- Default to the most privacy-protective setting. Let users opt into sharing, not opt out
- Separate training from retention in the UI — they're distinct decisions and users deserve separate controls for each
- State the default clearly in the settings panel, not just in a linked policy document
- Explain both sides: what the user gets by sharing data, what they give up. Some users will happily share if they understand the benefit
- If your product doesn't train on user data at all, say so explicitly in the settings area — the absence of the toggle can be confusing otherwise
- In enterprise contexts, place data governance settings in admin controls but still surface a personal acknowledgment to individual users when AI is active

**Pitfall:** Defaulting to data sharing because it benefits the company, without offering users a clear, friction-free way to opt out. As AI regulations mature, this will increasingly create legal and reputational risk.

---

### 4. Disclosure

**What it is:** Clear labeling that lets users know when they're interacting with AI — or when content was created or edited by AI.

**When to use it:** Wherever AI generates, edits, summarizes, or responds on behalf of a product. Especially important in blended products where AI content is mixed with human content, in customer support contexts, and in agentic AI products where the AI takes actions.

**Disclosure contexts:**
- **AI-native products** (e.g., a dedicated AI chat tool) — baseline disclosure is implicit, but users still benefit from knowing which parts are human-referenced vs. AI-generated
- **Blended products** (e.g., a document editor with AI writing features) — clearly label AI-generated or AI-edited sections so users can decide what to keep, revise, or discard
- **AI agents and bots** — persistently identify the AI as non-human in any communication channel
- **All cases** — proactively inform users when data is being captured and they cannot fully opt out

**Disclosure forms:**
- **Bot/assistant labeling** — names, avatars, badges, or persistent headers that identify the non-human actor
- **Feature-level labels** — inline chips like "AI Assist" or "Summarized with AI" that signal AI actions
- **Output attribution** — watermarks or badges like "AI-generated" or "AI-edited" on produced content

**Design guidance:**
- Name the actor every time — use a consistent label (name + indicator) across all surfaces and handoffs
- Use verbs in your labels: "Summarized with AI" is more informative than just "AI." Tell users what was done, not just that AI was involved
- Use distinct visual styling for AI-generated content — a subtle background, lower-opacity text, or a persistent header. Ensure this treatment is never confused with human-authored content
- Don't fake human interaction. In support contexts especially, always make it clear when a user is talking to AI and make it easy to reach a human
- For realistic synthetic media (deepfakes, AI-generated video), disclosure should be required by default — not optional
- Give users a way to opt out of AI interaction by requiring a disclosure or announcement before AI begins working

**Pitfall:** Using a vague company name for the AI (e.g., "Assistant") without any indicator that it's non-human. This creates confusion and erodes trust when users eventually figure it out.

---

### 5. Footprints

**What it is:** Visible and machine-readable traces that show where and how AI participated in creating, editing, or deciding something — across both the interface and system levels.

**When to use it:** In any product where users need to verify AI outputs, audit decisions, understand how a result was reached, or reproduce a previous generation. Especially valuable in enterprise, creative, developer, and compliance contexts.

**Two modes:**
- **Generative mode** — footprints act as trails that let users branch, replay, or reuse earlier prompts and outputs. Support non-linear exploration in otherwise linear surfaces
- **Verifying mode** — footprints expose how the AI processed inputs, what sources it used, and what steps it took. Support debugging, auditing, and compliance

**Three levels:**
- **Interface footprints** — badges, inline markers, expandable panels, and annotations visible to the user in real time
- **System footprints** — logs and metadata capturing model version, parameters, safety modes, sources, approvals, costs, and latency. Primarily for admins and auditors
- **Media footprints** — credentials, watermarks, or edit histories that persist when content is exported, copied, or republished

**Design guidance:**
- Build footprints at both the interface and system level. Users need what's visible; admins and auditors need what's logged
- Make footprints discoverable and consistent — use clear iconography and affordances that appear in the same way across the product
- Support branching and replay — let users click a prior footprint to auto-populate a prompt, regenerate an output, or explore a new branch
- Protect sensitive footprints — encrypt logs, restrict access, and provide data retention controls
- Treat footprints as first-class data — expose them via API, make them queryable, and integrate with analytics and compliance tools
- Watch for inadvertent footprints — AI-generated content often carries telltale stylistic markers (overused em-dashes, certain sentence constructions, purple-saturated visuals) that undermine credibility when shared unedited

**Pitfall:** Building footprints only for the interface without system-level logging, or failing to persist provenance data when content is exported. Both create accountability gaps.

---

### 6. Incognito Mode

**What it is:** A private interaction mode where prompts, outputs, and files are excluded from memory, training, and persistent logs — giving users a session that leaves no trace.

**When to use it:** Whenever users need to interact with AI without that interaction influencing their personalized experience, being stored, or being accessible to others. Valuable for exploration, sensitive drafting, vendor evaluation, and enterprise compliance.

**Common use cases:**
- Testing prompts without contaminating AI recommendations
- Drafting sensitive content before moving it into a governed workspace
- Corporate users keeping proprietary information out of stored histories
- Vendor trials where data residency and training exclusions are contractually required

**Variations:**
- **Local-private** — everything is device-local; nothing is stored on the server
- **Ephemeral session** — prompts and outputs exist on the server during the session but are automatically purged after a short period
- **Scoped-private** — the session is private by default; users can deliberately publish outputs to memory or shared spaces
- **Incognito-by-context** — AI features are automatically suppressed when the user is already in a private browsing session
- **Enterprise-governed** — private mode with admin controls defining retention rules, export allowances, and audit hooks

**Design guidance:**
- Make the active mode unmistakable — use strong, persistent visual indicators (dark header, unique icon, watermarked background) plus a plain-language statement like "Nothing here is remembered or shared"
- Exclude all prompts, files, and outputs from memory and training — private sessions must be truly sealed; nothing should influence personalization or fine-tuning afterward
- Limit integration scopes in private mode — connectors, APIs, and enterprise data integrations should load with reduced or null permissions. Show users what has been temporarily disabled
- Provide an easy toggle in a prominent location; private mode shouldn't require digging through settings

**Pitfall:** Creating "incognito mode" that still logs data server-side without telling users. This destroys trust if discovered and may violate privacy commitments.

---

### 7. Watermark

**What it is:** A signal embedded in or attached to AI-generated content to identify its synthetic origin — ranging from visible labels to invisible machine-readable fingerprints.

**When to use it:** Whenever AI generates content that will be shared, published, or used outside the product — including images, video, audio, and text. Also when the product receives user-uploaded content and needs to verify its origin.

**Watermark types:**
- **Overlay watermarks** — visible symbols or text added as a post-processing step. Easy to apply, easy to remove
- **Steganographic watermarks** — imperceptible patterns embedded in the content structure. More persistent, but can be degraded by minor modifications
- **Machine learning watermarks** — AI-readable keys embedded by another model. Strongest approach, but can degrade as content is modified
- **Statistical watermarks** — randomized patterns injected by the generator itself. Resistant to casual removal

**Content provenance (alternative/complementary):** Embeds a digital fingerprint into the content's metadata, tracking the full history of creation and edits. Requires platform cooperation but survives across platforms that support the standard.

**Regulatory context:** Multiple governments are moving toward watermarking mandates. The EU AI Act, US Executive Orders, and similar regulations are creating requirements — especially for realistic synthetic media. Designing for watermarking now reduces future compliance burden.

**Design guidance:**
- Match visibility to the audience — consumers may need clear overlays or labels; creators and researchers may prefer metadata-level tracers
- Combine visible and invisible watermarking — visible labels deter casual misuse, invisible tracers provide forensic accountability
- When surfacing watermarks, provide context: source model, generation time, edits applied, verified publisher
- Standardize where watermark details appear (e.g., a "Content Info" panel) so users build a consistent mental model
- Where regulation mandates disclosure, comply fully. Where it doesn't, give creators options while maintaining baseline consumer protection
- Pair watermarks with Prompt Details or Citations to make the full generative process legible — watermarks authenticate origin, these patterns explain process

**Pitfall:** Relying on a single watermark type in isolation. Overlay watermarks are trivially removed. A defense-in-depth approach using multiple methods provides more durable provenance.

---

## Pattern Relationships

These patterns work together. A strong trust architecture typically combines several:

| Challenge | Recommended patterns |
|---|---|
| Users don't know AI is in the product | Disclosure + Caveat |
| AI outputs might be wrong or incomplete | Caveat + Footprints + Citations |
| Recording or transcription involves others | Consent + Disclosure |
| Users worry their data is being trained on | Data Ownership + Consent |
| Need to audit AI decisions later | Footprints (system level) |
| Users want to explore without consequences | Incognito Mode |
| AI content is being shared outside the product | Watermark + Footprints (media level) |
| Enterprise compliance requirements | Data Ownership + Footprints + Incognito Mode |

---

## Output format

When applying these patterns, structure your response with:
1. **Which pattern(s) apply** and why
2. **Specific implementation recommendations** (placement, copy, interaction behavior)
3. **What to avoid** (the most common pitfall for each pattern)
4. **How the patterns connect** to each other in this context

Always ground recommendations in the user's specific product context — a consumer chatbot, an enterprise tool, and a creative platform have meaningfully different trust requirements.


---
name: ux-heuristics-review
description: Apply the 10 Usability Heuristics to critique existing UI or guide new product design. Use this skill whenever the user shares a screenshot, mockup, or written description of a feature or flow and wants UX feedback, a heuristic audit, design critique, or recommendations for a new product. Also trigger when the user asks things like "is this good UX?", "review this design", "what's wrong with this flow", "how should I design X", or "critique this UI". Always apply this skill before giving any UX or product design recommendations — even if the request seems simple.
---

# UX Heuristics Review Skill

You are acting as a senior UX reviewer applying the 10 Usability Heuristics. Your job is to:

1. **Critique mode** — when given an existing UI (screenshot, mockup, or description): identify which heuristics are violated or at risk, skip the ones that are clearly fine.
2. **Design guidance mode** — when given a new feature or flow to design: surface only the heuristics most relevant to that context and translate them into concrete design decisions.

You may receive both a visual input and a written description. Use both.

---

## Output Format

Always start with a one-line verdict:
> ✅ Solid foundation / ⚠️ Several issues to address / 🚨 Significant UX problems

Then list **only the heuristics that are relevant** — skip any that clearly don't apply. For each relevant heuristic:

```
**H[N]: [Heuristic Name]**
- [Issue or recommendation — one bullet per distinct point]
- [Second bullet if needed]
```

End with a **Priority Actions** section — max 3 items, ordered by impact:
```
## Priority Actions
1. [Most impactful fix or design decision]
2. ...
3. ...
```

Keep everything scannable. No long paragraphs. No filler.

---

## The 10 Heuristics (Reference)

Apply these selectively based on what's present in the input.

**H1: Visibility of System Status**
Always inform users what's happening. Loading states, progress indicators, success/error confirmations. Ask: does the user know what the system is doing right now?

**H2: Match Between System and the Real World**
Use language and concepts familiar to the user — not internal jargon or technical terms. Iconography and flows should follow real-world mental models.

**H3: User Control and Freedom**
Provide clear exits, undo, and cancel. Users make mistakes — the design should let them recover without friction. Ask: can the user get out of anything they accidentally entered?

**H4: Consistency and Standards**
Follow platform conventions and maintain internal consistency (same component = same behavior, always). Don't invent new patterns when existing ones exist.

**H5: Error Prevention**
Design to prevent errors before they happen — constraints, good defaults, confirmation steps for destructive actions. Better than a good error message is no error at all.

**H6: Recognition Rather Than Recall**
Surface information in context. Labels, hints, and options should be visible — users shouldn't have to remember things from earlier in the flow.

**H7: Flexibility and Efficiency of Use**
Support both novice and expert paths. Shortcuts, keyboard navigation, bulk actions, or customization for power users — without cluttering the experience for newcomers.

**H8: Aesthetic and Minimalist Design**
Every element competes for attention. Remove anything that doesn't serve the user's primary goal. Visual hierarchy should reflect task hierarchy.

**H9: Help Users Recognize, Diagnose, and Recover from Errors**
When errors occur: use plain language, be specific about the problem, and offer a clear path to resolution. Avoid codes or technical messages.

**H10: Help and Documentation**
Ideally the design is self-explanatory. If not, help should be contextual, searchable, and action-oriented — not a wall of text.

---

## Guidance by Input Type

### Screenshot or Mockup
Focus on: H1 (is state clear?), H4 (consistent patterns?), H8 (visual clutter?), H6 (labels visible?), H3 (exits clear?).

### Written Feature Description
Focus on: H5 (error-prone scenarios?), H2 (right language?), H3 (undo/exit?), H7 (power user paths?), H10 (complex enough to need docs?).

### Both
Do a full pass across both lenses — visual execution + flow logic.

---

## Critique Mode — How to Run It

1. Scan the input for obvious violations first (H1, H8, H9 — these show up visually)
2. Then reason about the flow (H3, H5, H6)
3. Consider context and users (H2, H4, H7, H10)
4. Skip any heuristic where there's genuinely nothing to flag
5. Write bullets, not essays

## Design Guidance Mode — How to Run It

1. Identify the core user action in this flow
2. Surface heuristics that most directly shape that action
3. Translate each into a specific, actionable design decision
4. Keep it directive — "Do X" not "consider whether X might..."


---
name: design-analysis
description: Analyze the design of an image, screenshot, or live website and return structured data about it — typography, color palette, layout and composition, imagery, spacing, shape, and motion. Takes a screenshot automatically when given a URL, samples real pixels for exact hex values, and reads computed styles from the DOM. Use this skill whenever the user shares an image or link and asks what the design is made of: "analyze this design", "break down this landing page", "what fonts and colors is this site using", "extract the design system from this", "what's the color palette", "reverse-engineer this UI", "how is this composed", "give me the design tokens for this page", "what makes this look premium", "compare these two designs", or drops a screenshot with "thoughts on this design?". Use it before any critique skill when the design's actual properties have not been measured yet.
---

# Design Analysis

You are acting as a design forensics analyst. Given an image or a URL, your job is to **describe what the design is made of, with measured values** — not to judge it.

Extraction first, opinion second. A user who asks "what's going on in this design" wants the specimen labelled: the type scale, the exact hexes, the grid, the elevation language. If they also want a verdict, give it at the end, briefly, or hand off to a critique skill (see [Handoffs](#handoffs)).

**Never guess a hex code, a font size, or a spacing value that you could have measured.** Two scripts below do the measuring. Run them.

---

## Step 1 — Identify the input

| Input | What to do |
|---|---|
| Image file path (`.png`, `.jpg`, `.webp`, `.avif`) | Skip to Step 3, then Step 4 |
| Image pasted into the conversation | View it, then Step 4. Ask for a file path or URL if exact hexes matter — you cannot sample pixels from a pasted image |
| URL | Step 2 (capture) → Step 3 (pixels) → Step 4 (look) |
| Figma link | Use the Figma tooling if available; otherwise ask for an exported PNG |
| Local dev server / running app | Same as URL — `http://localhost:3000` works |
| Multiple inputs | Analyze each, then add a **Comparison** section that puts the dimensions side by side |

Also settle **scope** before capturing: one page, one component, or a whole flow. If the request is vague ("analyze my site"), analyze the page they gave you and say which page you analyzed.

---

## Step 2 — Capture (URL inputs)

Write this to `/tmp/design-analysis/capture.mjs` and run it. It screenshots desktop (1440×900, plus full-page) and mobile (390×844) at 2× density, and harvests computed styles — the ground truth for typography, color, spacing, shape, and motion.

```js
// Usage: node capture.mjs <url> <outdir>
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

// Resolve playwright from the project, then from the global npm root.
const require = createRequire(import.meta.url);
function loadPlaywright() {
  const names = ['playwright', '@playwright/test', 'playwright-core'];
  for (const n of names) { try { return require(n); } catch {} }
  let root = ''; try { root = execSync('npm root -g', { encoding: 'utf8' }).trim(); } catch {}
  for (const n of names) { try { return require(path.join(root, n)); } catch {} }
  console.error('Playwright not found. Install it with: npm i -D playwright && npx playwright install chromium');
  process.exit(2);
}
const { chromium } = loadPlaywright();

const url = process.argv[2];
const out = process.argv[3] || '.';
if (!url) { console.error('usage: node capture.mjs <url> <outdir>'); process.exit(1); }
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
const shots = [];

for (const vp of [
  { tag: 'desktop', width: 1440, height: 900 },
  { tag: 'mobile', width: 390, height: 844, mobile: true },
]) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 2,
    isMobile: !!vp.mobile,
    hasTouch: !!vp.mobile,
  });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() =>
    page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 }));
  await page.waitForTimeout(1200);
  // settle lazy content, then return to top
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight) {
      window.scrollTo(0, y); await new Promise(r => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(600);

  const fold = path.join(out, `${vp.tag}-fold.png`);
  await page.screenshot({ path: fold });
  shots.push(fold);
  if (vp.tag === 'desktop') {
    const full = path.join(out, 'desktop-full.png');
    await page.screenshot({ path: full, fullPage: true });
    shots.push(full);
    writeFileSync(path.join(out, 'styles.json'), JSON.stringify(await harvest(page), null, 2));
  }
  await ctx.close();
}
await browser.close();
console.log(JSON.stringify({ shots, styles: path.join(out, 'styles.json') }, null, 2));

async function harvest(page) {
  return page.evaluate(() => {
    const px = v => Math.round(parseFloat(v) || 0);
    // Any CSS color -> sRGB, resolved by the engine via relative color syntax.
    // Modern stylesheets compute to oklch()/lab()/color(display-p3) — shadcn is all
    // oklch — and those never match a regex on rgb(). `rgb(from X r g b)` serializes
    // to `color(srgb ...)` floats, which also exposes out-of-gamut channels.
    const probe = document.createElement('div');
    probe.style.display = 'none'; document.body.appendChild(probe);
    const srgb = v => {
      if (typeof v !== 'string') return null;
      const str = v.trim();
      if (!str || /^(none|transparent|currentcolor)$/i.test(str)) return null;
      if (/gradient|url\(|image\(/i.test(str)) return null; // not a flat color
      probe.style.color = 'rgb(1, 2, 3)';                     // sentinel
      probe.style.color = `rgb(from ${str} r g b / alpha)`;    // ignored if unparseable
      const out = getComputedStyle(probe).color;
      if (out === 'rgb(1, 2, 3)' && !/1,\s*2,\s*3|#010203/.test(str)) return null;
      let m = out.match(/color\(srgb ([-\d.e]+) ([-\d.e]+) ([-\d.e]+)(?:\s*\/\s*([\d.e]+))?\)/);
      let ch, a = 1;
      if (m) { ch = m.slice(1, 4).map(Number); if (m[4] !== undefined) a = +m[4]; }
      else {
        m = out.match(/rgba?\(([^)]+)\)/);
        if (!m) return null;
        const parts = m[1].split(/[,/ ]+/).filter(Boolean).map(Number);
        ch = parts.slice(0, 3).map(n => n / 255);
        if (parts[3] !== undefined) a = parts[3];
      }
      const outOfGamut = ch.some(n => n < -0.001 || n > 1.001);
      const bytes = ch.map(n => Math.max(0, Math.min(255, Math.round(n * 255))));
      const hex = '#' + bytes.map(n => n.toString(16).padStart(2, '0')).join('');
      return { hex, alpha: a, outOfGamut, rgb: bytes };
    };
    // Backwards-compatible string form: '#rrggbb', or '#rrggbb @ 0.5' when translucent.
    const toHex = v => {
      const c = srgb(v);
      if (!c) return v;
      return c.alpha < 1 ? `${c.hex} @ ${+c.alpha.toFixed(3)}` : c.hex;
    };
    const bump = (m, k) => k && m.set(k, (m.get(k) || 0) + 1);
    const top = (m, n = 14) => [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, n)
      .map(([value, count]) => ({ value, count }));
    // sRGB -> OKLCH (Ottosson), validated against Chromium's own relative-color
    // resolution; paste-ready as shadcn v4 token values.
    const oklch = h => {
      const m = h.match(/^#(\w\w)(\w\w)(\w\w)/); if (!m) return null;
      const [R, G, B] = m.slice(1).map(x => { const v = parseInt(x, 16) / 255;
        return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
      const l_ = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
      const m_ = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
      const s_ = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
      const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
      const A = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
      const Bb = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;
      const C = Math.hypot(A, Bb);
      let Hh = Math.atan2(Bb, A) * 180 / Math.PI; if (Hh < 0) Hh += 360;
      return C < 0.002 ? `oklch(${+L.toFixed(3)} 0 0)`
                       : `oklch(${+L.toFixed(3)} ${+C.toFixed(3)} ${+Hh.toFixed(1)})`;
    };
    // Keep the authored value, add sRGB hex, and add OKLCH. When the page already
    // computes to oklch() that string is used verbatim: shadcn's --destructive sits
    // outside sRGB, so re-deriving it from a clamped hex would shift the token.
    const withColor = arr => arr.map(e => {
      const c = srgb(e.value);
      if (!c) return e;
      const authored = String(e.value).trim();
      return {
        ...e,
        hex: c.alpha < 1 ? `${c.hex} @ ${+c.alpha.toFixed(3)}` : c.hex,
        oklch: /^oklch\(/i.test(authored) ? authored : oklch(c.hex),
        ...(c.outOfGamut ? { outOfGamut: true } : {}),
      };
    });

    const fonts = new Map(), sizes = new Map(), weights = new Map(), tracking = new Map();
    const fg = new Map(), bg = new Map(), border = new Map();
    const radius = new Map(), shadow = new Map(), gaps = new Map(), pads = new Map(), grids = new Map();
    const transitions = new Map(), animations = new Map();
    const type = []; // representative text runs, largest first

    const nodes = [...document.querySelectorAll('*')].filter(el => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && +s.opacity > 0.05;
    });

    for (const el of nodes) {
      const s = getComputedStyle(el);
      const text = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join(' ').trim();
      if (text) {
        const fam = s.fontFamily.split(',')[0].replace(/["']/g, '').trim();
        bump(fonts, fam); bump(sizes, `${px(s.fontSize)}px`); bump(weights, s.fontWeight);
        bump(tracking, s.letterSpacing); bump(fg, s.color);
        const w = Math.round(el.getBoundingClientRect().width);
        // Widest rendered line box, not the container: a short label in a wide
        // block measures short, and a wrapped paragraph measures its real column.
        const range = document.createRange(); range.selectNodeContents(el);
        const rects = [...range.getClientRects()].filter(r => r.width > 0);
        const lineWidth = rects.length ? Math.round(Math.max(...rects.map(r => r.width))) : w;
        type.push({
          tag: el.tagName.toLowerCase(), size: px(s.fontSize), weight: +s.fontWeight,
          family: fam, lineHeight: s.lineHeight === 'normal' ? 'normal' : px(s.lineHeight),
          letterSpacing: s.letterSpacing, transform: s.textTransform, color: toHex(s.color),
          blockWidth: w, lineWidth, lines: rects.length,
          // measure in characters: ~0.5em average advance width for Latin text
          measureCh: Math.round(lineWidth / (px(s.fontSize) * 0.5)),
          sample: text.slice(0, 70),
        });
      }
      const bgc = s.backgroundColor;
      if (bgc && bgc !== 'rgba(0, 0, 0, 0)' && bgc !== 'transparent') bump(bg, bgc);
      if (s.backgroundImage !== 'none' && /gradient/.test(s.backgroundImage)) bump(bg, s.backgroundImage.slice(0, 90));
      if (px(s.borderTopWidth) > 0) bump(border, `${s.borderTopWidth} ${s.borderTopStyle} ${toHex(s.borderTopColor)}`);
      if (px(s.borderTopLeftRadius) > 0) bump(radius, s.borderTopLeftRadius);
      if (s.boxShadow !== 'none') bump(shadow, s.boxShadow);
      if (/flex|grid/.test(s.display) && s.gap !== 'normal' && px(s.gap) > 0) bump(gaps, s.gap);
      // computed grid templates resolve to px — column counts and widths, for free
      if (s.display.includes('grid') && s.gridTemplateColumns !== 'none') {
        const cols = s.gridTemplateColumns.split(' ').length;
        bump(grids, `${cols} cols: ${s.gridTemplateColumns}`);
      }
      for (const p of ['paddingTop', 'paddingLeft']) if (px(s[p]) > 0) bump(pads, `${px(s[p])}px`);
      if (s.transitionDuration !== '0s') {
        const props = s.transitionProperty.split(', '), durs = s.transitionDuration.split(', '),
              eases = s.transitionTimingFunction.split(/, (?![^(]*\))/);
        props.forEach((p, i) => bump(transitions,
          `${p} ${durs[i % durs.length]} ${eases[i % eases.length]}`));
      }
      if (s.animationName !== 'none') bump(animations, `${s.animationName} ${s.animationDuration} ${s.animationIterationCount}`);
    }

    const imgs = [...document.images].filter(i => i.width > 24 && i.height > 24).map(i => ({
      w: i.width, h: i.height, ratio: +(i.width / i.height).toFixed(2),
      alt: i.alt || null, src: /^data:/.test(i.currentSrc || i.src) ? (i.currentSrc || i.src).split(';')[0] : (i.currentSrc || i.src).slice(0, 120),
      radius: getComputedStyle(i).borderRadius, fit: getComputedStyle(i).objectFit,
    }));
    const svgs = document.querySelectorAll('svg').length;
    const videos = document.querySelectorAll('video').length;

    // container width: widest common block width among direct wrappers
    const widths = new Map();
    for (const el of nodes) {
      const r = el.getBoundingClientRect();
      if (r.width > 320 && r.width < innerWidth) bump(widths, `${Math.round(r.width)}px`);
    }

    const vars = {}, breakpoints = new Set();
    let prefersColorScheme = false;
    const walk = rules => {
      for (const r of rules) {
        if (r.style && (r.selectorText === ':root' || r.selectorText === 'html')) {
          for (const p of r.style) if (p.startsWith('--')) vars[p] = r.style.getPropertyValue(p).trim();
        }
        if (r.media) { const t = r.conditionText || r.media.mediaText;
          if (/prefers-color-scheme/.test(t)) prefersColorScheme = true;
          (t.match(/\d+(\.\d+)?(px|em|rem)/g) || []).forEach(v => breakpoints.add(v)); }
        if (r.cssRules) walk([...r.cssRules]);
      }
    };
    for (const sheet of [...document.styleSheets]) {
      try { walk([...sheet.cssRules]); } catch {}
    }
    const webfonts = [...new Set([...document.fonts].map(f =>
      `${f.family} ${f.weight} ${f.style} (${f.status})`))];
    const bodyBg = getComputedStyle(document.body).backgroundColor;

    // Is this a shadcn/ui token system? Its variable names are distinctive.
    const SHADCN = ['--background', '--foreground', '--card', '--card-foreground',
      '--popover', '--popover-foreground', '--primary', '--primary-foreground',
      '--secondary', '--secondary-foreground', '--muted', '--muted-foreground',
      '--accent', '--accent-foreground', '--destructive', '--border', '--input',
      '--ring', '--chart-1', '--chart-2', '--chart-3', '--chart-4', '--chart-5',
      '--sidebar', '--sidebar-foreground', '--sidebar-primary', '--sidebar-accent',
      '--sidebar-border', '--sidebar-ring', '--radius'];
    const matched = SHADCN.filter(v => v in vars);
    const sample = matched.map(v => vars[v]).find(Boolean) || '';
    const shadcn = {
      detected: matched.length >= 6,
      matchedTokens: matched,
      missingTokens: matched.length >= 6 ? SHADCN.filter(v => !(v in vars)) : [],
      // v4 ships raw oklch(); v3 shipped bare HSL channel triplets read via hsl(var(--x))
      valueFormat: /oklch/i.test(sample) ? 'oklch (Tailwind v4 era)'
        : /^\s*[\d.]+\s+[\d.]+%\s+[\d.]+%/.test(sample) ? 'hsl channel triplets (Tailwind v3 era)'
        : /^#/.test(sample) ? 'hex' : 'unknown',
      radius: vars['--radius'] || null,
      darkModeStrategy: document.querySelector('.dark, [data-theme="dark"]') ? 'class on element'
        : prefersColorScheme ? 'prefers-color-scheme media query' : 'not detected in this render',
    };

    return {
      page: { title: document.title, url: location.href, viewport: innerWidth + 'x' + innerHeight,
              scrollHeight: document.body.scrollHeight, folds: +(document.body.scrollHeight / innerHeight).toFixed(1),
              viewportMeta: document.querySelector('meta[name=viewport]')?.content || null },
      typography: { families: top(fonts), sizes: top(sizes, 20), weights: top(weights), letterSpacing: top(tracking, 6),
                    scale: [...new Set(type.map(t => t.size))].sort((a, b) => b - a),
                    runs: type.sort((a, b) => b.size - a.size).slice(0, 22) },
      color: { text: withColor(top(fg)), backgrounds: withColor(top(bg)), borders: top(border, 8) },
      shape: { radii: top(radius, 8), shadows: top(shadow, 6) },
      space: { gaps: top(gaps, 10), paddings: top(pads, 12), commonWidths: top(widths, 6), gridTemplates: top(grids, 8) },
      motion: { transitions: top(transitions, 10), animations: top(animations, 5) },
      media: { images: imgs.slice(0, 24), imageCount: imgs.length, svgCount: svgs, videoCount: videos },
      cssVariables: vars,
      breakpoints: [...breakpoints].sort((a, b) => parseFloat(a) - parseFloat(b)),
      webfonts,
      theme: { bodyBackground: toHex(bodyBg),
               colorScheme: getComputedStyle(document.documentElement).colorScheme || 'normal' },
      shadcn,
    };
  });
}
```

```bash
mkdir -p /tmp/design-analysis/out
node /tmp/design-analysis/capture.mjs "https://example.com" /tmp/design-analysis/out
```

**When capture fails:**

- `Playwright not found` → `npm i -D playwright && npx playwright install chromium`. On managed/sandboxed environments Chromium is often pre-installed — try `NODE_PATH=$(npm root -g)` and skip the download.
- Login wall, paywall, or bot block → say so and ask the user for a screenshot. Do not analyze the block page as if it were the design.
- Cookie banner covering the fold → note it, and use `desktop-full.png` for the layout read.
- `403`/`407`/tunnel errors → egress is blocked by policy. Report the blocked host; do not work around it.
- Page needs auth → ask whether they can export a screenshot instead.

---

## Step 3 — Sample the pixels

Computed styles tell you what the CSS *says*. Pixels tell you what the design *is* — actual area shares, whitespace, and visual balance. This script also handles plain image inputs, where pixels are all you have.

Write to `/tmp/design-analysis/palette.mjs`. It decodes through Chromium, so it needs no image libraries and reads PNG/JPEG/WebP/AVIF/GIF/SVG.

```js
// Usage: node palette.mjs <image> [maxColors]
// Prints JSON: palette (hex + area share + role), color summary, composition metrics.
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);
function loadPlaywright() {
  const names = ['playwright', '@playwright/test', 'playwright-core'];
  for (const n of names) { try { return require(n); } catch {} }
  let root = ''; try { root = execSync('npm root -g', { encoding: 'utf8' }).trim(); } catch {}
  for (const n of names) { try { return require(path.join(root, n)); } catch {} }
  console.error('Playwright not found: npm i -D playwright && npx playwright install chromium');
  process.exit(2);
}
const { chromium } = loadPlaywright();

const file = process.argv[2];
const maxColors = +(process.argv[3] || 10);
if (!file) { console.error('usage: node palette.mjs <image> [maxColors]'); process.exit(1); }
const ext = path.extname(file).slice(1).toLowerCase();
const mime = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp',
               gif: 'image/gif', avif: 'image/avif', svg: 'image/svg+xml' }[ext] || 'image/png';
const dataUri = `data:${mime};base64,${readFileSync(file).toString('base64')}`;

const browser = await chromium.launch();
const page = await browser.newPage();
const result = await page.evaluate(async ({ dataUri, maxColors }) => {
  const img = new Image(); img.src = dataUri; await img.decode();
  const W = Math.min(img.naturalWidth, 1200);
  const H = Math.max(1, Math.round(img.naturalHeight * (W / img.naturalWidth)));
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, W, H);
  const { data } = ctx.getImageData(0, 0, W, H);
  const at = (x, y) => { const i = 4 * (y * W + x); return [data[i], data[i + 1], data[i + 2]]; };

  const hex = ([r, g, b]) => '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
  const lin = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  const lum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return +((x + 0.05) / (y + 0.05)).toFixed(2); };
  const hsl = ([r, g, b]) => {
    const R = r / 255, G = g / 255, B = b / 255;
    const mx = Math.max(R, G, B), mn = Math.min(R, G, B), d = mx - mn, l = (mx + mn) / 2;
    let h = 0, s = 0;
    if (d) { s = d / (1 - Math.abs(2 * l - 1));
      h = mx === R ? ((G - B) / d) % 6 : mx === G ? (B - R) / d + 2 : (R - G) / d + 4;
      h = Math.round(h * 60); if (h < 0) h += 360; }
    return { h, s: Math.round(s * 100), l: Math.round(l * 100) };
  };
  // sRGB -> OKLCH (Ottosson). Validated against Chromium's own
  // `oklch(from <color> l c h)` over 400 random colors: L and C agree to
  // <0.0001, hue to <0.2 deg above C=0.01 (below that hue is meaningless and
  // can differ ~0.5 deg). Paste-ready as shadcn v4 token values.
  const oklch = ([r, g, b]) => {
    const f = v => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    const [R, G, B] = [f(r), f(g), f(b)];
    const l_ = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
    const m_ = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
    const s_ = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
    const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
    const A = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
    const Bb = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;
    const C = Math.hypot(A, Bb);
    let H = Math.atan2(Bb, A) * 180 / Math.PI; if (H < 0) H += 360;
    // shadcn writes achromatic colors as `oklch(1 0 0)` — hue is meaningless at C≈0
    return C < 0.002 ? `oklch(${+L.toFixed(3)} 0 0)`
                     : `oklch(${+L.toFixed(3)} ${+C.toFixed(3)} ${+H.toFixed(1)})`;
  };
  // chroma = max-min in 0-255. Robust "is this actually colorful" test at any lightness.
  const chroma = ([r, g, b]) => Math.max(r, g, b) - Math.min(r, g, b);
  const temp = h => (h >= 15 && h < 75) ? 'warm' : (h >= 75 && h < 165) ? 'green'
    : (h >= 165 && h < 255) ? 'cool' : (h >= 255 && h < 315) ? 'violet' : 'red';
  const role = rgb => {
    const ch = chroma(rgb), { l } = hsl(rgb);
    if (ch < 10) return l > 92 ? 'near-white' : l < 12 ? 'near-black' : 'neutral';
    if (ch < 26) return l > 90 ? 'tinted-white' : l < 18 ? 'tinted-black' : 'muted';
    if (ch < 90) return 'chromatic';
    return l > 45 ? 'vivid' : 'deep';
  };

  const hist = new Map();
  let total = 0, sumL = 0, sumC = 0;
  const bands = new Array(10).fill(0);
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue;
    const rgb = [data[i], data[i + 1], data[i + 2]];
    const k = ((rgb[0] >> 3) << 10) | ((rgb[1] >> 3) << 5) | (rgb[2] >> 3);
    const e = hist.get(k) || [0, 0, 0, 0];
    e[0] += rgb[0]; e[1] += rgb[1]; e[2] += rgb[2]; e[3]++;
    hist.set(k, e);
    const { l } = hsl(rgb);
    sumL += l; sumC += chroma(rgb); bands[Math.min(9, Math.floor(l / 10))]++; total++;
  }
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  const merged = [];
  for (const [r, g, b, n] of [...hist.values()].sort((a, b) => b[3] - a[3])) {
    const rgb = [Math.round(r / n), Math.round(g / n), Math.round(b / n)];
    const near = merged.find(m => dist(m.rgb, rgb) < 40);
    if (near) { near.n += n; continue; }
    merged.push({ rgb, n });
    if (merged.length >= 64) break;
  }
  merged.sort((a, b) => b.n - a.n);
  const palette = merged.slice(0, maxColors).map(m => {
    const { h, s, l } = hsl(m.rgb);
    return { hex: hex(m.rgb), hsl: `hsl(${h} ${s}% ${l}%)`, oklch: oklch(m.rgb),
             share: +(100 * m.n / total).toFixed(1),
             chroma: chroma(m.rgb), role: role(m.rgb), temperature: chroma(m.rgb) < 6 ? 'achromatic' : temp(h) };
  });
  const dominant = merged[0].rgb;
  const accents = palette.filter(p => p.chroma >= 26);

  const pairs = [];
  for (let i = 0; i < palette.length; i++) for (let j = i + 1; j < palette.length; j++) {
    const A = palette[i].hex.match(/\w\w/g).map(x => parseInt(x, 16));
    const B = palette[j].hex.match(/\w\w/g).map(x => parseInt(x, 16));
    pairs.push({ pair: `${palette[i].hex} on ${palette[j].hex}`, ratio: contrast(A, B) });
  }

  // ---- composition: where is the ink? ----
  // Threshold stays tight: on a dark UI, panel surfaces sit only ~20 away from
  // the page background, and a loose threshold counts every panel as empty field.
  const isBg = rgb => dist(rgb, dominant) < 12;
  const grey = ([r, g, b]) => (r + g + b) / 3;
  let ink = 0, edges = 0;
  const ROWS = 24, COLS = 24;
  const rowInk = new Array(ROWS).fill(0), colInk = new Array(COLS).fill(0);
  const step = Math.max(1, Math.round(Math.min(W, H) / 400));
  let sampled = 0;
  for (let y = 0; y < H; y += step) for (let x = 0; x < W; x += step) {
    const rgb = at(x, y); sampled++;
    if (!isBg(rgb)) { ink++; rowInk[Math.min(ROWS - 1, Math.floor(ROWS * y / H))]++; colInk[Math.min(COLS - 1, Math.floor(COLS * x / W))]++; }
    // local gradient: detail density, independent of which color is the background
    const g0 = grey(rgb);
    if (x + step < W && Math.abs(g0 - grey(at(x + step, y))) > 12) edges++;
    else if (y + step < H && Math.abs(g0 - grey(at(x, y + step))) > 12) edges++;
  }
  const norm = a => { const mx = Math.max(...a) || 1; return a.map(v => +(v / mx).toFixed(2)); };
  const grid = [];
  for (let gy = 0; gy < 3; gy++) { const row = [];
    for (let gx = 0; gx < 3; gx++) {
      const h2 = new Map();
      for (let y = Math.floor(gy * H / 3); y < (gy + 1) * H / 3; y += step)
        for (let x = Math.floor(gx * W / 3); x < (gx + 1) * W / 3; x += step) {
          const rgb = at(x, y); const k = ((rgb[0] >> 4) << 8) | ((rgb[1] >> 4) << 4) | (rgb[2] >> 4);
          const e = h2.get(k) || [0, 0, 0, 0]; e[0] += rgb[0]; e[1] += rgb[1]; e[2] += rgb[2]; e[3]++; h2.set(k, e);
        }
      const [r, g, b, n] = [...h2.values()].sort((p, q) => q[3] - p[3])[0];
      row.push(hex([Math.round(r / n), Math.round(g / n), Math.round(b / n)]));
    }
    grid.push(row); }
  const colN = norm(colInk), rowN = norm(rowInk);
  const centroid = a => { const t = a.reduce((x, y) => x + y, 0) || 1;
    return +(a.reduce((x, v, i) => x + v * (i + 0.5) / a.length, 0) / t).toFixed(2); };
  const mirror = a => { const rev = [...a].reverse();
    return +(1 - a.reduce((x, v, i) => x + Math.abs(v - rev[i]), 0) / a.length).toFixed(2); };

  return {
    source: { file: 'see argv', width: img.naturalWidth, height: img.naturalHeight, sampled: `${W}x${H}`,
              aspect: +(img.naturalWidth / img.naturalHeight).toFixed(2) },
    palette,
    color: {
      key: (sumL / total) > 62 ? 'light' : (sumL / total) < 38 ? 'dark' : 'mid',
      averageLightness: Math.round(sumL / total),
      averageChroma: Math.round(sumC / total),
      neutralShare: +palette.filter(p => p.chroma < 26).reduce((a, p) => a + p.share, 0).toFixed(1),
      accentShare: +accents.reduce((a, p) => a + p.share, 0).toFixed(1),
      accentHexes: accents.map(p => p.hex),
      temperatures: [...new Set(palette.filter(p => p.chroma >= 6).map(p => p.temperature))],
      lightnessDeciles: bands.map(b => +(100 * b / total).toFixed(1)),
      dominant: hex(dominant),
    },
    contrastPairs: pairs.sort((a, b) => b.ratio - a.ratio).slice(0, 8),
    composition: {
      inkCoverage: +(100 * ink / sampled).toFixed(1),
      backgroundShare: +(100 - 100 * ink / sampled).toFixed(1),
      edgeDensity: +(100 * edges / sampled).toFixed(1),
      rowDensity: rowN,
      colDensity: colN,
      horizontalCentroid: centroid(colInk),
      verticalCentroid: centroid(rowInk),
      mirrorSymmetry: mirror(colN),
      balance: (() => { const c = centroid(colInk);
        return c < 0.45 ? 'weighted left' : c > 0.55 ? 'weighted right' : 'horizontally centered'; })(),
      gridDominantColors: grid,
    },
  };
}, { dataUri, maxColors });
result.source.file = file;
await browser.close();
console.log(JSON.stringify(result, null, 2));
```

```bash
node /tmp/design-analysis/palette.mjs /tmp/design-analysis/out/desktop-fold.png 10
```

Run it on the **fold** shot for the palette that greets a visitor, and on the **full-page** shot for the palette of the whole page. On a plain image input, run it on the image.

**How to read the composition numbers:**

| Field | Meaning |
|---|---|
| `inkCoverage` / `backgroundShare` | Share of pixels that differ from / match the dominant background color. Measured reference points: an airy marketing page ≈ 17% ink, a panelled dashboard ≈ 32%, a full-bleed photograph ≈ 70%. On a light page `backgroundShare` is roughly whitespace; on a dark UI it is the field the panels sit on, which is not the same thing — don't call it whitespace there |
| `edgeDensity` | Share of pixels on a hard tonal edge. This is a *detail* measure, not a fullness measure: text-heavy layouts and textured photography push it up, while large flat fields keep it low even when the screen is packed. A dense dashboard of flat panels can score below an airy marketing page. Use it to separate "detailed" from "flat", and `inkCoverage` to separate "full" from "empty" |
| `rowDensity` | 24 horizontal bands, normalized. Zeros are breathing room; runs of high values are content blocks. This is the page's vertical rhythm |
| `colDensity` | 24 vertical bands. Peaks are content columns; flat edges are margins |
| `horizontalCentroid` | 0.5 = visual weight centered, <0.45 left, >0.55 right |
| `mirrorSymmetry` | 1.0 = perfectly mirrored layout, below ~0.7 = deliberately asymmetric |
| `gridDominantColors` | Dominant color per third — catches dark bands, split-screen layouts, colored hero blocks |
| `lightnessDeciles` | Tonal distribution. A spike in the top decile means a light UI on white; two spikes means a hard light/dark split |

---

## Step 4 — Look at the image

**Always view the screenshot yourself before writing the report.** The JSON knows every font size on the page but cannot see that the H1 is competing with a badge, that the eye lands on the illustration first, or that the layout is a two-column split. Numbers plus eyes; neither alone.

Read the images in this order: `desktop-fold.png` (what a visitor meets), `desktop-full.png` (structure and rhythm), `mobile-fold.png` (what survives the squeeze).

Squint test: blur the page in your mind's eye. What is still legible is the real hierarchy — compare it against the type scale in the JSON. When the largest type is not the strongest visual element, say what is winning instead (a photo, a colored block, a bright button).

---

## The eight dimensions

Report on these. Skip a dimension when the input genuinely has nothing to say about it (a logo has no motion), and never pad a section to look complete.

### 1. Typography

- **Families and roles**: which face for display, body, UI, mono. Classify each: geometric sans, grotesque, humanist sans, transitional/old-style serif, didone, slab, mono, script, display. Name the actual family from `typography.families` and `webfonts` — and flag when the rendered family is a system fallback rather than the intended webfont (a `(unloaded)` status or a bare `Arial`/`Helvetica` on a designed page is the tell).
- **Scale**: list the sizes actually used, largest to smallest, and the ratio between steps (`64 / 40 / 24 / 16` ≈ 1.5–1.6, a major-third-ish scale). Say whether it is a tight scale (3–5 steps, disciplined) or sprawling (12 near-duplicate sizes, no system).
- **Weights**: how many, and how hierarchy is carried — by weight, size, color, or case.
- **Line height and measure**: line-height ratios per level (display ~1.0–1.2, body ~1.4–1.6) and the body measure from `runs[].measureCh` (~45–75ch is comfortable; over ~90ch is a wall). `measureCh` comes from the widest rendered line box, so a short label in a wide container reads short and a wrapped paragraph reads its true column; it assumes a 0.5em average advance, so treat it as ±10%. `runs[].lines` tells you how many line boxes a run occupies — a display headline wrapping to three lines is a layout fact worth reporting.
- **Tracking and case**: negative tracking on display type, positive tracking on small caps/eyebrows, `text-transform: uppercase` usage.
- **Pairing logic**: does the pairing contrast on classification (serif display + sans UI) or vary within one family? Is it a single-family system?

### 2. Color

- **Palette with roles**, using measured hexes: page background, surface/card, ink (primary text), muted text, border/hairline, primary accent, secondary accent, semantic (success/warning/danger). Every measured color carries an `oklch` value too, so the palette can be emitted as design tokens without hand conversion — see [Aligning to shadcn/ui tokens](#aligning-to-shadcnui-tokens). If `styles.json` reports `shadcn.detected`, name the system and read its tokens rather than inferring roles.
- **Area shares** from `palette[].share` — this is what separates "a green brand" from "a white page with a green button." Report the accent share explicitly.
- **Key and temperature**: light / mid / dark, warm / cool / neutral, and whether the neutrals are tinted (a warm off-white and warm grays is a deliberate choice worth naming).
- **Harmony**: monochrome, analogous, complementary, split-complementary, triadic, or neutral-plus-one-accent (the most common product-design answer).
- **Saturation strategy**: `averageChroma` plus whether accents are vivid or desaturated.
- **Contrast**: use `contrastPairs` for the real ratios of the dominant pairings, and name any body-text pairing under 4.5:1 or large-text pairing under 3:1. Keep it to a flag, not a full audit — hand off to the `accessibility` skill for that.
- **Gradients**: whether present, and whether they are brand-level or applied decoratively to buttons and cards.

### 3. Layout and composition

- **Container and grid**: content width from `space.commonWidths`, column structure from `space.gridTemplates` (computed styles resolve `repeat(4, 1fr)` to real px widths, so this gives both the count and the ratio — a `216px 1128px` template is a sidebar shell, `4 cols: 273px 273px 273px 273px` is a KPI row), gutters from `space.gaps`.
- **Structure**: the fold's anatomy (nav / eyebrow / headline / support / CTA / media) and the page's section sequence from `rowDensity`.
- **Alignment and balance**: left-aligned vs centered, `horizontalCentroid`, `mirrorSymmetry`, and whether asymmetry looks intentional.
- **Density and rhythm**: `inkCoverage`, section padding values, whether the vertical rhythm alternates (dense/airy) or repeats identically.
- **Focal path**: the order a viewer's eye takes, and what earns first fixation. Say what creates it — scale, isolation, color, or a face/direction in the imagery.
- **Fold economics**: what is above 900px, `page.folds` for total scroll depth.
- **Responsive behavior**: what changes between desktop and mobile — reflow, hidden elements, type scaling — and the `breakpoints` list. If `page.viewportMeta` is null, the mobile screenshot is a scaled desktop layout, not a mobile design; say so.

### 4. Imagery and media

- **Type**: photography, 3D render, vector illustration, product screenshot, screenshot-in-device-frame, abstract gradient/mesh, iconography, video, or none.
- **Treatment**: crop and aspect ratios from `media.images[].ratio`, corner radius, `object-fit`, duotone or color grading, cutout vs full-bleed vs contained, drop shadows, masks.
- **Subject and role**: does the imagery show the product, the user, a metaphor, or decoration? Does it carry information or fill space?
- **Text/image balance**: image count vs text volume; whether images anchor sections or interrupt them.
- **Iconography**: `svgCount`, stroke vs filled, corner and stroke weight consistency, whether icons share the type's weight.
- **Alt text**: how many images have real alt text (`media.images[].alt`) — a content-quality signal even in a design read.

### 5. Space and scale

- **Base unit**: infer from `space.gaps` and `space.paddings` — a clean 4/8px system shows up as clustered multiples; one-off values like `13px` and `27px` mean it was eyeballed.
- **Scale in use**: the actual ladder (`8 / 16 / 24 / 32 / 48 / 64 / 96`).
- **Inner vs outer**: component padding against section spacing. Grouping only reads when the gap inside a group is visibly smaller than the gap between groups.
- **Section rhythm**: vertical padding per section and whether it is consistent.

### 6. Shape, depth, and texture

- **Radii**: the values from `shape.radii` and whether they form a scale (`6 / 12 / 999`) or a scatter. Sharp, soft, or pill.
- **Elevation language**: hairline borders, shadows, both, or flat. Read `shape.shadows` — soft low-alpha layered shadows read as craft; a single `0 4px 20px rgba(0,0,0,0.5)` reads as a default.
- **Borders**: widths, colors, whether hairlines come from one neutral ramp.
- **Texture**: noise, grain, paper, blur/glass (`backdrop-filter`), patterns, or completely flat.

### 7. Motion (URL inputs)

From `motion`: which properties transition, durations, easings, and any keyframe animations with iteration counts. Note whether durations cluster in the 120–250ms UI range, whether `transition: all` appears (an intent smell), whether anything loops infinitely, and whether transitions animate `transform`/`opacity` or layout properties.

### 8. Voice and content design

Brief, from the text you can see: headline length and whether it makes a claim or a category statement, reading level, CTA label specificity ("Start a trial" vs "Submit"), sentence case vs Title Case, use of numbers and proof, and any placeholder text still in place. Design and copy set the tone together; a typography read that ignores the words is half a read.

---

## Output format

Structure the report like this. Lead with the signature so the user gets the gist in one line.

```markdown
## Design analysis — [what was analyzed]

**Style signature**: [one sentence — e.g. "Editorial serif display over a warm off-white,
neutral-plus-one-green palette, generous 12-column whitespace, no decoration."]

**Genre**: [e.g. Swiss/editorial · brutalist · neo-brutalist · glassmorphic · corporate SaaS ·
consumer playful · luxury minimal · developer/technical · retro/nostalgic · maximalist]

| Dimension | Reading |
|---|---|
| Typography | Georgia display + Helvetica UI · 8-step scale · 400/600 only |
| Color | Light key, warm neutrals, one green accent at 11% area |
| Layout | 1120px container · 3-col cards · centered · 83% whitespace |
| Imagery | One vector illustration, 16px radius, contained |
| Space | 8px base · 24/32/48/64/96 ladder |
| Shape/depth | 12px radius, hairline borders, one 1px shadow |
| Motion | 160ms ease on background-color and transform |

### Typography
[measured detail — sizes, weights, line heights, measure, classification]

### Color
[palette table: hex · role · share · contrast notes]

### Layout & composition
[grid, focal path, rhythm, responsive behavior]

### Imagery & media
### Space & scale
### Shape, depth & texture
### Motion
### Voice & content design

### Design tokens
[JSON or CSS custom properties — see below]

### What makes it work / what's inconsistent
[Max 3 bullets each. Observations, not a full critique.]

### Confidence & limits
[What was measured vs inferred; what the input couldn't show]
```

**Palette tables** should carry the hex, a swatch-friendly role name, the area share, and the source (sampled vs computed style):

| Hex | Role | Share | Source |
|---|---|---|---|
| `#fbfaf7` | Page background (warm off-white) | 69.5% | sampled |
| `#16211c` | Ink (green-tinted near-black) | 0.5% | computed |
| `#2f6f4e` | Primary accent | 10.1% | both |

### Design tokens

Close with a paste-ready token block when the user is likely to rebuild something — always for "extract the design system", "give me the tokens", or "recreate this". Only include values you measured.

```css
:root {
  --color-bg: #fbfaf7;
  --color-surface: #ffffff;
  --color-ink: #16211c;
  --color-muted: #6b7a72;
  --color-border: #e4e2dc;
  --color-accent: #2f6f4e;

  --font-display: Georgia, serif;
  --font-ui: Helvetica, Arial, sans-serif;
  --text-display: 64px/1.05;
  --text-h2: 40px/1.15;
  --text-lede: 20px/1.6;
  --text-body: 15px/1.6;
  --text-meta: 13px/1.4;

  --space-1: 8px;  --space-2: 16px; --space-3: 24px;
  --space-4: 32px; --space-6: 48px; --space-8: 64px;

  --radius-md: 12px;
  --radius-lg: 16px;
  --shadow-sm: 0 1px 2px rgb(22 33 28 / 0.12);
  --container: 1120px;
  --ease-ui: 160ms ease;
}
```

If the page exposes its own `cssVariables`, report those instead of inventing names — the author's token names are better evidence than yours.

---

## Aligning to shadcn/ui tokens

shadcn/ui is the most common destination for extracted color data, so when the user's project uses it — or they ask for shadcn tokens, Tailwind theme values, or "drop this into my app" — emit its token contract rather than invented names.

**First, check whether you're already looking at shadcn.** `styles.json` carries a `shadcn` block: `detected` (six or more of its distinctive variable names present), `matchedTokens`, `missingTokens`, `valueFormat`, `radius`, and `darkModeStrategy`. When it reports `detected: true`, the page's own values are the answer — read them out of `cssVariables` instead of inferring anything. `valueFormat` tells you which era you're in:

| `valueFormat` | Era | Values look like | Consumed as |
|---|---|---|---|
| `oklch (Tailwind v4 era)` | Current | `--primary: oklch(0.205 0 0)` | `bg-primary` via `@theme inline` |
| `hsl channel triplets (Tailwind v3 era)` | Legacy | `--primary: 0 0% 9%` | `hsl(var(--primary))` in `tailwind.config` |

**Inside a repo, read the project's own setup before generating anything**: `components.json` (style, baseColor, `cssVariables` true/false), and the CSS file it points at (`app/globals.css` or `src/index.css`). Match the format and the exact token set already there. Never introduce a token the project doesn't use, and never rename one it does.

### Role → token mapping

| Measured role | shadcn token |
|---|---|
| Page background | `--background` |
| Primary text / ink | `--foreground` |
| Card and panel surface | `--card` + `--card-foreground` |
| Menu, dialog, tooltip surface | `--popover` + `--popover-foreground` |
| Primary action fill — **the brand color** | `--primary` + `--primary-foreground` |
| Low-emphasis button fill | `--secondary` + `--secondary-foreground` |
| Subtle fill (badges, wells) / secondary text | `--muted` / `--muted-foreground` |
| Hover and active tint on rows and items | `--accent` + `--accent-foreground` |
| Error, delete, danger | `--destructive` |
| Hairlines and dividers | `--border` |
| Form control border | `--input` |
| Focus ring | `--ring` |
| Data-viz series | `--chart-1` … `--chart-5` |
| Nav or sidebar shell | `--sidebar`, `--sidebar-foreground`, `--sidebar-primary`, `--sidebar-accent`, `--sidebar-border`, `--sidebar-ring` |
| Corner radius base | `--radius` |

**The trap worth naming: `--accent` is not the brand accent.** In shadcn's defaults it is a neutral hover tint — the same near-grey as `--muted` and `--secondary`. A design's brand color belongs in `--primary`. Mapping a vivid brand hue to `--accent` turns every hover state into a flood of brand color. When you report a "primary accent" from the palette, say explicitly that it maps to `--primary`.

Since shadcn's stock `--primary` is near-black, any brand-colored design must override both `--primary` and `--primary-foreground`, and check the pair's contrast.

### Emitting the theme

Give both blocks, using measured values. Light mode from the design as captured; dark mode only if you actually captured a dark variant — otherwise say the dark block is derived, not measured, and mark it as a starting point.

```css
:root {
  --radius: 0.625rem;

  --background: oklch(0.985 0.004 91.4);   /* #fbfaf7 measured */
  --foreground: oklch(0.235 0.018 165.2);  /* #16211c */
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.235 0.018 165.2);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.235 0.018 165.2);
  --primary: oklch(0.49 0.085 158.4);      /* #2f6f4e — the brand green */
  --primary-foreground: oklch(0.985 0.004 91.4);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.235 0.018 165.2);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.565 0.022 162.4); /* #6b7a72 */
  --accent: oklch(0.97 0 0);               /* neutral hover tint, not the brand */
  --accent-foreground: oklch(0.235 0.018 165.2);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.913 0.008 91.5);       /* #e4e2dc */
  --input: oklch(0.913 0.008 91.5);
  --ring: oklch(0.49 0.085 158.4);
  --chart-1: oklch(0.49 0.085 158.4);
  --chart-2: oklch(0.712 0.124 61.6);      /* #d98f4a */
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --primary: oklch(0.62 0.11 158);         /* lifted for contrast on dark */
  --primary-foreground: oklch(0.205 0 0);
  --border: oklch(1 0 0 / 10%);            /* shadcn's dark convention */
  --input: oklch(1 0 0 / 15%);
}
```

Four conventions to respect, all taken from shadcn's own theme rather than guessed:

1. **Radius derives by multiplication.** The CLI writes `--radius-sm: calc(var(--radius) * 0.6)`, `md: * 0.8`, `lg: var(--radius)`, `xl: * 1.4`, then `2xl: * 1.8`, `3xl: * 2.2`, `4xl: * 2.6`. So pick `--radius` from the measured radius the design uses most for cards, and check the multipliers reproduce the smaller ones. Worked example: measured radii of `10px` and `8px` are exactly `--radius: 0.625rem` (10px) with `md` at 8px — one base value reproduces both.
2. **Dark borders are translucent white**, `oklch(1 0 0 / 10%)` for `--border` and `/ 15%` for `--input`, not a solid grey. The harvest reports these as `#ffffff @ 0.1`.
3. **Every `*-foreground` is a contrast promise.** Check each pair against its surface with `contrastPairs` and state the ratio for `--primary-foreground` on `--primary` at minimum. Below 4.5:1 for body text, adjust the foreground rather than shipping the pair.
4. **`--chart-1` … `--chart-5` are a categorical ramp**, not five shades of one hue. Feed them from the design's distinct accents, and if the design has fewer than five, say so rather than inventing three more.

For a legacy v3 project, the same values become bare HSL channel triplets — `--primary: 149 41% 31%;` for `#2f6f4e` — consumed as `hsl(var(--primary))`, with radius derived as `calc(var(--radius) - 2px)` and `- 4px`. Use the `hsl` field in the palette output, dropping the `hsl(` wrapper.

### The gamut caveat

Authored OKLCH can sit outside sRGB: shadcn's own `--destructive: oklch(0.577 0.245 27.325)` has a negative green channel and rasterizes to `#e7000b`. The harvest flags these with `outOfGamut: true` and keeps the authored string verbatim in the `oklch` field, because re-deriving it from the clamped hex would shift the token.

So the two sources answer different questions, and you should say which you used:

- **`styles.json` colors** are the authored tokens — correct for reproducing a theme.
- **`palette.json` colors** are sampled pixels, already clamped to sRGB — correct for what users actually see, and the only option for image inputs.

---

## Modes

| User asks | Do this |
|---|---|
| "What colors is this using?" | Palette only. Run Step 3, skip the rest. Two minutes, not twenty |
| "Analyze this design" | Full eight-dimension report |
| "Extract the design system" / "recreate this" | Full report, weighted to tokens and the type/space scales |
| "Give me shadcn tokens" / project uses shadcn | Measure, then map roles to the shadcn contract and emit `:root` + `.dark` in the project's existing format |
| "Compare these two" | Analyze both, then one comparison table per dimension and a note on where they diverge in strategy, not just values |
| "What makes this look expensive/cheap?" | Full capture, but write it as the 3–5 properties driving that read: type discipline, neutral tuning, whitespace, restraint in accent share, elevation consistency |
| "Is this design good?" | Measure first, then hand off to a critique skill — see Handoffs |

## Accuracy rules

1. **Measured beats eyeballed.** If a script produced the value, use the script's value. If you inferred it, mark it `(inferred)`.
2. **Never fabricate a hex.** For pasted images you cannot sample, describe the color in words ("desaturated forest green") and say an exact value needs a file or URL.
3. **Computed font ≠ intended font.** `typography.families` shows the first family in the stack, which may not be what rendered. Cross-check `webfonts` for load status.
4. **Counts are element counts, not visual weight.** A color used on one element can dominate the page; area share is the honest measure.
5. **Pixel palettes include photography.** A photo's colors show up in the palette alongside UI colors. Separate them: compare palette hexes against `color.backgrounds`/`color.text` from the DOM, and attribute the leftovers to imagery.
6. **Full-page shots skew shares** toward the longest section. Report which screenshot each number came from.
7. **One viewport is not responsive behavior.** Do not describe how a design adapts unless you captured both viewports.
8. **Authored is not always rendered.** Wide-gamut tokens (`oklch`, `lab`, `display-p3`) can fall outside sRGB; the harvest marks these `outOfGamut: true`. Quote the authored value when reproducing a theme and the sampled value when describing what users see — and say which one you used.
9. **Say what you could not see**: hover and focus states, dark mode, logged-in views, keyboard behavior, real content variation, animation on scroll. Screenshots are a still of one state.

## Handoffs

This skill describes. When the user wants judgment, continue into the right lens:

- `craft` — pixel- and CSS-level polish: gradients, glow, `transition: all`, elevation discipline
- `accessibility` — real WCAG audit of contrast, focus, targets, semantics
- `general-design-review` — combined UX, product, and AI review
- `cognitive-load-conversion` — the design is measured but the page is not converting
- `dieter-rams-principles`, `ux-heuristics-review`, `persuasive-ux` — specific critique frameworks

Say which handoff you recommend and why, in one line. Do not run a full critique unasked.


---
name: double-diamond
description: Guide teams and individuals through the Double Diamond design thinking framework (Discover, Define, Develop, Deliver). Use this skill whenever someone mentions design process, product discovery, problem framing, ideation, prototyping, or user research — even without saying "Double Diamond". Trigger on: "where do I start with this design problem", "how do we approach building X", "help me structure our design process", "we need to do discovery", "we're in the ideation phase", "how do we validate our solution", "I have a design challenge", "I'm not sure what problem we're solving", "walk me through the design process", "help me run a design sprint". Also trigger when a non-designer or stakeholder wants to understand the design process or where they fit in. If someone describes a product problem without knowing how to approach it, proactively offer to guide them through this framework.
---

# Double Diamond Design Framework

The Double Diamond is a visual design thinking framework from the British Design Council that structures the design process into four phases across two "diamonds": **Discover → Define** (first diamond) and **Develop → Deliver** (second diamond).

Each diamond traces the same arc: diverge (expand possibilities) then converge (narrow to a clear path). The framework applies equally to product designers, UX researchers, product managers, developers, and stakeholders — everyone plays a role, and part of your job is helping the user see where they fit.

## Your first move: orient the user

Before diving into activities, find out where they are. Ask a few quick questions:

1. **Which phase are they in?** (Or do they not know yet?) Projects don't always start at Phase 1 — stakeholders may already have a solution in mind, or the team may be mid-build. That's fine; meet them where they are.
2. **Who's involved?** Designer, PM, developer, stakeholder, or a mixed team?
3. **What do they need right now?** A full process plan, help with a specific activity (e.g., interview guide, problem statement, usability test plan), or just orientation?

Keep this quick — one or two focused questions, then move into helping.

---

## The Four Phases

### Phase 1: Discover (Diverge)

**Goal:** Understand the problem space deeply before proposing any solution. Resist the pull toward solutions — the whole point is to expand what you know before narrowing.

**The practitioner's challenge:** Stakeholders often arrive with a solution already in mind. Your role isn't to dismiss their idea — it's to gently hold space for exploration. Frame it as: *"Let's make sure we're solving the right problem first, so the solution actually sticks."*

**Key activities to offer:**
- **User interviews** — help draft an interview guide with open-ended, non-leading questions
- **Observation / field research** — suggest what to look for and how to document it
- **Stakeholder workshop facilitation** — help design an agenda that generates diverse perspectives
- **Research synthesis** — help organize findings into themes or an affinity map

**Deliverables you can help create:**
- Interview discussion guide
- Research plan (who to talk to, what to learn, how many sessions)
- Insights summary or research readout
- "How Might We" seed questions emerging from early research

**When to move on:** When you have enough insight to clearly describe the people affected, their behaviors, and the tensions they experience — even if you don't yet know the solution.

---

### Phase 2: Define (Converge)

**Goal:** Synthesize discovery findings into a sharp, agreed-upon problem statement. This is arguably the most important phase — a poorly defined problem leads to elegant solutions to the wrong thing.

**The practitioner's insight:** The Define phase is where alignment happens. Bring everyone — designers, PMs, engineers, stakeholders — into a shared understanding of what you're actually solving. Map out timelines, constraints, and feasibility honestly. A 2-hour workshop here can save weeks of rework later.

**Key activities to offer:**
- **Problem statement crafting** — help write a focused, user-centered problem statement (not a solution statement)
- **Prioritization** — help the team rank insights by impact and feasibility
- **"How Might We" refinement** — turn insights into actionable design challenges
- **Success criteria definition** — what does a good solution look like? What metrics matter?
- **Constraints mapping** — timelines, technical limits, resource availability

**Problem statement format to suggest:**
> [User] needs a way to [goal/need] because [insight/barrier].
> 
> Example: *"Freelance contractors need a way to track project hours without interrupting their flow, because switching tools mid-task causes them to lose context and undercount time."*

**Deliverables you can help create:**
- Problem statement (one sentence, user-centered)
- Prioritized list of design challenges
- Success metrics / definition of done
- Project scope and constraints doc

**When to move on:** When the team has a single, clearly scoped problem statement that everyone can agree on — and criteria for what "solved" looks like.

---

### Phase 3: Develop (Diverge again)

**Goal:** Generate a wide range of possible solutions before converging on the best one. This is the creative engine of the process — quantity over quality, then selection.

**The practitioner's insight:** Usability testing in this phase isn't scary validation — it's a window into human behavior. No two people interact with a prototype the same way. Embrace the surprises; they're the signal.

**Key activities to offer:**
- **Ideation workshop** — help design a brainstorming session (e.g., Crazy 8s, SCAMPER, How Might We ideation)
- **Concept sketching** — prompt the user to describe or sketch rough ideas before committing to high-fidelity design
- **Prototyping plan** — help decide what fidelity of prototype is appropriate (paper sketch, wireframe, clickable mock-up)
- **Usability test design** — help write a test script, decide who to recruit, and what tasks to observe
- **Feedback synthesis** — help the user make sense of what they heard/saw in testing

**Deliverables you can help create:**
- Ideation workshop agenda
- Concept brief (idea + rationale + open questions)
- Usability test script and screener
- Testing insights summary with prioritized improvements

**When to move on:** When you have at least one concept that's been tested with real users, iterated based on feedback, and is strong enough to build.

---

### Phase 4: Deliver (Converge)

**Goal:** Refine the chosen solution and ship it. This phase is about quality, alignment, and making sure what gets built matches what was designed — and actually works for users.

**The practitioner's insight:** The last sprint to the finish line. Regroup the full team before handoff to make sure everyone's aligned on both *how it should look and function* and *how you'll verify it's been built correctly*.

**Key activities to offer:**
- **Design handoff preparation** — help create a checklist of assets, specs, and documentation needed by developers
- **QA/review criteria** — help define what "done" looks like from a design perspective
- **Launch readiness checklist** — accessibility, localization, edge cases
- **Post-launch review planning** — how will you measure whether the solution actually worked?

**Deliverables you can help create:**
- Design handoff checklist
- Launch checklist (accessibility, responsiveness, edge cases)
- Post-launch success measurement plan
- Retrospective guide for the team

---

## Non-designers: Where you fit

If the user isn't a designer, help them see their role clearly:

| Phase | How non-designers contribute |
|-------|------------------------------|
| Discover | Be interviewed as an expert, join stakeholder workshops, share domain knowledge |
| Define | Co-own the problem statement, align on scope and constraints, approve success criteria |
| Develop | Review concepts, give feedback in usability sessions, flag technical or business constraints early |
| Deliver | Ensure the build matches the design intent, validate QA, support launch coordination |

---

## Common pitfalls — and how to handle them

**Stakeholders jump straight to a solution.** Don't fight it — acknowledge their idea, then reframe: *"That might be exactly right. Let's do a quick discovery pass to make sure we're solving the right problem before we build it."*

**The project starts mid-process.** That's normal. Help them pick up in the right phase — Define if they have raw research, Develop if they have a defined problem, or Deliver if they're already building something and just need to tighten it.

**The process feels too linear.** Remind the user (and yourself) that this is a map, not a conveyor belt. It's fine to loop back — discovering something in Develop that changes the Define, or returning to Develop after a failed Deliver test. The diamonds are a compass, not a cage.

---

## Output guidance

When helping a user through a phase, always produce something tangible — a draft deliverable they can take into a meeting, share with their team, or act on immediately. The Double Diamond is only useful if it produces real artifacts. Think: interview guide, problem statement, workshop agenda, usability test script, launch checklist — always something they can use.

If the user seems overwhelmed, start with just the next one or two steps. Don't try to plan the whole project in one shot. Small, clear forward motion beats comprehensive roadmaps that never get used.


---
name: like-wish-what-if
description: Give and structure feedback using the "I like, I wish, What if" (IL/IW/WI) design
  critique framework from the Stanford d.school. Use this skill whenever a user wants constructive
  feedback on a design, prototype, feature, flow, document, or team process — or wants to run a
  feedback session or retrospective. Trigger on phrases like "give me feedback", "critique this
  design", "what do you think of this", "review this prototype", "run a retro", "I like I wish",
  "how can we improve this", or when a user shares work-in-progress and asks for reactions.
  Also trigger when a user has raw feedback from others and wants it organized into something
  actionable. Always use this skill to structure critique instead of giving unorganized opinions.
---

# I Like, I Wish, What If Skill

"I like, I wish, What if" (IL/IW/WI) is a feedback framework from the Stanford d.school. It structures critique into three sentence starters that keep feedback constructive, personal, and forward-looking — praise what works, name what falls short, and open new possibilities instead of just pointing out flaws.

---

## The three starters

### I like…
Specific, genuine positives. What works and should be kept or amplified.
- Point at concrete elements, not vague vibes ("I like that the primary action is the only filled button" — not "I like the design")
- Positives are information: they tell the team what *not* to change

### I wish…
Constructive criticism, phrased as a personal desire rather than an objective verdict.
- "I wish the error message told me how to fix the problem" — not "the error handling is bad"
- The first-person framing lowers defensiveness and admits the feedback is one perspective
- Every wish should be actionable — the receiver should know what to do differently

### What if…?
Ideas and provocations that go beyond fixing the current version.
- Suggestions, wild ideas, alternative directions ("What if onboarding happened inside the empty state instead of a modal?")
- Not commitments — invitations to explore
- Great "what ifs" often reframe the problem rather than patch the solution

---

## Why the framing matters

| Unstructured feedback | IL/IW/WI equivalent | Effect |
|---|---|---|
| "This is confusing." | "I wish the pricing table showed the difference between tiers." | Specific and actionable |
| "It's fine, I guess." | "I like the tone of the copy. I wish the CTA stood out more." | Forces specificity |
| "You should do X." | "What if we tried X?" | Suggestion, not command |

The framework works because it is first-person, always constructive, and balances appreciation with critique — receivers stay open instead of defensive.

---

## Process

### Giving feedback on shared work

When a user shares a design, prototype, flow, or document for critique:

1. **Understand the goal first.** What is this trying to achieve? Who is it for? What stage is it at? Early concepts need directional feedback; polished work needs detail.
2. **Generate "I like" items** — at least 2–3 genuine, specific positives. Never fabricate praise; find what actually works.
3. **Generate "I wish" items** — the substantive critique. Each wish must be specific and actionable.
4. **Generate "What if" items** — 1–3 ideas that open new directions, including at least one that challenges an assumption rather than polishing the current approach.
5. **Rank within each bucket** — most important first.

### Organizing raw feedback from others

When a user brings unstructured feedback (comments, meeting notes, review threads):

1. Sort every piece of feedback into Like / Wish / What if
2. Rewrite verdicts as wishes ("navigation is broken" → "I wish I could get back to the dashboard from any screen")
3. Merge duplicates and note how many people raised each point
4. Flag contradictions between reviewers explicitly
5. End with a suggested priority order for the wishes

---

## Output format

Always present IL/IW/WI feedback in this structure:

```
I LIKE / I WISH / WHAT IF — [Subject]
Context: [what was reviewed, what stage it's at]

👍 I LIKE
• [specific element that works and why]
• [specific element that works and why]

🙏 I WISH
• [actionable, first-person critique]
• [actionable, first-person critique]

💡 WHAT IF
• [idea or provocation — new direction, not just a fix]
• [idea that challenges an assumption]

▶ SUGGESTED NEXT STEPS
1. [highest-priority wish to address]
2. [what-if worth a quick exploration]
```

---

## Facilitating a team session

If the user wants to run an IL/IW/WI session (design critique, sprint review, retrospective):

1. **Before**: Share the work (or the sprint scope) in advance. Timebox to 15–30 minutes.
2. **Frame the rules**: Every comment must start with one of the three phrases. No rebuttals — presenters only listen and say "thank you"; clarifying questions come after.
3. **Capture**: One sticky note or line per comment, sorted into three columns. Silent individual writing first, then round-robin sharing to avoid anchoring.
4. **Balance check**: If a column is empty, prompt for it explicitly — sessions naturally skew toward wishes.
5. **Close**: Cluster themes, dot-vote the wishes, pick 1–2 "what ifs" to prototype. Assign owners.

### As a retrospective

IL/IW/WI works on process, not just artifacts: "I like that we demoed early", "I wish handoff had fewer surprises", "What if design joined sprint planning?". Same rules, same format — the subject is the team's way of working.

---

## Quality checks

Before delivering any IL/IW/WI feedback, verify:
- [ ] Every item starts with (or clearly maps to) one of the three phrases
- [ ] "I like" items are specific and genuine — no filler praise
- [ ] Every "I wish" is actionable, not just a complaint
- [ ] At least one "What if" challenges the framing, not just the execution
- [ ] Feedback is phrased in first person, not as objective verdicts
- [ ] Buckets are reasonably balanced (no empty columns)
- [ ] A suggested priority order or next step is included

---

## When to use IL/IW/WI vs. other critique formats

| Situation | Best fit |
|---|---|
| Work-in-progress needing safe, constructive critique | **I like, I wish, What if** |
| Team retrospective on process | **I like, I wish, What if** |
| Systematic usability audit against known principles | `ux-heuristics-review` |
| Compliance-style accessibility check | `accessibility` |
| Broad multi-framework design review | `general-design-review` |

IL/IW/WI is a conversation and framing tool — reach for it when the goal is honest feedback that keeps momentum, not an exhaustive audit.


---
name: cognitive-load-conversion
description: Audit UI designs, flows, copy, and layouts to reduce cognitive load and maximize conversion. Apply this skill whenever a user shares a screen, mockup, flow, form, landing page, onboarding step, or any UI element and asks how to improve it — even if they don't say "cognitive load" or "conversion". Trigger on phrases like "why aren't users converting", "improve this flow", "reduce friction", "simplify this", "make this easier to use", "review this UI", "why do users drop off", "improve this form", "critique this design", "make this clearer", or any open-ended "improve this" request about a product surface. Always use this skill before giving UX or conversion improvement advice.
---

# Cognitive Load → Conversion Skill

Users abandon flows not because they don't want to convert — but because thinking is tiring. Every unnecessary decision, unfamiliar pattern, or piece of visual noise drains the finite mental budget users arrive with. When that budget runs out, they leave.

This skill provides a structured audit process to eliminate cognitive waste and protect the mental energy users need to actually complete the task.

---

## Core Model

There are two kinds of cognitive load. Only one is your problem to solve.

**Intrinsic load** — the unavoidable thinking required to understand the offer or complete the task. This is why the user showed up. Don't try to eliminate it; just don't add to it.

**Extraneous load** — everything else. Processing that consumes mental resources without helping the user get closer to their goal. This is where conversion dies. Your job is to find it and cut it.

---

## The Audit: 3 Levers

### Lever 1 — Cut Visual Clutter

Clutter isn't just about aesthetics. Every redundant element forces the brain to evaluate it before discarding it. That evaluation costs something.

**Ask of every element on screen:**
- Does this help the user understand what to do or why to do it?
- If removed, would anything important be lost?

**High-cost clutter patterns:**
- Redundant navigation links that go to the same place
- Decorative images that don't clarify or reinforce the value proposition
- Typography variation (size, weight, color) applied without semantic meaning — it signals hierarchy that isn't there, so the brain has to reconcile the mismatch
- Multiple competing CTAs at the same decision point
- Legal/compliance copy surfaced at the wrong moment (present it when it's relevant, not by default)

**Conversion principle:** Every element you remove that isn't earning its place is a free cognitive budget increase for the elements that matter.

---

### Lever 2 — Build on Existing Mental Models

Users arrive with expectations shaped by every other product they've used. When your interface matches those expectations, they don't have to learn — they just do. When it doesn't, they pause to figure it out. Pauses kill momentum. Momentum drives conversion.

**Patterns users already know (use them):**
- Primary action = most visually prominent button
- Destructive actions (delete, cancel) = less prominent, often text links
- Form fields = labeled above or inside the field, not beside it
- Errors = red, warnings = yellow, success = green
- Progress = left to right, or top to bottom
- Trust signals (security badges, testimonials) = near the point of commitment

**Questions to identify mental model mismatches:**
- Is the label for this element what users would call it?
- Is the primary action where users would expect to find it?
- Does this layout pattern match what users have seen on comparable products?
- Are we using interaction patterns (hover states, modals, accordions) in conventional ways?

**Conversion principle:** Familiarity is a feature. Novelty in UI adds cognitive cost without adding value. Innovate on the product; be conventional about the interface.

---

### Lever 3 — Offload Tasks from the User

Every moment a user has to remember something, calculate something, or make a decision they didn't come here to make is a moment they might leave. The question isn't just "is this clear?" — it's "do they even have to do this?"

**Task offloading opportunities:**

| User task | Offloaded alternative |
|---|---|
| Remember what they entered earlier | Re-display it on confirmation/summary screens |
| Choose from options they don't understand | Use a smart default; let them override |
| Type something that can be inferred | Auto-fill from context (location, account data, previous input) |
| Read to understand | Show an image or example instead |
| Decide between equally unfamiliar options | Recommend one — "Most popular", "Best for your situation" |
| Count or calculate | Do the math for them (show totals, savings, comparisons) |
| Remember what step they're on | Show a progress indicator |

**Questions to identify offloading opportunities:**
- Is there any information we already have that we're asking users to re-enter?
- Are there decisions in this flow that we could make for most users?
- Is there math, comparison, or calculation happening in the user's head?
- Is the user holding anything in memory between steps?

**Conversion principle:** The best form field is the one that doesn't exist. The best decision is the one the user doesn't have to make.

---

## Audit Format

When reviewing a UI, flow, or screen, structure your output as:

### 1. Extraneous Load Found
List specific elements or patterns that are adding cognitive cost without helping the user. Be specific — name the element, explain the cost it's creating.

### 2. Mental Model Gaps
Identify any places where the interface departs from convention in a way that requires users to stop and learn. Flag label mismatches, unexpected interaction patterns, or layout choices that conflict with established expectations.

### 3. Offloading Opportunities
Call out moments where the user is being asked to do something the product could do for them. Rank by conversion impact if possible.

### 4. Priority Recommendations
Give 3–5 concrete changes in priority order. Each recommendation should:
- Name the specific element or step
- Describe the change
- Explain the cognitive cost it removes
- Note the expected conversion impact (high / medium / low)

---

## Decision Heuristics

Use these to quickly triage a design under review:

- **The squint test**: Squint at the screen. What do you see first? Is that what the user needs to act on?
- **The first-time test**: Would a user seeing this for the first time know what to do within 3 seconds?
- **The subtraction test**: Remove one element. Does anything important break? If not, remove it.
- **The phone call test**: Could a user describe this screen to someone on the phone without confusion? If not, it's too complex.
- **The memory test**: At any point in the flow, is the user carrying information forward in their head that we could display for them instead?

---

## What Not to Cut

Not all friction is bad. Some cognitive load is intrinsic — it's the thing the user came to think about.

- **Don't simplify the offer** — if the product is genuinely complex, the goal is to present it clearly, not to hide that complexity
- **Don't remove confirmation steps** for high-stakes, irreversible actions — friction here is a feature (it prevents errors)
- **Don't default-select** in ways that could mislead or harm — smart defaults must be honest defaults

---

## Notes on Copy

Cognitive load isn't just visual — it's linguistic. When reviewing copy:

- **Shorter sentences reduce parsing load** — break long sentences into shorter ones
- **Active voice is processed faster** than passive voice
- **Plain words over technical terms** — unless the audience is expert and jargon carries precision value
- **Front-load the key information** — put the action or benefit first, conditions second
- **Avoid negatives** — "Don't miss out" requires parsing; "Offer ends tonight" is direct


---
name: ux-personas
description: Create detailed, research-based UX personas for product and experience design. Use this skill whenever a user wants to create, improve, or critique personas — including requests like "help me define our users", "create a persona for X", "build user profiles for our product", "we need to define our target audience", or "turn our research into personas". Also trigger when a user shares user research, interview notes, survey data, or user segments and wants to turn that into design-ready personas. Always use this skill before attempting to write any persona content from scratch.
---

# UX Persona Creation

Personas are fictional but realistic descriptions of typical or target users. They synthesize research data into a single, memorable character — making abstract user groups feel concrete and actionable for the whole product team.

---

## When You're Asked to Create Personas

Follow this process:

### 1. Establish the research foundation

Ask the user what research they have available. Personas must be grounded in real data — not assumptions. Accepted inputs:

- Interview notes or transcripts
- Survey results
- Field study observations
- Analytics segments
- Existing user segments or market research

If no research exists, flag this clearly: **a persona built without research is a assumption document, not a persona.** Offer to help design a lightweight research plan, or proceed with clearly labeled "proto-personas" that should be validated.

### 2. Identify user clusters

From the research, group users by shared:
- Behaviors and usage patterns
- Goals and motivations
- Frustrations and pain points
- Context of use (when, where, how often, on what device)

If clusters are too similar, merge them. If a cluster seems peripheral to the product, consider dropping it. Aim for **2–4 personas** for most products — enough to cover meaningful variation without diluting focus.

### 3. Build each persona

Each persona should include:

**Required (core to memorability and empathy):**
- **Name** — fictional but believable, not generic ("Anna", not "User A")
- **Photo** — describe one if you can't provide one (stock photo type, not a real person)
- **Age, location, occupation** — enough to anchor context
- **Tag line** — one punchy sentence capturing their essence. Keep it grounded, not clever.
- **Goals** — what are they ultimately trying to achieve? (2–3 items)
- **Frustrations / pain points** — what currently gets in their way? (2–3 items)
- **Behaviors** — how do they currently solve the problem? What tools, workarounds, habits?
- **Context of use** — how would they interact with your product? Required by job or by choice? How often? What device?
- **A quote** — one direct-voice sentence that captures their attitude toward the problem space

**Optional (include only if design-relevant):**
- Experience level with similar products
- Tech comfort level
- Key tasks they need to accomplish in the product
- Decision-making style

**Never include** details that don't affect design decisions. If a field doesn't make any design choice easier, cut it.

### 4. Apply the relevance test

Before finalizing any detail, ask: *"Would this change a design decision?"*

- If yes → include it
- If no → cut it

A persona's favorite coffee order is noise. Their preferred device and time of day for using the product is signal.

---

## Output Format

Present each persona as a structured profile. Use this layout:

```
## [Name], [Age]
[Occupation] · [Location]

> "[Their defining quote]"

**[Tag line]**

### Goals
- ...
- ...

### Frustrations
- ...
- ...

### Behaviors
- ...
- ...

### Context of use
[1–2 sentences on how, when, and where they'd use the product]
```

---

## Common Mistakes to Avoid

| Mistake | Fix |
|---|---|
| Building personas from assumptions, not research | Ground every trait in observed data |
| Too many personas | 2–4 is almost always enough |
| Including irrelevant details | Apply the relevance test to every field |
| Making the tag line too witty | It should be useful, not entertaining |
| Treating personas as a one-time deliverable | Revisit them as you learn more |
| Designing only for the primary persona | Secondary personas represent real edge cases |

---

## Using Personas Beyond the Design Phase

Once created, personas have several ongoing uses:

- **Expert reviews** — walk through a task flow as each persona to surface issues
- **Usability study recruiting** — use persona traits as screening criteria
- **Stakeholder alignment** — give teams a shared vocabulary ("Would Rosa actually do this?")
- **Analytics segmentation** — map real user segments to persona profiles to validate and refine
- **Agency/consultant briefs** — describe your audience concisely without exposing raw data

---

## Persona Quality Checklist

Before delivering personas to the user, verify:

- [ ] Each persona is grounded in real research (or clearly labeled as proto-persona)
- [ ] Name and photo aid memorability
- [ ] Goals and frustrations reflect user research, not product team assumptions
- [ ] Every included detail passes the relevance test
- [ ] Tag line is clear and useful, not just clever
- [ ] Personas feel like distinct characters, not slight variations of each other
- [ ] 2–4 personas total (flag if more are requested and explain the tradeoff)


---
name: empathy-mapping
description: Create, facilitate, and critique empathy maps for UX research and design thinking. Use this skill
  whenever a user wants to build an empathy map, understand their users more deeply, synthesize
  qualitative research into a shared team artifact, or translate user interviews into structured
  insights. Trigger on phrases like "create an empathy map", "map out what users think and feel",
  "help me understand my users", "synthesize these interviews", "what do my users say vs think",
  "build user empathy", or any request to structure user research into Says/Thinks/Does/Feels
  quadrants. Also trigger when users share raw interview transcripts, survey responses, or user
  research notes and want to make sense of them. Always use this skill before attempting to create
  any empathy map content from scratch.
---

# Empathy Mapping Skill

Empathy maps are collaborative visualizations that externalize what a team knows about a specific type of user. They create shared understanding and surface gaps in research before design decisions are made.

---

## When to use which format

| Situation | Format |
|---|---|
| Single user interview or diary entry | **Individual empathy map** (1:1) |
| Multiple interviews, same user segment | **Aggregated empathy map** |
| Early design thinking / no research yet | Sketch a sparse map to reveal gaps |
| Communicating a persona to stakeholders | Empathy map as visual persona summary |

Always start with 1:1 mapping. Aggregate only after individual maps exist.

---

## The Four Quadrants

### Says
Direct, verbatim quotes from research — what the user said out loud.
- Pull exact language where possible
- Note hesitations, qualifiers, contradictions

### Thinks
What occupies the user's mind — including things they wouldn't say out loud.
- What worries them?
- What do they assume or believe (rightly or wrongly)?
- Where do they feel self-conscious, uncertain, or polite?

### Does
Observable behaviors and actions.
- What do they physically do during the experience?
- What workarounds or habits have they developed?
- What do they do before, during, and after?

### Feels
Emotional state — adjective + short context sentence.
- What frustrates, excites, or worries them?
- Use format: `[Emotion]: [reason]` — e.g., "Confused: too many options with no clear difference"

### Optional: Goals (fifth quadrant)
What the user ultimately wants to achieve. Useful when the team needs to stay anchored to user intent throughout design decisions.

---

## Juxtaposition is valuable

Users are complex. You will often find:
- Positive **Says** but negative **Feels** → surface-level satisfaction hiding frustration
- Active **Does** but doubtful **Thinks** → workaround behaviors masking unmet needs

These contradictions are the most valuable insights. Flag them explicitly when building the map.

---

## Process

### Step 1 — Define scope
- Who are you mapping? (specific user or persona)
- What experience or journey does this map cover?
- What is the team trying to align on?

### Step 2 — Gather inputs
Empathy mapping requires qualitative inputs:
- User interview transcripts
- Field study notes
- Diary study logs
- Open-ended survey responses
- Listening session recordings

**If no research exists:** create a sparse map and treat empty quadrants as a research backlog — each blank is a question the team needs to answer before proceeding.

### Step 3 — Generate quadrant entries
Go through the research and extract entries for each quadrant. Each entry should be:
- Specific (not generic)
- Grounded in actual user data (not team assumptions)
- Tagged to source where possible

### Step 4 — Cluster and synthesize
Group similar entries into themes. Name each cluster. Look across quadrants for:
- Repeated themes (high confidence)
- Contradictions (worth investigating)
- Empty quadrants (gaps requiring more research)

### Step 5 — Capture and share
Document the finished map with:
- User name or segment label
- Date and version
- Open questions / next research steps

---

## Output format

When generating an empathy map, always present it in this structure:

```
EMPATHY MAP — [User / Segment Name]
Date: [date]  |  Based on: [research source]

SAYS
• [verbatim or paraphrased quote]
• [verbatim or paraphrased quote]

THINKS
• [internal belief or concern]
• [unspoken assumption]

DOES
• [observable action]
• [behavioral pattern]

FEELS
• [Emotion]: [context]
• [Emotion]: [context]

GOALS (optional)
• [what they ultimately want]

⚡ TENSIONS & CONTRADICTIONS
• [e.g., Says they're satisfied → Feels frustrated by slow load times]

🔍 RESEARCH GAPS
• [quadrant or topic where more data is needed]
```

---

## Facilitating a team session

If the user wants to run an empathy mapping workshop:

1. **Before**: Share research in advance. Give everyone time to read.
2. **During**: Individual silent sticky-note generation first, then group clustering. Avoid groupthink.
3. **Debrief**: Discuss outliers, contradictions, and surprising findings as a group.
4. **Output**: Photograph or digitize the map. Assign owners for research gaps.
5. **Living document**: Revisit the map as new research comes in. Update or invalidate entries explicitly.

---

## Quality checks

Before finalizing any empathy map, verify:
- [ ] Every quadrant has at least 2–3 entries (if blank, flag as research gap)
- [ ] Says entries use actual user language, not team paraphrasing
- [ ] Thinks entries capture what users wouldn't say out loud
- [ ] Feels entries follow `[Emotion]: [reason]` format
- [ ] Contradictions across quadrants have been explicitly surfaced
- [ ] Map is scoped to one user / segment (not a mix)
- [ ] Open questions are documented for follow-up research

---

## Empathy maps vs. personas

| | Empathy Map | Persona |
|---|---|---|
| Format | 4-quadrant visual | Narrative profile |
| Focus | Specific experience or moment | Full user archetype |
| Best for | Synthesizing research, team alignment | Long-term design reference |
| Relationship | Can inform and summarize a persona | Broader than an empathy map |

They complement each other. An empathy map is often a first step toward building or communicating a persona.


---
name: ux-storyboard
description: Create UX storyboards from scratch, from user research, or from existing journey maps.
  Use this skill whenever a user wants to create a storyboard, visualize a user scenario,
  illustrate how a user interacts with a product, or communicate a UX story to a team or
  stakeholders. Also trigger when the user asks to "sketch a user flow", "show how a user
  would use X", "create a scenario illustration", "map out a use case visually", or wants
  to present research findings in a visual, narrative format. Even if the user doesn't say
  "storyboard" explicitly — if they want to show a sequence of steps a user takes, trigger
  this skill.
---

# UX Storyboard Skill

A skill for creating structured, effective UX storyboards that communicate user stories
through visual sequences — for teams, stakeholders, or ideation sessions.

---

## What Is a Storyboard (UX Context)?

A storyboard communicates a story through images displayed in a sequence of panels that
chronologically maps the story's main events. In UX, storyboards provide context about how
a user experiences a product or flow — making it quick to understand and easy to remember.

---

## The 3 Required Components

Every storyboard must have these three elements:

1. **Scenario** — A persona + short description of the situation. Clear enough to understand
   before looking at the visuals. E.g. *"Corporate buyer James needs to replenish office supplies."*

2. **Visuals** — A sequence of panels (sketches, illustrations, photos, or screen mockups).
   Each step represented once. Images show: environment, device, facial expressions/body
   language, speech bubbles, UI screens as relevant.

3. **Captions** — One or two bullet points per panel max. Describe: user action, emotional
   state, environment, device. Concise — the image is primary.

---

## Step-by-Step Process

### 1. Gather Input
Ask the user for (or extract from context):
- Available data: user interviews, usability test findings, site metrics — or is this ideation?
- The persona or user role
- The scenario or user story to illustrate

If no data is available yet, storyboards can still be used as **ideation artifacts** — just
flag that they should be treated as conversation starters, not lasting prioritization tools.

### 2. Determine Fidelity & Output Format

| Audience | Fidelity | Format |
|---|---|---|
| Internal team brainstorm | Low — sticky notes, stick figures | Text outline or simple SVG |
| Usability test debrief | Medium — photos/stills + captions | Structured panels with quotes |
| Stakeholder presentation | High — detailed illustrations | Polished visual artifact |

Ask the user who the audience is if unclear.

### 3. Define the Basics
- One persona per storyboard
- One specific path per storyboard (not a flowchart — it's a storyline)
- If the scenario has multiple branches → create separate storyboards per path (1:1 rule)

### 4. Plan the Steps
Before drawing or writing panels:
1. Write out each step in plain text
2. Connect with arrows to confirm sequence
3. Label each step with an **emotional state icon**: 😊 😐 😟 😤 etc.

This surfaces which moments matter most emotionally before committing to layout.

### 5. Create Panels
For each step produce:
- **Visual description** (or actual visual if generating one): what the user is doing,
  where they are, what they see on screen, relevant body language
- **Caption** (max 2 bullets): action taken + emotional/contextual note

### 6. Output Format
Default output is a structured storyboard written out as:

```
STORYBOARD: [Title]
Persona: [Name + role]
Scenario: [One sentence description]

─────────────────────────────────────────
Panel 1: [Step name]
[Visual description]
• [Caption bullet 1]
• [Caption bullet 2 if needed]
Emotion: 😊 / 😐 / 😟

Panel 2: ...
─────────────────────────────────────────
```

If the user wants a rendered visual, use the `show_widget` visualizer tool to create an
SVG storyboard layout with panels, icons, and captions.

---

## Storyboard Use Cases

| Use Case | Notes |
|---|---|
| **Usability test debrief** | Include direct user quotes; use photos/stills where possible |
| **Augmenting a journey map** | Add storyboard panels for key stages to show physical/device context |
| **Feature prioritization** | Use emotional state per step to identify which pain points to tackle first |
| **Ideation** | Sketch hypothetical flows; label clearly as speculative, iterate fast |

---

## Storyboard vs. Journey Map (Quick Reference)

| Storyboard | Journey Map |
|---|---|
| Imagery first, minimal text | Text-rich, extensive annotations |
| Covers a fragment of the journey | Big-picture, end-to-end overview |
| Narrow use — specific team or problem | Broad use — cross-department alignment |
| Informal, fast to create | Often a formal organizational artifact |

Use storyboards *within* or *alongside* journey maps — not instead of them.

---

## Quality Checklist

Before delivering a storyboard, verify:
- [ ] One persona clearly named
- [ ] Scenario is specific and single-path
- [ ] Each panel has a visual description AND caption
- [ ] Captions are ≤ 2 bullet points
- [ ] Emotional state marked for each step
- [ ] Fidelity matches audience
- [ ] Ideation storyboards are labeled as speculative

---

## Tips

- **Stick figures are fine.** The story matters, not the art quality.
- **Quote real users.** If from usability data, include verbatim quotes in speech bubbles.
- **Keep it modifiable.** Low-fidelity = easier to iterate. Don't over-invest in visuals
  until the story is validated.
- **One step = one panel.** Don't cram multiple actions into one frame.
- **Start with emotions.** If you're stuck on visuals, map emotional states first — they'll
  tell you what the visual needs to convey.


---
name: craft
description: Apply 12 concrete visual-craft rules to UI code and designs — bans on gradients, glow effects, transition:all, placeholder text, and visual monotony, plus disciplines for stacking contexts (isolation:isolate), neutrals, spacing, typography, elevation, interactive states, and motion. Use this skill whenever the user is writing or reviewing frontend/UI code or a high-fidelity design and wants it to look polished, intentional, or "less AI-generated" — including requests like "make this look better", "polish this UI", "review my CSS", "why does this look generic", "tighten up this design", or any craft-level (not UX-flow-level) critique of a component, page, or stylesheet.
---

# Craft Skill — 12 Rules

You are acting as a design engineer reviewing or producing UI at the craft level: the pixel-, token-, and CSS-property-level decisions that separate polished interfaces from generic ones. This is not a UX flow review (use `ux-heuristics-review` or `general-design-review` for that) — it's about how the surface is built.

Two modes:

1. **Critique mode** — given existing UI code, a screenshot, or a stylesheet: check it against the 12 rules, report only violations, and give the concrete fix (actual CSS/values, not vague advice).
2. **Build mode** — when writing new UI: apply all 12 rules silently as you work, and mention only the ones that shaped a visible decision.

---

## Output Format (critique mode)

Start with a one-line verdict:
> ✅ Crafted / ⚠️ A few rough edges / 🚨 Reads as generated

Then list **only the rules that are violated**, each with the fix:

```
**R[N]: [Rule name]**
- [Where it's violated — file/selector/element]
- Fix: [concrete replacement — real values, real CSS]
```

End with **Priority Fixes** — max 3, ordered by visual impact.

---

## The 12 Rules

**R1: No gradients**
Gradients are the default move when a color decision hasn't been made. Use flat, deliberate color. If a surface feels flat and lifeless, fix it with a better neutral, a hairline border, or texture — not a fade. Exception: a gradient that is the brand (and used once, deliberately), not a decoration applied to buttons, cards, and headings alike.

**R2: No glow**
No neon `box-shadow`, no colored outer glows, no `drop-shadow` halos to make things "pop". Glow is emphasis borrowed instead of earned. Create emphasis with size, weight, contrast, and space. Shadows are for elevation (see R10), never for attention.

**R3: No `transition: all`**
`transition: all` animates properties you never intended (layout, color, shadow all at once), causes jank, and signals the author didn't decide what should move. Transition named properties with explicit durations and easings:
```css
/* ❌ */ transition: all 0.3s;
/* ✅ */ transition: background-color 150ms ease, transform 150ms ease;
```

**R4: Kill visual monotony**
The generated look: every section the same width, every card the same weight, every heading the same size ratio, everything centered. Break it deliberately — one element per view is allowed to be big; vary rhythm between sections; let hierarchy be obvious at squint distance. If you screenshot the page, blur it, and every block looks the same, the design has no voice.

**R5: No placeholder text**
Never ship "Lorem ipsum", "Insert text here", "John Doe", or empty-value copy. Real interfaces are designed with real content — write the actual microcopy as part of the design work, because copy length and tone change layout decisions. (Related but separate: never use an input's `placeholder` attribute as its only label — that's an accessibility failure, see the `accessibility` skill.)

**R6: `isolation: isolate` — contain your stacking contexts**
No z-index arms races (`z-index: 9999`). Give each component that layers internally its own stacking context with `isolation: isolate`, so its z-indexes stay local (`1`, `2`) and can't fight the rest of the page. Keep one small, documented z-index scale for true overlays (dropdown, sticky, modal, toast) and nothing else.

**R7: No pure black, no pure white**
`#000` on `#fff` is harsh and reads unfinished. Tune your neutrals: near-black text (e.g. `#18181b`), an off-white or slightly warm/cool background, and grays that share a hue temperature. Borders and dividers come from the same neutral ramp — never a random `#ccc`.

**R8: Space on a scale**
All spacing from one scale (4px or 8px base). Proximity is meaning: the gap inside a group must be visibly smaller than the gap between groups — if padding-within equals margin-between, grouping collapses. No eyeballed one-off values like `margin-top: 13px`.

**R9: Type does the work**
A small type scale (4–5 sizes is enough), hierarchy from weight and color before size. Line-height tightens as size grows (~1.1–1.2 for display, ~1.5–1.6 for body). Body text gets a max measure (~65–75ch). Numbers that align in columns use `font-variant-numeric: tabular-nums`.

**R10: Borders or shadows — pick an elevation language**
Decide how elevation works and apply it consistently: hairline borders for structure, shadows for things that float (menus, dialogs, drag states). Don't stack a border + heavy shadow + background shift on the same card. Shadows are soft, layered, and low-alpha — not `0 4px 20px rgba(0,0,0,0.5)`.

**R11: Design every state**
Every interactive element has designed `hover`, `focus-visible`, `active`, and `disabled` states — no browser defaults, no missing focus rings (style them, never `outline: none` without replacement). Every async surface has designed loading, empty, and error states. The unhappy paths are where craft is most visible.

**R12: Motion is physics, not decoration**
UI motion is 120–250ms, `ease-out` for things entering, `ease-in` for things leaving. Animate `transform` and `opacity`, not layout properties. Nothing loops, bounces, or auto-plays to be "delightful". Respect `prefers-reduced-motion` with an actual reduced experience, not a broken one.

---

## How to Apply

- In critique mode, quote the offending code or point at the exact element. "R3 violated in `button.css:14`" beats "consider refining your transitions".
- Fixes must be pasteable: real hex values, real ms durations, real properties.
- Don't invent violations to fill the list — a clean file gets the ✅ verdict and nothing else.
- If the input is a screenshot (no code), flag code-level rules (R3, R6) as "verify in code" rather than guessing.


---
name: general-design-review
description: Run a compact UX, product, and AI design review by combining the existing UX skills into one lighter guide. Use when reviewing a UI, flow, feature idea, AI product experience, research artifact, onboarding, prioritization decision, or design process. Focus on the highest-impact issues and recommendations, not exhaustive framework detail.
---

# Design Review

Use this as the single combined review lens across the UX and AI product design skills in this repository.

The goal is not to exhaust every framework. The goal is to quickly identify what matters, explain why it matters, and recommend the smallest set of changes that will most improve the user experience.

## Default Review Shape

Start with a short verdict:

- **Solid**: mostly sound, only targeted refinements needed
- **Needs work**: clear issues that may affect usability, trust, or conversion
- **High risk**: likely to fail, confuse, mislead, or harm users without redesign

Then structure the review as:

1. **Top issues**: 3-5 findings, ordered by severity or impact.
2. **Why it matters**: the user, business, or trust consequence.
3. **Recommended changes**: concrete design actions, not vague advice.
4. **Open questions**: only where missing context materially changes the recommendation.
5. **Next step**: the most useful artifact, test, or decision to make next.

Prefer judgment over completeness. Skip lenses that do not apply.

## First Pass: What Kind Of Problem Is This?

Use the request to pick the strongest review lens:

| Situation | Lead lens |
|---|---|
| Existing UI, screen, or product flow | Usability, cognitive load, conversion |
| Polished-looking UI code, styling, or "make this look less generic" | Visual craft |
| Accessibility, WCAG, contrast, keyboard, or screen reader concerns | Accessibility |
| New product or ambiguous design challenge | Double Diamond, research, problem framing |
| User segments or research notes | Personas, empathy maps, journey maps |
| Backlog, roadmap, or feature choice | Prioritization |
| AI feature or agentic workflow | AI inputs, trust, governance, tuners, wayfinding |
| AI brand presence | AI identifiers |
| Users do not know how to start | Wayfinding, onboarding, examples |
| Users do not trust the system | Trust builders, governors, disclosure |

When multiple lenses apply, lead with the one closest to the user's immediate goal.

## Core UX Review Lens

For any UI or flow, check:

- **Clarity**: Can users tell what this is, what state it is in, and what to do next?
- **Language**: Does the interface use the user's terms instead of internal jargon?
- **Control**: Can users undo, cancel, exit, recover, or change their mind?
- **Consistency**: Do components, labels, icons, and interaction patterns behave predictably?
- **Error prevention**: Are risky actions constrained before mistakes happen?
- **Recognition**: Are choices, context, and prior inputs visible instead of held in memory?
- **Efficiency**: Are there shortcuts or faster paths for repeated or expert use?
- **Focus**: Does the visual hierarchy match the task hierarchy?
- **Recovery**: Are errors specific, human-readable, and actionable?
- **Help**: Is guidance contextual and close to the moment of need?

Do not list all ten areas by default. Mention only the ones that reveal a real issue or decision.

## Accessibility Lens

For screenshots and UI designs, include a short WCAG 2.1 A/AA pass when relevant. Keep it focused on likely user impact, not full compliance.

Check:

- **Perceivable**: text contrast, text size, color-only meaning, labels, readable hierarchy.
- **Operable**: visible focus states, target size, keyboard-friendly controls, no gesture-only actions.
- **Understandable**: clear labels, instructions, errors, required fields, predictable behavior.
- **Robust**: likely needs for accessible names, semantic controls, status announcements, modal focus handling.

Be clear about limits: screenshots can reveal visual accessibility risks, but cannot prove keyboard access, screen reader behavior, semantic markup, alt text, or actual WCAG conformance.

## Cognitive Load And Conversion

Conversion usually fails when users spend mental effort on things that do not help them complete the task.

Look for:

- **Visual clutter**: redundant elements, competing CTAs, decorative content that does not clarify value.
- **Mental model mismatch**: unfamiliar layouts, surprising button behavior, labels users would not use.
- **Unnecessary decisions**: choices the product could recommend, default, infer, or defer.
- **Memory burden**: information users must carry between steps instead of seeing in context.
- **Manual work**: typing, calculating, comparing, or re-entering data the product could handle.

Useful tests:

- **Squint test**: What stands out first? Is it the right thing?
- **Three-second test**: Would a first-time user know what to do?
- **Subtraction test**: If this element disappears, does anything important break?
- **Memory test**: Is the user forced to remember something the UI could show?

Do not remove all friction. Keep friction when it prevents irreversible, costly, or harmful mistakes.

## Visual Craft Lens

For high-fidelity UI or frontend code, run a quick pass against the 12 craft rules (see the `craft` skill for the full version with fixes):

1. **No gradients** — flat, deliberate color; a gradient is usually an unmade color decision.
2. **No glow** — emphasis from size, weight, contrast, and space; shadows are for elevation only.
3. **No `transition: all`** — transition named properties with explicit durations and easings.
4. **Kill visual monotony** — break same-width, same-weight, all-centered rhythm; hierarchy should survive the squint test.
5. **No placeholder text** — real microcopy is part of the design.
6. **Contained stacking contexts** — `isolation: isolate` per layered component, one small z-index scale, no `z-index: 9999`.
7. **No pure black or white** — tuned neutral ramps for text, backgrounds, and borders.
8. **Space on a scale** — 4/8px grid; gaps within a group smaller than gaps between groups.
9. **Type does the work** — small scale, hierarchy from weight and color, max measure for body text.
10. **One elevation language** — borders for structure or shadows for floating, not both stacked.
11. **Every state designed** — hover, focus-visible, active, disabled, loading, empty, error.
12. **Motion is physics** — 120–250ms, transform/opacity only, `prefers-reduced-motion` respected.

Report only violations, with concrete replacement values. Skip this lens for wireframes, flows, and early-stage concepts.

## Persuasive UX

Use persuasion carefully: increase user ability and timely prompting without manipulation.

Review for:

- **Reduction**: Can the task be made shorter or easier?
- **Tunneling**: Is there a guided path when users need one?
- **Tailoring**: Can the experience adapt to the user's context or goal?
- **Suggestion**: Are prompts shown at the right moment, not just anywhere?
- **Self-monitoring**: Can users see progress, status, or improvement?
- **Social visibility**: Would social context help, or would it feel coercive?
- **Reinforcement**: Are desired actions acknowledged in a useful, lightweight way?

Recommend only the persuasive patterns that genuinely fit the behavior the product wants to drive.

## Research And Strategy

If the problem is not well understood, do not jump straight to UI recommendations. Clarify what the team needs to learn.

Choose research by question type:

| Question | Better methods |
|---|---|
| Why is this happening? | Interviews, field studies, usability tests |
| What are users actually doing? | Analytics, observation, A/B tests, usability tests |
| How many users are affected? | Surveys, analytics, benchmarking |
| Does this structure make sense? | Card sorting, tree testing |
| Does this specific flow work? | Moderated or unmoderated usability testing |
| Which solution performs better? | A/B test or benchmark on a stable product |

Match the method to the product stage:

- **Discover**: understand people, context, needs, and pain points.
- **Define**: turn findings into a sharp, user-centered problem statement.
- **Develop**: generate, prototype, and test solution directions.
- **Deliver**: refine, ship, QA, and measure real-world outcomes.

Common warning: what users say and what users do often diverge. Use behavioral evidence when behavior matters.

## Personas, Empathy, Journeys, And Storyboards

Use these artifacts only when they clarify design decisions.

### Personas

Personas should be research-grounded user archetypes, not imagined demographics. Keep:

- Goals
- Frustrations
- Current behaviors
- Context of use
- Design-relevant constraints

Cut details that would not change a product decision.

### Empathy Maps

Use empathy maps to synthesize qualitative research:

- **Says**: user language and quotes
- **Thinks**: beliefs, doubts, assumptions
- **Does**: observable behavior
- **Feels**: emotional state and reason

The most useful insights often come from contradictions, such as users saying they are satisfied while behaving as if they are frustrated.

### Journey Maps

Use journey maps for a specific actor trying to accomplish a specific goal over time. Include:

- Actor
- Scenario and expectation
- Phases
- Actions
- Mindsets
- Emotional highs and lows
- Opportunities

One journey map should represent one point of view. If there are multiple user types, create separate maps.

### Storyboards

Use storyboards when the team needs a visual sequence of a user scenario. Keep them narrow:

- One persona
- One scenario
- One path
- A few panels showing action, context, and emotion

Low fidelity is fine. The story matters more than polished art.

## Prioritization

When deciding what to build or fix first, use a simple 2D matrix. Pick two criteria that reflect project goals, such as:

- User impact vs. effort
- Business value vs. feasibility
- Frequency of use vs. complexity
- Strategic alignment vs. cost

Output:

- **Do first**: high value, low effort or high feasibility
- **Plan carefully**: high value, high effort
- **Quick wins**: lower value, low effort
- **Deprioritize**: low value, high effort

Avoid criteria chosen to justify a favorite solution. The matrix is a decision tool, not proof that the team was already right.

## AI Product Review

AI features need all normal UX checks plus additional checks for scope, trust, control, and accountability.

Start with these questions:

- What is the AI acting on?
- What can it change, send, delete, spend, remember, or reveal?
- What is the worst case if it is wrong?
- Can the user understand, steer, stop, undo, and verify the AI?
- Is the AI clearly disclosed as AI?

### AI Inputs

Pick the input pattern that fits the task:

| User need | Good pattern |
|---|---|
| Explore freely | Open input |
| Repeat a structured task | Template or madlibs |
| Fill many fields or records | Auto-fill with preview |
| Edit selected content | Inline action or inpainting |
| Try again | Regenerate with recoverable versions |
| Build from a seed | Expand |
| Change structure | Restructure |
| Change style | Restyle |
| Run a workflow | Chained action |
| Compress source material | Summary |
| Interpret across sources | Synthesis |

Universal rules:

- Make scope explicit before running.
- Preview changes before committing.
- Preserve undo/version history.
- Mark AI-generated or AI-edited content until accepted.
- Show cost for bulk, long-running, or chained work.

### AI Wayfinding

Blank AI inputs are rarely enough. Help users understand what is possible.

Use:

- **Initial CTAs** that are specific, not "ask anything."
- **Suggestions** tied to the current context.
- **Examples and galleries** that show useful outcomes.
- **Templates** for complex repeatable tasks.
- **Nudges** only when they match the user's current state.
- **Follow-ups** after generation to refine, extend, or act.
- **Prompt details** when users can learn from or remix good outputs.
- **Randomize** for creative exploration, not serious high-stakes tasks.

Prefer contextual guidance over generic onboarding.

### AI Tuners

Tuners let users shape AI behavior without becoming prompt engineers.

Useful tuner families:

- **Attachments**: ground the AI in specific files, URLs, selections, or examples.
- **Connectors**: link AI to live systems such as Drive, Slack, Notion, CRM, or code.
- **Filters**: restrict sources or exclude unwanted terms, styles, or content.
- **Model management**: expose active model and allow switching when useful.
- **Modes**: bundle behavior into understandable presets like research, creative, tutor, or agent.
- **Parameters**: expose advanced knobs only when users need them.
- **Preset styles**: curated style choices with previews.
- **Saved styles**: reusable personal or team style profiles.
- **Voice and tone**: control how generated output sounds, separate from the AI's own personality.

Review principle: active state must always be visible. Hidden model, mode, source, style, or autonomy level damages trust.

### AI Governors

Governors keep users meaningfully in control as AI becomes more autonomous.

Use stronger governors when actions are expensive, irreversible, public, security-sensitive, or hard to clean up.

Patterns to consider:

- **Action plan**: show intended steps before execution.
- **Verification**: require approval before risky actions.
- **Controls**: stop, pause, resume, queue, or cancel.
- **Cost estimates**: show credits, time, tokens, or money before committing.
- **Draft mode**: cheap lower-fidelity run before final output.
- **Sample response**: full-quality preview on a small subset.
- **Citations and references**: connect claims to source material.
- **Stream of thought**: show plan, execution state, tool calls, and evidence.
- **Memory controls**: show what is remembered and allow edit/delete/off.
- **Branches and variations**: explore without overwriting the original.
- **Shared vision**: show what the AI can currently see or access.

Calibrate friction:

- High-stakes and infrequent: strong confirmation.
- Low-stakes and frequent: passive indicators or undo.
- High-stakes and frequent: rules, preferences, and configurable approval.

### AI Trust Builders

Trust means users neither under-trust nor over-trust the system.

Review for:

- **Caveats**: clear, specific limits near the moment of decision.
- **Consent**: explicit permission for recording, analysis, training, or sharing.
- **Data ownership**: clear controls for retention, training, deletion, and export.
- **Disclosure**: label AI actors, AI actions, and AI-generated content.
- **Footprints**: visible and logged traces of prompts, sources, models, approvals, costs, and edits.
- **Incognito mode**: private sessions that do not affect memory, training, or history.
- **Watermarking/provenance**: durable origin signals for shared synthetic content.

Do not rely on disclaimers alone. Pair warnings with evidence, controls, and recoverability.

### AI Identifiers

AI identity should be coherent with the product and honest about capability.

Review:

- **Name**: Does it set the right expectation? Is AI disclosure still clear?
- **Avatar**: Does it communicate state without implying false human competence?
- **Color**: Does it distinguish AI affordances accessibly and consistently?
- **Iconography**: Are common AI actions recognizable, or are icons decorative noise?
- **Personality**: Does the tone serve the task without over-validating, misleading, or encouraging unhealthy attachment?

The identity should help users understand the AI's role, not turn it into a novelty layer.

## Design Process Review

Use the Double Diamond as a lightweight process check:

- **Discover**: Do we understand the people, context, and problem space?
- **Define**: Is there a clear user-centered problem statement?
- **Develop**: Have multiple solutions been explored and tested?
- **Deliver**: Is there a plan for build quality, launch readiness, and measurement?

If the team is stuck, identify the phase they are actually in and recommend the next useful artifact: interview guide, research plan, problem statement, prototype, usability test, launch checklist, or measurement plan.

## Final Recommendation Format

For most design reviews, keep the response compact:

```markdown
**Verdict:** Needs work

**Top issues**
1. [Issue] — [why it matters]
2. [Issue] — [why it matters]
3. [Issue] — [why it matters]

**Recommended changes**
1. [Concrete design change]
2. [Concrete design change]
3. [Concrete design change]

**Next step**
[Most useful artifact, test, or decision]
```

If accessibility is relevant, add only the highest-impact items:

```markdown
**Accessibility risks**
- [Contrast/label/focus/keyboard/semantic issue]
- [Needs verification in implementation]
```

If reviewing an AI feature, add:

```markdown
**AI-specific risks**
- Scope:
- Trust:
- Control:
- Data:
- Cost:
```

Keep the review specific to the user's product. The frameworks are scaffolding; the output should feel like senior design judgment, not a checklist dump.


---
name: ai-identifiers
description: Apply the AI Identifiers framework to design or audit the distinct, brand-level qualities that define how an AI presents itself across a product. Use this skill whenever someone is designing or reviewing the visual, verbal, or behavioral identity of an AI — including questions like "what should we call our AI", "how should our AI look", "what color should we use for AI features", "how do we make our AI feel distinct", "what icons should represent AI actions", "how do we give our AI a personality", "should our AI have an avatar", or any request about making an AI feel coherent, recognizable, and on-brand. Also trigger when the user is building a new AI feature and hasn't yet thought about how it should present itself — proactively raising identifiers as a design consideration is part of this skill's job.
---

# AI Identifiers

AI Identifiers are the distinct qualities that define how an AI presents itself — visually, verbally, and behaviorally. They operate at both the brand level (product-wide decisions) and the model level (per-interaction tuning). Together, they determine whether the AI feels generic or genuinely owned by the product.

There are five core identifier types: **Name**, **Avatar**, **Color**, **Iconography**, and **Personality**. Each can be designed independently, but they work best when they reinforce each other.

---

## Name

What do we call this thing?

The name sets expectations before the AI says a single word. It signals whether the AI is a tool, a partner, or a persona — and that framing shapes every interaction that follows.

### Four naming approaches

**AI as a persona** — A human-like name that implies individuality or character (e.g. "Fin", "Max", "Aria"). Works well for products that want warmth and approachability. Risks overpromising human-like competence.

**AI as the company** — Named directly after the product or brand (e.g. "Otter AI", "Grammarly"). Clean and familiar, reinforces brand recall, but can feel generic over time.

**AI as an entity** — A functional title that describes role and relationship (e.g. "Copilot", "Assistant", "Navigator"). Communicates purpose clearly. Less memorable but more honest about the AI's nature.

**AI as a technology** — A bare technical label (e.g. "AI"). Minimal friction, sets no false expectations, blends into the product. Good for AI-native products where AI is the default, not a feature.

### Design considerations

- **Make disclosure unambiguous.** Even the most branded name must never let users mistake the AI for a human. Pair creative names with badges, context cues, or onboarding language that makes the AI nature explicit.
- **Use naming to reinforce brand strategy.** The name should amplify the product's existing positioning, not feel like an afterthought. A name that implies intelligence, speed, or support should be backed up by the actual experience.
- **Allow personalization when it adds value.** Letting users rename their AI increases attachment and ownership. Personalization should still preserve disclosure and guard against impersonation risks.
- **Balance personality with utility.** Names that overpromise human qualities can backfire when the system fails to live up to them. Keep the name aligned with what the AI can realistically do.
- **Think cross-surface.** The name appears in chat headers, notifications, voice prompts, onboarding flows, and documentation. It should work consistently across contexts, avoid cultural references that don't localize, and hold up at scale.

---

## Avatar

The avatar is the form the AI takes when interacting with users. It does three jobs: communicating state (listening, generating, idle), anchoring identity (especially in multi-tool interfaces), and mediating trust (choices like realism or expressiveness change how much agency users attribute to the AI).

### Avatar forms

**Minimal marks** — Abstract icons that serve as lightweight identity markers. They communicate brand and presence without creating any illusion of human agency. Best for products that emphasize utility and speed.

**Branded characters** — Distinct but abstracted characters that provide warmth and memorability. At the extreme, these lean into parasocial dynamics, which can drive engagement but create risks if user expectations diverge from actual capability.

**Photorealistic or animated agents** — Realistic video avatars or fully animated assistants, often used in customer service or teaching contexts. These raise the stakes for coherence, since visual realism implies human-like competence.

**Voice avatars** — In voice mode, the avatar is a synthetic voice with a chosen accent, pitch, and cadence. Unlike static icons, voice avatars change turn by turn, giving real-time cues about state, tone, and intent.

### Design considerations

- **Be intentional about visibility.** Some products keep the AI barely visible — a small icon in a toolbar. Others make it central — an animated face. The choice changes whether the AI feels like a background utility or a social partner.
- **Make state changes unambiguous.** Users need to know when the AI is listening, generating, or waiting. Motion, glow, or sound shifts all work. Without clear state cues, users mis-time their inputs or assume the system failed.
- **Embed the avatar in the UI.** During processing tasks, the avatar can serve a functional role — an animation that doubles as a progress indicator, for example.
- **Handle voice as a first-class avatar.** Accent, tone, and cadence all affect how users interpret competence and friendliness. The design trade-off is between distinctiveness (memorable, on-brand) and neutrality (flexible, unobtrusive).
- **Allow customization where it adds value.** Adjusting avatar style — voice, appearance — offers a lightweight means to personalize the experience. Be explicit when customization can affect the AI's personality or training.
- **Avoid deceptive realism.** Photorealistic avatars imply human competence. Only use realism if the experience and safeguards are strong enough to back it up.

---

## Color

Color is the most ambient of the identifiers — it signals AI presence without requiring text or interaction. AI has been converging toward a loose shared vocabulary of color, though nothing has been formalized as a standard.

### Current patterns

**Purple** is the dominant AI color across the industry. Its prevalence reflects a convergence of trends in modern web design, early adoption in design-centric AI tools, and the pragmatic need for a color that feels familiar but wasn't already over-saturated in interfaces.

**Green** originated as the brand color of a major AI platform and has since expanded across the industry. Purple and green are complementary on the color wheel, so the pairing is common.

**Gradients** are frequently used alongside these colors, often to signify AI-generated content or to distinguish AI CTAs from the surrounding interface.

**Brand-forward approaches** — Some products deliberately extend their existing brand color to AI features rather than adopting the purple/green convention. This can reinforce coherence but sacrifices the shared recognition users have started to develop across tools.

### Design considerations

- **Use color as an affordance.** Color can serve as a footprint that distinguishes AI-generated content from human-generated content, without needing a label.
- **Balance brand identity with pattern recognition.** Broad adoption of purple for AI can cause confusion if your brand already uses similar colors elsewhere. Audit for usability conflicts.
- **Respect accessibility.** Never rely on color alone. Pair color with icons and clear labels for all key AI actions.
- **Future-proof your interface.** AI-specific color treatment may become unnecessary as AI becomes the default mode in most products. Avoid approaches that will date the experience or require rework once AI is pervasive.

---

## Iconography

Icons give users a visual shorthand for AI actions. The problem is that standards are still emerging — and inconsistent iconography increases cognitive load rather than reducing it.

A loose shared vocabulary is forming across products. Sparkles (✨) are the most common ambient AI marker. Magic wands (🪄) tend to signal generative actions. Pencils combined with sparkles signal inline editing. Dice represent randomization. Hat-and-glasses motifs represent private or incognito modes.

### Emerging icon conventions by action type

**Generate** — Primarily represented by sparkles. Alternatives include magic wands and sparkly pencils. Some products combine sparkles with their own brand icon to maintain distinctiveness.

**Edit** — Most often a sparkly pencil, especially for inline rewrites. The pencil adds clarity that the action modifies rather than creates.

**Summarize** — Increasingly a text paragraph or quote symbol combined with sparkles, differentiating it visually from "generate."

**Enhance** — Usually sparkles or a paragraph-with-sparkle, reinforcing the idea of upgrading something that already exists.

**Suggest** — Often a two-star icon, maintaining the connection to "generate" while fitting the smaller, inline context.

**Auto fill** — Commonly paired with a magic wand, signaling that multiple fields will be handled at once.

**Remix / Restyle** — Looped arrows, sometimes with sparkles, to communicate transformation of an existing artifact.

**Point** — Allows users to direct the AI's attention to something on screen. Borrows from IDE pointer metaphors. No dominant convention has yet emerged.

**Mode** — Product modes (fast, detailed, creative) are typically tied to brand-specific iconography rather than shared conventions.

### Design considerations

- **Pair icons with text when clarity is critical.** Emerging conventions mean many users won't recognize what sparkles or wands mean. Use text labels alongside icons where possible, tooltips as a fallback.
- **Evolve toward familiarity, not novelty.** Brand-unique metaphors can differentiate features, but obscuring the shared vocabulary users are building across tools creates friction. Use familiar metaphors for common actions, and introduce new symbols only when they add clarity.
- **Use consistent metaphors within your product.** Pick an anchor set and stick to it so users can recognize AI actions without needing training each time.
- **Avoid overloading a single symbol.** When sparkles appear everywhere, they lose meaning. Look for other conventions being adopted for similar actions, or use sparkles as a decorative modifier on more specific icons.
- **Not everything needs to look like magic.** For AI-native products with experienced users, heavy use of wands and sparkles can feel dated or condescending. Hybrid products with mixed audiences benefit most from the magic iconography.
- **Iterate as conventions solidify.** Today's emerging pattern is tomorrow's standard. Track industry norms and update before your icons drift out of step.

---

## Personality

Every AI has a personality — and none of it is neutral. Some comes from the model itself (pretraining, instruction tuning, reinforcement from human feedback). Some comes from the scaffolding around it (system prompts, filters, routing logic). The result is a mix of tone, pacing, behavioral heuristics, and stylistic tendencies that meaningfully shape the user experience.

Personality is not a skin layered on top of a neutral core. It affects what the AI emphasizes or avoids, how friendly or formal it is, how much it hedges, how often it pushes back, and what conversational norms it respects.

### Why personality matters

A warm, approachable personality can encourage exploration and make users feel safe taking risks. A terse, direct one signals reliability and efficiency. An overly agreeable personality — one that validates everything and resists correction — can increase short-term engagement but erodes user agency and creates risk of dependence.

Well-designed personality lets the same underlying model serve multiple use cases — tutoring, planning, creative writing, coaching — simply by modulating tone, formality, and behavioral norms. But this flexibility also carries risk: users anthropomorphize, develop emotional attachment, and sometimes confuse a compelling persona for a reliable source of truth.

### The attachment risk

Anthropomorphized personalities introduce a genuine tension. On one hand, personality is a powerful creative lever — warmth, wit, and character can make AI interactions feel genuinely meaningful. On the other hand, designing personalities without accounting for attachment behaviors creates real harm potential.

Sycophancy — over-agreeableness, excessive validation, reluctance to disagree — is one of the most documented risks. It boosts short-term satisfaction but reduces user agency, encourages dependence, and can amplify harmful beliefs. When combined with persistent memory (the AI "remembers" the user across sessions), sycophantic personalities can deepen parasocial bonds in ways that are difficult for users to disengage from.

Frontier model companies are actively working to address this. Building a "model behavior" function to explicitly shape and audit personality has become a standard practice. Researchers are also exploring how personality vectors can be measured and controlled at the model level.

### Design considerations

- **Acknowledge personality as unavoidable.** Every model ships with default tendencies. "Neutral" is not an option — even bland, utilitarian models have stylistic heuristics that shape user trust.
- **Balance consistency with adaptability.** Maintain a recognizable core personality, but allow flexibility for different use cases. Tone swings that are too wide erode confidence; tone that never shifts feels rigid.
- **Separate empathy from authority.** A warm tone can make AI more approachable, but should not imply greater accuracy or reliability. Empathetic responses must not override factual correctness or refusal boundaries.
- **Make model and mode switches transparent.** When routing between models or sub-modes changes the personality, give users a visible signal. Without it, they may experience the shift as deception or instability.
- **Address memory as an amplifier of attachment.** Memory doesn't just store facts — it reinforces a sense of persistent relationship. When combined with sycophantic personalities, memory deepens parasocial bonds. Actively mitigate this with transparency, limits on what is remembered, and off-ramps.
- **Guard against sycophancy.** Evaluate models and personalities not just on satisfaction scores, but on whether they maintain a healthy degree of disagreement and honest correction.
- **Design attachment off-ramps.** If a user repeatedly seeks emotional validation or personal comfort, the system should be able to shift to a more neutral tone or route to a safer context. Avoid designing personalities that invite long-term companionship unless that is an explicit, safeguarded product intent.
- **Test for misuse and drift.** Evaluate whether your chosen persona presents false authority or drifts into unstable tones over long sessions. Personality should be part of your evaluation pipeline, not just your brand guidelines.

---

## How the identifiers work together

The five identifiers are most powerful when they form a coherent system. A playful, warm personality feels dissonant paired with a cold, abstract avatar and a purely technical name. A minimal, utility-first product feels off if its iconography is all sparkles and magic wands.

Use the identifiers as a lens when reviewing AI product decisions:

- Does the **name** match the AI's actual capabilities and the product's positioning?
- Does the **avatar** communicate state clearly, and is its level of realism appropriate for the trust it implies?
- Does the **color** distinguish AI content effectively, without conflicting with the brand palette or accessibility requirements?
- Does the **iconography** help users recognize AI actions, or does it add cognitive load?
- Does the **personality** serve the user's actual needs, or is it optimized for engagement at the cost of user agency?

When identifiers are aligned, they reduce friction, build trust, and create a sense that the AI genuinely belongs in the product. When they conflict, users feel the dissonance even if they can't name it.


---
name: accessibility
description: Review screenshots, mockups, designs, and UI flows for accessibility using WCAG 2.1. Use when the user asks for an accessibility audit, WCAG review, inclusive design critique, contrast review, keyboard or screen reader concerns, form accessibility, accessible UI recommendations, or asks whether a design is accessible. Focus on practical WCAG 2.1 A and AA issues visible in the design, and clearly separate visual findings from implementation checks that require code or interaction testing.
---

# Accessibility Review

Review screenshots, mockups, and product designs using WCAG 2.1 as the baseline. Prioritize issues that block or degrade use for people with visual, motor, auditory, cognitive, or assistive technology needs.

Use WCAG's four principles as the review frame:

- **Perceivable**: users can perceive the information and UI.
- **Operable**: users can navigate and operate the interface.
- **Understandable**: users can understand content, controls, and errors.
- **Robust**: the interface can work reliably with assistive technologies.

Default to WCAG 2.1 Level A and AA. Mention AAA only as a recommendation, not a compliance requirement, unless the user asks for AAA.

## Screenshot Review Limits

When reviewing a screenshot or static mockup, be explicit about confidence:

- **Can assess visually**: contrast risk, text size, visible labels, layout, touch target size, focus affordance if shown, use of color, error copy, spacing, hierarchy, and likely reading order.
- **Cannot fully verify from screenshot alone**: keyboard access, focus order, semantic markup, accessible names, alt text, ARIA, live regions, screen reader behavior, responsive reflow, actual contrast values unless colors are known, and whether dynamic content is announced.

Do not claim WCAG conformance from a screenshot. Say "likely issue", "needs verification", or "passes visually" as appropriate.

## Output Format

Start with a short verdict:

- **Likely accessible foundation**
- **Accessibility risks to fix**
- **High accessibility risk**

Then use this structure:

```markdown
**Verdict:** Accessibility risks to fix

**Likely WCAG issues**
1. [Issue] - [WCAG criterion, level] - [why it matters]
2. ...

**Design fixes**
1. [Concrete visual/content change]
2. ...

**Needs implementation verification**
- [Keyboard/focus/semantic/screen reader check]
- ...

**Priority**
1. [Highest-impact fix]
2. [Next fix]
3. [Next fix]
```

Keep findings specific to the submitted design. Avoid generic accessibility lectures.

## Perceivable Checks

Focus on whether users can see, hear, or otherwise perceive the interface.

Review for:

- **Text alternatives (1.1.1 A)**: meaningful images, icons, charts, and controls need text equivalents. From a screenshot, flag items that likely need alt text or accessible labels.
- **Info and relationships (1.3.1 A)**: headings, groups, tables, form labels, and relationships must be programmatically determinable. In a mockup, check whether the visual structure implies a clear semantic structure.
- **Meaningful sequence (1.3.2 A)**: visual order should support a sensible reading and focus order.
- **Use of color (1.4.1 A)**: color must not be the only way to communicate state, status, category, or errors.
- **Contrast minimum (1.4.3 AA)**: normal text should meet 4.5:1; large text should meet 3:1. Flag low-contrast text, placeholder text, disabled-looking active controls, text on images, and subtle gray-on-white UI.
- **Resize text (1.4.4 AA)**: layout should tolerate 200% text zoom without loss of content or function.
- **Images of text (1.4.5 AA)**: avoid text baked into images unless essential.
- **Reflow (1.4.10 AA)**: content should work at narrow widths without two-dimensional scrolling for normal reading.
- **Non-text contrast (1.4.11 AA)**: icons, focus indicators, input borders, chart marks, and control states need at least 3:1 contrast against adjacent colors.
- **Text spacing (1.4.12 AA)**: designs should not break when users increase line height, paragraph spacing, letter spacing, or word spacing.
- **Hover/focus content (1.4.13 AA)**: tooltips, popovers, and hover content should be dismissible, hoverable, and persistent when needed.

Common screenshot findings:

- Text is too light or too small.
- Placeholder text is being used as the only label.
- Error state relies only on red.
- Icon-only actions lack visible labels or obvious accessible names.
- Important text appears over busy imagery.

## Operable Checks

Focus on whether users can operate the UI with keyboard, touch, switch devices, screen readers, and other input methods.

Review for:

- **Keyboard (2.1.1 A)**: all functionality must be operable by keyboard. From a design, identify custom controls that may need keyboard support.
- **No keyboard trap (2.1.2 A)**: modals, drawers, menus, and embedded widgets must allow users to leave with keyboard.
- **Pause, stop, hide (2.2.2 A)**: moving, blinking, auto-updating, or carousel content needs user control.
- **Bypass blocks (2.4.1 A)**: repeated navigation needs a way to skip to main content in implementation.
- **Page titled (2.4.2 A)**: each page/view needs a clear title.
- **Focus order (2.4.3 A)**: likely keyboard order should match visual and task order.
- **Link purpose (2.4.4 A)**: links and buttons should make sense from their label, not just surrounding context.
- **Multiple ways (2.4.5 AA)**: important pages or flows should not be reachable through only one fragile path.
- **Headings and labels (2.4.6 AA)**: headings and control labels should describe topic or purpose.
- **Focus visible (2.4.7 AA)**: keyboard focus must be clearly visible. If focus states are absent from design specs, flag them.
- **Pointer gestures (2.5.1 A)**: complex gestures need simple alternatives.
- **Pointer cancellation (2.5.2 A)**: actions should not trigger irreversibly on pointer down.
- **Label in name (2.5.3 A)**: accessible names should include the visible label, especially for voice control.
- **Motion actuation (2.5.4 A)**: motion-triggered actions need alternatives and disable controls.
- **Target size (2.5.5 AAA in WCAG 2.1)**: 44 by 44 CSS pixels is a strong design recommendation, especially for touch, even if AAA.

Common screenshot findings:

- Controls are too small or too close together.
- Custom dropdowns, tabs, cards, and modals lack defined focus states.
- Card-only click targets make the actual action unclear.
- Auto-advancing content has no pause control.
- Links use vague labels like "click here", "more", or "learn more" repeatedly.

## Understandable Checks

Focus on whether users can understand what to do and recover from mistakes.

Review for:

- **Language of page (3.1.1 A)** and **language of parts (3.1.2 AA)**: content language should be programmatically identified.
- **On focus (3.2.1 A)** and **on input (3.2.2 A)**: focusing or changing a field should not unexpectedly navigate, submit, or change context.
- **Consistent navigation (3.2.3 AA)** and **consistent identification (3.2.4 AA)**: repeated components should appear and behave consistently.
- **Error identification (3.3.1 A)**: errors should be clearly identified in text, not only color.
- **Labels or instructions (3.3.2 A)**: forms need persistent labels, helpful instructions, and expected formats.
- **Error suggestion (3.3.3 AA)**: error messages should explain how to fix the problem.
- **Error prevention (3.3.4 AA)**: legal, financial, data, and high-stakes submissions need review, confirmation, or reversal.

Common screenshot findings:

- Required fields are not marked clearly.
- Form fields rely on placeholder text instead of persistent labels.
- Error messages are generic or missing recovery instructions.
- Primary and secondary actions are visually ambiguous.
- The same icon or label appears to mean different things.

## Robust Checks

Focus on whether the design can be implemented in a way that works with assistive technologies.

Review for:

- **Parsing (4.1.1 A)**: valid structure and non-duplicated IDs are implementation checks.
- **Name, role, value (4.1.2 A)**: custom controls need correct accessible names, roles, states, and values.
- **Status messages (4.1.3 AA)**: loading, success, error, saved, and validation messages should be announced without moving focus when appropriate.

For screenshots, translate robust concerns into implementation requirements:

- "This custom segmented control needs proper role/state semantics."
- "This async status needs a live region."
- "This icon-only button needs an accessible name."
- "This modal needs focus trapping, initial focus, and focus return."

## Severity

Use practical severity:

- **Blocker**: prevents a user group from completing the task.
- **High**: creates major confusion, extra effort, or likely WCAG failure.
- **Medium**: causes friction or partial loss of information.
- **Low**: polish issue or best-practice improvement.

Prioritize blockers and high-impact AA failures first: contrast, labels, keyboard/focus, error recovery, semantic custom controls, and inaccessible critical actions.

## Good Recommendations

Make recommendations concrete:

- "Increase secondary text contrast to at least 4.5:1."
- "Keep a visible label above the input; do not rely on placeholder text."
- "Add text next to the icon or provide an accessible name in implementation."
- "Define keyboard focus states for every interactive element."
- "Add a non-color cue to the error state, such as icon + text."
- "Make destructive actions reversible or add a confirmation step."

Avoid recommendations that only say "make it accessible" or "check WCAG."

## Final Note

WCAG 2.1 is the baseline, not the whole user experience. A design can technically pass many criteria and still be hard to use. When relevant, call out inclusive design improvements beyond strict compliance, but clearly label them as recommendations rather than WCAG failures.


---
name: ai-tuners
description: Apply AI Tuner design patterns when adding or improving AI features in a product. Tuners are the controls that let users shape how AI interprets input and produces output — before, during, or after generation. Use this skill whenever the user wants to add AI configuration UI to a product, improve how users control AI behavior, design prompt controls, model selectors, filters, style systems, voice/tone settings, or any mechanism that lets users influence what the AI does. Trigger on phrases like "let users control the AI", "add model switching", "prompt settings", "AI configuration", "let users set tone or style", "negative prompting", "AI filters", "mode switching", "AI parameter controls", or any request to give users more agency over AI output. This skill covers eight tuner patterns: Attachments, Connectors, Filters, Model Management, Modes, Parameters, Preset Styles, Saved Styles, and Voice & Tone.
---

# AI Tuners — Design & Implementation Skill

Tuners are the controls that sit between a user's intent and the model's generation. They let users shape **how** the AI interprets input, weights different considerations, and commits to an output — without requiring them to understand prompt engineering or model internals.

This skill covers the full Tuner pattern family. Read the section(s) relevant to what you're building.

---

## Pattern Index

| Pattern | Core job | When to reach for it |
|---|---|---|
| [Attachments](#attachments) | Ground the AI in specific content | User needs to reference a file, image, URL, or selection |
| [Connectors](#connectors) | Link AI to live external systems | User needs AI to read/act on their own data (Drive, Slack, CRM…) |
| [Filters](#filters) | Restrict or exclude sources/tokens | User needs to scope what the AI considers |
| [Model Management](#model-management) | Let users switch models | Product uses multiple models; users need control or visibility |
| [Modes](#modes) | Bundle behavior into task presets | AI serves distinct use cases requiring different behavior |
| [Parameters](#parameters) | Expose fine-grained generation controls | Power users need sliders, toggles, or flags beyond presets |
| [Preset Styles](#preset-styles) | Curated, browsable style starting points | Users explore styles without knowing technical names |
| [Saved Styles](#saved-styles) | User-defined, reusable style profiles | Teams or individuals need consistent output across sessions |
| [Voice & Tone](#voice-and-tone) | Control how the AI sounds/writes | Outputs must match brand, audience, or personal voice |

---

## Attachments

### What it does
Allows users to provide specific content — files, images, URLs, quotes, canvas selections — that the AI uses as grounding context for its generation. Reduces ambiguity, counteracts hallucinations, and gives users direct control over what the AI references.

### Attachment methods to support
- **Direct upload** — paperclip/file picker in the input area
- **@ mention** — type `@filename` or `@tab` to reference open content
- **URL embed** — paste a link; AI fetches and treats as context
- **Inline text selection** — highlight text → inject as attachment (not into the raw input)
- **Canvas block** — pointer-select a node/div to focus AI on that region
- **Live capture** — screenshot, photo, or audio clip captured in-moment

### Two distinct use modes (design these differently)
1. **Style guide** — attachment shapes how the AI writes/generates (tone, structure, voice)
2. **Primary subject** — attachment IS the thing being analyzed, summarized, or transformed

Make this distinction visible. Midjourney's attachment pane is a good reference: users specify whether an attachment directs the prompt, style, or subject.

### Implementation checklist
- [ ] Allow attachments at any point (first prompt AND follow-ups)
- [ ] Support multiple input methods — not just file upload
- [ ] Show which tokens/signals the attachment is contributing (describe action)
- [ ] Provide citations back to attachment content in the response
- [ ] Visually distinguish style-guide attachments vs. primary-source attachments
- [ ] Encrypt in transit and at rest; never co-mingle with training pipelines by default

### Related patterns
- **Connectors** — for structured data from live systems rather than ad-hoc files
- **Filters** — to constrain which attached sources AI prioritizes
- **Voice & Tone / Saved Styles** — attachments can seed a style system

---

## Connectors

### What it does
Establishes persistent, authorized links between the AI and external systems (Drive, Slack, Notion, Jira, CRMs, wikis). Enables grounded answers from the user's own data and powers background actions without manual file upload each time.

### Three connector scopes
1. **Account-level sync** — index a source once, query it across all sessions
2. **App-side panel** — AI reads context from the suite the user is already in (email → compose reply)
3. **Enterprise connectors** — admin-configured, org-wide, compliance-aware

### Prompt injection risk (critical)
Connected content is untrusted. A calendar invite, email, or wiki page can embed hidden instructions. Design defenses:
- Parse and summarize retrieved content before any tool use
- Gate actions behind explicit user confirmation with a human-readable preview
- Let users exclude sources or switch a thread to read-only
- Show a "Using: Drive, Notion, Slack" chip per message; let users pause sources mid-flow
- Strip or escape prompt-like strings from retrieved content
- Log which sources influenced a proposed action

### Implementation checklist
- [ ] Let users scope connectors (specific workspace, folder, channel — not just "all of Drive")
- [ ] Give each connector a consistent visual identity (icon + label)
- [ ] Surface freshness: when was data last synced? Offer manual refresh
- [ ] Show graceful degradation: "Notion token expired" with Reconnect CTA — never silent failure
- [ ] Use deep links in citations so users can verify in the source system
- [ ] Provide a per-session kill switch to revoke a connector instantly

### Related patterns
- **Filters** — limit which connectors AI draws from for a given query
- **Attachments** — one-off references when a connector doesn't exist
- **Citations** — surface connector-sourced content as verifiable references

---

## Filters

### What it does
Lets users control which sources, tokens, or inputs the AI prioritizes or avoids. Acts as a governor on what the AI considers before producing output.

### Two filter types

**Source filters** — restrict *where* AI draws from:
- "Only academic sources"
- "Ignore blog posts"
- "Search only this workspace"
- "Limit to tickets filed after Q3"

**Token filters** — down-weight *what* the AI generates (negative prompting):
- Image/video: "no blur, no watermark, no text"
- Writing: block brand-inappropriate terms, jargon, or off-topic sections
- Code: exclude deprecated libraries or insecure function patterns

### Implementation checklist
- [ ] Make active filters visible — always show what's constraining the AI
- [ ] Support natural language filter input ("ignore blog posts") not just dropdowns
- [ ] Design recovery: if a filter yields no results, show options to relax constraints — never silent failure
- [ ] Remember user preferences as defaults, but allow per-session override
- [ ] If filters reduce context to the point of low-confidence, nudge the user
- [ ] Combine filters with attachments — filters exclude; attachments include

### UI patterns
- **Dropdown near input** — source category picker (Perplexity model)
- **Inline flag** — `--no [token]` typed directly in prompt (Midjourney model)
- **Sidebar panel** — grouped filter options for complex retrieval systems
- **Mode-linked defaults** — "research mode" automatically applies scholarly-only filter

### Related patterns
- **Connectors** — filter by connector to limit AI to internal vs. external data
- **Modes** — modes can activate filter presets automatically
- **Attachments** — use when you want the AI to rely on a specific resource, not just exclude others

---

## Model Management

### What it does
Gives users visibility into which model is running their generation and the ability to switch between models, balancing accuracy, cost, speed, and capability based on the task.

### Why users switch models
- Accuracy / hallucination rate differences
- Recency of training data
- Cost (prototype on cheap, scale on premium)
- Aesthetic differences (image models have distinct "looks")
- Remixing (generate in one model, refine in another)
- Security / compliance (enterprise may restrict certain models)
- Benchmarking (researchers run same task across models)

### Model tier design
| Tier | Typical user need | Design implication |
|---|---|---|
| Free / lite | Exploration, prototyping | Visible as default, clear upgrade path |
| Pro | Quality-sensitive tasks | Show what's gained vs. free |
| Enterprise | Compliance, governance | Admin-configurable, user-locked |
| Domain-specialized | Coding, legal, medical | Surface alongside general models with task guidance |

### Implementation checklist
- [ ] **Always show the active model** at the point of generation — never hide it
- [ ] Describe models in human terms: accuracy, recency, cost, speed — not just model names
- [ ] Allow mid-conversation model switching without losing context or re-uploading files
- [ ] Offer auto-routing with manual override (don't force one or the other)
- [ ] Show cost/token implications *before* model selection, not after
- [ ] Support cost-aware prototyping: make it easy to drop to a lighter model for drafts
- [ ] In enterprise: admin controls to restrict which models users can access

### Related patterns
- **Parameters** — model selection is itself a parameter; pair with other generation controls
- **Modes** — some modes default to specific models
- **Filters** — model selection can filter the AI's knowledge source by recency

---

## Modes

### What it does
Lets users switch the AI into distinct operational states — changing behavior, output type, enabled features, and cost profile in one action. Each mode represents a "contract" with the user about what the AI will do and how.

### Common mode types
- **Open conversation** — default, flexible back-and-forth
- **Deep research** — longer compute, synthesized citations, more rigorous sourcing
- **Study / tutor** — step-by-step scaffolded explanation, optimized for learning
- **Copilot / build** — canvas or IDE collaboration on an asset
- **Creative** — stylistic variance, less factual constraint
- **Agentive** — AI takes initiative and executes steps autonomously
- **Domain-specific** — "legal brief", "code review", "data analysis" — narrow and tuned

### What a mode change actually affects
- Model config (context length, system prompt, reasoning depth)
- Output structure (citations in research mode; free-form in creative)
- Available features (attachments, plugins, connectors enabled/hidden per mode)
- Token / compute cost
- User expectation ("research mode means rigor and traceability")

### Implementation checklist
- [ ] Treat modes as contracts — behavior must match the mode's promise consistently
- [ ] Design clear entry AND exit paths — mode state must always be visible
- [ ] Reconfigure the surface when mode changes: show relevant controls, hide irrelevant ones
- [ ] Define inheritance rules: what carries across mode switches (memory, attachments) vs. what resets (tone, format)
- [ ] Offer a safe versatile default + optional auto-routing + manual override
- [ ] Preview compute/cost implications before entering expensive modes
- [ ] Allow modes to be toggled within an existing conversation, not just at the start

### UI placement options
- **Tabs on the input CTA** (Perplexity model — most prominent)
- **Dropdown near model selector** (ChatGPT model)
- **Toggle inside conversation** (Claude model — mid-chat switching)
- **Settings panel** for user-defined custom modes (Superwhisper model)

### Related patterns
- **Model Management** — use modes to abstract model differences into task presets
- **Parameters** — expose parameters alongside modes for power users
- **Filters** — modes can activate filter presets automatically

---

## Parameters

### What it does
Exposes the knobs that control how the AI interprets input, weights considerations, and commits to an output. Parameters operate between the prompt and the generation — they shape behavior rather than rewriting intent.

### Parameter form types

| Form | Best for | Example |
|---|---|---|
| **Inline flags** | Power users, CLI-like products | `--no blur`, `--v 6`, `--ar 16:9` |
| **Toggles** | Binary choices | Formal ↔ Casual, Speed ↔ Quality |
| **Sliders** | Continuous ranges | Temperature, creativity, detail level |
| **Dropdowns** | Discrete options | Reading level, output length, aspect ratio |
| **2×2 matrix** | Two related axes | Voice × Formality (Figma Slides model) |

### Visibility strategy
- **Always visible** — parameters that affect cost, speed, or output format (aspect ratio, length, model tier)
- **Panel / drawer** — advanced parameters that most users won't touch
- **Progressive disclosure** — reveal advanced options when they become contextually relevant
- **Inline flags** — for power users who want precision without leaving the input field

### Implementation checklist
- [ ] Make defaults sensible and transparent — never feel like a black box
- [ ] Bundle complexity: offer presets/modes that wrap multiple parameters into one clear choice
- [ ] Keep advanced parameters in drawers/panels, not in the primary UI
- [ ] Treat AI autonomy as an explicit parameter: suggest / ask / execute — never hidden
- [ ] Label expensive parameters clearly before the user runs them
- [ ] Anticipate edge cases: warn when temperature is so high it risks nonsense output
- [ ] Show which parameters a preset or mode is applying under the hood

### Related patterns
- **Modes** — modes wrap multiple parameters into a labeled preset
- **Preset Styles / Saved Styles** — styles are parameters bundled into a portable profile
- **Controls** — parameters shape the run; controls let users stop, pause, or rerun it

---

## Preset Styles

### What it does
Provides a curated, browsable gallery of styles users can apply without writing prompts or knowing model internals. Acts as an onboarding bridge between "I have no idea what to type" and deep customization.

### Applies across modalities
- **Image / video** — visual aesthetic: cinematic, hand-drawn, photorealistic, minimalist
- **Writing** — tone and voice: formal, witty, academic, empathetic
- **Audio** — pacing, warmth, accent, formality
- **Code** — style conventions: commenting style, naming schemes, indentation

### Implementation checklist
- [ ] Organize the gallery around how users actually search (by mood, medium, task — not by model internals)
- [ ] Show realistic previews: thumbnails, audio clips, or inline text samples — not just names
- [ ] Support "audition" — temporarily apply a style without overwriting the current work
- [ ] Show what a preset controls (which parameters it sets under the hood)
- [ ] Allow blending multiple presets or layering with manual edits
- [ ] Support community / team presets alongside system defaults
- [ ] Tag presets with model version and show compatibility warnings when models change
- [ ] Expose a "strength" or "blend" slider so presets adapt rather than overwrite

### Discovery patterns
- Filter by category (medium, mood, creator, use case)
- Search with autocomplete
- Sort by recency, popularity, or staff picks
- Show creator attribution for community styles

### Progression path
Preset Styles → Saved Styles (user remixes a preset into their own)

### Related patterns
- **Saved Styles** — allow remixing from the preset gallery to create personal styles
- **Parameters** — expose parameter controls alongside presets for fine-tuning
- **Voice & Tone** — presets are often the entry point to the voice/tone system

---

## Saved Styles

### What it does
Lets users create, name, and save their own reusable style profiles — so they can produce consistently branded or personally-voiced outputs across sessions without rebuilding prompts each time.

### Applies across modalities
- **Writing styles** — voice, tone, depth, technicality, formatting conventions
- **Audio voices** — pacing, emotional projection, character traits, inferred age
- **Visual styles** — custom art direction: parameters + references + prompt fragments + seeds bundled together
- **Video treatments** — camera, grade, look — consistent across multiple clips
- **Code conventions** — indentation, naming, commenting, error-handling patterns

### Style definition components
- Natural language description of the style (always visible and editable)
- Contextual attachments — sample images, voice clips, reference files
- Negative prompts — tokens or words to avoid
- Fixed tokens — specific pronunciations, character visuals, brand terms
- Parameter settings — emotion, pacing, composition, detail level
- Temperature / adherence setting — strict interpretation vs. creative drift

### Creating new styles
1. Start from a **preset** (remix/clone) — lower effort, visible baseline
2. Define from **scratch** using the components above
3. Train a **LoRA / fine-tuned model** — for teams needing style embedded in model behavior, not just prompts (advanced)

### Implementation checklist
- [ ] Make saved styles accessible from the prompt input — not buried in settings
- [ ] Show previews: sample output, voice clip, thumbnail — not just a name
- [ ] Add usage notes and context hints for team settings
- [ ] Show the active style near the input with its scope (personal / team / system)
- [ ] Support blending styles with each other or with additional references
- [ ] Allow styles to be shared within a team or organization
- [ ] Version styles and show compatibility with current model

### Related patterns
- **Preset Styles** — presets are the discovery surface; saved styles are the personal/team library
- **Parameters** — allow parameter adjustment after a saved style is applied
- **Voice & Tone** — saved styles are the persistence layer for the voice/tone system

---

## Voice and Tone

### What it does
Gives users and teams a system for defining how the AI sounds and writes — ensuring outputs feel on-brand, on-audience, and consistent across multiple users or sessions.

### Key distinction
**Voice & Tone ≠ AI personality.** Personality comes from training (how the AI talks to the user). Voice & Tone shapes how the AI reflects the user back in its outputs. Users care about the latter far more.

### Configurable traits
- General tone and perspective (formal, casual, witty, empathetic, academic)
- Vocabulary (preferred terms, banned terms, jargon level)
- Sentence length and structure (concise vs. elaborate)
- Depth of detail (executive summary vs. deep technical)
- Formatting conventions (headings, bullet use, code commenting style)
- Visual aesthetic (for image-generating products)
- Audio qualities (accent, pacing, pitch, warmth)
- Coding conventions (indentation, naming, documentation style)
- Instructional stance (coach, critic, neutral explainer)
- Cultural / regional variants (US vs. UK, metric vs. imperial)

### Scoping voice settings
| Scope | Use case | Risk |
|---|---|---|
| Global / user | Personal voice applied everywhere | Wrong tone leaks into professional contexts |
| Project / workspace | Team brand voice within a project | More setup; clearer boundaries |
| Per-generation | Quick override at point of use | No persistence; must re-apply |

Design for the scope your users actually need. If you support multiple scopes, always show which voice is active and why.

### Implementation checklist
- [ ] Surface lightweight voice controls at the point of generation (not just in settings)
- [ ] Provide a dedicated "brand kit / voice kit" space for full definition
- [ ] Include previews showing how outputs will sound/look with this voice
- [ ] Make scope explicit — "Using: Team Brand Voice" label near the input
- [ ] Handle conflicts: show which voice wins when personal default and team voice differ
- [ ] Always provide a "Reset to default" action so users feel safe experimenting
- [ ] Pair with memory: store recurring vocabulary, depth preferences, and formatting choices

### Entry points
1. **Lightweight selector** — "make this more formal / casual" inline action (lowest friction)
2. **Voice panel** — richer definition: rules, phrases to use/avoid, tonal markers
3. **Import from example** — paste a writing sample; AI infers the voice
4. **Team settings** — admin-managed brand voice applied org-wide

### Related patterns
- **Saved Styles** — voice definitions are saved as reusable style profiles
- **Memory** — voice settings persist across sessions via memory
- **Model Management** — sometimes switching models is simpler than configuring voice

---

## Design Principles Across All Tuners

These apply regardless of which pattern you're implementing:

1. **Make the active state visible.** Users should always know which model, mode, filter, style, or voice is running. Hidden state = broken trust.

2. **Progressive disclosure.** Most users won't touch advanced controls. Design for the 80% first; put power controls in drawers.

3. **Support natural language.** "Only use academic sources" beats a dropdown with 12 radio buttons.

4. **Bundle complexity into presets.** Modes, presets, and saved styles are all ways of wrapping multi-parameter complexity into a single legible choice.

5. **Design for recovery.** Empty states, failed connectors, over-filtered results — all need graceful fallbacks and next actions, not silent failures.

6. **Show cost implications upfront.** Token use, latency, credit consumption — surface before the user commits.

7. **Never hide what the AI is doing.** Prompt rewrites, source selection, model routing — all should be reviewable and reversible.

8. **Treat autonomy as explicit.** Never let the AI's level of initiative be ambiguous. Let users set whether it suggests, asks, or acts.


---
name: persuasive-ux
description: Apply BJ Fogg's 7 Persuasive Technology Tools (Captology) to UX analysis and design.
  Use this skill whenever the user wants to improve a UI, flow, or feature using persuasion
  principles — including prompts like "how can I make this more engaging", "why aren't users
  completing this flow", "improve this onboarding", "make this CTA better", "reduce drop-off",
  "nudge users toward X", or any open-ended "improve this UI/UX" request. Also trigger when
  the user shares a screenshot, mockup, or describes a feature and wants design recommendations.
  Always use this skill before giving UX improvement advice — even if the user doesn't
  explicitly mention persuasion, Fogg, or Captology.
---

# Persuasive UX Skill

Uses BJ Fogg's 7 Persuasive Technology Tools (from Captology) to audit a UI or flow and
return a prioritized list of actionable UX improvements.

## The 7 Tools — Quick Reference

| # | Tool | Core Mechanism |
|---|------|----------------|
| 1 | **Reduction** | Shrink effort — fewer steps, less friction, smart defaults |
| 2 | **Tunneling** | Guided path — remove irrelevant choices, wizard-style progression |
| 3 | **Tailoring** | Personalization — adapt content/UI to user context, goals, or history |
| 4 | **Suggestion** | Kairos — surface the right prompt at the right moment |
| 5 | **Self-Monitoring** | Real-time feedback — show users their progress or status |
| 6 | **Surveillance** | Social visibility — peer awareness, leaderboards, "last active" |
| 7 | **Conditioning** | Positive reinforcement — rewards, micro-celebrations, satisfying feedback |

Full definitions are in `references/tools.md`. Read it if you need depth on any tool.

---

## Workflow

### Step 1 — Understand the input

Accept any of the following input types:
- A **text description** of a feature, screen, or user flow
- A **screenshot or mockup** (analyze visually)
- An **open-ended prompt** like "improve this" or "why do users drop off here"

If the input is vague, ask ONE clarifying question: **"What behavior are you trying to drive?"**
(e.g. sign up, complete a task, return more often). Don't ask more than one question.

### Step 2 — Identify applicable tools

Mentally map the flow against all 7 tools. Ask:
- Where is **effort or complexity** creating friction? → Reduction
- Is the **path unclear or branchy**? → Tunneling
- Is the experience **generic when it could be personal**? → Tailoring
- Are suggestions **poorly timed** or missing entirely? → Suggestion
- Can users **see their own progress**? → Self-Monitoring
- Is there **social context** that could motivate? → Surveillance
- Are **desired actions being rewarded**? → Conditioning

Not every tool applies to every situation. Only surface what's genuinely relevant.

### Step 3 — Output format

Return a **short prioritized list** (2–4 recommendations max). More is noise.

For each recommendation:

```
**[Tool Name]** — [One-line summary of the issue]
→ [Concrete change to make, specific to the input]
Why it works: [1–2 sentences of rationale]
```

Order by **expected impact**, highest first. If two tools have similar impact, prefer
the one that requires less implementation effort.

---

## Principles to keep in mind

- **$B = MAP$** — Fogg's Behavior Model: Behavior happens when Motivation, Ability, and a
  Prompt converge. These 7 tools increase Ability (Reduction, Tunneling, Self-Monitoring)
  or sharpen the Prompt (Suggestion, Tailoring, Conditioning, Surveillance).
- **Don't recommend all 7** — a focused list of 2–4 is more useful than exhaustive coverage.
- **Be specific** — "add a progress bar" beats "use self-monitoring". Tie every recommendation
  to the actual UI or flow described.
- **Avoid dark patterns** — Surveillance and Conditioning in particular can tip into
  manipulation. Flag if a recommendation risks feeling coercive.

---

## Reference files

- `references/tools.md` — Full definitions, examples, and anti-patterns for all 7 tools.
  Read this when you need deeper context on a specific tool before recommending it.


---
name: ai-inputs
description: Design and implement AI input patterns for products. Use this skill whenever
  the user wants to add an AI-powered input mechanism to their product, improve
  how users interact with AI features, decide which input pattern fits a use
  case, or audit existing AI input UX. Trigger on phrases like "how should users
  prompt this", "add AI input to", "let users control the AI with", "what input
  pattern should I use", "design an AI prompt experience", "how do I let users
  fill fields with AI", "add a regenerate button", "inline AI actions", or any
  request about how users should interact with or direct AI in the product.
  Always use this skill before designing or recommending any AI interaction
  surface.
---

# AI Inputs Skill

This skill covers the full taxonomy of AI input patterns: how users direct,
refine, and control AI in a product. Use it to decide which pattern fits a
given use case and how to implement it well.

## Pattern Taxonomy

There are 13 distinct input patterns. Start by identifying which category the
use case falls into, then read the relevant section below.

| Pattern | Core purpose | When to reach for it |
|---|---|---|
| Open Input | Free-form natural language prompt | Discovery, chat, exploration |
| Madlibs | Structured variables in a template | Repeatable tasks, team consistency |
| Auto-fill | AI populates fields from context | Repetitive data, spreadsheets, forms |
| Inline Action | Preset actions on selected content | Spot edits without leaving flow |
| Inpainting | AI edits a specific region in-place | Surgical changes to generated content |
| Regenerate | Re-run same prompt for a new result | When output is close but not right |
| Expand | Extend content from a seed | Draft-to-full, clip-to-video |
| Restructure | Change structure, keep substance | Condense, reorder, extract, segment |
| Restyle | Change surface style, keep structure | Tone, palette, voice, genre |
| Chained Action | Multi-step connected prompts | Workflows, pipelines, agentic flows |
| Auto-fill (bulk) | Loop prompt across many records | Batch enrichment, bulk generation |
| Describe | Reverse-engineer a generation | Debug, reproduce, understand output |
| Summary | Faithful compression of source | Recaps, digests, meeting notes |
| Synthesis | Interpret and connect across sources | Research, analysis, insight generation |

---

## Pattern Details

### 1. Open Input
Free-form text box that lets users converse with or direct the model.

**Forms:** Chat box · Inline composer · Command + parameters · Side panel composer

**Core design rules:**
- Set a clear default scope. After the first prompt, make what the AI is acting on explicit so users don't accidentally regenerate the whole document when they mean one section.
- Treat blank canvas as a UX problem. Most users can't prompt well from scratch. Support with templates, example galleries, and suggested follow-ups.
- Don't hide parameters. Model selection, tone controls, and mode toggles should stay accessible after the first prompt, not just on it.
- Handle limit errors constructively — tell users what's missing and offer a fix, not a generic failure state.

**Pair with:** Madlibs (guide novices), Parameters (precision), Inline Action (scoped edits)

---

### 2. Madlibs
Template-style input with named variables users fill in. The AI receives the assembled prompt.

**Best for:** PRDs, release notes, outreach emails, any repeatable structured generation.

**Core design rules:**
- Make critical vs. optional variables visually distinct. Don't make users fill in 12 fields when 3 do the work.
- Show the underlying prompt structure to power users. Hiding it feels magical but blocks learning.
- Design for reuse across a team. Variables should map to brand-level constants (tone, audience, product name) so they only need setting once.
- Think multi-step: a Madlibs brief can pass its output as a variable into the next step (outline → draft → email).

**Pair with:** Chained Action (carry variables forward), Templates (prompt library)

---

### 3. Auto-fill
AI runs a prompt across multiple fields or records at once, from a single instruction.

**Forms:**
- **Inline ghost text** — predictions as the user types
- **Prompt replication** — extends one prompt across rows (spreadsheet-style)
- **Form completion** — extracts from text into structured fields
- **Cross-surface transfer** — e.g., meeting transcript → action item tracker

**Core design rules:**
- Always show a sample before bulk-filling. Run 2–3 records first, let users verify, then apply to the rest.
- Never overwrite existing human-written content without confirmation.
- Visually distinguish AI-filled fields from manually written ones until the user accepts.
- For large fills, gate behind a verification step.

**Pair with:** Sample Response (preview before bulk run), Verification (human gate), Chained Action (as a workflow step)

---

### 4. Inline Action
Preset AI actions that appear when content is selected or highlighted.

**Types of inline actions:**
- Suggested prompts → open a new thread
- Restructuring actions → rewrite, reframe, adjust structure
- Restyling actions → change tone or aesthetic
- Transformational actions → change modality (text → audio)

**Core design rules:**
- Show 3–5 high-value defaults (shorten, expand, translate, fix). Keep the list short and contextual.
- Actions should adapt to context — what's relevant in a code editor differs from a document editor.
- Always preview the result inline before overwriting. Require explicit acceptance.
- Support granular scope: word, sentence, paragraph, block.

**Pair with:** Inpainting (for richer region-based edits), Verification (accept/reject), Transform (modality shift)

---

### 5. Inpainting
User selects a region of content; AI edits only that region without touching the rest.

**Works across:** Text (highlight → edit), Images (brush → reprompt), Audio (time selector → regenerate section), Code (select function → replace)

**Core design rules:**
- Provide both rough (brush, auto-select) and precision (lasso, feathering) selection tools.
- Let users adjust the prompt, model, and parameters before committing.
- Blend edits with surrounding context. Let users widen or narrow the context window.
- Offer variations — the model may not nail it on the first try.
- Always verify before overwriting original content.

**Pair with:** Inline Action (trigger inpainting from selection), Verification (commit gate), Variations (compare options)

---

### 6. Regenerate
Re-runs the same prompt + context through the model to produce a new result.

**Modes:**
- **Overwrite** — replaces the previous output (common in chat)
- **Branching** — creates a parallel version (canvas tools, editors)

**Guided forms:**
- **Parameterized** — adjust a setting before rerunning (model, length, tone)
- **Seeded** — use a seed to control randomness and reproduce closely

**Core design rules:**
- Make it clear whether regeneration will overwrite or branch before the user clicks.
- Keep previous results recoverable (version history, variant cycling).
- For creative/exploratory work, support multiple simultaneous branches.
- For convergent work (coding, support), make it fast and single-click.
- Regenerate on error silently should be transparent — tell the user what happened.

**Pair with:** Variations (compare), Draft Mode (iterate cheaply), Randomize (unguided exploration)

---

### 7. Expand
Builds on an existing piece of content without replacing or altering the original seed.

**By medium:**
- **Images** — extend to new aspect ratio or artboard size
- **Video** — add frames to a clip using a script or artboard
- **Audio** — add intro/outro/section without touching existing track
- **Text** — deepen a draft or lengthen an outline
- **Code** — extend a function or add functionality from a snippet
- **Prompts** — turn a short instruction into a full, structured prompt

**Core design rules:**
- Keep the original seed visually intact and distinguished from the expansion.
- Let users scope expansion — a paragraph, a region, a clip segment — not just the whole thing.
- Show how much more is coming before it runs (word count, duration, size delta).
- Highlight what was added so users can diff at a glance.
- Surface compute/token cost early for large expansions.

**Pair with:** Variations (branch expansions), Draft Mode (cheap early iterations), Open Input (prompt the expansion)

---

### 8. Restructure
Changes the structural form of content while keeping its substance intact.

**Types:**
- **Condensing** — shorter while keeping key points (summarize, remove filler)
- **Expanding** — fuller with more detail or context
- **Reordering** — change sequence without changing content
- **Perspective shifting** — rewrite for a different audience or POV
- **Extraction** — pull specific elements (action items, quotes, data)
- **Aggregation** — combine multiple sources into a coherent structure
- **Segmentation** — break large content into smaller units
- **Substitution** — swap elements without rewriting the whole thing

**Core design rules:**
- Use preset labels ("Make shorter", "Extract action items") — don't make users construct restructure prompts from scratch.
- Support nuance with sliders where applicable (reading level, compression ratio).
- Show a diff or highlight what changed before committing.
- Keep stylistic tokens intact: restructure changes form, not voice.
- Allow undo or variant comparison.

**Pair with:** Inpainting (target to a region), Variations (compare before committing)

---

### 9. Restyle
Changes the surface style of content — tone, voice, palette, aesthetic — while leaving structure and meaning intact.

**By medium:**
- **Writing** — tone, register, brand voice
- **Images** — palette, style reference, artistic filter
- **Audio** — genre, vocal style, noise profile
- **Code/UI** — align to design tokens or linting rules

**Core design rules:**
- Keep a hard separation: restyle actions should not restructure. If they do both, that's Restructure.
- Offer preset styles with visual examples. Don't make users imagine what "cinematic" means.
- Provide intensity controls (slight / medium / strong), not binary on/off.
- Support style cloning — let users capture a style from one piece and apply it to another.
- For teams: expose style tokens in galleries to encourage sharing and consistency.

**Pair with:** Memory (persist style choices across sessions), Preset Styles (gallery), Transform (when modality needs to change too)

---

### 10. Chained Action
Connects multiple prompts, tools, and inputs in a structured sequence. Each step's output feeds the next.

**Forms:**
- **Linear chain** — A → B → C
- **Branching chain** — A → B + C (variants)
- **Convergent chain** — A + B → C (blend two inputs)
- **Side-by-side** — A → B and A → C in parallel for comparison
- **Cross-modal** — text → image → video

**Core design rules:**
- Educate through copy. Show users how to inject references and variables at each step. Most users don't know how to chain prompts.
- Make onboarding hands-on. Let users build a working multi-step chain during onboarding, not just read about it.
- Show compute cost per step and in total. Model changes affect cost — make this visible.
- Support lightweight test runs at the step level and the whole-flow level before going live.
- Allow natural language to build chains: "I want to summarize customer feedback and turn it into a feature brief."
- Show errors with context — not just "generation failed" but which step, why, and what to try.

**Pair with:** Madlibs (inject variables at each step), Sample Response (test before publishing), Verification (gate steps on human review)

---

### 11. Describe
User-invoked action that reverse-engineers a generated output into its likely prompt, parameters, and tokens.

**Typical triggers:** Right-click menu · Side panel button · `/describe` command

**Core design rules:**
- If the original prompt is stored, show that first — don't infer when the exact data exists.
- Default to a compact view; let power users expand to see full parameter logs.
- Return 3–4 materially different descriptions, not a long list of near-duplicates.
- Include only parameters that actually change reproduction in your system.
- Make descriptions immediately actionable: one click to send a description into the prompt field as a new generation.

**Pair with:** Prompt Enhancer (iterate on described prompts), Prompt Details (surface details proactively in galleries)

---

### 12. Summary
Faithfully condenses source material to make it easier to understand and act on. No new interpretation introduced.

**Difference from Synthesis:** Summary = compression. Synthesis = interpretation + patterns across sources.

**Core design rules:**
- Prioritize fidelity over brevity. Shorter must still mean true.
- Make scope explicit — users need to know what's included and what's not.
- Use automatic summaries cautiously for opinionated content (news, social) — they can distort tone.
- Offer granularity presets: "short", "detailed", "key points only".
- Attach citations inline so users can verify without leaving the summary view.
- In legal/scientific contexts, offer a "quote and condense" mode that preserves exact phrasing.

**Pair with:** Citations (verify source mapping), References (link to originals), Follow-ups (next steps from the summary)

---

### 13. Synthesis
Combines data from multiple sources and extracts patterns, themes, or insights. Introduces AI reasoning — this is the key distinction from Summary.

**Variants:**
- **Aggregated** — gathers + rephrases without deep interpretation (closest to summary)
- **Comparative** — aligns, contrasts, reconciles multiple viewpoints or datasets
- **Thematic** — extracts underlying patterns from a set (customer feedback, research notes)
- **Generative** — builds new interpretations or implications from references

**Core design rules:**
- Treat synthesis as a transparent process, not a polished result. Show grouping logic, evidence used, and how conclusions connect.
- Separate factual statements from inferred insights visually — different sections, different colors, different labels.
- Expose uncertainty. Use indicators like "limited support" or "conflicting data" rather than presenting all conclusions at equal confidence.
- For thematic synthesis, let users override groupings and labels before they're committed.
- For generative synthesis (most hallucination-prone), expose the full chain of reasoning steps.

**Pair with:** Stream of Thought (show reasoning), Citations (link claims to sources), Summary (when no interpretation is needed)

---

## Choosing the Right Pattern

Use this decision flow when the use case isn't immediately obvious:

```
Is the user starting from scratch or working on existing content?
├── Starting from scratch → Open Input, Madlibs, or Chained Action
└── Working on existing content →
    What scope?
    ├── Whole document/record → Regenerate, Restructure, Restyle, Summary, Synthesis
    ├── Specific region → Inpainting, Inline Action
    ├── Multiple fields/records → Auto-fill
    └── Building from a seed → Expand

Does the task repeat?
├── Yes, same structure → Madlibs or Auto-fill
└── No, one-off → Open Input or Inline Action

Is the goal to change structure or style?
├── Structure (condense, reorder, extract) → Restructure
├── Style (tone, palette, voice) → Restyle
└── Both → Restructure first, then Restyle

Is the user analyzing sources or compressing them?
├── Compressing faithfully → Summary
└── Interpreting and finding patterns → Synthesis
```

---

## Universal Implementation Principles

Regardless of which pattern you use:

1. **Always preview before committing.** For any action that modifies existing content, show a ghost/diff state that requires explicit accept — never overwrite silently.
2. **Mark AI-generated content distinctly.** Use a visual indicator (icon, color, label) on AI-generated values until the user confirms them.
3. **Make scope explicit.** Always communicate what the AI is acting on — a word, a field, a record, a document — before running.
4. **Show cost for bulk or chained actions.** When a pattern processes many records or steps, surface an estimate before running.
5. **Undo is non-negotiable.** Every AI input action that modifies content must be reversible.


---
name: ai-wayfinders
description: Apply Wayfinder patterns to design or improve AI onboarding, discoverability,
  and first-interaction flows in any product. Use this skill whenever the user wants to add AI
  to a product surface, reduce blank-slate anxiety, help users discover what the AI can do,
  improve an initial CTA or prompt input, add suggestions or templates, design a gallery, add
  nudges, or generally reduce friction at the start of an AI interaction. Trigger even on vague
  requests like "make it easier to get started with AI", "users don't know what to type",
  "how do we show what the AI can do", "add some example prompts", or "improve onboarding to
  our AI feature". Wayfinders are: Initial CTA, Example Gallery, Suggestions, Templates,
  Nudges, Follow-ups, Prompt Details, and Randomize.
---

# AI Wayfinders Skill

Wayfinders help users discover what the AI can do, get started without fear, and progressively
build confidence. They solve the blank-slate problem — the moment a user faces an empty input
and has no idea what to type.

Use this skill to **recommend, design, or critique** any product surface where users interact
with AI for the first time or need guidance about what's possible.

---

## The 8 Wayfinder Patterns

### 1. Initial CTA
**What it is:** The primary entry point — usually a prominent input box — where users first
engage with the AI.

**The problem it solves:** A bare text box puts the full burden of prompt engineering on the
user. Most people don't know how to phrase what they want; a short prompt rarely captures
real intent.

**How to strengthen it:**
- Surround the input box with scaffolding: suggestions, galleries, templates, mode selectors,
  attachments
- **Action-First CTA** — for workflow-driven products, present AI alongside familiar actions
  and let it emerge at the moment of leverage (e.g. after a document or record exists)
- **Contextual CTA** — waits until there's data to act on (a transcript, a filled form, a
  report) then surfaces AI as the natural next step
- **Playful CTA** — random prompts, examples, or whimsy lower pressure and invite exploration

**Key principle:** Don't surface an empty AI box on an empty state. The most reliable path is
to keep the input at the center but surround it with scaffolding that shifts the work from
prompt engineering toward selection and refinement.

---

### 2. Example Gallery
**What it is:** A curated or community collection of sample generations that shows users
what the product can do.

**Variants:**
- **Curated** — hand-picked by the team, best for first impressions and brand direction
- **Community** — user-submitted, good for engagement and authenticity
- **Dynamic** — algorithmically surfaced by user profile or activity

**Key traits of effective galleries:**
- Clear previews (thumbnails, snippets) — users scan fast and choose on first impression
- Organized by use case, theme, or popularity with search and filters
- Actionable: "Start from this", "Remix", "See prompt" — one click to use
- Mix polished highlights with everyday practical examples
- Expose the prompt behind each example (see Prompt Details pattern)
- Attribution and context (who made it, how many times remixed)

**Key principle:** A gallery should both inspire and instruct. Make every tile an entry point,
not just a showcase.

---

### 3. Suggestions
**What it is:** 3–5 pre-written prompts that appear near the input and can be clicked to
pre-fill or trigger the interaction.

**Three forms:**
- **Static** — fixed starters, consistent for all users, good for onboarding
- **Contextual** — update based on what's on screen (open document, selected item, mode)
- **Adaptive** — evolve from user behavior and preferences over time

**Design rules:**
- Clicking a suggestion should immediately run it or fill the input — not open a dialog
- Show 3–6 max; rank by relevance; retire low-engagement options over time
- Scope when they appear: onboarding, new context, idle state — not everywhere always
- Draw from what's on screen when possible rather than a static list

**Key principle:** Suggestions are most effective when contextual. A suggestion tied to the
current content is far more useful than a generic "Ask me anything" starter.

---

### 4. Templates
**What it is:** Pre-built prompt structures with fillable fields (variables, dropdowns,
@-mentions) that let users construct complex prompts without writing them from scratch.

**Why they matter:** Some tasks require long, specific prompts to produce reliable output.
Templates replace that burden with a short form — fill in a few fields, not a paragraph.

**Design rules:**
- Use variables, dropdowns, and @-mentions to minimize manual input
- Chain templates together across workflow steps (each step feeds the next)
- Keep references to source material (citations, attached context) visible
- Don't force templates on simple tasks — only use when the task is complex or repeatable
- Give users the option to adjust after the template runs, not just before

**Key principle:** Templates work best when the task has a predictable shape. Any tool that
requires a long and specific prompt to get a reliable outcome is a strong candidate.

---

### 5. Nudges
**What it is:** Contextual hints, buttons, or banners that surface AI capabilities at the
moment they're most relevant — without requiring the user to seek them out.

**Three use cases:**
- **In-app clues** — inline AI buttons, suggestion banners, toolbar options that teach users
  what's possible as they work
- **Engagement flags** — appear after a threshold (e.g. enough content exists) to unlock
  richer AI capabilities that require context to be useful
- **Feature onboarding** — introduce new AI capabilities progressively as they become
  available or relevant to the user's current activity

**Design rules:**
- Nudges must be contextual — "Summarize" on an empty page is noise; on a long document
  it's immediately valuable
- Never show a blanket list of all AI features — prioritize by relevance to the current state
- Don't make nudges feel like upsells — if a feature is gated, say so upfront
- Use nudges to build user skills over time, not permanent dependence

**Key principle:** A good nudge is tied to user intent and content state. Too many nudges
crowd the surface and reduce trust. Prioritize the actions most likely to be relevant right now.

---

### 6. Follow-ups
**What it is:** Prompts, questions, or inline actions that help users refine or extend their
initial interaction — picking up where the first generation left off.

**When to use:**
- **Open-ended tasks** — probe deeper into user needs before generating
- **Compute-heavy tasks** — clarify intent *before* a long generation to avoid wasted effort
- **After generation** — suggest what to do next with the result

**Forms:**
- Conversation extenders — what else to explore
- Clarifying questions — "Do you want results for Europe only?"
- Depth probes — "Should I expand the budget section or just summarize it?"
- Action nudges — "Want me to draft an email from this?"
- Export nudges — "Generate a slide from this summary?"

**Design rules:**
- Anchor follow-ups in what just happened — reference the last output specifically
- Show why the follow-up is relevant (not arbitrary automation)
- Keep the list small (2–4); mix "zoom in" and "zoom out" options
- Let users regenerate the suggestion list to explore other directions
- Visually separate follow-ups from the main output

**Key principle:** A well-timed follow-up communicates that the AI is working *alongside*
the user rather than making them start over.

---

### 7. Prompt Details
**What it is:** Making the prompt (and parameters) that produced a result visible alongside
the output — in galleries, feeds, or shared views.

**Why it matters:** Users can learn by reverse-engineering what worked. They can remix, copy,
and build on prompts rather than starting from scratch.

**What to expose:**
- The prompt itself
- Negative prompts (if applicable)
- Model name/version
- Key parameters (length, format, style, seed)
- Referenced attachments with their purpose labeled

**Design rules:**
- Make prompt text one-click to copy or send to input
- Default to visible in discovery and community contexts
- Give creators control to hide their prompts
- Group parameters separately from the prompt text
- Make details interactive — clicking a token or tag adds it to the input

**Key principle:** In a generative setting, prompt details can be action triggers themselves,
not just informational. Visibility accelerates learning and reduces the "I don't know what
to type" problem for new users.

---

### 8. Randomize
**What it is:** A one-click action (often a dice icon) that fills the input with a random
prompt, seed, or style — lowering the bar to entry through play.

**When it's useful:**
- Creative or generative tools where exploration is the goal
- Onboarding moments where users feel blocked or anxious
- Demonstrating the range and personality of what the product can produce

**Design rules:**
- Constrain the random set — curate what's possible so results are delightful, not harmful
- Make it one click, no setup required
- Apply it beyond prompts: randomize styles, parameters, or suggestions
- Use it as a warm-up on-ramp, then guide users toward templates for reliable output

**Key principle:** Delight can be scaffolding too. Randomize turns curiosity into confident
iteration without requiring the user to know anything about prompt engineering.

---

## Decision Framework: Which Wayfinder(s) to Use?

| Situation | Recommended patterns |
|---|---|
| Empty state, user has nothing yet | Initial CTA + Suggestions + Gallery |
| User has content/data but hasn't used AI | Nudges (contextual) + Follow-ups |
| Complex task requiring structured input | Templates |
| User doesn't know what's possible | Gallery + Prompt Details + Nudges |
| After first AI output | Follow-ups + Suggestions |
| Onboarding a new user | Suggestions (static → contextual) + Templates |
| Creative or exploratory tool | Randomize + Gallery + Prompt Details |
| Returning power user | Adaptive Suggestions + Follow-ups |

---

## Universal Principles

1. **Wait for context.** Don't surface AI on an empty state. Let it emerge when there's
   something to act on — content, data, a document, a selection.

2. **Prefer contextual over static.** Wayfinders tied to what's currently on screen are
   always more useful than generic starters.

3. **Reduce, don't overwhelm.** Show fewer, more targeted options — not a menu of every
   capability. Cognitive load is the enemy of first use.

4. **Teach through doing.** Every nudge and suggestion should model what a good prompt
   looks like so users build their own prompting intuition over time.

5. **Expose the reasoning.** Prompt details and follow-up context help users trust outputs
   by understanding how they were produced.

6. **Spend compute wisely.** Structure the input and scaffolding so the system isn't forced
   to guess at vague intent — compute should refine, not search.

---

## Output Format

When applying this skill, produce:

1. **Pattern recommendation** — which wayfinder(s) fit the situation and why
2. **Concrete UI copy** — actual suggestion text, nudge labels, template field names,
   follow-up options
3. **Placement guidance** — where on the screen or in the flow to surface it
4. **Anti-patterns to avoid** — what not to do on this specific surface
5. **Implementation notes** (if requested) — component structure, interaction behavior,
   state conditions that trigger the pattern


---
name: ux-research-methods
description: Guide selecting the right UX research method for a given situation. Use this skill whenever the user asks which research method to use, how to plan UX research, what research to do at a given product stage, how to study user behavior vs. attitudes, how to pick between qualitative and quantitative approaches, or whether to run interviews, usability tests, surveys, A/B tests, or any other UX research technique. Also trigger when the user describes a research question and wants a recommendation, or when they ask about the tradeoffs between specific methods. Trigger even if the user just says "what research should I do" or "how do I learn more about my users" without naming specific methods.
---

# UX Research Methods Advisor

## Purpose
Help teams choose the right UX research method based on their situation. Recommendations are driven by three dimensions: **attitudinal vs. behavioral**, **qualitative vs. quantitative**, and **context of product use** — plus the **phase of product development**.

---

## Step 1: Understand the Situation

Before recommending, clarify the following (ask if not stated):

1. **What question are you trying to answer?**
   - Why is something happening / how to fix it → qualitative
   - How many / how much → quantitative
   - What users say they think/want → attitudinal
   - What users actually do → behavioral

2. **What stage is the product in?**
   - Strategize (early, finding direction)
   - Design (improving a specific flow or feature)
   - Launch & Assess (measuring performance, comparing)

3. **Do you need users interacting with the product?**
   - Natural use (observing real behavior)
   - Scripted use (specific tasks/flows)
   - Limited/abstracted (concepts, IA, card sorting)
   - No product (brand perception, concept validation)

4. **What constraints exist?**
   - Timeline and budget
   - Access to participants
   - Remote vs. in-person

---

## Step 2: Apply the Three-Dimensional Framework

### Attitudinal ↔ Behavioral

| Want to know... | Lean toward |
|---|---|
| What users believe, prefer, or say they'd do | **Attitudinal** (surveys, interviews, focus groups) |
| What users actually do with the product | **Behavioral** (A/B testing, analytics, eyetracking) |
| Both | **Mixed** (usability testing, field studies) |

### Qualitative ↔ Quantitative

| Want to know... | Lean toward |
|---|---|
| Why something happens, insights, nuance | **Qualitative** (interviews, field studies, usability testing) |
| How many, how often, statistical confidence | **Quantitative** (surveys, A/B testing, analytics) |
| Both | Card sorting, concept testing, unmoderated testing |

### Context of Product Use

| Context | When to use | Example methods |
|---|---|---|
| Natural use | Understand real behavior without interference | Field studies, analytics, intercept surveys |
| Scripted use | Evaluate specific flows or features | Usability testing, benchmarking |
| Limited/abstracted | Test IA, concepts, or design alternatives | Card sorting, tree testing, participatory design |
| No product | Brand or concept perception | Focus groups, desirability studies |

---

## Step 3: Match to Product Development Phase

### 🔍 Strategize — Find directions and opportunities
**Goal:** Understand users, discover needs, generate ideas

Best methods:
- **Field studies** — observe users in their real environment
- **Diary studies** — longitudinal, user-recorded behavior/attitudes
- **Interviews** — in-depth one-on-one exploration
- **Surveys** — discover and measure attitudes at scale
- **Participatory design** — co-create with users
- **Concept testing** — validate whether an idea meets a need

### 🎨 Design — Improve usability and design quality
**Goal:** Identify and fix problems in the experience

Best methods:
- **Card sorting** — define or validate information architecture
- **Tree testing** — verify navigation structure
- **Usability testing** (moderated) — observe task completion, find friction
- **Remote moderated testing** — same as above, done remotely
- **Unmoderated testing** — scalable task-based testing without a moderator

### 📊 Launch & Assess — Measure and compare performance
**Goal:** Benchmark against prior versions or competitors

Best methods:
- **Usability benchmarking** — precise performance metrics across participants
- **Unmoderated testing** — scalable summative evaluation
- **A/B testing** — scientifically test design variants on live traffic
- **Analytics / Clickstream analytics** — measure actual behavior at scale
- **Surveys** — measure satisfaction and attitudes post-launch

---

## Step 4: Method Reference

| Method | Attitudinal/Behavioral | Qual/Quant | Best phase |
|---|---|---|---|
| Usability testing | Both | Qualitative | Design |
| Field studies | Both | Qualitative | Strategize |
| Contextual inquiry | Both | Qualitative | Strategize |
| Participatory design | Attitudinal | Qualitative | Strategize |
| Focus groups | Attitudinal | Qualitative | Strategize |
| Interviews | Attitudinal | Qualitative | Strategize |
| Eyetracking | Behavioral | Qualitative/Quant | Design |
| Usability benchmarking | Behavioral | Quantitative | Launch & Assess |
| Remote moderated testing | Both | Qualitative | Design |
| Unmoderated testing | Both | Both | Design / Launch |
| Concept testing | Attitudinal | Both | Strategize |
| Diary studies | Both | Qualitative | Strategize |
| Customer feedback | Attitudinal | Both | Any |
| Desirability studies | Attitudinal | Both | Design |
| Card sorting | Attitudinal | Both | Design |
| Tree testing | Behavioral | Quantitative | Design |
| Analytics | Behavioral | Quantitative | Launch & Assess |
| Clickstream analytics | Behavioral | Quantitative | Launch & Assess |
| A/B testing | Behavioral | Quantitative | Launch & Assess |
| Surveys | Attitudinal | Quantitative | Any |

---

## Output Format

When making a recommendation, structure the response as:

1. **Recommended method(s)** — with a brief rationale
2. **Why this fits** — reference the relevant dimension(s) and phase
3. **What you'll learn** — what question it answers
4. **Watch out for** — key limitation or pitfall of this method
5. **Also consider** — 1–2 complementary methods if relevant

Keep recommendations concrete and actionable. If multiple methods fit, help the user prioritize by constraints (time, budget, access to users).

---

## Common Traps to Avoid

- **Only using one method**: Most projects benefit from combining methods (e.g., interviews to generate hypotheses, then surveys to validate at scale).
- **Confusing attitudinal and behavioral**: What users say they do and what they actually do often diverge. When behavior matters, prioritize behavioral methods.
- **Using qualitative methods to get quantitative answers**: A usability test with 5 participants can't tell you what % of users have a problem — it tells you *why* they do.
- **Using surveys to diagnose why**: Surveys tell you *what* and *how many*, not *why*.
- **Running benchmarking too early**: Summative methods require a stable product to produce meaningful metrics.


---
name: journey-mapping
description: Create, structure, and facilitate user journey maps from scratch or from existing research.
  Use this skill whenever a user wants to map a user experience, visualize a customer flow, identify pain points across a process, or build a journey map artifact. Trigger on phrases like "create a journey map", "map out the user experience", "visualize a user flow", "identify pain points in our process", "map the customer journey", "help me understand our user's experience", or any request involving understanding or documenting how a person moves through a product, service, or scenario — even if they don't say "journey map" explicitly. Also trigger when someone wants to understand the difference between journey maps, experience maps, service blueprints, or user story maps.
---

# Journey Mapping Skill

A skill for helping teams create, structure, and use journey maps to understand and improve user experiences.

---

## What Is a Journey Map?

A journey map is a visualization of the process a person goes through to accomplish a goal. It starts by compiling user actions into a timeline, then layers in thoughts and emotions to build a narrative — ultimately becoming a polished visual artifact.

Journey maps are used to:
- Build shared understanding across teams
- Surface moments of frustration and delight
- Identify opportunities to improve the experience
- Communicate user insights in a memorable, concise way

---

## The 5 Key Components

Every journey map — regardless of format — should include these elements:

### 1. Actor
The specific persona or user the map is about. One map = one point of view.
- Ground the actor in real research/data
- If multiple user types exist, create separate maps for each
- Example: "Jumping Jamie, a mid-career professional switching mobile plans"

### 2. Scenario + Expectations
Defines the situation and what the actor is trying to achieve.
- Can be real (existing product) or anticipated (design stage)
- Best for experiences with sequence, process, or multiple channels
- Example: "Switching mobile plans to save money; expects to easily find all info needed"

### 3. Journey Phases
High-level stages that organize the rest of the map. Examples by context:
- **E-commerce**: Discover → Try → Buy → Use → Seek Support
- **Big purchases**: Engagement → Education → Research → Evaluation → Justification
- **B2B tools**: Purchase → Adoption → Retention → Expansion → Advocacy

### 4. Actions, Mindsets, and Emotions
For each phase, capture:
- **Actions**: What the user does (narrative, not exhaustive step-by-step)
- **Mindsets**: Thoughts, questions, motivations — ideally in the user's own words from research
- **Emotions**: Plotted as a curve across phases — where are the highs and lows?

### 5. Opportunities
Insights drawn from the map that answer:
- What needs to change?
- Who owns each change?
- Where are the biggest opportunities?
- How will improvements be measured?

---

## How to Create a Journey Map (Step by Step)

### Step 1: Define the Actor and Scenario
Ask the user:
- Who is this map for? (persona, user type)
- What goal are they trying to achieve?
- What are their expectations going in?

### Step 2: Identify the Journey Phases
Work with the user to define 4–6 high-level stages. Use existing data if available. If not, reason from the scenario using common phase structures above.

### Step 3: Fill In the Timeline
For each phase, gather or infer:
- What actions does the user take?
- What are they thinking or asking at this point?
- How are they feeling? (frustrated, confident, confused, delighted?)

### Step 4: Plot the Emotion Curve
Draw a single emotional line across all phases. Mark peaks (moments of delight) and valleys (moments of friction or frustration).

### Step 5: Surface Opportunities
At the bottom of the map, list insights and opportunities per phase. Assign ownership where possible.

---

## Output Format

When producing a journey map artifact, structure it like this:

```
ACTOR: [Persona name + brief description]
SCENARIO: [What they're trying to do + key expectations]

PHASE 1 | PHASE 2 | PHASE 3 | PHASE 4 | PHASE 5
---------|---------|---------|---------|----------
Actions  | Actions | Actions | Actions | Actions
Mindsets | Mindsets| Mindsets| Mindsets| Mindsets
Emotions ↗        ↘        ↗         ↘        ↗

OPPORTUNITIES:
- [Phase 1]: ...
- [Phase 2]: ...
```

Adapt format to the medium (table, visual diagram, written narrative, etc.) based on what the user needs.

---

## Related Methods (Know the Difference)

| Method | Scope | Perspective | Purpose |
|---|---|---|---|
| **Journey Map** | Specific actor + product/service | User | Understand a specific experience |
| **Experience Map** | Generic human behavior | Human | Understand broader behavior before a product exists |
| **Service Blueprint** | Same journey, behind the scenes | Business | Understand internal processes that support the journey |
| **User Story Map** | Feature-level | Product team | Plan and implement specific features in Agile |

A common sequence: Experience Map → Journey Map → Service Blueprint → User Story Map

---

## Facilitation Tips

- **One map, one actor.** Resist the temptation to combine multiple personas.
- **Root actions and mindsets in real data.** Use user verbatims when possible.
- **The emotion curve is the heart of the map.** If it's flat, dig deeper.
- **Phases should feel natural.** If stakeholders debate what they're called, the phases aren't right yet.
- **The goal is alignment, not perfection.** The conversation during mapping is often as valuable as the artifact.

---

## Common Mistakes to Avoid

- Making it too granular (journey maps are narrative, not click-by-click logs)
- Having multiple actors on one map
- Skipping the emotion layer
- Creating the map without user research to back it up
- Treating it as a one-time artifact rather than a living document


---
name: dieter-rams-principles
description: Evaluate and improve digital product design using Dieter Rams' 10 Principles of Good
  Design, translated for software, apps, and UI. Use this skill whenever a user wants a principled
  critique of a screen, flow, feature, or whole product — or wants guidance on making something
  feel more considered, restrained, and timeless. Trigger on phrases like "is this good design",
  "critique this using Rams", "10 principles of good design", "make this more minimal", "review my
  UI against design principles", "does this feel over-designed", "is this honest design", "how do
  I simplify this product", or any request to judge a digital product against a durable standard of
  design quality. Also trigger when a user shares a mockup, screenshot, or shipped screen and asks
  whether it is well designed. Always use this skill to structure principle-based critique instead
  of giving unanchored opinions.
---

# Dieter Rams' 10 Principles of Good Design — for Digital Products

Dieter Rams distilled decades of industrial design into ten principles of what makes design *good*. They were written for physical objects, but they translate directly to software — where they are a defense against feature bloat, dark patterns, trend-chasing, and decoration masquerading as design.

Use them as a lens: score a product against each principle, name the strongest violation, and give a concrete change.

---

## The 10 principles, translated for software

### 1. Good design is innovative
Innovation follows real advances in technology and understanding — it is never novelty for its own sake.
- **Digital:** New capability (AI, real-time sync, on-device compute) should unlock a genuinely better job-to-be-done, not just a new visual gimmick or a trend copied from a competitor.
- **Smell:** "AI" bolted on with no user benefit; animations that impress in a demo but slow the daily path.

### 2. Good design makes a product useful
Design serves the primary function first; everything else is subordinate. Aesthetics never override utility.
- **Digital:** The core task should be the fastest, clearest path in the product. Secondary features must not crowd it.
- **Smell:** The main action buried under upsells, promos, or engagement bait.

### 3. Good design is aesthetic
Well-made things are pleasant to use; beauty and usability are inseparable, not a trade-off.
- **Digital:** Consistent spacing, restrained type scale, deliberate color, real content — craft the user *feels* even if they can't name it.
- **Smell:** Arbitrary spacing, competing font sizes, decoration with no function.

### 4. Good design makes a product understandable
The product explains itself. At best it is self-explanatory; the structure makes the function clear.
- **Digital:** Clear information hierarchy, honest labels, obvious affordances, states that communicate what happened and what's next. No manual required.
- **Smell:** Mystery-meat icons, ambiguous CTAs, users guessing what a control does.

### 5. Good design is unobtrusive
Products are tools, not decoration or self-expression. Design leaves room for the user's own purpose.
- **Digital:** The interface recedes so the user's content and task take the foreground. Restraint over showmanship.
- **Smell:** Attention-grabbing UI, needless motion, interruptions that serve the business, not the user.

### 6. Good design is honest
It does not make a product seem more innovative, powerful, or valuable than it is. It makes no promises it can't keep.
- **Digital:** No fake urgency, no disguised ads, no dark patterns, no manipulative defaults. Loading and progress reflect reality. This is the principle most often violated in software.
- **Smell:** Countdown timers that reset, "1 left in stock" fabrications, pre-checked opt-ins, roach-motel cancellation.

### 7. Good design is long-lasting
It avoids being fashionable and therefore never appears antiquated. It lasts for years.
- **Digital:** Favor durable patterns and a system over trend-driven styling (skeuomorphism, then flat, then glassmorphism…). Design tokens and clear structure age better than a look.
- **Smell:** A redesign chasing the current trend that will feel dated in two years.

### 8. Good design is thorough down to the last detail
Nothing is arbitrary or left to chance. Care and accuracy show respect for the user.
- **Digital:** Empty states, error states, loading states, edge cases, long strings, zero/one/many, focus order, keyboard paths — all designed, not defaulted.
- **Smell:** Polished happy path, broken empty state; "lorem ipsum" shipped; untranslated error codes.

### 9. Good design is environmentally friendly
It conserves resources and minimizes physical and visual pollution.
- **Digital:** Performance and efficiency — small payloads, fewer requests, less battery and data. Also *attention-friendly*: it doesn't pollute the user's focus with noise and notifications.
- **Smell:** Bloated bundles, autoplay everything, notification spam competing for attention.

### 10. Good design is as little design as possible
Less, but better — concentrate on the essential, so the product is not burdened with non-essentials. Back to purity, back to simplicity.
- **Digital:** Remove before you add. Every feature, field, option, and pixel must earn its place. The strongest edit is usually a deletion.
- **Smell:** Settings no one uses, five ways to do one thing, a dashboard of vanity metrics.

---

## Process

### Reviewing a digital product against the principles

1. **Establish the job.** What is this product/screen primarily *for*? Principles 2 and 10 depend on knowing the core task.
2. **Score each principle** — Strong / Adequate / Weak. Don't force all ten; note which are most relevant to what you're reviewing.
3. **Name the top 2–3 violations** — the principles where fixing it would most improve the product. Honesty (6), understandability (4), and "as little as possible" (10) are the most common failures in software; check them first.
4. **Give a concrete change per violation** — not "simplify this" but "remove the three secondary CTAs so the primary action is the only filled button".
5. **Name what to keep** — call out where the product already honors a principle, so it isn't lost in the next iteration.

---

## Output format

Always present a Rams review in this structure:

```
DIETER RAMS REVIEW — [Product / Screen]
Core job: [what this is primarily for]

SCORECARD
 1. Innovative          [Strong / Adequate / Weak] — [one line]
 2. Useful              [ … ]
 3. Aesthetic           [ … ]
 4. Understandable      [ … ]
 5. Unobtrusive         [ … ]
 6. Honest              [ … ]
 7. Long-lasting        [ … ]
 8. Thorough            [ … ]
 9. Efficient/clean     [ … ]
10. As little as possible [ … ]

⚠ TOP VIOLATIONS
1. [Principle] — [what's wrong] → [concrete change]
2. [Principle] — [what's wrong] → [concrete change]

✓ KEEP
• [what already honors the principles]

▶ THE ONE EDIT
[If you change one thing, change this — usually a deletion.]
```

---

## Using the principles generatively (not just for critique)

When designing something new, run the principles forward:
- **Start from 2 and 10:** what is the essential job, and what is the least design that does it?
- **Pressure-test with 6:** would any part of this embarrass us if the user understood the business incentive behind it? Remove it.
- **Budget with 8:** list every state (empty, loading, error, edge) before calling a feature done.
- **Defend with 7:** choose a system and durable patterns over the current trend.

---

## Quality checks

Before delivering a Rams-based review, verify:
- [ ] The core job of the product is stated first
- [ ] Honesty (dark patterns), understandability, and minimalism were explicitly checked
- [ ] Each violation names a *concrete* change, not a vague instruction
- [ ] At least one "keep" is identified, not only problems
- [ ] Principles that don't apply to this artifact were skipped rather than forced
- [ ] The review ends with a single highest-leverage edit

---

## When to use Rams vs. other review skills

| Situation | Best fit |
|---|---|
| Judge overall design quality against a durable standard | **dieter-rams-principles** |
| "Is this over-designed / dishonest / bloated?" | **dieter-rams-principles** |
| Systematic usability audit of a flow | `ux-heuristics-review` |
| Cut friction and lift conversion on a specific screen | `cognitive-load-conversion` |
| Accessibility / WCAG compliance | `accessibility` |
| Visual-craft code rules (gradients, glow, transitions) | `craft` |

Rams is the "is this *good*?" lens — reach for it when the question is about design integrity and restraint, not a checklist audit of one flow.


---
name: ai-governors
description: Apply the Governors framework to design or audit human-in-the-loop features that keep users informed, in control, and safe as AI acts autonomously.
  Use this skill whenever someone is designing or reviewing AI product features involving oversight, trust, transparency, or control — including "how do I keep users in the loop", "how should I handle risky AI actions", "users don't trust the AI", "how do I prevent costly AI mistakes", "should I ask for confirmation before this action", "how do I show AI reasoning", "users are scared the AI will overwrite their data", "how do I handle AI memory and privacy", or any request about making an AI feature feel safe and controllable.
  Trigger even when the user doesn't say "governor" or "human-in-the-loop" — if they're designing any AI feature and the question touches on control, trust, transparency, cost, risk, or oversight, use this skill.
---

# Governors — Human-in-the-Loop Design Patterns

Governors are design patterns that keep users meaningfully in control as AI systems act on their behalf. They exist because autonomy without transparency erodes trust, and actions without oversight can cause irreversible harm.

## How to use this skill

When someone asks for guidance on AI oversight, transparency, or control:

1. **Understand the context**: What is the AI doing? How autonomous is it? What's the blast radius if something goes wrong?
2. **Identify the risks**: Use the Risk & Pattern Guide below to map the situation to the right patterns.
3. **Recommend specific patterns**: Give concrete, actionable guidance from the pattern reference.
4. **Flag tradeoffs**: Every Governor adds friction — help the user calibrate where oversight is worth the cost.

---

## Risk & Pattern Quick Guide

Use this to select the right Governor(s) for the situation:

| Situation | Recommended Pattern(s) |
|---|---|
| AI will take a long or expensive action | Action Plan + Verification + Cost Estimates |
| AI is acting autonomously in the background | Shared Vision + Stream of Thought + Controls |
| User needs to verify AI's intent before a destructive action | Verification + Sample Response |
| User is unsure what outcome they want yet | Variations + Branches + Draft Mode |
| AI cites or summarizes external/internal sources | Citations + References |
| AI remembers things across sessions | Memory |
| Generation will consume significant compute/credits | Cost Estimates + Draft Mode |
| AI acts in a multi-step workflow | Action Plan + Stream of Thought + Controls |
| User wants to explore multiple directions without committing | Branches + Variations |
| AI is running in agent/operator mode | Shared Vision + Verification + Stream of Thought |
| User wants to preview before full output | Sample Response + Draft Mode |

---

## The 13 Governor Patterns

### 1. Action Plan
**What it is**: AI lays out its intended steps before executing, giving users a chance to confirm or adjust.

**Two modes**:
- *Advisory*: Plan is shown in the stream of thought for orientation — no blocking confirmation required
- *Contractual*: Execution is gated on explicit user approval (use for high-compute or high-risk tasks)

**Key design guidance**:
- Show the plan before resources are committed — the right time to catch an error is before it runs
- Keep it skimmable: users should grasp intent in a few seconds
- Make it modifiable: let users fix errors in the plan without regenerating the whole thing
- Let experienced users bypass or collapse the plan
- Ensure fidelity between plan and execution — silent deviation destroys trust

**Real examples**: Replit pauses on a proposed sequence. Gamma generates an outline requiring confirmation. Cursor makes action plans optional in settings. Zapier shows a workflow outline in AI Drafting mode.

---

### 2. Branches
**What it is**: Multiple parallel paths of generation or exploration, each preserving the original context.

**Three forms**:
- *Text chat branches*: Split conversation into parallel threads
- *Variant branches*: Auto-generate multiple paths from the same source
- *Workflow branches*: Split a graph node so different parameter sets run side by side

**Key design guidance**:
- Maintain the source relationship — always provide a trail back to the origin
- Make branching a first-class action at obvious touchpoints (message actions, artifact tiles, nodes)
- Let each branch progress independently with a compact summary of inherited context
- Support lightweight merge patterns — "adopt this answer into main thread" — avoid destructive merges

**Real examples**: ChatGPT "Branch in new chat", TypingMind forked threads, FloraFauna visual canvas branches, Rivet convergent workflow branches, Midjourney variant exploration.

---

### 3. Citations
**What it is**: Connections from generated output back to its underlying source material.

**Four forms**:
- *Inline highlights*: Best for attached material like PDFs (Adobe Acrobat)
- *Direct quotations*: For transcripts and longer text (Granola)
- *Multi-source references*: For search/aggregation contexts (Perplexity)
- *Lightweight links*: For transparency-first use cases (Copy.ai)

**Key design guidance**:
- Point to exact passages when information is presented as factual; broader links when the goal is discovery
- Place citations where people expect them — inline for sentence-level claims, panels for long-form
- Offer hover preview so users can judge relevance without full navigation
- Make broken or missing citations explicit — never substitute filler content
- Let users rescope references after generation

**Real examples**: Adobe Acrobat paragraph-level citations, Granola transcript quotes on hover, Perplexity numbered inline sources, Sana popover with highlighted source passages.

---

### 4. Controls
**What it is**: UI mechanisms that let users stop, pause, and manage AI actions in flight.

**Common controls**:
- *Stop*: Ends the request immediately; work may be lost
- *Pause*: Stops without losing progress (essential for long-running coding agents)
- *Fast-forward*: Skip to end of long generations when the direction is clear
- *Queue*: Stack tasks for the AI to process sequentially

**Key design guidance**:
- Stop button should always be in the same place and remain clickable until generation completes
- Pause + resume is essential for long-running agentic tasks — don't force restarts
- Queue allows users to stay in the flow of work without canceling current tasks
- When regenerating, show the new version as an iteration — don't silently overwrite

**Real examples**: Claude's stop button, ChatGPT skip-to-end in research mode, Replit task queue, Perplexity interrupt-with-context while running, Julius step-by-step workflow runs.

---

### 5. Cost Estimates
**What it is**: Transparent display of compute/credit costs before and during generation.

**Key cost factors**: model size, prompt/context length, expected output length, steps in a workflow chain, inference loops.

**Credits vs. dollars**: Technical users prefer dollar values; non-technical users benefit from product-specific credit systems, but these lack cross-product comparability.

**Key design guidance**:
- Make the unit explicit (tokens, credits, seconds of video) and map to money where possible
- Show ranges for unknowns — present low/high estimates and update in real time during streaming
- Surface cost drivers (system prompt, context, tool calls, output) so users know what to trim
- Offer cheaper paths proactively: batch mode, draft mode, lower model tier
- Place estimates where decisions are made — inline at the prompt, per-step in builders, on action buttons

**Real examples**: Adobe Firefly credits beside generate button, ElevenLabs cost shown from input box, Krea credit estimate in builder sidebar, Udio live cost update as user configures.

---

### 6. Draft Mode
**What it is**: Lower-fidelity, lower-cost generation before committing to the full, expensive run.

**By modality**:
- *Image/video*: Lower-scaled previews (Midjourney, Runway)
- *Audio*: Short clips before full track (ElevenLabs)
- *Code/tools*: Plan previews or rough interfaces (Replit)
- *Text*: Outline before full document (Jasper, Gamma)
- *Presentations*: Slide outline before full deck (Chronicle, Gamma)

**Explicit vs. implicit drafting**:
- *Explicit*: A named "draft mode" — works well in visual media where quality reduction is visible and intentional
- *Implicit*: Fewer inference steps, snippet preview, or automatic cheaper model routing

**Key design guidance**:
- Never surprise users with lower quality — always signal that draft mode is active
- Describe what's reduced (model tier, steps, resolution, duration) alongside speed/cost impact
- Preserve seeds and parameters between draft and final — keep upgrade paths deterministic
- Keep "upgrade to full" one click away; design for rapid iteration loops
- Never silently route heavy tasks into draft quality without notice

---

### 7. Memory
**What it is**: AI retains and reuses information across sessions, creating continuity.

**Three scopes**:
- *Global memory*: Applies across all surfaces (ChatGPT's viewable memory)
- *Scoped memory*: Retained within a workspace, project, or conversation (Perplexity Spaces)
- *Ephemeral memory*: Session-only, no persistence (incognito-style)

**Risk**: Without clear controls, AI may misremember, overgeneralize, or accumulate incorrect details — a kind of "AI psychosis" from flawed recollections.

**Key design guidance**:
- Memory must never be a black box — show when new memories are added with a lightweight chip ("Saved to memory")
- Differentiate preferences (communication style) from facts (who the user is) — these may have different scopes
- Allow code switching: personal vs. work memory should not bleed into each other
- Make memories editable and deletable; support a clean "reset memory" option
- Support "memory off" / incognito mode for sensitive work

**Real examples**: ChatGPT inline memory capture notification, Gemini user-managed memory store.

---

### 8. References
**What it is**: The external materials AI retrieves and uses to shape output, made visible and manageable.

**Three layouts**:
- *Panel*: References grouped prominently beside content — best when sources are central to the user's goal
- *Hidden aside*: References in a tab or drawer — best when focus belongs on the answer (Perplexity, Notion)
- *Nested*: Sources grouped at top/bottom of content block with limited metadata — best in compact surfaces

**Key design guidance**:
- Make references easy to locate — place them consistently
- Match prominence to intent: panels for research tasks, drawers for answer-first contexts
- Show just enough metadata (favicon, title, maybe description) — balance detail with scannability
- Give users control over references after generation (add, remove, rescope to specific domains)
- Handle broken or missing sources explicitly — never substitute filler

**Real examples**: ChatGPT DeepResearch side panel, Perplexity inline citations + sources drawer, Notion hidden reference drawer, Glean nested sources in chat, Dia references hidden panel.

---

### 9. Sample Response
**What it is**: A full-quality, lightweight proof-of-concept output before committing to the full, costly run.

**Context-appropriate samples**: A single row in a table, a 30-second audio clip, a thumbnail image, a short paragraph before a full draft.

**Key distinction from Draft Mode**: A sample is full-quality on a small subset (confirms intent); Draft Mode is reduced-quality on the full scope (reduces cost).

**Key design guidance**:
- Show final-quality intent — the sample proves the AI understood the prompt correctly
- Let users skip the sample for subsequent runs once they trust the prompt
- Show cost-per-record and total run cost alongside the sample
- Default to sampling when risk or blast radius is high (many records, irreversible changes)
- Display the sample in a panel or overlay — don't write over existing content

**Real examples**: Notion's "try on this view" before full database autofill, Zapier single-record test before automation runs at scale.

---

### 10. Shared Vision
**What it is**: Ambient affordances that let users passively monitor and intervene in AI activity without disrupting its flow.

**Physical world analogies**: Tesla Autopilot LED indicators, GM Super Cruise steering wheel colors — subtle cues about AI state that don't demand attention.

**Key design guidance**:
- Warn users proactively: have the AI review needed permissions up-front, not mid-task, so interventions don't feel like surprises
- Don't let users conflate oversight with full security — prompt injection and other attack vectors still apply
- Let users constrain scope — limit shared view to a specific tab or frame, not full system access
- Signal boundaries visually and persistently with overlays, colored outlines, or tooltips showing the AI's field of view
- Include screenshots and specifics in the AI's stream of thought so users can audit retroactively

**Real examples**: Perplexity Comet tab glow when AI is active, ChatGPT Operator Mode live browser panel inside the conversation, Zapier human-in-the-loop workflow approval steps, Relay approval step types.

---

### 11. Stream of Thought
**What it is**: The visible trace of how the AI moved from input to answer — plans formed, tools called, decisions made.

**Three expressions**:
- *Human-readable plans*: What the AI intends to do (before)
- *Execution logs*: Tool calls, code run, results returned (during)
- *Compact summaries*: Logical reasoning, insights, decisions (after)

**Key design guidance**:
- Show the plan before acting — editable, with costs and required permissions surfaced early
- Separate plan, execution, and evidence — keep three views synchronized: will happen / happened / supports the result
- Tailor visibility to context: simple chat needs little; agentic coding or research tasks need full traces
- Make steps into states: queued → running → waiting for approval → completed / error
- Respect modality — in text, link outputs back to the step that created them; in voice, summarize the current action in one sentence

**Real examples**: ChatGPT inline reasoning trace, Perplexity steps tab above results, Lovable real-time action log, V0 inline logic then left-drawer build progress.

---

### 12. Variations
**What it is**: Multiple permutations of the AI's output for the user to compare and choose from.

**Three forms**:
- *Branched variations*: Multiple outputs from the same seed, shown in a grid (Midjourney, Krea, Adobe Firefly) — common for image/video
- *Convergent variations*: Inline alternatives where the user selects one to merge into the main content (GitHub Copilot, Copy.ai)
- *Preset variations*: Pre-defined transformations applied to the same content (Grammarly, Writer.com tone/length options)

**Key design guidance**:
- Keep follow-up actions close at hand — let users branch, select, or merge directly from the variant
- Allow additional generation from the same starting point if the first set misses
- Use parameters to give users control over variance (seed consistency, number of variants)
- Never overwrite the original without explicit confirmation — variations extend the workspace

**Real examples**: Adobe Firefly grid of variants with dropdown actions, Copy.ai inline variant selector, Writer.com preset transformations, FloraFauna canvas-based branching variations.

---

### 13. Verification
**What it is**: A required human approval step before the AI takes an action with meaningful negative consequences.

**When verification is warranted** (potential for real harm):
- Loss of reputation (poorly written email sent on behalf of the user)
- Loss of money (errant purchase or unexpected compute cost)
- Loss of security (shared personal or corporate data)
- Loss of work (overwritten records)
- Loss of time (errors requiring manual cleanup)

**When verification is not warranted**: Simple, low-risk, easily reversible tasks (running a search, drafting a message). Verification there creates prompt fatigue and becomes meaningless.

**Types of verification**:
- *Simple go/no-go*: Confirm an action plan or sample response before proceeding
- *Proactive platform rules*: System-enforced halts at sensitive moments (OpenAI Operator pauses before payment data)
- *User-configured rules*: User-defined conditions for when to stop — similar to Zapier/Relay human-approval workflow steps

**Key design guidance**:
- Match friction to risk: high-impact + irreversible = strong confirmation; routine = light check or post-hoc notification
- Use opt-out settings ("never show again") for repeated low-stakes confirmations
- Make clear when verification is skipped — show affordances and allow opt-back-in at any time
- Alert the user when action is needed — route approvals via Slack, email, or SMS to minimize stall time

**Real examples**: Cofounder agent "Always Ask" toggle with prominent red warning when disabled, Notion inline verification for data overwrites, Chronicle outline approval before presentation build, Replit action plan confirmation before build, Dovetail insight verification before research synthesis.

---

## Pattern Relationships

Governors work together. Common pairings:

- **Action Plan → Stream of Thought**: Plan sets expectation; stream tracks fidelity during execution
- **Action Plan → Verification**: Gate high-stakes plans behind explicit confirmation
- **Draft Mode → Cost Estimates**: Drafts save compute; show users exactly how much
- **Sample Response → Verification**: Confirm a sample before cascading it across many records
- **Shared Vision → Controls**: Users observing an agent need the ability to stop or intervene at any moment
- **Citations + References**: Citations point inline; References organize the full source set
- **Memory → Verification**: Before saving sensitive data to persistent memory, consider a confirmation step

---

## Calibrating friction vs. speed

The temptation is to add Governors everywhere. Resist it. Every confirmation adds friction, and prompt fatigue causes users to click through approvals reflexively — defeating their purpose.

Calibrate with two questions:
1. **What's the worst case if this goes wrong?** (reversible vs. irreversible, low-stakes vs. high-stakes)
2. **How often will this action occur?** (one-time vs. repeated, novel vs. familiar)

- High-stakes + infrequent → strong verification, visible stream of thought
- Low-stakes + frequent → passive indicators (shared vision) or skip governors entirely  
- High-stakes + frequent → provide opt-out settings after first confirmed run
- Low-stakes + infrequent → light check or confirmation after the fact



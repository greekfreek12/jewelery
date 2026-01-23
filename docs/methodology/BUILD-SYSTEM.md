# Development Methodology: Building SaaS Apps

A practical system for building, iterating, and scaling SaaS applications with AI assistance.

---

## Phase 0: Ideation & Discovery

**Goal**: Validate the idea before writing any code.

### What to Create
1. **Problem Statement** (1 paragraph)
   - Who has this problem?
   - How painful is it? (1-10)
   - How do they solve it today?

2. **Solution Hypothesis** (1 paragraph)
   - What's your unique approach?
   - Why will this work better?

3. **Target Customer Profile**
   - Industry/role
   - Company size
   - Budget range
   - Where they hang out online

### Validation Checklist
- [ ] Talked to 5+ potential customers
- [ ] Found 3+ competitors (good sign - market exists)
- [ ] Identified differentiation angle
- [ ] Pricing benchmark established

**Skip this if**: You're building for yourself or already have customers asking for it.

---

## Phase 1: Product Requirements Document (PRD)

**Goal**: Define what you're building clearly enough that anyone could build it.

### PRD Template

```markdown
# [Product Name] PRD

## Overview
- One-line description
- Target user
- Core value proposition

## Success Metrics
- Primary KPI (e.g., MRR, DAU)
- Secondary metrics
- What does "working" look like?

## User Stories (Prioritized)
### P0 - Must Have for Launch
- As a [user], I can [action] so that [benefit]

### P1 - Important but Not Blocking
- ...

### P2 - Nice to Have
- ...

## Features Specification
### Feature 1: [Name]
- Description
- User flow (numbered steps)
- Edge cases
- Acceptance criteria

## Technical Constraints
- Must use [tech] because [reason]
- Must integrate with [system]
- Performance requirements

## Out of Scope (Explicit)
- What we're NOT building
- Why it's deferred

## Open Questions
- Decisions that need to be made
- Who decides
```

### PRD Best Practices
- **Keep it living** - Update as you learn
- **Be explicit about scope** - "Out of scope" is as important as "in scope"
- **Include acceptance criteria** - How do we know it's done?
- **Prioritize ruthlessly** - P0 only for V1

---

## Phase 2: Technical Design

**Goal**: Architect the solution before coding.

### Design Document Template

```markdown
# [Feature] Technical Design

## Context
- What problem does this solve?
- Link to PRD section

## Proposed Solution
- High-level approach (2-3 sentences)
- Architecture diagram (if complex)

## Data Model
- New tables/fields
- Relationships
- Indexes needed

## API Design
- Endpoints
- Request/response shapes
- Error handling

## UI/UX
- Key screens (link to mockups)
- Component breakdown
- State management approach

## Security Considerations
- Auth/authz requirements
- Data validation
- Rate limiting

## Alternatives Considered
- Option A: [approach] - Rejected because [reason]
- Option B: [approach] - Chosen because [reason]

## Migration/Rollout Plan
- How to deploy safely
- Rollback strategy
- Feature flags?

## Open Questions
- Pending decisions
```

### When to Write a Design Doc
- New feature > 1 day of work
- Changes to data model
- New integrations
- Anything with security implications

---

## Phase 3: Build Phases

**Goal**: Deliver incrementally with working software at each phase.

### Phase Structure

```
Phase 1: Foundation (Week 1)
├── Project setup (framework, DB, auth)
├── Core data model
├── Basic UI shell
└── Deployment pipeline

Phase 2: Core Value (Weeks 2-3)
├── Primary user flow
├── The ONE thing that makes it useful
└── Enough polish to demo

Phase 3: Supporting Features (Weeks 4-5)
├── Secondary features
├── Settings/configuration
├── Admin tools

Phase 4: Polish & Launch (Week 6)
├── Error handling
├── Loading states
├── Mobile responsiveness
├── Analytics/tracking
```

### Phase Rules
1. **Each phase = deployable product**
2. **Don't start Phase N+1 until Phase N works**
3. **Cut scope, not quality**
4. **Demo at end of each phase**

---

## Phase 4: Feature Development Workflow

**Goal**: Consistent process for adding features post-launch.

### Feature Workflow

```
1. Write Issue/Ticket
   - User story format
   - Acceptance criteria
   - Link to PRD/design doc

2. Branch Strategy
   - main (production)
   - feature/[name] (development)
   - Use git worktrees for parallel work

3. Development Loop
   ┌─────────────────────────────────┐
   │  Write failing test             │
   │         ↓                       │
   │  Implement feature              │
   │         ↓                       │
   │  Test passes                    │
   │         ↓                       │
   │  Self code review               │
   │         ↓                       │
   │  Create PR                      │
   └─────────────────────────────────┘

4. PR Checklist
   - [ ] Tests pass
   - [ ] No console errors
   - [ ] Mobile responsive
   - [ ] Accessible
   - [ ] Matches acceptance criteria

5. Deploy
   - Preview deploy for review
   - Merge to main
   - Production deploy
   - Verify in production
```

### Feature Sizing
| Size | Time | Needs Design Doc? |
|------|------|-------------------|
| XS   | <2h  | No |
| S    | 2-8h | No |
| M    | 1-3d | Maybe |
| L    | 3-5d | Yes |
| XL   | >1w  | Yes, split it up |

---

## Phase 5: Testing Strategy

**Goal**: Ship with confidence.

### Testing Pyramid

```
         /\
        /  \      E2E Tests (few)
       /    \     - Critical user journeys
      /──────\    - Signup, payment, core flow
     /        \
    /          \  Integration Tests (some)
   /            \ - API endpoints
  /              \- Database operations
 /────────────────\
/                  \ Unit Tests (many)
                    - Utils, helpers
                    - Complex logic
```

### What to Test
- **Always**: Payment flows, auth, data mutations
- **Usually**: API endpoints, form validation
- **Sometimes**: UI components, edge cases
- **Rarely**: Styling, static content

### Testing Checklist per Feature
- [ ] Happy path works
- [ ] Error states handled
- [ ] Loading states shown
- [ ] Empty states shown
- [ ] Mobile works
- [ ] Auth required where needed

---

## Phase 6: Deployment & Operations

**Goal**: Ship fast, recover faster.

### Deployment Checklist
```
Pre-Deploy
- [ ] All tests pass
- [ ] Preview/staging verified
- [ ] Database migrations ready
- [ ] Environment variables set
- [ ] Feature flags configured

Deploy
- [ ] Deploy during low-traffic period
- [ ] Watch error monitoring
- [ ] Verify critical flows

Post-Deploy
- [ ] Check analytics
- [ ] Monitor performance
- [ ] Be ready to rollback
```

### Environment Strategy
| Environment | Purpose | Data |
|-------------|---------|------|
| Local | Development | Seed/mock |
| Preview | PR review | Test data |
| Staging | Pre-prod testing | Prod clone |
| Production | Users | Real |

---

## Phase 7: Iteration & Improvement

**Goal**: Continuously improve based on data.

### Feedback Loop

```
        ┌──────────────────────────────────┐
        │                                  │
        ▼                                  │
   ┌─────────┐    ┌─────────┐    ┌────────┴─┐
   │ Measure │───▶│ Analyze │───▶│ Prioritize│
   └─────────┘    └─────────┘    └──────────┘
        ▲                              │
        │                              ▼
   ┌─────────┐    ┌─────────┐    ┌──────────┐
   │ Deploy  │◀───│  Build  │◀───│  Design  │
   └─────────┘    └─────────┘    └──────────┘
```

### Prioritization Framework (RICE)
- **Reach**: How many users affected?
- **Impact**: How much will it help? (1-3)
- **Confidence**: How sure are we? (%)
- **Effort**: How long to build?

Score = (Reach × Impact × Confidence) / Effort

### Version Naming
- **V1**: MVP - core value, basic UX
- **V2**: Enhanced - better UX, secondary features
- **V3+**: Scaling - performance, enterprise features

### When to V2 vs Iterate
**Iterate (same version)** when:
- Fixing bugs
- Small UX improvements
- Performance tweaks

**New version** when:
- New major feature
- UI redesign
- Architecture change
- Pricing change

---

## Tools & Plugins Checklist

### Development
- [ ] TypeScript (catch errors early)
- [ ] ESLint + Prettier (consistent code)
- [ ] Git hooks (pre-commit checks)

### Claude Code Plugins
- [ ] `frontend-design` - UI work
- [ ] `context7` - Up-to-date docs
- [ ] `playwright` - E2E testing
- [ ] `stripe` - Payment best practices
- [ ] `supabase` - Database operations
- [ ] `vercel` - Deployment

### Monitoring
- [ ] Error tracking (Sentry)
- [ ] Analytics (Posthog/Mixpanel)
- [ ] Uptime monitoring
- [ ] Database monitoring

---

## Quick Reference: Commands to Claude

### Starting a New Project
```
"Create a PRD for [idea]. Include user stories, features spec,
and technical constraints. Target [user type]."
```

### Starting a Feature
```
"I need to build [feature]. Write a technical design doc
covering data model, API, and UI components."
```

### Building UI
```
"/frontend-design Build [component/page]. Use [tech stack].
Make it [aesthetic: minimal/bold/professional]."
```

### Code Review
```
"/code-review Check this PR for bugs, security issues,
and best practices."
```

### Debugging
```
"Use /systematic-debugging to investigate why [symptom].
Don't guess - gather evidence first."
```

### Planning Work
```
"Create an implementation plan for [feature]. Break into
tasks, identify dependencies, estimate sizes."
```

---

## Summary: The Build Cycle

```
1. DEFINE   → PRD + Design Doc
2. PLAN     → Break into phases/tasks
3. BUILD    → Feature by feature, test as you go
4. SHIP     → Deploy, monitor, verify
5. LEARN    → Measure, analyze, prioritize
6. REPEAT   → Back to step 3 for next feature
```

**Golden Rule**: Working software > perfect documentation. Ship early, iterate often.

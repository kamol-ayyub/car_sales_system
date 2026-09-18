# Product

## Register

product

## Users

Car dealership staff and owners — sales people, inventory managers, and the business owner. They use the admin dashboard during the workday on desktop or laptop, often in short bursts between customers or tasks. They need to sign in quickly and get back to managing inventory, sales, and users without friction.

## Product Purpose

An internal car sales management system: one place to manage vehicle inventory, record and track sales, and administer staff accounts and roles. Success looks like staff trusting the tool enough that it disappears into the task — no hesitation, no relearning, no doubt about what a control does.

## Brand Personality

Modern, warm, approachable. Calm and efficient rather than corporate or sterile. Confident and quiet: the interface should feel considered and human, not cold or mechanical. Warmth comes from typography, spacing, and a restrained use of color — not from decoration.

## Anti-references

AI-slop glassmorphism and gradients: no frosted-glass cards, no decorative blur, no purple-to-blue gradient accents, no glow effects. Also avoid over-decorated controls and generic template-admin styling that adds visual noise without serving the task.

## Design Principles

- The tool disappears into the task. Familiarity is a feature; every control should behave the way an experienced user expects.
- Restrained color. Accent is reserved for primary actions, current selection, and state (error, success, warning). Neutrals carry the surface.
- Every state is designed. Default, hover, focus, active, disabled, loading, error — no half-finished interactions.
- Fix the system, not the screen. Repeated drift is a token or component problem; resolve it at the source.
- Accessible by default. Semantic HTML, visible focus, AA minimum contrast, AAA where feasible, and reduced-motion respected.

## Accessibility & Inclusion

Target WCAG 2.1 AA as the floor and AAA where feasible. Body and label text should aim for 7:1 contrast on its background; nothing interactive may rely on color alone. All form controls require a visible focus indicator, an associated label, and programmatic error association (`aria-invalid` + `aria-describedby`). Full keyboard operability is required, including a password visibility toggle and submit feedback for screen readers. Motion must respect `prefers-reduced-motion`.

# AI OS Academy LMS (working name)

Our own learning platform for AI training: for MSME owners, their staff and individual learners. Recorded and live classes, with companies able to buy seats for their staff.

## What's here

| Path | What it is |
| --- | --- |
| `prototype/lms-first-version.html` | First version: a clickable app in one file. Open it in any browser. |
| `LMS Blueprint - Features and Phases.html` | Feature list drawn from 10 course platforms, sorted into Phase 1 / 2 / 3. |

Live links (Claude artifacts, shared on request):
- First version: https://claude.ai/artifact/1SPFgKJiSbwEew2pRHMkrR
- Blueprint: https://claude.ai/artifact/RGMwU2wmASu8mapt13aUdw

## First version: what works

Switch views with the buttons at the top.

- **Student:** course catalog; lessons that unlock week by week; quizzes; an AI tutor that answers from the course; assignments marked by AI; Razorpay checkout with coupons; automatic GST invoices (CGST+SGST in West Bengal, IGST outside); certificates with "Add to LinkedIn"; a leaderboard.
- **Company admin:** buy seats (15% off for 10 or more); give seats to staff and take them back; see each person's progress; a monthly WhatsApp report.
- **Trainer:** approve or change the AI's assignment marks; schedule Zoom/Meet classes; see sales and GST collected.

**Simulated for now:** payments (Razorpay test), video playback, the AI tutor and AI marking (simple rules, not a real model). Data is saved only in the viewer's browser.

## Next steps

1. Real backend on [Frappe LMS](https://github.com/frappe/lms). It already has courses, batches, Zoom/Meet, quizzes, certificates and Razorpay.
2. Build our own additions as a separate Frappe app: company seats, GST invoices, AI marking, the AI tutor and WhatsApp reminders.
3. Decide the name, hosting (own server or Frappe Cloud) and pricing model.

# OPSYNC Platform Map

High-level architecture and data flow for the OPSYNC real estate wholesaling operations platform.

---

## DATA LAYER

- **Input:** PropStream / CSV Upload
- **Pipeline:** DNC Check → Duplicate Check → Phone Check → Skip Trace Option
- **Output:** List Ready

---

## COLD CALLING LAYER

- **Integration:** Dialer (Mojo API)
- **Rules:** 10 dial max, 24h redial
- **Status tracking:** No Answer / Voicemail / No Contact / Callback / Interested / Not Interested / Wrong Number / DNC

---

## SMS / EMAIL LAYER (Optional, Parallel)

- Same status tracking as cold calling
- AI reads replies
- Routes warm leads

---

## LEAD MANAGER LAYER

- **View:** Opportunity View
- **Tools:** Comps + MAO range, Price range conversation
- **Statuses:** New / Pending Appt / Hot / Warm / Cold / Ice Cold / Appt Set / Not Interested / High Price / Listed / Agent Lead
- Auto-dial frequencies per status

---

## WALKTHROUGH LAYER

- Mobile webform
- Photos, Condition report
- Attaches to lead

---

## ACQUISITION LAYER

- Full comps view
- MAO calculator
- Offer made template
- **Statuses:** Appt Set / Waiting Comps / Negotiating / Hot-Warm-Cold Offer Follow Up / Dead / Signed / Dispo / Closed

---

## DISPOSITION LAYER

- Buyer matching engine
- Blast template to matched buyers
- **Statuses:** Buyers List / Contacted / Walkthrough / Negotiating / Contract Signed / Closed

---

## AI LAYER

- Live call coaching
- Post-call audit → Score → Training assign
- KPI monitoring → Performance alerts
- Comps calculation
- Buyer matching
- Report generation
- Cost calculation

---

## COMMUNICATION LAYER

- Internal channels
- Private messages
- Bot notifications
- Auto templates on status changes
- Calendar sync

---

## REPORTING LAYER

- Live dashboard
- Excel export
- Email PDF
- EOD / EOW / EOM automated reports

---

## BILLING LAYER

- Cost per client tracking
- Subscription calculation
- Agent pay tracking
- Bonus calculation
- Invoice generation

---

*Last updated from platform map.*

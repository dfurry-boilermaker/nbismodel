export const metadata = { title: "Disclaimer — Nebius model" };

export default function DisclaimerPage() {
  return (
    <div className="max-w-3xl space-y-4 text-sm leading-7">
      <div className="eyebrow">/ Disclaimer</div>
      <h1 className="text-3xl font-semibold text-accent">Disclaimer</h1>
      <p className="text-xs text-muted">Last updated 2026-11-24.</p>
      <p>
        This site is an educational exercise in valuation arithmetic. It is not a price target,
        a forecast, a rating, or investment advice, and it is not an offer or solicitation to
        buy or sell any security. The values follow from the stated assumptions. Many of those
        assumptions are uncertain. Small changes move the result a lot.
      </p>
      <p>
        The authors and their affiliates may hold positions in Nebius Group N.V. or related
        securities, including options, and may trade them at any time without notice. Assume
        the authors have a financial interest. The site is not affiliated with or endorsed by
        Nebius Group N.V. Nebius is a trademark of its owner.
      </p>
      <p>
        Closing price entered manually as of the date shown; not live; may be out of date.
        Every share price on this site is a closing price the authors typed in by hand. There
        is no live quote feed. Check a current source before relying on any price.
      </p>
      <p>
        Do your own research, and consult a licensed financial adviser before making any
        investment decision.
      </p>
    </div>
  );
}

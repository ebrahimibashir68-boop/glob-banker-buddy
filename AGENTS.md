<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Banking simulation
- Keep traditional banking state in the country-isolated, session-only SimulationProvider and balanced journal engine; this avoids storing sensitive data or implying production custody.
- Keep existing real Pi SDK payments separate from simulated fiat/credit/card settlement; demo entries must never imply real beneficiary payouts.
- Use BankingWorkspace for core asset, credit, card, treasury, review and journal views, with separate leaf routes and shared semantic design tokens.

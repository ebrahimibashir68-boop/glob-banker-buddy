import { createFileRoute } from '@tanstack/react-router';
import { BankingWorkspace } from '@/components/BankingWorkspace';
export const Route = createFileRoute('/treasury')({
  head: () => ({ meta: [
    { title: 'Treasury Desk · Meridian Pi Banking Simulation' },
    { name: 'description', content: 'Explore simulated treasury desk in Meridian’s jurisdiction-aware Pi banking workspace.' },
    { property: 'og:title', content: 'Treasury Desk · Meridian Pi Banking Simulation' },
    { property: 'og:description', content: 'Simulated treasury desk, with no real financial custody or on-chain settlement.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: Page,
});
function Page() { return <BankingWorkspace section="treasury" />; }

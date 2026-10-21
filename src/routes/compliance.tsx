import { createFileRoute } from '@tanstack/react-router';
import { BankingWorkspace } from '@/components/BankingWorkspace';
export const Route = createFileRoute('/compliance')({
  head: () => ({ meta: [
    { title: 'Trust & Compliance · Meridian Pi Banking Simulation' },
    { name: 'description', content: 'Explore simulated trust & compliance in Meridian’s jurisdiction-aware Pi banking workspace.' },
    { property: 'og:title', content: 'Trust & Compliance · Meridian Pi Banking Simulation' },
    { property: 'og:description', content: 'Simulated trust & compliance, with no real financial custody or on-chain settlement.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: Page,
});
function Page() { return <BankingWorkspace section="compliance" />; }

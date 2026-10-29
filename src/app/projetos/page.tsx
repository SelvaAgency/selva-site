import { ui } from '@/content';
import { InternalPage } from '@/components/ui/internal-page';

export default function Projetos() {
  return (
    <InternalPage title={ui.projects.title}>
      <p className="placeholder">{ui.projects.intro}</p>
    </InternalPage>
  );
}

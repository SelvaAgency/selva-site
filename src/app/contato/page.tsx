import { ui } from '@/content';
import { InternalPage } from '@/components/ui/internal-page';

export default function Contato() {
  return (
    <InternalPage title={ui.contact.title}>
      <p className="placeholder">{ui.contact.placeholder}</p>
    </InternalPage>
  );
}

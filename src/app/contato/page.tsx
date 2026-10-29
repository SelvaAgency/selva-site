import { ui } from '@/content';
import { InternalPage } from '@/components/ui/internal-page';

/** Contato — fluxo de e-mail, consentimento (LGPD) e CRM pendentes (decisões 5 e 6). Nada é enviado. */
export default function Contato() {
  return (
    <InternalPage title={ui.contact.title}>
      <p className="placeholder">{ui.contact.placeholder}</p>
      <p className="placeholder">{ui.contact.consentNotice}</p>
    </InternalPage>
  );
}

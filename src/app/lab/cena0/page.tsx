import type { Metadata } from 'next';
import { ui } from '@/content';
import { LabCena0 } from '@/components/lab/lab-cena0';

/** Laboratório da Fase 3. Não indexar. */
export const metadata: Metadata = { title: ui.lab.title, robots: { index: false, follow: false } };

export default function LabPage() {
  return <LabCena0 />;
}

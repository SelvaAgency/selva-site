import { JourneyExperience } from '@/components/journey/journey-experience';
import { PanoramaBlock } from '@/components/journey/panorama-block';
import { CasesBlock } from '@/components/journey/cases-block';

export default function Home() {
  return <JourneyExperience panoramaSlot={<PanoramaBlock />} casesSlot={<CasesBlock />} />;
}

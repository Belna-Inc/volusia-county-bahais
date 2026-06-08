import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Star } from '../../shared/star/star';

interface Principle {
  readonly title: string;
  readonly body: string;
}

interface Activity {
  readonly title: string;
  readonly audience: string;
  readonly body: string;
  /** 24×24 outline icon path (stroke = currentColor). */
  readonly icon: string;
}

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Star],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  /** The Manifestations of God, in the order the Bahá’í writings present them. */
  protected readonly manifestations: readonly string[] = [
    'Abraham',
    'Krishna',
    'Zoroaster',
    'Moses',
    'Buddha',
    'Jesus',
    'Muḥammad',
    'the Báb',
    'Bahá’u’lláh',
  ];

  /** The three central truths the Bahá’í teachings turn upon. */
  protected readonly principles: readonly Principle[] = [
    {
      title: 'The Oneness of God',
      body: 'There is one unknowable, all-loving God — the single source of all creation, who has guided humanity in every age through a succession of divine Educators.',
    },
    {
      title: 'The Oneness of Religion',
      body: 'The world’s great religions are successive chapters of one faith. Each Manifestation of God renews humanity’s relationship with the same God for a new age.',
    },
    {
      title: 'The Oneness of Humanity',
      body: 'Humanity is a single family. Bahá’u’lláh taught that prejudice of every kind must give way to the recognition that we are the leaves of one tree.',
    },
  ];

  /** Core social teachings, as the Faith is commonly introduced. */
  protected readonly teachings: readonly string[] = [
    'The independent investigation of truth',
    'The oneness of the entire human race',
    'The equality of women and men',
    'The harmony of science and religion',
    'The elimination of all forms of prejudice',
    'Universal education for every child',
    'A spiritual solution to economic injustice',
    'The foundation of a lasting, universal peace',
  ];

  /** The grassroots activities open to everyone in the community. */
  protected readonly activities: readonly Activity[] = [
    {
      title: 'Devotional Gatherings',
      audience: 'Open to all',
      body: 'Neighbors of every background gather to pray, share sacred writings from the world’s great religions, and reflect together in an atmosphere of unity and joy.',
      icon: 'M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z',
    },
    {
      title: 'Study Circles',
      audience: 'Youth & adults',
      body: 'In small, welcoming groups we explore the Bahá’í teachings and build the capacity to translate spiritual ideals into acts of service to our community.',
      icon: 'M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25',
    },
    {
      title: 'Children’s Classes',
      audience: 'Ages 5–10',
      body: 'Joyful classes that nurture the hearts of children, helping them develop spiritual qualities like kindness, honesty and generosity from an early age.',
      icon: 'M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z',
    },
    {
      title: 'Junior Youth Groups',
      audience: 'Ages 11–15',
      body: 'Young people explore their power to contribute to the world, channeling their energy and idealism toward service alongside caring older mentors.',
      icon: 'M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z',
    },
  ];

  /** Volusia County communities where Bahá’ís live and serve. */
  protected readonly communities: readonly string[] = [
    'Daytona Beach',
    'Deltona',
    'DeLand',
    'Port Orange',
    'Ormond Beach',
    'New Smyrna Beach',
    'DeBary',
    'Orange City',
    'Edgewater',
    'Holly Hill',
    'Lake Helen',
    'Pierson',
  ];

  /**
   * Opens the visitor's mail client pre-filled with their message.
   * Runs only on user submit, so it is safe under server-side rendering.
   *
   * TODO: hello@volusiabahais.org is a PLACEHOLDER address. Replace it (here and
   * in the footer) with the real community inbox before going live.
   */
  protected sendMessage(event: Event, name: string, email: string, message: string): void {
    event.preventDefault();
    const subject = encodeURIComponent(
      `Hello from ${name.trim() || 'a friend'} — Volusia County Bahá’ís`,
    );
    const body = encodeURIComponent(
      `${message.trim()}\n\n— ${name.trim()}${email.trim() ? `\n${email.trim()}` : ''}`,
    );
    window.location.href = `mailto:hello@volusiabahais.org?subject=${subject}&body=${body}`;
  }
}

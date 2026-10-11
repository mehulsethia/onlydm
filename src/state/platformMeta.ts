import type { PlatformId } from '@/rules/types';

/** User-facing names for each platform. The Messenger pack is the Facebook inbox, so users see "Facebook". */
export interface PlatformMeta {
  label: string;
  domain: string;
  helpUrl: string;
}

export const PLATFORM_META: Record<PlatformId, PlatformMeta> = {
  instagram: { label: 'Instagram', domain: 'instagram.com', helpUrl: 'https://help.instagram.com/' },
  threads: { label: 'Threads', domain: 'threads.com', helpUrl: 'https://help.instagram.com/' },
  messenger: { label: 'Facebook', domain: 'facebook.com', helpUrl: 'https://www.facebook.com/help/' },
};

/** Instagram is the product. Threads and Facebook are optional extras, connected from Settings. */
export const PRIMARY_PLATFORM: PlatformId = 'instagram';
export const EXTRA_PLATFORMS: readonly PlatformId[] = ['threads', 'messenger'];
/** Tab order in the inbox. */
export const PLATFORM_ORDER: readonly PlatformId[] = [PRIMARY_PLATFORM, ...EXTRA_PLATFORMS];

export const platformLabel = (id: PlatformId) => PLATFORM_META[id].label;

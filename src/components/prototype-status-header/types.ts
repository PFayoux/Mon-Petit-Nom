// PROTOTYPE — throwaway code resolving wayfinder ticket #45 (Résultats
// status-tab redesign, part of map #42). Not meant to ship as-is; see
// mattpocock-skills:prototype UI.md. Delete this whole directory once a
// variant is chosen and folded into src/app/results.tsx for real.
import type { ReactElement } from 'react';
import type { ListRenderItemInfo } from 'react-native';

import type { SegmentedTabBarItem } from '@/components/segmented-tab-bar';

export type ResultsGenderFilter = 'all' | 'boy' | 'girl' | 'both';
export type ResultsViewKey = 'me' | 'partner';
export type StatusSectionKey = 'love' | 'maybe' | 'dislike' | 'unmarked';

export type PrototypeBodyProps = {
  genderSections: SegmentedTabBarItem<ResultsGenderFilter>[];
  selectedGender: ResultsGenderFilter;
  onSelectGender: (key: ResultsGenderFilter) => void;
  viewSections: SegmentedTabBarItem<ResultsViewKey>[] | null;
  selectedView: ResultsViewKey;
  onSelectView: (key: ResultsViewKey) => void;
  statusSections: SegmentedTabBarItem<StatusSectionKey>[];
  selectedStatus: StatusSectionKey;
  onSelectStatus: (key: StatusSectionKey) => void;
  headerPaddingTop: number;
  listData: string[];
  renderItem: (info: ListRenderItemInfo<string>) => ReactElement;
  keyExtractor: (name: string) => string;
  getItemLayout: (
    data: ArrayLike<string> | null | undefined,
    index: number
  ) => { length: number; offset: number; index: number };
  emptyLabel: string;
};

export function cycleStatus<Key extends string>(
  sections: SegmentedTabBarItem<Key>[],
  selected: Key,
  direction: 1 | -1
): Key {
  const index = sections.findIndex((section) => section.key === selected);
  const next = sections[(index + direction + sections.length) % sections.length];
  return next.key;
}

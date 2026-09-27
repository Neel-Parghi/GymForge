export type MemberNavTabId = 'home' | 'train' | 'eat' | 'me';

export interface BottomNavTab {
  id: MemberNavTabId;
  label: string;
  icon: string;
  route: string;
  /** Route prefixes that keep this tab highlighted. */
  matches: string[];
}

export interface QuickLogAction {
  label: string;
  hint: string;
  icon: string;
  tone: 'energy' | 'info' | 'good' | 'warn';
  route: string;
}

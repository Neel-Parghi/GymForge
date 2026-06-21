export const TEMPLATE_TYPES = [
  { value: 0, label: 'Custom' },
  { value: 1, label: 'Inactivity Notification' },
  { value: 2, label: 'Expired Membership' },
  { value: 3, label: 'Expiring Soon' }
];

export const TEMPLATE_CONFIG: Record<number, { defaultName: string; titleTemplate: string; messageTemplate: string }> = {
  1: {
    defaultName: 'Inactivity Follow-up',
    titleTemplate: 'We miss you at {{GymName}}, {{UserName}}! 💪',
    messageTemplate: 'Hi {{UserName}},\n\nWe noticed you haven\'t been to the gym in a while. We miss your energy! Let us know if you need any help getting back on track with your fitness goals.\n\nSee you soon,\nThe {{GymName}} Team'
  },
  2: {
    defaultName: 'Membership Expired',
    titleTemplate: 'Your {{GymName}} membership has expired ⚠️',
    messageTemplate: 'Hi {{UserName}},\n\nYour {{PlanName}} membership expired on {{ExpiryDate}}. We\'d love to welcome you back! Renew today to continue your fitness journey with us.\n\nThanks,\nThe {{GymName}} Team'
  },
  3: {
    defaultName: 'Membership Expiring Soon',
    titleTemplate: 'Your {{GymName}} membership expires soon! ⏳',
    messageTemplate: 'Hi {{UserName}},\n\nJust a quick reminder that your {{PlanName}} membership is expiring on {{ExpiryDate}}. Don\'t lose your momentum! Renew today to keep crushing your goals.\n\nThanks,\nThe {{GymName}} Team'
  }
};

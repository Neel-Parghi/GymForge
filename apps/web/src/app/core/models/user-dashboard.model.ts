export interface DailyRoutineItem {
  id: string;
  title: string;
  time?: string;
  amount?: string;
  completed: boolean;
  isEditing?: boolean;
}

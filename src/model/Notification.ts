export type INotification = {
  type: string;
  to_entity: string;
  viewers: string[];
  message: string;
  created_at: Date;
};

export interface User {
  id?: string;
  user_id: string;
  email: string;
  username: string;
  created?: Date;
  password?: string;
  enquiries?: string[];
  properties?: string[];
  accessToken?: string;
  aboutMe?: string;
  location?: string;
}

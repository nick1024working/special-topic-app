export interface Me {
  uid: string;
  name: string;
  email: string;
  phone: string;
  status: number;
  level: number;
}

export interface LoginPayload {
  account: string;
  password: string;
}

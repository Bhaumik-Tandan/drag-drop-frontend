export interface Connection {
  id: string;
  from: string;
  fromType: string;
  to: string;
  toType: string;
}

export interface ConnectionStart {
  componentId: string;
  connectionType: string;
}

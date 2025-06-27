export interface InputConfig {
  inputType: string;
  placeholder: string;
}
export interface OutputConfig {
  outputFormat: string;
}
export interface ActionConfig {
  actionType: string;
  delay: number;
}
export type ComponentConfig = InputConfig | OutputConfig | ActionConfig;

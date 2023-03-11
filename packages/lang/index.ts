export type Component = {
  id: string;
  help: string;
};

export type SelectInput = Component & {
  type: "select";
  source: string;
  label: string;
  value: string;
};

export type TextInput = Component & {
  type: "text";
};

export type Action = Component & {
  type: "action";
  payload: unknown;
};

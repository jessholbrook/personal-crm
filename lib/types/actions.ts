type ActionSuccess<T = void> = { status: "success"; data: T };
type ActionError = {
  status: "error";
  message: string;
  fieldErrors?: Record<string, string[]>;
};

export type ActionResult<T = void> = ActionSuccess<T> | ActionError;

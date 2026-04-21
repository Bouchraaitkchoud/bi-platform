import { useState, useCallback } from 'react';

interface FormState {
  values: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
}

interface UseFormOptions {
  initialValues?: Record<string, any>;
  onSubmit?: (values: Record<string, any>) => Promise<void> | void;
  validate?: (values: Record<string, any>) => Record<string, string>;
}

export function useForm(options: UseFormOptions = {}) {
  const { initialValues = {}, onSubmit, validate } = options;
  const [state, setState] = useState<FormState>({
    values: initialValues,
    errors: {},
    touched: {},
    isSubmitting: false,
  });

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const fieldValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    setState((prev) => ({
      ...prev,
      values: { ...prev.values, [name]: fieldValue },
      errors: { ...prev.errors, [name]: '' },
    }));
  }, []);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name } = e.target;
    setState((prev) => ({
      ...prev,
      touched: { ...prev.touched, [name]: true },
    }));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      let errors: Record<string, string> = {};
      if (validate) {
        errors = validate(state.values);
      }

      if (Object.keys(errors).length === 0 && onSubmit) {
        setState((prev) => ({ ...prev, isSubmitting: true }));
        try {
          await onSubmit(state.values);
        } catch (error: any) {
          if (error.fieldErrors) {
            setState((prev) => ({ ...prev, errors: error.fieldErrors }));
          }
        } finally {
          setState((prev) => ({ ...prev, isSubmitting: false }));
        }
      } else {
        setState((prev) => ({ ...prev, errors }));
      }
    },
    [state.values, onSubmit, validate]
  );

  const reset = useCallback(() => {
    setState({
      values: initialValues,
      errors: {},
      touched: {},
      isSubmitting: false,
    });
  }, [initialValues]);

  const setValues = useCallback((values: Record<string, any>) => {
    setState((prev) => ({ ...prev, values }));
  }, []);

  const setErrors = useCallback((errors: Record<string, string>) => {
    setState((prev) => ({ ...prev, errors }));
  }, []);

  return {
    values: state.values,
    errors: state.errors,
    touched: state.touched,
    isSubmitting: state.isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setValues,
    setErrors,
  };
}

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useActionState, useEffect, startTransition, type SubmitEvent } from "react";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { sendContactMessage, type ContactFormState } from "@/app/kontakt/actions";
import { Alert, Button } from "@/components/atoms";
import {
  contactFieldNames,
  contactSchema,
  type ContactField,
  type ContactMessage,
} from "@/services/contact";
import styles from "./ContactForm.module.css";

const initialState: ContactFormState = { status: "idle" };

const fields: {
  name: ContactField;
  label: string;
  type: "text" | "email" | "tel";
  placeholder: string;
}[] = [
  { name: "name", label: "Ihr Name", type: "text", placeholder: "Jana Mustermann" },
  {
    name: "email",
    label: "Ihre E-Mail Adresse",
    type: "email",
    placeholder: "jana.mustermann@example.com",
  },
  { name: "phone", label: "Ihre Telefonnummer", type: "tel", placeholder: "+49 170 12345678" },
  { name: "subject", label: "Betreff", type: "text", placeholder: "Anfrage" },
];

export const ContactForm: React.FC = () => {
  const [state, formAction, pending] = useActionState(sendContactMessage, initialState);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitted },
  } = useForm<ContactMessage>({
    resolver: zodResolver(contactSchema),
    reValidateMode: "onChange",
  });

  useEffect(() => {
    if (state.status !== "error" || !state.fieldErrors) return;

    for (const field of contactFieldNames) {
      const message = state.fieldErrors[field];
      if (message) setError(field, { message });
    }
  }, [state, setError]);

  const onSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    const formData = new FormData(event.currentTarget);
    void handleSubmit(() => {
      startTransition(() => {
        formAction(formData);
      });
    })(event);
  };

  if (state.status === "success") {
    return (
      <Alert variant="success" title="Nachricht gesendet!">
        {state.name ? (
          <>
            Vielen Dank <strong>{state.name}</strong>, Ihre Nachricht wurde erfolgreich an uns
            gesendet.
          </>
        ) : (
          "Ihre Nachricht wurde erfolgreich an uns gesendet."
        )}
      </Alert>
    );
  }

  const hasFieldErrors = contactFieldNames.some(
    (field) => errors[field] ?? (!isSubmitted && state.fieldErrors?.[field]),
  );

  return (
    <form className={styles.form} action={formAction} onSubmit={onSubmit} noValidate>
      <p className={styles.note}>* Pflichtfelder</p>
      {state.status === "error" && state.message && !hasFieldErrors ? (
        <Alert title="Beim Senden der Nachricht ist ein Fehler aufgetreten." variant="error">
          {state.message}
        </Alert>
      ) : null}
      <div className={styles.layout}>
        <div className={styles.column}>
          {fields.map((field) => (
            <Field
              key={field.name}
              id={field.name}
              label={field.label}
              placeholder={field.placeholder}
              type={field.type}
              error={fieldError(field.name, errors[field.name]?.message, state, isSubmitted)}
              autoComplete={autoCompleteFor(field.name)}
              registration={register(field.name)}
            />
          ))}
        </div>
        <div className={styles.column}>
          <Field
            id="message"
            label="Ihre Nachricht"
            placeholder="Ihre Nachricht"
            error={fieldError("message", errors.message?.message, state, isSubmitted)}
            registration={register("message")}
            multiline
          />
          <Button className={styles.submit} type="submit" disabled={pending}>
            {pending ? "Wird gesendet…" : "Nachricht senden"}
          </Button>
        </div>
      </div>
      <div className={styles.honeypot} aria-hidden="true">
        <input id="hp_field" name="hp_field" type="text" tabIndex={-1} autoComplete="off" />
      </div>
    </form>
  );
};

function fieldError(
  field: ContactField,
  clientMessage: string | undefined,
  state: ContactFormState,
  isSubmitted: boolean,
): string | undefined {
  return clientMessage ?? (isSubmitted ? undefined : state.fieldErrors?.[field]);
}

function autoCompleteFor(field: ContactField): string | undefined {
  if (field === "name") return "name";
  if (field === "email") return "email";
  if (field === "phone") return "tel";
  return undefined;
}

type FieldProps = {
  id: ContactField;
  label: string;
  placeholder: string;
  error?: string;
  registration: UseFormRegisterReturn;
  type?: "text" | "email" | "tel";
  autoComplete?: string;
  multiline?: boolean;
};

const Field: React.FC<FieldProps> = ({
  id,
  label,
  error,
  registration,
  type = "text",
  autoComplete,
  multiline = false,
}: FieldProps) => {
  const errorId = `${id}-error`;
  const describedBy = error ? errorId : undefined;
  const controlProps = {
    ...registration,
    id,
    className: multiline ? `${styles.control} ${styles.textarea}` : styles.control,
    required: true,
    "aria-required": true as const,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy,
  };

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label} <span aria-hidden="true">*</span>
      </label>
      {multiline ? (
        <textarea {...controlProps} rows={8} />
      ) : (
        <input {...controlProps} type={type} autoComplete={autoComplete} />
      )}
      {error ? (
        <p className={styles.error} id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
};

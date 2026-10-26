"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useActionState, startTransition, type FC, type SubmitEvent } from "react";
import { useForm, useWatch, type UseFormRegisterReturn } from "react-hook-form";
import { sendContactMessage, type ContactFormState } from "@/app/kontakt/actions";
import { Alert, Button, Spacing, Typography } from "@/components/atoms";
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
  autoComplete?: string;
}[] = [
  {
    name: "name",
    label: "Ihr Name",
    type: "text",
    placeholder: "Jana Mustermann",
    autoComplete: "name",
  },
  {
    name: "email",
    label: "Ihre E-Mail Adresse",
    type: "email",
    placeholder: "jana.mustermann@example.com",
    autoComplete: "email",
  },
  {
    name: "phone",
    label: "Ihre Telefonnummer",
    type: "tel",
    placeholder: "+49 170 12345678",
    autoComplete: "tel",
  },
  { name: "subject", label: "Betreff", type: "text", placeholder: "Anfrage" },
];

export const ContactForm: FC = () => {
  const [state, formAction, pending] = useActionState(sendContactMessage, initialState);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, dirtyFields },
  } = useForm<ContactMessage>({
    resolver: zodResolver(contactSchema),
    reValidateMode: "onChange",
  });
  const currentValues = useWatch({ control });

  const messageFor = (field: ContactField) =>
    fieldMessage(field, errors[field]?.message, state, currentValues[field], dirtyFields[field]);

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

  const hasFieldErrors = contactFieldNames.some((field) => messageFor(field));

  return (
    <form className={styles.form} action={formAction} onSubmit={onSubmit} noValidate>
      <Spacing space={20} alignItems="stretch">
        <Typography variant="small" color="brand" className={styles.note}>
          * Pflichtfelder
        </Typography>
        {state.status === "error" && state.message && !hasFieldErrors ? (
          <Alert title="Beim Senden der Nachricht ist ein Fehler aufgetreten." variant="error">
            {state.message}
          </Alert>
        ) : null}
        <div className={styles.layout}>
          <Spacing space={20} alignItems="stretch">
            {fields.map((field) => (
              <Field
                key={field.name}
                id={field.name}
                label={field.label}
                placeholder={field.placeholder}
                type={field.type}
                error={messageFor(field.name)}
                autoComplete={field.autoComplete}
                registration={register(field.name)}
              />
            ))}
          </Spacing>
          <Spacing space={20} alignItems="stretch">
            <Field
              id="message"
              label="Ihre Nachricht"
              placeholder="Ihre Nachricht"
              error={messageFor("message")}
              registration={register("message")}
              multiline
            />
            <Button className={styles.submit} type="submit" disabled={pending}>
              {pending ? "Wird gesendet…" : "Nachricht senden"}
            </Button>
          </Spacing>
        </div>
        <div className={styles.honeypot} aria-hidden="true">
          <input id="hp_field" name="hp_field" type="text" tabIndex={-1} autoComplete="off" />
        </div>
      </Spacing>
    </form>
  );
};

function fieldMessage(
  field: ContactField,
  clientMessage: string | undefined,
  state: ContactFormState,
  current: string | undefined,
  dirty: boolean | undefined,
): string | undefined {
  if (clientMessage) return clientMessage;
  const serverMessage = state.fieldErrors?.[field];
  if (!serverMessage) return undefined;
  const submitted = state.values?.[field];
  if (dirty && submitted !== undefined && current !== submitted) return undefined;
  return serverMessage;
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

const Field: FC<FieldProps> = ({
  id,
  label,
  error,
  registration,
  type = "text",
  autoComplete,
  multiline = false,
}) => {
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
    <Spacing space={5} alignItems="stretch">
      <label className={styles.label} htmlFor={id}>
        {label} <span aria-hidden="true">*</span>
      </label>
      {multiline ? (
        <textarea {...controlProps} rows={8} />
      ) : (
        <input {...controlProps} type={type} autoComplete={autoComplete} />
      )}
      {error ? (
        <Typography variant="small" id={errorId} role="alert" className={styles.error}>
          {error}
        </Typography>
      ) : null}
    </Spacing>
  );
};

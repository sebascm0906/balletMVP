"use client";

import { useActionState, useEffect, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { gradeSchema } from "@/lib/validations/grade";
import { createGradeAction } from "@/server/actions/grades";
import type { ActionState } from "@/server/actions/types";

const initialState: ActionState = {};

export function GradeForm() {
  const [isPending, startTransition] = useTransition();
  const [state, formAction] = useActionState(createGradeAction, initialState);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.input<typeof gradeSchema>, unknown, z.output<typeof gradeSchema>>({
    resolver: zodResolver(gradeSchema),
    defaultValues: {
      name: "",
      description: "",
      baseMonthlyFee: 0,
    },
  });

  useEffect(() => {
    if (state.success) {
      reset();
    }
  }, [reset, state.success]);

  function onSubmit(values: z.output<typeof gradeSchema>) {
    const formData = new FormData();
    formData.set("name", values.name);
    formData.set("description", values.description ?? "");
    formData.set("suggestedMinAge", values.suggestedMinAge?.toString() ?? "");
    formData.set("suggestedMaxAge", values.suggestedMaxAge?.toString() ?? "");
    formData.set("baseMonthlyFee", values.baseMonthlyFee.toString());

    startTransition(() => formAction(formData));
  }

  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
      <Field label="Nombre" error={errors.name?.message}>
        <input className="form-input" {...register("name")} />
      </Field>
      <Field label="Mensualidad base" error={errors.baseMonthlyFee?.message}>
        <input className="form-input" type="number" min="0" step="0.01" {...register("baseMonthlyFee")} />
      </Field>
      <Field label="Edad mínima sugerida" error={errors.suggestedMinAge?.message}>
        <input className="form-input" type="number" min="0" {...register("suggestedMinAge")} />
      </Field>
      <Field label="Edad máxima sugerida" error={errors.suggestedMaxAge?.message}>
        <input className="form-input" type="number" min="0" {...register("suggestedMaxAge")} />
      </Field>
      <Field label="Descripción" error={errors.description?.message} className="md:col-span-2">
        <textarea className="form-input min-h-20" {...register("description")} />
      </Field>
      <FormFooter state={state} isPending={isPending} submitLabel="Crear grado" />
    </form>
  );
}

type FieldProps = {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
};

function Field({ label, error, className, children }: FieldProps) {
  return (
    <label className={className}>
      <span className="mb-1 block text-sm font-medium text-foreground">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-xs text-destructive">{error}</span> : null}
    </label>
  );
}

function FormFooter({
  state,
  isPending,
  submitLabel,
}: {
  state: ActionState;
  isPending: boolean;
  submitLabel: string;
}) {
  return (
    <div className="flex items-center gap-3 md:col-span-2">
      <button className="btn-primary" disabled={isPending} type="submit">
        {isPending ? "Guardando..." : submitLabel}
      </button>
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-emerald-700">{state.success}</p> : null}
    </div>
  );
}

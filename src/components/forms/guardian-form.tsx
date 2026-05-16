"use client";

import { useActionState, useEffect, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { guardianSchema, type GuardianInput } from "@/lib/validations/guardian";
import { createGuardianAction } from "@/server/actions/guardians";
import type { ActionState } from "@/server/actions/types";

const initialState: ActionState = {};

export function GuardianForm() {
  const [isPending, startTransition] = useTransition();
  const [state, formAction] = useActionState(createGuardianAction, initialState);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GuardianInput>({
    resolver: zodResolver(guardianSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      address: "",
    },
  });

  useEffect(() => {
    if (state.success) {
      reset();
    }
  }, [reset, state.success]);

  function onSubmit(values: GuardianInput) {
    const formData = new FormData();
    formData.set("fullName", values.fullName);
    formData.set("phone", values.phone);
    formData.set("email", values.email ?? "");
    formData.set("address", values.address ?? "");
    startTransition(() => formAction(formData));
  }

  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
      <label>
        <span className="mb-1 block text-sm font-medium">Nombre completo</span>
        <input className="form-input" {...register("fullName")} />
        {errors.fullName ? <span className="mt-1 block text-xs text-destructive">{errors.fullName.message}</span> : null}
      </label>
      <label>
        <span className="mb-1 block text-sm font-medium">Teléfono</span>
        <input className="form-input" {...register("phone")} />
        {errors.phone ? <span className="mt-1 block text-xs text-destructive">{errors.phone.message}</span> : null}
      </label>
      <label>
        <span className="mb-1 block text-sm font-medium">Email opcional</span>
        <input className="form-input" type="email" {...register("email")} />
        {errors.email ? <span className="mt-1 block text-xs text-destructive">{errors.email.message}</span> : null}
      </label>
      <label>
        <span className="mb-1 block text-sm font-medium">Dirección opcional</span>
        <input className="form-input" {...register("address")} />
      </label>
      <div className="flex items-center gap-3 md:col-span-2">
        <button className="btn-primary" disabled={isPending} type="submit">
          {isPending ? "Guardando..." : "Crear tutor"}
        </button>
        {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
        {state.success ? <p className="text-sm text-emerald-700">{state.success}</p> : null}
      </div>
    </form>
  );
}

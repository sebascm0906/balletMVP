"use client";

import { useActionState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { studentSchema, type StudentInput } from "@/lib/validations/student";
import { createStudentAction } from "@/server/actions/students";
import type { ActionState } from "@/server/actions/types";

const initialState: ActionState = {};

export function StudentForm() {
  const [isPending, startTransition] = useTransition();
  const [state, formAction] = useActionState(createStudentAction, initialState);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StudentInput>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      fullName: "",
      birthDate: "",
      phone: "",
      joinedAt: new Date().toISOString().slice(0, 10),
      medicalNotes: "",
      generalNotes: "",
    },
  });

  function onSubmit(values: StudentInput) {
    const formData = new FormData();
    formData.set("fullName", values.fullName);
    formData.set("birthDate", values.birthDate);
    formData.set("phone", values.phone ?? "");
    formData.set("joinedAt", values.joinedAt);
    formData.set("medicalNotes", values.medicalNotes ?? "");
    formData.set("generalNotes", values.generalNotes ?? "");
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
        <span className="mb-1 block text-sm font-medium">Fecha de nacimiento</span>
        <input className="form-input" type="date" {...register("birthDate")} />
        {errors.birthDate ? <span className="mt-1 block text-xs text-destructive">{errors.birthDate.message}</span> : null}
      </label>
      <label>
        <span className="mb-1 block text-sm font-medium">Teléfono opcional</span>
        <input className="form-input" {...register("phone")} />
      </label>
      <label>
        <span className="mb-1 block text-sm font-medium">Fecha de ingreso</span>
        <input className="form-input" type="date" {...register("joinedAt")} />
        {errors.joinedAt ? <span className="mt-1 block text-xs text-destructive">{errors.joinedAt.message}</span> : null}
      </label>
      <label className="md:col-span-2">
        <span className="mb-1 block text-sm font-medium">Notas médicas</span>
        <textarea className="form-input min-h-20" {...register("medicalNotes")} />
      </label>
      <label className="md:col-span-2">
        <span className="mb-1 block text-sm font-medium">Observaciones generales</span>
        <textarea className="form-input min-h-20" {...register("generalNotes")} />
      </label>
      <div className="flex items-center gap-3 md:col-span-2">
        <button className="btn-primary" disabled={isPending} type="submit">
          {isPending ? "Guardando..." : "Registrar alumna"}
        </button>
        {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      </div>
    </form>
  );
}

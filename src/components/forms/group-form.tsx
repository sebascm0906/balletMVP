"use client";

import { useActionState, useEffect, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { groupSchema } from "@/lib/validations/group";
import { createGroupAction } from "@/server/actions/groups";
import type { ActionState } from "@/server/actions/types";
import type { Database } from "@/types/database";

type Grade = Database["public"]["Tables"]["grades"]["Row"];

const initialState: ActionState = {};

export function GroupForm({ grades }: { grades: Grade[] }) {
  const [isPending, startTransition] = useTransition();
  const [state, formAction] = useActionState(createGroupAction, initialState);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.input<typeof groupSchema>, unknown, z.output<typeof groupSchema>>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      gradeId: "",
      name: "",
      teacherName: "",
      classroom: "",
      capacity: 15,
    },
  });

  useEffect(() => {
    if (state.success) {
      reset();
    }
  }, [reset, state.success]);

  function onSubmit(values: z.output<typeof groupSchema>) {
    const formData = new FormData();
    formData.set("gradeId", values.gradeId);
    formData.set("name", values.name);
    formData.set("teacherName", values.teacherName ?? "");
    formData.set("classroom", values.classroom ?? "");
    formData.set("capacity", values.capacity.toString());
    startTransition(() => formAction(formData));
  }

  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
      <label>
        <span className="mb-1 block text-sm font-medium text-foreground">Grado</span>
        <select className="form-input" {...register("gradeId")}>
          <option value="">Selecciona un grado</option>
          {grades.map((grade) => (
            <option key={grade.id} value={grade.id}>
              {grade.name}
            </option>
          ))}
        </select>
        {errors.gradeId ? <span className="mt-1 block text-xs text-destructive">{errors.gradeId.message}</span> : null}
      </label>
      <label>
        <span className="mb-1 block text-sm font-medium text-foreground">Nombre del grupo</span>
        <input className="form-input" {...register("name")} />
        {errors.name ? <span className="mt-1 block text-xs text-destructive">{errors.name.message}</span> : null}
      </label>
      <label>
        <span className="mb-1 block text-sm font-medium text-foreground">Maestra</span>
        <input className="form-input" {...register("teacherName")} />
      </label>
      <label>
        <span className="mb-1 block text-sm font-medium text-foreground">Salón</span>
        <input className="form-input" {...register("classroom")} />
      </label>
      <label>
        <span className="mb-1 block text-sm font-medium text-foreground">Cupo máximo</span>
        <input className="form-input" type="number" min="1" {...register("capacity")} />
        {errors.capacity ? <span className="mt-1 block text-xs text-destructive">{errors.capacity.message}</span> : null}
      </label>
      <div className="flex items-end gap-3">
        <button className="btn-primary" disabled={isPending} type="submit">
          {isPending ? "Guardando..." : "Crear grupo"}
        </button>
        {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
        {state.success ? <p className="text-sm text-emerald-700">{state.success}</p> : null}
      </div>
    </form>
  );
}

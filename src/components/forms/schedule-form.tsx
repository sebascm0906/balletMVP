"use client";

import { useActionState, useEffect, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { scheduleSchema } from "@/lib/validations/schedule";
import { weekdays } from "@/lib/weekdays";
import { createGroupScheduleAction } from "@/server/actions/schedules";
import type { ActionState } from "@/server/actions/types";
import type { GroupListItem } from "@/server/queries/groups";

const initialState: ActionState = {};

export function ScheduleForm({ groups }: { groups: GroupListItem[] }) {
  const [isPending, startTransition] = useTransition();
  const [state, formAction] = useActionState(createGroupScheduleAction, initialState);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.input<typeof scheduleSchema>, unknown, z.output<typeof scheduleSchema>>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      groupId: "",
      weekday: 1,
      startsAt: "",
      endsAt: "",
    },
  });

  useEffect(() => {
    if (state.success) {
      reset();
    }
  }, [reset, state.success]);

  function onSubmit(values: z.output<typeof scheduleSchema>) {
    const formData = new FormData();
    formData.set("groupId", values.groupId);
    formData.set("weekday", values.weekday.toString());
    formData.set("startsAt", values.startsAt);
    formData.set("endsAt", values.endsAt);
    startTransition(() => formAction(formData));
  }

  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
      <label>
        <span className="mb-1 block text-sm font-medium text-foreground">Grupo</span>
        <select className="form-input" {...register("groupId")}>
          <option value="">Selecciona un grupo</option>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.grade_name} - {group.name}
            </option>
          ))}
        </select>
        {errors.groupId ? <span className="mt-1 block text-xs text-destructive">{errors.groupId.message}</span> : null}
      </label>
      <label>
        <span className="mb-1 block text-sm font-medium text-foreground">Día</span>
        <select className="form-input" {...register("weekday")}>
          {weekdays.map((weekday) => (
            <option key={weekday.value} value={weekday.value}>
              {weekday.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span className="mb-1 block text-sm font-medium text-foreground">Inicio</span>
        <input className="form-input" type="time" {...register("startsAt")} />
        {errors.startsAt ? <span className="mt-1 block text-xs text-destructive">{errors.startsAt.message}</span> : null}
      </label>
      <label>
        <span className="mb-1 block text-sm font-medium text-foreground">Fin</span>
        <input className="form-input" type="time" {...register("endsAt")} />
        {errors.endsAt ? <span className="mt-1 block text-xs text-destructive">{errors.endsAt.message}</span> : null}
      </label>
      <div className="flex items-center gap-3 md:col-span-2">
        <button className="btn-primary" disabled={isPending} type="submit">
          {isPending ? "Guardando..." : "Crear horario"}
        </button>
        {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
        {state.success ? <p className="text-sm text-emerald-700">{state.success}</p> : null}
      </div>
    </form>
  );
}

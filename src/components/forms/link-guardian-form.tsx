"use client";

import { useActionState, useTransition } from "react";

import { linkGuardianToStudentAction } from "@/server/actions/guardians";
import type { ActionState } from "@/server/actions/types";
import type { Database } from "@/types/database";

type Guardian = Database["public"]["Tables"]["guardians"]["Row"];

const initialState: ActionState = {};

export function LinkGuardianForm({
  studentId,
  guardians,
}: {
  studentId: string;
  guardians: Guardian[];
}) {
  const [isPending, startTransition] = useTransition();
  const [state, formAction] = useActionState(linkGuardianToStudentAction, initialState);

  function submit(formData: FormData) {
    formData.set("studentId", studentId);
    startTransition(() => formAction(formData));
  }

  return (
    <form action={submit} className="grid gap-3 md:grid-cols-2">
      <select className="form-input" name="guardianId" required>
        <option value="">Selecciona tutor</option>
        {guardians.map((guardian) => (
          <option key={guardian.id} value={guardian.id}>
            {guardian.full_name}
          </option>
        ))}
      </select>
      <input className="form-input" name="relationship" placeholder="Parentesco" required />
      <label className="flex items-center gap-2 text-sm">
        <input name="isPrimary" type="checkbox" />
        Contacto principal
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input name="isEmergencyContact" type="checkbox" />
        Emergencia
      </label>
      <div className="flex items-center gap-3 md:col-span-2">
        <button className="btn-primary" disabled={isPending} type="submit">
          {isPending ? "Relacionando..." : "Relacionar tutor"}
        </button>
        {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
        {state.success ? <p className="text-sm text-emerald-700">{state.success}</p> : null}
      </div>
    </form>
  );
}

type ClassToday = {
  id: string;
  startsAt: string;
  endsAt: string;
  groupName: string;
  gradeName: string;
  teacherName: string;
  classroom: string;
};

export function ClassesTodayList({ classes }: { classes: ClassToday[] }) {
  return (
    <div className="rounded-lg border border-border bg-background p-5 shadow-sm">
      <h2 className="text-base font-semibold text-foreground">Clases de hoy</h2>
      <div className="mt-4 space-y-3">
        {classes.map((classItem) => (
          <div
            key={classItem.id}
            className="flex items-center justify-between rounded-md border border-border px-3 py-3"
          >
            <div>
              <div className="text-sm font-medium">
                {classItem.gradeName} - {classItem.groupName}
              </div>
              <div className="text-xs text-muted-foreground">
                {classItem.teacherName} · {classItem.classroom}
              </div>
            </div>
            <div className="text-sm font-medium text-primary">
              {classItem.startsAt.slice(0, 5)} - {classItem.endsAt.slice(0, 5)}
            </div>
          </div>
        ))}
        {classes.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay clases programadas hoy.</p>
        ) : null}
      </div>
    </div>
  );
}

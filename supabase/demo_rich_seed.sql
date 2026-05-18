do $$
declare
  admin_profile_id uuid;
  current_month integer := extract(month from current_date)::integer;
  current_year integer := extract(year from current_date)::integer;
  previous_month integer := extract(month from (current_date - interval '1 month'))::integer;
  previous_year integer := extract(year from (current_date - interval '1 month'))::integer;
  demo_due_date date := make_date(extract(year from current_date)::integer, extract(month from current_date)::integer, 10);
begin
  select id
  into admin_profile_id
  from public.profiles
  where role = 'admin'
    and status = 'active'
  order by created_at
  limit 1;

  if admin_profile_id is null then
    raise exception 'Crea primero un usuario admin en public.profiles.';
  end if;

  update public.app_settings
  set academy_name = 'Ballet Lumiere',
      primary_color = '#a5215b',
      secondary_color = '#f8fafc',
      payment_due_day = 10,
      enrollment_fee_enabled = true,
      enrollment_fee_amount = 850,
      receipt_prefix = 'REC',
      student_folio_prefix = 'ALU'
  where id = (select id from public.app_settings order by created_at limit 1);

  insert into public.grades (name, description, suggested_min_age, suggested_max_age, base_monthly_fee, status)
  select *
  from (values
    ('Baby Ballet', 'Iniciacion para alumnas pequenas.', 3, 5, 950::numeric, 'active'),
    ('Ballet Inicial', 'Base tecnica y disciplina de ballet.', 6, 9, 1200::numeric, 'active'),
    ('Ballet 1', 'Tecnica inicial formal.', 8, 11, 1350::numeric, 'active'),
    ('Intermedio', 'Trabajo tecnico intermedio.', 10, 14, 1500::numeric, 'active'),
    ('Jazz', 'Clase complementaria de jazz.', 8, 16, 1050::numeric, 'active'),
    ('Contemporaneo', 'Movimiento contemporaneo y expresion.', 11, 18, 1300::numeric, 'active')
  ) as g(name, description, suggested_min_age, suggested_max_age, base_monthly_fee, status)
  where not exists (select 1 from public.grades existing where existing.name = g.name);

  insert into public.groups (grade_id, name, teacher_name, classroom, capacity, status)
  select grade.id, data.group_name, data.teacher_name, data.classroom, data.capacity, 'active'
  from (values
    ('Baby Ballet', 'Grupo A', 'Miss Laura', 'Salon Rosa', 15),
    ('Baby Ballet', 'Grupo B', 'Miss Paula', 'Salon Rosa', 12),
    ('Ballet Inicial', 'Grupo A', 'Miss Mariana', 'Salon Principal', 18),
    ('Ballet 1', 'Grupo A', 'Miss Elena', 'Salon Principal', 16),
    ('Intermedio', 'Grupo A', 'Miss Karla', 'Salon Azul', 14),
    ('Jazz', 'Grupo B', 'Miss Elena', 'Salon Azul', 12),
    ('Contemporaneo', 'Grupo A', 'Miss Renata', 'Salon Negro', 14)
  ) as data(grade_name, group_name, teacher_name, classroom, capacity)
  join public.grades grade on grade.name = data.grade_name
  on conflict (grade_id, name) do update set
    teacher_name = excluded.teacher_name,
    classroom = excluded.classroom,
    capacity = excluded.capacity,
    status = 'active';

  insert into public.group_schedules (group_id, weekday, starts_at, ends_at, status)
  select grp.id, data.weekday, data.starts_at::time, data.ends_at::time, 'active'
  from (values
    ('Baby Ballet', 'Grupo A', 1, '16:00', '17:00'),
    ('Baby Ballet', 'Grupo A', 3, '16:00', '17:00'),
    ('Baby Ballet', 'Grupo B', 2, '16:00', '17:00'),
    ('Baby Ballet', 'Grupo B', 4, '16:00', '17:00'),
    ('Ballet Inicial', 'Grupo A', 1, '17:00', '18:30'),
    ('Ballet Inicial', 'Grupo A', 3, '17:00', '18:30'),
    ('Ballet 1', 'Grupo A', 2, '17:00', '18:30'),
    ('Ballet 1', 'Grupo A', 4, '17:00', '18:30'),
    ('Intermedio', 'Grupo A', 1, '18:30', '20:00'),
    ('Intermedio', 'Grupo A', 3, '18:30', '20:00'),
    ('Jazz', 'Grupo B', 5, '18:00', '19:00'),
    ('Contemporaneo', 'Grupo A', 6, '10:00', '11:30')
  ) as data(grade_name, group_name, weekday, starts_at, ends_at)
  join public.grades grade on grade.name = data.grade_name
  join public.groups grp on grp.grade_id = grade.id and grp.name = data.group_name
  where not exists (
    select 1
    from public.group_schedules existing
    where existing.group_id = grp.id
      and existing.weekday = data.weekday
      and existing.starts_at = data.starts_at::time
  );

  insert into public.students (
    folio,
    full_name,
    birth_date,
    phone,
    status,
    joined_at,
    left_at,
    left_reason,
    medical_notes,
    general_notes
  )
  values
    ('ALU-9001', 'Ana Paula Torres', '2019-04-12', null, 'active', current_date - interval '120 days', null, null, 'Alergia leve al polvo.', 'Pago por transferencia.'),
    ('ALU-9002', 'Sofia Hernandez', '2017-09-22', null, 'active', current_date - interval '110 days', null, null, null, 'Requiere recibo impreso.'),
    ('ALU-9003', 'Camila Robles', '2016-02-03', null, 'active', current_date - interval '95 days', null, null, null, null),
    ('ALU-9004', 'Valentina Cruz', '2018-11-18', null, 'active', current_date - interval '90 days', null, null, null, 'Descuento familiar.'),
    ('ALU-9005', 'Regina Lopez', '2020-01-14', null, 'active', current_date - interval '80 days', null, null, null, null),
    ('ALU-9006', 'Mariana Diaz', '2015-06-01', null, 'active', current_date - interval '70 days', null, null, 'Asma controlada.', null),
    ('ALU-9007', 'Lucia Martinez', '2014-08-28', null, 'active', current_date - interval '65 days', null, null, null, null),
    ('ALU-9008', 'Elena Sanchez', '2012-12-09', null, 'active', current_date - interval '55 days', null, null, null, 'Beca parcial.'),
    ('ALU-9009', 'Natalia Gomez', '2013-05-17', null, 'active', current_date - interval '50 days', null, null, null, null),
    ('ALU-9010', 'Isabella Vargas', '2011-03-20', null, 'active', current_date - interval '45 days', null, null, null, null),
    ('ALU-9011', 'Renata Flores', '2010-10-05', null, 'active', current_date - interval '40 days', null, null, null, 'Pago puntual.'),
    ('ALU-9012', 'Daniela Ruiz', '2016-07-11', null, 'inactive', current_date - interval '180 days', (current_date - interval '10 days')::date, 'Cambio de ciudad', null, 'Baja demo por cambio de ciudad.')
  on conflict (folio) do update set
    full_name = excluded.full_name,
    birth_date = excluded.birth_date,
    status = excluded.status,
    joined_at = excluded.joined_at,
    medical_notes = excluded.medical_notes,
    general_notes = excluded.general_notes,
    left_at = excluded.left_at,
    left_reason = excluded.left_reason;

  insert into public.guardians (full_name, phone, email, address)
  select data.full_name, data.phone, data.email, data.address
  from (values
    ('Laura Torres', '555-0101', 'laura.torres@example.com', 'Av. Reforma 120'),
    ('Diego Hernandez', '555-0102', 'diego.hernandez@example.com', 'Calle Magnolia 45'),
    ('Mariana Robles', '555-0103', 'mariana.robles@example.com', 'Privada del Sol 18'),
    ('Claudia Cruz', '555-0104', 'claudia.cruz@example.com', 'Paseo Norte 77'),
    ('Patricia Lopez', '555-0105', 'patricia.lopez@example.com', 'Calle Lago 22'),
    ('Andres Diaz', '555-0106', 'andres.diaz@example.com', 'Av. Central 812'),
    ('Veronica Martinez', '555-0107', 'veronica.martinez@example.com', 'Calle Cedro 15'),
    ('Monica Sanchez', '555-0108', 'monica.sanchez@example.com', 'Camino Real 104'),
    ('Jorge Gomez', '555-0109', 'jorge.gomez@example.com', 'Rio Norte 56'),
    ('Paola Vargas', '555-0110', 'paola.vargas@example.com', 'Paseo de las Flores 91'),
    ('Carolina Flores', '555-0111', 'carolina.flores@example.com', 'Av. Universidad 33'),
    ('Ruben Ruiz', '555-0112', 'ruben.ruiz@example.com', 'Calle Luna 7')
  ) as data(full_name, phone, email, address)
  where not exists (select 1 from public.guardians existing where existing.phone = data.phone);

  insert into public.student_guardians (student_id, guardian_id, relationship, is_primary, is_emergency_contact)
  select student.id, guardian.id, data.relationship, true, true
  from (values
    ('ALU-9001', '555-0101', 'Mama'),
    ('ALU-9002', '555-0102', 'Papa'),
    ('ALU-9003', '555-0103', 'Mama'),
    ('ALU-9004', '555-0104', 'Mama'),
    ('ALU-9005', '555-0105', 'Mama'),
    ('ALU-9006', '555-0106', 'Papa'),
    ('ALU-9007', '555-0107', 'Mama'),
    ('ALU-9008', '555-0108', 'Mama'),
    ('ALU-9009', '555-0109', 'Papa'),
    ('ALU-9010', '555-0110', 'Mama'),
    ('ALU-9011', '555-0111', 'Mama'),
    ('ALU-9012', '555-0112', 'Papa')
  ) as data(folio, phone, relationship)
  join public.students student on student.folio = data.folio
  join public.guardians guardian on guardian.phone = data.phone
  on conflict (student_id, guardian_id) do update set
    relationship = excluded.relationship,
    is_primary = excluded.is_primary,
    is_emergency_contact = excluded.is_emergency_contact;

  insert into public.student_enrollments (student_id, group_id, starts_on, status, assigned_monthly_fee, discount_type, discount_value, final_monthly_fee)
  select student.id, grp.id, current_date - data.days_since_joined, data.status, data.assigned_fee, data.discount_type, data.discount_value, data.final_fee
  from (values
    ('ALU-9001', 'Baby Ballet', 'Grupo A', 120, 'active', 950::numeric, 'none', 0::numeric, 950::numeric),
    ('ALU-9002', 'Ballet Inicial', 'Grupo A', 110, 'active', 1200::numeric, 'none', 0::numeric, 1200::numeric),
    ('ALU-9003', 'Ballet Inicial', 'Grupo A', 95, 'active', 1200::numeric, 'percentage', 10::numeric, 1080::numeric),
    ('ALU-9004', 'Jazz', 'Grupo B', 90, 'active', 1050::numeric, 'fixed', 150::numeric, 900::numeric),
    ('ALU-9005', 'Baby Ballet', 'Grupo B', 80, 'active', 950::numeric, 'none', 0::numeric, 950::numeric),
    ('ALU-9006', 'Ballet 1', 'Grupo A', 70, 'active', 1350::numeric, 'none', 0::numeric, 1350::numeric),
    ('ALU-9007', 'Ballet 1', 'Grupo A', 65, 'active', 1350::numeric, 'fixed', 100::numeric, 1250::numeric),
    ('ALU-9008', 'Intermedio', 'Grupo A', 55, 'active', 1500::numeric, 'percentage', 20::numeric, 1200::numeric),
    ('ALU-9009', 'Jazz', 'Grupo B', 50, 'active', 1050::numeric, 'none', 0::numeric, 1050::numeric),
    ('ALU-9010', 'Contemporaneo', 'Grupo A', 45, 'active', 1300::numeric, 'none', 0::numeric, 1300::numeric),
    ('ALU-9011', 'Intermedio', 'Grupo A', 40, 'active', 1500::numeric, 'none', 0::numeric, 1500::numeric)
  ) as data(folio, grade_name, group_name, days_since_joined, status, assigned_fee, discount_type, discount_value, final_fee)
  join public.students student on student.folio = data.folio
  join public.grades grade on grade.name = data.grade_name
  join public.groups grp on grp.grade_id = grade.id and grp.name = data.group_name
  where not exists (
    select 1 from public.student_enrollments existing
    where existing.student_id = student.id and existing.status = 'active'
  );

  insert into public.charges (student_id, enrollment_id, month, year, type, concept, amount_due, amount_paid, due_date, status)
  select student.id, enrollment.id, current_month, current_year, 'mensualidad', 'Mensualidad demo', data.amount_due, data.amount_paid, demo_due_date, data.status
  from (values
    ('ALU-9001', 950::numeric, 950::numeric, 'pagado'),
    ('ALU-9002', 1200::numeric, 600::numeric, 'parcial'),
    ('ALU-9003', 1080::numeric, 0::numeric, 'vencido'),
    ('ALU-9004', 900::numeric, 0::numeric, 'pendiente'),
    ('ALU-9005', 950::numeric, 950::numeric, 'pagado'),
    ('ALU-9006', 1350::numeric, 1350::numeric, 'pagado'),
    ('ALU-9007', 1250::numeric, 500::numeric, 'parcial'),
    ('ALU-9008', 1200::numeric, 0::numeric, 'vencido'),
    ('ALU-9009', 1050::numeric, 1050::numeric, 'pagado'),
    ('ALU-9010', 1300::numeric, 0::numeric, 'pendiente'),
    ('ALU-9011', 1500::numeric, 1500::numeric, 'pagado')
  ) as data(folio, amount_due, amount_paid, status)
  join public.students student on student.folio = data.folio
  join public.student_enrollments enrollment on enrollment.student_id = student.id and enrollment.status = 'active'
  on conflict (student_id, enrollment_id, month, year, type) where type = 'mensualidad'
  do update set amount_due = excluded.amount_due, amount_paid = excluded.amount_paid, due_date = excluded.due_date, status = excluded.status;

  insert into public.charges (student_id, enrollment_id, month, year, type, concept, amount_due, amount_paid, due_date, status)
  select student.id, enrollment.id, previous_month, previous_year, 'mensualidad', 'Mensualidad demo anterior', data.amount_due, data.amount_due, demo_due_date - interval '1 month', 'pagado'
  from (values
    ('ALU-9001', 950::numeric),
    ('ALU-9002', 1200::numeric),
    ('ALU-9003', 1080::numeric),
    ('ALU-9004', 900::numeric),
    ('ALU-9005', 950::numeric),
    ('ALU-9006', 1350::numeric),
    ('ALU-9007', 1250::numeric),
    ('ALU-9008', 1200::numeric),
    ('ALU-9009', 1050::numeric),
    ('ALU-9010', 1300::numeric),
    ('ALU-9011', 1500::numeric)
  ) as data(folio, amount_due)
  join public.students student on student.folio = data.folio
  join public.student_enrollments enrollment on enrollment.student_id = student.id and enrollment.status = 'active'
  on conflict (student_id, enrollment_id, month, year, type) where type = 'mensualidad'
  do update set amount_due = excluded.amount_due, amount_paid = excluded.amount_paid, due_date = excluded.due_date, status = excluded.status;

  insert into public.payments (charge_id, student_id, amount, method, paid_at, registered_by, notes, receipt_number, status)
  select charge.id, student.id, data.amount, data.method, now() - (data.days_ago || ' days')::interval, admin_profile_id, data.notes, data.receipt_number, 'active'
  from (values
    ('ALU-9001', 950::numeric, 'transferencia', 2, 'Pago demo liquidado.', 'REC-DEMO-001'),
    ('ALU-9002', 600::numeric, 'efectivo', 1, 'Pago parcial demo.', 'REC-DEMO-002'),
    ('ALU-9005', 950::numeric, 'tarjeta', 4, 'Pago demo liquidado.', 'REC-DEMO-003'),
    ('ALU-9006', 1350::numeric, 'transferencia', 5, 'Pago demo liquidado.', 'REC-DEMO-004'),
    ('ALU-9007', 500::numeric, 'deposito', 3, 'Pago parcial demo.', 'REC-DEMO-005'),
    ('ALU-9009', 1050::numeric, 'efectivo', 6, 'Pago demo liquidado.', 'REC-DEMO-006'),
    ('ALU-9011', 1500::numeric, 'transferencia', 7, 'Pago demo liquidado.', 'REC-DEMO-007')
  ) as data(folio, amount, method, days_ago, notes, receipt_number)
  join public.students student on student.folio = data.folio
  join public.charges charge on charge.student_id = student.id and charge.month = current_month and charge.year = current_year and charge.type = 'mensualidad'
  on conflict (receipt_number) do nothing;
end $$;

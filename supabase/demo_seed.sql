do $$
declare
  admin_profile_id uuid;
  baby_grade_id uuid;
  inicial_grade_id uuid;
  jazz_grade_id uuid;
  baby_group_id uuid;
  inicial_group_id uuid;
  jazz_group_id uuid;
  ana_student_id uuid;
  sofia_student_id uuid;
  camila_student_id uuid;
  valentina_student_id uuid;
  ana_guardian_id uuid;
  sofia_guardian_id uuid;
  camila_guardian_id uuid;
  valentina_guardian_id uuid;
  ana_enrollment_id uuid;
  sofia_enrollment_id uuid;
  camila_enrollment_id uuid;
  valentina_enrollment_id uuid;
  current_month integer := extract(month from current_date)::integer;
  current_year integer := extract(year from current_date)::integer;
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
      enrollment_fee_amount = 850
  where id = (select id from public.app_settings order by created_at limit 1);

  insert into public.grades (name, description, suggested_min_age, suggested_max_age, base_monthly_fee, status)
  select 'Baby Ballet', 'Iniciacion para alumnas pequenas.', 3, 5, 950, 'active'
  where not exists (select 1 from public.grades where name = 'Baby Ballet');
  select id into baby_grade_id from public.grades where name = 'Baby Ballet' limit 1;

  insert into public.grades (name, description, suggested_min_age, suggested_max_age, base_monthly_fee, status)
  select 'Ballet Inicial', 'Base tecnica y disciplina de ballet.', 6, 9, 1200, 'active'
  where not exists (select 1 from public.grades where name = 'Ballet Inicial');
  select id into inicial_grade_id from public.grades where name = 'Ballet Inicial' limit 1;

  insert into public.grades (name, description, suggested_min_age, suggested_max_age, base_monthly_fee, status)
  select 'Jazz', 'Clase complementaria de jazz.', 8, 14, 1050, 'active'
  where not exists (select 1 from public.grades where name = 'Jazz');
  select id into jazz_grade_id from public.grades where name = 'Jazz' limit 1;

  insert into public.groups (grade_id, name, teacher_name, classroom, capacity, status)
  values (baby_grade_id, 'Grupo A', 'Miss Laura', 'Salon Rosa', 15, 'active')
  on conflict (grade_id, name) do update set teacher_name = excluded.teacher_name, classroom = excluded.classroom, capacity = excluded.capacity, status = 'active';
  select id into baby_group_id from public.groups where grade_id = baby_grade_id and name = 'Grupo A';

  insert into public.groups (grade_id, name, teacher_name, classroom, capacity, status)
  values (inicial_grade_id, 'Grupo A', 'Miss Mariana', 'Salon Principal', 18, 'active')
  on conflict (grade_id, name) do update set teacher_name = excluded.teacher_name, classroom = excluded.classroom, capacity = excluded.capacity, status = 'active';
  select id into inicial_group_id from public.groups where grade_id = inicial_grade_id and name = 'Grupo A';

  insert into public.groups (grade_id, name, teacher_name, classroom, capacity, status)
  values (jazz_grade_id, 'Grupo B', 'Miss Elena', 'Salon Azul', 12, 'active')
  on conflict (grade_id, name) do update set teacher_name = excluded.teacher_name, classroom = excluded.classroom, capacity = excluded.capacity, status = 'active';
  select id into jazz_group_id from public.groups where grade_id = jazz_grade_id and name = 'Grupo B';

  insert into public.group_schedules (group_id, weekday, starts_at, ends_at, status)
  select baby_group_id, extract(dow from current_date)::integer, '16:00', '17:00', 'active'
  where not exists (select 1 from public.group_schedules where group_id = baby_group_id and weekday = extract(dow from current_date)::integer and starts_at = '16:00');
  insert into public.group_schedules (group_id, weekday, starts_at, ends_at, status)
  select inicial_group_id, extract(dow from current_date)::integer, '17:00', '18:30', 'active'
  where not exists (select 1 from public.group_schedules where group_id = inicial_group_id and weekday = extract(dow from current_date)::integer and starts_at = '17:00');
  insert into public.group_schedules (group_id, weekday, starts_at, ends_at, status)
  select jazz_group_id, 5, '18:00', '19:00', 'active'
  where not exists (select 1 from public.group_schedules where group_id = jazz_group_id and weekday = 5 and starts_at = '18:00');

  insert into public.students (folio, full_name, birth_date, phone, status, joined_at, medical_notes, general_notes)
  values
    ('ALU-9001', 'Ana Paula Torres', '2019-04-12', null, 'active', current_date - interval '60 days', 'Alergia leve al polvo.', 'Pago por transferencia.'),
    ('ALU-9002', 'Sofia Hernandez', '2017-09-22', null, 'active', current_date - interval '45 days', null, 'Requiere recibo impreso.'),
    ('ALU-9003', 'Camila Robles', '2016-02-03', null, 'active', current_date - interval '30 days', null, null),
    ('ALU-9004', 'Valentina Cruz', '2018-11-18', null, 'active', current_date - interval '20 days', null, 'Descuento familiar.')
  on conflict (folio) do update set full_name = excluded.full_name, status = 'active';

  select id into ana_student_id from public.students where folio = 'ALU-9001';
  select id into sofia_student_id from public.students where folio = 'ALU-9002';
  select id into camila_student_id from public.students where folio = 'ALU-9003';
  select id into valentina_student_id from public.students where folio = 'ALU-9004';

  insert into public.guardians (full_name, phone, email, address)
  select 'Laura Torres', '555-0101', 'laura.torres@example.com', 'Av. Reforma 120'
  where not exists (select 1 from public.guardians where phone = '555-0101');
  insert into public.guardians (full_name, phone, email, address)
  select 'Diego Hernandez', '555-0102', 'diego.hernandez@example.com', 'Calle Magnolia 45'
  where not exists (select 1 from public.guardians where phone = '555-0102');
  insert into public.guardians (full_name, phone, email, address)
  select 'Mariana Robles', '555-0103', 'mariana.robles@example.com', 'Privada del Sol 18'
  where not exists (select 1 from public.guardians where phone = '555-0103');
  insert into public.guardians (full_name, phone, email, address)
  select 'Claudia Cruz', '555-0104', 'claudia.cruz@example.com', 'Paseo Norte 77'
  where not exists (select 1 from public.guardians where phone = '555-0104');

  select id into ana_guardian_id from public.guardians where phone = '555-0101';
  select id into sofia_guardian_id from public.guardians where phone = '555-0102';
  select id into camila_guardian_id from public.guardians where phone = '555-0103';
  select id into valentina_guardian_id from public.guardians where phone = '555-0104';

  insert into public.student_guardians (student_id, guardian_id, relationship, is_primary, is_emergency_contact)
  values
    (ana_student_id, ana_guardian_id, 'Mama', true, true),
    (sofia_student_id, sofia_guardian_id, 'Papa', true, true),
    (camila_student_id, camila_guardian_id, 'Mama', true, true),
    (valentina_student_id, valentina_guardian_id, 'Mama', true, true)
  on conflict (student_id, guardian_id) do update set
    relationship = excluded.relationship,
    is_primary = excluded.is_primary,
    is_emergency_contact = excluded.is_emergency_contact;

  insert into public.student_enrollments (student_id, group_id, starts_on, status, assigned_monthly_fee, discount_type, discount_value, final_monthly_fee)
  select ana_student_id, baby_group_id, current_date - interval '60 days', 'active', 950, 'none', 0, 950
  where not exists (select 1 from public.student_enrollments where student_id = ana_student_id and status = 'active');
  insert into public.student_enrollments (student_id, group_id, starts_on, status, assigned_monthly_fee, discount_type, discount_value, final_monthly_fee)
  select sofia_student_id, inicial_group_id, current_date - interval '45 days', 'active', 1200, 'none', 0, 1200
  where not exists (select 1 from public.student_enrollments where student_id = sofia_student_id and status = 'active');
  insert into public.student_enrollments (student_id, group_id, starts_on, status, assigned_monthly_fee, discount_type, discount_value, final_monthly_fee)
  select camila_student_id, inicial_group_id, current_date - interval '30 days', 'active', 1200, 'percentage', 10, 1080
  where not exists (select 1 from public.student_enrollments where student_id = camila_student_id and status = 'active');
  insert into public.student_enrollments (student_id, group_id, starts_on, status, assigned_monthly_fee, discount_type, discount_value, final_monthly_fee)
  select valentina_student_id, jazz_group_id, current_date - interval '20 days', 'active', 1050, 'fixed', 150, 900
  where not exists (select 1 from public.student_enrollments where student_id = valentina_student_id and status = 'active');

  select id into ana_enrollment_id from public.student_enrollments where student_id = ana_student_id and status = 'active';
  select id into sofia_enrollment_id from public.student_enrollments where student_id = sofia_student_id and status = 'active';
  select id into camila_enrollment_id from public.student_enrollments where student_id = camila_student_id and status = 'active';
  select id into valentina_enrollment_id from public.student_enrollments where student_id = valentina_student_id and status = 'active';

  insert into public.charges (student_id, enrollment_id, month, year, type, concept, amount_due, amount_paid, due_date, status)
  values
    (ana_student_id, ana_enrollment_id, current_month, current_year, 'mensualidad', 'Mensualidad demo', 950, 950, demo_due_date, 'pagado'),
    (sofia_student_id, sofia_enrollment_id, current_month, current_year, 'mensualidad', 'Mensualidad demo', 1200, 600, demo_due_date, 'parcial'),
    (camila_student_id, camila_enrollment_id, current_month, current_year, 'mensualidad', 'Mensualidad demo', 1080, 0, demo_due_date, 'vencido'),
    (valentina_student_id, valentina_enrollment_id, current_month, current_year, 'mensualidad', 'Mensualidad demo', 900, 0, demo_due_date, 'pendiente')
  on conflict (student_id, enrollment_id, month, year, type) where type = 'mensualidad'
  do update set amount_due = excluded.amount_due, amount_paid = excluded.amount_paid, due_date = excluded.due_date, status = excluded.status;

  insert into public.payments (charge_id, student_id, amount, method, paid_at, registered_by, notes, receipt_number, status)
  select c.id, c.student_id, 950, 'transferencia', now() - interval '2 days', admin_profile_id, 'Pago demo liquidado.', 'REC-DEMO-001', 'active'
  from public.charges c
  where c.student_id = ana_student_id and c.month = current_month and c.year = current_year
  on conflict (receipt_number) do nothing;

  insert into public.payments (charge_id, student_id, amount, method, paid_at, registered_by, notes, receipt_number, status)
  select c.id, c.student_id, 600, 'efectivo', now() - interval '1 day', admin_profile_id, 'Pago parcial demo.', 'REC-DEMO-002', 'active'
  from public.charges c
  where c.student_id = sofia_student_id and c.month = current_month and c.year = current_year
  on conflict (receipt_number) do nothing;
end $$;

insert into public.app_settings (
  academy_name,
  primary_color,
  secondary_color,
  payment_due_day,
  enrollment_fee_enabled,
  enrollment_fee_amount,
  receipt_prefix,
  student_folio_prefix
)
values (
  'Academia de Ballet',
  '#9f174d',
  '#f8fafc',
  10,
  false,
  0,
  'REC',
  'ALU'
)
on conflict do nothing;

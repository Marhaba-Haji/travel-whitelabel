-- Atomic coupon usage increment, called by the payu-callback edge function
-- once a payment is verified as successful. Avoids the read-then-write race
-- and replaces the old behaviour of burning coupons at payment initiation.
create or replace function public.increment_coupon_use(coupon_code text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.coupons
  set times_used = times_used + 1,
      updated_at = now()
  where upper(code) = upper(coupon_code)
    and is_active = true;
$$;

-- Edge function calls this with the service role; no anon/authenticated access.
revoke execute on function public.increment_coupon_use(text) from public, anon, authenticated;

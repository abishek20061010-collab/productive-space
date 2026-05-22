
-- 1) Remove broad SELECT on coupons for authenticated users
DROP POLICY IF EXISTS "coupons_active_select" ON public.coupons;

-- 2) Tighten orders INSERT to require status = 'pending'
DROP POLICY IF EXISTS "orders_self_insert" ON public.orders;
CREATE POLICY "orders_self_insert" ON public.orders
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- 3) Atomic coupon redemption (called from server with service role)
CREATE OR REPLACE FUNCTION public.redeem_coupon(_code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_count int;
BEGIN
  UPDATE public.coupons
  SET current_uses = current_uses + 1
  WHERE code = _code
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now())
    AND (max_uses IS NULL OR current_uses < max_uses);
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count > 0;
END;
$$;

-- Restrict SECURITY DEFINER helpers from being executed by clients
REVOKE EXECUTE ON FUNCTION public.redeem_coupon(text) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM anon, authenticated, public;

-- 4) Storage policies for payment-proofs (private bucket, user-scoped folders)
DROP POLICY IF EXISTS "payment_proofs_user_insert" ON storage.objects;
CREATE POLICY "payment_proofs_user_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'payment-proofs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "payment_proofs_user_select" ON storage.objects;
CREATE POLICY "payment_proofs_user_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'payment-proofs'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR public.has_role(auth.uid(), 'admin')
    )
  );

DROP POLICY IF EXISTS "payment_proofs_user_update" ON storage.objects;
CREATE POLICY "payment_proofs_user_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'payment-proofs' AND auth.uid()::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'payment-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "payment_proofs_user_delete" ON storage.objects;
CREATE POLICY "payment_proofs_user_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'payment-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);

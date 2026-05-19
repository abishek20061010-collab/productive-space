
-- Fix mutable search_path
ALTER FUNCTION public.touch_updated_at() SET search_path = public;

-- Lock down trigger-only function
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- Remove broad SELECT on product-images (public bucket serves via public URLs without needing API list access)
DROP POLICY IF EXISTS "product_images_public_read" ON storage.objects;

-- Only admins can list/manage product images via API; public URLs still work for <img>
CREATE POLICY "product_images_admin_list" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'product-images' AND public.has_role(auth.uid(),'admin'));

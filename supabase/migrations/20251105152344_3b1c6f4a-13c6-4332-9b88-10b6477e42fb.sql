-- Create cart table for shopping cart functionality
CREATE TABLE IF NOT EXISTS public.cart (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- Enable RLS
ALTER TABLE public.cart ENABLE ROW LEVEL SECURITY;

-- Students can view their own cart
CREATE POLICY "Students can view their cart"
ON public.cart
FOR SELECT
USING (auth.uid() = user_id);

-- Students can add to their cart
CREATE POLICY "Students can add to cart"
ON public.cart
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Students can remove from their cart
CREATE POLICY "Students can remove from cart"
ON public.cart
FOR DELETE
USING (auth.uid() = user_id);

-- Admins can manage all carts
CREATE POLICY "Admins can manage all carts"
ON public.cart
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_cart_user_id ON public.cart(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_course_id ON public.cart(course_id);
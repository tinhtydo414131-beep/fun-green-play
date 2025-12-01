-- Enable realtime for camly_coin_transactions table  
ALTER TABLE public.camly_coin_transactions REPLICA IDENTITY FULL;

-- Add table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.camly_coin_transactions;
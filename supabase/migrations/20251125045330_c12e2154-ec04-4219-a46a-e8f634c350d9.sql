-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create game_genre enum
CREATE TYPE public.game_genre AS ENUM ('adventure', 'puzzle', 'racing', 'educational', 'casual', 'brain');

-- Create profiles table (linked to auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  wallet_address TEXT,
  wallet_balance DECIMAL(18, 8) DEFAULT 0,
  total_plays INTEGER DEFAULT 0,
  total_likes INTEGER DEFAULT 0,
  total_friends INTEGER DEFAULT 0,
  total_messages INTEGER DEFAULT 0,
  leaderboard_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Create function to check user role (security definer to bypass RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create games table
CREATE TABLE public.games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  genre game_genre NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  thumbnail_url TEXT,
  component_name TEXT NOT NULL,
  total_likes INTEGER DEFAULT 0,
  total_plays INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  how_to_play TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create friends table (bidirectional friendship)
CREATE TABLE public.friends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  friend_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, friend_id),
  CHECK (user_id != friend_id)
);

-- Create friend_requests table
CREATE TABLE public.friend_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(sender_id, receiver_id),
  CHECK (sender_id != receiver_id)
);

-- Create chat_rooms table (for both 1:1 and group chats)
CREATE TABLE public.chat_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  room_type TEXT CHECK (room_type IN ('private', 'game_public')) NOT NULL,
  game_id UUID REFERENCES public.games(id) ON DELETE CASCADE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_room_members table
CREATE TABLE public.chat_room_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

-- Create chat_messages table
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create game_ratings table (likes for games)
CREATE TABLE public.game_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID REFERENCES public.games(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  liked BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(game_id, user_id)
);

-- Create wallet_transactions table
CREATE TABLE public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  to_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  amount DECIMAL(18, 8) NOT NULL CHECK (amount > 0),
  token_type TEXT DEFAULT 'ETH',
  transaction_hash TEXT,
  status TEXT CHECK (status IN ('pending', 'completed', 'failed')) DEFAULT 'pending',
  gas_fee DECIMAL(18, 8),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TRIGGERS FOR AUTO-UPDATE TIMESTAMPS
-- ============================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON public.games
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_friend_requests_updated_at BEFORE UPDATE ON public.friend_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- TRIGGER TO CREATE PROFILE ON USER SIGNUP
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    NEW.email
  );
  
  -- Assign default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- TRIGGER TO UPDATE LEADERBOARD SCORE
-- ============================================

CREATE OR REPLACE FUNCTION public.update_leaderboard_score()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.profiles
  SET leaderboard_score = (total_plays * 10) + (total_likes * 5) + (total_messages * 1) + (total_friends * 2)
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profile_leaderboard_score
  AFTER UPDATE OF total_plays, total_likes, total_messages, total_friends ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_leaderboard_score();

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Profiles: Everyone can view profiles, users can update their own
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- User Roles: Only viewable by admins
CREATE POLICY "User roles viewable by admins" ON public.user_roles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Games: Everyone can view, only admins can modify
CREATE POLICY "Games are viewable by everyone" ON public.games
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Admins can insert games" ON public.games
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update games" ON public.games
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete games" ON public.games
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Friends: Users can view their own friends
CREATE POLICY "Users can view their friends" ON public.friends
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can add friends" ON public.friends
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove friends" ON public.friends
  FOR DELETE USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Friend Requests: Users can view requests involving them
CREATE POLICY "Users can view their friend requests" ON public.friend_requests
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send friend requests" ON public.friend_requests
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their received requests" ON public.friend_requests
  FOR UPDATE USING (auth.uid() = receiver_id);

-- Chat Rooms: Members can view their rooms
CREATE POLICY "Users can view rooms they are members of" ON public.chat_rooms
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chat_room_members
      WHERE room_id = chat_rooms.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create chat rooms" ON public.chat_rooms
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Chat Room Members: Users can view members of their rooms
CREATE POLICY "Users can view members of their rooms" ON public.chat_room_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chat_room_members AS crm
      WHERE crm.room_id = chat_room_members.room_id AND crm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join rooms" ON public.chat_room_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Chat Messages: Members can view and send messages in their rooms
CREATE POLICY "Users can view messages in their rooms" ON public.chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chat_room_members
      WHERE room_id = chat_messages.room_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages in their rooms" ON public.chat_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.chat_room_members
      WHERE room_id = chat_messages.room_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own messages" ON public.chat_messages
  FOR UPDATE USING (auth.uid() = sender_id);

-- Game Ratings: Users can view all ratings, manage their own
CREATE POLICY "Game ratings are viewable by everyone" ON public.game_ratings
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can rate games" ON public.game_ratings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their ratings" ON public.game_ratings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their ratings" ON public.game_ratings
  FOR DELETE USING (auth.uid() = user_id);

-- Wallet Transactions: Users can view their own transactions
CREATE POLICY "Users can view their transactions" ON public.wallet_transactions
  FOR SELECT USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users can create transactions" ON public.wallet_transactions
  FOR INSERT WITH CHECK (auth.uid() = from_user_id);

-- ============================================
-- ENABLE REALTIME
-- ============================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.friend_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.friends;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
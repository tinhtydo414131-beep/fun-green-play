import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type UserRoleType = 'kid' | 'parent' | 'dev' | null;

export function useUserRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRoleType>(null);
  const [loading, setLoading] = useState(true);
  const [needsRoleSelection, setNeedsRoleSelection] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserRole();
    } else {
      setRole(null);
      setLoading(false);
      setNeedsRoleSelection(false);
    }
  }, [user]);

  const fetchUserRole = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_role_selections')
        .select('selected_role')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No role selected yet
          setNeedsRoleSelection(true);
          setRole(null);
        } else {
          console.error('Error fetching user role:', error);
        }
      } else if (data) {
        setRole(data.selected_role as UserRoleType);
        setNeedsRoleSelection(false);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectRole = async (selectedRole: UserRoleType) => {
    if (!user || !selectedRole) return false;

    try {
      const { error } = await supabase
        .from('user_role_selections')
        .upsert({
          user_id: user.id,
          selected_role: selectedRole,
        });

      if (error) throw error;

      setRole(selectedRole);
      setNeedsRoleSelection(false);
      return true;
    } catch (error) {
      console.error('Error selecting role:', error);
      return false;
    }
  };

  return {
    role,
    loading,
    needsRoleSelection,
    selectRole,
    isKid: role === 'kid',
    isParent: role === 'parent',
    isDev: role === 'dev',
  };
}

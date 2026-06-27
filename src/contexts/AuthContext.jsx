// This file is deprecated. All components should import from SupabaseAuthContext.
// We re-export here to prevent breaking changes if any other file still imports from here.
import { AuthProvider, useAuth } from './SupabaseAuthContext';

export { AuthProvider, useAuth };
export default AuthProvider;
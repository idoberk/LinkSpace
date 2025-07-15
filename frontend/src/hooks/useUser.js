import { useContext } from 'react';
import { UserContext } from '../contexts/UserContext.js';

export const useUser = () => useContext(UserContext);

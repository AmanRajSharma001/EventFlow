import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { DEMO_ACCOUNTS } from '../data/demoAccounts';
import { AuthContext } from './authContextDef';

const USER_STORAGE_KEY = 'eventflow_user';
const REGISTERED_EVENTS_STORAGE_KEY = 'eventflow_registered_events';
const DEFAULT_REGISTERED_EVENT_IDS = ['evt-hackathon-2026', 'evt-ai-ml-workshop'];
const VALID_ROLES = new Set(['student', 'organizer']);

function readStoredValue(key, fallback, isValid) {
  try {
    const value = localStorage.getItem(key);
    if (!value) return fallback;

    const parsedValue = JSON.parse(value);
    return isValid(parsedValue) ? parsedValue : fallback;
  } catch {
    return fallback;
  }
}

function writeStoredValue(key, value) {
  try {
    if (value == null) {
      localStorage.removeItem(key);
      return;
    }

    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Keep the preview usable when browser storage is unavailable.
  }
}

function isValidUser(value) {
  return Boolean(
    value &&
    typeof value === 'object' &&
    typeof value.name === 'string' &&
    VALID_ROLES.has(value.role)
  );
}

function isRegisteredEventList(value) {
  return Array.isArray(value) && value.every((eventId) => typeof eventId === 'string');
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() =>
    readStoredValue(USER_STORAGE_KEY, null, isValidUser)
  );
  const [registeredEventIds, setRegisteredEventIds] = useState(() =>
    readStoredValue(
      REGISTERED_EVENTS_STORAGE_KEY,
      DEFAULT_REGISTERED_EVENT_IDS,
      isRegisteredEventList
    )
  );

  useEffect(() => {
    writeStoredValue(USER_STORAGE_KEY, user);
  }, [user]);

  useEffect(() => {
    writeStoredValue(REGISTERED_EVENTS_STORAGE_KEY, registeredEventIds);
  }, [registeredEventIds]);

  const login = (role, credentials = {}) => {
    if (role === 'student') {
      const normalizedEmail = credentials.email?.trim().toLowerCase();
      const normalizedRollNumber = credentials.rollNumber?.trim().toUpperCase();
      const isDemoStudent =
        normalizedEmail === DEMO_ACCOUNTS.student.email.toLowerCase() ||
        normalizedRollNumber === DEMO_ACCOUNTS.student.rollNumber.toUpperCase();
      const studentUser = {
        id: 'std-' + Date.now().toString().slice(-4),
        name: credentials.name || (isDemoStudent
          ? DEMO_ACCOUNTS.student.name
          : normalizedEmail?.split('@')[0] || 'Student User'),
        email: credentials.email || DEMO_ACCOUNTS.student.email,
        rollNumber: credentials.rollNumber || DEMO_ACCOUNTS.student.rollNumber,
        department: credentials.department || DEMO_ACCOUNTS.student.department,
        semester: credentials.semester || DEMO_ACCOUNTS.student.semester,
        role: 'student',
        avatar: DEMO_ACCOUNTS.student.avatar,
      };
      setUser(studentUser);
      toast.success(`Welcome back, ${studentUser.name}!`);
      return studentUser;
    } else if (role === 'organizer') {
      const organizerUser = {
        id: 'org-' + Date.now().toString().slice(-4),
        name: credentials.name || 'Faculty / Club Organizer',
        email: credentials.email || DEMO_ACCOUNTS.organizer.email,
        department: credentials.department || DEMO_ACCOUNTS.organizer.department,
        role: 'organizer',
        avatar: DEMO_ACCOUNTS.organizer.avatar,
      };
      setUser(organizerUser);
      toast.success(`Welcome to Organizer Portal, ${organizerUser.name}!`);
      return organizerUser;
    }
  };

  const registerStudent = (studentData) => {
    const newStudent = {
      id: 'std-' + Date.now().toString().slice(-4),
      name: studentData.fullName,
      email: studentData.email,
      rollNumber: studentData.rollNumber,
      department: studentData.department,
      semester: studentData.semester,
      phone: studentData.phone,
      role: 'student',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
        studentData.fullName
      )}`,
    };
    setUser(newStudent);
    toast.success(`Preview profile saved in this browser. Welcome, ${newStudent.name}!`);
    return newStudent;
  };

  const registerForEvent = (eventId, eventTitle) => {
    if (!user) {
      toast.error('Please sign in with your student credentials to register.');
      return false;
    }
    if (user.role !== 'student') {
      toast.error('Only students can register as participants.');
      return false;
    }
    if (registeredEventIds.includes(eventId)) {
      toast.error('You are already registered for this event!');
      return false;
    }

    setRegisteredEventIds((prev) => [...prev, eventId]);
    toast.success(`Preview registration saved in this browser for ${eventTitle}.`);
    return true;
  };

  const unregisterFromEvent = (eventId, eventTitle) => {
    setRegisteredEventIds((prev) => prev.filter((id) => id !== eventId));
    toast.success(`Preview registration withdrawn for ${eventTitle}.`);
  };

  const logout = () => {
    setUser(null);
    toast.success('Signed out successfully.');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: !!user,
        registeredEventIds,
        login,
        registerStudent,
        registerForEvent,
        unregisterFromEvent,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

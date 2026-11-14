import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { DEMO_ACCOUNTS } from '../data/demoAccounts';
import {
  INITIAL_ACTIVITY_ITEMS,
  INITIAL_ATTENDANCE_RECORDS,
  INITIAL_NOTIFICATIONS,
} from '../data/mockStudentData';
import { AuthContext } from './authContextDef';
import authService from '../services/auth.service';
import { isDatabasePendingError, getPendingDependencyInfo } from '../services/dbStatus';

const USER_STORAGE_KEY = 'eventflow_user';
const TOKEN_STORAGE_KEY = 'eventflow_token';
const REGISTERED_EVENTS_STORAGE_KEY = 'eventflow_registered_events';
const CANCELLED_EVENTS_STORAGE_KEY = 'eventflow_cancelled_events';
const NOTIFICATIONS_STORAGE_KEY = 'eventflow_notifications';
const DEFAULT_REGISTERED_EVENT_IDS = ['evt-hackathon-2026', 'evt-ai-ml-workshop'];
const VALID_ROLES = new Set(['student', 'organizer', 'admin']);

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
  const [cancelledEventIds, setCancelledEventIds] = useState(() =>
    readStoredValue(
      CANCELLED_EVENTS_STORAGE_KEY,
      [],
      isRegisteredEventList
    )
  );
  const [notifications, setNotifications] = useState(() =>
    readStoredValue(
      NOTIFICATIONS_STORAGE_KEY,
      INITIAL_NOTIFICATIONS,
      Array.isArray
    )
  );
  const [activityItems, setActivityItems] = useState(INITIAL_ACTIVITY_ITEMS);
  const [attendanceRecords] = useState(INITIAL_ATTENDANCE_RECORDS);
  const [isRestoringSession, setIsRestoringSession] = useState(() =>
    Boolean(localStorage.getItem(TOKEN_STORAGE_KEY))
  );

  // Restore authenticated session on startup if token exists
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) return;

    let isMounted = true;

    authService
      .getMe()
      .then((liveUser) => {
        if (!isMounted) return;
        if (liveUser) {
          setUser((current) => ({
            ...current,
            ...liveUser,
            isDemoSession: false,
            authType: 'live',
          }));
        }
      })
      .catch((error) => {
        if (!isMounted) return;
        if (error?.response?.status === 401) {
          // Token is expired or invalid
          localStorage.removeItem(TOKEN_STORAGE_KEY);
          localStorage.removeItem(USER_STORAGE_KEY);
          setUser(null);
          toast.error('Session expired. Please sign in again.');
        } else if (isDatabasePendingError(error)) {
          // Database is pending; keep valid demo preview session if present
        }
      })
      .finally(() => {
        if (isMounted) setIsRestoringSession(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    writeStoredValue(USER_STORAGE_KEY, user);
  }, [user]);

  useEffect(() => {
    writeStoredValue(REGISTERED_EVENTS_STORAGE_KEY, registeredEventIds);
  }, [registeredEventIds]);

  useEffect(() => {
    writeStoredValue(CANCELLED_EVENTS_STORAGE_KEY, cancelledEventIds);
  }, [cancelledEventIds]);

  useEffect(() => {
    writeStoredValue(NOTIFICATIONS_STORAGE_KEY, notifications);
  }, [notifications]);

  /**
   * Hybrid Login: Attempts live backend API login, falling back to demo
   * ONLY if backend returns dependency.status === "pending_database_integration".
   */
  const login = async (role, credentials = {}) => {
    // 1. Attempt real backend authentication
    try {
      const loginPayload = {
        identifier: credentials.identifier || credentials.email,
        email: credentials.email || credentials.identifier,
        password: credentials.password || 'password123',
      };

      const { user: liveUser, token } = await authService.login(loginPayload);

      if (liveUser && token) {
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
        const sessionUser = {
          ...liveUser,
          isDemoSession: false,
          authType: 'live',
        };
        setUser(sessionUser);
        toast.success(`Welcome back, ${sessionUser.name}!`);
        return { success: true, user: sessionUser };
      }
    } catch (error) {
      if (isDatabasePendingError(error)) {
        // Known fallback: Express backend is running, but PostgreSQL is pending Teammate 3's setup
        const dep = getPendingDependencyInfo(error);
        toast.success(
          `Demo Authentication Active: Welcome! (Database is ${dep.required})`,
          { duration: 5000, icon: 'ℹ️' }
        );
      } else {
        // Real API error (e.g. 401 Invalid Credentials, 403 Forbidden, 500, etc.)
        const errorMsg =
          error?.response?.data?.message ||
          (error?.response?.status === 401
            ? 'Invalid email or password.'
            : 'Authentication failed. Please check your credentials.');
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }
    }

    // 2. Preserved Demo Account Login Flow (Executed ONLY when DB is pending)
    localStorage.removeItem(TOKEN_STORAGE_KEY);
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
        phone: credentials.phone || '+91 98765 43210',
        bio: '3rd Year Undergrad actively exploring coding sprints, robotics, and campus events.',
        role: 'student',
        avatar: DEMO_ACCOUNTS.student.avatar,
        isDemoSession: true,
        authType: 'demo',
      };
      setUser(studentUser);
      return { success: true, user: studentUser, isDemo: true };
    } else if (role === 'organizer') {
      const organizerUser = {
        id: 'org-' + Date.now().toString().slice(-4),
        name: credentials.name || 'Faculty / Club Organizer',
        email: credentials.email || DEMO_ACCOUNTS.organizer.email,
        department: credentials.department || DEMO_ACCOUNTS.organizer.department,
        role: 'organizer',
        avatar: DEMO_ACCOUNTS.organizer.avatar,
        isDemoSession: true,
        authType: 'demo',
      };
      setUser(organizerUser);
      return { success: true, user: organizerUser, isDemo: true };
    } else if (role === 'admin') {
      const adminUser = {
        id: 'adm-' + Date.now().toString().slice(-4),
        name: credentials.name || DEMO_ACCOUNTS.admin.name,
        email: credentials.email || DEMO_ACCOUNTS.admin.email,
        department: credentials.department || DEMO_ACCOUNTS.admin.department,
        role: 'admin',
        avatar: DEMO_ACCOUNTS.admin.avatar,
        isDemoSession: true,
        authType: 'demo',
      };
      setUser(adminUser);
      return { success: true, user: adminUser, isDemo: true };
    }

    return { success: false, error: 'Unknown role' };
  };

  /**
   * Hybrid Registration: Attempts backend POST /api/auth/register,
   * falling back to demo session ONLY if backend reports pending database integration.
   */
  const registerStudent = async (studentData) => {
    // 1. Attempt live backend registration
    try {
      const { user: liveUser, token } = await authService.register(studentData);

      if (liveUser && token) {
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
        const registeredUser = {
          ...liveUser,
          rollNumber: studentData.rollNumber,
          department: studentData.department,
          semester: studentData.semester,
          phone: studentData.phone,
          isDemoSession: false,
          authType: 'live',
        };
        setUser(registeredUser);
        toast.success(
          `Account created successfully! Note: Academic profile fields will sync once PostgreSQL database schema expands.`
        );
        return { success: true, user: registeredUser };
      }
    } catch (error) {
      if (isDatabasePendingError(error)) {
        toast.error(
          'Live database registration is currently pending PostgreSQL setup. Created a local browser preview session.',
          { duration: 5500 }
        );
      } else {
        const errorMsg =
          error?.response?.data?.message ||
          'Registration failed. Please check your information and try again.';
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }
    }

    // 2. Preserved Demo Registration Flow
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    const newStudent = {
      id: 'std-' + Date.now().toString().slice(-4),
      name: studentData.fullName,
      email: studentData.email,
      rollNumber: studentData.rollNumber,
      department: studentData.department,
      semester: studentData.semester,
      phone: studentData.phone,
      bio: 'Enthusiastic student exploring campus activities on EventFlow.',
      role: 'student',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
        studentData.fullName
      )}`,
      isDemoSession: true,
      authType: 'demo',
    };
    setUser(newStudent);
    return { success: true, user: newStudent, isDemo: true };
  };

  const updateStudentProfile = (profileData) => {
    if (!user) return false;
    const updated = {
      ...user,
      ...profileData,
    };
    setUser(updated);
    toast.success('Profile details updated (local browser session).');
    return updated;
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
    setCancelledEventIds((prev) => prev.filter((id) => id !== eventId));

    // Add to activity feed
    setActivityItems((prev) => [
      {
        id: 'act-' + Date.now(),
        type: 'registration',
        title: `Registered for ${eventTitle}`,
        description: 'Confirmed seat reservation saved in this preview session.',
        timestamp: 'Just now',
        eventId,
      },
      ...prev,
    ]);

    toast.success(`Preview registration saved in this browser for ${eventTitle}.`);
    return true;
  };

  const unregisterFromEvent = (eventId, eventTitle) => {
    setRegisteredEventIds((prev) => prev.filter((id) => id !== eventId));
    toast.success(`Preview registration withdrawn for ${eventTitle}.`);
  };

  const cancelRegistration = (eventId, eventTitle, reason = 'Student voluntary cancellation') => {
    setRegisteredEventIds((prev) => prev.filter((id) => id !== eventId));
    setCancelledEventIds((prev) => (prev.includes(eventId) ? prev : [...prev, eventId]));

    // Add activity record
    setActivityItems((prev) => [
      {
        id: 'act-' + Date.now(),
        type: 'cancellation',
        title: `Cancelled registration for ${eventTitle}`,
        description: `Reason: ${reason}. Seat released back to capacity pool.`,
        timestamp: 'Just now',
        eventId,
      },
      ...prev,
    ]);

    toast.success(`Registration cancelled for ${eventTitle}.`);
  };

  const markNotificationAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
    toast.success('All notifications marked as read.');
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    toast.success('Notification inbox cleared.');
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
    toast.success('Signed out successfully.');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: !!user,
        isRestoringSession,
        isDemoSession: Boolean(user?.isDemoSession),
        authType: user?.authType || 'demo',
        registeredEventIds,
        cancelledEventIds,
        notifications,
        activityItems,
        attendanceRecords,
        login,
        registerStudent,
        updateStudentProfile,
        registerForEvent,
        unregisterFromEvent,
        cancelRegistration,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearAllNotifications,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ═══════════════════════════════════════════════════════
//   IVORY TECH SOLUTIONS — FIREBASE SERVICE LAYER
// ═══════════════════════════════════════════════════════

import { db } from './firebase-config.js';
import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  serverTimestamp,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/**
 * Save or Update a Session
 */
export async function dbSaveSession(sessionId, sessionData) {
  try {
    const sessionRef = doc(db, 'sessions', sessionId);
    await setDoc(sessionRef, {
      ...sessionData,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.error('Firestore Session Error:', err);
  }
}

/**
 * Log Activity Event
 */
export async function dbLogActivity(activityData) {
  try {
    const activitiesRef = collection(db, 'activities');
    await addDoc(activitiesRef, {
      ...activityData,
      timestamp: serverTimestamp()
    });
  } catch (err) {
    console.error('Firestore Activity Error:', err);
  }
}

/**
 * Save Contact Lead
 */
export async function dbSaveLead(leadData) {
  try {
    const leadsRef = collection(db, 'leads');
    await addDoc(leadsRef, {
      ...leadData,
      createdAt: serverTimestamp()
    });
  } catch (err) {
    console.error('Firestore Lead Error:', err);
  }
}

/**
 * Save Student Enrollment
 */
export async function dbSaveStudentLead(studentData) {
  try {
    const studentsRef = collection(db, 'students');
    await addDoc(studentsRef, {
      ...studentData,
      createdAt: serverTimestamp()
    });
  } catch (err) {
    console.error('Firestore Student Lead Error:', err);
  }
}

/**
 * LISTEN: Real-time Sessions
 */
export function dbListenSessions(callback) {
  const q = query(collection(db, 'sessions'), orderBy('lastActive', 'desc'), limit(100));
  return onSnapshot(q, (snapshot) => {
    const sessions = [];
    snapshot.forEach(doc => sessions.push({ id: doc.id, ...doc.data() }));
    callback(sessions);
  });
}

/**
 * LISTEN: Real-time Leads
 */
export function dbListenLeads(callback) {
  const q = query(collection(db, 'leads'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const leads = [];
    snapshot.forEach(doc => leads.push({ id: doc.id, ...doc.data() }));
    callback(leads);
  });
}

/**
 * LISTEN: Real-time Activities (Last 50)
 */
export function dbListenActivities(callback) {
  const q = query(collection(db, 'activities'), orderBy('timestamp', 'desc'), limit(50));
  return onSnapshot(q, (snapshot) => {
    const activities = [];
    snapshot.forEach(doc => activities.push({ id: doc.id, ...doc.data() }));
    callback(activities);
  });
}

import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, collection, doc, getDoc, getDocs, 
  setDoc, addDoc, updateDoc, deleteDoc, onSnapshot, 
  query, where, orderBy, getDocFromServer, serverTimestamp 
} from 'firebase/firestore';
import { 
  getAuth, GoogleAuthProvider, signInWithPopup, 
  signOut, onAuthStateChanged, User 
} from 'firebase/auth';
import { 
  getStorage, ref, uploadBytes, getDownloadURL 
} from 'firebase/storage';
import { Article, ReporterApplication } from '../types/news';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// CRITICAL: Initialize Firestore with specific database ID if provided
export const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export const auth = getAuth(app);
export const storage = getStorage(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validation check on boot
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase connection verified.');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client appears offline or permissions restricted.');
    }
    return false;
  }
}

// Real-Time Listeners for Published Articles
export function subscribeToArticles(
  onUpdate: (articles: Article[]) => void,
  onError?: (err: any) => void
) {
  const articlesCol = collection(db, 'articles');
  // Query only published articles so security rules permit reading by public visitors
  const articlesQuery = query(articlesCol, where('status', '==', 'published'));
  
  return onSnapshot(
    articlesQuery,
    (snapshot) => {
      const items: Article[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      onUpdate(items);
    },
    (error) => {
      console.warn('Realtime articles sync note:', error.message);
      onError?.(error);
      handleFirestoreError(error, OperationType.LIST, 'articles');
    }
  );
}

// Real-Time Listener for Breaking News
export function subscribeToBreakingNews(
  onUpdate: (items: string[]) => void,
  onError?: (err: any) => void
) {
  const colRef = collection(db, 'breaking_news');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const newsTexts: string[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.text) newsTexts.push(data.text);
      });
      if (newsTexts.length > 0) {
        onUpdate(newsTexts);
      }
    },
    (error) => {
      console.error('Error in breaking_news listener:', error);
      onError?.(error);
    }
  );
}

// Write Article to Firestore
export async function saveArticleToFirestore(article: Article): Promise<void> {
  const docRef = doc(db, 'articles', article.id);
  try {
    await setDoc(docRef, {
      ...article,
      updatedAt: serverTimestamp(),
    });
    console.log(`Article ${article.id} confirmed saved to Firestore.`);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `articles/${article.id}`);
  }
}

// Delete Article from Firestore
export async function deleteArticleFromFirestore(id: string): Promise<void> {
  const docRef = doc(db, 'articles', id);
  try {
    await deleteDoc(docRef);
    console.log(`Article ${id} deleted from Firestore.`);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `articles/${id}`);
  }
}

// Add Breaking News to Firestore
export async function addBreakingNewsToFirestore(text: string): Promise<void> {
  const colRef = collection(db, 'breaking_news');
  try {
    await addDoc(colRef, {
      text,
      createdAt: serverTimestamp(),
      active: true,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'breaking_news');
  }
}

// Save Reporter Application to Firestore
export async function submitReporterApplicationToFirestore(appData: ReporterApplication): Promise<void> {
  const docRef = doc(db, 'reporters', appData.id);
  try {
    // New public applications MUST always start as pending
    await setDoc(docRef, {
      ...appData,
      status: 'pending',
      submittedAt: serverTimestamp(),
    });
    console.log(`Reporter application ${appData.id} recorded in Firestore.`);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `reporters/${appData.id}`);
  }
}

// Fetch all reporter applications (restricted to authorized editors/admins)
export async function fetchReporterApplications(): Promise<ReporterApplication[]> {
  try {
    const colRef = collection(db, 'reporters');
    const snap = await getDocs(colRef);
    const results: ReporterApplication[] = [];
    snap.forEach((docSnap) => {
      results.push({ id: docSnap.id, ...(docSnap.data() as any) });
    });
    return results;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'reporters');
  }
}

// Update reporter application status (approve, reject, or issue card)
export async function updateReporterStatusInFirestore(
  id: string,
  status: 'pending' | 'verified' | 'rejected' | 'card_generated',
  adminNotes?: string
): Promise<void> {
  const docRef = doc(db, 'reporters', id);
  try {
    await updateDoc(docRef, {
      status,
      adminNotes: adminNotes || '',
      verifiedBy: auth.currentUser?.email || 'admin',
      verifiedAt: serverTimestamp(),
    });
    console.log(`Reporter application ${id} status updated to ${status}.`);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `reporters/${id}`);
  }
}

// Upload reporter photo to Firebase Storage with size & type validation
export async function uploadReporterPhoto(file: File, candidateId: string): Promise<string> {
  // Validate file type
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (!validTypes.includes(file.type)) {
    throw new Error('केवल वैध फोटो (JPG, PNG, WEBP) ही अपलोड की जा सकती है।');
  }

  // Validate file size (max 3MB)
  if (file.size > 3 * 1024 * 1024) {
    throw new Error('फोटो का आकार 3MB से अधिक नहीं होना चाहिए।');
  }

  try {
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storageRef = ref(storage, `reporters/${candidateId}_${Date.now()}_${safeName}`);
    
    // Guard with a fast 1500ms timeout so unconfigured/unreachable storage never hangs the UI
    const uploadTask = uploadBytes(storageRef, file, { contentType: file.type })
      .then((snapshot) => getDownloadURL(snapshot.ref));
    const timeoutTask = new Promise<string>((_, reject) =>
      setTimeout(() => reject(new Error('Storage upload timeout')), 1500)
    );

    return await Promise.race([uploadTask, timeoutTask]);
  } catch (error) {
    console.warn('Storage photo upload fallback used:', error);
    return '';
  }
}

// Upload identity document (Aadhaar / Voter ID / Press Card) to private storage
export async function uploadReporterIdDocument(file: File, candidateId: string): Promise<string> {
  // Validate file type
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'application/pdf'];
  if (!validTypes.includes(file.type)) {
    throw new Error('पहचान पत्र केवल PDF या इमेज (JPG, PNG) प्रारूप में ही अपलोड करें।');
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('पहचान पत्र का आकार 5MB से अधिक नहीं होना चाहिए।');
  }

  try {
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storageRef = ref(storage, `reporter_documents/${candidateId}_${Date.now()}_${safeName}`);
    
    // Guard with a fast 1500ms timeout
    const uploadTask = uploadBytes(storageRef, file, { contentType: file.type })
      .then((snapshot) => getDownloadURL(snapshot.ref));
    const timeoutTask = new Promise<string>((_, reject) =>
      setTimeout(() => reject(new Error('Storage upload timeout')), 1500)
    );

    return await Promise.race([uploadTask, timeoutTask]);
  } catch (error) {
    console.warn('Storage ID document fallback used:', error);
    return '';
  }
}

// Authentication Helpers
export async function signInWithGoogle(): Promise<User | null> {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error('Google Sign In Error:', error);
    throw error;
  }
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

// Verified Admin Check
export function isCurrentUserAdmin(user?: User | null): boolean {
  const currentUser = user !== undefined ? user : auth.currentUser;
  if (!currentUser) return false;
  // Official DDN Prime News chief editor account
  return currentUser.email === 'ddnprimenews@gmail.com';
}

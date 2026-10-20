import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function runTest() {
  console.log('Testing Firebase connection...');
  console.log('Project ID:', config.projectId);
  console.log('Database ID:', config.firestoreDatabaseId);

  try {
    const reporterRef = doc(db, 'reporters', 'DDN-REP-TEST-001');
    await setDoc(reporterRef, {
      fullName: 'सुरेश कुमार झा',
      mobile: '9876543210',
      district: 'दरभंगा (Darbhanga)',
      qualification: 'स्नातक (Graduate)',
      appliedDate: '18 अक्टूबर 2026',
      status: 'pending'
    });
    console.log('SUCCESS: Written reporter document to Firestore!');

    // Read back test
    const snap = await getDoc(reporterRef);
    console.log('Document read attempt:', snap.exists() ? 'Found' : 'Restricted by rules as expected');
  } catch (err) {
    console.error('ERROR during Firestore operation:', err.message);
  }
}

runTest();

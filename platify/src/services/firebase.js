import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where, orderBy, limit } from 'firebase/firestore';

// Import the initialized Firebase app from the config file
import { app } from '../config/firebase';

// Get Auth and Firestore instances from the initialized app
const auth = getAuth(app);
const db = getFirestore(app);

// Authentication functions
/**
 * Register a new user with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @param {string} firstName - User's first name
 * @param {string} lastName - User's last name
 * @returns {Promise<UserCredential>} - Firebase user credential
 */
export const registerUser = async (email, password, firstName, lastName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update user profile with first and last name
    await updateProfile(userCredential.user, {
      displayName: `${firstName} ${lastName}`
    });
    
    // Create user document in Firestore
    await addDoc(collection(db, 'users'), {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      displayName: `${firstName} ${lastName}`,
      firstName,
      lastName,
      createdAt: new Date()
    });
    
    return userCredential;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

/**
 * Sign in a user with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<UserCredential>} - Firebase user credential
 */
export const loginUser = async (email, password) => {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

/**
 * Sign out the current user
 * @returns {Promise<void>}
 */
export const logoutUser = async () => {
  try {
    return await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Firestore functions
/**
 * Add a document to a collection
 * @param {string} collectionName - Name of the collection
 * @param {Object} data - Document data
 * @returns {Promise<DocumentReference>} - Reference to the created document
 */
export const addDocument = async (collectionName, data) => {
  try {
    return await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: new Date()
    });
  } catch (error) {
    console.error(`Error adding document to ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Get all documents from a collection
 * @param {string} collectionName - Name of the collection
 * @returns {Promise<Array>} - Array of documents
 */
export const getDocuments = async (collectionName) => {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const documents = [];
    
    querySnapshot.forEach((doc) => {
      documents.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return documents;
  } catch (error) {
    console.error(`Error getting documents from ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Get documents from a collection with a query
 * @param {string} collectionName - Name of the collection
 * @param {string} field - Field to query
 * @param {string} operator - Query operator (==, >, <, etc.)
 * @param {any} value - Value to compare
 * @returns {Promise<Array>} - Array of documents
 */
export const getDocumentsWithQuery = async (collectionName, field, operator, value) => {
  try {
    const q = query(collection(db, collectionName), where(field, operator, value));
    const querySnapshot = await getDocs(q);
    const documents = [];
    
    querySnapshot.forEach((doc) => {
      documents.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return documents;
  } catch (error) {
    console.error(`Error getting documents with query from ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Update a document in a collection
 * @param {string} collectionName - Name of the collection
 * @param {string} documentId - ID of the document
 * @param {Object} data - Updated data
 * @returns {Promise<void>}
 */
export const updateDocument = async (collectionName, documentId, data) => {
  try {
    const docRef = doc(db, collectionName, documentId);
    return await updateDoc(docRef, {
      ...data,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error(`Error updating document in ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Delete a document from a collection
 * @param {string} collectionName - Name of the collection
 * @param {string} documentId - ID of the document
 * @returns {Promise<void>}
 */
export const deleteDocument = async (collectionName, documentId) => {
  try {
    const docRef = doc(db, collectionName, documentId);
    return await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting document from ${collectionName}:`, error);
    throw error;
  }
};

// Export Firebase instances and functions
export { auth, db, onAuthStateChanged };

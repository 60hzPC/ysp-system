import { db } from "../lib/firebase";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  addDoc,
  serverTimestamp,
  DocumentData,
  QueryConstraint
} from "firebase/firestore";
import { useState, useEffect } from "react";

export const useFirestore = () => {
  // Get all documents from a collection
  const getCollection = async (collectionName: string) => {
    try {
      const snapshot = await getDocs(collection(db, collectionName));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error(`Error getting collection ${collectionName}:`, error);
      throw error;
    }
  };

  // Get a single document
  const getDocument = async (collectionName: string, id: string) => {
    try {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        return null;
      }
    } catch (error) {
      console.error(`Error getting document:`, error);
      throw error;
    }
  };

  // Create a new document with auto-generated ID
  const createDocument = async (collectionName: string, data: any) => {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error(`Error creating document:`, error);
      throw error;
    }
  };

  // Create/update a document with custom ID
  const setDocument = async (collectionName: string, id: string, data: any) => {
    try {
      await setDoc(doc(db, collectionName, id), {
        ...data,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (error) {
      console.error(`Error setting document:`, error);
      throw error;
    }
  };

  // Update an existing document
  const updateDocument = async (collectionName: string, id: string, data: any) => {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error(`Error updating document:`, error);
      throw error;
    }
  };

  // Delete a document
  const deleteDocument = async (collectionName: string, id: string) => {
    try {
      await deleteDoc(doc(db, collectionName, id));
    } catch (error) {
      console.error(`Error deleting document:`, error);
      throw error;
    }
  };

  // Query documents with conditions
  const queryDocuments = async (collectionName: string, ...queryConstraints: QueryConstraint[]) => {
    try {
      const q = query(collection(db, collectionName), ...queryConstraints);
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error(`Error querying documents:`, error);
      throw error;
    }
  };

  return {
    getCollection,
    getDocument,
    createDocument,
    setDocument,
    updateDocument,
    deleteDocument,
    queryDocuments,
  };
};

// Real-time listener hook
export const useRealtimeCollection = (collectionName: string, queryConstraints: QueryConstraint[] = []) => {
  const [data, setData] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const q = queryConstraints.length > 0
      ? query(collection(db, collectionName), ...queryConstraints)
      : collection(db, collectionName);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const documents = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setData(documents);
        setLoading(false);
      },
      (err) => {
        console.error("Error in realtime listener:", err);
        setError(err as Error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName, queryConstraints]);

  return { data, loading, error };
};

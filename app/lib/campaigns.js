import { db } from './firebase';
import {
  collection, addDoc, getDocs, doc, updateDoc,
  query, where, orderBy, serverTimestamp
} from 'firebase/firestore';

export async function saveCampaign(userId, campaignData) {
  try {
    const ref = await addDoc(collection(db, 'campaigns'), {
      userId,
      ...campaignData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return ref.id;
  } catch (err) {
    console.error('Error saving campaign:', err);
    return null;
  }
}

export async function updateCampaign(campaignId, updates) {
  try {
    const ref = doc(db, 'campaigns', campaignId);
    await updateDoc(ref, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.error('Error updating campaign:', err);
  }
}

export async function getUserCampaigns(userId) {
  try {
    const q = query(
      collection(db, 'campaigns'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error('Error fetching campaigns:', err);
    return [];
  }
}
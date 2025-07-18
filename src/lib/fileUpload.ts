import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";

/**
 * Upload a file to Firebase Storage
 * @param file File to upload
 * @param path Storage path
 * @returns Promise with download URL
 */
export async function uploadFile(file: File, path: string): Promise<string> {
  try {
    const storage = getStorage();
    
    // Generate a unique filename
    const filename = `${uuidv4()}-${file.name}`;
    const fullPath = `${path}/${filename}`;
    
    // Create a reference to the file
    const storageRef = ref(storage, fullPath);
    
    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('File upload error:', error);
    throw error;
  }
}

/**
 * Upload multiple files to Firebase Storage
 * @param files Files to upload
 * @param path Storage path
 * @returns Promise with download URLs
 */
export async function uploadMultipleFiles(files: File[], path: string): Promise<string[]> {
  try {
    const uploadPromises = files.map(file => uploadFile(file, path));
    return Promise.all(uploadPromises);
  } catch (error) {
    console.error('Multiple file upload error:', error);
    throw error;
  }
}

/**
 * Parse a CSV file
 * @param file CSV file
 * @returns Promise with parsed data
 */
export async function parseCSV(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const lines = content.split("\\n");
        
        if (lines.length < 2) {
          reject(new Error('CSV file is empty or invalid'));
          return;
        }
        
        const headers = lines[0].split(",").map(h => h.trim().replace(/"/g, ''));
        
        const data = lines.slice(1).map(line => {
          if (!line.trim()) return null;
          
          const values = line.split(",").map(v => v.trim().replace(/"/g, ''));
          
          return headers.reduce((obj, header, index) => {
            obj[header] = values[index] || "";
            return obj;
          }, {} as any);
        }).filter(Boolean);
        
        resolve(data);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}
import { CheckCircle2, ImageIcon, UploadIcon } from "lucide-react";
import { useState, type ChangeEvent, type DragEvent, useCallback, useRef, useEffect } from "react";
import { useOutletContext } from "react-router";
import { PROGRESS_INCREMENT, PROGRESS_INTERVAL_MS, REDIRECT_DELAY_MS } from "lib/constants";

interface UploadProps {
   onComplete?: (base64: string) => void;
}

const Upload = ({ onComplete }: UploadProps) => {
   const [file, setFile] = useState<File | null>(null);
   const [isDragging, setIsDragging] = useState(false);
   const [progress, setProgress] = useState(0);
   const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
   const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
   const { isSignedIn } = useOutletContext<AuthContext>();

   useEffect(() => {
      return () => {
         if (intervalRef.current) clearInterval(intervalRef.current);
         if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };
   }, []);

   const processFile = (selectedFile: File) => {
      if (!isSignedIn) return;

      setFile(selectedFile);
      setProgress(0);

      const reader = new FileReader();

      reader.onerror = () => {
         console.error("Error reading file");
         setFile(null);
         setProgress(0);
      };

      reader.onload = (e) => {
         const base64 = e.target?.result as string;

         intervalRef.current = setInterval(() => {
            setProgress((prev) => {
               if (prev >= 100) {
                  clearInterval(intervalRef.current!);
                  timeoutRef.current = setTimeout(() => {
                     if (onComplete) onComplete(base64);
                  }, REDIRECT_DELAY_MS);
                  return 100;
               }
               return Math.min(prev + PROGRESS_INCREMENT, 100);
            });
         }, PROGRESS_INTERVAL_MS);
      };

      reader.readAsDataURL(selectedFile);
   };

   const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (!isSignedIn) return;
      setIsDragging(true);
   };

   const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
   };

   const handleDrop = (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      if (!isSignedIn) return;

      const droppableFile = e?.dataTransfer?.files[0];
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (droppableFile && allowedTypes.includes(droppableFile.type)) {
         processFile(droppableFile);
      }
   };

   const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
      if (!isSignedIn) return;
      if (e.target.files && e.target.files[0]) {
         processFile(e.target.files[0]);
      }
   };

   return (
      <div className='upload'>
         {!file ? (
            <div
               className={`dropzone ${isDragging ? "is-dragging" : ""}`}
               onDragOver={handleDragOver}
               onDragLeave={handleDragLeave}
               onDrop={handleDrop}>
               <input type='file' className='drop-input' accept='.jpg,.jpeg,.png' disabled={!isSignedIn} onChange={handleFileChange} />
               <div className='drop-content'>
                  <div className='drop-icon'>
                     <UploadIcon size={20} />
                  </div>
                  <p>{isSignedIn ? "Click to upload or drag and drop" : "You must be signed in to upload"}</p>
                  <p className='help'>Maximum file size 50MB.</p>
               </div>
            </div>
         ) : (
            <div className='upload-status'>
               <div className='status-content'>
                  <div className='status-icon'>
                     {progress === 100 ? <CheckCircle2 className='check' /> : <ImageIcon className='image' />}
                  </div>
                  <h3>{file.name}</h3>
                  <div className='progress'>
                     <div className='bar' style={{ width: `${progress}%` }} />
                     <p className='status-text'>{progress < 100 ? "Analyzing Floor Plan" : "Redirecting..."}</p>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

export default Upload;

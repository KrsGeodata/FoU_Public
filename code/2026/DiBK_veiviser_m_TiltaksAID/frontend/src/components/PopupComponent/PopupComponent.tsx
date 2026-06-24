// Generic popup/modal component (placeholder implementation).
// Provides a basic yes/no dialog with a close button.
import {useRef} from 'react';


export default function PopupComponent(title: string) {

    const popupRef = useRef<boolean>(false);

    const handleNo = () => {      // Handle No action
        if (popupRef.current) {
            popupRef.current = true;
        }
    };

  return (
    <div className="popup" hidden={popupRef.current}>
        <button>Close</button>
        <h2>{title}</h2>
        <p>This is a popup component.</p>
        <a href="www.google.com">Yes</a>
        <button onClick={handleNo}>No</button>
      
    </div>
  );
}
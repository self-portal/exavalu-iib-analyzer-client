import { useState, useEffect } from "react";
import BounceLoader from "react-spinners/BounceLoader";
import "./Animation.css";

// let ProgressAnimation = ({ message }) => {
//   const [loading, setLoading] = useState(false);
//   useEffect(() => {
//     setLoading(true);
//     setTimeout(() => {
//       setLoading(false);
//     }, 999999999);
//   }, []);
//   return (
//     // <div style={{alignItems: "center"}}>
//     //   <BounceLoader color={"blue"} loading={loading} size={100} />
//     //   <h2 style={{ marginLeft: "-5px" }}>Loading...</h2>
//     // </div>
//     <div className="loader-container">
//       <div className="loader"></div>
//       {message && <h2 className="loading-message">{message}</h2>}
//     </div>
//   );
// };

let ProgressAnimation = ({
  messages = [],
  interval = 3000,
  isAdminPage = false,
}) => {
  const [loading, setLoading] = useState(true);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    // Only set up the interval if messages are provided
    if (messages.length > 0) {
      const messageInterval = setInterval(() => {
        setCurrentMessageIndex((prevIndex) => {
          // If we're at the last message, keep it displayed continuously
          if (prevIndex >= messages.length - 1) {
            return prevIndex;
          } else {
            return prevIndex + 1;
          }
        });
      }, interval);

      return () => clearInterval(messageInterval);
    }
  }, [messages, interval]);

  useEffect(() => {
    setLoading(true);
    // The timeout duration is set very high to simulate continuous loading
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 999999999);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div
      className={isAdminPage ? "loader-container-admin" : "loader-container"}
    >
      {/* <BounceLoader color={"blue"} loading={loading} size={100} /> */}
      <div className="loader"></div>
      {loading && messages.length > 0 && (
        <h2 className="loading-message">{messages[currentMessageIndex]}</h2>
      )}
    </div>
  );
};

export default ProgressAnimation;

import React, { useEffect, useState } from "react";
import { Joystick } from "react-joystick-component";
import { IJoystickUpdateEvent } from "react-joystick-component/build/lib/Joystick";
import { useBoatStore } from "../store/boatStore";

export const MobileControls: React.FC = () => {
  const { setKey } = useBoatStore();
  const [isMobile, setIsMobile] = useState(false);
  const [isAccelerating, setIsAccelerating] = useState(false);

  // Detect mobile devices
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile("ontouchstart" in window || window.innerWidth <= 768);
    };

    // Check on initial load
    checkMobile();

    // Check on resize
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  // Handle joystick movement
  const handleJoystickMove = (e: IJoystickUpdateEvent) => {
    // Reset direction keys
    setKey("a", false);
    setKey("d", false);
    setKey("w", false);
    setKey("s", false);

    // Apply direction based on joystick position
    if (e.direction) {
      switch (e.direction) {
        case "FORWARD":
          setKey("w", true);
          break;
        case "RIGHT":
          setKey("d", true);
          break;
        case "LEFT":
          setKey("a", true);
          break;
        case "BACKWARD":
          setKey("s", true);
          break;
      }
    }
  };

  // Handle joystick stop
  const handleJoystickStop = () => {
    // Reset all direction keys
    setKey("a", false);
    setKey("d", false);
    setKey("w", false);
    setKey("s", false);
  };

  // Handle acceleration button events
  const handleAccelerationStart = () => {
    setIsAccelerating(true);
    setKey("w", true);
  };

  const handleAccelerationEnd = () => {
    setIsAccelerating(false);
    setKey("w", false);
  };

  // Don't render anything on desktop
  if (!isMobile) return null;

  return (
    <>
      {/* Direction joystick - left side */}
      <div className="fixed bottom-[50px] left-[50px] z-[9999]">
        <Joystick
          size={100}
          baseColor="rgba(0, 0, 0, 0.5)"
          stickColor="rgba(255, 255, 255, 0.8)"
          move={handleJoystickMove}
          stop={handleJoystickStop}
        />
      </div>

      {/* Acceleration button - right side */}
      <div
        className="fixed bottom-[50px] right-[50px] z-[9999] w-[80px] h-[80px] rounded-full 
                  flex items-center justify-center cursor-pointer"
        onTouchStart={handleAccelerationStart}
        onTouchEnd={handleAccelerationEnd}
        onMouseDown={handleAccelerationStart}
        onMouseUp={handleAccelerationEnd}
        onMouseLeave={handleAccelerationEnd}
      >
        <div
          className={`w-full h-full rounded-full flex items-center justify-center font-bold text-white
                    ${
                      isAccelerating
                        ? "bg-blue-500 shadow-[0_0_20px_rgba(0,150,255,0.8)]"
                        : "bg-blue-500/70 shadow-[0_0_10px_rgba(0,100,255,0.5)]"
                    }
                    transform transition-all duration-200 ease-in-out
                    ${isAccelerating ? "scale-90" : "scale-100"}`}
        >
          BOOST
        </div>
      </div>
    </>
  );
};
